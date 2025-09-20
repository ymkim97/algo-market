import os

from judge.config import settings

def resolve_host_volume_path(path: str) -> str:
    # 컨테이너 내부 경로를 호스트 경로로 변환한다.
    abs_path = os.path.abspath(path)

    mapping = (
        (settings.TEMP_DIR, settings.TEMP_DIR_HOST),
        (settings.PROBLEM_DIR, settings.PROBLEM_DIR_HOST),
    )

    for container_root, host_root in mapping:
        try:
            common_path = os.path.commonpath([container_root, abs_path])
        except ValueError:
            # 서로 다른 드라이브일 때 commonpath에서 ValueError 발생
            continue

        if common_path == container_root:
            relative = os.path.relpath(abs_path, container_root)
            return os.path.normpath(os.path.join(host_root, relative))

    # 매핑되지 않으면 원본 경로를 그대로 사용한다.
    return abs_path
