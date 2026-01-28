/**
 * Integration Tests
 *
 * End-to-end tests for the full migration flow
 */

/**
 * Test full migration flow with sample data
 * @return {Object} Test result
 */
function testFullMigration_CompleteFlow() {
  // Arrange
  var sourceData = {
    papers: [
      { name: '아트지 150g', gram: 150 },
      { name: '스노우지 200g', gram: 200 }
    ],
    sizes: [
      { name: 'A4' },
      { name: 'B5' }
    ],
    finishes: [
      { name: '유광코팅' },
      { name: '무광코팅' }
    ],
    bindings: [
      { name: '중철' },
      { name: '무선제본' }
    ],
    products: [
      {
        name: '명함 100매',
        category: 'DIG',
        mes_code: '001-0001'
      }
    ]
  };

  // Act - Transform all data
  var transformedPapers = transformPapers(sourceData.papers);
  var transformedSizes = transformSizes(sourceData.sizes);
  var transformedFinishes = transformFinishes(sourceData.finishes);
  var transformedBindings = transformBindings(sourceData.bindings);

  // Assert
  var tests = [
    { check: 'Papers transformed', expected: true, actual: transformedPapers.length === 2 },
    { check: 'Sizes transformed', expected: true, actual: transformedSizes.length === 2 },
    { check: 'Finishes transformed', expected: true, actual: transformedFinishes.length === 2 },
    { check: 'Bindings transformed', expected: true, actual: transformedBindings.length === 2 },
    { check: 'Paper codes valid', expected: true, actual: CODE_PATTERNS.PAPER.test(transformedPapers[0].paper_code) },
    { check: 'Size codes valid', expected: true, actual: CODE_PATTERNS.SIZE.test(transformedSizes[0].size_code) },
    { check: 'Finish codes valid', expected: true, actual: CODE_PATTERNS.FINISH.test(transformedFinishes[0].finish_code) },
    { check: 'Binding codes valid', expected: true, actual: CODE_PATTERNS.BINDING.test(transformedBindings[0].binding_code) }
  ];

  var passed = 0;
  var failed = 0;
  var failures = [];

  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    if (test.actual === test.expected) {
      passed++;
    } else {
      failed++;
      failures.push({
        check: test.check,
        expected: test.expected,
        actual: test.actual
      });
    }
  }

  return {
    function: 'testFullMigration_CompleteFlow',
    total: tests.length,
    passed: passed,
    failed: failed,
    failures: failures
  };
}

/**
 * Test migration with duplicate handling
 * @return {Object} Test result
 */
function testMigration_DuplicateHandling() {
  var sourcePapers = [
    { name: '아트지 150g', gram: 150 },
    { name: '아트지 150g', gram: 150 },  // Duplicate
    { name: '스노우지 200g', gram: 200 }
  ];

  var result = transformPapers(sourcePapers);

  // Should handle duplicates and only return 2 unique papers
  return {
    function: 'testMigration_DuplicateHandling',
    total: 1,
    passed: result.length === 2 ? 1 : 0,
    failed: result.length === 2 ? 0 : 1,
    actual: result.length
  };
}

/**
 * Test migration with invalid data handling
 * @return {Object} Test result
 */
function testMigration_InvalidDataHandling() {
  var sourceData = {
    papers: [
      { name: '아트지 150g', gram: 150 },
      { name: 'InvalidPaper' },  // Will fail transformation
      { name: '스노우지 200g', gram: 200 }
    ],
    sizes: [
      { name: 'A4' },
      { name: 'InvalidSize' }  // Will fail transformation
    ]
  };

  var transformedPapers = transformPapers(sourceData.papers);
  var transformedSizes = transformSizes(sourceData.sizes);

  // Should handle errors gracefully and return valid records only
  return {
    function: 'testMigration_InvalidDataHandling',
    total: 2,
    passed: (transformedPapers.length === 2 ? 1 : 0) + (transformedSizes.length === 1 ? 1 : 0),
    failed: (transformedPapers.length === 2 ? 0 : 1) + (transformedSizes.length === 1 ? 0 : 1)
  };
}

/**
 * Test bilingual name generation
 * @return {Object} Test result
 */
function testMigration_BilingualNames() {
  var sourceData = {
    papers: [
      { name: '아트지 150g', gram: 150 }
    ],
    sizes: [
      { name: 'A4' }
    ],
    finishes: [
      { name: '유광코팅' }
    ],
    bindings: [
      { name: '중철' }
    ]
  };

  var papers = transformPapers(sourceData.papers);
  var sizes = transformSizes(sourceData.sizes);
  var finishes = transformFinishes(sourceData.finishes);
  var bindings = transformBindings(sourceData.bindings);

  // Check bilingual coverage
  var paperBilingual = papers[0].paper_name_ko && papers[0].paper_name_en;
  var sizeBilingual = sizes[0].size_name;  // Size uses size_name only
  var finishBilingual = finishes[0].finish_name_ko && finishes[0].finish_name_en;
  var bindingBilingual = bindings[0].binding_name_ko && bindings[0].binding_name_en;

  return {
    function: 'testMigration_BilingualNames',
    total: 4,
    passed: (paperBilingual ? 1 : 0) + (sizeBilingual ? 1 : 0) +
             (finishBilingual ? 1 : 0) + (bindingBilingual ? 1 : 0),
    failed: (paperBilingual ? 0 : 1) + (sizeBilingual ? 0 : 1) +
             (finishBilingual ? 0 : 1) + (bindingBilingual ? 0 : 1)
  };
}

/**
 * Test code format compliance
 * @return {Object} Test result
 */
function testMigration_CodeFormatCompliance() {
  var sourceData = {
    papers: [
      { name: '아트지 150g', gram: 150 }
    ],
    sizes: [
      { name: 'A4' }
    ],
    finishes: [
      { name: '유광코팅' }
    ],
    bindings: [
      { name: '중철' }
    ]
  };

  var papers = transformPapers(sourceData.papers);
  var sizes = transformSizes(sourceData.sizes);
  var finishes = transformFinishes(sourceData.finishes);
  var bindings = transformBindings(sourceData.bindings);

  var paperCodeValid = CODE_PATTERNS.PAPER.test(papers[0].paper_code);
  var sizeCodeValid = CODE_PATTERNS.SIZE.test(sizes[0].size_code);
  var finishCodeValid = CODE_PATTERNS.FINISH.test(finishes[0].finish_code);
  var bindingCodeValid = CODE_PATTERNS.BINDING.test(bindings[0].binding_code);

  return {
    function: 'testMigration_CodeFormatCompliance',
    total: 4,
    passed: (paperCodeValid ? 1 : 0) + (sizeCodeValid ? 1 : 0) +
             (finishCodeValid ? 1 : 0) + (bindingCodeValid ? 1 : 0),
    failed: (paperCodeValid ? 0 : 1) + (sizeCodeValid ? 0 : 1) +
             (finishCodeValid ? 0 : 1) + (bindingCodeValid ? 0 : 1)
  };
}

/**
 * Test data transformation consistency
 * @return {Object} Test result
 */
function testTransformation_Consistency() {
  // Transform same data twice
  var sourcePaper = { name: '아트지 150g', gram: 150 };

  var result1 = transformPaper(sourcePaper);
  var result2 = transformPaper(sourcePaper);

  // Results should be identical
  var isConsistent = deepEqual(result1, result2);

  return {
    function: 'testTransformation_Consistency',
    total: 1,
    passed: isConsistent ? 1 : 0,
    failed: isConsistent ? 0 : 1
  };
}

/**
 * Test reference integrity between transformed data
 * @return {Object} Test result
 */
function testTransformation_ReferenceIntegrity() {
  // Create a product that references paper and size
  var sourceProduct = {
    name: '명함 100매',
    category: 'DIG',
    mes_code: '001-0001'
  };

  var product = transformProduct(sourceProduct);

  // Product should have valid structure
  var hasCategory = product.category === 'DIG';
  var hasCode = product.product_code && product.product_code.indexOf('PROD_DIG_') === 0;

  return {
    function: 'testTransformation_ReferenceIntegrity',
    total: 2,
    passed: (hasCategory ? 1 : 0) + (hasCode ? 1 : 0),
    failed: (hasCategory ? 0 : 1) + (hasCode ? 0 : 1)
  };
}

/**
 * Test MES code handling
 * @return {Object} Test result
 */
function testMigration_MESCodeHandling() {
  var sourceData = [
    { name: '아트지 150g', gram: 150, mes_code: '001-0001' },
    { name: '스노우지 200g', gram: 200, mes_code: '001-0002' },
    { name: '모조지 80g', gram: 80 }  // No MES code
  ];

  var results = transformPapers(sourceData);

  // Check MES codes are preserved
  var hasMES1 = results[0].mes_code === '001-0001';
  var hasMES2 = results[1].mes_code === '001-0002';
  var noMES3 = results[2].mes_code === null;

  return {
    function: 'testMigration_MESCodeHandling',
    total: 3,
    passed: (hasMES1 ? 1 : 0) + (hasMES2 ? 1 : 0) + (noMES3 ? 1 : 0),
    failed: (hasMES1 ? 0 : 1) + (hasMES2 ? 0 : 1) + (noMES3 ? 0 : 1)
  };
}

/**
 * Test timestamp generation
 * @return {Object} Test result
 */
function testMigration_TimestampGeneration() {
  var sourcePaper = { name: '아트지 150g', gram: 150 };
  var result = transformPaper(sourcePaper);

  // Should have both timestamps
  var hasCreated = result.created_at && result.created_at.length > 0;
  var hasUpdated = result.updated_at && result.updated_at.length > 0;
  var timestampsMatch = result.created_at === result.updated_at;

  // Check ISO 8601 format
  var isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  var isValidFormat = isoPattern.test(result.created_at);

  return {
    function: 'testMigration_TimestampGeneration',
    total: 4,
    passed: (hasCreated ? 1 : 0) + (hasUpdated ? 1 : 0) +
             (timestampsMatch ? 1 : 0) + (isValidFormat ? 1 : 0),
    failed: (hasCreated ? 0 : 1) + (hasUpdated ? 0 : 1) +
             (timestampsMatch ? 0 : 1) + (isValidFormat ? 0 : 1)
  };
}

/**
 * Test status field assignment
 * @return {Object} Test result
 */
function testMigration_StatusAssignment() {
  var sourceData = {
    papers: [{ name: '아트지 150g', gram: 150 }],
    sizes: [{ name: 'A4' }],
    finishes: [{ name: '유광코팅' }],
    bindings: [{ name: '중철' }]
  };

  var papers = transformPapers(sourceData.papers);
  var sizes = transformSizes(sourceData.sizes);
  var finishes = transformFinishes(sourceData.finishes);
  var bindings = transformBindings(sourceData.bindings);

  var paperStatus = papers[0].status === 'A';
  var sizeStatus = sizes[0].status === 'A';
  var finishStatus = finishes[0].status === 'A';
  var bindingStatus = bindings[0].status === 'A';

  return {
    function: 'testMigration_StatusAssignment',
    total: 4,
    passed: (paperStatus ? 1 : 0) + (sizeStatus ? 1 : 0) +
             (finishStatus ? 1 : 0) + (bindingStatus ? 1 : 0),
    failed: (paperStatus ? 0 : 1) + (sizeStatus ? 0 : 1) +
             (finishStatus ? 0 : 1) + (bindingStatus ? 0 : 1)
  };
}

/**
 * Test Korean field name handling
 * @return {Object} Test result
 */
function testMigration_KoreanFieldNames() {
  var sourceData = {
    papers: [{ 종이명: '아트지 150g', gram: 150 }],
    sizes: [{ 사이즈: 'A4' }],
    finishes: [{ 후가공: '유광코팅' }],
    bindings: [{ 제본: '중철' }]
  };

  var papers = transformPapers(sourceData.papers);
  var sizes = transformSizes(sourceData.sizes);
  var finishes = transformFinishes(sourceData.finishes);
  var bindings = transformBindings(sourceData.bindings);

  // Korean field names should be handled correctly
  var paperOK = papers[0].paper_code === 'PAPER_ART_150';
  var sizeOK = sizes[0].size_code === 'SIZE_A4_ISO';
  var finishOK = finishes[0].finish_code === 'FINISH_LAM_GLOSS';
  var bindingOK = bindings[0].binding_code === 'BIND_SADDLE_STD';

  return {
    function: 'testMigration_KoreanFieldNames',
    total: 4,
    passed: (paperOK ? 1 : 0) + (sizeOK ? 1 : 0) +
             (finishOK ? 1 : 0) + (bindingOK ? 1 : 0),
    failed: (paperOK ? 0 : 1) + (sizeOK ? 0 : 1) +
             (finishOK ? 0 : 1) + (bindingOK ? 0 : 1)
  };
}

/**
 * Test large batch transformation
 * @return {Object} Test result
 */
function testMigration_LargeBatch() {
  // Create large dataset
  var papers = [];
  for (var i = 0; i < 100; i++) {
    papers.push({
      name: '아트지 ' + (80 + i * 5) + 'g',
      gram: 80 + i * 5
    });
  }

  var results = transformPapers(papers);

  return {
    function: 'testMigration_LargeBatch',
    total: 1,
    passed: results.length === 100 ? 1 : 0,
    failed: results.length === 100 ? 0 : 1,
    actual: results.length
  };
}

/**
 * Test error handling in batch transformation
 * @return {Object} Test result
 */
function testMigration_BatchErrorHandling() {
  var sourcePapers = [
    { name: '아트지 150g', gram: 150 },
    { name: null },  // Invalid
    { name: '스노우지 200g', gram: 200 },
    {},  // Empty
    { name: '모조지 80g', gram: 80 }
  ];

  var results = transformPapers(sourcePapers);

  // Should handle errors gracefully and return valid records
  return {
    function: 'testMigration_BatchErrorHandling',
    total: 1,
    passed: results.length === 3 ? 1 : 0,
    failed: results.length === 3 ? 0 : 1,
    actual: results.length
  };
}

/**
 * Run all integration tests
 * @return {Object} All test results
 */
function runAllIntegrationTests() {
  var allResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: {}
  };

  var testFunctions = [
    'testFullMigration_CompleteFlow',
    'testMigration_DuplicateHandling',
    'testMigration_InvalidDataHandling',
    'testMigration_BilingualNames',
    'testMigration_CodeFormatCompliance',
    'testTransformation_Consistency',
    'testTransformation_ReferenceIntegrity',
    'testMigration_MESCodeHandling',
    'testMigration_TimestampGeneration',
    'testMigration_StatusAssignment',
    'testMigration_KoreanFieldNames',
    'testMigration_LargeBatch',
    'testMigration_BatchErrorHandling'
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
