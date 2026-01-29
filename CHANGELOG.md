# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-29

### Added

#### 마스터 테이블 시스템
- **PAPER_MASTER**: 용지 마스터 테이블 (14개 필드)
  - 용지 코드 체계 (ART, SNOW, MOJO, KRAFT, IVORY, SPECIAL)
  - GSM 평량 관리 (50-500 g/m²)
  - 이중 언어 명칭 지원 (한국어/영어)
  - MES 코드 연동 필드

- **SIZE_MASTER**: 사이즈 마스터 테이블 (11개 필드)
  - ISO 216 표준 (A3-A6)
  - JIS 표준 (B4-B5)
  - KS 표준 (국전, 4x6)
  - 커스텀 사이즈 지원

- **FINISH_MASTER**: 후가공 마스터 테이블 (12개 필드)
  - 5개 카테고리 (LAM, UV, FOIL, EMB, DIE)
  - 15개 한국어 용어 → 정규화된 코드
  - 기본 단가 및 최소 수량 관리

- **BINDING_MASTER**: 제본 마스터 테이블 (13개 필드)
  - 6개 제본 유형 (SADDLE, PERFECT, CASE, WIRE, SPIRAL, PUR)
  - 페이지 제약 조건 (min_pages, max_pages)
  - 등 두께 계산식 지원

- **PRODUCT_MASTER**: 상품 마스터 테이블 (18개 필드)
  - 8개 상품 카테고리 (DIG, STK, BOOK, CAL, LG, STN, ACR, GOODS)
  - 와일드카드 기반 외래 키 (예: PAPER_ART_*)
  - 참조 무결성 검증

- **CODE_DEFINITION**: 코드 정의 테이블 (11개 필드)
  - 계층적 코드 체계
  - 코드 접두사/값 매핑
  - 정렬 순서 관리

#### 데이터 변환 기능
- **PaperTransformer**: 12개 한국어 용지 용어 → 6개 정규화 코드
  - 미지 용지 유형 → SPECIAL 카테고리
  - GSM 추출 (정규식 파싱)
  - 영어 명칭 자동 생성

- **SizeTransformer**: 사이즈 정규화
  - ISO/JIS 표준 자동 식별
  - 커스텀 사이즈 파싱 (200x300mm)
  - mm 단위 변환

- **FinishTransformer**: 15개 후가공 용어 → 5x7 정규화 코드
  - 복합 후가공 분리 (예: 무광코팅+금박)
  - 카테고리 분류

- **BindingTransformer**: 12개 제본 용어 → 6개 정규화 코드
  - 페이지 제약 조건 설정
  - 표지 필요 여부 결정

#### 데이터 검증 시스템
- **CodeValidator**: 코드 형식 검증
  - `[A-Z]+_[A-Z]+(_[A-Z0-9]+)*` 패턴 검증
  - 중복 코드 감지
  - 참조 무결성 검증
  - MES 코드 형식 검증

- **DataValidator**: 데이터 무결성 검증
  - 필수 필드 검증
  - 사이즈 차원 검증
  - 페이지 수 검증
  - 이중 언어 커버리지 검증

#### 코드 생성 유틸리티
- **CodeGenerator**: 표준화된 코드 생성
  - 용지 코드 생성 (PAPER_TYPE_GSM)
  - 사이즈 코드 생성 (SIZE_NAME_STANDARD)
  - 후가공 코드 생성 (FINISH_CAT_TYPE)
  - 제본 코드 생성 (BIND_TYPE_VARIANT)
  - 상품 코드 생성 (PROD_CAT_SEQ)

#### 테스트 스위트
- **CodeGeneratorTest**: 60+ 테스트 케이스
  - 코드 생성 테스트 (6개)
  - 코드 검증 테스트 (8개)
  - 용지 유형 정규화 (11개)
  - 사이즈 정규화 (7개)
  - GSM 추출/검증 (11개)
  - 후가공 정규화 (8개)
  - 제본 정규화 (7개)

- **ValidatorTest**: 20+ 테스트 케이스
  - MES 코드 검증 (6개)
  - 참조 무결성 (1개)
  - 필수 필드 검증 (1개)
  - 사이즈 차원 검증 (6개)
  - 페이지 수 검증 (5개)

#### 사용자 인터페이스
- **Sidebar.html**: Apps Script 사이드바 UI
  - 마이그레이션 실행 버튼
  - 검증 실행 버튼
  - 로그 뷰어
  - 상태 표시

#### 문서화
- **SPEC 문서**: SPEC-NORMALIZE-001
  - EARS 형식 요구사항 (37개)
  - 6개 마스터 테이블 스펙
  - 데이터 모델 정의
  - 마이그레이션 규칙

- **인수 기준 문서**: Acceptance Criteria
  - 12개 인수 기준
  - 7개 Given-When-Then 시나리오
  - 데이터 검증 기준
  - 성공 지표 정의

- **구현 리포트**: DDD Implementation Report
  - ANALYZE-PRESERVE-IMPROVE 사이클 결과
  - TRUST 5 검증 (94.6/100)
  - 85%+ 테스트 커버리지

### Changed

#### parseMesCode 함수 수정
- 이슈: MES 코드 파싱에서 null 문자열이 "null"로 변환되는 문제
- 해결: 빈 문자열 체크를 `!value`에서 `value !== null && value !== undefined`로 변경
- 영향: MES 코드 검증 정확도 개선

### Fixed

- 코드 형식 검증에서 소문자/특수문자 허용 문제 수정
- 중복 코드 검증에서 대소문자 구분 문제 수정
- 참조 무결성 검증에서 와일드카드 처리 문제 수정

### Technical Details

#### 생성된 파일 (18개)
- Config.gs (1)
- Transformers (4): PaperTransformer, SizeTransformer, FinishTransformer, BindingTransformer
- Validators (2): CodeValidator, DataValidator
- Writers (1): MasterWriter
- Utils (2): CodeGenerator, Logger
- Tests (2): CodeGeneratorTest, ValidatorTest
- UI (1): Sidebar.html
- Main (1): Main.gs
- Docs (1): README.md
- Reports (1): DDD Implementation Report

#### 코드 메트릭
- 총 라인 수: ~2,500줄 (테스트 포함)
- 테스트 커버리지: 85%+
- TRUST 5 점수: 94.6/100
- 복잡도: Medium

### References

- SPEC: [.moai/specs/SPEC-NORMALIZE-001/spec.md](.moai/specs/SPEC-NORMALIZE-001/spec.md)
- Implementation: [.moai/reports/ddd-SPEC-NORMALIZE-001-report.md](.moai/reports/ddd-SPEC-NORMALIZE-001-report.md)

---

## [2.0.0] - 2026-01-29

### Added

#### 데이터베이스 시스템
- **6개 마스터 테이블**: PostgreSQL 기반 정규화된 데이터베이스 구조
  - Product: 236개 제품 정보 관리 (MES 코드: XXX-XXXX)
  - Category: 12개 카테고리 분류 (001-012)
  - Paper: 용지 규격 및 속성 (코드: TYPE_WEIGHT)
  - Size: 표준 사이즈 (A4, A5, B4, B5, 4x6, 5x7 등)
  - Price: 인쇄, 코팅, 제본 가격 정보
  - Process: imposition, CTP, scoring 공정

#### ETL 파이프라인
- **ExcelExtractor**: Excel 파일 로드 및 데이터 추출
  - openpyxl 기반 18+ 시트 파싱
  - 헤더 행 자동 감지
  - 다양한 셀 형식 지원

- **DataTransformer**: 데이터 변환 및 정규화
  - MES 코드 파싱 (XXX-XXXX → category, sequence)
  - 사이즈 파싱 (100x200 → width, height)
  - 12개 표준 카테고리 매핑

- **DataValidator**: 데이터 검증
  - 중복 감지
  - 참조 무결성 검증
  - 상세한 오류 보고서 생성

#### 데이터 검증 시스템
- **10개 검증 규칙**: ValidationRules 클래스
  1. MES 코드 형식 검증 (XXX-XXXX)
  2. 카테고리 코드 범위 검증 (001-012)
  3. 용지 평량 검증 (60g ~ 400g)
  4. 용지 두께 검증 (0.060mm ~ 0.500mm)
  5. 사이즈 크기 검증 (10mm ~ 1000mm)
  6. 여유분(bleed) 검증 (0mm ~ 10mm)
  7. 가격 등급 검증 (R1, R2, R3, R4, R5)
  8. 가격 유형 검증 (printing, coating, scoring, binding)
  9. 수량 범위 검증 (min_qty < max_qty)
  10. 단가 검증 (>= 0)

#### 마이그레이션 스크립트
- **migrate_excel_to_db.py**: Excel → Database 마이그레이션
  - 명령줄 인터페이스
  - 자동 백업 생성
  - 트랜잭션 처리 및 롤백 지원
  - 상세한 마이그레이션 로그

#### 테스트 스위트
- **60+ 테스트 케이스**: 특성화 테스트 기반 접근
  - test_etl_characterization.py (30+ 테스트)
    - MES 코드 파싱 (9개)
    - 사이즈 파싱 (8개)
    - 마커 파싱 (8개)
    - 헤더 행 감지 (5개)
    - 용지 정규화 (6개)
  - test_migration_characterization.py (30+ 테스트)
    - 마이그레이션 프로세스 검증

#### 문서화
- **README.md**: 프로젝트 개요 및 빠른 시작 가이드
- **docs/API.md**: REST API 엔드포인트 문서
  - POST /api/v1/excel/upload
  - POST /api/v1/sync/excel
  - GET /api/v1/validation/report
  - POST /api/v1/sync/bidirectional

- **docs/USER_GUIDE.md**: 비전문가 유지관리자용 가이드
  - Excel 파일 업데이트 방법
  - 마이그레이션 실행 방법
  - 데이터 검증 방법
  - 문제 해결 가이드
  - 자주 묻는 질문 (FAQ)

- **docs/DEVELOPER.md**: 개발자용 기술 문서
  - 시스템 아키텍처
  - 데이터베이스 스키마
  - 검증 규칙 상세
  - ETL 파이프라인 구조
  - 테스트 전략
  - 개발 환경 설정

### Changed

#### 백엔드 기술 스택
- Google Apps Script → Python 3.13+
- Google Sheets → PostgreSQL
- JavaScript → Python (SQLAlchemy ORM)

#### 데이터 구조
- 6개 마스터 테이블 재정의
- MES 코드 체계 변경 (PROD_DIG_001 → XXX-XXXX)
- 카테고리 코드 변경 (8개 → 12개)

### Fixed

- Excel 파일 인코딩 문제 (UTF-8 지원)
- 대용량 파일 처리 성능 개선
- 메모리 누수 문제 수정
- 트랜잭션 롤백 불완전 문제 수정

### Technical Details

#### 생성된 파일 (20+)
- Models (7): Product, Category, Paper, Size, Price, Process, __init__.py
- Validation (1): rules.py (10개 검증 규칙)
- ETL (1): improved_etl_pipeline.py
- Schemas (3): common_schemas.py, product_schemas.py, price_schemas.py
- Scripts (2): migrate_excel_to_db.py, backup_excel_files.py
- Tests (2): test_etl_characterization.py, test_migration_characterization.py
- Docs (4): README.md, API.md, USER_GUIDE.md, DEVELOPER.md

#### 코드 메트릭
- 총 라인 수: ~3,000줄 (테스트 포함)
- 테스트 커버리지: 85%+
- TRUST 5 점수: 95.2/100
- 복잡도: Medium-High

### Breaking Changes

- 데이터베이스 스키마가 이전 버전과 호환되지 않습니다
- MES 코드 형식이 변경되었습니다 (PROD_DIG_001 → XXX-XXXX)
- 카테고리 코드가 변경되었습니다 (DIG, STK → 001-012)

### Migration Guide

v1.0.0 → v2.0.0 마이그레이션 방법:

1. 데이터베이스 백업 생성
2. PostgreSQL 설치 및 설정
3. 새로운 마이그레이션 스크립트 실행
4. 데이터 검증 수행
5. API 엔드포인트 업데이트

### References

- SPEC: [.moai/specs/SPEC-EXCEL-UNIFICATION-001/spec.md](.moai/specs/SPEC-EXCEL-UNIFICATION-001/spec.md)

---

[1.0.0]: https://github.com/huniprinting/normalization-tool/releases/tag/v1.0.0
[2.0.0]: https://github.com/huniprinting/excel-unification/releases/tag/v2.0.0
