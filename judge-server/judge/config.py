import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    aws_region: str = os.getenv("AWS_REGION")
    aws_access_key_id: str | None = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str | None = os.getenv("AWS_SECRET_ACCESS_KEY")

    sqs_submission_queue_name: str | None = os.getenv("CONSUME_QUEUE_NAME")
    sqs_result_queue_name: str | None = os.getenv("PRODUCE_QUEUE_NAME")

    s3_bucket_name: str | None = os.getenv("S3_BUCKET_NAME")
    s3_test_data_prefix: str = "problems/{problem_id}/test_data/"

    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_password: str | None = os.getenv("REDIS_PASSWORD")

    TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp_dir")
    PROBLEM_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "problems")


settings = Settings()
