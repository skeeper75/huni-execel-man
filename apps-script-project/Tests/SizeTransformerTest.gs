/**
 * Size Transformer Tests
 *
 * Unit tests for size transformation functions
 */

/**
 * Test transformSize with A4 ISO
 * @return {Object} Test result
 */
function testTransformSize_A4ISO() {
  var sourceSize = {
    name: 'A4'
  };

  var result = transformSize(sourceSize);

  var tests = [
    { field: 'size_code', expected: 'SIZE_A4_ISO' },
    { field: 'size_name', expected: 'A4' },
    { field: 'width_mm', expected: 210 },
    { field: 'height_mm', expected: 297 },
    { field: 'standard', expected: 'ISO' },
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
    function: 'testTransformSize_A4ISO',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test transformSize with A3 ISO
 * @return {Object} Test result
 */
function testTransformSize_A3ISO() {
  var sourceSize = {
    name: 'A3'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_A3ISO',
    total: 1,
    passed: result.size_code === 'SIZE_A3_ISO' ? 1 : 0,
    failed: result.size_code === 'SIZE_A3_ISO' ? 0 : 1
  };
}

/**
 * Test transformSize with B5 JIS
 * @return {Object} Test result
 */
function testTransformSize_B5JIS() {
  var sourceSize = {
    name: 'B5'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_B5JIS',
    total: 1,
    passed: result.size_code === 'SIZE_B5_JIS' ? 1 : 0,
    failed: result.size_code === 'SIZE_B5_JIS' ? 0 : 1
  };
}

/**
 * Test transformSize with Korean standard
 * @return {Object} Test result
 */
function testTransformSize_KoreanStandard() {
  var sourceSize = {
    name: '국전'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_KoreanStandard',
    total: 1,
    passed: result.standard === 'KS' ? 1 : 0,
    failed: result.standard === 'KS' ? 0 : 1
  };
}

/**
 * Test transformSize with custom size
 * @return {Object} Test result
 */
function testTransformSize_CustomSize() {
  var sourceSize = {
    name: '200x300'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_CustomSize',
    total: 1,
    passed: result.standard === 'CUSTOM' &&
              result.width_mm === 200 &&
              result.height_mm === 300 ? 1 : 0,
    failed: result.standard === 'CUSTOM' &&
              result.width_mm === 200 &&
              result.height_mm === 300 ? 0 : 1
  };
}

/**
 * Test transformSize with Korean field name
 * @return {Object} Test result
 */
function testTransformSize_KoreanFieldName() {
  var sourceSize = {
    사이즈: 'A4'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_KoreanFieldName',
    total: 1,
    passed: result.size_name === 'A4' ? 1 : 0,
    failed: result.size_name === 'A4' ? 0 : 1
  };
}

/**
 * Test transformSize with orientation
 * @return {Object} Test result
 */
function testTransformSize_WithOrientation() {
  var sourceSize = {
    name: 'A4',
    orientation: 'portrait'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_WithOrientation',
    total: 1,
    passed: result.orientation === 'PORTRAIT' ? 1 : 0,
    failed: result.orientation === 'PORTRAIT' ? 0 : 1
  };
}

/**
 * Test transformSize with Korean orientation
 * @return {Object} Test result
 */
function testTransformSize_KoreanOrientation() {
  var sourceSize = {
    name: 'A4',
    방향: '가로'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_KoreanOrientation',
    total: 1,
    passed: result.orientation === 'LANDSCAPE' ? 1 : 0,
    failed: result.orientation === 'LANDSCAPE' ? 0 : 1
  };
}

/**
 * Test transformSize with bleed
 * @return {Object} Test result
 */
function testTransformSize_WithBleed() {
  var sourceSize = {
    name: 'A4',
    bleed: 5
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_WithBleed',
    total: 1,
    passed: result.bleed_mm === 5 ? 1 : 0,
    failed: result.bleed_mm === 5 ? 0 : 1
  };
}

/**
 * Test transformSize with default bleed
 * @return {Object} Test result
 */
function testTransformSize_DefaultBleed() {
  var sourceSize = {
    name: 'A4'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_DefaultBleed',
    total: 1,
    passed: result.bleed_mm === 3 ? 1 : 0,
    failed: result.bleed_mm === 3 ? 0 : 1
  };
}

/**
 * Test transformSize with safe margin
 * @return {Object} Test result
 */
function testTransformSize_WithSafeMargin() {
  var sourceSize = {
    name: 'A4',
    safe_margin: 10
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_WithSafeMargin',
    total: 1,
    passed: result.safe_margin_mm === 10 ? 1 : 0,
    failed: result.safe_margin_mm === 10 ? 0 : 1
  };
}

/**
 * Test transformSize with default safe margin
 * @return {Object} Test result
 */
function testTransformSize_DefaultSafeMargin() {
  var sourceSize = {
    name: 'A4'
  };

  var result = transformSize(sourceSize);

  return {
    function: 'testTransformSize_DefaultSafeMargin',
    total: 1,
    passed: result.safe_margin_mm === 5 ? 1 : 0,
    failed: result.safe_margin_mm === 5 ? 0 : 1
  };
}

/**
 * Test transformSizes batch transformation
 * @return {Object} Test result
 */
function testTransformSizes_Batch() {
  var sourceSizes = [
    { name: 'A4' },
    { name: 'A3' },
    { name: 'B5' }
  ];

  var results = transformSizes(sourceSizes);

  var passed = results.length === 3 &&
                results[0].size_code === 'SIZE_A4_ISO' &&
                results[1].size_code === 'SIZE_A3_ISO' &&
                results[2].size_code === 'SIZE_B5_JIS';

  return {
    function: 'testTransformSizes_Batch',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1
  };
}

/**
 * Test transformSizes with duplicates
 * @return {Object} Test result
 */
function testTransformSizes_WithDuplicates() {
  var sourceSizes = [
    { name: 'A4' },
    { name: 'A4' },  // Duplicate
    { name: 'A3' }
  ];

  var results = transformSizes(sourceSizes);

  return {
    function: 'testTransformSizes_WithDuplicates',
    total: 1,
    passed: results.length === 2 ? 1 : 0,
    failed: results.length === 2 ? 0 : 1
  };
}

/**
 * Test extractSizeName
 * @return {Object} Test result
 */
function testExtractSizeName() {
  var tests = [
    { input: { name: 'A4' }, expected: 'A4' },
    { input: { size_name: 'A3' }, expected: 'A3' },
    { input: { 사이즈: 'B5' }, expected: 'B5' },
    { input: { 규격: '국전' }, expected: '국전' },
    { input: {}, expected: 'Unknown' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = extractSizeName(tests[i].input);
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
    function: 'testExtractSizeName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test determineOrientation
 * @return {Object} Test result
 */
function testDetermineOrientation() {
  var tests = [
    { input: { orientation: 'PORTRAIT' }, expected: 'PORTRAIT' },
    { input: { orientation: 'landscape' }, expected: 'LANDSCAPE' },
    { input: { 방향: '세로' }, expected: 'PORTRAIT' },
    { input: { 방향: '가로' }, expected: 'LANDSCAPE' },
    { input: {}, expected: null }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = determineOrientation(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testDetermineOrientation',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractBleed
 * @return {Object} Test result
 */
function testExtractBleed() {
  var tests = [
    { input: { bleed: 5 }, expected: 5 },
    { input: { 블리드: 3 }, expected: 3 },
    { input: { 도련: 2 }, expected: 2 },
    { input: {}, expected: 3 }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractBleed(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractBleed',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractSafeMargin
 * @return {Object} Test result
 */
function testExtractSafeMargin() {
  var tests = [
    { input: { safe_margin: 10 }, expected: 10 },
    { input: { 안전여백: 15 }, expected: 15 },
    { input: {}, expected: 5 }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractSafeMargin(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractSafeMargin',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test parseTrimSize
 * @return {Object} Test result
 */
function testParseTrimSize() {
  var tests = [
    {
      input: { trim_size: { width: 210, height: 297 } },
      expected: { width: 210, height: 297 }
    },
    {
      input: { 재단사이즈: { width: 210, height: 297 } },
      expected: { width: 210, height: 297 }
    },
    {
      input: { 작업사이즈: { width: 216, height: 303 }, 블리드: 3 },
      expected: { width: 210, height: 297 }
    },
    {
      input: {},
      expected: null
    }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = parseTrimSize(tests[i].input);
    var isMatch = deepEqual(result, tests[i].expected);
    if (isMatch) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testParseTrimSize',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test parseWorkSize
 * @return {Object} Test result
 */
function testParseWorkSize() {
  var tests = [
    {
      input: { work_size: { width: 216, height: 303 } },
      expected: { width: 216, height: 303 }
    },
    {
      input: { 작업사이즈: { width: 216, height: 303 } },
      expected: { width: 216, height: 303 }
    }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = parseWorkSize(tests[i].input);
    var isMatch = deepEqual(result, tests[i].expected);
    if (isMatch) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testParseWorkSize',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Run all size transformer tests
 * @return {Object} All test results
 */
function runAllSizeTransformerTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testTransformSize_A4ISO',
    'testTransformSize_A3ISO',
    'testTransformSize_B5JIS',
    'testTransformSize_KoreanStandard',
    'testTransformSize_CustomSize',
    'testTransformSize_KoreanFieldName',
    'testTransformSize_WithOrientation',
    'testTransformSize_KoreanOrientation',
    'testTransformSize_WithBleed',
    'testTransformSize_DefaultBleed',
    'testTransformSize_WithSafeMargin',
    'testTransformSize_DefaultSafeMargin',
    'testTransformSizes_Batch',
    'testTransformSizes_WithDuplicates',
    'testExtractSizeName',
    'testDetermineOrientation',
    'testExtractBleed',
    'testExtractSafeMargin',
    'testParseTrimSize',
    'testParseWorkSize'
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
