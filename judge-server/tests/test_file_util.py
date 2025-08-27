import pytest
import os
import tempfile
import shutil
from unittest.mock import patch

from judge.file_util import save_to_temp, delete_temp, ext_map

class TestFileUtil:
    
    @pytest.fixture
    def temp_dir(self):
        """테스트용 임시 디렉토리"""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_python(self, mock_settings, temp_dir):
        """Python 파일 저장 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        source_code = "print('Hello World')"
        submission_id = 12345
        username = "testuser"
        language = "PYTHON"
        
        file_path = save_to_temp(source_code, submission_id, username, language)
        
        expected_path = os.path.join(temp_dir, username, str(submission_id), "Main.py")
        assert file_path == expected_path
        assert os.path.exists(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert content == source_code
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_java(self, mock_settings, temp_dir):
        """Java 파일 저장 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        source_code = """
        public class Main {
            public static void main(String[] args) {
                System.out.println("Hello World");
            }
        }
        """
        submission_id = 67890
        username = "javauser"
        language = "JAVA"
        
        file_path = save_to_temp(source_code, submission_id, username, language)
        
        expected_path = os.path.join(temp_dir, username, str(submission_id), "Main.java")
        assert file_path == expected_path
        assert os.path.exists(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert content == source_code
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_unsupported_language(self, mock_settings, temp_dir):
        """지원하지 않는 언어 예외 처리 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        with pytest.raises(ValueError, match="Unsupported language"):
            save_to_temp("code", 1, "user", "RUST")
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_creates_directory(self, mock_settings, temp_dir):
        """디렉토리 자동 생성 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        username = "newuser"
        submission_id = 99999
        user_dir = os.path.join(temp_dir, username, str(submission_id))
        
        # 디렉토리가 존재하지 않음을 확인
        assert not os.path.exists(user_dir)
        
        save_to_temp("print('test')", submission_id, username, "PYTHON")
        
        # 디렉토리가 생성되었음을 확인
        assert os.path.exists(user_dir)
    
    @patch('judge.file_util.settings')
    def test_delete_temp_removes_submission_directory(self, mock_settings, temp_dir):
        """제출 디렉토리 삭제 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        username = "testuser"
        submission_id = 12345
        
        # 파일 생성
        file_path = save_to_temp("print('test')", submission_id, username, "PYTHON")
        submission_dir = os.path.dirname(file_path)
        
        # 파일과 디렉토리가 존재함을 확인
        assert os.path.exists(file_path)
        assert os.path.exists(submission_dir)
        
        # 삭제 실행
        delete_temp(submission_id, username)
        
        # 제출 디렉토리가 삭제되었음을 확인
        assert not os.path.exists(submission_dir)
    
    @patch('judge.file_util.settings')
    def test_delete_temp_removes_user_directory_if_empty(self, mock_settings, temp_dir):
        """빈 사용자 디렉토리 삭제 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        username = "testuser"
        submission_id = 12345
        
        # 파일 생성
        save_to_temp("print('test')", submission_id, username, "PYTHON")
        user_dir = os.path.join(temp_dir, username)
        
        # 사용자 디렉토리가 존재함을 확인
        assert os.path.exists(user_dir)
        
        # 삭제 실행
        delete_temp(submission_id, username)
        
        # 사용자 디렉토리도 삭제되었음을 확인 (빈 디렉토리이므로)
        assert not os.path.exists(user_dir)
    
    @patch('judge.file_util.settings')
    def test_delete_temp_keeps_user_directory_if_not_empty(self, mock_settings, temp_dir):
        """비어있지 않은 사용자 디렉토리 유지 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        username = "testuser"
        submission_id1 = 12345
        submission_id2 = 67890
        
        # 두 개의 제출 파일 생성
        save_to_temp("print('test1')", submission_id1, username, "PYTHON")
        save_to_temp("print('test2')", submission_id2, username, "PYTHON")
        
        user_dir = os.path.join(temp_dir, username)
        submission_dir1 = os.path.join(user_dir, str(submission_id1))
        submission_dir2 = os.path.join(user_dir, str(submission_id2))
        
        # 첫 번째 제출만 삭제
        delete_temp(submission_id1, username)
        
        # 첫 번째 제출 디렉토리는 삭제되었지만 사용자 디렉토리는 남아있음
        assert not os.path.exists(submission_dir1)
        assert os.path.exists(submission_dir2)
        assert os.path.exists(user_dir)
    
    @patch('judge.file_util.settings')
    def test_delete_temp_nonexistent_directory(self, mock_settings, temp_dir):
        """존재하지 않는 디렉토리 삭제 시도 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        # 예외 없이 실행되어야 함
        delete_temp(99999, "nonexistent_user")
    
    def test_ext_map_contains_supported_languages(self):
        """지원 언어 매핑 테스트"""
        assert ext_map["PYTHON"] == "py"
        assert ext_map["JAVA"] == "java"
        assert len(ext_map) == 2
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_unicode_handling(self, mock_settings, temp_dir):
        """유니코드 문자 처리 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        source_code = "print('안녕하세요 🐍')"
        file_path = save_to_temp(source_code, 1, "user", "PYTHON")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        assert content == source_code
    
    @patch('judge.file_util.settings')
    def test_save_to_temp_large_file(self, mock_settings, temp_dir):
        """큰 파일 처리 테스트"""
        mock_settings.TEMP_DIR = temp_dir
        
        # 10KB 정도의 큰 소스코드
        large_code = "# " + "A" * 10000 + "\nprint('test')"
        file_path = save_to_temp(large_code, 1, "user", "PYTHON")
        
        assert os.path.exists(file_path)
        file_size = os.path.getsize(file_path)
        assert file_size > 10000
