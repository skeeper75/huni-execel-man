/**
 * Master Writer
 *
 * Writes transformed data to Google Sheets master tables
 */

/**
 * Write papers to PAPER_MASTER sheet
 * @param {Array} papers - Array of paper records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writePapers(papers, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.PAPER);
  var headers = [
    'paper_code', 'paper_name_ko', 'paper_name_en', 'paper_type', 'gsm',
    'thickness_um', 'finish', 'color', 'opacity', 'printability',
    'status', 'mes_code', 'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, papers, headers);
}

/**
 * Write sizes to SIZE_MASTER sheet
 * @param {Array} sizes - Array of size records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writeSizes(sizes, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.SIZE);
  var headers = [
    'size_code', 'size_name', 'width_mm', 'height_mm', 'standard',
    'orientation', 'bleed_mm', 'safe_margin_mm',
    'status', 'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, sizes, headers);
}

/**
 * Write finishes to FINISH_MASTER sheet
 * @param {Array} finishes - Array of finish records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writeFinishes(finishes, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.FINISH);
  var headers = [
    'finish_code', 'finish_name_ko', 'finish_name_en', 'category', 'sub_type',
    'unit', 'base_price', 'min_quantity', 'applicable_papers',
    'status', 'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, finishes, headers);
}

/**
 * Write bindings to BINDING_MASTER sheet
 * @param {Array} bindings - Array of binding records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writeBindings(bindings, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.BINDING);
  var headers = [
    'binding_code', 'binding_name_ko', 'binding_name_en', 'binding_type',
    'min_pages', 'max_pages', 'page_unit', 'cover_required',
    'spine_calculation', 'applicable_sizes',
    'status', 'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, bindings, headers);
}

/**
 * Write products to PRODUCT_MASTER sheet
 * @param {Array} products - Array of product records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writeProducts(products, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.PRODUCT);
  var headers = [
    'product_code', 'product_name_ko', 'product_name_en',
    'category', 'sub_category',
    'default_paper_code', 'default_size_code',
    'available_papers', 'available_sizes', 'available_finishes',
    'min_quantity', 'quantity_unit', 'lead_time_days',
    'description', 'status', 'mes_code',
    'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, products, headers);
}

/**
 * Write code definitions to CODE_DEFINITION sheet
 * @param {Array} codes - Array of code definition records
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function writeCodeDefinitions(codes, spreadsheet) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.CODE_DEFINITION);
  var headers = [
    'code_prefix', 'code_value', 'name_ko', 'name_en',
    'category', 'parent_code', 'sort_order',
    'description', 'status', 'created_at', 'updated_at'
  ];

  writeMasterTable(sheet, codes, headers);
}

/**
 * Write master table to sheet
 * @param {Sheet} sheet - Target sheet
 * @param {Array} records - Array of records to write
 * @param {Array} headers - Array of column headers
 */
function writeMasterTable(sheet, records, headers) {
  // Clear existing data
  sheet.clear();

  // Write headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format headers
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#FFC4BD97');  // Beige for system fields
  headerRange.setFontColor('#000000');

  // Write data
  if (records && records.length > 0) {
    var data = records.map(function(record) {
      return headers.map(function(header) {
        return record[header] || '';
      });
    });

    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

    // Auto-fit columns
    sheet.autoResizeColumns(1, headers.length);

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  logInfo('Wrote ' + records.length + ' records to ' + sheet.getName());
}

/**
 * Get or create sheet by name
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 * @param {string} sheetName - Sheet name
 * @return {Sheet} Sheet object
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    logInfo('Created new sheet: ' + sheetName);
  }

  return sheet;
}

/**
 * Write migration log
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} logData - Log data to write
 */
function writeMigrationLog(spreadsheet, logData) {
  var sheet = getOrCreateSheet(spreadsheet, MASTER_TABLES.MIGRATION_LOG);

  // Get existing data
  var lastRow = sheet.getLastRow();
  var startRow = lastRow + 1;

  if (startRow === 1) {
    // Write headers if sheet is empty
    var headers = [
      'timestamp', 'operation', 'table', 'records_affected',
      'status', 'message', 'details'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    startRow = 2;
  }

  // Write log entry
  var logEntry = [
    getTimestamp(),
    logData.operation || 'UNKNOWN',
    logData.table || '',
    logData.recordsAffected || 0,
    logData.status || 'UNKNOWN',
    logData.message || '',
    JSON.stringify(logData.details || {})
  ];

  sheet.getRange(startRow, 1, 1, logEntry.length).setValues([logEntry]);

  // Auto-fit columns
  sheet.autoResizeColumns(1, 7);
}

/**
 * Append records to existing table
 * @param {Sheet} sheet - Target sheet
 * @param {Array} records - Records to append
 */
function appendRecords(sheet, records) {
  if (!records || records.length === 0) {
    return;
  }

  var lastRow = sheet.getLastRow();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var data = records.map(function(record) {
    return headers.map(function(header) {
      return record[header] || '';
    });
  });

  var startRow = lastRow > 0 ? lastRow + 1 : 2;
  sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);

  logInfo('Appended ' + records.length + ' records to ' + sheet.getName());
}

/**
 * Update existing records
 * @param {Sheet} sheet - Target sheet
 * @param {string} keyField - Key field name
 * @param {Array} updates - Array of update objects
 */
function updateRecords(sheet, keyField, updates) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return;  // No data
  }

  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Find key column index
  var keyColIndex = headers.indexOf(keyField);
  if (keyColIndex === -1) {
    throw new Error('Key field not found: ' + keyField);
  }

  var updateCount = 0;

  // Build lookup map for updates
  var updateMap = {};
  for (var i = 0; i < updates.length; i++) {
    updateMap[updates[i][keyField]] = updates[i];
  }

  // Apply updates
  for (var row = 0; row < data.length; row++) {
    var keyValue = data[row][keyColIndex];
    if (updateMap[keyValue]) {
      var update = updateMap[keyValue];

      for (var col = 0; col < headers.length; col++) {
        var field = headers[col];
        if (update[field] !== undefined) {
          data[row][col] = update[field];
        }
      }

      updateCount++;
    }
  }

  // Write updated data
  if (updateCount > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
    logInfo('Updated ' + updateCount + ' records in ' + sheet.getName());
  }

  return updateCount;
}

/**
 * Clear all master tables
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function clearAllMasterTables(spreadsheet) {
  var tableNames = [
    MASTER_TABLES.PAPER,
    MASTER_TABLES.SIZE,
    MASTER_TABLES.FINISH,
    MASTER_TABLES.BINDING,
    MASTER_TABLES.PRODUCT,
    MASTER_TABLES.CODE_DEFINITION
  ];

  for (var i = 0; i < tableNames.length; i++) {
    var sheet = spreadsheet.getSheetByName(tableNames[i]);
    if (sheet) {
      sheet.clear();
      logInfo('Cleared sheet: ' + tableNames[i]);
    }
  }
}

/**
 * Create named ranges for master tables
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function createNamedRanges(spreadsheet) {
  var tableNames = [
    MASTER_TABLES.PAPER,
    MASTER_TABLES.SIZE,
    MASTER_TABLES.FINISH,
    MASTER_TABLES.BINDING,
    MASTER_TABLES.PRODUCT,
    MASTER_TABLES.CODE_DEFINITION
  ];

  for (var i = 0; i < tableNames.length; i++) {
    var sheet = spreadsheet.getSheetByName(tableNames[i]);
    if (sheet) {
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();

      if (lastRow > 1) {
        var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
        var rangeName = tableNames[i] + '_DATA';

        try {
          spreadsheet.setNamedRange(rangeName, range);
          logInfo('Created named range: ' + rangeName);
        } catch (e) {
          // Named range might already exist
          var existing = spreadsheet.getNamedRangeByName(rangeName);
          if (existing) {
            existing.setRange(range);
            logInfo('Updated named range: ' + rangeName);
          }
        }
      }
    }
  }
}

/**
 * Setup data validation for master tables
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 */
function setupDataValidation(spreadsheet) {
  // Status column validation
  var statusValidation = SpreadsheetApp.newDataValidation()
    .setAllowValid(true)
    .requireValueInList(['A', 'I'], true)
    .build();

  // Apply to all master tables
  var tables = [
    { name: MASTER_TABLES.PAPER, statusCol: 'L' },
    { name: MASTER_TABLES.SIZE, statusCol: 'I' },
    { name: MASTER_TABLES.FINISH, statusCol: 'J' },
    { name: MASTER_TABLES.BINDING, statusCol: 'L' },
    { name: MASTER_TABLES.PRODUCT, statusCol: 'R' }
  ];

  for (var i = 0; i < tables.length; i++) {
    var sheet = spreadsheet.getSheetByName(tables[i].name);
    if (sheet) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 2) {
        var range = sheet.getRange(3, tables[i].statusCol.charCodeAt(0) - 64, lastRow - 2, 1);
        range.setDataValidation(statusValidation);
      }
    }
  }

  logInfo('Setup data validation for master tables');
}
