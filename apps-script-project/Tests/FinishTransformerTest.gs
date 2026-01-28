/**
 * Finish Transformer Tests
 *
 * Unit tests for finish transformation functions
 */

/**
 * Test transformFinish with gloss lamination
 * @return {Object} Test result
 */
function testTransformFinish_GlossLamination() {
  var sourceFinish = {
    name: '유광 라미네이팅'
  };

  var result = transformFinish(sourceFinish);

  var tests = [
    { field: 'finish_code', expected: 'FINISH_LAM_GLOSS' },
    { field: 'finish_name_ko', expected: '유광 라미네이팅' },
    { field: 'finish_name_en', expected: 'Gloss Lamination' },
    { field: 'category', expected: 'LAM' },
    { field: 'sub_type', expected: 'GLOSS' },
    { field: 'status', expected: 'A' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    if (result[test.field] === test.expected) {
      passed++;
    } else {
      failed++;
      failures.push({
        field: test.field,
        expected: test.expected,
        actual: result[test.field]
      });
    }
  }

  return {
    function: 'testTransformFinish_GlossLamination',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test transformFinish with matte lamination
 * @return {Object} Test result
 */
function testTransformFinish_MatteLamination() {
  var sourceFinish = {
    name: '무광코팅'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_MatteLamination',
    total: 1,
    passed: result.finish_code === 'FINISH_LAM_MATTE' ? 1 : 0,
    failed: result.finish_code === 'FINISH_LAM_MATTE' ? 0 : 1
  };
}

/**
 * Test transformFinish with UV coating
 * @return {Object} Test result
 */
function testTransformFinish_UVCoating() {
  var sourceFinish = {
    name: 'UV코팅'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_UVCoating',
    total: 1,
    passed: result.finish_code === 'FINISH_UV_SPOT' ? 1 : 0,
    failed: result.finish_code === 'FINISH_UV_SPOT' ? 0 : 1
  };
}

/**
 * Test transformFinish with full UV
 * @return {Object} Test result
 */
function testTransformFinish_FullUV() {
  var sourceFinish = {
    name: '전면UV'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_FullUV',
    total: 1,
    passed: result.finish_code === 'FINISH_UV_FULL' ? 1 : 0,
    failed: result.finish_code === 'FINISH_UV_FULL' ? 0 : 1
  };
}

/**
 * Test transformFinish with gold foil
 * @return {Object} Test result
 */
function testTransformFinish_GoldFoil() {
  var sourceFinish = {
    name: '금박'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_GoldFoil',
    total: 1,
    passed: result.finish_code === 'FINISH_FOIL_GOLD' ? 1 : 0,
    failed: result.finish_code === 'FINISH_FOIL_GOLD' ? 0 : 1
  };
}

/**
 * Test transformFinish with silver foil
 * @return {Object} Test result
 */
function testTransformFinish_SilverFoil() {
  var sourceFinish = {
    name: '은박'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_SilverFoil',
    total: 1,
    passed: result.finish_code === 'FINISH_FOIL_SILVER' ? 1 : 0,
    failed: result.finish_code === 'FINISH_FOIL_SILVER' ? 0 : 1
  };
}

/**
 * Test transformFinish with embossing
 * @return {Object} Test result
 */
function testTransformFinish_Embossing() {
  var sourceFinish = {
    name: '엠보싱'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_Embossing',
    total: 1,
    passed: result.finish_code === 'FINISH_EMB_STD' ? 1 : 0,
    failed: result.finish_code === 'FINISH_EMB_STD' ? 0 : 1
  };
}

/**
 * Test transformFinish with die cutting
 * @return {Object} Test result
 */
function testTransformFinish_DieCutting() {
  var sourceFinish = {
    name: '도무송'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_DieCutting',
    total: 1,
    passed: result.finish_code === 'FINISH_DIE_STD' ? 1 : 0,
    failed: result.finish_code === 'FINISH_DIE_STD' ? 0 : 1
  };
}

/**
 * Test transformFinish with punch
 * @return {Object} Test result
 */
function testTransformFinish_Punch() {
  var sourceFinish = {
    name: '타공'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_Punch',
    total: 1,
    passed: result.finish_code === 'FINISH_DIE_PUNCH' ? 1 : 0,
    failed: result.finish_code === 'FINISH_DIE_PUNCH' ? 0 : 1
  };
}

/**
 * Test transformFinish with Korean field name
 * @return {Object} Test result
 */
function testTransformFinish_KoreanFieldName() {
  var sourceFinish = {
    후가공: '유광코팅'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_KoreanFieldName',
    total: 1,
    passed: result.finish_code === 'FINISH_LAM_GLOSS' ? 1 : 0,
    failed: result.finish_code === 'FINISH_LAM_GLOSS' ? 0 : 1
  };
}

/**
 * Test transformFinish with unit
 * @return {Object} Test result
 */
function testTransformFinish_WithUnit() {
  var sourceFinish = {
    name: '유광코팅',
    unit: 'm2'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_WithUnit',
    total: 1,
    passed: result.unit === 'm2' ? 1 : 0,
    failed: result.unit === 'm2' ? 0 : 1
  };
}

/**
 * Test transformFinish with default unit
 * @return {Object} Test result
 */
function testTransformFinish_DefaultUnit() {
  var sourceFinish = {
    name: '유광코팅'
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_DefaultUnit',
    total: 1,
    passed: result.unit === '매' ? 1 : 0,
    failed: result.unit === '매' ? 0 : 1
  };
}

/**
 * Test transformFinish with base price
 * @return {Object} Test result
 */
function testTransformFinish_WithBasePrice() {
  var sourceFinish = {
    name: '유광코팅',
    base_price: 150
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_WithBasePrice',
    total: 1,
    passed: result.base_price === 150 ? 1 : 0,
    failed: result.base_price === 150 ? 0 : 1
  };
}

/**
 * Test transformFinish with min quantity
 * @return {Object} Test result
 */
function testTransformFinish_WithMinQuantity() {
  var sourceFinish = {
    name: '유광코팅',
    min_quantity: 100
  };

  var result = transformFinish(sourceFinish);

  return {
    function: 'testTransformFinish_WithMinQuantity',
    total: 1,
    passed: result.min_quantity === 100 ? 1 : 0,
    failed: result.min_quantity === 100 ? 0 : 1
  };
}

/**
 * Test transformFinishes batch transformation
 * @return {Object} Test result
 */
function testTransformFinishes_Batch() {
  var sourceFinishes = [
    { name: '유광코팅' },
    { name: '무광코팅' },
    { name: 'UV코팅' }
  ];

  var results = transformFinishes(sourceFinishes);

  var passed = results.length === 3 &&
                results[0].finish_code === 'FINISH_LAM_GLOSS' &&
                results[1].finish_code === 'FINISH_LAM_MATTE' &&
                results[2].finish_code === 'FINISH_UV_SPOT';

  return {
    function: 'testTransformFinishes_Batch',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1
  };
}

/**
 * Test transformFinishes with duplicates
 * @return {Object} Test result
 */
function testTransformFinishes_WithDuplicates() {
  var sourceFinishes = [
    { name: '유광코팅' },
    { name: '유광코팅' },  // Duplicate
    { name: '무광코팅' }
  ];

  var results = transformFinishes(sourceFinishes);

  return {
    function: 'testTransformFinishes_WithDuplicates',
    total: 1,
    passed: results.length === 2 ? 1 : 0,
    failed: results.length === 2 ? 0 : 1
  };
}

/**
 * Test extractFinishName
 * @return {Object} Test result
 */
function testExtractFinishName() {
  var tests = [
    { input: { name: '유광코팅' }, expected: '유광코팅' },
    { input: { finish_name: '무광코팅' }, expected: '무광코팅' },
    { input: { 후가공: 'UV코팅' }, expected: 'UV코팅' },
    { input: { 코팅: '전면UV' }, expected: '전면UV' },
    { input: {}, expected: 'Unknown' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = extractFinishName(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
      failures.push({
        test: i + 1,
        expected: tests[i].expected,
        actual: result
      });
    }
  }

  return {
    function: 'testExtractFinishName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test generateEnglishFinishName
 * @return {Object} Test result
 */
function testGenerateEnglishFinishName() {
  var tests = [
    { input: ['LAM', 'GLOSS'], expected: 'Gloss Lamination' },
    { input: ['LAM', 'MATTE'], expected: 'Matte Lamination' },
    { input: ['UV', 'SPOT'], expected: 'Spot UV Coating' },
    { input: ['UV', 'FULL'], expected: 'Full UV Coating' },
    { input: ['FOIL', 'GOLD'], expected: 'Gold Foil' },
    { input: ['FOIL', 'SILVER'], expected: 'Silver Foil' },
    { input: ['EMB', 'STD'], expected: 'Standard Embossing' },
    { input: ['DIE', 'PUNCH'], expected: 'Punch Die Cutting' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = generateEnglishFinishName(tests[i].input[0], tests[i].input[1]);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
      failures.push({
        test: i + 1,
        expected: tests[i].expected,
        actual: result
      });
    }
  }

  return {
    function: 'testGenerateEnglishFinishName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test extractUnit
 * @return {Object} Test result
 */
function testExtractUnit() {
  var tests = [
    { input: { unit: 'm2' }, expected: 'm2' },
    { input: { 단위: '매' }, expected: '매' },
    { input: {}, expected: '매' }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractUnit(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractUnit',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractBasePrice
 * @return {Object} Test result
 */
function testExtractBasePrice() {
  var tests = [
    { input: { base_price: 150 }, expected: 150 },
    { input: { 기본단가: 200 }, expected: 200 },
    { input: { 단가: 180 }, expected: 180 },
    { input: {}, expected: null }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractBasePrice(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractBasePrice',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractMinQuantity
 * @return {Object} Test result
 */
function testExtractMinQuantity() {
  var tests = [
    { input: { min_quantity: 100 }, expected: 100 },
    { input: { 최소수량: 50 }, expected: 50 },
    { input: {}, expected: null }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractMinQuantity(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractMinQuantity',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractApplicablePapers
 * @return {Object} Test result
 */
function testExtractApplicablePapers() {
  var tests = [
    { input: { applicable_papers: 'ART,SNOW' }, expected: 'ART,SNOW' },
    { input: { 적용용지: 'ART,MOJO' }, expected: 'ART,MOJO' },
    {
      input: { category: 'LAM' },
      expected: 'ART,SNOW,IVORY'  // Default for LAM/UV
    },
    {
      input: { category: 'EMB' },
      expected: null  // No default for other categories
    }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractApplicablePapers(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractApplicablePapers',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test parseCompositeFinish
 * @return {Object} Test result
 */
function testParseCompositeFinish() {
  var tests = [
    {
      input: '무광코팅+금박',
      expected: ['무광코팅', '금박']
    },
    {
      input: 'UV코팅＋엠보싱',
      expected: ['UV코팅', '엠보싱']
    },
    {
      input: '유광코팅&도무송',
      expected: ['유광코팅', '도무송']
    },
    {
      input: '단일코팅',
      expected: ['단일코팅']
    }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = parseCompositeFinish(tests[i].input);
    var isMatch = deepEqual(result, tests[i].expected);
    if (isMatch) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testParseCompositeFinish',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Run all finish transformer tests
 * @return {Object} All test results
 */
function runAllFinishTransformerTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testTransformFinish_GlossLamination',
    'testTransformFinish_MatteLamination',
    'testTransformFinish_UVCoating',
    'testTransformFinish_FullUV',
    'testTransformFinish_GoldFoil',
    'testTransformFinish_SilverFoil',
    'testTransformFinish_Embossing',
    'testTransformFinish_DieCutting',
    'testTransformFinish_Punch',
    'testTransformFinish_KoreanFieldName',
    'testTransformFinish_WithUnit',
    'testTransformFinish_DefaultUnit',
    'testTransformFinish_WithBasePrice',
    'testTransformFinish_WithMinQuantity',
    'testTransformFinishes_Batch',
    'testTransformFinishes_WithDuplicates',
    'testExtractFinishName',
    'testGenerateEnglishFinishName',
    'testExtractUnit',
    'testExtractBasePrice',
    'testExtractMinQuantity',
    'testExtractApplicablePapers',
    'testParseCompositeFinish'
  ];

  for (var i = 0; i < testFunctions.length; i++) {
    var funcName = testFunctions[i];
    try {
      var result = this[funcName]();
      allResults.tests[funcName] = result;
      allResults.total += result.total;
      allResults.passed += result.passed;
      allResults.failed += result.failed;
    } catch (e) {
      allResults.tests[funcName] = {
        error: e.toString()
      };
      allResults.failed++;
    }
  }

  return allResults;
}
