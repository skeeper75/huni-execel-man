# SPEC-NORMALIZE-001 Implementation Plan

---
spec_id: SPEC-NORMALIZE-001
title: 후니프린팅 xlsx 데이터 정규화 구현 계획
created: 2026-01-28
updated: 2026-01-28
status: Planned
author: MoAI-ADK
---

## 1. Overview

본 문서는 SPEC-NORMALIZE-001(후니프린팅 xlsx 데이터 정규화)의 구현 계획을 정의한다.

### 1.1 Objective

기존 xlsx 파일의 비정규화된 데이터를 산업 표준에 부합하는 정규화된 마스터 테이블로 변환

### 1.2 Deliverables

- 6개의 정규화된 마스터 테이블 (Google Sheets)
- 데이터 마이그레이션 Apps Script
- 검증 리포트
- 사용자 가이드

---

## 2. Phase Breakdown

### Phase 1: Analysis & Mapping (Primary Goal)

**목표**: 기존 데이터 구조 분석 및 매핑 규칙 정의

**Tasks**:

| Task ID | Description | Priority | Dependencies |
|---------|-------------|----------|--------------|
| P1-T01 | 상품마스터.xlsx 시트별 구조 분석 | High | None |
| P1-T02 | 가격표.xlsx 시트별 구조 분석 | High | None |
| P1-T03 | 용지 용어 매핑 사전 생성 | High | P1-T01, P1-T02 |
| P1-T04 | 사이즈 용어 매핑 사전 생성 | High | P1-T01, P1-T02 |
| P1-T05 | 후가공 용어 매핑 사전 생성 | High | P1-T01, P1-T02 |
| P1-T06 | 제본 용어 매핑 사전 생성 | Medium | P1-T01, P1-T02 |
| P1-T07 | 코드 생성 규칙 확정 | High | P1-T03 ~ P1-T06 |
| P1-T08 | 데이터 품질 이슈 문서화 | Medium | P1-T01, P1-T02 |

**Output**:
- 분석 리포트 (`.moai/reports/normalize-analysis/`)
- 용어 매핑 사전 (Google Sheets)
- 코드 생성 규칙 문서

### Phase 2: Master Table Creation (Primary Goal)

**목표**: Google Sheets 기반 마스터 테이블 템플릿 생성

**Tasks**:

| Task ID | Description | Priority | Dependencies |
|---------|-------------|----------|--------------|
| P2-T01 | Google Sheets 워크북 생성 | High | P1 완료 |
| P2-T02 | PAPER_MASTER 시트 구성 | High | P2-T01 |
| P2-T03 | SIZE_MASTER 시트 구성 | High | P2-T01 |
| P2-T04 | FINISH_MASTER 시트 구성 | High | P2-T01 |
| P2-T05 | BINDING_MASTER 시트 구성 | High | P2-T01 |
| P2-T06 | PRODUCT_MASTER 시트 구성 | High | P2-T01 |
| P2-T07 | CODE_DEFINITION 시트 구성 | High | P2-T01 |
| P2-T08 | Named Ranges 설정 | Medium | P2-T02 ~ P2-T07 |
| P2-T09 | Data Validation Rules 설정 | Medium | P2-T08 |
| P2-T10 | Conditional Formatting 설정 | Low | P2-T08 |

**Output**:
- Master Tables Google Sheets 워크북
- Data Validation 규칙 설정 완료
- Named Ranges 설정 완료

### Phase 3: Data Migration (Secondary Goal)

**목표**: Apps Script 기반 데이터 마이그레이션 도구 개발

**Tasks**:

| Task ID | Description | Priority | Dependencies |
|---------|-------------|----------|--------------|
| P3-T01 | Apps Script 프로젝트 설정 | High | P2 완료 |
| P3-T02 | xlsx 파일 파싱 모듈 개발 | High | P3-T01 |
| P3-T03 | 용지 데이터 변환 함수 개발 | High | P3-T02 |
| P3-T04 | 사이즈 데이터 변환 함수 개발 | High | P3-T02 |
| P3-T05 | 후가공 데이터 변환 함수 개발 | High | P3-T02 |
| P3-T06 | 제본 데이터 변환 함수 개발 | Medium | P3-T02 |
| P3-T07 | 상품 데이터 변환 함수 개발 | High | P3-T03 ~ P3-T06 |
| P3-T08 | 코드 정의 생성 함수 개발 | Medium | P3-T03 ~ P3-T06 |
| P3-T09 | 중복 검사 및 병합 로직 개발 | High | P3-T03 ~ P3-T08 |
| P3-T10 | 오류 처리 및 로깅 구현 | Medium | P3-T09 |
| P3-T11 | 마이그레이션 실행 UI 개발 | Low | P3-T10 |

**Output**:
- 완전한 Apps Script 마이그레이션 도구
- 오류 로그 시트
- 실행 UI (사이드바/대화상자)

### Phase 4: Verification (Final Goal)

**목표**: 마이그레이션 데이터 검증 및 품질 보증

**Tasks**:

| Task ID | Description | Priority | Dependencies |
|---------|-------------|----------|--------------|
| P4-T01 | 원본 대비 마이그레이션 데이터 비교 | High | P3 완료 |
| P4-T02 | 코드 형식 검증 | High | P3 완료 |
| P4-T03 | 참조 무결성 검증 | High | P3 완료 |
| P4-T04 | 누락 데이터 식별 | High | P4-T01 |
| P4-T05 | 중복 데이터 식별 | High | P4-T01 |
| P4-T06 | 마이그레이션 리포트 생성 | Medium | P4-T01 ~ P4-T05 |
| P4-T07 | 사용자 수락 테스트 (UAT) | High | P4-T06 |
| P4-T08 | 최종 문서화 | Medium | P4-T07 |

**Output**:
- 마이그레이션 검증 리포트
- 데이터 품질 리포트
- UAT 결과 문서
- 사용자 가이드

---

## 3. Technology Stack

### 3.1 Primary Tools

| Tool | Purpose | Version |
|------|---------|---------|
| Google Sheets | 마스터 데이터 저장 | Latest |
| Google Apps Script | 데이터 변환/마이그레이션 | V8 Runtime |
| xlsx.js (SheetJS) | xlsx 파일 파싱 | Community Edition |

### 3.2 Development Environment

```
Google Workspace
├── Google Sheets (Master Tables)
├── Google Apps Script (Migration Tool)
├── Google Drive (Source Files Storage)
└── Google Docs (Documentation)
```

### 3.3 Apps Script Libraries

| Library | Purpose | Notes |
|---------|---------|-------|
| Utilities | 날짜/시간 처리 | Built-in |
| SpreadsheetApp | 시트 조작 | Built-in |
| DriveApp | 파일 접근 | Built-in |
| Parser (custom) | xlsx 파싱 | Custom implementation |

---

## 4. Resource Requirements

### 4.1 Human Resources

| Role | Responsibility | Allocation |
|------|----------------|------------|
| Data Analyst | 데이터 분석 및 매핑 규칙 정의 | Phase 1 |
| Developer | Apps Script 개발 | Phase 2, 3 |
| QA | 데이터 검증 및 테스트 | Phase 4 |
| Business User | 요구사항 검토 및 UAT | All Phases |

### 4.2 Technical Resources

| Resource | Specification | Purpose |
|----------|---------------|---------|
| Google Workspace | Business Standard+ | Apps Script 실행 시간 확장 |
| Source xlsx Files | Read Access | 데이터 소스 |
| Test Environment | Separate Sheets | 개발/테스트 분리 |

---

## 5. Risk Analysis

### 5.1 Technical Risks

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| TR-01 | Apps Script 실행 시간 초과 (6분) | Medium | High | 배치 처리, 트리거 활용 |
| TR-02 | xlsx 파싱 오류 (복잡한 셀 병합) | Medium | Medium | 수동 검토 병행 |
| TR-03 | 대용량 데이터 처리 지연 | Low | Medium | 점진적 마이그레이션 |
| TR-04 | Google Sheets API 할당량 초과 | Low | High | 요청 최적화, 배치 처리 |

### 5.2 Data Risks

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| DR-01 | 원본 데이터 불일치/오류 | High | Medium | 데이터 품질 검사 우선 |
| DR-02 | 용어 매핑 누락 | Medium | Medium | 매핑 사전 사전 검토 |
| DR-03 | 중복 코드 생성 | Medium | High | 유일성 검증 로직 |
| DR-04 | 참조 무결성 위반 | Low | High | FK 검증 자동화 |

### 5.3 Risk Mitigation Strategy

1. **Phase 1 검토 게이트**: 분석 완료 후 이해관계자 검토
2. **점진적 마이그레이션**: 시트별 순차 처리
3. **롤백 계획**: 원본 데이터 보존, 마이그레이션 전 백업
4. **모니터링**: 실시간 오류 로깅 및 알림

---

## 6. Dependencies

### 6.1 External Dependencies

| Dependency | Description | Status |
|------------|-------------|--------|
| Source xlsx Files | 원본 데이터 파일 접근 | Required |
| Google Workspace | 개발/실행 환경 | Available |
| Business User Input | 용어 매핑 확인 | Required |

### 6.2 Internal Dependencies

```
Phase 1 (Analysis)
    ↓
Phase 2 (Master Tables) ← Code System Design
    ↓
Phase 3 (Migration) ← Mapping Dictionaries
    ↓
Phase 4 (Verification)
```

---

## 7. Quality Gates

### 7.1 Phase Completion Criteria

| Phase | Criteria | Validator |
|-------|----------|-----------|
| Phase 1 | 매핑 사전 100% 완성, 코드 규칙 확정 | Data Analyst |
| Phase 2 | 모든 마스터 테이블 구조 완성, Validation 규칙 적용 | Developer |
| Phase 3 | 마이그레이션 스크립트 테스트 통과, 오류율 < 1% | QA |
| Phase 4 | UAT 통과, 데이터 일치율 > 99% | Business User |

### 7.2 TRUST 5 Alignment

| Pillar | Application |
|--------|-------------|
| **T**ested | 모든 변환 함수 단위 테스트, 데이터 검증 자동화 |
| **R**eadable | 명확한 코드 규칙, 한/영 이중 명명 |
| **U**nified | 일관된 코드 형식, 표준 준수 |
| **S**ecured | 원본 데이터 보존, 접근 권한 관리 |
| **T**rackable | 변경 이력 기록, 마이그레이션 로그 |

---

## 8. Communication Plan

### 8.1 Stakeholders

| Stakeholder | Role | Communication |
|-------------|------|---------------|
| Project Owner | 최종 승인 | Phase 완료 시 리뷰 |
| Business User | 요구사항/검증 | 주간 진행 공유 |
| Developer | 구현 | 일일 스탠드업 |
| QA | 품질 보증 | 이슈 발생 시 즉시 |

### 8.2 Milestones

| Milestone | Description | Gate |
|-----------|-------------|------|
| M1 | Phase 1 완료 - 분석 및 매핑 | Stakeholder Review |
| M2 | Phase 2 완료 - 마스터 테이블 | Technical Review |
| M3 | Phase 3 완료 - 마이그레이션 | QA Validation |
| M4 | Phase 4 완료 - 검증 및 인수 | UAT Sign-off |

---

## 9. Technical Approach

### 9.1 Data Flow Architecture

```
[Source xlsx Files]
       ↓
[Apps Script Parser]
       ↓
[Transformation Layer]
  ├── Normalize Terms
  ├── Generate Codes
  ├── Validate Data
  └── Handle Duplicates
       ↓
[Master Tables (Google Sheets)]
  ├── PAPER_MASTER
  ├── SIZE_MASTER
  ├── FINISH_MASTER
  ├── BINDING_MASTER
  ├── PRODUCT_MASTER
  └── CODE_DEFINITION
       ↓
[Verification Layer]
  ├── Integrity Check
  ├── Completeness Check
  └── Consistency Check
       ↓
[Migration Report]
```

### 9.2 Code Structure (Apps Script)

```
/MigrationTool
├── Main.gs                 # Entry point, UI
├── Config.gs               # Configuration, constants
├── Parser/
│   ├── XlsxParser.gs       # xlsx file parsing
│   └── SheetReader.gs      # Source sheet reading
├── Transformers/
│   ├── PaperTransformer.gs
│   ├── SizeTransformer.gs
│   ├── FinishTransformer.gs
│   ├── BindingTransformer.gs
│   └── ProductTransformer.gs
├── Validators/
│   ├── CodeValidator.gs
│   ├── IntegrityValidator.gs
│   └── DataValidator.gs
├── Writers/
│   ├── MasterWriter.gs     # Write to master sheets
│   └── LogWriter.gs        # Error logging
└── Utils/
    ├── CodeGenerator.gs    # Code generation logic
    ├── MappingDict.gs      # Term mappings
    └── DateUtils.gs        # Date/time utilities
```

### 9.3 Migration Strategy

1. **Incremental Migration**: 시트별 순차 처리
2. **Idempotent Operations**: 재실행 가능한 마이그레이션
3. **Dry Run Mode**: 실제 쓰기 없이 검증만 수행
4. **Rollback Support**: 마이그레이션 전 스냅샷 저장

---

## 10. Traceability

### 10.1 SPEC Reference

- Main SPEC: [SPEC-NORMALIZE-001](./spec.md)
- Acceptance Criteria: [acceptance.md](./acceptance.md)

### 10.2 TAG Mapping

| TAG | Implementation |
|-----|----------------|
| [TAG:PAPER_MASTER] | P2-T02, P3-T03 |
| [TAG:SIZE_MASTER] | P2-T03, P3-T04 |
| [TAG:FINISH_MASTER] | P2-T04, P3-T05 |
| [TAG:BINDING_MASTER] | P2-T05, P3-T06 |
| [TAG:PRODUCT_MASTER] | P2-T06, P3-T07 |
| [TAG:CODE_DEFINITION] | P2-T07, P3-T08 |

---

**Document Status**: Planned
**Next Action**: Phase 1 시작 - 데이터 분석
**Quality Gate**: Phase 완료 시 Stakeholder Review Required
