import os

import pytest

from judge.path_utils import resolve_host_volume_path
from judge.config import settings


def test_resolve_temp_dir(monkeypatch):
    monkeypatch.setattr(settings, "TEMP_DIR", "/app/temp_dir")
    monkeypatch.setattr(settings, "TEMP_DIR_HOST", "/var/lib/judge/temp_dir")
    monkeypatch.setattr(settings, "PROBLEM_DIR", "/app/problems")
    monkeypatch.setattr(settings, "PROBLEM_DIR_HOST", "/var/lib/judge/problems")

    path = "/app/temp_dir/user/123"
    result = resolve_host_volume_path(path)

    assert result == "/var/lib/judge/temp_dir/user/123"


def test_resolve_problem_dir(monkeypatch):
    monkeypatch.setattr(settings, "TEMP_DIR", "/app/temp_dir")
    monkeypatch.setattr(settings, "TEMP_DIR_HOST", "/var/lib/judge/temp_dir")
    monkeypatch.setattr(settings, "PROBLEM_DIR", "/app/problems")
    monkeypatch.setattr(settings, "PROBLEM_DIR_HOST", "/var/lib/judge/problems")

    path = "/app/problems/42/test_data/input1.in"
    result = resolve_host_volume_path(path)

    assert result == "/var/lib/judge/problems/42/test_data/input1.in"


def test_resolve_non_mapped(monkeypatch):
    monkeypatch.setattr(settings, "TEMP_DIR", "/app/temp_dir")
    monkeypatch.setattr(settings, "TEMP_DIR_HOST", "/var/lib/judge/temp_dir")
    monkeypatch.setattr(settings, "PROBLEM_DIR", "/app/problems")
    monkeypatch.setattr(settings, "PROBLEM_DIR_HOST", "/var/lib/judge/problems")

    path = "/some/other/path"
    result = resolve_host_volume_path(path)

    assert result == os.path.abspath(path)
