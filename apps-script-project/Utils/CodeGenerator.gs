/**
 * Code Generator Utilities
 *
 * Generates normalized codes following the pattern:
 * [CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]
 */

/**
 * Generate paper code
 * @param {string} paperType - Normalized paper type (ART, SNOW, etc.)
 * @param {number} gsm - Grams per square meter
 * @return {string} Generated paper code
 */
function generatePaperCode(paperType, gsm) {
  return 'PAPER_' + paperType + '_' + gsm;
}

/**
 * Generate size code
 * @param {string} sizeName - Size name (A4, B5, etc.)
 * @param {string} variant - Variant identifier (ISO, JIS, STD, etc.)
 * @return {string} Generated size code
 */
function generateSizeCode(sizeName, variant) {
  return 'SIZE_' + sizeName + '_' + variant;
}

/**
 * Generate finish code
 * @param {string} category - Finish category (LAM, UV, FOIL, etc.)
 * @param {string} subType - Finish sub-type (GLOSS, MATTE, etc.)
 * @return {string} Generated finish code
 */
function generateFinishCode(category, subType) {
  return 'FINISH_' + category + '_' + subType;
}

/**
 * Generate binding code
 * @param {string} bindingType - Binding type (SADDLE, PERFECT, etc.)
 * @param {string} variant - Variant identifier (STD, etc.)
 * @return {string} Generated binding code
 */
function generateBindingCode(bindingType, variant) {
  return 'BIND_' + bindingType + '_' + variant;
}

/**
 * Generate product code
 * @param {string} category - Product category (DIG, STK, BOOK, etc.)
 * @param {number} sequence - Sequential number
 * @return {string} Generated product code
 */
function generateProductCode(category, sequence) {
  return 'PROD_' + category + '_' + padSequence(sequence, 3);
}

/**
 * Generate code definition code
 * @param {string} prefix - Code prefix
 * @param {string} value - Code value
 * @return {string} Generated code definition code
 */
function generateCodeDefinitionCode(prefix, value) {
  return prefix + '_' + value;
}

/**
 * Pad sequence number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} length - Desired length
 * @return {string} Padded number string
 */
function padSequence(num, length) {
  var str = num.toString();
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

/**
 * Validate code format
 * @param {string} code - Code to validate
 * @param {RegExp} pattern - Regex pattern to match
 * @return {boolean} True if valid
 */
function validateCodeFormat(code, pattern) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  return pattern.test(code);
}

/**
 * Parse paper code
 * @param {string} code - Paper code to parse
 * @return {Object|null} Parsed components or null if invalid
 */
function parsePaperCode(code) {
  var match = code.match(/^PAPER_([A-Z]+)_(\d+)$/);
  if (match) {
    return {
      type: match[1],
      gsm: parseInt(match[2], 10)
    };
  }
  return null;
}

/**
 * Parse size code
 * @param {string} code - Size code to parse
 * @return {Object|null} Parsed components or null if invalid
 */
function parseSizeCode(code) {
  var match = code.match(/^SIZE_([A-Z0-9]+)_([A-Z]+)$/);
  if (match) {
    return {
      name: match[1],
      variant: match[2]
    };
  }
  return null;
}

/**
 * Parse finish code
 * @param {string} code - Finish code to parse
 * @return {Object|null} Parsed components or null if invalid
 */
function parseFinishCode(code) {
  var match = code.match(/^FINISH_([A-Z]+)_([A-Z]+)$/);
  if (match) {
    return {
      category: match[1],
      subType: match[2]
    };
  }
  return null;
}

/**
 * Parse binding code
 * @param {string} code - Binding code to parse
 * @return {Object|null} Parsed components or null if invalid
 */
function parseBindingCode(code) {
  var match = code.match(/^BIND_([A-Z]+)_([A-Z]+)$/);
  if (match) {
    return {
      type: match[1],
      variant: match[2]
    };
  }
  return null;
}

/**
 * Parse product code
 * @param {string} code - Product code to parse
 * @return {Object|null} Parsed components or null if invalid
 */
function parseProductCode(code) {
  var match = code.match(/^PROD_([A-Z]+)_(\d{3})$/);
  if (match) {
    return {
      category: match[1],
      sequence: parseInt(match[2], 10)
    };
  }
  return null;
}

/**
 * Generate next sequence number for product
 * @param {string} category - Product category
 * @param {Array} existingCodes - Array of existing product codes
 * @return {number} Next sequence number
 */
function getNextSequence(category, existingCodes) {
  var prefix = 'PROD_' + category + '_';
  var maxSeq = 0;

  for (var i = 0; i < existingCodes.length; i++) {
    if (existingCodes[i].indexOf(prefix) === 0) {
      var seqStr = existingCodes[i].substring(prefix.length);
      var seq = parseInt(seqStr, 10);
      if (seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  return maxSeq + 1;
}

/**
 * Normalize paper type name
 * @param {string} paperName - Korean paper name
 * @return {string} Normalized paper type code
 */
function normalizePaperType(paperName) {
  if (!paperName) {
    return 'SPECIAL';  // Default for unknown types
  }

  // Direct lookup in mapping
  if (PAPER_TYPE_MAP[paperName]) {
    return PAPER_TYPE_MAP[paperName];
  }

  // Partial matching for variations
  for (var key in PAPER_TYPE_MAP) {
    if (paperName.indexOf(key) !== -1 || key.indexOf(paperName) !== -1) {
      return PAPER_TYPE_MAP[key];
    }
  }

  return 'SPECIAL';  // Default for unknown types
}

/**
 * Normalize size to standard
 * @param {string} sizeName - Korean size name
 * @return {Object|null} Normalized size with dimensions
 */
function normalizeSize(sizeName) {
  if (!sizeName) {
    return null;
  }

  // Direct lookup
  if (SIZE_STANDARDS[sizeName]) {
    return SIZE_STANDARDS[sizeName];
  }

  // Parse custom size (e.g., "200x300")
  var customMatch = sizeName.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (customMatch) {
    return {
      width: parseInt(customMatch[1], 10),
      height: parseInt(customMatch[2], 10),
      standard: 'CUSTOM'
    };
  }

  return null;
}

/**
 * Normalize finish type
 * @param {string} finishName - Korean finish name
 * @return {Object|null} Normalized finish category and sub-type
 */
function normalizeFinishType(finishName) {
  if (!finishName) {
    return null;
  }

  // Direct lookup
  if (FINISH_TYPE_MAP[finishName]) {
    return FINISH_TYPE_MAP[finishName];
  }

  // Partial matching
  for (var key in FINISH_TYPE_MAP) {
    if (finishName.indexOf(key) !== -1) {
      return FINISH_TYPE_MAP[key];
    }
  }

  return null;
}

/**
 * Normalize binding type
 * @param {string} bindingName - Korean binding name
 * @return {Object|null} Normalized binding type with constraints
 */
function normalizeBindingType(bindingName) {
  if (!bindingName) {
    return null;
  }

  // Direct lookup
  if (BINDING_TYPE_MAP[bindingName]) {
    return BINDING_TYPE_MAP[bindingName];
  }

  // Partial matching
  for (var key in BINDING_TYPE_MAP) {
    if (bindingName.indexOf(key) !== -1) {
      return BINDING_TYPE_MAP[key];
    }
  }

  return null;
}

/**
 * Extract GSM from paper name
 * @param {string} paperName - Full paper name (e.g., "아트지 150g")
 * @return {number|null} Extracted GSM value
 */
function extractGSM(paperName) {
  if (!paperName) {
    return null;
  }

  // Match patterns like "150g", "150 g", "150gsm"
  var match = paperName.match(/(\d+)\s*[gG]/);
  if (match) {
    var gsm = parseInt(match[1], 10);

    // Validate GSM range
    if (gsm >= GSM_VALIDATION.MIN_GSM && gsm <= GSM_VALIDATION.MAX_GSM) {
      return gsm;
    }
  }

  return null;
}

/**
 * Validate GSM value
 * @param {number} gsm - GSM value to validate
 * @return {Object} Validation result with valid flag and warnings
 */
function validateGSM(gsm) {
  var result = {
    valid: true,
    warnings: []
  };

  if (gsm < GSM_VALIDATION.MIN_GSM || gsm > GSM_VALIDATION.MAX_GSM) {
    result.valid = false;
    result.warnings.push('GSM out of range (' + GSM_VALIDATION.MIN_GSM + '-' + GSM_VALIDATION.MAX_GSM + ')');
  }

  // Check if common value (within tolerance)
  var isCommon = false;
  for (var i = 0; i < GSM_VALIDATION.COMMON_VALUES.length; i++) {
    var common = GSM_VALIDATION.COMMON_VALUES[i];
    if (Math.abs(gsm - common) <= common * GSM_VALIDATION.TOLERANCE) {
      isCommon = true;
      break;
    }
  }

  if (!isCommon) {
    result.warnings.push('Uncommon GSM value: ' + gsm);
  }

  return result;
}

/**
 * Generate ISO 8601 timestamp
 * @return {string} Current timestamp in ISO 8601 format
 */
function getTimestamp() {
  var now = new Date();
  var year = now.getFullYear();
  var month = padZero(now.getMonth() + 1);
  var day = padZero(now.getDate());
  var hours = padZero(now.getHours());
  var minutes = padZero(now.getMinutes());
  var seconds = padZero(now.getSeconds());

  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
}

/**
 * Pad number with leading zero
 * @param {number} num - Number to pad
 * @return {string} Padded string
 */
function padZero(num) {
  return num < 10 ? '0' + num : num.toString();
}

/**
 * Parse MES code format (XXX-XXXX or XXXXXX)
 * MES codes are 6-digit codes where:
 * - First 3 digits represent category (001, 002, etc.)
 * - Last 3 digits represent sequence (001, 002, etc.)
 *
 * @param {string} code - MES code to parse (e.g., "001001" or "001-001")
 * @return {object|null} - {category, sequence, fullCode} or null if invalid
 */
function parseMesCode(code) {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Remove any hyphens or spaces
  var normalizedCode = code.replace(/[-\s]/g, '');

  // Check if it's exactly 6 digits
  if (normalizedCode.length !== 6 || !/^\d{6}$/.test(normalizedCode)) {
    return null;
  }

  return {
    category: normalizedCode.substring(0, 3),
    sequence: normalizedCode.substring(3, 6),
    fullCode: code
  };
}
