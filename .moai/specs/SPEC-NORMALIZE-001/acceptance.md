# SPEC-NORMALIZE-001 Acceptance Criteria

---
spec_id: SPEC-NORMALIZE-001
title: 후니프린팅 xlsx 데이터 정규화 인수 기준
created: 2026-01-28
updated: 2026-01-28
status: Planned
author: MoAI-ADK
---

## 1. Overview

본 문서는 SPEC-NORMALIZE-001(후니프린팅 xlsx 데이터 정규화)의 인수 기준 및 테스트 시나리오를 정의한다.

---

## 2. Acceptance Criteria Summary

### 2.1 Critical Criteria (Must Pass)

| ID | Criteria | Validation Method |
|----|----------|-------------------|
| AC-01 | 모든 마스터 테이블이 정의된 스키마를 준수한다 | Schema Validation Script |
| AC-02 | 모든 코드가 `[CAT]_[SUBCAT]_[ATTR]_[SEQ]` 형식을 따른다 | Regex Validation |
| AC-03 | 원본 데이터 대비 마이그레이션 데이터 일치율 99% 이상 | Data Comparison |
| AC-04 | 중복 코드가 0건이다 | Uniqueness Check |
| AC-05 | 참조 무결성 위반이 0건이다 | FK Validation |

### 2.2 Important Criteria (Should Pass)

| ID | Criteria | Validation Method |
|----|----------|-------------------|
| AC-06 | 모든 용지 평량이 GSM 단위로 표현된다 | Unit Validation |
| AC-07 | 모든 사이즈가 표준(ISO/JIS/CUSTOM) 구분을 가진다 | Standard Flag Check |
| AC-08 | 한/영 이중 명명이 80% 이상 완성된다 | Bilingual Coverage |
| AC-09 | 마이그레이션 로그에 모든 변환 내역이 기록된다 | Log Completeness |

### 2.3 Nice-to-Have Criteria (Could Pass)

| ID | Criteria | Validation Method |
|----|----------|-------------------|
| AC-10 | MES 코드 매핑이 완성된다 | Mapping Coverage |
| AC-11 | 마이그레이션 실행 시간이 30분 이내이다 | Performance Test |
| AC-12 | 사용자 가이드 문서가 완성된다 | Documentation Review |

---

## 3. Test Scenarios (Given-When-Then)

### 3.1 Scenario: Paper Data Migration

```gherkin
Feature: 용지 데이터 마이그레이션
  As a 데이터 관리자
  I want 용지 데이터를 정규화된 마스터 테이블로 변환
  So that 일관된 용지 코드 체계를 사용할 수 있다

  Background:
    Given 상품마스터.xlsx 파일이 Google Drive에 업로드되어 있다
    And PAPER_MASTER 시트가 빈 상태로 준비되어 있다
    And 용어 매핑 사전이 설정되어 있다

  Scenario: 아트지 150g 데이터 변환
    Given 소스 파일에 "아트지 150g" 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then PAPER_MASTER에 새 레코드가 생성된다
    And paper_code는 "PAPER_ART_150"이다
    And paper_name_ko는 "아트지 150g"이다
    And gsm은 150이다
    And paper_type은 "ART"이다
    And status는 "A"이다

  Scenario: 중복 용지 데이터 처리
    Given PAPER_MASTER에 "PAPER_ART_150" 코드가 이미 존재한다
    And 소스 파일에 "아트지 150g" 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then 중복 경고 로그가 기록된다
    And 새 레코드는 생성되지 않는다
    And 기존 레코드의 updated_at이 갱신된다

  Scenario: 알 수 없는 용지 유형 처리
    Given 소스 파일에 "신규특수지 200g" 데이터가 존재한다
    And "신규특수지"가 매핑 사전에 없다
    When 마이그레이션 스크립트를 실행한다
    Then paper_type은 "SPECIAL"로 설정된다
    And 경고 로그에 "Unknown paper type: 신규특수지"가 기록된다
    And paper_code는 "PAPER_SPECIAL_200_001"이다
```

### 3.2 Scenario: Size Data Migration

```gherkin
Feature: 사이즈 데이터 마이그레이션
  As a 데이터 관리자
  I want 사이즈 데이터를 표준 기반 마스터 테이블로 변환
  So that ISO/JIS 표준에 맞는 사이즈 관리가 가능하다

  Background:
    Given 상품마스터.xlsx 파일이 Google Drive에 업로드되어 있다
    And SIZE_MASTER 시트가 빈 상태로 준비되어 있다
    And ISO/JIS 표준 사이즈 정의가 로드되어 있다

  Scenario: ISO A4 사이즈 변환
    Given 소스 파일에 "A4" 사이즈 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then SIZE_MASTER에 새 레코드가 생성된다
    And size_code는 "SIZE_A4_ISO"이다
    And width_mm은 210이다
    And height_mm은 297이다
    And standard는 "ISO"이다

  Scenario: JIS B5 사이즈 변환
    Given 소스 파일에 "B5" 사이즈 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then SIZE_MASTER에 새 레코드가 생성된다
    And size_code는 "SIZE_B5_JIS"이다
    And width_mm은 182이다
    And height_mm은 257이다
    And standard는 "JIS"이다

  Scenario: 비표준 사이즈 처리
    Given 소스 파일에 "특수사이즈 200x300mm" 데이터가 존재한다
    And 해당 사이즈가 ISO/JIS 표준에 없다
    When 마이그레이션 스크립트를 실행한다
    Then SIZE_MASTER에 새 레코드가 생성된다
    And size_code는 "SIZE_CUSTOM_200X300"이다
    And standard는 "CUSTOM"이다
    And 정보 로그에 "Non-standard size flagged as CUSTOM"이 기록된다
```

### 3.3 Scenario: Finish Data Migration

```gherkin
Feature: 후가공 데이터 마이그레이션
  As a 데이터 관리자
  I want 후가공 데이터를 카테고리별 마스터 테이블로 변환
  So that 후가공 옵션을 체계적으로 관리할 수 있다

  Background:
    Given 가격표.xlsx 파일이 Google Drive에 업로드되어 있다
    And FINISH_MASTER 시트가 빈 상태로 준비되어 있다
    And 후가공 용어 매핑 사전이 설정되어 있다

  Scenario: 유광 라미네이팅 변환
    Given 소스 파일에 "유광 라미네이팅" 후가공 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then FINISH_MASTER에 새 레코드가 생성된다
    And finish_code는 "FINISH_LAM_GLOSS"이다
    And finish_name_ko는 "유광 라미네이팅"이다
    And category는 "LAM"이다
    And sub_type은 "GLOSS"이다

  Scenario: 금박 후가공 변환
    Given 소스 파일에 "금박" 후가공 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then FINISH_MASTER에 새 레코드가 생성된다
    And finish_code는 "FINISH_FOIL_GOLD"이다
    And category는 "FOIL"이다

  Scenario: 복합 후가공 처리
    Given 소스 파일에 "무광코팅+금박" 후가공 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then 두 개의 개별 레코드가 생성된다
    And "FINISH_LAM_MATTE" 레코드가 존재한다
    And "FINISH_FOIL_GOLD" 레코드가 존재한다
    And 로그에 "Composite finish split into 2 records"가 기록된다
```

### 3.4 Scenario: Binding Data Migration

```gherkin
Feature: 제본 데이터 마이그레이션
  As a 데이터 관리자
  I want 제본 데이터를 페이지 제약 포함 마스터 테이블로 변환
  So that 제본 방식별 페이지 제한을 관리할 수 있다

  Background:
    Given 상품마스터.xlsx 파일이 Google Drive에 업로드되어 있다
    And BINDING_MASTER 시트가 빈 상태로 준비되어 있다

  Scenario: 중철 제본 변환
    Given 소스 파일에 "중철제본" 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then BINDING_MASTER에 새 레코드가 생성된다
    And binding_code는 "BIND_SADDLE_STD"이다
    And binding_type은 "SADDLE"이다
    And min_pages는 8이다
    And max_pages는 64이다
    And page_unit은 4이다
    And cover_required는 FALSE이다

  Scenario: 무선 제본 변환
    Given 소스 파일에 "무선제본" 데이터가 존재한다
    When 마이그레이션 스크립트를 실행한다
    Then BINDING_MASTER에 새 레코드가 생성된다
    And binding_code는 "BIND_PERFECT_STD"이다
    And min_pages는 48이다
    And max_pages는 500이다
    And cover_required는 TRUE이다
```

### 3.5 Scenario: Product Data Migration

```gherkin
Feature: 상품 데이터 마이그레이션
  As a 데이터 관리자
  I want 상품 데이터를 참조 무결성이 보장된 마스터 테이블로 변환
  So that 상품별 옵션 조합을 체계적으로 관리할 수 있다

  Background:
    Given 상품마스터.xlsx 파일이 Google Drive에 업로드되어 있다
    And 모든 참조 마스터 테이블이 마이그레이션 완료되어 있다
    And PRODUCT_MASTER 시트가 빈 상태로 준비되어 있다

  Scenario: 디지털 명함 상품 변환
    Given 소스 파일에 "디지털 명함" 상품 데이터가 존재한다
    And 기본 용지는 "아트지 250g"이다
    And 기본 사이즈는 "명함사이즈"이다
    When 마이그레이션 스크립트를 실행한다
    Then PRODUCT_MASTER에 새 레코드가 생성된다
    And product_code는 "PROD_DIG_001"이다
    And product_name_ko는 "디지털 명함"이다
    And category는 "DIG"이다
    And default_paper_code는 "PAPER_ART_250"이다
    And default_size_code는 "SIZE_CARD_STD"이다

  Scenario: 참조 무결성 검증
    Given 소스 파일에 상품 데이터가 존재한다
    And 기본 용지가 "없는용지타입"으로 설정되어 있다
    When 마이그레이션 스크립트를 실행한다
    Then 오류 로그에 "Invalid paper_code reference"가 기록된다
    And default_paper_code는 NULL로 설정된다
    And 상품 레코드는 생성되지만 경고 상태로 표시된다
```

### 3.6 Scenario: Code Validation

```gherkin
Feature: 코드 형식 검증
  As a 시스템
  I want 모든 생성된 코드가 정의된 형식을 준수하는지 검증
  So that 일관된 코드 체계를 유지할 수 있다

  Scenario Outline: 코드 형식 검증
    Given "<code>" 코드가 생성되었다
    When 코드 형식 검증을 실행한다
    Then 결과는 "<result>"이다
    And 메시지는 "<message>"이다

    Examples:
      | code                | result | message                           |
      | PAPER_ART_150       | PASS   | Valid code format                 |
      | SIZE_A4_ISO         | PASS   | Valid code format                 |
      | FINISH_LAM_GLOSS    | PASS   | Valid code format                 |
      | paper_art_150       | FAIL   | Lowercase not allowed             |
      | PAPER-ART-150       | FAIL   | Invalid separator (use underscore)|
      | PAPER_ART           | FAIL   | Missing required segment          |
      | PAPER__ART_150      | FAIL   | Double underscore not allowed     |
      | PAPER_ART_150_EXTRA | PASS   | Valid extended code format        |
```

### 3.7 Scenario: Data Integrity Validation

```gherkin
Feature: 데이터 무결성 검증
  As a QA 담당자
  I want 마이그레이션된 데이터의 무결성을 검증
  So that 데이터 품질을 보장할 수 있다

  Background:
    Given 전체 마이그레이션이 완료되어 있다

  Scenario: 전체 데이터 무결성 검사
    When 무결성 검증 스크립트를 실행한다
    Then 중복 코드 검사 결과가 0건이다
    And 참조 무결성 위반이 0건이다
    And NULL 필수 필드가 0건이다
    And 형식 위반 코드가 0건이다

  Scenario: 마이그레이션 완전성 검사
    Given 원본 상품마스터.xlsx에 1000개의 상품 데이터가 있다
    When 완전성 검증을 실행한다
    Then PRODUCT_MASTER에 최소 990개의 레코드가 존재한다 (99% 이상)
    And 누락된 레코드가 있으면 오류 로그에 기록되어 있다
```

---

## 4. Data Validation Criteria

### 4.1 Code Format Validation

```javascript
// Validation Regex
const CODE_PATTERN = /^[A-Z]+_[A-Z]+(_[A-Z0-9]+)*$/;

// Valid Examples
"PAPER_ART_150"      // ✓
"SIZE_A4_ISO"        // ✓
"FINISH_LAM_GLOSS"   // ✓
"PROD_DIG_001"       // ✓

// Invalid Examples
"paper_art_150"      // ✗ Lowercase
"PAPER-ART-150"      // ✗ Wrong separator
"PAPER_Art_150"      // ✗ Mixed case
```

### 4.2 GSM Validation

| Check | Criteria | Action |
|-------|----------|--------|
| Range | 50 <= GSM <= 500 | Error if out of range |
| Common Values | 80, 100, 120, 150, 180, 200, 250, 300, 350, 400 | Warn if uncommon |
| Zero/Null | GSM == 0 or NULL | Error for paper records |

### 4.3 Size Validation

| Standard | Width Range (mm) | Height Range (mm) |
|----------|------------------|-------------------|
| ISO A | 26-841 | 37-1189 |
| JIS B | 32-1030 | 45-1456 |
| CUSTOM | 10-2000 | 10-3000 |

### 4.4 Reference Integrity Validation

| Master | Foreign Key | Referenced Master |
|--------|-------------|-------------------|
| PRODUCT_MASTER | default_paper_code | PAPER_MASTER |
| PRODUCT_MASTER | default_size_code | SIZE_MASTER |
| PRODUCT_MASTER | default_finish_code | FINISH_MASTER |
| PRODUCT_MASTER | default_binding_code | BINDING_MASTER |

---

## 5. Success Metrics

### 5.1 Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Data Migration Rate | >= 99% | (Migrated Records / Source Records) * 100 |
| Code Uniqueness | 100% | COUNT(DISTINCT code) == COUNT(code) |
| Reference Integrity | 100% | FK Violations == 0 |
| Bilingual Coverage | >= 80% | (Records with EN name / Total Records) * 100 |
| Schema Compliance | 100% | All required fields populated |

### 5.2 Qualitative Metrics

| Metric | Target | Evaluation Method |
|--------|--------|------------------|
| User Satisfaction | >= 4/5 | UAT Survey |
| Documentation Completeness | Yes/No | Checklist Review |
| Code Readability | Yes/No | Code Review |

---

## 6. Quality Gates

### 6.1 Phase 1 Gate (Analysis)

| Checkpoint | Criteria | Approver |
|------------|----------|----------|
| Data Analysis Complete | 모든 시트 분석 완료 | Data Analyst |
| Mapping Dictionary | 모든 용어 매핑 완성 | Business User |
| Code Rules | 코드 생성 규칙 확정 | Project Owner |

### 6.2 Phase 2 Gate (Master Tables)

| Checkpoint | Criteria | Approver |
|------------|----------|----------|
| Schema Implemented | 모든 테이블 스키마 구현 | Developer |
| Validation Rules | Data Validation 설정 완료 | QA |
| Sample Data | 샘플 데이터 입력 검증 | Business User |

### 6.3 Phase 3 Gate (Migration)

| Checkpoint | Criteria | Approver |
|------------|----------|----------|
| Unit Tests Pass | 모든 변환 함수 테스트 통과 | Developer |
| Error Rate | 오류율 < 1% | QA |
| Performance | 실행 시간 < 30분 | QA |

### 6.4 Phase 4 Gate (Verification)

| Checkpoint | Criteria | Approver |
|------------|----------|----------|
| Data Integrity | 모든 무결성 검사 통과 | QA |
| UAT Complete | 사용자 수락 테스트 통과 | Business User |
| Documentation | 사용자 가이드 완성 | Project Owner |

---

## 7. Definition of Done

### 7.1 Feature Level

- [ ] 모든 마스터 테이블이 정의된 스키마를 따른다
- [ ] 모든 코드가 정의된 형식을 준수한다
- [ ] 원본 데이터 대비 99% 이상 마이그레이션 완료
- [ ] 모든 참조 무결성 검증 통과
- [ ] 중복 코드 0건

### 7.2 Documentation Level

- [ ] 마이그레이션 리포트 생성
- [ ] 사용자 가이드 작성
- [ ] 코드 정의서 작성
- [ ] 변경 이력 문서화

### 7.3 Quality Level

- [ ] 모든 Given-When-Then 시나리오 통과
- [ ] 데이터 품질 메트릭 충족
- [ ] UAT 승인 완료

---

## 8. Test Environment

### 8.1 Test Data

| Data Set | Description | Size |
|----------|-------------|------|
| Small | 샘플 테스트용 | 100 records |
| Medium | 기능 테스트용 | 1,000 records |
| Full | 전체 마이그레이션 테스트 | All records |

### 8.2 Test Tools

| Tool | Purpose |
|------|---------|
| Apps Script Logger | 실행 로그 기록 |
| Google Sheets Validation | 데이터 검증 |
| Custom Validation Script | 무결성 검사 |

---

## 9. Traceability Matrix

| Requirement ID | Test Scenario | Acceptance Criteria |
|----------------|---------------|---------------------|
| UB-01 | 3.1, 3.6 | AC-02 |
| UB-02 | 3.1 | AC-06 |
| UB-03 | 3.2 | AC-07 |
| EV-01 | 3.1, 3.2, 3.3, 3.4, 3.5 | AC-01 |
| EV-02 | 3.1 (Scenario 2) | AC-04 |
| EV-03 | 3.1 (Scenario 3) | AC-08 |
| EV-04 | 3.2 (Scenario 3) | AC-07 |
| ST-01 | 3.5 (Scenario 2) | AC-01 |
| UN-02 | 3.7 | AC-04 |
| UN-03 | 3.2 | AC-07 |

---

**Document Status**: Planned
**Review Required**: Business User, QA, Project Owner
**Next Action**: Phase 1 완료 후 테스트 시나리오 실행 준비
