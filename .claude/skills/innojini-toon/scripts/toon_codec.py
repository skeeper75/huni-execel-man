#!/usr/bin/env python3
"""
TOON Codec - JSON ↔ TOON 변환기

Usage:
    python toon_codec.py encode <input.json> [-o output.toon]
    python toon_codec.py decode <input.toon> [-o output.json]
    python toon_codec.py analyze <input.json>
    echo '{"name":"Alice"}' | python toon_codec.py encode -
"""

import json
import sys
import re
from typing import Any, List, Dict, Union
from pathlib import Path

# 타입 정의
JsonValue = Union[None, bool, int, float, str, List[Any], Dict[str, Any]]

# =============================================================================
# TOON ENCODER
# =============================================================================

class ToonEncoder:
    """JSON → TOON 변환기"""
    
    def __init__(self, indent: int = 2, delimiter: str = ','):
        self.indent = indent
        self.delimiter = delimiter
    
    def encode(self, value: JsonValue) -> str:
        """JSON 값을 TOON 문자열로 변환"""
        if value is None:
            return 'null'
        if isinstance(value, bool):
            return 'true' if value else 'false'
        if isinstance(value, (int, float)):
            return self._encode_number(value)
        if isinstance(value, str):
            return self._quote_if_needed(value)
        if isinstance(value, list):
            return self._encode_root_array(value)
        if isinstance(value, dict):
            return self._encode_object(value, 0)
        return str(value)
    
    def _encode_number(self, n: Union[int, float]) -> str:
        """숫자를 문자열로 변환 (과학 표기법 방지)"""
        if isinstance(n, float):
            if n != n:  # NaN
                return 'null'
            if n == float('inf') or n == float('-inf'):
                return 'null'
            # 정수로 표현 가능하면 정수로
            if n == int(n) and abs(n) < 1e15:
                return str(int(n))
            return f'{n:g}'
        return str(n)
    
    def _quote_if_needed(self, s: str) -> str:
        """필요시 문자열에 따옴표 추가"""
        if not s:
            return '""'
        
        # 따옴표가 필요한 경우들
        needs_quote = False
        
        # 앞뒤 공백
        if s != s.strip():
            needs_quote = True
        # 구분자, 콜론 포함
        elif self.delimiter in s or ':' in s:
            needs_quote = True
        # 따옴표, 백슬래시, 제어문자
        elif '"' in s or '\\' in s or any(ord(c) < 32 for c in s):
            needs_quote = True
        # 불리언/null/숫자처럼 보이는 경우
        elif s.lower() in ('true', 'false', 'null'):
            needs_quote = True
        elif self._looks_like_number(s):
            needs_quote = True
        # 리스트 아이템처럼 보이는 경우
        elif s.startswith('- '):
            needs_quote = True
        # 구조적 토큰처럼 보이는 경우
        elif re.match(r'^\[[\d\s,|]*\]', s) or re.match(r'^\{[\w,]*\}', s):
            needs_quote = True
        
        if needs_quote:
            escaped = s.replace('\\', '\\\\').replace('"', '\\"')
            escaped = escaped.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            return f'"{escaped}"'
        return s
    
    def _looks_like_number(self, s: str) -> bool:
        """문자열이 숫자처럼 보이는지 확인"""
        try:
            float(s)
            return True
        except ValueError:
            return False
    
    def _encode_object(self, obj: Dict[str, Any], depth: int) -> str:
        """객체를 TOON으로 인코딩"""
        if not obj:
            return ''
        
        lines = []
        prefix = ' ' * (self.indent * depth)
        
        for key, value in obj.items():
            quoted_key = self._quote_key(key)
            
            if isinstance(value, dict):
                if not value:
                    lines.append(f'{prefix}{quoted_key}:')
                else:
                    lines.append(f'{prefix}{quoted_key}:')
                    lines.append(self._encode_object(value, depth + 1))
            elif isinstance(value, list):
                array_str = self._encode_array(value, depth)
                lines.append(f'{prefix}{quoted_key}{array_str}')
            else:
                encoded_value = self.encode(value)
                lines.append(f'{prefix}{quoted_key}: {encoded_value}')
        
        return '\n'.join(lines)
    
    def _quote_key(self, key: str) -> str:
        """객체 키에 따옴표 추가 (필요시)"""
        if not key:
            return '""'
        # 유효한 식별자 패턴
        if re.match(r'^[a-zA-Z_][a-zA-Z0-9_.]*$', key):
            return key
        escaped = key.replace('\\', '\\\\').replace('"', '\\"')
        return f'"{escaped}"'
    
    def _encode_array(self, arr: List[Any], depth: int) -> str:
        """배열을 TOON으로 인코딩"""
        n = len(arr)
        
        if n == 0:
            return '[0]:'
        
        # 원시값 배열인지 확인
        if all(not isinstance(item, (dict, list)) for item in arr):
            values = self.delimiter.join(self.encode(item) for item in arr)
            return f'[{n}]: {values}'
        
        # 균일 객체 배열인지 확인 (테이블 형식 가능)
        if self._is_uniform_object_array(arr):
            return self._encode_tabular_array(arr, depth)
        
        # 혼합/비균일 배열 (리스트 형식)
        return self._encode_list_array(arr, depth)
    
    def _is_uniform_object_array(self, arr: List[Any]) -> bool:
        """균일 객체 배열인지 확인 (모든 객체가 동일한 키, 원시값만)"""
        if not arr or not all(isinstance(item, dict) for item in arr):
            return False
        
        first_keys = set(arr[0].keys())
        for item in arr:
            if set(item.keys()) != first_keys:
                return False
            # 모든 값이 원시값인지 확인
            for v in item.values():
                if isinstance(v, (dict, list)):
                    return False
        return True
    
    def _encode_tabular_array(self, arr: List[Dict], depth: int) -> str:
        """균일 객체 배열을 테이블 형식으로 인코딩"""
        n = len(arr)
        fields = list(arr[0].keys())
        field_header = self.delimiter.join(fields)
        
        lines = [f'[{n}]{{{field_header}}}:']
        prefix = ' ' * (self.indent * (depth + 1))
        
        for item in arr:
            row_values = self.delimiter.join(self.encode(item[f]) for f in fields)
            lines.append(f'{prefix}{row_values}')
        
        return '\n'.join(lines)
    
    def _encode_list_array(self, arr: List[Any], depth: int) -> str:
        """혼합/비균일 배열을 리스트 형식으로 인코딩"""
        n = len(arr)
        lines = [f'[{n}]:']
        prefix = ' ' * (self.indent * (depth + 1))
        
        for item in arr:
            if isinstance(item, dict):
                if not item:
                    lines.append(f'{prefix}-')
                else:
                    # 첫 번째 필드를 하이픈 라인에 배치
                    first_key = next(iter(item))
                    first_value = item[first_key]
                    
                    if isinstance(first_value, (dict, list)):
                        lines.append(f'{prefix}- {self._quote_key(first_key)}:')
                        if isinstance(first_value, dict):
                            lines.append(self._encode_object(first_value, depth + 2))
                        else:
                            array_str = self._encode_array(first_value, depth + 2)
                            lines.append(f'{" " * (self.indent * (depth + 2))}{array_str}')
                    else:
                        lines.append(f'{prefix}- {self._quote_key(first_key)}: {self.encode(first_value)}')
                    
                    # 나머지 필드들
                    for key in list(item.keys())[1:]:
                        value = item[key]
                        inner_prefix = ' ' * (self.indent * (depth + 1)) + '  '
                        if isinstance(value, (dict, list)):
                            lines.append(f'{inner_prefix}{self._quote_key(key)}:')
                            if isinstance(value, dict):
                                lines.append(self._encode_object(value, depth + 2))
                            else:
                                array_str = self._encode_array(value, depth + 2)
                                lines.append(f'{" " * (self.indent * (depth + 2))}{array_str}')
                        else:
                            lines.append(f'{inner_prefix}{self._quote_key(key)}: {self.encode(value)}')
            elif isinstance(item, list):
                array_str = self._encode_array(item, depth + 1)
                lines.append(f'{prefix}- {array_str}')
            else:
                lines.append(f'{prefix}- {self.encode(item)}')
        
        return '\n'.join(lines)
    
    def _encode_root_array(self, arr: List[Any]) -> str:
        """루트 레벨 배열 인코딩"""
        return self._encode_array(arr, -1)


# =============================================================================
# TOON DECODER
# =============================================================================

class ToonDecoder:
    """TOON → JSON 변환기"""
    
    def __init__(self, indent: int = 2, strict: bool = True):
        self.indent = indent
        self.strict = strict
    
    def decode(self, toon: str) -> JsonValue:
        """TOON 문자열을 JSON 값으로 변환"""
        lines = toon.strip().split('\n')
        if not lines or not lines[0].strip():
            return {}
        
        return self._parse_value(lines, 0, 0)[0]
    
    def _parse_value(self, lines: List[str], start: int, depth: int) -> tuple:
        """값 파싱 (재귀)"""
        if start >= len(lines):
            return None, start
        
        line = lines[start]
        stripped = line.strip()
        
        if not stripped:
            return None, start + 1
        
        # 루트 배열
        if stripped.startswith('['):
            return self._parse_array_header(lines, start, depth)
        
        # 객체 또는 키-값
        return self._parse_object(lines, start, depth)
    
    def _parse_object(self, lines: List[str], start: int, depth: int) -> tuple:
        """객체 파싱"""
        obj = {}
        i = start
        expected_indent = depth * self.indent
        
        while i < len(lines):
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            
            # 현재 들여쓰기 계산
            current_indent = len(line) - len(line.lstrip())
            
            # 들여쓰기가 예상보다 작으면 이 객체 종료
            if current_indent < expected_indent and i > start:
                break
            
            # 리스트 아이템이면 종료
            if line.lstrip().startswith('- '):
                break
            
            stripped = line.strip()
            
            # 키-값 파싱
            key, value_part = self._parse_key_value(stripped)
            if key is None:
                i += 1
                continue
            
            # 배열 헤더 확인
            array_match = re.match(r'^(.+?)(\[(\d+)([,|\t\s]?)\](\{([^}]+)\})?):(.*)$', stripped)
            if array_match:
                key = self._unquote(array_match.group(1))
                length = int(array_match.group(3))
                delimiter = array_match.group(4) or ','
                if delimiter in ('\t', ' ', ''):
                    delimiter = '\t' if '\t' in (array_match.group(7) or '') else ','
                fields = array_match.group(6)
                inline_values = array_match.group(7).strip() if array_match.group(7) else ''
                
                if fields:
                    # 테이블 형식
                    field_list = [f.strip() for f in fields.split(delimiter if delimiter != '\t' else ',')]
                    obj[key], i = self._parse_tabular_rows(lines, i + 1, length, field_list, delimiter, depth + 1)
                elif inline_values:
                    # 인라인 원시 배열
                    obj[key] = self._parse_inline_array(inline_values, delimiter)
                    i += 1
                else:
                    # 리스트 형식 배열
                    obj[key], i = self._parse_list_array(lines, i + 1, length, depth + 1)
            elif value_part == '':
                # 중첩 객체
                obj[key], i = self._parse_object(lines, i + 1, depth + 1)
            else:
                # 단순 값
                obj[key] = self._parse_primitive(value_part)
                i += 1
        
        return obj, i
    
    def _parse_key_value(self, line: str) -> tuple:
        """키-값 쌍 파싱"""
        # 따옴표로 시작하는 키
        if line.startswith('"'):
            match = re.match(r'^"((?:[^"\\]|\\.)*)"\s*:', line)
            if match:
                key = self._unescape(match.group(1))
                value = line[match.end():].strip()
                return key, value
        
        # 일반 키
        colon_pos = line.find(':')
        if colon_pos > 0:
            key_part = line[:colon_pos]
            # 배열 헤더가 있을 수 있음
            bracket_pos = key_part.find('[')
            if bracket_pos > 0:
                key = key_part[:bracket_pos]
            else:
                key = key_part
            value = line[colon_pos + 1:].strip()
            return key.strip(), value
        
        return None, None
    
    def _parse_tabular_rows(self, lines: List[str], start: int, length: int, fields: List[str], delimiter: str, depth: int) -> tuple:
        """테이블 행 파싱"""
        arr = []
        i = start
        expected_indent = depth * self.indent
        
        while i < len(lines) and len(arr) < length:
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            
            current_indent = len(line) - len(line.lstrip())
            if current_indent < expected_indent:
                break
            
            values = self._split_row(line.strip(), delimiter)
            obj = {}
            for j, field in enumerate(fields):
                if j < len(values):
                    obj[field] = self._parse_primitive(values[j])
                else:
                    obj[field] = None
            arr.append(obj)
            i += 1
        
        return arr, i
    
    def _parse_list_array(self, lines: List[str], start: int, length: int, depth: int) -> tuple:
        """리스트 형식 배열 파싱"""
        arr = []
        i = start
        expected_indent = depth * self.indent
        
        while i < len(lines) and len(arr) < length:
            line = lines[i]
            if not line.strip():
                i += 1
                continue
            
            stripped = line.strip()
            if not stripped.startswith('- '):
                break
            
            item_content = stripped[2:].strip()
            
            # 키-값 쌍인지 확인
            if ':' in item_content:
                colon_pos = item_content.find(':')
                key = item_content[:colon_pos].strip()
                value = item_content[colon_pos + 1:].strip()
                
                if value:
                    arr.append({self._unquote(key): self._parse_primitive(value)})
                else:
                    # 중첩 구조
                    nested_obj, i = self._parse_object(lines, i + 1, depth + 1)
                    arr.append({self._unquote(key): nested_obj})
                    continue
            else:
                arr.append(self._parse_primitive(item_content))
            
            i += 1
        
        return arr, i
    
    def _parse_inline_array(self, values_str: str, delimiter: str) -> List:
        """인라인 배열 파싱"""
        if not values_str:
            return []
        values = self._split_row(values_str, delimiter)
        return [self._parse_primitive(v) for v in values]
    
    def _split_row(self, row: str, delimiter: str) -> List[str]:
        """행을 구분자로 분리 (따옴표 처리)"""
        result = []
        current = ''
        in_quotes = False
        escape_next = False
        
        for char in row:
            if escape_next:
                current += char
                escape_next = False
            elif char == '\\':
                current += char
                escape_next = True
            elif char == '"':
                current += char
                in_quotes = not in_quotes
            elif char == delimiter and not in_quotes:
                result.append(current.strip())
                current = ''
            else:
                current += char
        
        result.append(current.strip())
        return result
    
    def _parse_primitive(self, s: str) -> JsonValue:
        """원시값 파싱"""
        s = s.strip()
        
        if not s:
            return None
        
        # null
        if s == 'null':
            return None
        
        # boolean
        if s == 'true':
            return True
        if s == 'false':
            return False
        
        # 따옴표 문자열
        if s.startswith('"') and s.endswith('"'):
            return self._unescape(s[1:-1])
        
        # 숫자
        try:
            if '.' in s or 'e' in s.lower():
                return float(s)
            return int(s)
        except ValueError:
            pass
        
        # 일반 문자열
        return s
    
    def _unquote(self, s: str) -> str:
        """따옴표 제거"""
        s = s.strip()
        if s.startswith('"') and s.endswith('"'):
            return self._unescape(s[1:-1])
        return s
    
    def _unescape(self, s: str) -> str:
        """이스케이프 시퀀스 처리"""
        return s.replace('\\n', '\n').replace('\\r', '\r').replace('\\t', '\t').replace('\\"', '"').replace('\\\\', '\\')


# =============================================================================
# TOKEN ANALYZER
# =============================================================================

def estimate_tokens(text: str) -> int:
    """토큰 수 추정 (GPT 스타일)"""
    # 간단한 추정: 4자당 1토큰, 공백/구두점 추가 계산
    chars = len(text)
    words = len(text.split())
    return max(chars // 4, words)

def analyze_efficiency(json_data: JsonValue) -> dict:
    """JSON vs TOON 토큰 효율성 분석"""
    json_str = json.dumps(json_data, ensure_ascii=False)
    json_compact = json.dumps(json_data, ensure_ascii=False, separators=(',', ':'))
    
    encoder = ToonEncoder()
    toon_str = encoder.encode(json_data)
    
    json_tokens = estimate_tokens(json_str)
    json_compact_tokens = estimate_tokens(json_compact)
    toon_tokens = estimate_tokens(toon_str)
    
    return {
        'json_formatted': {
            'chars': len(json_str),
            'tokens': json_tokens
        },
        'json_compact': {
            'chars': len(json_compact),
            'tokens': json_compact_tokens
        },
        'toon': {
            'chars': len(toon_str),
            'tokens': toon_tokens
        },
        'savings': {
            'vs_formatted': f'{(1 - toon_tokens / json_tokens) * 100:.1f}%' if json_tokens > 0 else 'N/A',
            'vs_compact': f'{(1 - toon_tokens / json_compact_tokens) * 100:.1f}%' if json_compact_tokens > 0 else 'N/A'
        }
    }


# =============================================================================
# CLI
# =============================================================================

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'encode':
        if len(sys.argv) < 3:
            print("Usage: toon_codec.py encode <input.json> [-o output.toon]")
            sys.exit(1)
        
        input_file = sys.argv[2]
        output_file = None
        if '-o' in sys.argv:
            output_file = sys.argv[sys.argv.index('-o') + 1]
        
        # 입력 읽기
        if input_file == '-':
            data = json.load(sys.stdin)
        else:
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        # 변환
        encoder = ToonEncoder()
        result = encoder.encode(data)
        
        # 출력
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(result)
            print(f"✅ Encoded to {output_file}")
        else:
            print(result)
    
    elif command == 'decode':
        if len(sys.argv) < 3:
            print("Usage: toon_codec.py decode <input.toon> [-o output.json]")
            sys.exit(1)
        
        input_file = sys.argv[2]
        output_file = None
        if '-o' in sys.argv:
            output_file = sys.argv[sys.argv.index('-o') + 1]
        
        # 입력 읽기
        if input_file == '-':
            toon_str = sys.stdin.read()
        else:
            with open(input_file, 'r', encoding='utf-8') as f:
                toon_str = f.read()
        
        # 변환
        decoder = ToonDecoder()
        result = decoder.decode(toon_str)
        
        # 출력
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"✅ Decoded to {output_file}")
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif command == 'analyze':
        if len(sys.argv) < 3:
            print("Usage: toon_codec.py analyze <input.json>")
            sys.exit(1)
        
        input_file = sys.argv[2]
        
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        analysis = analyze_efficiency(data)
        
        print("📊 Token Efficiency Analysis")
        print("=" * 40)
        print(f"JSON (formatted): {analysis['json_formatted']['tokens']} tokens ({analysis['json_formatted']['chars']} chars)")
        print(f"JSON (compact):   {analysis['json_compact']['tokens']} tokens ({analysis['json_compact']['chars']} chars)")
        print(f"TOON:             {analysis['toon']['tokens']} tokens ({analysis['toon']['chars']} chars)")
        print("-" * 40)
        print(f"Savings vs formatted: {analysis['savings']['vs_formatted']}")
        print(f"Savings vs compact:   {analysis['savings']['vs_compact']}")
        
        # TOON 출력 미리보기
        encoder = ToonEncoder()
        toon_result = encoder.encode(data)
        print("\n📄 TOON Preview:")
        print("-" * 40)
        preview = toon_result[:500] + ('...' if len(toon_result) > 500 else '')
        print(preview)
    
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
