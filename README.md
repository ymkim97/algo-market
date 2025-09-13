# Algo Market - 온라인 저지 시스템

알고리즘 문제 해결 플랫폼으로, 사용자가 문제를 제출하고 자동 채점을 통해 실시간으로 채점 진행상황과 결과를 확인할 수 있는 시스템입니다.

## 🏗 시스템 아키텍처

```
┌─────────────┐    SSE 연결      ┌─────────────────────┐
│   Client    │ ◄─────────────── │   Problem Service   │
│             │                  │    (Spring Boot)    │
└─────────────┘                  │                     │
                                 │  - 문제 관리          │
                                 │  - 회원 인증          │
                                 │  - 제출 처리          │
                                 │  - 실시간 진행상황     │
                                 └─────────────────────┘
                                           │         ▲
                                           │ SQS     │ Redis
                                           │         │ Pub/Sub
                                           ▼         │
                              ┌─────────────────────┐
                              │   Judge Server      │
                              │    (FastAPI)        │
                              │                     │
                              │  - 코드 컴파일        │
                              │  - 테스트 실행        │
                              │  - 진행상황 발행       │
                              └─────────────────────┘
                                         │
                                         │ Docker
                                         ▼
                              ┌─────────────────────┐
                              │  Isolated Runtime   │
                              │  (Docker Container) │
                              │                     │
                              │  - 보안 실행 환경      │
                              │  - 시간/메모리 제한     │
                              └─────────────────────┘
```

## 📁 프로젝트 구조

```
algo-market/
├── problem-service/          # 메인 서비스 (Spring Boot)
│   ├── src/main/java/
│   │   └── algomarket/
│   │       └── problemservice/
│   │           ├── adapter/          # 외부 어댑터 (API, 메시징, 저장소)
│   │           ├── application/      # 애플리케이션 서비스
│   │           └── domain/           # 도메인 모델
│   └── build.gradle.kts
├── judge-server/             # 채점 서버 (Python FastAPI)
│   ├── judge/                # 채점 로직
│   ├── problems/             # 문제 테스트 데이터
│   ├── tests/                # 테스트 코드
│   └── requirements.txt
└── assignment.md             # 과제 명세서
```

## 🚀 주요 기능

### 1. 문제 관리
- 문제 생성, 조회, 수정, 삭제
- 문제 공개 기능 (제출자가 2개 이상의 언어로 해결해야 가능)
- 문제 검색
- 테스트 케이스 관리
- 이미지 및 대용량 파일 지원 (S3 연동)

### 2. 회원 시스템
- JWT 기반 인증
- 회원가입/로그인

### 3. 코드 제출 및 채점
- 다중 언어 지원 (Java, Python 등)
- Docker를 이용한 안전한 코드 실행
- 시간/메모리 제한 체크
- 실시간 채점 진행상황 조회 (SSE)

### 4. 실시간 채점 현황 
- **Server-Sent Events (SSE)** 를 통한 실시간 진행상황 스트리밍
- 채점 단계별 진행률 (컴파일, 테스트케이스 실행, 완료)
- 테스트케이스별 실행 진행도 표시
- 채점 완료시 최종 결과 자동 전송

### 5. 메시징 시스템
- **AWS SQS** - 비동기 채점 요청 처리 
- **Redis Pub/Sub** - 실시간 채점 진행상황 전달
- 채점 요청/결과 큐 분리

### 6. 동시성 제어
- **Redis 분산락** - 문제 수정/공개 시 동시성 제어
- **AOP 기반 락 관리** - 어노테이션으로 간편한 락 적용

## 🛠 기술 스택

### Problem Service (Backend)
- **Java 21** + **Spring Boot 3.5.3**
- **Spring Data JPA** - 데이터베이스 연동
- **Spring Security** - 인증/인가 (JWT)
- **Server-Sent Events** - 실시간 데이터 스트리밍
- **Spring AOP** - 분산락 구현
- **Redisson** - Redis 분산락 클라이언트
- **AWS SDK** - S3, SQS 연동
- **MySQL** - 데이터베이스

### Judge Server
- **Python 3.10+** + **FastAPI**
- **Docker** - 코드 실행 격리
- **Redis** - 실시간 진행상황 발행
- **Boto3** - AWS SQS 연동

### 인프라
- **AWS S3** - 파일 저장소
- **AWS SQS** - 메시지 큐
- **Redis** - 실시간 메시징
- **Docker** - 컨테이너화

## 📡 API 엔드포인트

### 실시간 채점 현황 조회
```javascript
// SSE 연결을 통한 실시간 채점 현황 수신
const eventSource = new EventSource('/submissions/{submissionId}/progress', {
  headers: {
    'Authorization': 'Bearer {token}'
  }
});

// 연결 확립
eventSource.addEventListener('connected', (event) => {
  console.log('채점 현황 스트리밍 연결됨:', event.data);
});

// 진행상황 업데이트 수신
eventSource.addEventListener('progress', (event) => {
  const progressData = JSON.parse(event.data);
  console.log(`진행률: ${progressData.progressPercent}%`);
  console.log(`테스트케이스: ${progressData.currentTest}/${progressData.totalTests}`);
});

// 채점 완료
eventSource.addEventListener('completed', (event) => {
  const finalResult = JSON.parse(event.data);
  console.log('채점 완료:', finalResult.finalStatus);
  eventSource.close();
});
```

### 진행상황 이벤트 구조
```json
{
  "submissionId": 123,
  "username": "user123", 
  "submitStatus": "JUDGING",
  "progressPercent": 45,
  "currentTest": 3,
  "totalTests": 7,
  "timestamp": "2024-01-01T12:00:00"
}
```
