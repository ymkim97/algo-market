import subprocess
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def compile_java(source_code_path) -> int:
    work_dir = os.path.dirname(source_code_path)
    java_filename = os.path.basename(source_code_path)

    docker_cmd = [
        "docker", "run", "--rm",
        "--memory", "256m",
        "--cpus", "0.5", 
        "--network", "none",
        "--read-only",
        "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges",
        "--user", f"{os.getuid()}:{os.getgid()}",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
        "-v", f"{work_dir}:/app:rw",
        "-w", "/app",
        "amazoncorretto:21",
        "javac", "-encoding", "UTF-8", "-cp", ".", java_filename
    ]
    
    logger.info(f"Compiling Java file: {java_filename}")
    
    try:
        result = subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=30  # 컴파일은 더 여유있게
        )
        
        if result.returncode != 0:
            logger.error(f"Java compilation failed: {result.stderr}")
        else:
            logger.info(f"Java compilation successful: {java_filename}")
            
        return result.returncode
        
    except subprocess.TimeoutExpired:
        logger.error(f"Java compilation timeout for: {java_filename}")
        return -1
    except FileNotFoundError:
        logger.error("Docker not found")
        return -1
    except Exception:
        logger.error("Compilation failed with exception", exc_info=True)
        return -1
