/**
 * Main Test Suite
 *
 * Comprehensive tests for Main.gs
 * Target Coverage: 80%+
 */

// ============================================
// TEST CONFIGURATION
// ============================================

var TEST_SPREADSHEET = null;

// ============================================
// SETUP AND TEARDOWN
// ============================================

/**
 * Setup test environment
 */
function setupMainTests() {
  TEST_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  clearLogBuffer();
}

/**
 * Cleanup test environment
 */
function teardownMainTests() {
  clearLogBuffer();
}

// ============================================
// RUN MIGRATION TESTS
// ============================================

/**
 * Test runMigration with minimal options
 */
function testRunMigration_MinimalOptions() {
  setupMainTests();

  var result = runMigration({});

  assertNotNull(result, 'Result should not be null');
  assertEquals('SUCCESS', result.status, 'Status should be SUCCESS');
  assertNotNull(result.startTime, 'Should have startTime');
  assertNotNull(result.endTime, 'Should have endTime');
  assertNotNull(result.migrated, 'Should have migrated object');
  assertNotNull(result.validation, 'Should have validation object');

  teardownMainTests();
}

/**
 * Test runMigration with clearExisting option
 */
function testRunMigration_ClearExisting() {
  setupMainTests();

  // Create some test data first
  var papers = [{
    paper_code: 'EXISTING',
    paper_name_ko: 'Existing Paper',
    status: 'A'
  }];
  writePapers(papers, TEST_SPREADSHEET);

  var result = runMigration({ clearExisting: true });

  assertEquals('SUCCESS', result.status, 'Status should be SUCCESS');
  assertNotNull(result.migrated, 'Should have migrated object');

  teardownMainTests();
}

/**
 * Test runMigration error handling
 */
function testRunMigration_ErrorHandling() {
  setupMainTests();

  // Force an error by mocking invalid state
  var originalLoad = loadSourceData;
  loadSourceData = function() {
    throw new Error('Test error');
  };

  var result = runMigration({});

  assertEquals('ERROR', result.status, 'Status should be ERROR');
  assertTrue(result.errors.length > 0, 'Should have errors');

  // Restore
  loadSourceData = originalLoad;

  teardownMainTests();
}

/**
 * Test runMigration result structure
 */
function testRunMigration_ResultStructure() {
  setupMainTests();

  var result = runMigration({});

  // Verify all expected fields
  assertNotNull(result.status, 'Should have status');
  assertNotNull(result.startTime, 'Should have startTime');
  assertNotNull(result.endTime, 'Should have endTime');
  assertNotNull(result.migrated, 'Should have migrated');
  assertNotNull(result.validation, 'Should have validation');
  assertNotNull(result.errors, 'Should have errors array');
  assertNotNull(result.warnings, 'Should have warnings array');

  // Verify types
  assertTrue(Array.isArray(result.errors), 'Errors should be array');
  assertTrue(Array.isArray(result.warnings), 'Warnings should be array');

  teardownMainTests();
}

// ============================================
// TRANSFORM PRODUCTS TESTS
// ============================================

/**
 * Test transformProducts with empty array
 */
function testTransformProducts_EmptyArray() {
  setupMainTests();

  var result = transformProducts([]);

  assertNotNull(result, 'Result should not be null');
  assertEquals(0, result.length, 'Should return empty array');

  teardownMainTests();
}

/**
 * Test transformProducts with single product
 */
function testTransformProducts_SingleProduct() {
  setupMainTests();

  var sourceProducts = [{
    name: 'Test Product',
    category: 'DIG',
    mes_code: '001001',
    제작수량: '100~',
    수량단위: '매',
    제작일: '3'
  }];

  var result = transformProducts(sourceProducts);

  assertEquals(1, result.length, 'Should return 1 product');
  assertNotNull(result[0].product_code, 'Should have product code');
  assertNotNull(result[0].product_name_ko, 'Should have Korean name');
  assertNotNull(result[0].category, 'Should have category');

  teardownMainTests();
}

/**
 * Test transformProducts with multiple products
 */
function testTransformProducts_MultipleProducts() {
  setupMainTests();

  var sourceProducts = [
    { name: 'Product 1', category: 'DIG' },
    { name: 'Product 2', category: 'STK' },
    { name: 'Product 3', category: 'CAL' }
  ];

  var result = transformProducts(sourceProducts);

  assertEquals(3, result.length, 'Should return 3 products');
  assertEquals('DIG', result[0].category, 'First product should be DIG');
  assertEquals('STK', result[1].category, 'Second product should be STK');
  assertEquals('CAL', result[2].category, 'Third product should be CAL');

  teardownMainTests();
}

/**
 * Test transformProducts removes duplicates
 */
function testTransformProducts_RemovesDuplicates() {
  setupMainTests();

  var sourceProducts = [
    { name: 'Product 1', category: 'DIG' },
    { name: 'Product 1', category: 'DIG' },
    { name: 'Product 2', category: 'STK' }
  ];

  var result = transformProducts(sourceProducts);

  assertEquals(2, result.length, 'Should remove duplicate product');

  teardownMainTests();
}

/**
 * Test transformProducts error handling
 */
function testTransformProducts_ErrorHandling() {
  setupMainTests();

  var sourceProducts = [
    { name: 'Valid Product', category: 'DIG' },
    { invalid: 'product' },
    { name: 'Another Valid', category: 'STK' }
  ];

  var result = transformProducts(sourceProducts);

  assertTrue(result.length >= 2, 'Should skip invalid products and continue');

  teardownMainTests();
}

// ============================================
// TRANSFORM PRODUCT TESTS
// ============================================

/**
 * Test transformProduct with Korean fields
 */
function testTransformProduct_KoreanFields() {
  setupMainTests();

  var sourceProduct = {
    상품명: '테스트 상품',
    카테고리: 'DIG',
    설명: '테스트 설명'
  };

  var result = transformProduct(sourceProduct);

  assertEquals('테스트 상품', result.product_name_ko, 'Should extract Korean name');
  assertEquals('DIG', result.category, 'Should extract Korean category');
  assertEquals('테스트 설명', result.description, 'Should extract Korean description');

  teardownMainTests();
}

/**
 * Test transformProduct with English fields
 */
function testTransformProduct_EnglishFields() {
  setupMainTests();

  var sourceProduct = {
    name: 'Test Product',
    category: 'STK',
    description: 'Test Description'
  };

  var result = transformProduct(sourceProduct);

  assertEquals('Test Product', result.product_name_ko, 'Should extract English name');
  assertEquals('STK', result.category, 'Should extract English category');
  assertEquals('Test Description', result.description, 'Should extract English description');

  teardownMainTests();
}

/**
 * Test transformProduct generates English name
 */
function testTransformProduct_GeneratesEnglishName() {
  setupMainTests();

  var sourceProduct = {
    name: '포스터',
    category: 'DIG'
  };

  var result = transformProduct(sourceProduct);

  assertNotNull(result.product_name_en, 'Should have English name');
  assertTrue(result.product_name_en.indexOf('Digital') !== -1, 'Should include category name');

  teardownMainTests();
}

/**
 * Test transformProduct default values
 */
function testTransformProduct_DefaultValues() {
  setupMainTests();

  var sourceProduct = {
    name: 'Minimal Product'
  };

  var result = transformProduct(sourceProduct);

  assertEquals('DIG', result.category, 'Should default to DIG');
  assertEquals(100, result.min_quantity, 'Should default to 100');
  assertEquals(3, result.lead_time_days, 'Should default to 3 days');
  assertEquals('A', result.status, 'Should default to active status');

  teardownMainTests();
}

/**
 * Test transformProduct MES code parsing
 */
function testTransformProduct_MESCodeParsing() {
  setupMainTests();

  var sourceProduct = {
    name: 'Test Product',
    mes_code: '001001'
  };

  var result = transformProduct(sourceProduct);

  assertEquals('DIG', result.category, 'Should parse category from MES code 001');
  assertEquals('001001', result.mes_code, 'Should preserve MES code');

  teardownMainTests();
}

// ============================================
// EXTRACT PRODUCT NAME TESTS
// ============================================

/**
 * Test extractProductName with name field
 */
function testExtractProductName_WithName() {
  setupMainTests();

  var sourceProduct = { name: 'Test Product' };
  var result = extractProductName(sourceProduct);

  assertEquals('Test Product', result, 'Should extract name field');

  teardownMainTests();
}

/**
 * Test extractProductName with Korean field
 */
function testExtractProductName_WithKoreanName() {
  setupMainTests();

  var sourceProduct = { 상품명: '테스트 상품' };
  var result = extractProductName(sourceProduct);

  assertEquals('테스트 상품', result, 'Should extract Korean name field');

  teardownMainTests();
}

/**
 * Test extractProductName with both fields
 */
function testExtractProductName_WithBothFields() {
  setupMainTests();

  var sourceProduct = {
    name: 'English Name',
    상품명: 'Korean Name'
  };
  var result = extractProductName(sourceProduct);

  assertEquals('English Name', result, 'Should prefer English name');

  teardownMainTests();
}

/**
 * Test extractProductName with no name
 */
function testExtractProductName_NoName() {
  setupMainTests();

  var sourceProduct = { other_field: 'value' };
  var result = extractProductName(sourceProduct);

  assertEquals('Unknown Product', result, 'Should return default name');

  teardownMainTests();
}

// ============================================
// EXTRACT PRODUCT CATEGORY TESTS
// ============================================

/**
 * Test extractProductCategory with English field
 */
function testExtractProductCategory_EnglishField() {
  setupMainTests();

  var sourceProduct = { category: 'STK' };
  var result = extractProductCategory(sourceProduct);

  assertEquals('STK', result, 'Should extract English category');

  teardownMainTests();
}

/**
 * Test extractProductCategory with Korean field
 */
function testExtractProductCategory_KoreanField() {
  setupMainTests();

  var sourceProduct = { 카테고리: 'CAL' };
  var result = extractProductCategory(sourceProduct);

  assertEquals('CAL', result, 'Should extract Korean category');

  teardownMainTests();
}

/**
 * Test extractProductCategory from MES code
 */
function testExtractProductCategory_FromMESCode() {
  setupMainTests();

  var sourceProduct = { mes_code: '002001' };
  var result = extractProductCategory(sourceProduct);

  assertEquals('STK', result, 'Should parse category from MES code 002');

  teardownMainTests();
}

/**
 * Test extractProductCategory defaults
 */
function testExtractProductCategory_Defaults() {
  setupMainTests();

  var sourceProduct = {};
  var result = extractProductCategory(sourceProduct);

  assertEquals('DIG', result, 'Should default to DIG');

  teardownMainTests();
}

// ============================================
// GET ABBREVIATION FOR CATEGORY TESTS
// ============================================

/**
 * Test getAbbreviationForCategory with known categories
 */
function testGetAbbreviationForCategory_KnownCategories() {
  setupMainTests();

  assertEquals('DIG', getAbbreviationForCategory('001'), '001 should be DIG');
  assertEquals('STK', getAbbreviationForCategory('002'), '002 should be STK');
  assertEquals('BOOK', getAbbreviationForCategory('006'), '006 should be BOOK');
  assertEquals('CAL', getAbbreviationForCategory('007'), '007 should be CAL');

  teardownMainTests();
}

/**
 * Test getAbbreviationForCategory with unknown category
 */
function testGetAbbreviationForCategory_UnknownCategory() {
  setupMainTests();

  var result = getAbbreviationForCategory('999');
  assertEquals('DIG', result, 'Unknown category should default to DIG');

  teardownMainTests();
}

/**
 * Test getAbbreviationForCategory with null
 */
function testGetAbbreviationForCategory_Null() {
  setupMainTests();

  var result = getAbbreviationForCategory(null);
  assertEquals('DIG', result, 'Null should default to DIG');

  teardownMainTests();
}

// ============================================
// EXTRACT SUB CATEGORY TESTS
// ============================================

/**
 * Test extractSubCategory with value
 */
function testExtractSubCategory_WithValue() {
  setupMainTests();

  var sourceProduct = { sub_category: 'POSTCARD' };
  var result = extractSubCategory(sourceProduct);

  assertEquals('POSTCARD', result, 'Should extract sub_category');

  teardownMainTests();
}

/**
 * Test extractSubCategory without value
 */
function testExtractSubCategory_WithoutValue() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractSubCategory(sourceProduct);

  assertEquals(null, result, 'Should return null when not present');

  teardownMainTests();
}

// ============================================
// EXTRACT AVAILABLE PAPERS TESTS
// ============================================

/**
 * Test extractAvailablePapers with value
 */
function testExtractAvailablePapers_WithValue() {
  setupMainTests();

  var sourceProduct = { available_papers: 'PAPER_ART_150,PAPER_SNOW_180' };
  var result = extractAvailablePapers(sourceProduct);

  assertEquals('PAPER_ART_150,PAPER_SNOW_180', result, 'Should extract available papers');

  teardownMainTests();
}

/**
 * Test extractAvailablePapers default
 */
function testExtractAvailablePapers_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractAvailablePapers(sourceProduct);

  assertEquals('PAPER_ART_*', result, 'Should default to wildcard');

  teardownMainTests();
}

// ============================================
// EXTRACT AVAILABLE SIZES TESTS
// ============================================

/**
 * Test extractAvailableSizes with value
 */
function testExtractAvailableSizes_WithValue() {
  setupMainTests();

  var sourceProduct = { available_sizes: 'A4,A5' };
  var result = extractAvailableSizes(sourceProduct);

  assertEquals('A4,A5', result, 'Should extract available sizes');

  teardownMainTests();
}

/**
 * Test extractAvailableSizes default
 */
function testExtractAvailableSizes_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractAvailableSizes(sourceProduct);

  assertEquals(null, result, 'Should default to null');

  teardownMainTests();
}

// ============================================
// EXTRACT AVAILABLE FINISHES TESTS
// ============================================

/**
 * Test extractAvailableFinishes with value
 */
function testExtractAvailableFinishes_WithValue() {
  setupMainTests();

  var sourceProduct = { available_finishes: 'FINISH_GLOSSY,FINISH_MATTE' };
  var result = extractAvailableFinishes(sourceProduct);

  assertEquals('FINISH_GLOSSY,FINISH_MATTE', result, 'Should extract available finishes');

  teardownMainTests();
}

/**
 * Test extractAvailableFinishes default
 */
function testExtractAvailableFinishes_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractAvailableFinishes(sourceProduct);

  assertEquals(null, result, 'Should default to null');

  teardownMainTests();
}

// ============================================
// EXTRACT MIN QUANTITY TESTS
// ============================================

/**
 * Test extractMinQuantity with value
 */
function testExtractMinQuantity_WithValue() {
  setupMainTests();

  var sourceProduct = { min_quantity: 50 };
  var result = extractMinQuantity(sourceProduct);

  assertEquals(50, result, 'Should extract min_quantity');

  teardownMainTests();
}

/**
 * Test extractMinQuantity with Korean format
 */
function testExtractMinQuantity_KoreanFormat() {
  setupMainTests();

  var sourceProduct = { 제작수량: '100~' };
  var result = extractMinQuantity(sourceProduct);

  assertEquals(100, result, 'Should parse Korean format');

  teardownMainTests();
}

/**
 * Test extractMinQuantity with various Korean formats
 */
function testExtractMinQuantity_VariousKoreanFormats() {
  setupMainTests();

  var result1 = extractMinQuantity({ 제작수량: '50매~' });
  assertEquals(50, result1, 'Should parse "50매~"');

  var result2 = extractMinQuantity({ 제작수량: '200 ~' });
  assertEquals(200, result2, 'Should parse "200 ~"');

  var result3 = extractMinQuantity({ 제작수량: 'Invalid' });
  assertEquals(100, result3, 'Should default to 100 for invalid format');

  teardownMainTests();
}

/**
 * Test extractMinQuantity default
 */
function testExtractMinQuantity_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractMinQuantity(sourceProduct);

  assertEquals(100, result, 'Should default to 100');

  teardownMainTests();
}

// ============================================
// EXTRACT QUANTITY UNIT TESTS
// ============================================

/**
 * Test extractQuantityUnit with value
 */
function testExtractQuantityUnit_WithValue() {
  setupMainTests();

  var sourceProduct = { quantity_unit: 50 };
  var result = extractQuantityUnit(sourceProduct);

  assertEquals(50, result, 'Should extract quantity_unit');

  teardownMainTests();
}

/**
 * Test extractQuantityUnit with Korean field
 */
function testExtractQuantityUnit_KoreanField() {
  setupMainTests();

  var sourceProduct = { 수량단위: 100 };
  var result = extractQuantityUnit(sourceProduct);

  assertEquals(100, result, 'Should extract Korean field');

  teardownMainTests();
}

/**
 * Test extractQuantityUnit default
 */
function testExtractQuantityUnit_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractQuantityUnit(sourceProduct);

  assertEquals(100, result, 'Should default to 100');

  teardownMainTests();
}

// ============================================
// EXTRACT LEAD TIME TESTS
// ============================================

/**
 * Test extractLeadTime with value
 */
function testExtractLeadTime_WithValue() {
  setupMainTests();

  var sourceProduct = { lead_time_days: 5 };
  var result = extractLeadTime(sourceProduct);

  assertEquals(5, result, 'Should extract lead_time_days');

  teardownMainTests();
}

/**
 * Test extractLeadTime with Korean field
 */
function testExtractLeadTime_KoreanField() {
  setupMainTests();

  var sourceProduct = { 제작일: 7 };
  var result = extractLeadTime(sourceProduct);

  assertEquals(7, result, 'Should extract Korean field');

  teardownMainTests();
}

/**
 * Test extractLeadTime default
 */
function testExtractLeadTime_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractLeadTime(sourceProduct);

  assertEquals(3, result, 'Should default to 3');

  teardownMainTests();
}

// ============================================
// EXTRACT DESCRIPTION TESTS
// ============================================

/**
 * Test extractDescription with value
 */
function testExtractDescription_WithValue() {
  setupMainTests();

  var sourceProduct = { description: 'Test description' };
  var result = extractDescription(sourceProduct);

  assertEquals('Test description', result, 'Should extract description');

  teardownMainTests();
}

/**
 * Test extractDescription with Korean field
 */
function testExtractDescription_KoreanField() {
  setupMainTests();

  var sourceProduct = { 설명: '테스트 설명' };
  var result = extractDescription(sourceProduct);

  assertEquals('테스트 설명', result, 'Should extract Korean description');

  teardownMainTests();
}

/**
 * Test extractDescription with both fields
 */
function testExtractDescription_BothFields() {
  setupMainTests();

  var sourceProduct = {
    description: 'English description',
    설명: 'Korean description'
  };
  var result = extractDescription(sourceProduct);

  assertEquals('English description', result, 'Should prefer English description');

  teardownMainTests();
}

/**
 * Test extractDescription default
 */
function testExtractDescription_Default() {
  setupMainTests();

  var sourceProduct = { name: 'Test' };
  var result = extractDescription(sourceProduct);

  assertEquals(null, result, 'Should default to null');

  teardownMainTests();
}

// ============================================
// GENERATE ENGLISH PRODUCT NAME TESTS
// ============================================

/**
 * Test generateEnglishProductName for each category
 */
function testGenerateEnglishProductName_AllCategories() {
  setupMainTests();

  assertEquals('Digital - Test Name', generateEnglishProductName('DIG', 'Test Name'), 'DIG category');
  assertEquals('Sticker - Test Name', generateEnglishProductName('STK', 'Test Name'), 'STK category');
  assertEquals('Booklet - Test Name', generateEnglishProductName('BOOK', 'Test Name'), 'BOOK category');
  assertEquals('Calendar - Test Name', generateEnglishProductName('CAL', 'Test Name'), 'CAL category');
  assertEquals('Large Format - Test Name', generateEnglishProductName('LG', 'Test Name'), 'LG category');
  assertEquals('Stationery - Test Name', generateEnglishProductName('STN', 'Test Name'), 'STN category');
  assertEquals('Acrylic - Test Name', generateEnglishProductName('ACR', 'Test Name'), 'ACR category');
  assertEquals('Goods - Test Name', generateEnglishProductName('GOODS', 'Test Name'), 'GOODS category');

  teardownMainTests();
}

/**
 * Test generateEnglishProductName with unknown category
 */
function testGenerateEnglishProductName_UnknownCategory() {
  setupMainTests();

  var result = generateEnglishProductName('UNKNOWN', 'Test Name');

  assertEquals('Product - Test Name', result, 'Unknown category should default to Product');

  teardownMainTests();
}

// ============================================
// GET KOREAN PAPER TYPE NAME TESTS
// ============================================

/**
 * Test getKoreanPaperTypeName for known types
 */
function testGetKoreanPaperTypeName_KnownTypes() {
  setupMainTests();

  assertEquals('아트지', getKoreanPaperTypeName('ART'), 'ART type');
  assertEquals('스노우지', getKoreanPaperTypeName('SNOW'), 'SNOW type');
  assertEquals('모조지', getKoreanPaperTypeName('MOJO'), 'MOJO type');
  assertEquals('크라프트지', getKoreanPaperTypeName('KRAFT'), 'KRAFT type');
  assertEquals('아이보리지', getKoreanPaperTypeName('IVORY'), 'IVORY type');
  assertEquals('특수지', getKoreanPaperTypeName('SPECIAL'), 'SPECIAL type');

  teardownMainTests();
}

/**
 * Test getKoreanPaperTypeName with unknown type
 */
function testGetKoreanPaperTypeName_UnknownType() {
  setupMainTests();

  var result = getKoreanPaperTypeName('UNKNOWN');

  assertEquals('UNKNOWN', result, 'Unknown type should return as-is');

  teardownMainTests();
}

// ============================================
// GET ENGLISH PAPER TYPE NAME TESTS
// ============================================

/**
 * Test getEnglishPaperTypeName for known types
 */
function testGetEnglishPaperTypeName_KnownTypes() {
  setupMainTests();

  assertEquals('Art Paper', getEnglishPaperTypeName('ART'), 'ART type');
  assertEquals('Snow White', getEnglishPaperTypeName('SNOW'), 'SNOW type');
  assertEquals('Uncoated', getEnglishPaperTypeName('MOJO'), 'MOJO type');
  assertEquals('Kraft', getEnglishPaperTypeName('KRAFT'), 'KRAFT type');
  assertEquals('Ivory Board', getEnglishPaperTypeName('IVORY'), 'IVORY type');
  assertEquals('Specialty', getEnglishPaperTypeName('SPECIAL'), 'SPECIAL type');

  teardownMainTests();
}

/**
 * Test getEnglishPaperTypeName with unknown type
 */
function testGetEnglishPaperTypeName_UnknownType() {
  setupMainTests();

  var result = getEnglishPaperTypeName('UNKNOWN');

  assertEquals('UNKNOWN', result, 'Unknown type should return as-is');

  teardownMainTests();
}

// ============================================
// GET KOREAN STANDARD NAME TESTS
// ============================================

/**
 * Test getKoreanStandardName for known standards
 */
function testGetKoreanStandardName_KnownStandards() {
  setupMainTests();

  assertEquals('ISO 216', getKoreanStandardName('ISO'), 'ISO standard');
  assertEquals('JIS', getKoreanStandardName('JIS'), 'JIS standard');
  assertEquals('한국산업규격', getKoreanStandardName('KS'), 'KS standard');
  assertEquals('사용자정의', getKoreanStandardName('CUSTOM'), 'CUSTOM standard');

  teardownMainTests();
}

/**
 * Test getKoreanStandardName with unknown standard
 */
function testGetKoreanStandardName_UnknownStandard() {
  setupMainTests();

  var result = getKoreanStandardName('UNKNOWN');

  assertEquals('UNKNOWN', result, 'Unknown standard should return as-is');

  teardownMainTests();
}

// ============================================
// SUM VALUES TESTS
// ============================================

/**
 * Test sumValues with object
 */
function testSumValues_Object() {
  setupMainTests();

  var obj = { a: 1, b: 2, c: 3 };
  var result = sumValues(obj);

  assertEquals(6, result, 'Should sum all values');

  teardownMainTests();
}

/**
 * Test sumValues with empty object
 */
function testSumValues_EmptyObject() {
  setupMainTests();

  var obj = {};
  var result = sumValues(obj);

  assertEquals(0, result, 'Empty object should sum to 0');

  teardownMainTests();
}

/**
 * Test sumValues with zeros
 */
function testSumValues_WithZeros() {
  setupMainTests();

  var obj = { a: 0, b: 5, c: 0 };
  var result = sumValues(obj);

  assertEquals(5, result, 'Should handle zeros correctly');

  teardownMainTests();
}

// ============================================
// PARSE MES CODE TESTS
// ============================================

/**
 * Test parse_mes_code is alias
 */
function testParseMesCode_IsAlias() {
  setupMainTests();

  // This test verifies that parse_mes_code is an alias for parseMesCode
  // In actual implementation, it would call parseMesCode from MesCode.gs

  var result1 = parse_mes_code('001001');
  var result2 = parseMesCode('001001');

  // Both should return the same result
  assertEquals(typeof result1, typeof result2, 'Both functions should return same type');

  teardownMainTests();
}

// ============================================
// GENERATE CODE DEFINITIONS TESTS
// ============================================

/**
 * Test generateCodeDefinitions with papers
 */
function testGenerateCodeDefinitions_WithPapers() {
  setupMainTests();

  var transformed = {
    papers: [
      { paper_type: 'ART' },
      { paper_type: 'SNOW' },
      { paper_type: 'ART' }
    ],
    sizes: [],
    finishes: [],
    bindings: [],
    products: []
  };

  var result = generateCodeDefinitions(transformed);

  assertEquals(2, result.length, 'Should create 2 paper type codes');
  assertEquals('PAPER', result[0].code_prefix, 'Should have PAPER prefix');
  assertEquals('PAPER_TYPE', result[0].category, 'Should have PAPER_TYPE category');

  teardownMainTests();
}

/**
 * Test generateCodeDefinitions with sizes
 */
function testGenerateCodeDefinitions_WithSizes() {
  setupMainTests();

  var transformed = {
    papers: [],
    sizes: [
      { standard: 'ISO' },
      { standard: 'JIS' },
      { standard: 'ISO' }
    ],
    finishes: [],
    bindings: [],
    products: []
  };

  var result = generateCodeDefinitions(transformed);

  assertEquals(2, result.length, 'Should create 2 size standard codes');
  assertEquals('SIZE', result[0].code_prefix, 'Should have SIZE prefix');
  assertEquals('SIZE_STANDARD', result[0].category, 'Should have SIZE_STANDARD category');

  teardownMainTests();
}

/**
 * Test generateCodeDefinitions adds timestamps
 */
function testGenerateCodeDefinitions_AddsTimestamps() {
  setupMainTests();

  var transformed = {
    papers: [{ paper_type: 'ART' }],
    sizes: [],
    finishes: [],
    bindings: [],
    products: []
  };

  var result = generateCodeDefinitions(transformed);

  assertNotNull(result[0].created_at, 'Should have created_at');
  assertNotNull(result[0].updated_at, 'Should have updated_at');

  teardownMainTests();
}

/**
 * Test generateCodeDefinitions sort orders
 */
function testGenerateCodeDefinitions_SortOrders() {
  setupMainTests();

  var transformed = {
    papers: [
      { paper_type: 'TYPE1' },
      { paper_type: 'TYPE2' }
    ],
    sizes: [
      { standard: 'STD1' },
      { standard: 'STD2' }
    ],
    finishes: [],
    bindings: [],
    products: []
  };

  var result = generateCodeDefinitions(transformed);

  // Paper codes should have sort orders 2 and 3 (base 1 + index)
  var paperCodes = result.filter(function(c) { return c.category === 'PAPER_TYPE'; });
  assertEquals(2, paperCodes[0].sort_order, 'First paper should have sort order 2');
  assertEquals(3, paperCodes[1].sort_order, 'Second paper should have sort order 3');

  teardownMainTests();
}

/**
 * Test generateCodeDefinitions with mixed data
 */
function testGenerateCodeDefinitions_MixedData() {
  setupMainTests();

  var transformed = {
    papers: [{ paper_type: 'ART' }],
    sizes: [{ standard: 'ISO' }],
    finishes: [],
    bindings: [],
    products: []
  };

  var result = generateCodeDefinitions(transformed);

  assertTrue(result.length >= 2, 'Should create codes for both papers and sizes');

  var paperCode = result.filter(function(c) { return c.category === 'PAPER_TYPE'; })[0];
  var sizeCode = result.filter(function(c) { return c.category === 'SIZE_STANDARD'; })[0];

  assertNotNull(paperCode, 'Should have paper type code');
  assertNotNull(sizeCode, 'Should have size standard code');

  teardownMainTests();
}

// ============================================
// LOAD SOURCE DATA TESTS
// ============================================

/**
 * Test loadSourceData returns correct structure
 */
function testLoadSourceData_ReturnsCorrectStructure() {
  setupMainTests();

  var result = loadSourceData([]);

  assertNotNull(result.papers, 'Should have papers array');
  assertNotNull(result.sizes, 'Should have sizes array');
  assertNotNull(result.finishes, 'Should have finishes array');
  assertNotNull(result.bindings, 'Should have bindings array');
  assertNotNull(result.products, 'Should have products array');

  assertTrue(Array.isArray(result.papers), 'Papers should be array');
  assertTrue(Array.isArray(result.sizes), 'Sizes should be array');
  assertTrue(Array.isArray(result.finishes), 'Finishes should be array');
  assertTrue(Array.isArray(result.bindings), 'Bindings should be array');
  assertTrue(Array.isArray(result.products), 'Products should be array');

  teardownMainTests();
}

/**
 * Test loadSourceData with fileIds parameter
 */
function testLoadSourceData_WithFileIds() {
  setupMainTests();

  var fileIds = {
    papers: 'file_id_1',
    sizes: 'file_id_2'
  };

  var result = loadSourceData(fileIds);

  assertNotNull(result, 'Should return result');

  teardownMainTests();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Assert value is not null
 */
function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value should not be null');
  }
}

/**
 * Assert value is greater than
 */
function assertGreaterThan(expected, actual, message) {
  if (actual <= expected) {
    throw new Error(message || 'Expected ' + actual + ' > ' + expected);
  }
}

/**
 * Assert equals
 */
function assertEquals(expected, actual, message) {
  if (expected !== actual) {
    throw new Error(message || 'Expected: ' + expected + ', Actual: ' + actual);
  }
}

/**
 * Assert true
 */
function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(message || 'Expected true but was false');
  }
}
