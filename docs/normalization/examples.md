# 사용 예시 (Examples)

본 문서는 후니프린팅 데이터 정규화 도구의 실제 사용 예시를 제공합니다.

## 목차

- [데이터 변환 예시](#데이터-변환-예시)
- [검증 예시](#검증-예시)
- [마이그레이션 예시](#마이그레이션-예시)
- [통합 예시](#통합-예시)
- [문제 해결](#문제-해결)

---

## 데이터 변환 예시

### 용지 데이터 변환

#### 입력 데이터

```javascript
const sourcePapers = [
  {용지명: '아트지 150g', 두께: '120μm', 표면: '광택'},
  {용지명: '스노우지 200g', 두께: '160μm', 표면: '무광'},
  {용지명: '모조지 100g', 두께: '90μm', 표면: '없음'},
  {용지명: '크라프트지 180g', 두께: '180μm', 표면: '거칠'},
  {용지명: '랑데뷰 250g', 두께: '200μm', 표면: '특수'}  // 미지 유형
];
```

#### 변환 결과

```javascript
const paperTransformer = new PaperTransformer();
const transformedPapers = sourcePapers.map(paper => paperTransformer.transform(paper));

// 결과:
[
  {
    paper_code: 'PAPER_ART_150',
    paper_name_ko: '아트지 150g',
    paper_name_en: 'Art Paper 150gsm',
    paper_type: 'ART',
    gsm: 150,
    thickness_um: 120,
    finish: 'GLOSS',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    paper_code: 'PAPER_SNOW_200',
    paper_name_ko: '스노우지 200g',
    paper_name_en: 'Snow White 200gsm',
    paper_type: 'SNOW',
    gsm: 200,
    thickness_um: 160,
    finish: 'MATTE',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    paper_code: 'PAPER_MOJO_100',
    paper_name_ko: '모조지 100g',
    paper_name_en: 'Uncoated 100gsm',
    paper_type: 'MOJO',
    gsm: 100,
    thickness_um: 90,
    finish: 'NONE',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    paper_code: 'PAPER_KRAFT_180',
    paper_name_ko: '크라프트지 180g',
    paper_name_en: 'Kraft 180gsm',
    paper_type: 'KRAFT',
    gsm: 180,
    thickness_um: 180,
    finish: 'ROUGH',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    paper_code: 'PAPER_SPECIAL_250_001',  // 미지 유형은 SPECIAL로 분류
    paper_name_ko: '랑데뷰 250g',
    paper_name_en: 'Specialty 250gsm',
    paper_type: 'SPECIAL',
    gsm: 250,
    thickness_um: 200,
    finish: 'SPECIAL',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  }
]
```

### 사이즈 데이터 변환

#### 입력 데이터

```javascript
const sourceSizes = [
  {사이즈: 'A4'},
  {사이즈: 'B5'},
  {사이즈: '국전'},
  {사이즈: '4x6'},
  {사이즈: '200x300mm'},
  {사이즈: '명함'}
];
```

#### 변환 결과

```javascript
const sizeTransformer = new SizeTransformer();
const transformedSizes = sourceSizes.map(size => sizeTransformer.transform(size));

// 결과:
[
  {
    size_code: 'SIZE_A4_ISO',
    size_name: 'A4',
    width_mm: 210,
    height_mm: 297,
    standard: 'ISO',
    orientation: 'PORTRAIT',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    size_code: 'SIZE_B5_JIS',
    size_name: 'B5',
    width_mm: 182,
    height_mm: 257,
    standard: 'JIS',
    orientation: 'PORTRAIT',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    size_code: 'SIZE_KUKJEON_KS',
    size_name: '국전',
    width_mm: 636,
    height_mm: 939,
    standard: 'KS',
    orientation: 'PORTRAIT',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    size_code: 'SIZE_46_KS',
    size_name: '4x6',
    width_mm: 788,
    height_mm: 1091,
    standard: 'KS',
    orientation: 'PORTRAIT',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    size_code: 'SIZE_CUSTOM_200X300',
    size_name: '200x300',
    width_mm: 200,
    height_mm: 300,
    standard: 'CUSTOM',
    orientation: 'LANDSCAPE',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    size_code: 'SIZE_CARD_STD',
    size_name: '명함',
    width_mm: 90,
    height_mm: 50,
    standard: 'CUSTOM',
    orientation: 'LANDSCAPE',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  }
]
```

### 후가공 데이터 변환

#### 입력 데이터

```javascript
const sourceFinishes = [
  {후가공: '유광 라미네이팅'},
  {후가공: '무광코팅'},
  {후가공: '금박'},
  {후가공: 'UV코팅'},
  {후가공: '엠보싱'},
  {후가공: '무광코팅+금박'}  // 복합 후가공
];
```

#### 변환 결과

```javascript
const finishTransformer = new FinishTransformer();
const transformedFinishes = sourceFinishes.map(finish => finishTransformer.transform(finish));

// 결과 (복합 후가공은 2개 레코드로 분리):
[
  {
    finish_code: 'FINISH_LAM_GLOSS',
    finish_name_ko: '유광 라미네이팅',
    finish_name_en: 'Gloss Lamination',
    category: 'LAM',
    sub_type: 'GLOSS',
    unit: '매',
    base_price: 100.00,
    min_quantity: 100,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    finish_code: 'FINISH_LAM_MATTE',
    finish_name_ko: '무광 라미네이팅',
    finish_name_en: 'Matte Lamination',
    category: 'LAM',
    sub_type: 'MATTE',
    unit: '매',
    base_price: 120.00,
    min_quantity: 100,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    finish_code: 'FINISH_FOIL_GOLD',
    finish_name_ko: '금박',
    finish_name_en: 'Gold Foil',
    category: 'FOIL',
    sub_type: 'GOLD',
    unit: '매',
    base_price: 200.00,
    min_quantity: 50,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    finish_code: 'FINISH_UV_SPOT',
    finish_name_ko: 'UV코팅',
    finish_name_en: 'Spot UV',
    category: 'UV',
    sub_type: 'SPOT',
    unit: '매',
    base_price: 150.00,
    min_quantity: 100,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    finish_code: 'FINISH_EMB_STD',
    finish_name_ko: '엠보싱',
    finish_name_en: 'Embossing',
    category: 'EMB',
    sub_type: 'STD',
    unit: '매',
    base_price: 80.00,
    min_quantity: 100,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  // 무광코팅+금박은 2개 레코드로 분리됨
  {
    finish_code: 'FINISH_LAM_MATTE',
    finish_name_ko: '무광 라미네이팅',
    finish_name_en: 'Matte Lamination',
    category: 'LAM',
    sub_type: 'MATTE',
    unit: '매',
    base_price: 120.00,
    min_quantity: 100,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    finish_code: 'FINISH_FOIL_GOLD',
    finish_name_ko: '금박',
    finish_name_en: 'Gold Foil',
    category: 'FOIL',
    sub_type: 'GOLD',
    unit: '매',
    base_price: 200.00,
    min_quantity: 50,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  }
]
```

### 제본 데이터 변환

#### 입력 데이터

```javascript
const sourceBindings = [
  {제본: '중철제본'},
  {제본: '무선제본'},
  {제본: '양장제본'},
  {제본: '와이어제본'},
  {제본: '스프링제본'},
  {제본: 'PUR제본'}
];
```

#### 변환 결과

```javascript
const bindingTransformer = new BindingTransformer();
const transformedBindings = sourceBindings.map(binding => bindingTransformer.transform(binding));

// 결과:
[
  {
    binding_code: 'BIND_SADDLE_STD',
    binding_name_ko: '중철 제본',
    binding_name_en: 'Saddle Stitch',
    binding_type: 'SADDLE',
    min_pages: 8,
    max_pages: 64,
    page_unit: 4,
    cover_required: false,
    spine_calculation: '(pages/2)*gsm*0.001',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    binding_code: 'BIND_PERFECT_STD',
    binding_name_ko: '무선 제본',
    binding_name_en: 'Perfect Binding',
    binding_type: 'PERFECT',
    min_pages: 48,
    max_pages: 500,
    page_unit: 8,
    cover_required: true,
    spine_calculation: '(pages/2)*gsm*0.001',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    binding_code: 'BIND_CASE_STD',
    binding_name_ko: '양장 제본',
    binding_name_en: 'Case Binding',
    binding_type: 'CASE',
    min_pages: 100,
    max_pages: 1000,
    page_unit: 16,
    cover_required: true,
    spine_calculation: '(pages/2)*gsm*0.0015',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    binding_code: 'BIND_WIRE_STD',
    binding_name_ko: '와이어 제본',
    binding_name_en: 'Wire Binding',
    binding_type: 'WIRE',
    min_pages: 10,
    max_pages: 200,
    page_unit: 2,
    cover_required: false,
    spine_calculation: null,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    binding_code: 'BIND_SPIRAL_STD',
    binding_name_ko: '스프링 제본',
    binding_name_en: 'Spiral Binding',
    binding_type: 'SPIRAL',
    min_pages: 10,
    max_pages: 300,
    page_unit: 2,
    cover_required: false,
    spine_calculation: null,
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  },
  {
    binding_code: 'BIND_PUR_STD',
    binding_name_ko: 'PUR 제본',
    binding_name_en: 'PUR Binding',
    binding_type: 'PUR',
    min_pages: 100,
    max_pages: 800,
    page_unit: 8,
    cover_required: true,
    spine_calculation: '(pages/2)*gsm*0.0012',
    status: 'A',
    created_at: '2026-01-29T10:00:00',
    updated_at: '2026-01-29T10:00:00'
  }
]
```

---

## 검증 예시

### 코드 형식 검증

```javascript
const codeValidator = new CodeValidator();

// 유효한 코드
const validCodes = [
  'PAPER_ART_150',
  'SIZE_A4_ISO',
  'FINISH_LAM_GLOSS',
  'BIND_SADDLE_STD',
  'PROD_DIG_001'
];

validCodes.forEach(code => {
  const result = codeValidator.validateCodeFormat(code);
  console.log(`${code}: ${result.valid ? '✓' : '✗'}`);
});
// 모두 ✓

// 무효한 코드
const invalidCodes = [
  'paper_art_150',      // 소문자
  'PAPER-ART-150',      // 잘못된 구분자
  'PAPER_Art_150',      // 혼합 케이스
  'PAPER__ART_150',     // 이중 언더스코어
  'PAPER_ART'           // 필수 세그먼트 누락
];

invalidCodes.forEach(code => {
  const result = codeValidator.validateCodeFormat(code);
  console.log(`${code}: ${result.valid ? '✓' : '✗'} - ${result.message}`);
});
// 모두 ✗
```

### 중복 검증

```javascript
const codeValidator = new CodeValidator();

const codes = [
  'PAPER_ART_150',
  'SIZE_A4_ISO',
  'PAPER_ART_150',  // 중복
  'FINISH_LAM_GLOSS',
  'SIZE_A4_ISO'     // 중복
];

const result = codeValidator.validateUniqueness(codes);
console.log(result);
// {
//   hasDuplicates: true,
//   duplicates: ['PAPER_ART_150', 'SIZE_A4_ISO'],
//   duplicateCount: 2
// }
```

### 참조 무결성 검증

```javascript
const codeValidator = new CodeValidator();

const products = [
  {product_code: 'PROD_001', default_paper_code: 'PAPER_ART_150'},
  {product_code: 'PROD_002', default_paper_code: 'PAPER_SNOW_200'},
  {product_code: 'PROD_003', default_paper_code: 'PAPER_INVALID'}  // 무효한 참조
];

const paperCodes = ['PAPER_ART_150', 'PAPER_SNOW_200', 'PAPER_MOJO_100'];

const result = codeValidator.validateReferenceIntegrity(
  products,
  paperCodes,
  'default_paper_code'
);

console.log(result);
// {
//   valid: false,
//   violations: [
//     {record: 'PROD_003', field: 'default_paper_code', value: 'PAPER_INVALID'}
//   ]
// }
```

### GSM 검증

```javascript
const dataValidator = new DataValidator();

const gsmValues = [80, 150, 200, 400, 600];  // 600은 범위 초과

gsmValues.forEach(gsm => {
  const result = dataValidator.validateGSM(gsm);
  console.log(`GSM ${gsm}: ${result.valid ? '✓' : '✗'} - ${result.message}`);
});
// GSM 80: ✓ - Valid GSM
// GSM 150: ✓ - Valid GSM
// GSM 200: ✓ - Valid GSM
// GSM 400: ✓ - Valid GSM
// GSM 600: ✗ - GSM out of range (50-500)
```

---

## 마이그레이션 예시

### 전체 마이그레이션 프로세스

```javascript
// Main.gs에서의 마이그레이션 함수
function runMigration() {
  const startTime = new Date();
  Logger.log('Migration started at: ' + startTime.toISOString());

  try {
    // 1. 환경 설정 로드
    const config = loadConfig();

    // 2. 데이터 로드
    const sourceData = loadSourceData(config.SOURCE_FILE_ID);
    Logger.log('Loaded ' + Object.keys(sourceData).length + ' source sheets');

    // 3. 데이터 변환
    const transformedData = transformAllData(sourceData);
    Logger.log('Transformed data completed');

    // 4. 데이터 검증
    const validationResult = validateAllData(transformedData);
    if (!validationResult.valid) {
      throw new Error('Validation failed: ' + validationResult.errors.join(', '));
    }
    Logger.log('Validation passed');

    // 5. 데이터 기록
    const writeResult = writeAllData(transformedData);
    Logger.log('Data write completed');

    // 6. 리포트 생성
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;  // 초 단위

    const report = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration + ' seconds',
      summary: {
        totalProcessed: Object.values(writeResult).reduce((sum, r) => sum + r.inserted + r.updated, 0),
        totalInserted: Object.values(writeResult).reduce((sum, r) => sum + r.inserted, 0),
        totalUpdated: Object.values(writeResult).reduce((sum, r) => sum + r.updated, 0),
        totalErrors: Object.values(writeResult).reduce((sum, r) => sum + r.errors.length, 0)
      },
      details: writeResult
    };

    Logger.log('Migration completed successfully');
    Logger.log('Report: ' + JSON.stringify(report, null, 2));

    return report;

  } catch (error) {
    Logger.logError('Migration failed: ' + error.message);
    throw error;
  }
}

function transformAllData(sourceData) {
  const transformers = {
    PAPER: new PaperTransformer(),
    SIZE: new SizeTransformer(),
    FINISH: new FinishTransformer(),
    BINDING: new BindingTransformer()
  };

  const result = {};

  // 각 시트별 변환
  if (sourceData.papers) {
    result.papers = transformers.PAPER.transformBatch(sourceData.papers);
  }

  if (sourceData.sizes) {
    result.sizes = transformers.SIZE.transformBatch(sourceData.sizes);
  }

  if (sourceData.finishes) {
    result.finishes = transformers.FINISH.transformBatch(sourceData.finishes);
  }

  if (sourceData.bindings) {
    result.bindings = transformers.BINDING.transformBatch(sourceData.bindings);
  }

  return result;
}

function validateAllData(transformedData) {
  const validator = new DataValidator();
  const codeValidator = new CodeValidator();
  const errors = [];

  // 각 마스터 테이블별 검증
  Object.keys(transformedData).forEach(key => {
    const records = transformedData[key];
    const masterType = key.toUpperCase() + '_MASTER';

    // 필수 필드 검증
    records.forEach(record => {
      const result = validator.validateRequiredFields(record, masterType);
      if (!result.valid) {
        errors.push(`${masterType} - Missing fields: ${result.missing.join(', ')}`);
      }
    });

    // 코드 형식 검증
    const codes = records.map(r => r[Object.keys(r)[0]]);  // 첫 번째 필드가 코드라고 가정
    codes.forEach(code => {
      const result = codeValidator.validateCodeFormat(code);
      if (!result.valid) {
        errors.push(`${masterType} - Invalid code format: ${code}`);
      }
    });

    // 중복 검증
    const uniquenessResult = codeValidator.validateUniqueness(codes);
    if (uniquenessResult.hasDuplicates) {
      errors.push(`${masterType} - Duplicate codes: ${uniquenessResult.duplicates.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function writeAllData(transformedData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const writer = new MasterWriter(spreadsheet);

  const result = {};

  // 각 마스터 테이블에 기록
  Object.keys(transformedData).forEach(key => {
    const records = transformedData[key];
    const masterType = key.toUpperCase() + '_MASTER';
    result[masterType] = writer.writeBatch(masterType, records);
  });

  return result;
}
```

---

## 통합 예시

### 완전한 워크플로우 예시

```javascript
/**
 * 완전한 마이그레이션 워크플로우 예시
 */
function completeMigrationExample() {
  // 1. 설정
  const config = {
    SOURCE_FILE_ID: 'your-source-file-id',
    SPREADSHEET_ID: 'your-spreadsheet-id'
  };

  // 2. 초기화
  const spreadsheet = SpreadsheetApp.openById(config.SPREADSHEET_ID);
  const migration = new DataMigration(config);

  // 3. 마이그레이션 실행
  const report = migration.execute();

  // 4. 결과 확인
  console.log('Migration Report:');
  console.log('  Duration:', report.duration);
  console.log('  Total Inserted:', report.summary.totalInserted);
  console.log('  Total Updated:', report.summary.totalUpdated);
  console.log('  Total Errors:', report.summary.totalErrors);

  // 5. 후속 검증
  const validationReport = validateCurrentSpreadsheet();
  console.log('Validation Report:');
  console.log('  All valid:', validationReport.allValid);
  console.log('  Total issues:', validationReport.totalIssues);

  return {
    migration: report,
    validation: validationReport
  };
}

/**
 * 사후 검증 함수
 */
function validateCurrentSpreadsheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const validator = new DataValidator();
  const codeValidator = new CodeValidator();

  const masterTypes = [
    'PAPER_MASTER',
    'SIZE_MASTER',
    'FINISH_MASTER',
    'BINDING_MASTER',
    'PRODUCT_MASTER'
  ];

  const issues = [];

  masterTypes.forEach(masterType => {
    const sheet = spreadsheet.getSheetByName(masterType);
    if (!sheet) {
      issues.push({type: 'MISSING_SHEET', master: masterType});
      return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const records = data.slice(1);

    // 코드 형식 검증
    const codeColumn = headers[0];
    records.forEach((row, index) => {
      const code = row[0];
      const result = codeValidator.validateCodeFormat(code);
      if (!result.valid) {
        issues.push({
          type: 'INVALID_CODE',
          master: masterType,
          row: index + 2,
          code: code,
          error: result.message
        });
      }
    });

    // 중복 검증
    const codes = records.map(row => row[0]);
    const uniquenessResult = codeValidator.validateUniqueness(codes);
    if (uniquenessResult.hasDuplicates) {
      uniquenessResult.duplicates.forEach(code => {
        issues.push({
          type: 'DUPLICATE_CODE',
          master: masterType,
          code: code
        });
      });
    }
  });

  return {
    allValid: issues.length === 0,
    totalIssues: issues.length,
    issues: issues
  };
}
```

---

## 문제 해결

### 일반적인 문제 및 해결 방법

#### 1. 코드 형식 오류

**문제**:
```javascript
{valid: false, message: 'Lowercase not allowed'}
```

**해결**:
```javascript
// 잘못된 코드
const wrong = 'paper_art_150';

// 올바른 코드
const correct = 'PAPER_ART_150';
```

#### 2. 중복 코드 오류

**문제**:
```javascript
{hasDuplicates: true, duplicates: ['PAPER_ART_150']}
```

**해결**:
```javascript
// 중복 확인 후 처리
const existing = masterWriter.checkDuplicate('PAPER_MASTER', 'PAPER_ART_150');
if (existing.exists) {
  // 업데이트 또는 건너뜀
  masterWriter.updateRecord('PAPER_MASTER', 'PAPER_ART_150', updates);
} else {
  // 새 레코드 삽입
  masterWriter.writeRecord('PAPER_MASTER', record);
}
```

#### 3. 참조 무결성 위반

**문제**:
```javascript
{valid: false, violations: [{record: 'PROD_003', field: 'default_paper_code', value: 'PAPER_INVALID'}]}
```

**해결**:
```javascript
// 참조 코드 확인
const paperCodes = getAllPaperCodes();
if (!paperCodes.includes('PAPER_ART_150')) {
  console.warn('Paper code PAPER_ART_150 does not exist');
  // 기본값 설정 또는 오류 처리
  record.default_paper_code = null;
}
```

#### 4. GSM 범위 초과

**문제**:
```javascript
{valid: false, message: 'GSM out of range (50-500)'}
```

**해결**:
```javascript
// GSM 값 조정
let gsm = extractGSM(paperName);
if (gsm < 50) gsm = 50;
if (gsm > 500) gsm = 500;
```

---

**버전**: 1.0.0
**최종 업데이트**: 2026-01-29
