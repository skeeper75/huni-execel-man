/**
 * Code Validator
 *
 * Validates code formats and uniqueness
 */

/**
 * Validate paper code format
 * @param {string} code - Code to validate
 * @return {Object} Validation result
 */
function validatePaperCode(code) {
  return validateCodeFormat(code, CODE_PATTERNS.PAPER);
}

/**
 * Validate size code format
 * @param {string} code - Code to validate
 * @return {Object} Validation result
 */
function validateSizeCode(code) {
  return validateCodeFormat(code, CODE_PATTERNS.SIZE);
}

/**
 * Validate finish code format
 * @param {string} code - Code to validate
 * @return {Object} Validation result
 */
function validateFinishCode(code) {
  return validateCodeFormat(code, CODE_PATTERNS.FINISH);
}

/**
 * Validate binding code format
 * @param {string} code - Code to validate
 * @return {Object} Validation result
 */
function validateBindingCode(code) {
  return validateCodeFormat(code, CODE_PATTERNS.BINDING);
}

/**
 * Validate product code format
 * @param {string} code - Code to validate
 * @return {Object} Validation result
 */
function validateProductCode(code) {
  return validateCodeFormat(code, CODE_PATTERNS.PRODUCT);
}

/**
 * Validate code uniqueness in array
 * @param {Array} records - Array of records with code field
 * @param {string} codeField - Name of code field
 * @return {Object} Validation result with duplicates
 */
function validateCodeUniqueness(records, codeField) {
  var seen = {};
  var duplicates = [];

  for (var i = 0; i < records.length; i++) {
    var code = records[i][codeField];
    if (!code) {
      continue;
    }

    if (seen[code]) {
      duplicates.push({
        code: code,
        indices: [seen[code], i]
      });
    } else {
      seen[code] = i;
    }
  }

  return {
    valid: duplicates.length === 0,
    duplicates: duplicates,
    message: duplicates.length === 0 ?
      'All codes are unique' :
      'Found ' + duplicates.length + ' duplicate code(s)'
  };
}

/**
 * Validate all codes in a master table
 * @param {Array} records - Array of records
 * @param {string} tableType - Table type (PAPER, SIZE, etc.)
 * @return {Object} Validation result
 */
function validateMasterTableCodes(records, tableType) {
  var results = {
    formatValid: true,
    uniqueValid: true,
    formatErrors: [],
    duplicates: [],
    codeField: null
  };

  // Determine code field and pattern
  switch (tableType) {
    case 'PAPER':
      results.codeField = 'paper_code';
      break;
    case 'SIZE':
      results.codeField = 'size_code';
      break;
    case 'FINISH':
      results.codeField = 'finish_code';
      break;
    case 'BINDING':
      results.codeField = 'binding_code';
      break;
    case 'PRODUCT':
      results.codeField = 'product_code';
      break;
    default:
      return {
        valid: false,
        error: 'Unknown table type: ' + tableType
      };
  }

  // Validate format
  for (var i = 0; i < records.length; i++) {
    var code = records[i][results.codeField];
    if (!code) {
      results.formatErrors.push({
        index: i,
        error: 'Missing code'
      });
      results.formatValid = false;
      continue;
    }

    var pattern = CODE_PATTERNS[tableType];
    if (!validateCodeFormat(code, pattern)) {
      results.formatErrors.push({
        index: i,
        code: code,
        error: 'Invalid format'
      });
      results.formatValid = false;
    }
  }

  // Validate uniqueness
  var uniqueness = validateCodeUniqueness(records, results.codeField);
  results.uniqueValid = uniqueness.valid;
  results.duplicates = uniqueness.duplicates;

  results.valid = results.formatValid && results.uniqueValid;

  return results;
}

/**
 * Validate reference integrity
 * @param {Object} masterTables - Object with all master table arrays
 * @return {Object} Validation result
 */
function validateReferenceIntegrity(masterTables) {
  var violations = [];

  // Build lookup maps
  var paperCodes = buildCodeMap(masterTables.papers, 'paper_code');
  var sizeCodes = buildCodeMap(masterTables.sizes, 'size_code');
  var finishCodes = buildCodeMap(masterTables.finishes, 'finish_code');
  var bindingCodes = buildCodeMap(masterTables.bindings, 'binding_code');

  // Validate products
  if (masterTables.products) {
    for (var i = 0; i < masterTables.products.length; i++) {
      var product = masterTables.products[i];

      // Check default_paper_code
      if (product.default_paper_code) {
        if (!paperCodes[product.default_paper_code]) {
          violations.push({
            type: 'ORPHAN_PAPER_REF',
            table: 'PRODUCT_MASTER',
            product_code: product.product_code,
            reference: product.default_paper_code
          });
        }
      }

      // Check default_size_code
      if (product.default_size_code) {
        if (!sizeCodes[product.default_size_code]) {
          violations.push({
            type: 'ORPHAN_SIZE_REF',
            table: 'PRODUCT_MASTER',
            product_code: product.product_code,
            reference: product.default_size_code
          });
        }
      }

      // Check available_papers
      if (product.available_papers) {
        var papers = product.available_papers.split(',');
        for (var j = 0; j < papers.length; j++) {
          var paperCode = papers[j].trim();
          // Handle wildcards (e.g., PAPER_ART_*)
          if (paperCode.indexOf('*') !== -1) {
            var prefix = paperCode.replace('*', '');
            var hasMatch = false;
            for (var pk in paperCodes) {
              if (pk.indexOf(prefix) === 0) {
                hasMatch = true;
                break;
              }
            }
            if (!hasMatch) {
              violations.push({
                type: 'ORPHAN_PAPER_WILDCARD',
                table: 'PRODUCT_MASTER',
                product_code: product.product_code,
                reference: paperCode
              });
            }
          } else if (!paperCodes[paperCode]) {
            violations.push({
              type: 'ORPHAN_PAPER_REF',
              table: 'PRODUCT_MASTER',
              product_code: product.product_code,
              reference: paperCode
            });
          }
        }
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations: violations,
    message: violations.length === 0 ?
      'All references are valid' :
      'Found ' + violations.length + ' reference violation(s)'
  };
}

/**
 * Build code lookup map from records
 * @param {Array} records - Array of records
 * @param {string} codeField - Code field name
 * @return {Object} Map of codes to true
 */
function buildCodeMap(records, codeField) {
  var map = {};
  if (!records) {
    return map;
  }

  for (var i = 0; i < records.length; i++) {
    var code = records[i][codeField];
    if (code) {
      map[code] = true;
    }
  }

  return map;
}

/**
 * Validate GSM value
 * @param {number} gsm - GSM to validate
 * @return {Object} Validation result
 */
function validateGSMValue(gsm) {
  return validateGSM(gsm);
}

/**
 * Validate size dimensions
 * @param {number} width - Width in mm
 * @param {number} height - Height in mm
 * @param {string} standard - Standard (ISO, JIS, CUSTOM)
 * @return {Object} Validation result
 */
function validateSizeDimensions(width, height, standard) {
  var result = {
    valid: true,
    warnings: []
  };

  // Width must be less than height (portrait default)
  if (width >= height) {
    result.warnings.push('Width >= height, consider landscape orientation');
  }

  // Validate based on standard
  switch (standard) {
    case 'ISO':
      if (width < 26 || width > 841) {
        result.valid = false;
        result.warnings.push('ISO width out of range (26-841mm)');
      }
      if (height < 37 || height > 1189) {
        result.valid = false;
        result.warnings.push('ISO height out of range (37-1189mm)');
      }
      break;

    case 'JIS':
      if (width < 32 || width > 1030) {
        result.valid = false;
        result.warnings.push('JIS width out of range (32-1030mm)');
      }
      if (height < 45 || height > 1456) {
        result.valid = false;
        result.warnings.push('JIS height out of range (45-1456mm)');
      }
      break;

    case 'CUSTOM':
    case 'KS':
      // More lenient for custom/Korean sizes
      if (width < 10 || width > 2000) {
        result.valid = false;
        result.warnings.push('Width out of reasonable range (10-2000mm)');
      }
      if (height < 10 || height > 3000) {
        result.valid = false;
        result.warnings.push('Height out of reasonable range (10-3000mm)');
      }
      break;
  }

  return result;
}

/**
 * Validate required fields
 * @param {Array} records - Array of records
 * @param {Array} requiredFields - Array of required field names
 * @return {Object} Validation result
 */
function validateRequiredFields(records, requiredFields) {
  var missingFields = [];

  for (var i = 0; i < records.length; i++) {
    for (var j = 0; j < requiredFields.length; j++) {
      var field = requiredFields[j];
      var value = records[i][field];

      if (value === null || value === undefined || value === '') {
        missingFields.push({
          index: i,
          field: field,
          error: 'Missing required field: ' + field
        });
      }
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields: missingFields,
    message: missingFields.length === 0 ?
      'All required fields present' :
      'Found ' + missingFields.length + ' missing required field(s)'
  };
}
