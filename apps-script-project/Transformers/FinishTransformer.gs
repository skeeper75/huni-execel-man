/**
 * Finish Transformer
 *
 * Transforms source finish data to normalized FINISH_MASTER format
 */

/**
 * Transform source finish data to master format
 * @param {Object} sourceFinish - Source finish data from xlsx
 * @return {Object} Transformed finish record
 */
function transformFinish(sourceFinish) {
  var finishName = extractFinishName(sourceFinish);
  var normalized = normalizeFinishType(finishName);

  if (!normalized) {
    throw new Error('Cannot normalize finish: ' + finishName);
  }

  // Generate code
  var finishCode = generateFinishCode(normalized.category, normalized.sub_type);

  // Build transformed record
  var transformed = {
    finish_code: finishCode,
    finish_name_ko: finishName,
    finish_name_en: generateEnglishFinishName(normalized.category, normalized.sub_type),
    category: normalized.category,
    sub_type: normalized.sub_type,
    unit: extractUnit(sourceFinish),
    base_price: extractBasePrice(sourceFinish),
    min_quantity: extractMinQuantity(sourceFinish),
    applicable_papers: extractApplicablePapers(sourceFinish),
    status: STATUS.ACTIVE,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };

  return transformed;
}

/**
 * Transform batch of finishes
 * @param {Array} sourceFinishes - Array of source finish data
 * @return {Array} Array of transformed finish records
 */
function transformFinishes(sourceFinishes) {
  var transformed = [];
  var seenCodes = {};

  for (var i = 0; i < sourceFinishes.length; i++) {
    try {
      var finish = transformFinish(sourceFinishes[i]);
      var code = finish.finish_code;

      // Check for duplicates
      if (seenCodes[code]) {
        logWarning('Duplicate finish code detected: ' + code);
        // Skip duplicates
        continue;
      }

      seenCodes[code] = true;
      transformed.push(finish);
    } catch (e) {
      logError('Error transforming finish at index ' + i + ': ' + e.toString());
    }
  }

  return transformed;
}

/**
 * Extract finish name from source data
 * @param {Object} sourceFinish - Source finish data
 * @return {string} Finish name
 */
function extractFinishName(sourceFinish) {
  if (sourceFinish.name) {
    return sourceFinish.name.trim();
  }
  if (sourceFinish.finish_name) {
    return sourceFinish.finish_name.trim();
  }
  if (sourceFinish.후가공) {
    return sourceFinish.후가공.trim();
  }
  if (sourceFinish.코팅) {
    return sourceFinish.코팅.trim();
  }
  return 'Unknown';
}

/**
 * Generate English finish name
 * @param {string} category - Finish category
 * @param {string} subType - Finish sub-type
 * @return {string} English name
 */
function generateEnglishFinishName(category, subType) {
  var categoryNames = {
    'LAM': 'Lamination',
    'UV': 'UV Coating',
    'FOIL': 'Foil',
    'EMB': 'Embossing',
    'DIE': 'Die Cutting'
  };

  var subTypeNames = {
    'GLOSS': 'Gloss',
    'MATTE': 'Matte',
    'VELVET': 'Velvet',
    'SPOT': 'Spot',
    'FULL': 'Full',
    'GOLD': 'Gold',
    'SILVER': 'Silver',
    'HOLO': 'Hologram',
    'STD': 'Standard',
    'PUNCH': 'Punch',
    'ROUND': 'Round Corner'
  };

  return subTypeNames[subType] + ' ' + categoryNames[category];
}

/**
 * Extract unit from source data
 * @param {Object} sourceFinish - Source finish data
 * @return {string} Unit
 */
function extractUnit(sourceFinish) {
  if (sourceFinish.unit) {
    return sourceFinish.unit;
  }
  if (sourceFinish.단위) {
    return sourceFinish.단위;
  }
  return '매';  // Default unit (per sheet)
}

/**
 * Extract base price from source data
 * @param {Object} sourceFinish - Source finish data
 * @return {number|null} Base price
 */
function extractBasePrice(sourceFinish) {
  if (sourceFinish.base_price) {
    return sourceFinish.base_price;
  }
  if (sourceFinish.기본단가) {
    return sourceFinish.기본단가;
  }
  if (sourceFinish.단가) {
    return sourceFinish.단가;
  }
  return null;
}

/**
 * Extract min quantity from source data
 * @param {Object} sourceFinish - Source finish data
 * @return {number|null} Minimum quantity
 */
function extractMinQuantity(sourceFinish) {
  if (sourceFinish.min_quantity) {
    return sourceFinish.min_quantity;
  }
  if (sourceFinish.최소수량) {
    return sourceFinish.최소수량;
  }
  return null;
}

/**
 * Extract applicable papers from source data
 * @param {Object} sourceFinish - Source finish data
 * @return {string|null} Comma-separated paper types
 */
function extractApplicablePapers(sourceFinish) {
  if (sourceFinish.applicable_papers) {
    return sourceFinish.applicable_papers;
  }
  if (sourceFinish.적용용지) {
    return sourceFinish.적용용지;
  }

  // Default based on category
  var category = sourceFinish.category;
  if (category === 'LAM' || category === 'UV') {
    return 'ART,SNOW,IVORY';  // Common for coating
  }
  return null;
}

/**
 * Parse composite finish (e.g., "무광코팅+금박")
 * @param {string} compositeName - Composite finish name
 * @return {Array} Array of individual finish names
 */
function parseCompositeFinish(compositeName) {
  var finishes = [];

  // Split by common separators
  var parts = compositeName.split(/[+＋&]/);

  for (var i = 0; i < parts.length; i++) {
    var finishName = parts[i].trim();
    if (finishName) {
      finishes.push(finishName);
    }
  }

  return finishes.length > 0 ? finishes : [compositeName];
}
