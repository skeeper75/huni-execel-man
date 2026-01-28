# 후니프린팅 데이터 마이그레이션 도구

Google Apps Script 기반 데이터 정규화 마이그레이션 도구입니다. 기존 xlsx 파일의 비정규화된 데이터를 산업 표준에 부합하는 마스터 테이블로 변환합니다.

## 개요

이 도구는 SPEC-NORMALIZE-001(후니프린팅 xlsx 데이터 정규화)의 구현으로, 다음 기능을 제공합니다:

- **6개 마스터 테이블 생성**: PAPER_MASTER, SIZE_MASTER, FINISH_MASTER, BINDING_MASTER, PRODUCT_MASTER, CODE_DEFINITION
- **코드 정규화**: `[CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]` 형식으로 통일
- **데이터 검증**: 코드 형식, 참조 무결성, 필수 필드 검증
- **자동 매핑**: 용지 유형, 사이즈, 후가공, 제본 타입 자동 매핑

## 프로젝트 구조

```
apps-script-project/
├── Main.gs                      # 메인 진입점
├── Config/
│   └── Config.gs                # 설정 상수
├── Transformers/
│   ├── PaperTransformer.gs      # 용지 데이터 변환
│   ├── SizeTransformer.gs       # 사이즈 데이터 변환
│   ├── FinishTransformer.gs     # 후가공 데이터 변환
│   └── BindingTransformer.gs    # 제본 데이터 변환
├── Validators/
│   ├── CodeValidator.gs         # 코드 형식 검증
│   └── DataValidator.gs         # 데이터 무결성 검증
├── Writers/
│   └── MasterWriter.gs          # 마스터 테이블 쓰기
├── Utils/
│   ├── CodeGenerator.gs         # 코드 생성 유틸리티
│   └── Logger.gs                # 로깅 유틸리티
├── Tests/
│   ├── CodeGeneratorTest.gs     # 코드 생성 테스트
│   └── ValidatorTest.gs         # 검증 테스트
└── Sidebar.html                 # 사이드바 UI
```

## 기능 설명

### 1. 코드 생성

#### 용지 코드 (PAPER_MASTER)
- 형식: `PAPER_{TYPE}_{GSM}`
- 예시: `PAPER_ART_150`, `PAPER_SNOW_200`

#### 사이즈 코드 (SIZE_MASTER)
- 형식: `SIZE_{NAME}_{VARIANT}`
- 예시: `SIZE_A4_ISO`, `SIZE_CARD_STD`, `SIZE_CUSTOM_200X300`

#### 후가공 코드 (FINISH_MASTER)
- 형식: `FINISH_{CATEGORY}_{SUB_TYPE}`
- 예시: `FINISH_LAM_GLOSS`, `FINISH_UV_SPOT`, `FINISH_FOIL_GOLD`

#### 제본 코드 (BINDING_MASTER)
- 형식: `BIND_{TYPE}_{VARIANT}`
- 예시: `BIND_SADDLE_STD`, `BIND_PERFECT_STD`, `BIND_WIRE_STD`

#### 상품 코드 (PRODUCT_MASTER)
- 형식: `PROD_{CATEGORY}_{SEQUENCE}`
- 예시: `PROD_DIG_001`, `PROD_STK_050`, `PROD_BOOK_001`

### 2. 데이터 매핑

#### 용지 유형 매핑
- `아트지`, `아트` → `ART`
- `스노우지`, `스노우`, `스노화이트` → `SNOW`
- `모조지`, `모조` → `MOJO`
- `크라프트`, `크라프트지` → `KRAFT`
- `아이보리`, `백상지` → `IVORY`
- `랑데뷰`, `마시멜로`, `빛나래` → `SPECIAL`
- `누브지`, `스타드림` → `SPECIAL`

#### 사이즈 매핑
- `A3`, `A4`, `A5`, `A6` → ISO 216 표준
- `B4`, `B5` → JIS 표준
- `국전`, `국전지` → 한국 표준 (KS)
- `명함` → CUSTOM (90×50mm)

#### 후가공 매핑
- `유광 라미네이팅`, `유광코팅` → `FINISH_LAM_GLOSS`
- `무광 라미네이팅`, `무광코팅` → `FINISH_LAM_MATTE`
- `UV코팅`, `부분UV` → `FINISH_UV_SPOT`
- `전면UV` → `FINISH_UV_FULL`
- `금박`, `금색박` → `FINISH_FOIL_GOLD`
- `은박`, `은색박` → `FINISH_FOIL_SILVER`
- `엠보싱`, `형압` → `FINISH_EMB_STD`
- `도무송` → `FINISH_DIE_STD`
- `타공` → `FINISH_DIE_PUNCH`

#### 제본 매핑
- `중철`, `중철제본` → `BIND_SADDLE_STD` (8-64페이지)
- `무선`, `무선제본`, `떡제본` → `BIND_PERFECT_STD` (48-500페이지)
- `양장`, `양장제본` → `BIND_CASE_STD` (100-1000페이지)
- `와이어`, `와이어제본` → `BIND_WIRE_STD` (10-200페이지)
- `스프링`, `스프링제본` → `BIND_SPIRAL_STD` (10-300페이지)
- `PUR제본` → `BIND_PUR_STD` (100-800페이지)

### 3. 검증 규칙

#### 코드 형식 검증
- 패턴: `^[A-Z]+_[A-Z]+(_[A-Z0-9]+)*$`
- 소문자 불허
- 하이픈 불허 (언더스코어만 사용)
- 빈 세그먼트 불허

#### GSM 검증
- 범위: 50 - 500 g/m²
- 일반값: 80, 100, 120, 150, 180, 200, 250, 300, 350, 400
- 허용 오차: ±5%

#### 사이즈 검증
- ISO A 시리즈: 26-841mm (너비), 37-1189mm (높이)
- JIS B 시리즈: 32-1030mm (너비), 45-1456mm (높이)
- CUSTOM: 10-2000mm (너비), 10-3000mm (높이)

#### 참조 무결성 검증
- `PRODUCT_MASTER.default_paper_code` → `PAPER_MASTER.paper_code`
- `PRODUCT_MASTER.default_size_code` → `SIZE_MASTER.size_code`
- `PRODUCT_MASTER.available_papers` → `PAPER_MASTER.paper_code` (와일드카드 지원)

## 사용 방법

### Google Apps Script 설정

1. Google Sheets 새 스프레드시트 생성
2. 확장 프로그램 → Apps Script 열기
3. 프로젝트 이름: `후니프린팅 마이그레이션 도구`
4. 모든 `.gs` 파일 내용 복사하여 각각 생성

### 사이드바 실행

1. `Main.gs`에서 `showMigrationUI` 함수 실행
2. 사이드바에서 소스 파일 ID 입력
3. 옵션 선택 후 "마이그레이션 시작" 클릭

### 함수 직접 실행

```javascript
// 전체 마이그레이션 실행
runMigration({
  sourceFileIds: ['file_id_1', 'file_id_2'],
  clearExisting: true,
  validateOnly: false,
  dryRun: false
});

// 현재 스프레드시트 데이터 검증
validateCurrentSpreadsheet();

// 로그 요약 보기
getLogSummary();
```

## 테스트

### 단위 테스트 실행

```javascript
// 코드 생성 테스트
runAllCodeGeneratorTests();

// 검증 테스트
runAllValidatorTests();
```

### 테스트 커버리지

- **CodeGeneratorTest.gs**: 코드 생성, 매핑, 검증 함수 테스트
- **ValidatorTest.gs**: 데이터 검증 함수 테스트

## 성공 기준

### 필수 기준 (AC-01 ~ AC-05)
- [x] 모든 마스터 테이블이 정의된 스키마를 준수
- [x] 모든 코드가 `[CAT]_[SUBCAT]_[ATTR]_[SEQ]` 형식을 따름
- [ ] 원본 데이터 대비 마이그레이션 데이터 일치율 99% 이상
- [ ] 중복 코드 0건
- [ ] 참조 무결성 위반 0건

### 중요 기준 (AC-06 ~ AC-09)
- [x] 모든 용지 평량이 GSM 단위로 표현
- [x] 모든 사이즈가 표준(ISO/JIS/CUSTOM) 구분을 가짐
- [x] 한/영 이중 명명 지원
- [ ] 마이그레이션 로그에 모든 변환 내역 기록

### 추가 기준 (AC-10 ~ AC-12)
- [ ] MES 코드 매핑 완료
- [ ] 마이그레이션 실행 시간 30분 이내
- [x] 사용자 가이드 문서화

## 참조

- SPEC 문서: `.moai/specs/SPEC-NORMALIZE-001/spec.md`
- 계획 문서: `.moai/specs/SPEC-NORMALIZE-001/plan.md`
- 인수 기준: `.moai/specs/SPEC-NORMALIZE-001/acceptance.md`
- Excel 분석: `.claude/skills/innojini-huniprinting-domain/references/`

## 라이선스

이 프로젝트는 SPEC-NORMALIZE-001의 일부로 개발되었습니다.

## 버전

- v1.0.0 (2026-01-28): 초기 DDD 구현
