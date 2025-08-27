# Algo Market - 온라인 저지 시스템 (임시 README)

알고리즘 문제 해결 플랫폼으로, 사용자가 문제를 제출하고 자동 채점을 통해 결과를 확인할 수 있는 시스템입니다.

## 🏗 시스템 아키텍처

```
                              ┌─────────────────────┐
                              │   Problem Service   │
                              │    (Spring Boot)    │
                              │                     │
                              │  - 문제 관리          │
                              │  - 회원 인증          │
                              │  - 제출 처리          │
                              └─────────────────────┘
                                         │
                                         │ SQS Message
                                         ▼
                              ┌─────────────────────┐
                              │   Judge Server      │
                              │    (FastAPI)        │
                              │                     │
                              │  - 코드 컴파일        │
                              │  - 테스트 실행        │
                              │  - 결과 반환          │
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
- 테스트 케이스 관리
- 이미지 및 대용량 파일 지원 (S3 연동)

### 2. 회원 시스템
- JWT 기반 인증
- 회원가입/로그인

### 3. 코드 제출 및 채점
- 다중 언어 지원 (Java, Python 등)
- Docker를 이용한 안전한 코드 실행
- 시간/메모리 제한 체크
- 실시간 채점 결과 반환

### 4. 메시징 시스템
- AWS SQS를 통한 비동기 채점 처리
- 채점 요청/결과 큐 분리

## 🛠 기술 스택

### Problem Service (Backend)
- **Java 21** + **Spring Boot 3.5.3**
- **Spring Data JPA** - 데이터베이스 연동
- **Spring Security** - 인증/인가
- **AWS SDK** - S3, SQS 연동
- **MySQL** - DB

### Judge Server
- **Python 3.10+** + **FastAPI**
- **Docker** - 코드 실행 격리
- **Boto3** - AWS SQS 연동

### 인프라
- **AWS S3** - 파일 저장소
- **AWS SQS** - 메시지 큐
- **Docker** - 컨테이너화
