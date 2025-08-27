from judge.worker import consume_loop
from unittest.mock import patch, MagicMock
import judge.worker
from botocore.exceptions import ClientError

import pytest
import json

class TestWorker:
    
    def test_handle_message_success(self):
        """정상적인 메시지 처리 테스트"""
        message_body = {
            "submissionId": 12345,
            "problemId": 1,
            "username": "testuser",
            "sourceCode": "print('Hello')",
            "language": "PYTHON",
            "timeLimit": 5,
            "memoryLimit": 256
        }
        
        with patch('judge.worker.save_to_temp') as mock_save, \
             patch('judge.worker.run') as mock_run, \
             patch('judge.worker.delete_temp') as mock_delete, \
             patch('judge.worker._send_message') as mock_send:
            
            mock_save.return_value = "/tmp/test/Main.py"
            mock_run.return_value = "ACCEPTED"
            
            judge.worker._handle_message(message_body)
            
            # 함수 호출 검증
            mock_save.assert_called_once_with(
                "print('Hello')", 12345, "testuser", "PYTHON"
            )
            mock_run.assert_called_once_with(
                "/tmp/test/Main.py", "PYTHON", 5, 256, 1
            )
            mock_delete.assert_called_once_with(12345, "testuser")
            
            # 결과 메시지 검증
            expected_event = {
                "submissionId": 12345,
                "problemId": 1,
                "username": "testuser",
                "submitStatus": "ACCEPTED",
                "runtimeMs": None,
                "memoryKb": None
            }
            mock_send.assert_called_once_with(expected_event)
    
    def test_handle_message_compile_error(self):
        """컴파일 에러 처리 테스트"""
        message_body = {
            "submissionId": 67890,
            "problemId": 2,
            "username": "javauser",
            "sourceCode": "public class Main { invalid syntax }",
            "language": "JAVA",
            "timeLimit": 10,
            "memoryLimit": 512
        }
        
        with patch('judge.worker.save_to_temp') as mock_save, \
             patch('judge.worker.run') as mock_run, \
             patch('judge.worker.delete_temp') as mock_delete, \
             patch('judge.worker._send_message') as mock_send:
            
            mock_save.return_value = "/tmp/test/Main.java"
            mock_run.return_value = "COMPILE_ERROR"
            
            judge.worker._handle_message(message_body)
            
            expected_event = {
                "submissionId": 67890,
                "problemId": 2,
                "username": "javauser",
                "submitStatus": "COMPILE_ERROR",
                "runtimeMs": None,
                "memoryKb": None
            }
            mock_send.assert_called_once_with(expected_event)
    
    def test_handle_message_missing_fields(self):
        """필수 필드 누락 시 처리 테스트"""
        message_body = {
            "submissionId": 12345,
            # problemId
            "username": "testuser",
            "sourceCode": "print('test')",
            "language": "PYTHON",
            "timeLimit": 2,
            "memoryLimit": 512
        }

        with pytest.raises(ValueError, match="Missing required fields in message"):
            judge.worker._handle_message(message_body)
    
    def test_handle_message_invalid_types(self):
        """필드 타입이 잘못된 경우 처리 테스트"""
        message_body = {
            "submissionId": 12345,
            "problemId": 1,
            "username": "testuser",
            "sourceCode": "print('test')",
            "language": "PYTHON",
            "timeLimit": "invalid",
            "memoryLimit": 256
        }

        with pytest.raises(ValueError):
            judge.worker._handle_message(message_body)


class TestSendMessage:
    
    @patch('judge.worker.boto3')
    def test_send_message_success(self, mock_boto3):
        """메시지 전송 성공 테스트"""
        mock_sqs = MagicMock()
        mock_queue = MagicMock()
        mock_queue.url = "https://sqs.region.amazonaws.com/account/queue"
        mock_boto3.resource.return_value = mock_sqs
        mock_sqs.get_queue_by_name.return_value = mock_queue
        
        message = {
            "submissionId": 12345,
            "problemId": 1,
            "username": "testuser",
            "submitStatus": "ACCEPTED"
        }
        
        with patch('judge.worker.settings') as mock_settings:
            mock_settings.sqs_result_queue_name = "result-queue"
            
            judge.worker._send_message(message)
            
            mock_sqs.get_queue_by_name.assert_called_once_with(QueueName="result-queue")
            mock_queue.send_message.assert_called_once_with(
                MessageBody=json.dumps(message),
                MessageGroupId="results",
                MessageDeduplicationId="12345"
            )
    
    @patch('judge.worker.boto3')
    def test_send_message_queue_error(self, mock_boto3):
        """큐 접근 실패 테스트"""
        mock_sqs = MagicMock()
        mock_boto3.resource.return_value = mock_sqs
        mock_sqs.get_queue_by_name.side_effect = ClientError(
            error_response={'Error': {'Code': 'QueueDoesNotExist'}},
            operation_name='GetQueueByName'
        )
        
        message = {"submissionId": 12345}
        
        with pytest.raises(ClientError):
            judge.worker._send_message(message)
