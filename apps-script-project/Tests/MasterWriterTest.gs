/**
 * MasterWriter Test Suite
 *
 * Comprehensive tests for Writers/MasterWriter.gs
 * Target Coverage: 80%+
 */

// ============================================
// TEST CONFIGURATION
// ============================================

var TEST_SPREADSHEET = null;
var TEST_SHEET_NAME = 'TEST_MASTER_WRITER';

// ============================================
// SETUP AND TEARDOWN
// ============================================

/**
 * Setup test environment
 */
function setupMasterWriterTests() {
  TEST_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  // Clean up any existing test sheet
  var existingSheet = TEST_SPREADSHEET.getSheetByName(TEST_SHEET_NAME);
  if (existingSheet) {
    TEST_SPREADSHEET.deleteSheet(existingSheet);
  }

  clearLogBuffer();
}

/**
 * Cleanup test environment
 */
function teardownMasterWriterTests() {
  if (TEST_SPREADSHEET) {
    var testSheet = TEST_SPREADSHEET.getSheetByName(TEST_SHEET_NAME);
    if (testSheet) {
      TEST_SPREADSHEET.deleteSheet(testSheet);
    }
  }
}

// ============================================
// WRITE PAPERS TESTS
// ============================================

/**
 * Test writePapers with single record
 */
function testWritePapers_SingleRecord() {
  setupMasterWriterTests();

  var papers = [{
    paper_code: 'PAPER_ART_150',
    paper_name_ko: '아트지 150g',
    paper_name_en: 'Art Paper 150gsm',
    paper_type: 'ART',
    gsm: 150,
    thickness_um: 165,
    finish: 'Coated',
    color: 'White',
    opacity: 95,
    printability: 'High',
    status: 'A',
    mes_code: 'P001',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writePapers(papers, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(15, sheet.getLastColumn(), 'Should have 15 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 15).getValues()[0];
  assertEquals('PAPER_ART_150', data[0], 'Paper code should match');
  assertEquals('아트지 150g', data[1], 'Korean name should match');

  teardownMasterWriterTests();
}

/**
 * Test writePapers with multiple records
 */
function testWritePapers_MultipleRecords() {
  setupMasterWriterTests();

  var papers = [
    {
      paper_code: 'PAPER_ART_150',
      paper_name_ko: '아트지 150g',
      paper_name_en: 'Art Paper 150gsm',
      paper_type: 'ART',
      gsm: 150,
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    },
    {
      paper_code: 'PAPER_SNOW_180',
      paper_name_ko: '스노우지 180g',
      paper_name_en: 'Snow Paper 180gsm',
      paper_type: 'SNOW',
      gsm: 180,
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    }
  ];

  writePapers(papers, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  assertEquals(3, sheet.getLastRow(), 'Should have header + 2 data rows');

  teardownMasterWriterTests();
}

/**
 * Test writePapers with empty array
 */
function testWritePapers_EmptyArray() {
  setupMasterWriterTests();

  var papers = [];

  writePapers(papers, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(1, sheet.getLastRow(), 'Should have only header row');

  teardownMasterWriterTests();
}

/**
 * Test writePapers with missing fields
 */
function testWritePapers_MissingFields() {
  setupMasterWriterTests();

  var papers = [{
    paper_code: 'PAPER_ART_150',
    paper_name_ko: '아트지 150g',
    status: 'A'
  }];

  writePapers(papers, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  var data = sheet.getRange(2, 1, 1, 15).getValues()[0];

  assertEquals('PAPER_ART_150', data[0], 'Paper code should match');
  assertEquals('', data[2], 'Missing fields should be empty string');

  teardownMasterWriterTests();
}

// ============================================
// WRITE SIZES TESTS
// ============================================

/**
 * Test writeSizes with single record
 */
function testWriteSizes_SingleRecord() {
  setupMasterWriterTests();

  var sizes = [{
    size_code: 'A4',
    size_name: 'A4',
    width_mm: 210,
    height_mm: 297,
    standard: 'ISO',
    orientation: 'Portrait',
    bleed_mm: 3,
    safe_margin_mm: 5,
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeSizes(sizes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('SIZE_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(11, sheet.getLastColumn(), 'Should have 11 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 11).getValues()[0];
  assertEquals('A4', data[0], 'Size code should match');
  assertEquals(210, data[2], 'Width should match');

  teardownMasterWriterTests();
}

/**
 * Test writeSizes with custom size
 */
function testWriteSizes_CustomSize() {
  setupMasterWriterTests();

  var sizes = [{
    size_code: 'CUSTOM_100x200',
    size_name: 'Custom 100x200',
    width_mm: 100,
    height_mm: 200,
    standard: 'CUSTOM',
    orientation: 'Portrait',
    bleed_mm: 0,
    safe_margin_mm: 0,
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeSizes(sizes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('SIZE_MASTER');
  var data = sheet.getRange(2, 1, 1, 11).getValues()[0];
  assertEquals('CUSTOM', data[4], 'Standard should be CUSTOM');

  teardownMasterWriterTests();
}

// ============================================
// WRITE FINISHES TESTS
// ============================================

/**
 * Test writeFinishes with single record
 */
function testWriteFinishes_SingleRecord() {
  setupMasterWriterTests();

  var finishes = [{
    finish_code: 'FINISH_GLOSSY',
    finish_name_ko: '광택',
    finish_name_en: 'Glossy',
    category: 'COATING',
    sub_type: 'UV',
    unit: 'Side',
    base_price: 100,
    min_quantity: 1,
    applicable_papers: 'PAPER_ART_*',
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeFinishes(finishes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('FINISH_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(12, sheet.getLastColumn(), 'Should have 12 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 12).getValues()[0];
  assertEquals('FINISH_GLOSSY', data[0], 'Finish code should match');
  assertEquals('광택', data[1], 'Korean name should match');

  teardownMasterWriterTests();
}

/**
 * Test writeFinishes with pricing
 */
function testWriteFinishes_WithPricing() {
  setupMasterWriterTests();

  var finishes = [{
    finish_code: 'FINISH_MATTE',
    finish_name_ko: ' matte',
    finish_name_en: 'Matte',
    category: 'COATING',
    sub_type: 'Laminate',
    unit: 'Side',
    base_price: 200,
    min_quantity: 100,
    applicable_papers: 'PAPER_ART_*',
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeFinishes(finishes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('FINISH_MASTER');
  var data = sheet.getRange(2, 1, 1, 12).getValues()[0];
  assertEquals(200, data[6], 'Base price should match');
  assertEquals(100, data[7], 'Min quantity should match');

  teardownMasterWriterTests();
}

// ============================================
// WRITE BINDINGS TESTS
// ============================================

/**
 * Test writeBindings with single record
 */
function testWriteBindings_SingleRecord() {
  setupMasterWriterTests();

  var bindings = [{
    binding_code: 'BIND_SADDLE',
    binding_name_ko: '중철',
    binding_name_en: 'Saddle Stitch',
    binding_type: 'STITCH',
    min_pages: 8,
    max_pages: 64,
    page_unit: 'Sheets',
    cover_required: true,
    spine_calculation: 'FIXED',
    applicable_sizes: 'A4,A5',
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeBindings(bindings, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('BINDING_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(13, sheet.getLastColumn(), 'Should have 13 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 13).getValues()[0];
  assertEquals('BIND_SADDLE', data[0], 'Binding code should match');
  assertEquals(8, data[4], 'Min pages should match');

  teardownMasterWriterTests();
}

/**
 * Test writeBindings without cover
 */
function testWriteBindings_WithoutCover() {
  setupMasterWriterTests();

  var bindings = [{
    binding_code: 'BIND_PAD',
    binding_name_ko: '패드',
    binding_name_en: 'Pad',
    binding_type: 'ADHESIVE',
    min_pages: 10,
    max_pages: 100,
    page_unit: 'Sheets',
    cover_required: false,
    spine_calculation: 'NONE',
    applicable_sizes: 'A4',
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeBindings(bindings, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('BINDING_MASTER');
  var data = sheet.getRange(2, 1, 1, 13).getValues()[0];
  assertEquals(false, data[7], 'Cover required should be false');

  teardownMasterWriterTests();
}

// ============================================
// WRITE PRODUCTS TESTS
// ============================================

/**
 * Test writeProducts with single record
 */
function testWriteProducts_SingleRecord() {
  setupMasterWriterTests();

  var products = [{
    product_code: 'DIG_POSTCARD_A4',
    product_name_ko: 'A4 포스터',
    product_name_en: 'A4 Poster',
    category: 'DIG',
    sub_category: 'POSTCARD',
    default_paper_code: 'PAPER_ART_150',
    default_size_code: 'A4',
    available_papers: 'PAPER_ART_*',
    available_sizes: 'A4,A3',
    available_finishes: 'FINISH_GLOSSY,FINISH_MATTE',
    min_quantity: 100,
    quantity_unit: 100,
    lead_time_days: 3,
    description: 'High quality poster printing',
    status: 'A',
    mes_code: '001001',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeProducts(products, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PRODUCT_MASTER');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(18, sheet.getLastColumn(), 'Should have 18 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 18).getValues()[0];
  assertEquals('DIG_POSTCARD_A4', data[0], 'Product code should match');
  assertEquals('A4 포스터', data[1], 'Korean name should match');

  teardownMasterWriterTests();
}

/**
 * Test writeProducts with multiple products
 */
function testWriteProducts_MultipleProducts() {
  setupMasterWriterTests();

  var products = [
    {
      product_code: 'DIG_POSTCARD_A4',
      product_name_ko: 'A4 포스터',
      product_name_en: 'A4 Poster',
      category: 'DIG',
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    },
    {
      product_code: 'STK_STICKER_A5',
      product_name_ko: 'A5 스티커',
      product_name_en: 'A5 Sticker',
      category: 'STK',
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    }
  ];

  writeProducts(products, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PRODUCT_MASTER');
  assertEquals(3, sheet.getLastRow(), 'Should have header + 2 data rows');

  teardownMasterWriterTests();
}

// ============================================
// WRITE CODE DEFINITIONS TESTS
// ============================================

/**
 * Test writeCodeDefinitions with single record
 */
function testWriteCodeDefinitions_SingleRecord() {
  setupMasterWriterTests();

  var codes = [{
    code_prefix: 'PAPER',
    code_value: 'ART',
    name_ko: '아트지',
    name_en: 'Art Paper',
    category: 'PAPER_TYPE',
    parent_code: 'PAPER',
    sort_order: 1,
    description: 'Coated art paper',
    status: 'A',
    created_at: '2026-01-29T00:00:00',
    updated_at: '2026-01-29T00:00:00'
  }];

  writeCodeDefinitions(codes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('CODE_DEFINITION');
  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(11, sheet.getLastColumn(), 'Should have 11 columns');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 data row');

  var data = sheet.getRange(2, 1, 1, 11).getValues()[0];
  assertEquals('PAPER', data[0], 'Code prefix should match');
  assertEquals('ART', data[1], 'Code value should match');

  teardownMasterWriterTests();
}

/**
 * Test writeCodeDefinitions with hierarchical codes
 */
function testWriteCodeDefinitions_HierarchicalCodes() {
  setupMasterWriterTests();

  var codes = [
    {
      code_prefix: 'PAPER',
      code_value: 'ART',
      name_ko: '아트지',
      name_en: 'Art Paper',
      category: 'PAPER_TYPE',
      parent_code: 'PAPER',
      sort_order: 1,
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    },
    {
      code_prefix: 'SIZE',
      code_value: 'A4',
      name_ko: 'A4',
      name_en: 'A4',
      category: 'SIZE_STANDARD',
      parent_code: 'SIZE',
      sort_order: 1,
      status: 'A',
      created_at: '2026-01-29T00:00:00',
      updated_at: '2026-01-29T00:00:00'
    }
  ];

  writeCodeDefinitions(codes, TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('CODE_DEFINITION');
  assertEquals(3, sheet.getLastRow(), 'Should have header + 2 data rows');

  teardownMasterWriterTests();
}

// ============================================
// WRITE MASTER TABLE TESTS
// ============================================

/**
 * Test writeMasterTable formatting
 */
function testWriteMasterTable_HeaderFormatting() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['col1', 'col2', 'col3'];
  var records = [{ col1: 'val1', col2: 'val2', col3: 'val3' }];

  writeMasterTable(sheet, records, headers);

  // Check header formatting
  var headerRange = sheet.getRange(1, 1, 1, 3);
  var fontWeights = headerRange.getFontWeights();
  var backgrounds = headerRange.getBackgrounds();

  assertEquals('bold', fontWeights[0][0], 'Header should be bold');
  assertNotNull(backgrounds[0][0], 'Header should have background color');

  teardownMasterWriterTests();
}

/**
 * Test writeMasterTable auto resize columns
 */
function testWriteMasterTable_AutoResizeColumns() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['column_with_very_long_name', 'col2'];
  var records = [{ column_with_very_long_name: 'value', col2: 'val2' }];

  writeMasterTable(sheet, records, headers);

  // Column widths should be adjusted (not zero)
  var colWidths = sheet.getColumnWidth(1);
  assertGreaterThan(0, colWidth, 'Column should have width > 0');

  teardownMasterWriterTests();
}

/**
 * Test writeMasterTable frozen rows
 */
function testWriteMasterTable_FrozenRows() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['col1', 'col2'];
  var records = [{ col1: 'val1', col2: 'val2' }];

  writeMasterTable(sheet, records, headers);

  // Check frozen rows
  var frozenRows = sheet.getFrozenRows();
  assertEquals(1, frozenRows, 'Should have 1 frozen row');

  teardownMasterWriterTests();
}

// ============================================
// GET OR CREATE SHEET TESTS
// ============================================

/**
 * Test getOrCreateSheet creates new sheet
 */
function testGetOrCreateSheet_NewSheet() {
  setupMasterWriterTests();

  var newSheetName = 'NEW_TEST_SHEET_' + Date.now();
  var sheet = getOrCreateSheet(TEST_SPREADSHEET, newSheetName);

  assertNotNull(sheet, 'Sheet should be created');
  assertEquals(newSheetName, sheet.getName(), 'Sheet name should match');

  // Cleanup
  TEST_SPREADSHEET.deleteSheet(sheet);
  teardownMasterWriterTests();
}

/**
 * Test getOrCreateSheet returns existing sheet
 */
function testGetOrCreateSheet_ExistingSheet() {
  setupMasterWriterTests();

  var sheetName = 'EXISTING_TEST_SHEET';
  var originalSheet = TEST_SPREADSHEET.insertSheet(sheetName);

  var sheet = getOrCreateSheet(TEST_SPREADSHEET, sheetName);

  assertEquals(originalSheet.getSheetId(), sheet.getSheetId(), 'Should return existing sheet');

  // Cleanup
  TEST_SPREADSHEET.deleteSheet(sheet);
  teardownMasterWriterTests();
}

// ============================================
// WRITE MIGRATION LOG TESTS
// ============================================

/**
 * Test writeMigrationLog creates log sheet
 */
function testWriteMigrationLog_CreateLogSheet() {
  setupMasterWriterTests();

  // Delete existing log sheet if any
  var existingLog = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  if (existingLog) {
    TEST_SPREADSHEET.deleteSheet(existingLog);
  }

  var logData = {
    operation: 'TEST',
    table: 'PAPER_MASTER',
    recordsAffected: 10,
    status: 'SUCCESS',
    message: 'Test log entry',
    details: { test: 'data' }
  };

  writeMigrationLog(TEST_SPREADSHEET, logData);

  var sheet = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  assertNotNull(sheet, 'Log sheet should be created');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 log entry');

  teardownMasterWriterTests();
}

/**
 * Test writeMigrationLog appends to existing log
 */
function testWriteMigrationLog_AppendToLog() {
  setupMasterWriterTests();

  var logData = {
    operation: 'TEST1',
    table: 'PAPER_MASTER',
    recordsAffected: 10,
    status: 'SUCCESS',
    message: 'First log entry'
  };

  writeMigrationLog(TEST_SPREADSHEET, logData);

  var logData2 = {
    operation: 'TEST2',
    table: 'SIZE_MASTER',
    recordsAffected: 5,
    status: 'SUCCESS',
    message: 'Second log entry'
  };

  writeMigrationLog(TEST_SPREADSHEET, logData2);

  var sheet = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  assertEquals(3, sheet.getLastRow(), 'Should have header + 2 log entries');

  teardownMasterWriterTests();
}

// ============================================
// APPEND RECORDS TESTS
// ============================================

/**
 * Test appendRecords adds records to existing data
 */
function testAppendRecords_AddToExisting() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['col1', 'col2', 'col3'];

  // Write initial data
  sheet.getRange(1, 1, 1, 3).setValues([headers]);
  sheet.getRange(2, 1, 1, 3).setValues([['val1', 'val2', 'val3']]);

  // Append records
  var records = [
    { col1: 'val4', col2: 'val5', col3: 'val6' },
    { col1: 'val7', col2: 'val8', col3: 'val9' }
  ];

  appendRecords(sheet, records);

  assertEquals(4, sheet.getLastRow(), 'Should have header + 3 data rows');

  teardownMasterWriterTests();
}

/**
 * Test appendRecords with empty array
 */
function testAppendRecords_EmptyArray() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['col1', 'col2'];

  sheet.getRange(1, 1, 1, 2).setValues([headers]);
  sheet.getRange(2, 1, 1, 2).setValues([['val1', 'val2']]);

  var initialRow = sheet.getLastRow();

  appendRecords(sheet, []);

  assertEquals(initialRow, sheet.getLastRow(), 'Row count should not change');

  teardownMasterWriterTests();
}

// ============================================
// UPDATE RECORDS TESTS
// ============================================

/**
 * Test updateRecords updates existing records
 */
function testUpdateRecords_UpdateExisting() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['code', 'name', 'value'];

  sheet.getRange(1, 1, 1, 3).setValues([headers]);
  sheet.getRange(2, 1, 2, 3).setValues([
    ['CODE1', 'Name1', 100],
    ['CODE2', 'Name2', 200]
  ]);

  var updates = [
    { code: 'CODE1', value: 150 }
  ];

  var updateCount = updateRecords(sheet, 'code', updates);

  assertEquals(1, updateCount, 'Should update 1 record');

  var updatedData = sheet.getRange(2, 1, 1, 3).getValues()[0];
  assertEquals(150, updatedData[2], 'Value should be updated');

  teardownMasterWriterTests();
}

/**
 * Test updateRecords with multiple updates
 */
function testUpdateRecords_MultipleUpdates() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['code', 'name', 'value'];

  sheet.getRange(1, 1, 1, 3).setValues([headers]);
  sheet.getRange(2, 1, 3, 3).setValues([
    ['CODE1', 'Name1', 100],
    ['CODE2', 'Name2', 200],
    ['CODE3', 'Name3', 300]
  ]);

  var updates = [
    { code: 'CODE1', value: 150 },
    { code: 'CODE3', value: 350 }
  ];

  var updateCount = updateRecords(sheet, 'code', updates);

  assertEquals(2, updateCount, 'Should update 2 records');

  teardownMasterWriterTests();
}

/**
 * Test updateRecords with invalid key field
 */
function testUpdateRecords_InvalidKeyField() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['code', 'name'];

  sheet.getRange(1, 1, 1, 2).setValues([headers]);
  sheet.getRange(2, 1, 1, 2).setValues([['CODE1', 'Name1']]);

  var updates = [{ code: 'CODE1', name: 'Updated' }];

  try {
    updateRecords(sheet, 'invalid_field', updates);
    fail('Should throw error for invalid key field');
  } catch (e) {
    assertTrue(e.toString().indexOf('Key field not found') !== -1, 'Should throw key field error');
  }

  teardownMasterWriterTests();
}

/**
 * Test updateRecords with empty sheet
 */
function testUpdateRecords_EmptySheet() {
  setupMasterWriterTests();

  var sheet = TEST_SPREADSHEET.insertSheet(TEST_SHEET_NAME);
  var headers = ['code', 'name'];

  sheet.getRange(1, 1, 1, 2).setValues([headers]);

  var updates = [{ code: 'CODE1', name: 'Name1' }];

  var updateCount = updateRecords(sheet, 'code', updates);

  assertEquals(0, updateCount, 'Should update 0 records in empty sheet');

  teardownMasterWriterTests();
}

// ============================================
// CLEAR ALL MASTER TABLES TESTS
// ============================================

/**
 * Test clearAllMasterTables clears data
 */
function testClearAllMasterTables_ClearsData() {
  setupMasterWriterTests();

  // Create test data in master tables
  var papers = [{
    paper_code: 'TEST',
    paper_name_ko: 'Test',
    status: 'A'
  }];

  writePapers(papers, TEST_SPREADSHEET);

  var sizes = [{
    size_code: 'A4',
    size_name: 'A4',
    width_mm: 210,
    height_mm: 297,
    standard: 'ISO',
    status: 'A'
  }];

  writeSizes(sizes, TEST_SPREADSHEET);

  // Clear all
  clearAllMasterTables(TEST_SPREADSHEET);

  var paperSheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  var sizeSheet = TEST_SPREADSHEET.getSheetByName('SIZE_MASTER');

  assertEquals(0, paperSheet.getLastRow(), 'Paper sheet should be cleared');
  assertEquals(0, sizeSheet.getLastRow(), 'Size sheet should be cleared');

  teardownMasterWriterTests();
}

// ============================================
// CREATE NAMED RANGES TESTS
// ============================================

/**
 * Test createNamedRanges creates named ranges
 */
function testCreateNamedRanges_CreatesRanges() {
  setupMasterWriterTests();

  // Create test data
  var papers = [{
    paper_code: 'TEST1',
    paper_name_ko: 'Test 1',
    status: 'A'
  }, {
    paper_code: 'TEST2',
    paper_name_ko: 'Test 2',
    status: 'A'
  }];

  writePapers(papers, TEST_SPREADSHEET);

  createNamedRanges(TEST_SPREADSHEET);

  var namedRange = TEST_SPREADSHEET.getNamedRangeByName('PAPER_MASTER_DATA');
  assertNotNull(namedRange, 'Named range should be created');

  teardownMasterWriterTests();
}

/**
 * Test createNamedRanges updates existing ranges
 */
function testCreateNamedRanges_UpdatesExisting() {
  setupMasterWriterTests();

  // Create initial data
  var papers = [{
    paper_code: 'TEST1',
    paper_name_ko: 'Test 1',
    status: 'A'
  }];

  writePapers(papers, TEST_SPREADSHEET);
  createNamedRanges(TEST_SPREADSHEET);

  // Add more data
  var morePapers = [{
    paper_code: 'TEST2',
    paper_name_ko: 'Test 2',
    status: 'A'
  }];

  writePapers(morePapers, TEST_SPREADSHEET);
  createNamedRanges(TEST_SPREADSHEET);

  var namedRange = TEST_SPREADSHEET.getNamedRangeByName('PAPER_MASTER_DATA');
  assertNotNull(namedRange, 'Named range should exist');

  teardownMasterWriterTests();
}

// ============================================
// SETUP DATA VALIDATION TESTS
// ============================================

/**
 * Test setupDataValidation creates validation
 */
function testSetupDataValidation_CreatesValidation() {
  setupMasterWriterTests();

  // Create test data
  var papers = [
    { paper_code: 'TEST1', status: 'A' },
    { paper_code: 'TEST2', status: 'A' },
    { paper_code: 'TEST3', status: 'A' }
  ];

  writePapers(papers, TEST_SPREADSHEET);

  setupDataValidation(TEST_SPREADSHEET);

  var sheet = TEST_SPREADSHEET.getSheetByName('PAPER_MASTER');
  assertNotNull(sheet, 'Sheet should exist');

  // Status column (L) validation should be applied
  var statusRange = sheet.getRange(3, 12, 1, 1);
  var validation = statusRange.getDataValidation();

  assertNotNull(validation, 'Data validation should be applied');

  teardownMasterWriterTests();
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
 * Assert should fail
 */
function fail(message) {
  throw new Error(message || 'Test should have failed but did not');
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
