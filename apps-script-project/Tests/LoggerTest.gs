/**
 * Logger Test Suite
 *
 * Comprehensive tests for Utils/Logger.gs
 * Target Coverage: 85%+
 */

// ============================================
// TEST CONFIGURATION
// ============================================

var TEST_SPREADSHEET = null;
var ORIGINAL_LOG_LEVEL = null;

// ============================================
// SETUP AND TEARDOWN
// ============================================

/**
 * Setup test environment
 */
function setupLoggerTests() {
  TEST_SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  ORIGINAL_LOG_LEVEL = getLogLevel();
  clearLogBuffer();

  // Set log level to DEBUG for testing
  setLogLevel('DEBUG');
}

/**
 * Cleanup test environment
 */
function teardownLoggerTests() {
  clearLogBuffer();
  if (ORIGINAL_LOG_LEVEL !== null) {
    setLogLevel(ORIGINAL_LOG_LEVEL);
  }
}

// ============================================
// LOG LEVEL TESTS
// ============================================

/**
 * Test logDebug adds to buffer
 */
function testLogDebug_AddsToBuffer() {
  setupLoggerTests();

  var beforeCount = getLogBuffer().length;
  logDebug('Test debug message');
  var afterCount = getLogBuffer().length;

  assertEquals(beforeCount + 1, afterCount, 'Buffer should increase by 1');

  teardownLoggerTests();
}

/**
 * Test logDebug respects log level
 */
function testLogDebug_RespectsLogLevel() {
  setupLoggerTests();

  setLogLevel('INFO');
  clearLogBuffer();

  logDebug('This should not be logged');

  assertEquals(0, getLogBuffer().length, 'Debug message should not be logged when level is INFO');

  teardownLoggerTests();
}

/**
 * Test logInfo adds to buffer
 */
function testLogInfo_AddsToBuffer() {
  setupLoggerTests();

  var beforeCount = getLogBuffer().length;
  logInfo('Test info message');
  var afterCount = getLogBuffer().length;

  assertEquals(beforeCount + 1, afterCount, 'Buffer should increase by 1');

  teardownLoggerTests();
}

/**
 * Test logInfo respects log level
 */
function testLogInfo_RespectsLogLevel() {
  setupLoggerTests();

  setLogLevel('WARNING');
  clearLogBuffer();

  logInfo('This should not be logged');

  assertEquals(0, getLogBuffer().length, 'Info message should not be logged when level is WARNING');

  teardownLoggerTests();
}

/**
 * Test logWarning adds to buffer
 */
function testLogWarning_AddsToBuffer() {
  setupLoggerTests();

  var beforeCount = getLogBuffer().length;
  logWarning('Test warning message');
  var afterCount = getLogBuffer().length;

  assertEquals(beforeCount + 1, afterCount, 'Buffer should increase by 1');

  teardownLoggerTests();
}

/**
 * Test logWarning with details
 */
function testLogWarning_WithDetails() {
  setupLoggerTests();

  logWarning('Test warning', ['detail1', 'detail2']);

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertEquals('WARNING', lastEntry.level, 'Level should be WARNING');
  assertEquals('Test warning', lastEntry.message, 'Message should match');
  assertNotNull(lastEntry.details, 'Details should not be null');

  teardownLoggerTests();
}

/**
 * Test logWarning respects log level
 */
function testLogWarning_RespectsLogLevel() {
  setupLoggerTests();

  setLogLevel('ERROR');
  clearLogBuffer();

  logWarning('This should not be logged');

  assertEquals(0, getLogBuffer().length, 'Warning message should not be logged when level is ERROR');

  teardownLoggerTests();
}

/**
 * Test logError adds to buffer
 */
function testLogError_AddsToBuffer() {
  setupLoggerTests();

  var beforeCount = getLogBuffer().length;
  logError('Test error message');
  var afterCount = getLogBuffer().length;

  assertEquals(beforeCount + 1, afterCount, 'Buffer should increase by 1');

  teardownLoggerTests();
}

/**
 * Test logError with details
 */
function testLogError_WithDetails() {
  setupLoggerTests();

  var details = { error: 'test details', code: 500 };
  logError('Test error', details);

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertEquals('ERROR', lastEntry.level, 'Level should be ERROR');
  assertEquals('Test error', lastEntry.message, 'Message should match');
  assertNotNull(lastEntry.details, 'Details should not be null');

  teardownLoggerTests();
}

/**
 * Test logError always logged
 */
function testLogError_AlwaysLogged() {
  setupLoggerTests();

  setLogLevel('ERROR');
  clearLogBuffer();

  logError('This should be logged');

  assertEquals(1, getLogBuffer().length, 'Error message should always be logged');

  teardownLoggerTests();
}

// ============================================
// LOG BUFFER TESTS
// ============================================

/**
 * Test logBuffer respects max size
 */
function testLogBuffer_RespectsMaxSize() {
  setupLoggerTests();

  clearLogBuffer();

  // Add more than MAX_BUFFER_SIZE entries
  for (var i = 0; i < 1500; i++) {
    logInfo('Log entry ' + i);
  }

  var bufferSize = getLogBuffer().length;
  assertEquals(1000, bufferSize, 'Buffer should be limited to MAX_BUFFER_SIZE (1000)');

  teardownLoggerTests();
}

/**
 * Test logBuffer removes oldest entries
 */
function testLogBuffer_RemovesOldestEntries() {
  setupLoggerTests();

  clearLogBuffer();

  // Add exactly MAX_BUFFER_SIZE + 10 entries
  for (var i = 0; i < 1010; i++) {
    logInfo('Log entry ' + i);
  }

  var buffer = getLogBuffer();

  // First entry should be removed
  assertEquals('Log entry 10', buffer[0].message, 'Oldest entries should be removed');
  assertEquals('Log entry 1009', buffer[buffer.length - 1].message, 'Newest entry should be present');

  teardownLoggerTests();
}

/**
 * Test getLogBuffer returns copy
 */
function testGetLogBuffer_ReturnsCopy() {
  setupLoggerTests();

  logInfo('Test message');

  var buffer1 = getLogBuffer();
  var buffer2 = getLogBuffer();

  // Modify buffer1
  buffer1.push({ fake: 'entry' });

  assertEquals(buffer2.length + 1, buffer1.length, 'Buffers should be independent copies');

  teardownLoggerTests();
}

// ============================================
// CLEAR LOG BUFFER TESTS
// ============================================

/**
 * Test clearLogBuffer clears buffer
 */
function testClearLogBuffer_ClearsBuffer() {
  setupLoggerTests();

  logInfo('Message 1');
  logInfo('Message 2');
  logInfo('Message 3');

  assertGreaterThan(0, getLogBuffer().length, 'Buffer should have entries');

  clearLogBuffer();

  assertEquals(0, getLogBuffer().length, 'Buffer should be empty after clearing');

  teardownLoggerTests();
}

/**
 * Test clearLogBuffer can be called multiple times
 */
function testClearLogBuffer_MultipleCalls() {
  setupLoggerTests();

  logInfo('Test message');

  clearLogBuffer();
  clearLogBuffer();
  clearLogBuffer();

  assertEquals(0, getLogBuffer().length, 'Multiple clears should not cause errors');

  teardownLoggerTests();
}

// ============================================
// GET LOGS BY LEVEL TESTS
// ============================================

/**
 * Test getLogsByLevel filters correctly
 */
function testGetLogsByLevel_FiltersCorrectly() {
  setupLoggerTests();

  clearLogBuffer();

  logDebug('Debug message');
  logInfo('Info message');
  logWarning('Warning message');
  logError('Error message');

  var debugLogs = getLogsByLevel('DEBUG');
  var infoLogs = getLogsByLevel('INFO');
  var warningLogs = getLogsByLevel('WARNING');
  var errorLogs = getLogsByLevel('ERROR');

  assertEquals(1, debugLogs.length, 'Should have 1 debug log');
  assertEquals(1, infoLogs.length, 'Should have 1 info log');
  assertEquals(1, warningLogs.length, 'Should have 1 warning log');
  assertEquals(1, errorLogs.length, 'Should have 1 error log');

  teardownLoggerTests();
}

/**
 * Test getLogsByLevel with multiple entries
 */
function testGetLogsByLevel_MultipleEntries() {
  setupLoggerTests();

  clearLogBuffer();

  logError('Error 1');
  logError('Error 2');
  logInfo('Info 1');
  logError('Error 3');

  var errorLogs = getLogsByLevel('ERROR');

  assertEquals(3, errorLogs.length, 'Should have 3 error logs');

  teardownLoggerTests();
}

/**
 * Test getLogsByLevel returns empty for non-existent level
 */
function testGetLogsByLevel_NonExistentLevel() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Info message');

  var errorLogs = getLogsByLevel('ERROR');

  assertEquals(0, errorLogs.length, 'Should return empty array for non-existent level');

  teardownLoggerTests();
}

// ============================================
// GET ERROR LOGS TESTS
// ============================================

/**
 * Test getErrorLogs returns only errors
 */
function testGetErrorLogs_ReturnsOnlyErrors() {
  setupLoggerTests();

  clearLogBuffer();

  logDebug('Debug');
  logInfo('Info');
  logWarning('Warning');
  logError('Error 1');
  logInfo('Info 2');
  logError('Error 2');

  var errorLogs = getErrorLogs();

  assertEquals(2, errorLogs.length, 'Should return 2 error logs');

  for (var i = 0; i < errorLogs.length; i++) {
    assertEquals('ERROR', errorLogs[i].level, 'All entries should be ERROR level');
  }

  teardownLoggerTests();
}

/**
 * Test getErrorLogs returns empty when no errors
 */
function testGetErrorLogs_EmptyWhenNoErrors() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Info 1');
  logInfo('Info 2');

  var errorLogs = getErrorLogs();

  assertEquals(0, errorLogs.length, 'Should return empty array when no errors');

  teardownLoggerTests();
}

// ============================================
// GET WARNING LOGS TESTS
// ============================================

/**
 * Test getWarningLogs returns only warnings
 */
function testGetWarningLogs_ReturnsOnlyWarnings() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Info');
  logWarning('Warning 1');
  logError('Error');
  logWarning('Warning 2');
  logInfo('Info 2');

  var warningLogs = getWarningLogs();

  assertEquals(2, warningLogs.length, 'Should return 2 warning logs');

  for (var i = 0; i < warningLogs.length; i++) {
    assertEquals('WARNING', warningLogs[i].level, 'All entries should be WARNING level');
  }

  teardownLoggerTests();
}

/**
 * Test getWarningLogs returns empty when no warnings
 */
function testGetWarningLogs_EmptyWhenNoWarnings() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Info 1');
  logError('Error 1');

  var warningLogs = getWarningLogs();

  assertEquals(0, warningLogs.length, 'Should return empty array when no warnings');

  teardownLoggerTests();
}

// ============================================
// GET LOG SUMMARY TESTS
// ============================================

/**
 * Test getLogSummary counts correctly
 */
function testGetLogSummary_CountsCorrectly() {
  setupLoggerTests();

  clearLogBuffer();

  logDebug('Debug 1');
  logDebug('Debug 2');
  logInfo('Info 1');
  logWarning('Warning 1');
  logError('Error 1');

  var summary = getLogSummary();

  assertEquals(5, summary.total, 'Total should be 5');
  assertEquals(2, summary.debug, 'Debug count should be 2');
  assertEquals(1, summary.info, 'Info count should be 1');
  assertEquals(1, summary.warning, 'Warning count should be 1');
  assertEquals(1, summary.error, 'Error count should be 1');

  teardownLoggerTests();
}

/**
 * Test getLogSummary with empty buffer
 */
function testGetLogSummary_EmptyBuffer() {
  setupLoggerTests();

  clearLogBuffer();

  var summary = getLogSummary();

  assertEquals(0, summary.total, 'Total should be 0');
  assertEquals(0, summary.debug, 'Debug count should be 0');
  assertEquals(0, summary.info, 'Info count should be 0');
  assertEquals(0, summary.warning, 'Warning count should be 0');
  assertEquals(0, summary.error, 'Error count should be 0');

  teardownLoggerTests();
}

/**
 * Test getLogSummary with only one level
 */
function testGetLogSummary_OnlyOneLevel() {
  setupLoggerTests();

  clearLogBuffer();

  logError('Error 1');
  logError('Error 2');
  logError('Error 3');

  var summary = getLogSummary();

  assertEquals(3, summary.total, 'Total should be 3');
  assertEquals(0, summary.debug, 'Debug count should be 0');
  assertEquals(0, summary.info, 'Info count should be 0');
  assertEquals(0, summary.warning, 'Warning count should be 0');
  assertEquals(3, summary.error, 'Error count should be 3');

  teardownLoggerTests();
}

// ============================================
// EXPORT LOGS AS JSON TESTS
// ============================================

/**
 * Test exportLogsAsJSON returns valid JSON
 */
function testExportLogsAsJSON_ReturnsValidJSON() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Test message');

  var json = exportLogsAsJSON();

  assertNotNull(json, 'JSON should not be null');

  // Parse to verify valid JSON
  var parsed = JSON.parse(json);
  assertTrue(Array.isArray(parsed), 'Parsed JSON should be array');
  assertGreaterThan(0, parsed.length, 'Array should have entries');

  teardownLoggerTests();
}

/**
 * Test exportLogsAsJSON includes all fields
 */
function testExportLogsAsJSON_IncludesAllFields() {
  setupLoggerTests();

  clearLogBuffer();

  logWarning('Test warning', ['detail1', 'detail2']);

  var json = exportLogsAsJSON();
  var parsed = JSON.parse(json);
  var entry = parsed[0];

  assertNotNull(entry.timestamp, 'Entry should have timestamp');
  assertNotNull(entry.level, 'Entry should have level');
  assertNotNull(entry.message, 'Entry should have message');
  assertNotNull(entry.details, 'Entry should have details');

  teardownLoggerTests();
}

/**
 * Test exportLogsAsJSON handles empty buffer
 */
function testExportLogsAsJSON_EmptyBuffer() {
  setupLoggerTests();

  clearLogBuffer();

  var json = exportLogsAsJSON();
  var parsed = JSON.parse(json);

  assertEquals('[]', json, 'Empty buffer should return empty array');
  assertEquals(0, parsed.length, 'Parsed array should be empty');

  teardownLoggerTests();
}

// ============================================
// SET LOG LEVEL TESTS
// ============================================

/**
 * Test setLogLevel with string DEBUG
 */
function testSetLogLevel_StringDEBUG() {
  setupLoggerTests();

  setLogLevel('DEBUG');

  assertEquals(0, getLogLevel(), 'Log level should be 0 (DEBUG)');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with string INFO
 */
function testSetLogLevel_StringINFO() {
  setupLoggerTests();

  setLogLevel('INFO');

  assertEquals(1, getLogLevel(), 'Log level should be 1 (INFO)');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with string WARNING
 */
function testSetLogLevel_StringWARNING() {
  setupLoggerTests();

  setLogLevel('WARNING');

  assertEquals(2, getLogLevel(), 'Log level should be 2 (WARNING)');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with string ERROR
 */
function testSetLogLevel_StringERROR() {
  setupLoggerTests();

  setLogLevel('ERROR');

  assertEquals(3, getLogLevel(), 'Log level should be 3 (ERROR)');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with lowercase string
 */
function testSetLogLevel_LowercaseString() {
  setupLoggerTests();

  setLogLevel('debug');

  assertEquals(0, getLogLevel(), 'Lowercase "debug" should work');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with number
 */
function testSetLogLevel_Number() {
  setupLoggerTests();

  setLogLevel(2);

  assertEquals(2, getLogLevel(), 'Log level should be set to 2');

  teardownLoggerTests();
}

/**
 * Test setLogLevel with invalid string
 */
function testSetLogLevel_InvalidString() {
  setupLoggerTests();

  var originalLevel = getLogLevel();

  setLogLevel('INVALID_LEVEL');

  assertEquals(originalLevel, getLogLevel(), 'Invalid level should not change log level');

  teardownLoggerTests();
}

/**
 * Test setLogLevel affects logging
 */
function testSetLogLevel_AffectsLogging() {
  setupLoggerTests();

  setLogLevel('ERROR');
  clearLogBuffer();

  logDebug('Should not log');
  logInfo('Should not log');
  logWarning('Should not log');
  logError('Should log');

  assertEquals(1, getLogBuffer().length, 'Only error should be logged');

  teardownLoggerTests();
}

// ============================================
// GET LOG LEVEL TESTS
// ============================================

/**
 * Test getLogLevel returns correct level
 */
function testGetLogLevel_ReturnsCorrectLevel() {
  setupLoggerTests();

  setLogLevel('WARNING');
  var level = getLogLevel();

  assertEquals(2, level, 'Should return WARNING level (2)');

  teardownLoggerTests();
}

// ============================================
// FORMAT LOG ENTRY TESTS
// ============================================

/**
 * Test formatLogEntry formats basic entry
 */
function testFormatLogEntry_BasicEntry() {
  setupLoggerTests();

  var entry = {
    timestamp: '2026-01-29T12:00:00',
    level: 'INFO',
    message: 'Test message',
    details: null
  };

  var formatted = formatLogEntry(entry);

  assertTrue(formatted.indexOf('[2026-01-29T12:00:00]') !== -1, 'Should include timestamp');
  assertTrue(formatted.indexOf('[INFO]') !== -1, 'Should include level');
  assertTrue(formatted.indexOf('Test message') !== -1, 'Should include message');

  teardownLoggerTests();
}

/**
 * Test formatLogEntry with details
 */
function testFormatLogEntry_WithDetails() {
  setupLoggerTests();

  var entry = {
    timestamp: '2026-01-29T12:00:00',
    level: 'ERROR',
    message: 'Test error',
    details: { code: 500, error: 'Test' }
  };

  var formatted = formatLogEntry(entry);

  assertTrue(formatted.indexOf('Details:') !== -1, 'Should include details section');
  assertTrue(formatted.indexOf('"code":500') !== -1, 'Should include details JSON');

  teardownLoggerTests();
}

/**
 * Test formatLogEntry with array details
 */
function testFormatLogEntry_ArrayDetails() {
  setupLoggerTests();

  var entry = {
    timestamp: '2026-01-29T12:00:00',
    level: 'WARNING',
    message: 'Test warning',
    details: ['item1', 'item2']
  };

  var formatted = formatLogEntry(entry);

  assertTrue(formatted.indexOf('Details:') !== -1, 'Should include details section');
  assertTrue(formatted.indexOf('item1') !== -1, 'Should include details content');

  teardownLoggerTests();
}

// ============================================
// WRITE LOG TO SHEET TESTS
// ============================================

/**
 * Test writeLogToSheet creates log sheet
 */
function testWriteLogToSheet_CreatesLogSheet() {
  setupLoggerTests();

  // Delete existing log sheet if any
  var existingLog = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  if (existingLog) {
    TEST_SPREADSHEET.deleteSheet(existingLog);
  }

  var logEntry = {
    timestamp: '2026-01-29T12:00:00',
    level: 'INFO',
    message: 'Test log entry',
    details: null
  };

  writeLogToSheet(TEST_SPREADSHEET, logEntry);

  var sheet = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  assertNotNull(sheet, 'Log sheet should be created');
  assertEquals(2, sheet.getLastRow(), 'Should have header + 1 log entry');

  // Cleanup
  TEST_SPREADSHEET.deleteSheet(sheet);
  teardownLoggerTests();
}

/**
 * Test writeLogToSheet appends to existing sheet
 */
function testWriteLogToSheet_AppendsToExisting() {
  setupLoggerTests();

  var logEntry1 = {
    timestamp: '2026-01-29T12:00:00',
    level: 'INFO',
    message: 'First entry',
    details: null
  };

  var logEntry2 = {
    timestamp: '2026-01-29T12:01:00',
    level: 'ERROR',
    message: 'Second entry',
    details: { error: 'test' }
  };

  writeLogToSheet(TEST_SPREADSHEET, logEntry1);
  writeLogToSheet(TEST_SPREADSHEET, logEntry2);

  var sheet = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  assertEquals(3, sheet.getLastRow(), 'Should have header + 2 log entries');

  teardownLoggerTests();
}

/**
 * Test writeLogToSheet formats data correctly
 */
function testWriteLogToSheet_FormatsCorrectly() {
  setupLoggerTests();

  // Delete existing log sheet
  var existingLog = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  if (existingLog) {
    TEST_SPREADSHEET.deleteSheet(existingLog);
  }

  var logEntry = {
    timestamp: '2026-01-29T12:00:00',
    level: 'ERROR',
    message: 'Test error',
    details: { code: 500 }
  };

  writeLogToSheet(TEST_SPREADSHEET, logEntry);

  var sheet = TEST_SPREADSHEET.getSheetByName('MIGRATION_LOG');
  var data = sheet.getRange(2, 1, 1, 4).getValues()[0];

  assertEquals('2026-01-29T12:00:00', data[0], 'Timestamp should match');
  assertEquals('ERROR', data[1], 'Level should match');
  assertEquals('Test error', data[2], 'Message should match');
  assertTrue(data[3].indexOf('"code":500') !== -1, 'Details should be JSON string');

  teardownLoggerTests();
}

// ============================================
// WRITE LOGS TO FILE TESTS
// ============================================

/**
 * Test writeLogsToFile creates file
 */
function testWriteLogsToFile_CreatesFile() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Test log entry for file export');

  var filename = 'test_logs_' + Date.now() + '.json';

  writeLogsToFile(filename);

  // Verify file was created (in real scenario, would check Drive)
  // For now, just verify no errors were thrown

  // Cleanup would be handled manually in real test

  teardownLoggerTests();
}

/**
 * Test writeLogsToFile with multiple entries
 */
function testWriteLogsToFile_MultipleEntries() {
  setupLoggerTests();

  clearLogBuffer();

  logInfo('Entry 1');
  logError('Entry 2');
  logWarning('Entry 3');

  var filename = 'test_logs_multi_' + Date.now() + '.json';

  writeLogsToFile(filename);

  // Verify file was created

  teardownLoggerTests();
}

// ============================================
// INTEGRATION TESTS
// ============================================

/**
 * Test complete logging workflow
 */
function testLogger_CompleteWorkflow() {
  setupLoggerTests();

  clearLogBuffer();

  // Log various levels
  logDebug('Debug message');
  logInfo('Info message');
  logWarning('Warning message', ['detail1', 'detail2']);
  logError('Error message', { code: 500, error: 'Test error' });

  // Verify buffer
  var buffer = getLogBuffer();
  assertEquals(4, buffer.length, 'Should have 4 log entries');

  // Verify filtering
  var errors = getErrorLogs();
  assertEquals(1, errors.length, 'Should have 1 error');

  var warnings = getWarningLogs();
  assertEquals(1, warnings.length, 'Should have 1 warning');

  // Verify summary
  var summary = getLogSummary();
  assertEquals(4, summary.total, 'Summary total should be 4');
  assertEquals(1, summary.error, 'Summary error count should be 1');

  // Verify export
  var json = exportLogsAsJSON();
  var parsed = JSON.parse(json);
  assertEquals(4, parsed.length, 'Exported JSON should have 4 entries');

  teardownLoggerTests();
}

/**
 * Test log level filtering workflow
 */
function testLogger_LogLevelFiltering() {
  setupLoggerTests();

  clearLogBuffer();

  // Start with INFO level
  setLogLevel('INFO');

  logDebug('Debug - should not log');
  logInfo('Info - should log');
  logWarning('Warning - should log');
  logError('Error - should log');

  var buffer = getLogBuffer();
  assertEquals(3, buffer.length, 'Should have 3 entries (no debug)');

  // Change to ERROR level
  setLogLevel('ERROR');
  clearLogBuffer();

  logDebug('Debug - should not log');
  logInfo('Info - should not log');
  logWarning('Warning - should not log');
  logError('Error - should log');

  buffer = getLogBuffer();
  assertEquals(1, buffer.length, 'Should have 1 entry (only error)');

  teardownLoggerTests();
}

/**
 * Test buffer overflow workflow
 */
function testLogger_BufferOverflow() {
  setupLoggerTests();

  clearLogBuffer();

  // Add more than MAX_BUFFER_SIZE entries
  for (var i = 0; i < 1100; i++) {
    logInfo('Log entry ' + i);
  }

  var buffer = getLogBuffer();
  assertEquals(1000, buffer.length, 'Buffer should be at max size');

  // Verify oldest entries were removed
  assertEquals('Log entry 100', buffer[0].message, 'First entry should be index 100');
  assertEquals('Log entry 1099', buffer[buffer.length - 1].message, 'Last entry should be index 1099');

  teardownLoggerTests();
}

// ============================================
// EDGE CASE TESTS
// ============================================

/**
 * Test log with null message
 */
function testLog_NullMessage() {
  setupLoggerTests();

  logInfo(null);

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertEquals(null, lastEntry.message, 'Null message should be stored');

  teardownLoggerTests();
}

/**
 * Test log with empty message
 */
function testLog_EmptyMessage() {
  setupLoggerTests();

  logInfo('');

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertEquals('', lastEntry.message, 'Empty message should be stored');

  teardownLoggerTests();
}

/**
 * Test log with special characters
 */
function testLog_SpecialCharacters() {
  setupLoggerTests();

  logInfo('Message with special chars: \n\t\r\"\'\\');

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertNotNull(lastEntry.message, 'Message with special chars should be stored');

  teardownLoggerTests();
}

/**
 * Test log with very long message
 */
function testLog_VeryLongMessage() {
  setupLoggerTests();

  var longMessage = 'A';
  for (var i = 0; i < 10000; i++) {
    longMessage += 'B';
  }

  logInfo(longMessage);

  var buffer = getLogBuffer();
  var lastEntry = buffer[buffer.length - 1];

  assertEquals(10001, lastEntry.message.length, 'Long message should be stored');

  teardownLoggerTests();
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
