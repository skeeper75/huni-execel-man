#!/usr/bin/env python3
"""
Format Converter - 다양한 포맷을 TOON으로 변환

Usage:
    python format_converter.py <input_file> --to toon
    python format_converter.py data.csv --to toon [-o output.toon]
    python format_converter.py data.yaml --to toon
    python format_converter.py table.md --to toon

Supported input formats:
    - CSV (.csv)
    - YAML (.yaml, .yml)
    - Markdown tables (.md)
    - TSV (.tsv)
"""

import sys
import re
import json
import csv
from pathlib import Path
from typing import List, Dict, Any

# toon_codec에서 인코더 임포트
sys.path.insert(0, str(Path(__file__).parent))
from toon_codec import ToonEncoder


def parse_csv(content: str, delimiter: str = ',') -> List[Dict[str, Any]]:
    """CSV 문자열을 파싱하여 객체 배열로 변환"""
    lines = content.strip().split('\n')
    if not lines:
        return []
    
    reader = csv.DictReader(lines, delimiter=delimiter)
    result = []
    
    for row in reader:
        parsed_row = {}
        for key, value in row.items():
            parsed_row[key.strip()] = _parse_value(value.strip() if value else '')
        result.append(parsed_row)
    
    return result


def parse_tsv(content: str) -> List[Dict[str, Any]]:
    """TSV 문자열을 파싱"""
    return parse_csv(content, delimiter='\t')


def parse_yaml(content: str) -> Any:
    """YAML 문자열을 파싱"""
    try:
        import yaml
        return yaml.safe_load(content)
    except ImportError:
        # 간단한 YAML 파서 (기본 케이스만)
        return _simple_yaml_parse(content)


def _simple_yaml_parse(content: str) -> Any:
    """간단한 YAML 파서 (의존성 없이)"""
    lines = content.strip().split('\n')
    result = {}
    current_key = None
    current_list = None
    indent_stack = [(0, result)]
    
    for line in lines:
        if not line.strip() or line.strip().startswith('#'):
            continue
        
        # 들여쓰기 계산
        indent = len(line) - len(line.lstrip())
        stripped = line.strip()
        
        # 리스트 아이템
        if stripped.startswith('- '):
            item_content = stripped[2:].strip()
            if ':' in item_content:
                # 키-값 쌍
                key, value = item_content.split(':', 1)
                item = {key.strip(): _parse_value(value.strip())}
            else:
                item = _parse_value(item_content)
            
            if current_list is not None:
                current_list.append(item)
            continue
        
        # 키-값 쌍
        if ':' in stripped:
            key, value = stripped.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            # 적절한 부모 찾기
            while indent_stack and indent <= indent_stack[-1][0] and len(indent_stack) > 1:
                indent_stack.pop()
            
            parent = indent_stack[-1][1]
            
            if value:
                # 단순 값
                parent[key] = _parse_value(value)
                current_list = None
            else:
                # 중첩 객체 또는 리스트
                parent[key] = {}
                indent_stack.append((indent, parent[key]))
                current_list = None
                
                # 다음 줄이 리스트인지 확인
                next_line_idx = lines.index(line) + 1
                if next_line_idx < len(lines):
                    next_line = lines[next_line_idx].strip()
                    if next_line.startswith('- '):
                        parent[key] = []
                        current_list = parent[key]
    
    return result


def parse_markdown_table(content: str) -> List[Dict[str, Any]]:
    """마크다운 테이블을 파싱"""
    lines = content.strip().split('\n')
    table_lines = []
    in_table = False
    
    for line in lines:
        stripped = line.strip()
        if '|' in stripped:
            # 구분자 행 건너뛰기
            if re.match(r'^[\|\s\-:]+$', stripped):
                continue
            table_lines.append(stripped)
            in_table = True
        elif in_table and stripped:
            # 테이블 종료
            break
    
    if len(table_lines) < 2:
        return []
    
    # 헤더 파싱
    header_line = table_lines[0]
    headers = [h.strip() for h in header_line.split('|') if h.strip()]
    
    # 데이터 행 파싱
    result = []
    for line in table_lines[1:]:
        cells = [c.strip() for c in line.split('|') if c.strip()]
        row = {}
        for i, header in enumerate(headers):
            if i < len(cells):
                row[header] = _parse_value(cells[i])
            else:
                row[header] = None
        result.append(row)
    
    return result


def _parse_value(s: str) -> Any:
    """문자열을 적절한 타입으로 변환"""
    if not s or s.lower() == 'null' or s == '-':
        return None
    if s.lower() == 'true':
        return True
    if s.lower() == 'false':
        return False
    
    # 숫자
    try:
        if '.' in s:
            return float(s)
        return int(s)
    except ValueError:
        pass
    
    # 따옴표 제거
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        return s[1:-1]
    
    return s


def detect_format(filepath: str) -> str:
    """파일 확장자로 포맷 감지"""
    ext = Path(filepath).suffix.lower()
    format_map = {
        '.csv': 'csv',
        '.tsv': 'tsv',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.md': 'markdown',
        '.json': 'json'
    }
    return format_map.get(ext, 'unknown')


def convert_to_toon(data: Any, key: str = None) -> str:
    """데이터를 TOON으로 변환"""
    encoder = ToonEncoder()
    
    # 배열인 경우 키로 감싸기
    if isinstance(data, list) and key:
        data = {key: data}
    
    return encoder.encode(data)


def main():
    if len(sys.argv) < 3 or '--to' not in sys.argv:
        print(__doc__)
        sys.exit(1)
    
    input_file = sys.argv[1]
    to_idx = sys.argv.index('--to')
    target_format = sys.argv[to_idx + 1] if to_idx + 1 < len(sys.argv) else 'toon'
    
    output_file = None
    if '-o' in sys.argv:
        output_file = sys.argv[sys.argv.index('-o') + 1]
    
    # 키 이름 (배열 감싸기용)
    key_name = None
    if '-k' in sys.argv or '--key' in sys.argv:
        key_idx = sys.argv.index('-k') if '-k' in sys.argv else sys.argv.index('--key')
        key_name = sys.argv[key_idx + 1]
    else:
        key_name = Path(input_file).stem  # 파일명을 키로 사용
    
    # 파일 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 포맷 감지 및 파싱
    source_format = detect_format(input_file)
    
    if source_format == 'csv':
        data = parse_csv(content)
    elif source_format == 'tsv':
        data = parse_tsv(content)
    elif source_format == 'yaml':
        data = parse_yaml(content)
    elif source_format == 'markdown':
        data = parse_markdown_table(content)
    elif source_format == 'json':
        data = json.loads(content)
    else:
        print(f"❌ Unsupported format: {source_format}")
        sys.exit(1)
    
    # TOON으로 변환
    if target_format == 'toon':
        result = convert_to_toon(data, key_name if isinstance(data, list) else None)
    else:
        print(f"❌ Unsupported target format: {target_format}")
        sys.exit(1)
    
    # 출력
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"✅ Converted {source_format.upper()} → TOON: {output_file}")
    else:
        print(result)


if __name__ == "__main__":
    main()
