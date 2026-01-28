/**
 * Validator Tests
 *
 * Unit tests for validation functions
 */

/**
 * Test MES code validation
 * @return {Object} Test result
 */
function testValidateMESCode() {
  var tests = [
    { input: ['001-0001'], expected: { valid: true, category: '001', sequence: '0001' } },
    { input: ['123-9999'], expected: { valid: true, category: '123', sequence: '9999' } },
    { input: [''], expected: { valid: false, error: 'MES code is empty' } },
    { input: ['12345'], expected: { valid: false, error: jasmine.stringMatching('format') } },
    { input: ['abc-defg'], expected: { valid: false, error: jasmine.stringMatching('format') } },
    { input: ['0000-0001'], expected: { valid: true, warning: jasmine.stringMatching('range') } }
  ];

  var results = {
    function: 'validateMESCode',
    total: tests.length,
    passed: 0,
    failed: 0,
    failures: []
  };

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var actual = validateMESCode(test.input[0]);
      var passed = compareValidationResults(actual, test.expected);

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
    } catch (e) {
      results.failed++;
      results.failures.push({
        test: i + 1,
        input: test.input,
        error: e.toString()
      });
    }
  }

  return results;
}

/**
 * Test code uniqueness validation
 * @return {Object} Test result
 */
function testValidateCodeUniqueness() {
  // Test data with duplicates
  var records = [
    { paper_code: 'PAPER_ART_150', name: 'Art 150' },
    { paper_code: 'PAPER_SNOW_200', name: 'Snow 200' },
    { paper_code: 'PAPER_ART_150', name: 'Art 150 Duplicate' },
    { paper_code: 'PAPER_MOJO_80', name: 'Mojo 80' },
    { paper_code: 'PAPER_SNOW_200', name: 'Snow 200 Duplicate' }
  ];

  var result = validateCodeUniqueness(records, 'paper_code');

  var expected = {
    valid: false,
    duplicates: jasmine.arrayContaining([
      jasmine.objectContaining({ code: 'PAPER_ART_150' }),
      jasmine.objectContaining({ code: 'PAPER_SNOW_200' })
    ])
  };

  var passed = !result.valid &&
              result.duplicates.length === 2 &&
              result.duplicates[0].code === 'PAPER_ART_150' &&
              result.duplicates[1].code === 'PAPER_SNOW_200';

  return {
    function: 'validateCodeUniqueness',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1,
    result: result
  };
}

/**
 * Test reference integrity validation
 * @return {Object} Test result
 */
function testValidateReferenceIntegrity() {
  var masterTables = {
    papers: [
      { paper_code: 'PAPER_ART_150' },
      { paper_code: 'PAPER_SNOW_200' }
    ],
    sizes: [
      { size_code: 'SIZE_A4_ISO' }
    ],
    finishes: [],
    bindings: [],
    products: [
      {
        product_code: 'PROD_DIG_001',
        default_paper_code: 'PAPER_ART_150',  // Valid
        default_size_code: 'SIZE_A4_ISO',      // Valid
        available_papers: 'PAPER_SNOW_*'       // Valid wildcard
      },
      {
        product_code: 'PROD_DIG_002',
        default_paper_code: 'PAPER_INVALID',   // Invalid
        default_size_code: 'SIZE_INVALID'      // Invalid
      }
    ]
  };

  var result = validateReferenceIntegrity(masterTables);

  var passed = !result.valid &&
              result.violations.length === 3 &&
              result.violations.some(function(v) {
                return v.type === 'ORPHAN_PAPER_REF' && v.reference === 'PAPER_INVALID';
              }) &&
              result.violations.some(function(v) {
                return v.type === 'ORPHAN_SIZE_REF' && v.reference === 'SIZE_INVALID';
              });

  return {
    function: 'validateReferenceIntegrity',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1,
    result: result
  };
}

/**
 * Test required fields validation
 * @return {Object} Test result
 */
function testValidateRequiredFields() {
  var records = [
    {
      paper_code: 'PAPER_ART_150',
      paper_name_ko: '아트지 150g',
      paper_type: 'ART',
      gsm: 150,
      status: 'A'
    },
    {
      paper_code: 'PAPER_SNOW_200',
      paper_name_ko: '',      // Missing required
      paper_type: 'SNOW',
      gsm: 200,
      status: 'A'
    },
    {
      paper_code: 'PAPER_MOJO_80',
      // Missing paper_name_ko entirely
      paper_type: 'MOJO',
      gsm: 80
    }
  ];

  var requiredFields = ['paper_code', 'paper_name_ko', 'paper_type', 'gsm', 'status'];
  var result = validateRequiredFields(records, requiredFields);

  var passed = !result.valid &&
              result.missingFields.length === 2 &&
              result.missingFields[0].field === 'paper_name_ko' &&
              result.missingFields[1].field === 'status';

  return {
    function: 'validateRequiredFields',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1,
    result: result
  };
}

/**
 * Test size dimension validation
 * @return {Object} Test result
 */
function testValidateSizeDimensions() {
  var tests = [
    { input: [210, 297, 'ISO'], expected: { valid: true, warnings: [] } },
    { input: [297, 210, 'ISO'], expected: { valid: true, warnings: jasmine.arrayContaining(jasmine.stringMatching('landscape')) } },
    { input: [10, 10, 'ISO'], expected: { valid: false } },
    { input: [2000, 2000, 'CUSTOM'], expected: { valid: false } },
    { input: [182, 257, 'JIS'], expected: { valid: true, warnings: [] } },
    { input: [90, 50, 'CUSTOM'], expected: { valid: true, warnings: jasmine.arrayContaining(jasmine.stringMatching('Square')) } }
  ];

  var results = {
    function: 'validateSizeDimensions',
    total: tests.length,
    passed: 0,
    failed: 0,
    failures: []
  };

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var actual = validateSizeDimensions(test.input[0], test.input[1], test.input[2]);
      var passed = compareValidationResults(actual, test.expected);

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
    } catch (e) {
      results.failed++;
      results.failures.push({
        test: i + 1,
        input: test.input,
        error: e.toString()
      });
    }
  }

  return results;
}

/**
 * Test bilingual coverage validation
 * @return {Object} Test result
 */
function testValidateBilingualCoverage() {
  var records = [
    { name_ko: '아트지', name_en: 'Art Paper' },
    { name_ko: '스노우지', name_en: '' },          // Missing EN
    { name_ko: '모조지', name_en: 'Uncoated' },
    { name_ko: '', name_en: 'Kraft' },             // Missing KO
    { name_ko: '아이보리', name_en: 'Ivory' }
  ];

  var result = validateBilingualCoverage(records, 'name_ko', 'name_en', 80);

  // 3 out of 5 have both KO and EN (60%)
  var passed = !result.valid &&
              result.totalCount === 5 &&
              result.bilingualCount === 3 &&
              !result.targetMet;

  return {
    function: 'validateBilingualCoverage',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1,
    result: result
  };
}

/**
 * Test page count validation for binding
 * @return {Object} Test result
 */
function testValidatePageCount() {
  var tests = [
    { input: ['SADDLE', 16], expected: { valid: true } },
    { input: ['SADDLE', 4], expected: { valid: false, error: jasmine.stringMatching('minimum') } },
    { input: ['SADDLE', 100], expected: { valid: false, error: jasmine.stringMatching('maximum') } },
    { input: ['PERFECT', 48], expected: { valid: true } },
    { input: ['PERFECT', 50], expected: { valid: true, warning: jasmine.stringMatching('unit') } }
  ];

  var results = {
    function: 'validatePageCount',
    total: tests.length,
    passed: 0,
    failed: 0,
    failures: []
  };

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    try {
      var actual = validatePageCount(test.input[0], test.input[1]);
      var passed = compareValidationResults(actual, test.expected);

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
    } catch (e) {
      results.failed++;
      results.failures.push({
        test: i + 1,
        input: test.input,
        error: e.toString()
      });
    }
  }

  return results;
}

// ============================================
// TEST HELPER FUNCTIONS
// ============================================

/**
 * Compare validation results
 * @param {*} actual - Actual result
 * @param {*} expected - Expected result (may use jasmine matchers)
 * @return {boolean} True if results match
 */
function compareValidationResults(actual, expected) {
  if (actual === expected) {
    return true;
  }

  if (!actual || !expected) {
    return false;
  }

  // Check valid field
  if (expected.valid !== undefined && actual.valid !== expected.valid) {
    return false;
  }

  // Check error field
  if (expected.error !== undefined) {
    if (typeof expected.error === 'string') {
      if (!actual.error || actual.error.indexOf(expected.error) === -1) {
        return false;
      }
    } else if (expected.error instanceof RegExp) {
      if (!actual.error || !expected.error.test(actual.error)) {
        return false;
      }
    }
  }

  // Check warnings
  if (expected.warnings !== undefined) {
    if (Array.isArray(expected.warnings)) {
      if (!Array.isArray(actual.warnings) ||
          actual.warnings.length !== expected.warnings.length) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Simple jasmine-like matchers
 */
var jasmine = {
  arrayContaining: function(expected) {
    return {
      matches: function(actual) {
        if (!Array.isArray(actual)) {
          return false;
        }
        for (var i = 0; i < expected.length; i++) {
          var found = false;
          for (var j = 0; j < actual.length; j++) {
            if (typeof expected[i] === 'object') {
              if (jasmine.objectContaining(expected[i]).matches(actual[j])) {
                found = true;
                break;
              }
            } else if (actual[j] === expected[i]) {
              found = true;
              break;
            }
          }
          if (!found) {
            return false;
          }
        }
        return true;
      }
    };
  },

  objectContaining: function(expected) {
    return {
      matches: function(actual) {
        if (!actual || typeof actual !== 'object') {
          return false;
        }
        for (var key in expected) {
          if (actual[key] !== expected[key]) {
            return false;
          }
        }
        return true;
      }
    };
  },

  stringMatching: function(expected) {
    if (expected instanceof RegExp) {
      return expected;
    }
    return new RegExp(expected);
  }
};

/**
 * Run all validator tests
 * @return {Object} All test results
 */
function runAllValidatorTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testValidateMESCode',
    'testValidateCodeUniqueness',
    'testValidateReferenceIntegrity',
    'testValidateRequiredFields',
    'testValidateSizeDimensions',
    'testValidateBilingualCoverage',
    'testValidatePageCount'
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
