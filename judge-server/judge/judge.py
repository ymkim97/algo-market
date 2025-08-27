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

MEMORY_ERROR_PATTERNS = {
    "JAVA": ["OutOfMemoryError"],
    "PYTHON": ["MemoryError"]
}

def run(source_code_path, language, time_limit, memory_limit, problem_id) -> str:
    input_test_data, output_test_data = fetch_test_data(problem_id)

    if language == "JAVA":
        compile_result_code = compile_java(source_code_path)

        if compile_result_code != 0:
            return "COMPILE_ERROR"

    return _evaluate_code(source_code_path, language, time_limit, memory_limit, input_test_data, output_test_data)

def _build_docker_command(language, memory_limit, path) -> list[str]:
    if language not in DOCKER_IMAGES:
        raise ValueError("Unsupported language")

    work_dir = os.path.dirname(path)

    docker_cmd = DOCKER_BASE_CMD.copy()
    docker_cmd.extend([
        "--memory", f"{memory_limit}m",
        "-v", f"{work_dir}:/app:ro",
        "-w", "/app",
        "-i",
        DOCKER_IMAGES[language]
    ])

    if language == "JAVA":
        class_name = "Main"
        docker_cmd.extend(["java", f"-Xmx{memory_limit}m", "-cp", ".", class_name])
    elif language == "PYTHON":
        script_name = os.path.basename(path)
        docker_cmd.extend(["python", "-I", "-B", "-S", script_name])

    return docker_cmd


def _evaluate_code(path: str, language: str, time_limit: int, memory_limit: int, input_test_data: list, output_test_data: list) -> str:
    docker_cmd = _build_docker_command(language, memory_limit, path)

    for input_data, expected_data in zip(input_test_data, output_test_data):
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

            stdout, stderr = process.communicate(input=input_data, timeout=time_limit)

            if process.returncode != 0:
                logger.error(f"Error With Judge: {stderr}")
                if any(error in stderr for error in MEMORY_ERROR_PATTERNS[language]) or process.returncode == 137:
                    return "MEMORY_LIMIT_EXCEEDED"
                return "RUNTIME_ERROR"

            if stdout.strip() != expected_data.strip():
                return "WRONG_ANSWER"

        except subprocess.TimeoutExpired:
            if process:
                process.kill()
            return "TIME_LIMIT_EXCEEDED"

        finally:
            _cleanup_process(process)

    return "ACCEPTED"

def _cleanup_process(process):
    if process and process.poll() is None:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
