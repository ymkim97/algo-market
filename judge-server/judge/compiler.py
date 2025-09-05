import subprocess
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DOCKER_IMAGES = {
    "JAVA": "amazoncorretto:21",
    "PYTHON": "python:3.13-slim"
}

DOCKER_BASE_CMD = [
    "docker", "run", "--rm",
    "--memory", "256m",
    "--cpus", "0.5",
    "--network", "none",
    "--read-only",
    "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges",
    "--user", f"{os.getuid()}:{os.getgid()}",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m"
]

def compile_java(source_code_path) -> int:
    work_dir = os.path.dirname(source_code_path)

    docker_cmd = _build_docker_command(work_dir, DOCKER_IMAGES["JAVA"])
    docker_cmd.extend(["javac", "-encoding", "UTF-8", "-cp", ".", "Main.java"])

    return _run_compilation(docker_cmd, "JAVA")

def compile_python(source_code_path) -> int:
    work_dir = os.path.dirname(source_code_path)

    docker_cmd = _build_docker_command(work_dir, DOCKER_IMAGES["PYTHON"])
    docker_cmd.extend(["python", "-W", "ignore", "-c", f"import py_compile; py_compile.compile(r'Main.py')"])

    return _run_compilation(docker_cmd, "PYTHON")

def _build_docker_command(work_dir: str, image: str) -> list[str]:
    docker_cmd = DOCKER_BASE_CMD.copy()
    docker_cmd.extend([
        "-v", f"{work_dir}:/app:rw",
        "-w", "/app",
        image
    ])
    return docker_cmd

def _run_compilation(docker_cmd: list[str], language: str) -> int:
    logger.info(f"Compiling {language}")
    
    try:
        result = subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if language == "PYTHON":
            has_error = result.returncode != 0 or "Error" in result.stderr
            if has_error:
                logger.error(f"Python compilation failed: {result.stderr}")
                return -1
        else:
            if result.returncode != 0:
                logger.error(f"{language} compilation failed: {result.stderr}")
                return result.returncode
        
        logger.info(f"{language} compilation successful")
        return 0

    except subprocess.TimeoutExpired:
        logger.error(f"{language} compilation timed out")
        return -1
    except FileNotFoundError:
        logger.error("Docker not found")
        return -1
    except subprocess.SubprocessError as e:
        logger.error(f"{language} compilation failed with exception: {e}")
        return -1
