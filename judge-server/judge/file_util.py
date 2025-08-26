from judge.config import settings

import os
import shutil

ext_map = {"PYTHON": "py", "JAVA": "java"}

def save_to_temp(source_code: str, submission_id: int, username: str, language: str) -> str:
    submission_dir = os.path.join(settings.TEMP_DIR, username, str(submission_id))
    os.makedirs(submission_dir, exist_ok=True)

    if language not in ext_map:
        raise ValueError(f"Unsupported language: {language}")

    file_path = os.path.join(submission_dir, f"Main.{ext_map[language]}")

    with open(file_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(source_code)

    return file_path

def delete_temp(submission_id: int, username: str) -> None:
    submission_dir = os.path.join(settings.TEMP_DIR, username, str(submission_id))

    if os.path.exists(submission_dir):
        shutil.rmtree(submission_dir)

        user_dir = os.path.join(settings.TEMP_DIR, username)
        try:
            os.rmdir(user_dir)
        except OSError:
            pass
