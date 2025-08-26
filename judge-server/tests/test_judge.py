from unittest.mock import patch, MagicMock
from judge.judge import run
import judge.judge

import pytest
import os
import tempfile
import shutil
import subprocess

class TestJudge:
    
    @pytest.fixture
    def temp_source_file(self):
        """테스트용 임시 소스 파일 생성"""
        temp_dir = tempfile.mkdtemp()
        java_file = os.path.join(temp_dir, "Main.java")
        python_file = os.path.join(temp_dir, "Main.py")
        
        with open(java_file, "w") as f:
            f.write("""
            public class Main {
                public static void main(String[] args) {
                    System.out.println("Hello World");
                }
            }
            """)
        
        with open(python_file, "w") as f:
            f.write("print('Hello World')")
        
        yield {"java": java_file, "python": python_file, "temp_dir": temp_dir}
        
        shutil.rmtree(temp_dir)
    
    def test_build_docker_command_java(self, temp_source_file):
        """Java용 Docker 명령어 생성 테스트"""
        java_file = temp_source_file["java"]
        cmd = judge.judge._build_docker_command("JAVA", 256, java_file)
        
        assert "docker" in cmd
        assert "run" in cmd
        assert "--rm" in cmd
        assert "amazoncorretto:21" in cmd
        assert "java" in cmd
        assert "-Xmx256m" in cmd
        assert "Main" in cmd
    
    def test_build_docker_command_python(self, temp_source_file):
        """Python용 Docker 명령어 생성 테스트"""
        python_file = temp_source_file["python"]
        cmd = judge.judge._build_docker_command("PYTHON", 256, python_file)
        
        assert "docker" in cmd
        assert "run" in cmd
        assert "--rm" in cmd
        assert "python:3.13-slim" in cmd
        assert "python" in cmd
        assert "Main.py" in cmd
    
    def test_build_docker_command_unsupported_language(self, temp_source_file):
        """지원하지 않는 언어에 대한 예외 처리 테스트"""
        java_file = temp_source_file["java"]
        
        with pytest.raises(ValueError, match="Unsupported language"):
            judge.judge._build_docker_command("RUST", 256, java_file)
    
    @patch('judge.judge.subprocess.Popen')
    def test_evaluate_code_accepted(self, mock_popen, temp_source_file):
        """정답 케이스 테스트"""
        # Mock 프로세스 설정
        mock_process = MagicMock()
        mock_process.communicate.return_value = ("ABC", "")
        mock_process.returncode = 0
        mock_process.poll.return_value = 0
        mock_popen.return_value = mock_process
        
        python_file = temp_source_file["python"]
        result = judge.judge._evaluate_code(
            python_file, "PYTHON", 5, 256, 
            ["abc"], ["ABC"]
        )
        
        assert result == "ACCEPTED"
        mock_popen.assert_called_once()
    
    @patch('judge.judge.subprocess.Popen')
    def test_evaluate_code_wrong_answer(self, mock_popen, temp_source_file):
        """틀린 답 케이스 테스트"""
        mock_process = MagicMock()
        mock_process.communicate.return_value = ("XYZ", "")
        mock_process.returncode = 0
        mock_process.poll.return_value = 0
        mock_popen.return_value = mock_process
        
        python_file = temp_source_file["python"]
        result = judge.judge._evaluate_code(
            python_file, "PYTHON", 5, 256,
            ["abc"], ["ABC"]
        )
        
        assert result == "WRONG_ANSWER"
    
    @patch('judge.judge.subprocess.Popen')
    def test_evaluate_code_timeout(self, mock_popen, temp_source_file):
        """시간 초과 테스트"""
        mock_process = MagicMock()
        mock_process.communicate.side_effect = subprocess.TimeoutExpired("cmd", 5)
        mock_popen.return_value = mock_process
        
        python_file = temp_source_file["python"]
        result = judge.judge._evaluate_code(
            python_file, "PYTHON", 5, 256,
            ["abc"], ["ABC"]
        )
        
        assert result == "TIME_LIMIT_EXCEEDED"
        mock_process.kill.assert_called_once()
    
    @patch('judge.judge.subprocess.Popen')
    def test_evaluate_code_memory_limit_python(self, mock_popen, temp_source_file):
        """Python 메모리 초과 테스트"""
        mock_process = MagicMock()
        mock_process.communicate.return_value = ("", "MemoryError: out of memory")
        mock_process.returncode = 1
        mock_process.poll.return_value = 0
        mock_popen.return_value = mock_process
        
        python_file = temp_source_file["python"]
        result = judge.judge._evaluate_code(
            python_file, "PYTHON", 5, 256,
            ["abc"], ["ABC"]
        )
        
        assert result == "MEMORY_LIMIT_EXCEEDED"
    
    @patch('judge.judge.subprocess.Popen')
    def test_evaluate_code_runtime_error(self, mock_popen, temp_source_file):
        """런타임 에러 테스트"""
        mock_process = MagicMock()
        mock_process.communicate.return_value = ("", "RuntimeError: some error")
        mock_process.returncode = 1
        mock_process.poll.return_value = 0
        mock_popen.return_value = mock_process
        
        python_file = temp_source_file["python"]
        result = judge.judge._evaluate_code(
            python_file, "PYTHON", 5, 256,
            ["abc"], ["ABC"]
        )
        
        assert result == "RUNTIME_ERROR"
    
    @patch('judge.judge.compile_java')
    @patch('judge.judge._evaluate_code')
    def test_run_java_compile_error(self, mock_evaluate, mock_compile, temp_source_file):
        """Java 컴파일 오류 테스트"""
        mock_compile.return_value = 1  # 컴파일 실패
        
        java_file = temp_source_file["java"]
        result = run(java_file, "JAVA", 5, 256, 1)
        
        assert result == "COMPILE_ERROR"
        mock_compile.assert_called_once_with(java_file)
        mock_evaluate.assert_not_called()
    
    @patch('judge.judge.compile_java')
    @patch('judge.judge._evaluate_code')
    def test_run_java_success(self, mock_evaluate, mock_compile, temp_source_file):
        """Java 성공 케이스 테스트"""
        mock_compile.return_value = 0  # 컴파일 성공
        mock_evaluate.return_value = "ACCEPTED"
        
        java_file = temp_source_file["java"]
        result = run(java_file, "JAVA", 5, 256, 1)
        
        assert result == "ACCEPTED"
        mock_compile.assert_called_once_with(java_file)
        mock_evaluate.assert_called_once()
    
    @patch('judge.judge._evaluate_code')
    def test_run_python_success(self, mock_evaluate, temp_source_file):
        """Python 성공 케이스 테스트"""
        mock_evaluate.return_value = "ACCEPTED"
        
        python_file = temp_source_file["python"]
        result = run(python_file, "PYTHON", 5, 256, 1)
        
        assert result == "ACCEPTED"
        mock_evaluate.assert_called_once()


class TestCleanupProcess:
    
    def test_cleanup_process_already_finished(self):
        """이미 종료된 프로세스 정리 테스트"""
        mock_process = MagicMock()
        mock_process.poll.return_value = 0  # 이미 종료됨
        
        judge.judge._cleanup_process(mock_process)
        
        mock_process.terminate.assert_not_called()
        mock_process.kill.assert_not_called()
    
    def test_cleanup_process_terminate_success(self):
        """정상 종료 테스트"""
        mock_process = MagicMock()
        mock_process.poll.return_value = None  # 실행 중
        mock_process.wait.return_value = None  # terminate 후 정상 종료
        
        judge.judge._cleanup_process(mock_process)
        
        mock_process.terminate.assert_called_once()
        mock_process.wait.assert_called()
        mock_process.kill.assert_not_called()
    
    def test_cleanup_process_force_kill(self):
        """강제 종료 테스트"""
        mock_process = MagicMock()
        mock_process.poll.return_value = None  # 실행 중
        mock_process.wait.side_effect = [subprocess.TimeoutExpired("cmd", 5), None]
        
        judge.judge._cleanup_process(mock_process)
        
        mock_process.terminate.assert_called_once()
        assert mock_process.wait.call_count == 2
        mock_process.kill.assert_called_once()
    
    def test_cleanup_process_none(self):
        """None 프로세스 처리 테스트"""
        judge.judge._cleanup_process(None)
        # 예외 없이 통과해야 함
