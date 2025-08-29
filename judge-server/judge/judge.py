from judge.compiler import compile_java
from judge.problem_data_manager import fetch_test_data

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

def run(source_code_path, language, time_limit_sec, memory_limit_mb, problem_id) -> tuple[str, float | None, int | None]:
    input_test_data, output_test_data = fetch_test_data(problem_id)

    if language == "JAVA":
        compile_result_code = compile_java(source_code_path)
        time_limit_sec = time_limit_sec * 2 + 1
        memory_limit_mb = memory_limit_mb * 2 + 16

        if compile_result_code != 0:
            return "COMPILE_ERROR", None, None

    elif language == "PYTHON":
        time_limit_sec = time_limit_sec * 3 + 2
        memory_limit_mb = memory_limit_mb * 2 + 16

    result, max_duration, max_memory = _evaluate_code(source_code_path, language, time_limit_sec, memory_limit_mb, input_test_data, output_test_data)

    return result, max_duration, max_memory

def _evaluate_code(path: str, language: str, time_limit_sec: int, memory_limit_mb: int, input_test_data: list, output_test_data: list) -> tuple[str, float | None, int | None]:
    docker_cmd = _build_docker_command(language, memory_limit_mb, path)

    max_test_duration_ms = 0.0

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

            execution_time_ms = _parse_execution_time_to_ms(stderr)
            max_test_duration_ms = max(max_test_duration_ms, execution_time_ms)

            if max_test_duration_ms > time_limit_sec * 1000:
                return "TIME_LIMIT_EXCEEDED", None, None

            if stdout.strip() != expected_data.strip():
                return "WRONG_ANSWER", None, None

        except subprocess.TimeoutExpired:
            if process:
                process.kill()
            return "TIME_LIMIT_EXCEEDED", None, None

        finally:
            _cleanup_process(process)

    logger.info(f"All test cases passed. Maximum execution time: {max_test_duration_ms}MS")

    return "ACCEPTED", max_test_duration_ms, None

def _build_docker_command(language, memory_limit_mb, path) -> list[str]:
    if language not in DOCKER_IMAGES:
        raise ValueError("Unsupported language")

    work_dir = os.path.dirname(path)

    docker_cmd = DOCKER_BASE_CMD.copy()

    if language == "JAVA":
        docker_cmd.extend([
            "-v", f"{work_dir}:/app:ro",
            "-w", "/app",
            "-i",
            DOCKER_IMAGES[language]
        ])
        docker_cmd.extend(["bash", "-c", f"time java -Xmx{memory_limit_mb}m -Dfile.encoding=UTF-8 -cp . Main"])
    elif language == "PYTHON":
        docker_cmd.extend([
            "--memory", f"{memory_limit_mb + 4}m",
            "-v", f"{work_dir}:/app:ro",
            "-w", "/app",
            "-i",
            DOCKER_IMAGES[language]
        ])
        script_name = os.path.basename(path)
        docker_cmd.extend(["bash", "-c", f"time python -I -B -S {script_name}"])

    return docker_cmd

def _parse_execution_time_to_ms(stderr: str) -> int:
    lines = stderr.strip().split('\n')

    total_ms = 0

    for line in lines:
        if line.startswith('user') or line.startswith('sys'):
            time_str = line.split()[1]

            parts = time_str.replace('s', '').split('m')
            minutes = float(parts[0])
            seconds = float(parts[1])

            total_ms += int((minutes * 60 + seconds) * 1000)

    return total_ms

def _cleanup_process(process):
    if process and process.poll() is None:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
