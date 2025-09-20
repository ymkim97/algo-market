from judge.compiler import compile_java, compile_python
from judge.problem_data_manager import fetch_test_data
from judge.progress_publisher import progress_publisher
from judge.path_utils import resolve_host_volume_path

import os
import logging
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DOCKER_IMAGES = {
    "JAVA": "amazoncorretto:21",
    "PYTHON": "python:3.13-slim"
}

DOCKER_BASE_CMD = [
    "docker", "run", "--rm",
    "--network=none",
    "--pids-limit=64",
    "--cpus", "1.0",
    "--read-only",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--user", "65334:65334"
]

def run(source_code_path: str, language: str, time_limit_sec: int, memory_limit_mb: int, problem_id: int, submission_id: int, username: str) -> tuple[str, float | None, int | None]:
    input_test_data, output_test_data = fetch_test_data(problem_id)

    if language == "JAVA":
        compile_result_code = compile_java(source_code_path)
        time_limit_sec = time_limit_sec * 2 + 1
        memory_limit_mb = memory_limit_mb * 2 + 16

        if compile_result_code != 0:
            progress_publisher.publish_judging_completed(submission_id, username, "COMPILE_ERROR")
            return "COMPILE_ERROR", None, None

    elif language == "PYTHON":
        compile_result_code = compile_python(source_code_path)
        time_limit_sec = time_limit_sec * 3 + 2
        memory_limit_mb = memory_limit_mb * 2 + 16

        if compile_result_code != 0:
            progress_publisher.publish_judging_completed(submission_id, username, "COMPILE_ERROR")
            return "COMPILE_ERROR", None, None

    progress_publisher.publish_judging_start(submission_id, username, len(input_test_data))

    result, max_duration, max_memory = _evaluate_code(username, source_code_path, language, time_limit_sec, memory_limit_mb, input_test_data, output_test_data, submission_id)

    progress_publisher.publish_judging_completed(submission_id, username, result, max_duration, max_memory)

    return result, max_duration, max_memory

def _evaluate_code(username: str, path: str, language: str, time_limit_sec: int, memory_limit_mb: int, input_test_data: list, output_test_data: list, submission_id: int) -> tuple[str, float | None, int | None]:
    docker_cmd = _build_docker_command(language, memory_limit_mb, path)

    max_test_duration_ms = 0.0
    max_memory_used_kb = 0

    for i, (input_data, expected_data) in enumerate(zip(input_test_data, output_test_data)):
        process = None
        try:
            process = subprocess.Popen(
                docker_cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding='utf-8'
            )

            stdout, stderr = process.communicate(input=input_data, timeout=time_limit_sec + 2)

            if process.returncode != 0:
                logger.error(f"Error With Judge (Code:{process.returncode}: {stderr}")
                if process.returncode == 137 or "MemoryError" in stderr:
                    return "MEMORY_LIMIT_EXCEEDED", None, None
                elif process.returncode == 127:
                    return "SERVER_ERROR", None, None
                return "RUNTIME_ERROR", None, None

            execution_time_ms, memory_used_kb = _parse_execution_time_ms_and_memory_usage_kb(stderr)
            max_test_duration_ms = max(max_test_duration_ms, execution_time_ms)
            max_memory_used_kb = max(max_memory_used_kb, memory_used_kb)

            if max_test_duration_ms > time_limit_sec * 1000:
                return "TIME_LIMIT_EXCEEDED", None, None

            if stdout.strip() != expected_data.strip():
                return "WRONG_ANSWER", None, None

            progress_publisher.publish_test_case_completed(submission_id, username, i + 1, len(input_test_data))

        except subprocess.TimeoutExpired:
            if process:
                process.kill()
            return "TIME_LIMIT_EXCEEDED", None, None

        finally:
            _cleanup_process(process)

    logger.info(f"All test cases passed. Maximum execution time: {max_test_duration_ms}MS, Maximum memory used: {max_memory_used_kb}KB")

    return "ACCEPTED", max_test_duration_ms, max_memory_used_kb

def _build_docker_command(language, memory_limit_mb, path) -> list[str]:
    if language not in DOCKER_IMAGES:
        raise ValueError("Unsupported language")

    work_dir = os.path.dirname(path)

    # 컨테이너 환경인지 확인 (/.dockerenv 파일 존재 여부)
    is_in_container = os.path.exists("/.dockerenv")

    if is_in_container:
        host_work_dir = resolve_host_volume_path(work_dir)
    else:
        host_work_dir = work_dir

    docker_cmd = DOCKER_BASE_CMD.copy()

    if language == "JAVA":
        docker_cmd.extend([
            "-v", f"{host_work_dir}:/app:ro",
            "-w", "/app",
            "-i",
            DOCKER_IMAGES[language]
        ])
        docker_cmd.extend(["bash", "-c", f"time java -Xmx{memory_limit_mb}m -Dfile.encoding=UTF-8 -cp . Main; exit_code=$?; echo \"MEMORY_KB:$(($(cat /sys/fs/cgroup/memory.peak 2>/dev/null || echo 0) / 1024))\" >&2; exit $exit_code"])
    elif language == "PYTHON":
        docker_cmd.extend([
            "--memory", f"{memory_limit_mb + 4}m",
            "-v", f"{host_work_dir}:/app:ro",
            "-w", "/app",
            "-i",
            DOCKER_IMAGES[language]
        ])
        docker_cmd.extend(["bash", "-c", f"time python -I -S -W ignore Main.py; exit_code=$?; echo \"MEMORY_KB:$(($(cat /sys/fs/cgroup/memory.peak 2>/dev/null || echo 0) / 1024))\" >&2 ; exit $exit_code"])

    return docker_cmd

def _parse_execution_time_ms_and_memory_usage_kb(stderr: str) -> tuple[int, int]:
    lines = stderr.strip().split('\n')

    total_ms = 0
    memory_used_kb = 0

    for line in lines:
        if line.startswith('user') or line.startswith('sys'):
            time_str = line.split()[1]

            parts = time_str.replace('s', '').split('m')
            minutes = float(parts[0])
            seconds = float(parts[1])

            total_ms += int((minutes * 60 + seconds) * 1000)
        elif line.startswith('MEMORY_KB:'):
            memory_used_kb = int(line.split(':')[1])

    return total_ms, memory_used_kb

def _cleanup_process(process):
    if process and process.poll() is None:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
