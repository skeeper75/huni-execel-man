/**
 * Code Generator Tests
 *
 * Unit tests for code generation functions
 */

/**
 * Test paper code generation
 * @return {Object} Test result
 */
function testGeneratePaperCode() {
  var tests = [
    { input: ['ART', 150], expected: 'PAPER_ART_150' },
    { input: ['SNOW', 200], expected: 'PAPER_SNOW_200' },
    { input: ['MOJO', 80], expected: 'PAPER_MOJO_80' },
    { input: ['KRAFT', 120], expected: 'PAPER_KRAFT_120' },
    { input: ['IVORY', 250], expected: 'PAPER_IVORY_250' },
    { input: ['SPECIAL', 300], expected: 'PAPER_SPECIAL_300' }
  ];

  var results = runTests('generatePaperCode', tests, function(args) {
    return generatePaperCode(args[0], args[1]);
  });

  return results;
}

/**
 * Test size code generation
 * @return {Object} Test result
 */
function testGenerateSizeCode() {
  var tests = [
    { input: ['A4', 'ISO'], expected: 'SIZE_A4_ISO' },
    { input: ['B5', 'JIS'], expected: 'SIZE_B5_JIS' },
    { input: ['CARD', 'STD'], expected: 'SIZE_CARD_STD' },
    { input: ['A3', 'ISO'], expected: 'SIZE_A3_ISO' },
    { input: ['CUSTOM', 'CUSTOM'], expected: 'SIZE_CUSTOM_CUSTOM' }
  ];

  var results = runTests('generateSizeCode', tests, function(args) {
    return generateSizeCode(args[0], args[1]);
  });

  return results;
}

/**
 * Test finish code generation
 * @return {Object} Test result
 */
function testGenerateFinishCode() {
  var tests = [
    { input: ['LAM', 'GLOSS'], expected: 'FINISH_LAM_GLOSS' },
    { input: ['LAM', 'MATTE'], expected: 'FINISH_LAM_MATTE' },
    { input: ['UV', 'SPOT'], expected: 'FINISH_UV_SPOT' },
    { input: ['FOIL', 'GOLD'], expected: 'FINISH_FOIL_GOLD' },
    { input: ['EMB', 'STD'], expected: 'FINISH_EMB_STD' },
    { input: ['DIE', 'PUNCH'], expected: 'FINISH_DIE_PUNCH' }
  ];

  var results = runTests('generateFinishCode', tests, function(args) {
    return generateFinishCode(args[0], args[1]);
  });

  return results;
}

/**
 * Test binding code generation
 * @return {Object} Test result
 */
function testGenerateBindingCode() {
  var tests = [
    { input: ['SADDLE', 'STD'], expected: 'BIND_SADDLE_STD' },
    { input: ['PERFECT', 'STD'], expected: 'BIND_PERFECT_STD' },
    { input: ['WIRE', 'STD'], expected: 'BIND_WIRE_STD' },
    { input: ['SPIRAL', 'STD'], expected: 'BIND_SPIRAL_STD' },
    { input: ['PUR', 'STD'], expected: 'BIND_PUR_STD' }
  ];

  var results = runTests('generateBindingCode', tests, function(args) {
    return generateBindingCode(args[0], args[1]);
  });

  return results;
}

/**
 * Test product code generation
 * @return {Object} Test result
 */
function testGenerateProductCode() {
  var tests = [
    { input: ['DIG', 1], expected: 'PROD_DIG_001' },
    { input: ['STK', 50], expected: 'PROD_STK_050' },
    { input: ['BOOK', 999], expected: 'PROD_BOOK_999' },
    { input: ['CAL', 10], expected: 'PROD_CAL_010' }
  ];

  var results = runTests('generateProductCode', tests, function(args) {
    return generateProductCode(args[0], args[1]);
  });

  return results;
}

/**
 * Test code validation
 * @return {Object} Test result
 */
function testValidateCodeFormat() {
  var tests = [
    { input: ['PAPER_ART_150', CODE_PATTERNS.PAPER], expected: true },
    { input: ['SIZE_A4_ISO', CODE_PATTERNS.SIZE], expected: true },
    { input: ['FINISH_LAM_GLOSS', CODE_PATTERNS.FINISH], expected: true },
    { input: ['BIND_SADDLE_STD', CODE_PATTERNS.BINDING], expected: true },
    { input: ['PROD_DIG_001', CODE_PATTERNS.PRODUCT], expected: true },
    { input: ['paper_art_150', CODE_PATTERNS.PAPER], expected: false },  // Lowercase
    { input: ['PAPER-ART-150', CODE_PATTERNS.PAPER], expected: false },  // Wrong separator
    { input: ['PAPER_Art_150', CODE_PATTERNS.PAPER], expected: false }    // Mixed case
  ];

  var results = runTests('validateCodeFormat', tests, function(args) {
    return validateCodeFormat(args[0], args[1]);
  });

  return results;
}

/**
 * Test paper type normalization
 * @return {Object} Test result
 */
function testNormalizePaperType() {
  var tests = [
    { input: ['아트지'], expected: 'ART' },
    { input: ['아트'], expected: 'ART' },
    { input: ['스노우지'], expected: 'SNOW' },
    { input: ['스노우'], expected: 'SNOW' },
    { input: ['모조지'], expected: 'MOJO' },
    { input: ['모조'], expected: 'MOJO' },
    { input: ['크라프트'], expected: 'KRAFT' },
    { input: ['아이보리'], expected: 'IVORY' },
    { input: ['백상지'], expected: 'IVORY' },
    { input: ['랑데뷰'], expected: 'SPECIAL' },
    { input: ['Unknown'], expected: 'SPECIAL' }  // Default
  ];

  var results = runTests('normalizePaperType', tests, function(args) {
    return normalizePaperType(args[0]);
  });

  return results;
}

/**
 * Test size normalization
 * @return {Object} Test result
 */
function testNormalizeSize() {
  var tests = [
    {
      input: ['A4'],
      expected: { width: 210, height: 297, standard: 'ISO' }
    },
    {
      input: ['A3'],
      expected: { width: 297, height: 420, standard: 'ISO' }
    },
    {
      input: ['B5'],
      expected: { width: 182, height: 257, standard: 'JIS' }
    },
    {
      input: ['B4'],
      expected: { width: 257, height: 364, standard: 'JIS' }
    },
    {
      input: ['국전'],
      expected: { width: 636, height: 939, standard: 'KS' }
    },
    {
      input: ['명함'],
      expected: { width: 90, height: 50, standard: 'CUSTOM' }
    },
    {
      input: ['200x300'],
      expected: { width: 200, height: 300, standard: 'CUSTOM' }
    }
  ];

  var results = runTests('normalizeSize', tests, function(args) {
    return normalizeSize(args[0]);
  }, true);  // deep comparison

  return results;
}

/**
 * Test GSM extraction
 * @return {Object} Test result
 */
function testExtractGSM() {
  var tests = [
    { input: ['아트지 150g'], expected: 150 },
    { input: ['스노우지 200 g'], expected: 200 },
    { input: ['모조지 80gsm'], expected: 80 },
    { input: ['크라프트 120G'], expected: 120 },
    { input: ['아이보리 250'], expected: null },  // No 'g' suffix
    { input: ['Unknown'], expected: null }
  ];

  var results = runTests('extractGSM', tests, function(args) {
    return extractGSM(args[0]);
  });

  return results;
}

/**
 * Test GSM validation
 * @return {Object} Test result
 */
function testValidateGSM() {
  var tests = [
    { input: [150], expected: { valid: true, warnings: [] } },
    { input: [200], expected: { valid: true, warnings: [] } },
    { input: [80], expected: { valid: true, warnings: [] } },
    { input: [40], expected: { valid: false } },  // Below minimum
    { input: [600], expected: { valid: false } }, // Above maximum
    { input: [175], expected: { valid: true, warnings: jasmine.arrayContaining(['Uncommon']) } }
  ];

  var results = runTests('validateGSM', tests, function(args) {
    return validateGSM(args[0]);
  }, true);  // deep comparison

  return results;
}

/**
 * Test finish type normalization
 * @return {Object} Test result
 */
function testNormalizeFinishType() {
  var tests = [
    {
      input: ['유광 라미네이팅'],
      expected: { category: 'LAM', sub_type: 'GLOSS' }
    },
    {
      input: ['무광코팅'],
      expected: { category: 'LAM', sub_type: 'MATTE' }
    },
    {
      input: ['UV코팅'],
      expected: { category: 'UV', sub_type: 'SPOT' }
    },
    {
      input: ['전면UV'],
      expected: { category: 'UV', sub_type: 'FULL' }
    },
    {
      input: ['금박'],
      expected: { category: 'FOIL', sub_type: 'GOLD' }
    },
    {
      input: ['엠보싱'],
      expected: { category: 'EMB', sub_type: 'STD' }
    },
    {
      input: ['도무송'],
      expected: { category: 'DIE', sub_type: 'STD' }
    },
    {
      input: ['Unknown'],
      expected: null
    }
  ];

  var results = runTests('normalizeFinishType', tests, function(args) {
    return normalizeFinishType(args[0]);
  }, true);  // deep comparison

  return results;
}

/**
 * Test binding type normalization
 * @return {Object} Test result
 */
function testNormalizeBindingType() {
  var tests = [
    {
      input: ['중철'],
      expected: { type: 'SADDLE', min_pages: 8, max_pages: 64, page_unit: 4, cover_required: false }
    },
    {
      input: ['무선제본'],
      expected: { type: 'PERFECT', min_pages: 48, max_pages: 500, page_unit: 4, cover_required: true }
    },
    {
      input: ['양장제본'],
      expected: { type: 'CASE', min_pages: 100, max_pages: 1000, page_unit: 4, cover_required: true }
    },
    {
      input: ['와이어제본'],
      expected: { type: 'WIRE', min_pages: 10, max_pages: 200, page_unit: 2, cover_required: false }
    },
    {
      input: ['스프링제본'],
      expected: { type: 'SPIRAL', min_pages: 10, max_pages: 300, page_unit: 2, cover_required: false }
    },
    {
      input: ['PUR제본'],
      expected: { type: 'PUR', min_pages: 100, max_pages: 800, page_unit: 4, cover_required: true }
    },
    {
      input: ['Unknown'],
      expected: null
    }
  ];

  var results = runTests('normalizeBindingType', tests, function(args) {
    return normalizeBindingType(args[0]);
  }, true);  // deep comparison

  return results;
}

/**
 * Test sequence padding
 * @return {Object} Test result
 */
function testPadSequence() {
  var tests = [
    { input: [1, 3], expected: '001' },
    { input: [50, 3], expected: '050' },
    { input: [999, 3], expected: '999' },
    { input: [1, 4], expected: '0001' },
    { input: [1000, 4], expected: '1000' }
  ];

  var results = runTests('padSequence', tests, function(args) {
    return padSequence(args[0], args[1]);
  });

  return results;
}

// ============================================
// TEST HELPER FUNCTIONS
// ============================================

/**
 * Run multiple tests and return results
 * @param {string} functionName - Name of function being tested
 * @param {Array} tests - Array of test cases
 * @param {Function} testRunner - Function to run each test
 * @param {boolean} deepCompare - Use deep comparison
 * @return {Object} Test results
 */
function runTests(functionName, tests, testRunner, deepCompare) {
  var results = {
    function: functionName,
    total: tests.length,
    passed: 0,
    failed: 0,
    failures: []
  };

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    var actual = testRunner(test.input);
    var passed = deepCompare ?
      deepEqual(actual, test.expected) :
      actual === test.expected;

    if (passed) {
      results.passed++;
    } else {
      results.failed++;
      results.failures.push({
        test: i + 1,
        input: test.input,
        expected: test.expected,
        actual: actual
      });
    }
  }

  return results;
}

/**
 * Deep equality check for objects
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @return {boolean} True if objects are deeply equal
 */
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 == null || obj2 == null) {
    return false;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  var keys1 = Object.keys(obj1);
  var keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (var i = 0; i < keys1.length; i++) {
    var key = keys1[i];
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Run all code generator tests
 * @return {Object} All test results
 */
function runAllCodeGeneratorTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testGeneratePaperCode',
    'testGenerateSizeCode',
    'testGenerateFinishCode',
    'testGenerateBindingCode',
    'testGenerateProductCode',
    'testValidateCodeFormat',
    'testNormalizePaperType',
    'testNormalizeSize',
    'testExtractGSM',
    'testValidateGSM',
    'testNormalizeFinishType',
    'testNormalizeBindingType',
    'testPadSequence'
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
