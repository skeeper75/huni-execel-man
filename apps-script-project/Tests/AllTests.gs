/**
 * All Tests Runner
 *
 * Master test runner that executes all test suites
 * and generates a comprehensive test report.
 */

// ============================================
// MAIN TEST RUNNER
// ============================================

/**
 * Run all tests and generate comprehensive report
 * @return {Object} All test results with summary
 */
function runAllTests() {
  var startTime = new Date();

  var allResults = {
    startTime: startTime.toISOString(),
    testSuites: {},
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      suitesPassed: 0,
      suitesFailed: 0
    }
  };

  // Run all test suites
  var testSuites = [
    { name: 'CodeGenerator', runner: runAllCodeGeneratorTests },
    { name: 'Validator', runner: runAllValidatorTests },
    { name: 'PaperTransformer', runner: runAllPaperTransformerTests },
    { name: 'SizeTransformer', runner: runAllSizeTransformerTests },
    { name: 'FinishTransformer', runner: runAllFinishTransformerTests },
    { name: 'BindingTransformer', runner: runAllBindingTransformerTests },
    { name: 'Integration', runner: runAllIntegrationTests }
  ];

  for (var i = 0; i < testSuites.length; i++) {
    var suite = testSuites[i];
    try {
      var results = suite.runner();
      allResults.testSuites[suite.name] = results;

      // Update summary
      allResults.summary.totalTests += results.total;
      allResults.summary.totalPassed += results.passed;
      allResults.summary.totalFailed += results.failed;

      // Track suite-level results
      if (results.failed === 0) {
        allResults.summary.suitesPassed++;
      } else {
        allResults.summary.suitesFailed++;
      }
    } catch (e) {
      allResults.testSuites[suite.name] = {
        error: e.toString(),
        total: 0,
        passed: 0,
        failed: 1
      };
      allResults.summary.totalFailed++;
      allResults.summary.suitesFailed++;
    }
  }

  var endTime = new Date();
  allResults.endTime = endTime.toISOString();
  allResults.duration = (endTime - startTime) / 1000;  // seconds

  return allResults;
}

/**
 * Run all tests and display results in log
 * @return {string} Test report
 */
function runAndReportTests() {
  var results = runAllTests();
  var report = generateTestReport(results);
  console.log(report);
  return report;
}

/**
 * Generate human-readable test report
 * @param {Object} results - Test results from runAllTests
 * @return {string} Formatted test report
 */
function generateTestReport(results) {
  var lines = [];

  lines.push('================================================');
  lines.push('          HUNIPRINTING DATA MIGRATION TEST SUITE');
  lines.push('================================================');
  lines.push('');
  lines.push('Start Time: ' + results.startTime);
  lines.push('End Time: ' + results.endTime);
  lines.push('Duration: ' + results.duration.toFixed(2) + ' seconds');
  lines.push('');
  lines.push('------------------------------------------------');
  lines.push('                    SUMMARY');
  lines.push('------------------------------------------------');
  lines.push('Total Tests: ' + results.summary.totalTests);
  lines.push('Passed: ' + results.summary.totalPassed + ' (' +
             calculatePercentage(results.summary.totalPassed, results.summary.totalTests) + '%)');
  lines.push('Failed: ' + results.summary.totalFailed + ' (' +
             calculatePercentage(results.summary.totalFailed, results.summary.totalTests) + '%)');
  lines.push('Test Suites: ' + (results.summary.suitesPassed + results.summary.suitesFailed));
  lines.push('Suites Passed: ' + results.summary.suitesPassed);
  lines.push('Suites Failed: ' + results.summary.suitesFailed);
  lines.push('');

  // Per-suite breakdown
  lines.push('------------------------------------------------');
  lines.push('                  TEST SUITE DETAILS');
  lines.push('------------------------------------------------');
  lines.push('');

  for (var suiteName in results.testSuites) {
    var suite = results.testSuites[suiteName];

    if (suite.error) {
      lines.push('❌ ' + suiteName + ': ERROR');
      lines.push('   Error: ' + suite.error);
      lines.push('');
      continue;
    }

    var status = suite.failed === 0 ? '✅ PASSED' : '❌ FAILED';
    var percentage = calculatePercentage(suite.passed, suite.total);

    lines.push(status + ' - ' + suiteName);
    lines.push('   Tests: ' + suite.total + ' | Passed: ' + suite.passed +
               ' (' + percentage + '%) | Failed: ' + suite.failed);

    // Show failures if any
    if (suite.failed > 0) {
      lines.push('');
      lines.push('   Failures:');

      var failureCount = 0;
      for (var testName in suite.tests) {
        var test = suite.tests[testName];

        if (test.error) {
          lines.push('   - ' + testName + ': ' + test.error);
          failureCount++;
        } else if (test.failures && test.failures.length > 0) {
          for (var i = 0; i < Math.min(3, test.failures.length); i++) {
            var failure = test.failures[i];
            if (failure.field) {
              lines.push('   - ' + testName + ': Field "' + failure.field +
                         '" expected "' + failure.expected + '" got "' + failure.actual + '"');
            } else if (failure.check) {
              lines.push('   - ' + testName + ': ' + failure.check +
                         ' expected "' + failure.expected + '" got "' + failure.actual + '"');
            } else if (failure.error) {
              lines.push('   - ' + testName + ': ' + failure.error);
            }
            failureCount++;
          }

          if (test.failures.length > 3) {
            lines.push('   ... and ' + (test.failures.length - 3) + ' more');
          }
        }

        if (failureCount >= 10) {
          lines.push('   ... and more failures');
          break;
        }
      }
    }

    lines.push('');
  }

  lines.push('------------------------------------------------');
  lines.push('                         END');
  lines.push('------------------------------------------------');

  return lines.join('\n');
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @return {string} Percentage string
 */
function calculatePercentage(value, total) {
  if (total === 0) return '0.00';
  return ((value / total) * 100).toFixed(2);
}

/**
 * Get quick test summary
 * @return {Object} Quick summary object
 */
function getQuickTestSummary() {
  var results = runAllTests();

  return {
    total: results.summary.totalTests,
    passed: results.summary.totalPassed,
    failed: results.summary.totalFailed,
    passRate: calculatePercentage(results.summary.totalPassed, results.summary.totalTests) + '%',
    duration: results.duration.toFixed(2) + 's',
    status: results.summary.totalFailed === 0 ? 'PASS' : 'FAIL'
  };
}

/**
 * Run tests and return JSON for CI/CD
 * @return {string} JSON test results
 */
function runTestsForCI() {
  var results = runAllTests();

  // Format for CI/CD consumption
  var ciResults = {
    status: results.summary.totalFailed === 0 ? 'success' : 'failure',
    tests: {
      total: results.summary.totalTests,
      passed: results.summary.totalPassed,
      failed: results.summary.totalFailed,
      skipped: 0
    },
    suites: []
  };

  for (var suiteName in results.testSuites) {
    var suite = results.testSuites[suiteName];
    ciResults.suites.push({
      name: suiteName,
      tests: suite.total,
      passed: suite.passed,
      failed: suite.failed,
      status: suite.failed === 0 ? 'passed' : 'failed'
    });
  }

  return JSON.stringify(ciResults, null, 2);
}

/**
 * Generate coverage estimate based on test execution
 * @return {Object} Coverage estimate
 */
function estimateCoverage() {
  var results = runAllTests();

  // Count unique functions tested
  var functionsTested = 0;

  for (var suiteName in results.testSuites) {
    var suite = results.testSuites[suiteName];
    for (var testName in suite.tests) {
      functionsTested++;
    }
  }

  // Estimate total functions in the codebase
  // This is a rough estimate based on typical project size
  var estimatedTotalFunctions = 100;  // Adjust based on actual codebase

  var coveragePercentage = (functionsTested / estimatedTotalFunctions) * 100;

  return {
    functionsTested: functionsTested,
    estimatedTotalFunctions: estimatedTotalFunctions,
    coveragePercentage: coveragePercentage.toFixed(2) + '%',
    status: coveragePercentage >= 50 ? 'Above 50% target' : 'Below 50% target'
  };
}

/**
 * Validate test quality gates
 * @return {Object} Quality gate results
 */
function validateQualityGates() {
  var results = runAllTests();
  var coverage = estimateCoverage();

  var gates = {
    minPassRate: 80,  // Minimum 80% of tests must pass
    minCoverage: 50,  // Minimum 50% coverage target
    maxFailedTests: 10  // Maximum 10 failed tests allowed
  };

  var passRate = (results.summary.totalPassed / results.summary.totalTests) * 100;
  var coverageValue = parseFloat(coverage.coveragePercentage);

  var validation = {
    passed: true,
    gates: []
  };

  // Check pass rate gate
  var passRateGate = {
    name: 'Minimum Pass Rate',
    threshold: gates.minPassRate + '%',
    actual: passRate.toFixed(2) + '%',
    status: passRate >= gates.minPassRate ? 'PASS' : 'FAIL'
  };
  if (passRateGate.status === 'FAIL') validation.passed = false;
  validation.gates.push(passRateGate);

  // Check coverage gate
  var coverageGate = {
    name: 'Minimum Coverage',
    threshold: gates.minCoverage + '%',
    actual: coverage.coveragePercentage,
    status: coverageValue >= gates.minCoverage ? 'PASS' : 'FAIL'
  };
  if (coverageGate.status === 'FAIL') validation.passed = false;
  validation.gates.push(coverageGate);

  // Check max failed tests gate
  var failedTestsGate = {
    name: 'Maximum Failed Tests',
    threshold: 'Max ' + gates.maxFailedTests,
    actual: results.summary.totalFailed + ' failed',
    status: results.summary.totalFailed <= gates.maxFailedTests ? 'PASS' : 'FAIL'
  };
  if (failedTestsGate.status === 'FAIL') validation.passed = false;
  validation.gates.push(failedTestsGate);

  return validation;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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
    } else if (expected.error.test) {
      // Assume it's a RegExp
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
 * Simple jasmine-like matchers (re-exported for use in test files)
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
