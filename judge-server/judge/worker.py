from botocore.exceptions import ClientError

from judge.config import settings
from judge.file_util import save_to_temp, delete_temp
from judge.judge import run

import boto3
import time
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def consume_loop():
    logger.info("SQS consumer loop started.")

    sqs = boto3.resource("sqs", region_name=settings.aws_region, aws_access_key_id=settings.aws_access_key_id,
                         aws_secret_access_key=settings.aws_secret_access_key)
    queue = sqs.get_queue_by_name(QueueName=settings.sqs_submission_queue_name)

    while True:
        try:
            response = queue.receive_messages(
                MessageAttributeNames=["All"],
                MaxNumberOfMessages=1,
                WaitTimeSeconds=10,
            )

            messages = response
            if not messages:
                continue

            message = messages[0]

            logger.info(f"Received message: {message.body}")

            _handle_message(json.loads(message.body))

            # 처리 성공 시 메시지 삭제
            _delete_message(queue, response)

        except Exception as e:
            logger.error(f"Error in consume loop: {e}", exc_info=True)
            time.sleep(5)  # 에러 시 잠깐 대기 후 재시도


def _handle_message(message_body: dict):
    submission_id, problem_id, username, source_code, language, time_limit, memory_limit = (
        message_body.get("submissionId"),
        message_body.get("problemId"),
        message_body.get("username"),
        message_body.get("sourceCode"),
        message_body.get("language"),
        int(message_body.get("timeLimit")),
        int(message_body.get("memoryLimit")),
    )

    if not all([submission_id, problem_id, username, source_code, language, time_limit, memory_limit]):
        raise ValueError(f"Missing required fields in message: {message_body}")

    logger.info(f"Start judging problem={problem_id}, lang={language}")

    source_code_path = save_to_temp(source_code, submission_id, username, language)
    logger.info(f"SAVED PATH: {source_code_path}")

    status_after_judge = run(source_code_path, language, time_limit, memory_limit, problem_id)

    delete_temp(submission_id, username)

    event = {
        "submissionId": submission_id,
        "problemId": problem_id,
        "username": username,
        "submitStatus": status_after_judge,
        "runtimeMs": None, # TEMP
        "memoryKb": None # TEMP
    }

    _send_message(event)

    logger.info(f"Judging finished result={status_after_judge}")

def _send_message(message):
    sqs = boto3.resource("sqs", region_name=settings.aws_region, aws_access_key_id=settings.aws_access_key_id,
                         aws_secret_access_key=settings.aws_secret_access_key)
    queue = sqs.get_queue_by_name(QueueName=settings.sqs_result_queue_name)

    queue.send_message(MessageBody=json.dumps(message), MessageGroupId="results", MessageDeduplicationId=str(message["submissionId"]))

    logger.info(f"Sent message to queue={queue.url}")


def _delete_message(queue, messages):
    try:
        entries = [
            {"Id": str(ind), "ReceiptHandle": msg.receipt_handle}
            for ind, msg in enumerate(messages)
        ]

        response = queue.delete_messages(Entries=entries)

        if "Successful" in response:
            for msg_meta in response["Successful"]:
                logger.info("Deleted %s", messages[int(msg_meta["Id"])].receipt_handle)
        if "Failed" in response:
            for msg_meta in response["Failed"]:
                logger.warning("Could not delete %s", messages[int(msg_meta["Id"])].receipt_handle)

    except ClientError:
        logger.exception("Couldn't delete messages from queue %s", queue)
