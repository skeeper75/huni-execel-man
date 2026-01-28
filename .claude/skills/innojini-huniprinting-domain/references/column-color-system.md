# Column Color System (컬럼 색상 체계)

## Contents
- Overview
- Product Master Colors
- Price Table Colors
- Color Extraction Code
- Best Practices

---

## Overview

후니프린팅 엑셀 파일에서 색상은 **데이터의 역할과 성격**을 나타내는 핵심 메타데이터입니다.
색상을 무시하고 데이터만 추출하면 필수/선택, 입력/계산 구분이 불가능합니다.

---

## Product Master Colors (상품마스터)

### Sheet Tab Colors (시트 탭 색상)

| Hex Code | 색상 | 역할 | 시트 예시 | 주의사항 |
|----------|------|------|----------|---------|
| `FFE36C09` | 🟠 Orange | 마스터/매핑 | MAP | 핵심 참조 테이블 |
| `FFFF0000` | 🔴 Red | 참조 데이터 | !디지털인쇄용지 | **수정 주의** |
| `FF6AA84F` | 🟢 Green | 외부 채널 | 비즈하우스, 후지필름, 스토어 | 채널별 매핑 |
| `FF00B050` | 🟢 Green (alt) | 외부 채널 | (동일) | 버전에 따라 다름 |
| (없음) | ⬜ Default | 핵심 상품 | 디지털인쇄, 스티커, 책자 등 | 주요 작업 대상 |

### Column Header Colors (컬럼 헤더 색상)

#### 디지털인쇄 시트 기준

| Hex Code | 색상명 | 의미 | 해당 컬럼 | 개발 시 처리 |
|----------|-------|------|----------|-------------|
| `FFC4BD97` | 🟤 베이지 | 시스템 필수 필드 | 구분, code, MES ITEM_CD, 상품명, 판수, 종이, 인쇄(4도), 코팅, 커팅가공, 접지가공, 추가상품, 수량 | `required: true` |
| `FFD8D8D8` | ⬜ 회색 | 사용자 옵션 | 사이즈옵션 | `user_selectable: true` |
| `FF93C47D` | 🟢 연두 | 계산/작업 사이즈 | 블리드, 작업사이즈, 재단사이즈, 출력용지규격, 파일명약어, 출력파일, 인쇄방법 | `calculated: true` 또는 `internal: true` |
| `FFF6B26B` | 🟠 주황 | 기능 옵션 | 업로드, 편집기, 모서리, 오시, 미싱, 가변(텍스트), 가변(이미지) | `feature_option: true` |
| `FFE06666` | 🔴 빨강 | 별색 인쇄 옵션 | 화이트별색, 클리어별색, 핑크별색, 금별색, 은별색 | `special_color: true` |
| `FFFABF8F` | 🟡 살구 | 박/형압 가공 | 박/형압 가공, 박크기, 박칼라 | `finishing_foil: true` |
| `FF6D9EEB` | 🔵 파랑 | 수량 관련 | 건수유무, 제작수량(최소), 제작수량(최대), 제작수량(증가폭) | `quantity_config: true` |

#### 데이터 셀 색상

| Hex Code | 색상명 | 의미 | 처리 |
|----------|-------|------|------|
| `FFFFFF00` | 🟨 노랑 | 주의/수정 필요 | 검토 대상으로 마킹 |
| `00000000` | (투명) | 일반 데이터 | 정상 처리 |

### MAP 시트 컬럼 색상

| Hex Code | 색상명 | 의미 | 해당 컬럼 |
|----------|-------|------|----------|
| `FFDAEEF3` | 💙 연한 파랑 | 1차 카테고리 (01~07) | 01 엽서, 02 스티커, 03 인쇄홍보물, 04 포스터, 05 사인, 06 책자, 07 캘린더 |
| `FFFBD4B4` | 🟠 살구 | 2차 카테고리 (08~11) | 08 문구, 09 아크릴, 10 라이프, 11 에코백 |
| `FF00B0F0` | 🔵 하늘 | 3차 카테고리 (12~) | 12 포장 |

---

## Price Table Colors (인쇄가격표)

### Sheet Tab Colors

| Hex Code | 색상 | 역할 | 시트 예시 |
|----------|------|------|----------|
| `FFFF9900` | 🟠 Orange | 핵심 가격표 | 디지털용지, 디지털출력비, 후가공 |
| `FFFF0000` | 🔴 Red | 참조 데이터 | 옵션결합상품 |
| `FF00FF00` | 🟢 Green | 수정 중/임시 | 디지털출력비가수정 |
| (없음) | ⬜ Default | 일반 가격표 | 명함, 제본, 스티커 등 |

### Column Structure by Sheet

#### 디지털출력비 시트

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│  A열    │  B열    │  C열    │  D열    │  E열    │  F열    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 수량    │ 없음    │ 단면1도 │ 양면1도 │ 단면칼라│ 양면칼라│
│ (티어)  │         │         │ =C×2   │         │ =E×2   │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 1       │         │ 400     │ 800     │ 2000    │ 4000    │
│ 2       │         │ 400     │ 800     │ 1200    │ 2400    │
│ 5       │         │ 400     │ 800     │ 1200    │ 2400    │
│ 10      │         │ 200     │ 400     │ 1000    │ 2000    │
│ ...     │         │ ...     │ ...     │ ...     │ ...     │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

※ 수식 패턴: 양면 = 단면 × 2
```

#### 후가공 시트

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ 1행     │ 미싱    │ 없음    │ 1줄     │ 2줄     │ 3줄     │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 2행     │ (코드)  │ 0       │ 10      │ 20      │ 30      │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 3행~    │ 수량    │ -       │ 단가    │ 단가    │ 단가    │
│ 수량1   │ 1       │ -       │ 4500    │ 5000    │ 5500    │
│ 수량10  │ 10      │ -       │ 500     │ 800     │ 1000    │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

※ 1행: 후가공 종류
※ 2행: 옵션 코드
※ 3행~: 수량별 단가 매트릭스
```

---

## Color Extraction Code

### Python (openpyxl)

```python
from openpyxl import load_workbook
from openpyxl.styles import PatternFill

def extract_colors(filepath, sheet_name):
    """시트의 모든 색상 정보 추출"""
    wb = load_workbook(filepath)
    ws = wb[sheet_name]
    
    # 탭 색상
    tab_color = ws.sheet_properties.tabColor
    tab_hex = tab_color.rgb if tab_color else None
    
    # 컬럼 헤더 색상 (1행)
    header_colors = {}
    for col in range(1, ws.max_column + 1):
        cell = ws.cell(row=1, column=col)
        fill = cell.fill
        
        if fill.fgColor and fill.fgColor.rgb:
            color = fill.fgColor.rgb
            header = cell.value
            
            if color not in header_colors:
                header_colors[color] = []
            header_colors[color].append(header)
    
    return {
        "tab_color": tab_hex,
        "header_colors": header_colors
    }

# 색상 의미 매핑
COLOR_MEANINGS = {
    # 시트 탭
    "FFE36C09": "master_mapping",
    "FFFF0000": "reference_data",
    "FF6AA84F": "external_channel",
    "FF00B050": "external_channel",
    
    # 컬럼 헤더 (상품마스터)
    "FFC4BD97": "system_required",
    "FFD8D8D8": "user_option",
    "FF93C47D": "calculated_internal",
    "FFF6B26B": "feature_option",
    "FFE06666": "special_color_print",
    "FFFABF8F": "foil_finishing",
    "FF6D9EEB": "quantity_config",
    
    # 컬럼 헤더 (MAP)
    "FFDAEEF3": "category_level_1",
    "FFFBD4B4": "category_level_2",
    "FF00B0F0": "category_level_3",
    
    # 데이터 셀
    "FFFFFF00": "attention_needed",
}

def get_color_meaning(hex_code):
    """색상 코드의 의미 반환"""
    return COLOR_MEANINGS.get(hex_code, "unknown")
```

### 색상 기반 스키마 생성

```python
def generate_schema_from_colors(header_colors):
    """색상 정보를 기반으로 스키마 생성"""
    schema = {"columns": []}
    
    for color, headers in header_colors.items():
        meaning = get_color_meaning(color)
        
        for header in headers:
            col_schema = {
                "name": header,
                "color": color,
                "role": meaning,
            }
            
            # 역할에 따른 속성 추가
            if meaning == "system_required":
                col_schema["required"] = True
            elif meaning == "user_option":
                col_schema["user_selectable"] = True
            elif meaning == "calculated_internal":
                col_schema["internal"] = True
            elif meaning == "quantity_config":
                col_schema["quantity_related"] = True
            
            schema["columns"].append(col_schema)
    
    return schema
```

---

## Best Practices

### DO ✅

1. **색상을 메타데이터로 활용**
   - ETL 시 색상 정보를 함께 추출
   - 스키마 생성 시 색상 기반 속성 자동 지정

2. **색상 변경 감지**
   - 버전 비교 시 색상 변경 여부 체크
   - 의미 변경 가능성 알림

3. **색상 매핑 테이블 유지**
   - `COLOR_MEANINGS` 딕셔너리 중앙 관리
   - 새 색상 발견 시 기록

### DON'T ❌

1. **색상 무시하고 데이터만 추출**
   - 필수/선택 구분 불가
   - 계산 필드 식별 불가

2. **색상 임의 변경**
   - 기존 컨벤션 훼손
   - 다른 작업자 혼란

3. **하드코딩된 색상 의미**
   - 매핑 테이블 없이 코드에 직접 작성
   - 유지보수 어려움

---

## Reference: Full Color Palette

### 상품마스터 전체 색상

```
시트 탭:
├── FFE36C09 (Orange)    → 마스터/매핑
├── FFFF0000 (Red)       → 참조 데이터
├── FF6AA84F (Green)     → 외부 채널
└── (Default)            → 핵심 상품

컬럼 헤더:
├── FFC4BD97 (Beige)     → 시스템 필수
├── FFD8D8D8 (Gray)      → 사용자 옵션
├── FF93C47D (Light Green) → 계산/내부
├── FFF6B26B (Orange)    → 기능 옵션
├── FFE06666 (Red)       → 별색 인쇄
├── FFFABF8F (Peach)     → 박/형압
├── FF6D9EEB (Blue)      → 수량 관련
├── FFDAEEF3 (Light Blue) → MAP 1차 카테고리
├── FFFBD4B4 (Light Peach) → MAP 2차 카테고리
└── FF00B0F0 (Sky Blue)  → MAP 3차 카테고리

데이터 셀:
├── FFFFFF00 (Yellow)    → 주의/수정 필요
└── 00000000 (Transparent) → 일반 데이터
```

### 인쇄가격표 전체 색상

```
시트 탭:
├── FFFF9900 (Orange)    → 핵심 가격표
├── FFFF0000 (Red)       → 참조 데이터
├── FF00FF00 (Green)     → 수정 중/임시
└── (Default)            → 일반 가격표
```
