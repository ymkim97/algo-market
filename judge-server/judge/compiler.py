import subprocess

def compile_java(source_code_path) -> int:
    result = subprocess.run(
        ["javac", source_code_path],
        capture_output=False,
        text=True,
        timeout=10
    )

    return result.returncode
