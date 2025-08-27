from judge.config import settings
from typing import List, Tuple

import boto3
import logging
import os
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_test_data(problem_id: int) -> Tuple[List[str], List[str]]:
    problem_dir = os.path.join(settings.PROBLEM_DIR, str(problem_id), "test_data")

    if not os.path.isdir(problem_dir) or not os.listdir(problem_dir):
        _download_test_data_from_s3(problem_id, problem_dir)

    filenames = os.listdir(problem_dir)
    ins, outs = _sort_test_files(filenames)

    if len(ins) != len(outs):
        raise ValueError(f"Mismatched number of input ({len(ins)}) and output ({len(outs)}) files for problem {problem_id}")

    return _read_test_file_pairs(problem_dir, ins, outs)

def _download_test_data_from_s3(problem_id: int, problem_dir: str) -> None:
    s3 = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key
    )
    bucket_name = settings.s3_bucket_name
    
    logger.info(f"Fetching test data from S3 for problem_id={problem_id}")
    os.makedirs(problem_dir, exist_ok=True)
    
    s3_objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=settings.s3_test_data_prefix.format(problem_id=problem_id))
    found_any = False
    if 'Contents' in s3_objects:
        for obj in s3_objects['Contents']:
            found_any = True
            file_key = obj['Key']
            file_name = os.path.basename(file_key)
            local_file_path = os.path.join(problem_dir, file_name)
            s3.download_file(bucket_name, file_key, local_file_path)

    if not found_any:
        raise ValueError(f"No test data found for problem {problem_id}")

def _sort_test_files(filenames: List[str]) -> Tuple[List[str], List[str]]:
    if not filenames:
        raise ValueError("No test files found.")

    _CASE_RE = re.compile(r"^.+-(\d+)\.(in|out)$")

    def get_test_case_number(filename: str) -> int:
        m = _CASE_RE.match(filename)

        if not m:
            raise ValueError(f"Invalid test filename: {filename}. Expected '<name>-<N>.in|.out'")

        return int(m.group(1))

    ins = sorted([f for f in filenames if f.endswith(".in")], key=get_test_case_number)
    outs = sorted([f for f in filenames if f.endswith(".out")], key=get_test_case_number)

    in_nums = [get_test_case_number(f) for f in ins]
    out_nums = [get_test_case_number(f) for f in outs]

    if in_nums != out_nums:
        raise ValueError(f"Mismatched test case numbering: inputs={in_nums}, outputs={out_nums}")

    return ins, outs

def _read_test_file_pairs(problem_dir: str, ins: List[str], outs: List[str]) -> Tuple[List[str], List[str]]:
    in_test_data = []
    out_test_data = []
    
    for inp, out in zip(ins, outs):
        with open(os.path.join(problem_dir, inp), "r", encoding="utf-8") as f:
            input_data = f.read()
        with open(os.path.join(problem_dir, out), "r", encoding="utf-8") as f:
            output_data = f.read()
        
        in_test_data.append(input_data)
        out_test_data.append(output_data)
    
    return in_test_data, out_test_data
