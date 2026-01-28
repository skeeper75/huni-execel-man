/**
 * Paper Transformer Tests
 *
 * Unit tests for paper transformation functions
 */

/**
 * Test transformPaper with valid art paper
 * @return {Object} Test result
 */
function testTransformPaper_ArtPaper150() {
  // Arrange
  var sourcePaper = {
    name: '아트지 150g',
    gram: 150
  };

  // Act
  var result = transformPaper(sourcePaper);

  // Assert
  var tests = [
    { field: 'paper_code', expected: 'PAPER_ART_150' },
    { field: 'paper_name_ko', expected: '아트지 150g' },
    { field: 'paper_name_en', expected: 'Art Paper 150gsm' },
    { field: 'paper_type', expected: 'ART' },
    { field: 'gsm', expected: 150 },
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
    function: 'testTransformPaper_ArtPaper150',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test transformPaper with snow paper
 * @return {Object} Test result
 */
function testTransformPaper_SnowPaper200() {
  var sourcePaper = {
    name: '스노우지 200g',
    gram: 200
  };

  var result = transformPaper(sourcePaper);

  var tests = [
    { field: 'paper_code', expected: 'PAPER_SNOW_200' },
    { field: 'paper_name_en', expected: 'Snow White 200gsm' },
    { field: 'paper_type', expected: 'SNOW' }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    if (result[tests[i].field] === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testTransformPaper_SnowPaper200',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test transformPaper with mojo paper
 * @return {Object} Test result
 */
function testTransformPaper_MojoPaper80() {
  var sourcePaper = {
    name: '모조지 80g',
    gram: 80
  };

  var result = transformPaper(sourcePaper);

  var tests = [
    { field: 'paper_code', expected: 'PAPER_MOJO_80' },
    { field: 'paper_name_en', expected: 'Uncoated 80gsm' },
    { field: 'paper_type', expected: 'MOJO' }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    if (result[tests[i].field] === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testTransformPaper_MojoPaper80',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test transformPaper with kraft paper
 * @return {Object} Test result
 */
function testTransformPaper_KraftPaper120() {
  var sourcePaper = {
    name: '크라프트지 120g'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_KraftPaper120',
    total: 1,
    passed: result.paper_code === 'PAPER_KRAFT_120' ? 1 : 0,
    failed: result.paper_code === 'PAPER_KRAFT_120' ? 0 : 1,
    actual: result.paper_code
  };
}

/**
 * Test transformPaper with ivory paper
 * @return {Object} Test result
 */
function testTransformPaper_IvoryPaper250() {
  var sourcePaper = {
    name: '아이보리 250g'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_IvoryPaper250',
    total: 1,
    passed: result.paper_code === 'PAPER_IVORY_250' ? 1 : 0,
    failed: result.paper_code === 'PAPER_IVORY_250' ? 0 : 1,
    actual: result.paper_code
  };
}

/**
 * Test transformPaper with special paper
 * @return {Object} Test result
 */
function testTransformPaper_SpecialPaper() {
  var sourcePaper = {
    name: '랑데뷰 180g'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_SpecialPaper',
    total: 1,
    passed: result.paper_code === 'PAPER_SPECIAL_180' ? 1 : 0,
    failed: result.paper_code === 'PAPER_SPECIAL_180' ? 0 : 1
  };
}

/**
 * Test transformPaper with Korean name field
 * @return {Object} Test result
 */
function testTransformPaper_KoreanNameField() {
  var sourcePaper = {
    종이명: '아트지 150g',
    gram: 150
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_KoreanNameField',
    total: 1,
    passed: result.paper_name_ko === '아트지 150g' ? 1 : 0,
    failed: result.paper_name_ko === '아트지 150g' ? 0 : 1
  };
}

/**
 * Test transformPaper with special markers in name
 * @return {Object} Test result
 */
function testTransformPaper_SpecialMarkersRemoved() {
  var sourcePaper = {
    name: '▶아트지 150g★'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_SpecialMarkersRemoved',
    total: 1,
    passed: result.paper_name_ko === '아트지 150g' ? 1 : 0,
    failed: result.paper_name_ko === '아트지 150g' ? 0 : 1
  };
}

/**
 * Test transformPaper with thickness
 * @return {Object} Test result
 */
function testTransformPaper_WithThickness() {
  var sourcePaper = {
    name: '아트지 150g',
    thickness: 120
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_WithThickness',
    total: 1,
    passed: result.thickness_um === 120 ? 1 : 0,
    failed: result.thickness_um === 120 ? 0 : 1
  };
}

/**
 * Test transformPaper with finish
 * @return {Object} Test result
 */
function testTransformPaper_WithFinish() {
  var sourcePaper = {
    name: '아트지 150g',
    finish: 'MATTE'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_WithFinish',
    total: 1,
    passed: result.finish === 'MATTE' ? 1 : 0,
    failed: result.finish === 'MATTE' ? 0 : 1
  };
}

/**
 * Test transformPaper with color
 * @return {Object} Test result
 */
function testTransformPaper_WithColor() {
  var sourcePaper = {
    name: '크라프트지 120g',
    color: 'BROWN'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_WithColor',
    total: 1,
    passed: result.color === 'BROWN' ? 1 : 0,
    failed: result.color === 'BROWN' ? 0 : 1
  };
}

/**
 * Test transformPaper with MES code
 * @return {Object} Test result
 */
function testTransformPaper_WithMESCode() {
  var sourcePaper = {
    name: '아트지 150g',
    mes_code: '001-0001'
  };

  var result = transformPaper(sourcePaper);

  return {
    function: 'testTransformPaper_WithMESCode',
    total: 1,
    passed: result.mes_code === '001-0001' ? 1 : 0,
    failed: result.mes_code === '001-0001' ? 0 : 1
  };
}

/**
 * Test transformPapers batch transformation
 * @return {Object} Test result
 */
function testTransformPapers_Batch() {
  var sourcePapers = [
    { name: '아트지 150g', gram: 150 },
    { name: '스노우지 200g', gram: 200 },
    { name: '모조지 80g', gram: 80 }
  ];

  var results = transformPapers(sourcePapers);

  var passed = results.length === 3 &&
                results[0].paper_code === 'PAPER_ART_150' &&
                results[1].paper_code === 'PAPER_SNOW_200' &&
                results[2].paper_code === 'PAPER_MOJO_80';

  return {
    function: 'testTransformPapers_Batch',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1
  };
}

/**
 * Test transformPapers with duplicates
 * @return {Object} Test result
 */
function testTransformPapers_WithDuplicates() {
  var sourcePapers = [
    { name: '아트지 150g', gram: 150 },
    { name: '아트지 150g', gram: 150 },  // Duplicate
    { name: '스노우지 200g', gram: 200 }
  ];

  var results = transformPapers(sourcePapers);

  // Should skip duplicate and only return 2 papers
  return {
    function: 'testTransformPapers_WithDuplicates',
    total: 1,
    passed: results.length === 2 ? 1 : 0,
    failed: results.length === 2 ? 0 : 1
  };
}

/**
 * Test transformPapers with invalid entry
 * @return {Object} Test result
 */
function testTransformPapers_WithInvalidEntry() {
  var sourcePapers = [
    { name: '아트지 150g', gram: 150 },
    { name: 'InvalidPaper' },  // Will fail transformation
    { name: '스노우지 200g', gram: 200 }
  ];

  var results = transformPapers(sourcePapers);

  // Should handle error gracefully and return 2 valid papers
  return {
    function: 'testTransformPapers_WithInvalidEntry',
    total: 1,
    passed: results.length === 2 ? 1 : 0,
    failed: results.length === 2 ? 0 : 1
  };
}

/**
 * Test extractPaperName with various fields
 * @return {Object} Test result
 */
function testExtractPaperName() {
  var tests = [
    { input: { name: '아트지 150g' }, expected: '아트지 150g' },
    { input: { 종이명: '스노우지 200g' }, expected: '스노우지 200g' },
    { input: { name: '▶아트지 150g★' }, expected: '아트지 150g' },
    { input: {}, expected: 'Unknown Paper' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = extractPaperName(tests[i].input);
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
    function: 'testExtractPaperName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test generateEnglishPaperName
 * @return {Object} Test result
 */
function testGenerateEnglishPaperName() {
  var tests = [
    { input: ['ART', 150], expected: 'Art Paper 150gsm' },
    { input: ['SNOW', 200], expected: 'Snow White 200gsm' },
    { input: ['MOJO', 80], expected: 'Uncoated 80gsm' },
    { input: ['KRAFT', 120], expected: 'Kraft 120gsm' },
    { input: ['IVORY', 250], expected: 'Ivory Board 250gsm' },
    { input: ['SPECIAL', 180], expected: 'Specialty 180gsm' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = generateEnglishPaperName(tests[i].input[0], tests[i].input[1]);
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
    function: 'testGenerateEnglishPaperName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test extractFinish
 * @return {Object} Test result
 */
function testExtractFinish() {
  var tests = [
    { input: { finish: 'GLOSS' }, expected: 'GLOSS' },
    { input: { 표면처리: 'MATTE' }, expected: 'MATTE' },
    { input: {}, expected: 'GLOSS' }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractFinish(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractFinish',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractColor
 * @return {Object} Test result
 */
function testExtractColor() {
  var tests = [
    { input: { color: 'WHITE' }, expected: 'WHITE' },
    { input: { 색상: 'CREAM' }, expected: 'CREAM' },
    { input: {}, expected: 'WHITE' }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractColor(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractColor',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractPrintability
 * @return {Object} Test result
 */
function testExtractPrintability() {
  var tests = [
    { input: { printability: 'HIGH' }, expected: 'HIGH' },
    { input: {}, expected: 'HIGH' }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractPrintability(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractPrintability',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Run all paper transformer tests
 * @return {Object} All test results
 */
function runAllPaperTransformerTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testTransformPaper_ArtPaper150',
    'testTransformPaper_SnowPaper200',
    'testTransformPaper_MojoPaper80',
    'testTransformPaper_KraftPaper120',
    'testTransformPaper_IvoryPaper250',
    'testTransformPaper_SpecialPaper',
    'testTransformPaper_KoreanNameField',
    'testTransformPaper_SpecialMarkersRemoved',
    'testTransformPaper_WithThickness',
    'testTransformPaper_WithFinish',
    'testTransformPaper_WithColor',
    'testTransformPaper_WithMESCode',
    'testTransformPapers_Batch',
    'testTransformPapers_WithDuplicates',
    'testTransformPapers_WithInvalidEntry',
    'testExtractPaperName',
    'testGenerateEnglishPaperName',
    'testExtractFinish',
    'testExtractColor',
    'testExtractPrintability'
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
