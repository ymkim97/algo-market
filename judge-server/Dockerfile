FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 컨테이너 내에서 사용할 디렉토리 생성
RUN mkdir -p /app/temp_dir /app/problems

# 환경변수 설정
ENV TEMP_DIR=/app/temp_dir
ENV PROBLEM_DIR=/app/problems

EXPOSE 8000

# 애플리케이션 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]