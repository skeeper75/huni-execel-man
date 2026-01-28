/**
 * Logging Utilities
 *
 * Provides logging functions for the migration tool
 */

// Log levels
var LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};

// Current log level (can be configured)
var CURRENT_LOG_LEVEL = LOG_LEVELS.INFO;

// In-memory log storage
var logBuffer = [];
var MAX_BUFFER_SIZE = 1000;

/**
 * Log debug message
 * @param {string} message - Message to log
 */
function logDebug(message) {
  log(LOG_LEVELS.DEBUG, 'DEBUG', message);
}

/**
 * Log info message
 * @param {string} message - Message to log
 */
function logInfo(message) {
  log(LOG_LEVELS.INFO, 'INFO', message);
}

/**
 * Log warning message
 * @param {string} message - Message to log
 * @param {Array} details - Optional details array
 */
function logWarning(message, details) {
  log(LOG_LEVELS.WARNING, 'WARNING', message, details);
}

/**
 * Log error message
 * @param {string} message - Message to log
 * @param {Array} details - Optional details array
 */
function logError(message, details) {
  log(LOG_LEVELS.ERROR, 'ERROR', message, details);
}

/**
 * Internal log function
 * @param {number} level - Log level
 * @param {string} levelName - Log level name
 * @param {string} message - Message to log
 * @param {Array} details - Optional details
 */
function log(level, levelName, message, details) {
  // Check if we should log this level
  if (level < CURRENT_LOG_LEVEL) {
    return;
  }

  var timestamp = getTimestamp();
  var logEntry = {
    timestamp: timestamp,
    level: levelName,
    message: message,
    details: details || null
  };

  // Add to buffer
  logBuffer.push(logEntry);

  // Trim buffer if needed
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Output to console
  var consoleMessage = '[' + timestamp + '] [' + levelName + '] ' + message;
  if (level === LOG_LEVELS.ERROR) {
    console.error(consoleMessage);
  } else if (level === LOG_LEVELS.WARNING) {
    console.warn(consoleMessage);
  } else {
    console.log(consoleMessage);
  }

  // Write to migration log sheet if available
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (spreadsheet) {
      writeLogToSheet(spreadsheet, logEntry);
    }
  } catch (e) {
    // Silently fail if we can't write to sheet
  }
}

/**
 * Write log entry to MIGRATION_LOG sheet
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} logEntry - Log entry to write
 */
function writeLogToSheet(spreadsheet, logEntry) {
  var sheet = spreadsheet.getSheetByName(MASTER_TABLES.MIGRATION_LOG);
  if (!sheet) {
    // Create log sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(MASTER_TABLES.MIGRATION_LOG);
    var headers = ['timestamp', 'level', 'message', 'details'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }

  var lastRow = sheet.getLastRow();
  var startRow = lastRow < 1 ? 2 : lastRow + 1;

  var logRow = [
    logEntry.timestamp,
    logEntry.level,
    logEntry.message,
    typeof logEntry.details === 'object' ?
      JSON.stringify(logEntry.details) :
      logEntry.details
  ];

  sheet.getRange(startRow, 1, 1, logRow.length).setValues([logRow]);
}

/**
 * Get log buffer
 * @return {Array} Array of log entries
 */
function getLogBuffer() {
  return logBuffer.slice();  // Return copy
}

/**
 * Clear log buffer
 */
function clearLogBuffer() {
  logBuffer = [];
}

/**
 * Get log entries by level
 * @param {string} level - Log level to filter by
 * @return {Array} Filtered log entries
 */
function getLogsByLevel(level) {
  return logBuffer.filter(function(entry) {
    return entry.level === level;
  });
}

/**
 * Get error logs
 * @return {Array} Error log entries
 */
function getErrorLogs() {
  return getLogsByLevel('ERROR');
}

/**
 * Get warning logs
 * @return {Array} Warning log entries
 */
function getWarningLogs() {
  return getLogsByLevel('WARNING');
}

/**
 * Get log summary
 * @return {Object} Log summary statistics
 */
function getLogSummary() {
  var summary = {
    total: logBuffer.length,
    debug: 0,
    info: 0,
    warning: 0,
    error: 0
  };

  for (var i = 0; i < logBuffer.length; i++) {
    var entry = logBuffer[i];
    switch (entry.level) {
      case 'DEBUG':
        summary.debug++;
        break;
      case 'INFO':
        summary.info++;
        break;
      case 'WARNING':
        summary.warning++;
        break;
      case 'ERROR':
        summary.error++;
        break;
    }
  }

  return summary;
}

/**
 * Export logs as JSON string
 * @return {string} JSON string of log buffer
 */
function exportLogsAsJSON() {
  return JSON.stringify(logBuffer, null, 2);
}

/**
 * Set log level
 * @param {number|string} level - Log level (number or name)
 */
function setLogLevel(level) {
  if (typeof level === 'string') {
    level = level.toUpperCase();
    switch (level) {
      case 'DEBUG':
        CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;
        break;
      case 'INFO':
        CURRENT_LOG_LEVEL = LOG_LEVELS.INFO;
        break;
      case 'WARNING':
        CURRENT_LOG_LEVEL = LOG_LEVELS.WARNING;
        break;
      case 'ERROR':
        CURRENT_LOG_LEVEL = LOG_LEVELS.ERROR;
        break;
      default:
        logWarning('Unknown log level: ' + level);
    }
  } else if (typeof level === 'number') {
    CURRENT_LOG_LEVEL = level;
  }
}

/**
 * Get current log level
 * @return {number} Current log level
 */
function getLogLevel() {
  return CURRENT_LOG_LEVEL;
}

/**
 * Format log entry as string
 * @param {Object} logEntry - Log entry to format
 * @return {string} Formatted log entry
 */
function formatLogEntry(logEntry) {
  var formatted = '[' + logEntry.timestamp + '] ' +
                  '[' + logEntry.level + '] ' +
                  logEntry.message;

  if (logEntry.details) {
    formatted += '\n  Details: ' + JSON.stringify(logEntry.details);
  }

  return formatted;
}

/**
 * Write logs to a file
 * @param {string} filename - Output filename
 */
function writeLogsToFile(filename) {
  var content = exportLogsAsJSON();
  var blob = Utilities.newBlob(content, 'application/json', filename);

  // Create folder if it doesn't exist
  var folders = DriveApp.getFoldersByName('Migration Logs');
  var folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder('Migration Logs');
  }

  folder.createFile(blob);
  logInfo('Logs exported to: ' + filename);
}
