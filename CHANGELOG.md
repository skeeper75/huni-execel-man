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

[1.0.0]: https://github.com/huniprinting/normalization-tool/releases/tag/v1.0.0
