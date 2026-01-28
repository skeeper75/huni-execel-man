# Price Validation Checklist

## Contents
- Priority Checklist
- Cross-File Validation (NEW)
- Boundary Test Cases
- Common Error Patterns
- Paper Name Discrepancy Patterns (NEW)
- Report Template
- Script Usage

---

## Priority Checklist

### P0 - Deployment Blockers (Must Fix)

| Item | Detection Method | Script | 자동화 |
|------|-----------------|--------|-------|
| Excel formula errors (#REF!, #DIV/0!) | validate_price_sheet.py | ✅ | ✅ |
| Quantity-price inversion (qty↑ → price↑) | Manual + script | ✅ | ✅ |
| Negative prices | validate_price_sheet.py | ✅ | ✅ |
| Zero prices (unintended) | Manual verification | ⚠️ | ⚠️ |
| NULL prices (required fields) | validate_schema.py | ✅ | ✅ |

### P1 - Pre-deployment (Should Fix)

| Item | Detection Method | Script | 자동화 |
|------|-----------------|--------|-------|
| Discount tier boundary accuracy | Boundary tests | ✅ | ✅ |
| Discount rate monotonic increase | validate_schema.py | ✅ | ✅ |
| Option combination completeness | Cross-tab analysis | ⚠️ | ⚠️ |
| Formula copy consistency | openpyxl analysis | ⚠️ | ⚠️ |
| **Paper name cross-validation (NEW)** | validate_paper_names.py | ✅ | ✅ |

### P2 - Periodic (Should Monitor)

| Item | Detection Method | Script | 자동화 |
|------|-----------------|--------|-------|
| Version regression tests | diff comparison | ✅ | ✅ |
| Cross-sheet reference integrity | Reference tracing | ⚠️ | ⚠️ |
| Hidden row/column audit | Manual | ❌ | ❌ |
| **Tab color consistency (NEW)** | Color extraction | ✅ | ✅ |

---

## Cross-File Validation (NEW)

### Paper Name Validation

두 파일 간 용지명 정합성 검증은 가격 계산의 핵심입니다.

#### 검증 항목

| 항목 | 설명 | 심각도 |
|------|------|-------|
| 마스터에만 존재하는 용지 | 가격 조회 불가 | ⚠️ P1 |
| 가격표에만 존재하는 용지 | 사용되지 않는 가격 데이터 | 💡 P2 |
| 표기법 불일치 | 약어/풀네임 차이 | ⚠️ P1 |

#### 검증 스크립트

```python
def validate_paper_names(master_path, price_path):
    """용지명 교차 검증"""
    
    # 상품마스터 용지명 추출
    master_wb = load_workbook(master_path, data_only=True)
    master_papers = set()
    ws = master_wb['!디지털인쇄용지']
    for row in range(2, ws.max_row + 1):
        paper = ws.cell(row=row, column=2).value  # 종이명 컬럼
        if paper:
            master_papers.add(normalize_paper_name(paper))
    
    # 인쇄가격표 용지명 추출
    price_wb = load_workbook(price_path, data_only=True)
    price_papers = set()
    ws = price_wb['디지털용지']
    for row in range(3, ws.max_row + 1):
        paper = ws.cell(row=row, column=2).value  # 종이명 컬럼
        if paper:
            price_papers.add(normalize_paper_name(paper))
    
    # 검증
    results = {
        "common": len(master_papers & price_papers),
        "master_only": list(master_papers - price_papers),
        "price_only": list(price_papers - master_papers),
        "total_master": len(master_papers),
        "total_price": len(price_papers),
    }
    
    # P1 판정
    if results["master_only"]:
        results["severity"] = "P1"
        results["message"] = f"마스터에만 있는 용지 {len(results['master_only'])}개 - 가격 조회 불가"
    else:
        results["severity"] = "OK"
        results["message"] = "용지명 정합성 정상"
    
    return results
```

#### 용지명 정규화

```python
PAPER_ABBREVIATIONS = {
    "WH": "울트라화이트",
    "T3절": "3절",
    "T4절": "4절",
}

def normalize_paper_name(name):
    """용지명 정규화"""
    if not name:
        return ""
    
    name = str(name)
    
    # 1. 특수 마커 제거
    name = name.replace("★", "").replace("●", "")
    
    # 2. 약어 치환
    for abbr, full in PAPER_ABBREVIATIONS.items():
        name = name.replace(abbr, full)
    
    # 3. 공백 정규화
    name = " ".join(name.split())
    
    return name.strip()
```

### Known Discrepancy Patterns (2026-01 분석 결과)

| 패턴 | 마스터 예시 | 가격표 예시 | 해결 방법 |
|------|-----------|-----------|----------|
| 약어 차이 | 랑데뷰 WH 240g ★ | 랑데뷰 울트라화이트 240g | 약어 테이블 |
| 절수 표기 | 몽블랑 130g (T3절) | 몽블랑 130g (3절) | T 제거 |
| 신규 미동기화 | 그문드컬러매트 블루300 | (없음) | 수동 추가 |
| 폐기 미삭제 | (없음) | 뉴크라프트 | 확인 후 삭제 |

---

## Boundary Test Cases

### Quantity Boundaries

```python
quantity_tests = [
    {"qty": 1, "expected": "Base price, 0% discount"},
    {"qty": 9, "expected": "0% discount"},
    {"qty": 10, "expected": "3% discount"},
    {"qty": 49, "expected": "3% discount"},
    {"qty": 50, "expected": "6% discount"},
    {"qty": 99, "expected": "6% discount"},
    {"qty": 100, "expected": "10% discount"},
    {"qty": 0, "expected": "Error or rejection"},
    {"qty": -1, "expected": "Error"},
]
```

### Price Calculation Tests

```python
price_tests = [
    {
        "name": "Basic calculation",
        "qty": 10,
        "unit_price": 1000,
        "discount": 0,
        "expected_total": 10000
    },
    {
        "name": "10% discount",
        "qty": 100,
        "unit_price": 1000,
        "discount": 0.10,
        "expected_total": 90000
    },
    {
        "name": "Rounding to 10-unit",
        "qty": 33,
        "unit_price": 333,
        "expected_total": 10990  # 10989 → 10990
    },
]
```

### Print Price Tier Tests (NEW)

```python
print_price_tests = [
    # 디지털출력비 시트 기준
    {"qty": 1, "type": "단면칼라", "expected": 2000},
    {"qty": 10, "type": "단면칼라", "expected": 1000},
    {"qty": 30, "type": "단면칼라", "expected": 750},
    {"qty": 50, "type": "단면칼라", "expected": 650},
    # 양면은 단면의 2배
    {"qty": 1, "type": "양면칼라", "expected": 4000},
    {"qty": 10, "type": "양면칼라", "expected": 2000},
]
```

---

## Common Error Patterns

### 1. Formula Copy Error

**Problem**: Missing absolute reference ($) when copying formulas
**Symptom**: Abnormally high or low prices in specific rows
**Detection**: Compare R1C1 formula patterns across same column

### 2. Discount Tier Error

**Problem**: Boundary misconfiguration (49 vs 50)
**Symptom**: 50 units gets 3% instead of 6% discount
**Detection**: Boundary value tests

### 3. Cross-Sheet Reference Error

**Problem**: Paper master changed, product sheet not updated
**Symptom**: Paper cost vs product price mismatch
**Detection**: Reference integrity validation

### 4. Hidden Row/Column Problem

**Problem**: Formula error in hidden row
**Symptom**: No visible issues but error propagates
**Detection**: Include hidden cells in inspection

### 5. Paper Name Mismatch (NEW)

**Problem**: 용지명 표기법 불일치
**Symptom**: 가격 조회 시 null 반환
**Detection**: `validate_paper_names()` 실행

```python
# 예시: 불일치 탐지
results = validate_paper_names(master_path, price_path)
if results["master_only"]:
    print(f"⚠️ P1: 마스터에만 있는 용지 {len(results['master_only'])}개")
    for paper in results["master_only"][:5]:
        print(f"  - {paper}")
```

### 6. Tab Color Change (NEW)

**Problem**: 시트 역할 변경 시 탭 색상 미변경
**Symptom**: 참조 시트가 작업 시트로 오인
**Detection**: 탭 색상 일관성 검사

```python
EXPECTED_TAB_COLORS = {
    "MAP": "FFE36C09",  # Orange
    "!디지털인쇄용지": "FFFF0000",  # Red
    "비즈하우스": "FF6AA84F",  # Green
    "후지필름": "FF6AA84F",
    "스토어": "FF00B050",
}

def validate_tab_colors(workbook):
    for sheet_name, expected_color in EXPECTED_TAB_COLORS.items():
        if sheet_name in workbook.sheetnames:
            ws = workbook[sheet_name]
            actual = ws.sheet_properties.tabColor
            actual_rgb = actual.rgb if actual else None
            if actual_rgb != expected_color:
                print(f"⚠️ {sheet_name}: expected {expected_color}, got {actual_rgb}")
```

---

## Paper Name Discrepancy Patterns (NEW)

### 2026-01 분석 기준 불일치 목록

#### 마스터에만 존재 (23개) - 가격 추가 필요

```
- 그문드컬러매트 블루300
- 랑데뷰 WH 240g ★
- 랑데뷰 WH 310g ★
- 리메이크스카이380
- 리브스디자인 250g
- 마테리카 클레이 360g
- 마테리카테라로사360
- 몽블랑 130g (T3절)
- 몽블랑 190g (T3절)
- 몽블랑 240g (T3절)
... (전체 23개)
```

#### 가격표에만 존재 (22개) - 마스터 확인 필요

```
- 뉴크라프트
- 랑데뷰 울트라화이트 240g
- 랑데뷰 울트라화이트 310g
- 레더하드커버(가칭)
- 몽블랑 130g (3절)
- 몽블랑 190g (3절)
- 몽블랑 240g (3절)
- 반투명 PET 260g
- 반투명 PET 350g
- 수분리스티커
... (전체 22개)
```

#### 매칭 규칙으로 해결 가능

| 마스터 | 가격표 | 규칙 |
|-------|-------|------|
| 랑데뷰 WH 240g ★ | 랑데뷰 울트라화이트 240g | WH→울트라화이트, ★제거 |
| 몽블랑 130g (T3절) | 몽블랑 130g (3절) | T제거 |

---

## Report Template

```markdown
# Price Table Validation Report

## Overview
- Filename: {filename}
- Validation datetime: {datetime}
- Validator: {validator}

## Summary

| Item | Result | Details |
|------|--------|---------|
| Formula errors | ✅/❌ | {count} found |
| Price inversions | ✅/❌ | {count} found |
| Negative prices | ✅/❌ | {count} found |
| Schema validation | ✅/❌ | {details} |
| **Paper name validation** | ✅/❌ | {common}/{total} matched |

## Cross-File Validation (NEW)

| Item | Count | Severity |
|------|-------|----------|
| 공통 용지 | {common} | OK |
| 마스터에만 존재 | {master_only} | P1 |
| 가격표에만 존재 | {price_only} | P2 |

### 마스터에만 존재하는 용지 (가격 추가 필요)
{list}

### 가격표에만 존재하는 용지 (마스터 확인 필요)
{list}

## Detailed Errors

[List each error with location and value]

## Recommended Actions

1. ...
2. ...

## Sign-off
- [ ] Validation complete
- [ ] Fixes verified
- [ ] **Paper names synchronized**
- [ ] Deployment approved
```

---

## Script Usage

### Basic Validation

```bash
python scripts/validate_price_sheet.py pricing.xlsx
```

### Schema Validation

```bash
python scripts/validate_schema.py pricing.xlsx "Sheet1" "unit_price,total"
```

### Paper Name Validation (NEW)

```bash
python scripts/validate_paper_names.py master.xlsx pricing.xlsx
```

### Full Validation Suite (NEW)

```bash
#!/bin/bash
# full_validation.sh

MASTER=$1
PRICING=$2

echo "=== P0 Validation ==="
python scripts/validate_price_sheet.py "$PRICING"

echo "=== P1 Validation ==="
python scripts/validate_paper_names.py "$MASTER" "$PRICING"

echo "=== P2 Validation ==="
python scripts/validate_tab_colors.py "$MASTER"
python scripts/validate_tab_colors.py "$PRICING"
```

### Batch Validation

```bash
for file in *.xlsx; do
    python scripts/validate_price_sheet.py "$file"
done
```

### CI/CD Integration

```bash
#!/bin/bash
python scripts/validate_price_sheet.py "$1"
if [ $? -ne 0 ]; then
    echo "❌ Validation FAILED"
    exit 1
fi

python scripts/validate_paper_names.py "$1" "$2"
if [ $? -ne 0 ]; then
    echo "⚠️ Paper name mismatch - review required"
    # P1이므로 경고만, 차단하지 않음
fi

echo "✅ Validation PASSED"
```
