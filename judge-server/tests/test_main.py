from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app

import concurrent.futures
import pytest
import time

class TestMainApp:
    
    @pytest.fixture
    def client(self):
        """테스트 클라이언트 생성"""
        return TestClient(app)
    
    def test_health_check_endpoint(self, client):
        """헬스체크 엔드포인트 테스트"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["message"] == "Judge server is running."
    
    def test_health_check_response_format(self, client):
        """헬스체크 응답 형식 검증"""
        response = client.get("/health")
        
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data
        assert "message" in data
    
    def test_nonexistent_endpoint_404(self, client):
        """존재하지 않는 엔드포인트 404 테스트"""
        response = client.get("/nonexistent")
        assert response.status_code == 404
    
    def test_multiple_concurrent_requests(self, client):
        """동시 요청 처리 테스트"""
        def make_request():
            return client.get("/health")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in futures]
        
        # 모든 요청이 성공해야 함
        for response in responses:
            assert response.status_code == 200
            assert response.json()["status"] == "ok"
    
    def test_request_response_cycle(self, client):
        """전체 요청-응답 사이클 테스트"""
        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()
        
        # 응답 시간이 합리적인 범위 내에 있는지 확인
        assert (end_time - start_time) < 1.0  # 1초 이내
        
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestLifespan:
    """앱 생명주기 관련 테스트"""
    
    @patch('main.threading.Thread')
    @patch('main.consume_loop')
    def test_worker_thread_daemon_mode(self, mock_consume_loop, mock_thread):
        """워커 스레드가 데몬 모드로 실행되는지 테스트"""
        mock_thread_instance = MagicMock()
        mock_thread.return_value = mock_thread_instance
        
        with TestClient(app):
            pass
        
        # 스레드가 daemon=True로 생성되었는지 확인
        mock_thread.assert_called_once_with(target=mock_consume_loop, daemon=True)
        mock_thread_instance.start.assert_called_once()


class TestErrorHandling:
    """에러 처리 관련 테스트"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_json_parsing_error(self, client):
        """잘못된 JSON 요청 처리 테스트"""
        response = client.post(
            "/health",  # POST는 허용되지 않지만 JSON 파싱 전에 차단됨
            headers={"Content-Type": "application/json"},
            content="invalid json"
        )
        # Method not allowed가 먼저 처리되므로 405
        assert response.status_code == 405
    
    def test_large_request_body(self, client):
        """큰 요청 본문 처리 테스트"""
        large_body = "x" * (1024 * 1024)  # 1MB
        response = client.post(
            "/health",
            content=large_body
        )
        # Method not allowed
        assert response.status_code == 405
