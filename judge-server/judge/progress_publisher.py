from datetime import datetime
from judge.config import settings

import redis
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProgressPublisher:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            decode_responses=True
        )
    
    def publish_judging_start(self, submission_id: int, username: str, total_tests: int):
        self._publish_progress(submission_id, username, "JUDGING", 0, 0, total_tests)
    
    def publish_test_case_completed(self, submission_id: int, username: str, current_test: int, total_tests: int):
        progress = int((current_test / total_tests) * 100)  # 0% ~ 100%
        self._publish_progress(submission_id, username, "JUDGING", progress, current_test, total_tests)
    
    def publish_judging_completed(self, submission_id: int, username: str, final_status: str, runtime_ms: int = None, memory_kb: int = None):
        self._publish_progress(submission_id, username, final_status, 100, 0, 0, runtime_ms, memory_kb)

    def _publish_progress(self, submission_id: int, username: str, status: str, progress_percent: int, current_test: int = 0, total_tests: int = 0, runtime_ms: int = None, memory_kb: int = None):
        message = {
            "submissionId": submission_id,
            "username": username,
            "submitStatus": status,
            "progressPercent": progress_percent,
            "currentTest": current_test,
            "totalTests": total_tests,
            "timestamp": datetime.now().isoformat(),
            "runtimeMs": runtime_ms,
            "memoryKb": memory_kb
        }

        channel = f"progress:{submission_id}"

        try:
            self.redis_client.publish(channel, json.dumps(message))
            logger.info(f"Published progress for {submission_id}: {status} {progress_percent}%")
        except Exception as e:
            logger.error(f"Failed to publish progress for {submission_id}: {e}")

progress_publisher = ProgressPublisher()
