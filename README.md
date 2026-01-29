# 후니프린팅 Excel 통합 시스템 정규화 프로젝트

Excel 기반 인쇄 상품 데이터를 데이터베이스 기반 시스템으로 정규화하고 통합하는 프로젝트입니다.

## 개요

현재 2개의 Excel 파일(`!후니프린팅_상품마스터.xlsx`, `!후니프린팅_인쇄상품_가격표.xlsx`)로 운영 중인 236개 제품, 12개 카테고리, 18개 이상의 시트 데이터를 정규화된 데이터베이스 구조로 변환합니다.

### 현재 상황

- 236개 제품 데이터가 2개 Excel 파일에 분산
- 컬럼 불일치, 비표준 구조, 중복 데이터 존재
- 비전문가 유지보수자 (Excel 초급 사용자) 운영
- 데이터 검증 및 동기화 어려움

### 목표

- 6개 마스터 테이블 기반 데이터베이스 구축
- 자동화된 ETL 파이프라인 구축
- 비전문가 친화적 데이터 관리 도구 제공
- 데이터 무결성 보장 및 검증 시스템 구현

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Excel Files                             │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ !후니프린팅_상품마스터  │  │ !후니프린팅_가격표    │            │
│  │  - 18+ 시트          │  │  - 인쇄/코팅/제본    │            │
│  │  - 236개 제품        │  │  - 수량별 단가        │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ETL Pipeline                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Extract  │→│ Transform │→│ Validate │→│   Load   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Product │ │Category │ │  Paper  │ │   Size  │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│  ┌─────────┐ ┌─────────┐                                      │
│  │  Price  │ │ Process │                                      │
│  └─────────┘ └─────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REST API Layer                              │
│  POST /api/v1/excel/upload  - Excel 파일 업로드                 │
│  POST /api/v1/sync/excel     - 데이터 동기화                    │
│  GET  /api/v1/validation     - 검증 보고서                      │
│  POST /api/v1/sync/bidirectional - 양방향 동기화               │
└─────────────────────────────────────────────────────────────────┘
```

## 데이터베이스 구조

### 6개 마스터 테이블

1. **product_master** - 제품 기본 정보 (236개 제품)
   - MES 코드: `XXX-XXXX` 형식 (예: `001-0001`)
   - 카테고리 코드: `001-012` 범위
   - 제품명, 사이즈, 기본 용지, 최소 수량

2. **category_master** - 12개 카테고리 분류
   - 엽서, 스티커, 전단지, 포스터, 책자, 카탈로그 등
   - 정렬 순서, 활성화 여부

3. **paper_master** - 용지 규격 및 속성
   - 용지 코드: `{TYPE}_{WEIGHT}` 형식 (예: `ART_180`)
   - 평량: 60g ~ 400g 범위
   - 두께: 0.060mm ~ 0.500mm 범위

4. **size_master** - 표준 사이즈 및 재단 규격
   - A4, A5, A3, B4, B5, 4x6, 5x7 등
   - 가로/세로 크기, 여유분(bleed)

5. **price_master** - 인쇄, 코팅, 제본 등 가격 정보
   - MES 코드별 수량 구간 단가
   - 가격 등급: R1, R2, R3, R4, R5
   - 유효 기간 관리

6. **process_master** - imposition, CTP, scoring 공정
   - 공정 파라미터 (JSON)
   - 계산식 (formula)

## 빠른 시작

### 1. 사전 요구사항

```bash
# Python 3.13+
python --version

# 의존성 설치
pip install pandas openpyxl sqlalchemy psycopg2-binary pydantic
```

### 2. 데이터베이스 설정

```bash
# PostgreSQL 설치 후 데이터베이스 생성
createdb huni_printing

# 환경 변수 설정
export DATABASE_URL="postgresql://user:password@localhost/huni_printing"
```

### 3. Excel 마이그레이션 실행

```bash
# 상품 마스터 파일 경로
PRODUCT_MASTER="ref/!후니프린팅_상품마스터.xlsx"

# 가격표 파일 경로
PRICE_TABLE="ref/!후니프린팅_인쇄상품_가격표.xlsx"

# 마이그레이션 실행
python scripts/migrate_excel_to_db.py \
  --product-master "$PRODUCT_MASTER" \
  --price-table "$PRICE_TABLE" \
  --db-url "$DATABASE_URL"
```

### 4. 데이터 검증

```bash
# 검증 규칙 실행
python -m src.validation.rules

# 결과 확인
# .moai/logs/validation.json
```

## 프로젝트 구조

```
huni.execel.man/
├── ref/                           # Excel 원본 파일
│   ├── !후니프린팅_상품마스터.xlsx
│   └── !후니프린팅_인쇄상품_가격표.xlsx
├── src/
│   ├── models/                    # 데이터베이스 모델 (6개)
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── paper.py
│   │   ├── size.py
│   │   ├── price.py
│   │   └── process.py
│   ├── validation/                # 데이터 검증
│   │   └── rules.py              # 10개 검증 규칙
│   ├── etl/                       # ETL 파이프라인
│   │   └── improved_etl_pipeline.py
│   └── schemas/                   # Pydantic 스키마
├── scripts/                       # 유틸리티 스크립트
│   ├── migrate_excel_to_db.py    # 마이그레이션
│   └── backup_excel_files.py     # 백업
├── tests/                         # 테스트 (60+ 개)
│   └── characterization/
│       ├── test_etl_characterization.py
│       └── test_migration_characterization.py
├── docs/                          # 문서
│   ├── API.md                     # API 문서
│   ├── USER_GUIDE.md              # 사용자 가이드
│   └── DEVELOPER.md               # 개발자 가이드
└── .moai/
    ├── specs/                     # SPEC 문서
    │   └── SPEC-EXCEL-UNIFICATION-001/
    └── analysis/                  # 분석 보고서
```

## 핵심 기능

### 데이터 검증 (10개 규칙)

| 규칙 | 설명 | 예시 |
|-----|------|-----|
| MES 코드 형식 | `XXX-XXXX` 형식 검증 | `001-0001` ✓ |
| 카테고리 코드 | `001-012` 범위 검증 | `001` ✓, `013` ✗ |
| 용지 평량 | 60g ~ 400g 범위 | `180g` ✓ |
| 용지 두께 | 0.060mm ~ 0.500mm 범위 | `0.180mm` ✓ |
| 사이즈 크기 | 10mm ~ 1000mm 범위 | `210.0 x 297.0` ✓ |
| 여유분(bleed) | 0mm ~ 10mm 범위 | `3.0mm` ✓ |
| 가격 등급 | R1, R2, R3, R4, R5 | `R1` ✓ |
| 가격 유형 | printing, coating, scoring, binding | `printing` ✓ |
| 수량 범위 | min_qty < max_qty | `100 < 499` ✓ |
| 단가 | 0 이상 | `50.00` ✓ |

### ETL 파이프라인

1. **추출(Extract)**
   - Excel 파일 로드 (openpyxl)
   - 시트별 데이터 파싱
   - 헤더 행 자동 감지

2. **변환(Transform)**
   - MES 코드 파싱 (`XXX-XXXX`)
   - 사이즈 파싱 (`100x200`)
   - 데이터 정규화

3. **검증(Validate)**
   - 10개 검증 규칙 적용
   - 중복 데이터 감지
   - 오류 보고서 생성

4. **적재(Load)**
   - 데이터베이스 저장
   - 트랜잭션 처리
   - 롤백 지원

## 사용 예제

### 마이그레이션 실행

```python
from scripts.migrate_excel_to_db import ExcelToDBMigrator
from pathlib import Path

# 마이그레이터 생성
migrator = ExcelToDBMigrator(
    db_url="postgresql://localhost/huni_printing",
    product_master_path="ref/!후니프린팅_상품마스터.xlsx",
    price_table_path="ref/!후니프린팅_인쇄상품_가격표.xlsx"
)

# 마이그레이션 실행
summary = migrator.migrate(log_file=Path(".moai/logs/migration.json"))

# 결과 확인
print(f"Categories: {summary['categories']}")
print(f"Products: {summary['products']}")
```

### 데이터 검증

```python
from src.validation.rules import ValidationRules

# MES 코드 검증
result = ValidationRules.validate_mes_code("001-0001")
if result.is_valid:
    print("Valid MES code")
else:
    print(f"Errors: {result.errors}")

# 제품 데이터 검증
product_data = {
    "mes_code": "001-0001",
    "category_code": "001",
    "product_name_ko": "4x6엽서"
}
result = ValidationRules.validate_entity("product", product_data)
```

## 문서

- **[API 문서](docs/API.md)** - REST API 엔드포인트
- **[사용자 가이드](docs/USER_GUIDE.md)** - 비전문가 유지관리자용 가이드
- **[개발자 가이드](docs/DEVELOPER.md)** - 개발자용 기술 문서
- **[CHANGELOG.md](CHANGELOG.md)** - 버전별 변경 사항

## 테스트

```bash
# 전체 테스트 실행
pytest tests/ -v

# 특성화 테스트만 실행
pytest tests/characterization/ -v

# 커버리지 확인
pytest --cov=src --cov-report=html
```

## 기술 스택

- **Python 3.13+**
- **pandas** - 데이터 처리
- **openpyxl** - Excel 파일 처리
- **SQLAlchemy** - ORM
- **PostgreSQL** - 데이터베이스
- **Pydantic** - 데이터 검증
- **pytest** - 테스트 프레임워크

## SPEC 문서

프로젝트 상세 사양은 [SPEC-EXCEL-UNIFICATION-001](.moai/specs/SPEC-EXCEL-UNIFICATION-001/spec.md)을 참조하세요.

## 라이선스

Copyright (c) 2026 후니프린팅
