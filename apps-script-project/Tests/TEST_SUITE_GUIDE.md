# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the Huniprinting Data Migration Tool. The tests cover all major transformers and integration scenarios.

## Test Files

### Transformer Tests
- `Tests/PaperTransformerTest.gs` - 21 test functions for paper transformation
- `Tests/SizeTransformerTest.gs` - 20 test functions for size transformation
- `Tests/FinishTransformerTest.gs` - 24 test functions for finish transformation
- `Tests/BindingTransformerTest.gs` - 19 test functions for binding transformation

### Integration Tests
- `Tests/IntegrationTest.gs` - 13 integration tests for end-to-end scenarios

### Existing Tests
- `Tests/CodeGeneratorTest.gs` - 14 test functions for code generation
- `Tests/ValidatorTest.gs` - 7 test functions for data validation

### Test Runner
- `Tests/AllTests.gs` - Master test runner that executes all test suites

## Running Tests

### Run All Tests
```javascript
// In Google Apps Script editor
runAllTests()
```

### Run Specific Test Suite
```javascript
// Paper transformer tests only
runAllPaperTransformerTests()

// Size transformer tests only
runAllSizeTransformerTests()

// Finish transformer tests only
runAllFinishTransformerTests()

// Binding transformer tests only
runAllBindingTransformerTests()

// Integration tests only
runAllIntegrationTests()
```

### Run with Report
```javascript
// Run all tests and generate detailed report
runAndReportTests()
```

### CI/CD Format
```javascript
// Get JSON results for CI/CD pipelines
runTestsForCI()
```

## Test Coverage Goals

### Current Status
- **Baseline Coverage**: ~15% (CodeGeneratorTest, ValidatorTest only)
- **Target Coverage**: 50%+ (with new transformer and integration tests)
- **Ultimate Goal**: 85%+ (full production readiness)

### New Test Functions Added
- **PaperTransformer**: 21 functions
- **SizeTransformer**: 20 functions
- **FinishTransformer**: 24 functions
- **BindingTransformer**: 19 functions
- **Integration**: 13 functions

**Total New Tests**: 97 test functions

### Expected Coverage Improvement
With approximately 50 functions in the codebase requiring tests, the new tests should increase coverage from ~15% to **50-60%**.

## Test Categories

### 1. Unit Tests
Test individual functions in isolation:

- **Happy Path**: Normal valid inputs
- **Edge Cases**: Boundary values, missing optional fields
- **Error Cases**: Invalid inputs, null/undefined handling
- **Bilingual Support**: Korean/English name generation
- **Code Format Compliance**: Pattern validation

### 2. Integration Tests
Test complete workflows:

- **Full Migration Flow**: End-to-end data transformation
- **Batch Processing**: Multiple records handling
- **Duplicate Handling**: Duplicate detection and resolution
- **Error Recovery**: Graceful error handling
- **Data Consistency**: Repeatable transformations

## Test Results Interpretation

### Pass/Fail Criteria
- ✅ **PASS**: All assertions in the test passed
- ❌ **FAIL**: One or more assertions failed

### Quality Gates
1. **Minimum Pass Rate**: 80% of tests must pass
2. **Minimum Coverage**: 50% code coverage
3. **Maximum Failed Tests**: 10 failed tests maximum

### Quality Gate Validation
```javascript
// Check if quality gates are met
validateQualityGates()
```

## Coverage Estimation

```javascript
// Get coverage estimate
estimateCoverage()
```

Returns:
- `functionsTested`: Number of unique functions tested
- `estimatedTotalFunctions`: Estimated total functions in codebase
- `coveragePercentage`: Coverage percentage
- `status`: Above or below 50% target

## Test Report Format

### Summary Section
```
Total Tests: 150
Passed: 145 (96.67%)
Failed: 5 (3.33%)
Test Suites: 7
Suites Passed: 6
Suites Failed: 1
```

### Per-Suite Details
```
✅ PASSED - PaperTransformer
   Tests: 21 | Passed: 21 (100.00%) | Failed: 0

❌ FAILED - SizeTransformer
   Tests: 20 | Passed: 18 (90.00%) | Failed: 2

   Failures:
   - testTransformSize_CustomSize: Field "width_mm" expected "200" got "210"
   - testExtractSizeName: Test 4 expected "국전지" got "Unknown"
```

## Best Practices

### Writing New Tests
1. Follow the existing test pattern
2. Use descriptive test function names
3. Test both happy path and edge cases
4. Include bilingual name generation tests
5. Verify code format compliance

### Test Structure
```javascript
function testDescriptiveName_HappyPath() {
  // Arrange
  var input = { ... };

  // Act
  var result = functionUnderTest(input);

  // Assert
  return {
    function: 'testDescriptiveName_HappyPath',
    total: 1,
    passed: result.expectedField === expectedValue ? 1 : 0,
    failed: result.expectedField === expectedValue ? 0 : 1
  };
}
```

## Troubleshooting

### Common Issues

**Test Fails with "ReferenceError"**
- Cause: Function not found or not loaded
- Solution: Ensure the function exists in the source files

**Test Fails with "Invalid format"**
- Cause: Code format pattern changed
- Solution: Update CODE_PATTERNS in Config.gs

**Integration Test Fails**
- Cause: Dependencies not met
- Solution: Check that all required transformers are loaded

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    # Run tests and get JSON output
    node tests-runner.js

- name: Check Coverage
  run: |
    # Verify coverage is above 50%
    if [ $(coverage) -lt 50 ]; then
      echo "Coverage below 50% threshold"
      exit 1
    fi
```

## Next Steps

1. **Run Tests**: Execute `runAndReportTests()` to establish baseline
2. **Fix Failures**: Address any failing tests
3. **Measure Coverage**: Use `estimateCoverage()` to verify 50%+ target
4. **Add More Tests**: Continue adding tests for remaining functions
5. **Automate**: Integrate into CI/CD pipeline

## Test Maintenance

### When to Update Tests
- Code changes that modify function signatures
- New features added to transformers
- Bug fixes that change behavior
- Validation rules updated

### Test Review Checklist
- [ ] All tests pass
- [ ] Coverage meets 50%+ target
- [ ] Quality gates pass
- [ ] No flaky tests
- [ ] Documentation updated

---

**Last Updated**: 2026-01-29
**Version**: 1.0.0
**Coverage Target**: 50%+ (Interim), 85%+ (Final)
