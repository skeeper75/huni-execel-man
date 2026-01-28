/**
 * Binding Transformer Tests
 *
 * Unit tests for binding transformation functions
 */

/**
 * Test transformBinding with saddle stitch
 * @return {Object} Test result
 */
function testTransformBinding_SaddleStitch() {
  var sourceBinding = {
    name: '중철'
  };

  var result = transformBinding(sourceBinding);

  var tests = [
    { field: 'binding_code', expected: 'BIND_SADDLE_STD' },
    { field: 'binding_name_ko', expected: '중철' },
    { field: 'binding_name_en', expected: 'Saddle Stitch' },
    { field: 'binding_type', expected: 'SADDLE' },
    { field: 'min_pages', expected: 8 },
    { field: 'max_pages', expected: 64 },
    { field: 'page_unit', expected: 4 },
    { field: 'cover_required', expected: false },
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
    function: 'testTransformBinding_SaddleStitch',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test transformBinding with perfect binding
 * @return {Object} Test result
 */
function testTransformBinding_PerfectBinding() {
  var sourceBinding = {
    name: '무선제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_PerfectBinding',
    total: 1,
    passed: result.binding_code === 'BIND_PERFECT_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_PERFECT_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with case binding
 * @return {Object} Test result
 */
function testTransformBinding_CaseBinding() {
  var sourceBinding = {
    name: '양장제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_CaseBinding',
    total: 1,
    passed: result.binding_code === 'BIND_CASE_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_CASE_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with wire binding
 * @return {Object} Test result
 */
function testTransformBinding_WireBinding() {
  var sourceBinding = {
    name: '와이어제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_WireBinding',
    total: 1,
    passed: result.binding_code === 'BIND_WIRE_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_WIRE_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with spiral binding
 * @return {Object} Test result
 */
function testTransformBinding_SpiralBinding() {
  var sourceBinding = {
    name: '스프링제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_SpiralBinding',
    total: 1,
    passed: result.binding_code === 'BIND_SPIRAL_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_SPIRAL_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with PUR binding
 * @return {Object} Test result
 */
function testTransformBinding_PURBinding() {
  var sourceBinding = {
    name: 'PUR제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_PURBinding',
    total: 1,
    passed: result.binding_code === 'BIND_PUR_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_PUR_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with Korean field name
 * @return {Object} Test result
 */
function testTransformBinding_KoreanFieldName() {
  var sourceBinding = {
    제본: '중철'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_KoreanFieldName',
    total: 1,
    passed: result.binding_code === 'BIND_SADDLE_STD' ? 1 : 0,
    failed: result.binding_code === 'BIND_SADDLE_STD' ? 0 : 1
  };
}

/**
 * Test transformBinding with spine calculation
 * @return {Object} Test result
 */
function testTransformBinding_WithSpineCalculation() {
  var sourceBinding = {
    name: '무선제본',
    spine_calculation: '(pages/2)*gsm*0.0015'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_WithSpineCalculation',
    total: 1,
    passed: result.spine_calculation === '(pages/2)*gsm*0.0015' ? 1 : 0,
    failed: result.spine_calculation === '(pages/2)*gsm*0.0015' ? 0 : 1
  };
}

/**
 * Test transformBinding with default spine calculation
 * @return {Object} Test result
 */
function testTransformBinding_DefaultSpineCalculation() {
  var sourceBinding = {
    name: '무선제본'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_DefaultSpineCalculation',
    total: 1,
    passed: result.spine_calculation === '(pages/2)*gsm*0.001' ? 1 : 0,
    failed: result.spine_calculation === '(pages/2)*gsm*0.001' ? 0 : 1
  };
}

/**
 * Test transformBinding with applicable sizes
 * @return {Object} Test result
 */
function testTransformBinding_WithApplicableSizes() {
  var sourceBinding = {
    name: '중철',
    applicable_sizes: 'A4,A5,B5'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_WithApplicableSizes',
    total: 1,
    passed: result.applicable_sizes === 'A4,A5,B5' ? 1 : 0,
    failed: result.applicable_sizes === 'A4,A5,B5' ? 0 : 1
  };
}

/**
 * Test transformBinding with default applicable sizes
 * @return {Object} Test result
 */
function testTransformBinding_DefaultApplicableSizes() {
  var sourceBinding = {
    name: '중철'
  };

  var result = transformBinding(sourceBinding);

  return {
    function: 'testTransformBinding_DefaultApplicableSizes',
    total: 1,
    passed: result.applicable_sizes === 'A4,A5,B5' ? 1 : 0,
    failed: result.applicable_sizes === 'A4,A5,B5' ? 0 : 1
  };
}

/**
 * Test transformBindings batch transformation
 * @return {Object} Test result
 */
function testTransformBindings_Batch() {
  var sourceBindings = [
    { name: '중철' },
    { name: '무선제본' },
    { name: '와이어제본' }
  ];

  var results = transformBindings(sourceBindings);

  var passed = results.length === 3 &&
                results[0].binding_code === 'BIND_SADDLE_STD' &&
                results[1].binding_code === 'BIND_PERFECT_STD' &&
                results[2].binding_code === 'BIND_WIRE_STD';

  return {
    function: 'testTransformBindings_Batch',
    total: 1,
    passed: passed ? 1 : 0,
    failed: passed ? 0 : 1
  };
}

/**
 * Test transformBindings with duplicates
 * @return {Object} Test result
 */
function testTransformBindings_WithDuplicates() {
  var sourceBindings = [
    { name: '중철' },
    { name: '중철' },  // Duplicate
    { name: '무선제본' }
  ];

  var results = transformBindings(sourceBindings);

  return {
    function: 'testTransformBindings_WithDuplicates',
    total: 1,
    passed: results.length === 2 ? 1 : 0,
    failed: results.length === 2 ? 0 : 1
  };
}

/**
 * Test extractBindingName
 * @return {Object} Test result
 */
function testExtractBindingName() {
  var tests = [
    { input: { name: '중철' }, expected: '중철' },
    { input: { binding_name: '무선제본' }, expected: '무선제본' },
    { input: { 제본: '양장제본' }, expected: '양장제본' },
    { input: { 제본방식: '와이어제본' }, expected: '와이어제본' },
    { input: {}, expected: 'Unknown' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = extractBindingName(tests[i].input);
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
    function: 'testExtractBindingName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test generateEnglishBindingName
 * @return {Object} Test result
 */
function testGenerateEnglishBindingName() {
  var tests = [
    { input: ['SADDLE'], expected: 'Saddle Stitch' },
    { input: ['PERFECT'], expected: 'Perfect Binding' },
    { input: ['CASE'], expected: 'Case Binding' },
    { input: ['WIRE'], expected: 'Wire Binding' },
    { input: ['SPIRAL'], expected: 'Spiral Binding' },
    { input: ['PUR'], expected: 'PUR Binding' },
    { input: ['UNKNOWN'], expected: 'Standard Binding' }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = generateEnglishBindingName(tests[i].input[0]);
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
    function: 'testGenerateEnglishBindingName',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test extractSpineCalculation
 * @return {Object} Test result
 */
function testExtractSpineCalculation() {
  var tests = [
    { input: { spine_calculation: '(pages/2)*gsm*0.001' }, expected: '(pages/2)*gsm*0.001' },
    { input: { 등두께계산: '(pages/2)*gsm*0.0015' }, expected: '(pages/2)*gsm*0.0015' },
    {
      input: { binding_type: 'PERFECT' },
      expected: '(pages/2)*gsm*0.001'  // Default for PERFECT
    },
    {
      input: { binding_type: 'SADDLE' },
      expected: null  // No default for SADDLE
    }
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractSpineCalculation(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractSpineCalculation',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test extractApplicableSizes
 * @return {Object} Test result
 */
function testExtractApplicableSizes() {
  var tests = [
    { input: { applicable_sizes: 'A4,A5' }, expected: 'A4,A5' },
    { input: { 적용사이즈: 'B5,B4' }, expected: 'B5,B4' },
    { input: {}, expected: 'A4,A5,B5' }  // Default
  ];

  var passed = 0;
  var failed = 0;

  for (var i = 0; i < tests.length; i++) {
    var result = extractApplicableSizes(tests[i].input);
    if (result === tests[i].expected) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    function: 'testExtractApplicableSizes',
    total: tests.length,
    passed: passed,
    failed: failed
  };
}

/**
 * Test validatePageCount
 * @return {Object} Test result
 */
function testValidatePageCount() {
  var tests = [
    { input: ['SADDLE', 16], expected: { valid: true } },
    { input: ['SADDLE', 4], expected: { valid: false, error: jasmine.stringMatching('minimum') } },
    { input: ['SADDLE', 100], expected: { valid: false, error: jasmine.stringMatching('maximum') } },
    { input: ['PERFECT', 48], expected: { valid: true } },
    { input: ['PERFECT', 50], expected: { valid: false, warning: jasmine.stringMatching('unit') } },
    { input: ['UNKNOWN', 10], expected: { valid: false, error: jasmine.stringMatching('Unknown') } }
  ];

  var results = {
    function: 'testValidatePageCount',
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

/**
 * Test calculateSpineWidth
 * @return {Object} Test result
 */
function testCalculateSpineWidth() {
  var tests = [
    { input: [100, 150, 'SADDLE'], expected: 6 },    // (100/2)*(150/1000)*0.8 = 6
    { input: [200, 150, 'PERFECT'], expected: 16.5 },  // (200/2)*(150/1000)*1.1 = 16.5
    { input: [300, 200, 'CASE'], expected: 36 },      // (300/2)*(200/1000)*1.2 = 36
    { input: [50, 100, 'WIRE'], expected: 2.25 },     // (50/2)*(100/1000)*0.9 = 2.25
    { input: [100, 150, 'SPIRAL'], expected: 6.75 },  // (100/2)*(150/1000)*0.9 = 6.75
    { input: [200, 150, 'PUR'], expected: 16.5 }      // (200/2)*(150/1000)*1.1 = 16.5
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var result = calculateSpineWidth(tests[i].input[0], tests[i].input[1], tests[i].input[2]);
    // Allow small floating point differences
    if (Math.abs(result - tests[i].expected) < 0.01) {
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
    function: 'testCalculateSpineWidth',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Run all binding transformer tests
 * @return {Object} All test results
 */
function runAllBindingTransformerTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testTransformBinding_SaddleStitch',
    'testTransformBinding_PerfectBinding',
    'testTransformBinding_CaseBinding',
    'testTransformBinding_WireBinding',
    'testTransformBinding_SpiralBinding',
    'testTransformBinding_PURBinding',
    'testTransformBinding_KoreanFieldName',
    'testTransformBinding_WithSpineCalculation',
    'testTransformBinding_DefaultSpineCalculation',
    'testTransformBinding_WithApplicableSizes',
    'testTransformBinding_DefaultApplicableSizes',
    'testTransformBindings_Batch',
    'testTransformBindings_WithDuplicates',
    'testExtractBindingName',
    'testGenerateEnglishBindingName',
    'testExtractSpineCalculation',
    'testExtractApplicableSizes',
    'testValidatePageCount',
    'testCalculateSpineWidth'
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
