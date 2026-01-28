/**
 * Data Validator
 *
 * Comprehensive data validation for master tables
 */

/**
 * Validate complete master dataset
 * @param {Object} masterTables - Object with all master tables
 * @return {Object} Validation result
 */
function validateMasterDataset(masterTables) {
  var results = {
    valid: true,
    tables: {},
    overallErrors: [],
    overallWarnings: []
  };

  // Validate each table
  var tableTypes = ['papers', 'sizes', 'finishes', 'bindings', 'products'];

  for (var i = 0; i < tableTypes.length; i++) {
    var tableType = tableTypes[i];
    var tableTypeUpper = tableType.toUpperCase().slice(0, -1);  // Remove 's'

    if (!masterTables[tableType]) {
      results.overallWarnings.push('Missing table: ' + tableType);
      continue;
    }

    results.tables[tableType] = validateMasterTableCodes(
      masterTables[tableType],
      tableTypeUpper
    );

    if (!results.tables[tableType].valid) {
      results.valid = false;
    }
  }

  // Validate reference integrity
  var refIntegrity = validateReferenceIntegrity(masterTables);
  results.referenceIntegrity = refIntegrity;

  if (!refIntegrity.valid) {
    results.valid = false;
  }

  // Validate required fields
  var requiredFields = {
    papers: ['paper_code', 'paper_name_ko', 'paper_type', 'gsm', 'status'],
    sizes: ['size_code', 'size_name', 'width_mm', 'height_mm', 'standard', 'status'],
    finishes: ['finish_code', 'finish_name_ko', 'category', 'status'],
    bindings: ['binding_code', 'binding_name_ko', 'binding_type', 'min_pages', 'max_pages', 'status'],
    products: ['product_code', 'product_name_ko', 'category', 'status']
  };

  for (var j = 0; j < tableTypes.length; j++) {
    var tableName = tableTypes[j];
    if (masterTables[tableName] && requiredFields[tableName]) {
      var requiredResult = validateRequiredFields(
        masterTables[tableName],
        requiredFields[tableName]
      );
      results.tables[tableName].requiredFields = requiredResult;

      if (!requiredResult.valid) {
        results.valid = false;
      }
    }
  }

  results.summary = generateValidationSummary(results);

  return results;
}

/**
 * Generate validation summary
 * @param {Object} results - Validation results
 * @return {string} Summary text
 */
function generateValidationSummary(results) {
  var lines = [];
  lines.push('=== VALIDATION SUMMARY ===');

  var tableCount = 0;
  var errorCount = 0;
  var warningCount = 0;

  for (var tableName in results.tables) {
    tableCount++;
    var tableResult = results.tables[tableName];

    if (!tableResult.valid) {
      errorCount++;

      lines.push('');
      lines.push('❌ ' + tableName.toUpperCase() + ': FAILED');

      if (tableResult.formatErrors && tableResult.formatErrors.length > 0) {
        lines.push('   Format Errors: ' + tableResult.formatErrors.length);
        for (var i = 0; i < Math.min(5, tableResult.formatErrors.length); i++) {
          var err = tableResult.formatErrors[i];
          lines.push('     - ' + err.error + ' (index ' + err.index + ')');
        }
      }

      if (tableResult.duplicates && tableResult.duplicates.length > 0) {
        lines.push('   Duplicates: ' + tableResult.duplicates.length);
        for (var j = 0; j < Math.min(3, tableResult.duplicates.length); j++) {
          var dup = tableResult.duplicates[j];
          lines.push('     - ' + dup.code + ' at indices ' + dup.indices.join(', '));
        }
      }

      if (tableResult.requiredFields && tableResult.requiredFields.missingFields) {
        lines.push('   Missing Required: ' + tableResult.requiredFields.missingFields.length);
      }
    } else {
      lines.push('✅ ' + tableName.toUpperCase() + ': PASSED');
    }
  }

  // Reference integrity
  if (results.referenceIntegrity) {
    lines.push('');
    if (results.referenceIntegrity.valid) {
      lines.push('✅ REFERENCE INTEGRITY: PASSED');
    } else {
      lines.push('❌ REFERENCE INTEGRITY: FAILED');
      lines.push('   Violations: ' + results.referenceIntegrity.violations.length);
      errorCount++;
    }
  }

  lines.push('');
  lines.push('Total Tables: ' + tableCount);
  lines.push('Errors: ' + errorCount);
  lines.push('Warnings: ' + warningCount);

  if (results.valid) {
    lines.push('');
    lines.push('✅ OVERALL: PASSED');
  } else {
    lines.push('');
    lines.push('❌ OVERALL: FAILED');
  }

  return lines.join('\n');
}

/**
 * Validate bilingual coverage
 * @param {Array} records - Array of records
 * @param {string} koField - Korean field name
 * @param {string} enField - English field name
 * @param {number} targetPercentage - Target percentage (0-100)
 * @return {Object} Validation result
 */
function validateBilingualCoverage(records, koField, enField, targetPercentage) {
  var totalCount = records.length;
  var bilingualCount = 0;

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var hasKorean = record[koField] && record[koField] !== '';
    var hasEnglish = record[enField] && record[enField] !== '';

    if (hasKorean && hasEnglish) {
      bilingualCount++;
    }
  }

  var coverage = totalCount > 0 ? (bilingualCount / totalCount) * 100 : 0;
  var targetMet = coverage >= targetPercentage;

  return {
    valid: targetMet,
    totalCount: totalCount,
    bilingualCount: bilingualCount,
    coverage: coverage.toFixed(2) + '%',
    target: targetPercentage + '%',
    targetMet: targetMet,
    message: targetMet ?
      'Bilingual coverage ' + coverage.toFixed(2) + '% meets target ' + targetPercentage + '%' :
      'Bilingual coverage ' + coverage.toFixed(2) + '% below target ' + targetPercentage + '%'
  };
}

/**
 * Validate MES code format
 * @param {string} mesCode - MES code to validate
 * @return {Object} Validation result
 */
function validateMESCode(mesCode) {
  if (!mesCode) {
    return {
      valid: false,
      error: 'MES code is empty'
    };
  }

  var pattern = /^\d{3}-\d{4}$/;
  if (!pattern.test(mesCode)) {
    return {
      valid: false,
      error: 'Invalid MES code format (expected XXX-XXXX)',
      code: mesCode
    };
  }

  var parts = mesCode.split('-');
  var category = parts[0];
  var sequence = parts[1];

  // Validate category is in valid range
  var categoryNum = parseInt(category, 10);
  if (categoryNum < 1 || categoryNum > 999) {
    return {
      valid: false,
      warning: 'MES category code out of normal range',
      category: category
    };
  }

  return {
    valid: true,
    category: category,
    sequence: sequence
  };
}

/**
 * Validate data migration completeness
 * @param {Object} sourceData - Source data counts
 * @param {Object} migratedData - Migrated data counts
 * @param {number} targetPercentage - Target completeness percentage
 * @return {Object} Validation result
 */
function validateMigrationCompleteness(sourceData, migratedData, targetPercentage) {
  var results = {
    valid: true,
    completeness: {},
    overallCompleteness: 0,
    targetMet: false
  };

  var totalSource = 0;
  var totalMigrated = 0;

  for (var key in sourceData) {
    var sourceCount = sourceData[key] || 0;
    var migratedCount = migratedData[key] || 0;

    totalSource += sourceCount;
    totalMigrated += migratedCount;

    var completeness = sourceCount > 0 ? (migratedCount / sourceCount) * 100 : 100;
    var targetMet = completeness >= targetPercentage;

    results.completeness[key] = {
      sourceCount: sourceCount,
      migratedCount: migratedCount,
      completeness: completeness.toFixed(2) + '%',
      targetMet: targetMet
    };

    if (!targetMet) {
      results.valid = false;
    }
  }

  results.overallCompleteness = totalSource > 0 ?
    (totalMigrated / totalSource) * 100 :
    100;
  results.targetMet = results.overallCompleteness >= targetPercentage;

  if (!results.targetMet) {
    results.valid = false;
  }

  return results;
}

/**
 * Detect data quality issues
 * @param {Array} records - Array of records
 * @param {string} tableType - Table type
 * @return {Array} Array of quality issues
 */
function detectQualityIssues(records, tableType) {
  var issues = [];

  for (var i = 0; i < records.length; i++) {
    var record = records[i];

    // Check for empty strings that should have values
    for (var field in record) {
      if (field.indexOf('name') !== -1 && record[field] === '') {
        issues.push({
          type: 'EMPTY_NAME',
          index: i,
          field: field,
          severity: 'warning'
        });
      }
    }

    // Check for suspicious values
    if (tableType === 'PAPER' && record.gsm) {
      if (record.gsm === 0) {
        issues.push({
          type: 'ZERO_GSM',
          index: i,
          field: 'gsm',
          severity: 'error'
        });
      }
    }

    if (tableType === 'SIZE') {
      if (record.width_mm === record.height_mm) {
        issues.push({
          type: 'SQUARE_SIZE',
          index: i,
          severity: 'warning'
        });
      }
    }
  }

  return issues;
}
