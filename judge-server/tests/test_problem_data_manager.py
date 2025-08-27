import pytest
import os
import tempfile
import shutil
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError

from judge.problem_data_manager import fetch_test_data
import judge.problem_data_manager


class TestProblemDataManager:
    
    @pytest.fixture
    def temp_problem_dir(self):
        """테스트용 임시 문제 디렉토리"""
        temp_dir = tempfile.mkdtemp()
        problem_dir = os.path.join(temp_dir, "1", "test_data")
        os.makedirs(problem_dir, exist_ok=True)
        yield {"temp_dir": temp_dir, "problem_dir": problem_dir}
        shutil.rmtree(temp_dir, ignore_errors=True)
    
    @pytest.fixture
    def sample_test_files(self, temp_problem_dir):
        """샘플 테스트 파일 생성"""
        problem_dir = temp_problem_dir["problem_dir"]
        
        # 테스트 케이스 파일들 생성
        test_cases = [
            ("input-1.in", "1 2", "output-1.out", "3"),
            ("input-2.in", "3 4", "output-2.out", "7"),
            ("input-10.in", "5 6", "output-10.out", "11")  # 숫자 정렬 테스트용
        ]
        
        for in_file, in_content, out_file, out_content in test_cases:
            with open(os.path.join(problem_dir, in_file), "w", encoding="utf-8") as f:
                f.write(in_content)
            with open(os.path.join(problem_dir, out_file), "w", encoding="utf-8") as f:
                f.write(out_content)
        
        return temp_problem_dir
    
    @patch('judge.problem_data_manager.settings')
    def test_fetch_test_data_from_local_files(self, mock_settings, sample_test_files):
        """로컬 파일에서 테스트 데이터 가져오기"""
        mock_settings.PROBLEM_DIR = sample_test_files["temp_dir"]
        
        input_data, output_data = fetch_test_data(1)
        
        # 정렬 순서 확인 (1, 2, 10 순서)
        assert len(input_data) == 3
        assert len(output_data) == 3
        assert input_data[0] == "1 2"
        assert output_data[0] == "3"
        assert input_data[1] == "3 4"
        assert output_data[1] == "7"
        assert input_data[2] == "5 6"
        assert output_data[2] == "11"
    
    @patch('judge.problem_data_manager.boto3')
    @patch('judge.problem_data_manager.settings')
    def test_fetch_test_data_from_s3(self, mock_settings, mock_boto3, temp_problem_dir):
        """S3에서 테스트 데이터 다운로드"""
        # Settings 설정
        mock_settings.PROBLEM_DIR = temp_problem_dir["temp_dir"]
        mock_settings.aws_region = "us-east-1"
        mock_settings.aws_access_key_id = "test-key"
        mock_settings.aws_secret_access_key = "test-secret"
        mock_settings.s3_bucket_name = "test-bucket"
        
        # S3 클라이언트 모킹
        mock_s3_client = MagicMock()
        mock_boto3.client.return_value = mock_s3_client
        
        # S3 객체 리스트 모킹
        mock_s3_client.list_objects_v2.return_value = {
            'Contents': [
                {'Key': 'problems/1/test_data/input-1.in'},
                {'Key': 'problems/1/test_data/output-1.out'},
                {'Key': 'problems/1/test_data/input-2.in'},
                {'Key': 'problems/1/test_data/output-2.out'}
            ]
        }
        
        # 파일 다운로드 후 로컬에 파일 생성 시뮬레이션
        def mock_download_file(bucket, key, local_path):
            filename = os.path.basename(key)
            content = ""
            if "input-1" in filename:
                content = "1 2"
            elif "output-1" in filename:
                content = "3"
            elif "input-2" in filename:
                content = "3 4"
            elif "output-2" in filename:
                content = "7"
            
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        mock_s3_client.download_file.side_effect = mock_download_file
        
        input_data, output_data = fetch_test_data(1)
        
        # S3 클라이언트 호출 확인
        mock_boto3.client.assert_called_once_with(
            "s3",
            region_name="us-east-1",
            aws_access_key_id="test-key",
            aws_secret_access_key="test-secret"
        )
        
        # 결과 확인
        assert len(input_data) == 2
        assert len(output_data) == 2
        assert input_data[0] == "1 2"
        assert output_data[0] == "3"
    
    @patch('judge.problem_data_manager.boto3')
    @patch('judge.problem_data_manager.settings')
    def test_fetch_test_data_s3_empty_response(self, mock_settings, mock_boto3, temp_problem_dir):
        """S3에 파일이 없는 경우"""
        mock_settings.PROBLEM_DIR = temp_problem_dir["temp_dir"]
        mock_settings.s3_bucket_name = "test-bucket"
        
        mock_s3_client = MagicMock()
        mock_boto3.client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.return_value = {}  # Contents 키 없음

        # 빈 결과 반환
        with pytest.raises(ValueError):
            fetch_test_data(1)
    
    def test_sort_test_files_numeric_sorting(self):
        """테스트 파일 숫자 정렬 테스트"""
        filenames = [
            "input-10.in", "output-10.out",
            "input-1.in", "output-1.out",
            "input-2.in", "output-2.out",
            "extra.txt"  # 관련 없는 파일
        ]
        
        ins, outs = judge.problem_data_manager._sort_test_files(filenames)
        
        assert ins == ["input-1.in", "input-2.in", "input-10.in"]
        assert outs == ["output-1.out", "output-2.out", "output-10.out"]
    
    def test_sort_test_files_no_test_files(self):
        """테스트 파일이 없는 경우"""
        filenames = ["README.md", "config.txt"]
        
        ins, outs = judge.problem_data_manager._sort_test_files(filenames)
        
        assert ins == []
        assert outs == []
    
    def test_read_test_file_pairs(self, temp_problem_dir):
        """테스트 파일 내용 읽기"""
        problem_dir = temp_problem_dir["problem_dir"]
        
        # 테스트 파일 생성
        with open(os.path.join(problem_dir, "input-1.in"), "w", encoding="utf-8") as f:
            f.write("Hello World")
        with open(os.path.join(problem_dir, "output-1.out"), "w", encoding="utf-8") as f:
            f.write("Expected Output")
        
        ins = ["input-1.in"]
        outs = ["output-1.out"]
        
        input_data, output_data = judge.problem_data_manager._read_test_file_pairs(problem_dir, ins, outs)
        
        assert input_data == ["Hello World"]
        assert output_data == ["Expected Output"]
    
    def test_read_test_file_pairs_unicode(self, temp_problem_dir):
        """유니코드 파일 읽기 테스트"""
        problem_dir = temp_problem_dir["problem_dir"]
        
        # 한글 포함 테스트 파일
        with open(os.path.join(problem_dir, "input-1.in"), "w", encoding="utf-8") as f:
            f.write("안녕하세요 🐍")
        with open(os.path.join(problem_dir, "output-1.out"), "w", encoding="utf-8") as f:
            f.write("출력 결과")
        
        ins = ["input-1.in"]
        outs = ["output-1.out"]
        
        input_data, output_data = judge.problem_data_manager._read_test_file_pairs(problem_dir, ins, outs)
        
        assert input_data == ["안녕하세요 🐍"]
        assert output_data == ["출력 결과"]
    
    @patch('judge.problem_data_manager.settings')
    def test_fetch_test_data_mismatched_files(self, mock_settings, temp_problem_dir):
        """입력/출력 파일 개수 불일치"""
        mock_settings.PROBLEM_DIR = temp_problem_dir["temp_dir"]
        problem_dir = temp_problem_dir["problem_dir"]
        
        # 입력 파일만 생성 (출력 파일 누락)
        with open(os.path.join(problem_dir, "input-1.in"), "w") as f:
            f.write("test")
        
        with pytest.raises(ValueError):
            fetch_test_data(1)
    
    @patch('judge.problem_data_manager.boto3')
    @patch('judge.problem_data_manager.settings')
    def test_download_test_data_from_s3_creates_directory(self, mock_settings, mock_boto3, temp_problem_dir):
        """S3 다운로드 시 디렉토리 생성 확인"""
        problem_dir = os.path.join(temp_problem_dir["temp_dir"], "999", "test_data")
        # 디렉토리가 존재하지 않음을 확인
        assert not os.path.exists(problem_dir)
        
        mock_settings.s3_bucket_name = "test-bucket"
        mock_s3_client = MagicMock()
        mock_boto3.client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.return_value = {
            'Contents': [{'Key': 'problems/999/test_data/input-1.in'}]
        }
        
        judge.problem_data_manager._download_test_data_from_s3(999, problem_dir)
        
        # 디렉토리가 생성되었음을 확인
        assert os.path.exists(problem_dir)
    
    @patch('judge.problem_data_manager.boto3')
    @patch('judge.problem_data_manager.settings')
    def test_download_test_data_s3_client_error(self, mock_settings, mock_boto3, temp_problem_dir):
        """S3 클라이언트 에러 처리"""
        problem_dir = temp_problem_dir["problem_dir"]
        
        mock_s3_client = MagicMock()
        mock_boto3.client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.side_effect = ClientError(
            error_response={'Error': {'Code': 'NoSuchBucket'}},
            operation_name='ListObjectsV2'
        )
        
        # 예외가 상위로 전파되어야 함 (main.py의 exception handler가 처리)
        with pytest.raises(ClientError):
            judge.problem_data_manager._download_test_data_from_s3(1, problem_dir)
    
    @patch('judge.problem_data_manager.settings')
    def test_fetch_test_data_empty_directory_triggers_s3_download(self, mock_settings, temp_problem_dir):
        """빈 디렉토리가 있으면 S3 다운로드 시도"""
        mock_settings.PROBLEM_DIR = temp_problem_dir["temp_dir"]
        
        with patch('judge.problem_data_manager._download_test_data_from_s3') as mock_download:
            # 빈 디렉토리에서 fetch_test_data 호출
            try:
                fetch_test_data(1)
            except:
                pass  # 파일이 없어서 발생하는 에러는 무시
            
            # S3 다운로드가 호출되었는지 확인
            mock_download.assert_called_once()
    
    def test_sort_test_files_edge_cases(self):
        """파일 정렬 엣지 케이스"""
        # 파일명이 올바르지 않은 경우들
        filenames = [
            "input-abc.in",  # 숫자가 아닌 suffix
            "input-.in",     # 빈 suffix
            "input.in",      # suffix 없음
            "input-1.in",    # 정상 파일
            "output-1.out"   # 정상 파일
        ]
        
        # ValueError가 발생하거나 정상 파일만 처리되어야 함
        try:
            ins, outs = judge.problem_data_manager._sort_test_files(filenames)
            # 정상적인 파일만 포함되어야 함
            assert "input-1.in" in ins
            assert "output-1.out" in outs
        except ValueError:
            # 잘못된 파일명으로 인한 에러도 허용
            pass
