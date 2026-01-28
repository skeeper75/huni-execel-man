/**
 * Size Transformer
 *
 * Transforms source size data to normalized SIZE_MASTER format
 */

/**
 * Transform source size data to master format
 * @param {Object} sourceSize - Source size data from xlsx
 * @return {Object} Transformed size record
 */
function transformSize(sourceSize) {
  var sizeName = extractSizeName(sourceSize);
  var normalized = normalizeSize(sizeName);

  if (!normalized) {
    throw new Error('Cannot normalize size: ' + sizeName);
  }

  // Generate code
  var variant = normalized.standard === 'CUSTOM' ?
    'CUSTOM_' + normalized.width + 'X' + normalized.height :
    normalized.standard;
  var sizeCode = generateSizeCode(
    normalized.standard === 'CUSTOM' ? 'CUSTOM' : sizeName.replace(/\s/g, ''),
    variant
  );

  // Build transformed record
  var transformed = {
    size_code: sizeCode,
    size_name: sizeName,
    width_mm: normalized.width,
    height_mm: normalized.height,
    standard: normalized.standard,
    orientation: determineOrientation(sourceSize),
    bleed_mm: extractBleed(sourceSize),
    safe_margin_mm: extractSafeMargin(sourceSize),
    status: STATUS.ACTIVE,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };

  return transformed;
}

/**
 * Transform batch of sizes
 * @param {Array} sourceSizes - Array of source size data
 * @return {Array} Array of transformed size records
 */
function transformSizes(sourceSizes) {
  var transformed = [];
  var seenCodes = {};

  for (var i = 0; i < sourceSizes.length; i++) {
    try {
      var size = transformSize(sourceSizes[i]);
      var code = size.size_code;

      // Check for duplicates
      if (seenCodes[code]) {
        logWarning('Duplicate size code detected: ' + code);
        // Skip duplicates
        continue;
      }

      seenCodes[code] = true;
      transformed.push(size);
    } catch (e) {
      logError('Error transforming size at index ' + i + ': ' + e.toString());
    }
  }

  return transformed;
}

/**
 * Extract size name from source data
 * @param {Object} sourceSize - Source size data
 * @return {string} Size name
 */
function extractSizeName(sourceSize) {
  if (sourceSize.name) {
    return sourceSize.name.trim();
  }
  if (sourceSize.size_name) {
    return sourceSize.size_name.trim();
  }
  if (sourceSize.사이즈) {
    return sourceSize.사이즈.trim();
  }
  if (sourceSize.규격) {
    return sourceSize.규격.trim();
  }
  return 'Unknown';
}

/**
 * Determine orientation from source data
 * @param {Object} sourceSize - Source size data
 * @return {string} Orientation (PORTRAIT, LANDSCAPE, or null)
 */
function determineOrientation(sourceSize) {
  if (sourceSize.orientation) {
    return sourceSize.orientation.toUpperCase();
  }
  if (sourceSize.방향) {
    var ko = sourceSize.방향;
    if (ko === '세로') return 'PORTRAIT';
    if (ko === '가로') return 'LANDSCAPE';
  }
  return null;  // Default
}

/**
 * Extract bleed from source data
 * @param {Object} sourceSize - Source size data
 * @return {number|null} Bleed in mm
 */
function extractBleed(sourceSize) {
  if (sourceSize.bleed) {
    return sourceSize.bleed;
  }
  if (sourceSize.블리드) {
    return sourceSize.블리드;
  }
  if (sourceSize.도련) {
    return sourceSize.도련;
  }
  return 3;  // Default bleed for print-ready files
}

/**
 * Extract safe margin from source data
 * @param {Object} sourceSize - Source size data
 * @return {number|null} Safe margin in mm
 */
function extractSafeMargin(sourceSize) {
  if (sourceSize.safe_margin) {
    return sourceSize.safe_margin;
  }
  if (sourceSize.안전여백) {
    return sourceSize.안전여백;
  }
  return 5;  // Default safe margin
}

/**
 * Parse trim size from source data
 * @param {Object} sourceData - Source data with trim size info
 * @return {Object|null} Object with width and height
 */
function parseTrimSize(sourceData) {
  var trimSize = null;

  if (sourceData.trim_size) {
    trimSize = sourceData.trim_size;
  } else if (sourceData.재단사이즈) {
    trimSize = sourceData.재단사이즈;
  } else if (sourceData.작업사이즈) {
    // Work size = trim size + bleed
    var workSize = sourceData.작업사이즈;
    var bleed = sourceData.블리드 || 3;
    // Assuming work size includes bleed on both sides
    trimSize = {
      width: workSize.width - (bleed * 2),
      height: workSize.height - (bleed * 2)
    };
  }

  if (typeof trimSize === 'string') {
    return parseSize(trimSize);
  }

  return trimSize;
}

/**
 * Parse work size from source data
 * @param {Object} sourceData - Source data with work size info
 * @return {Object|null} Object with width and height
 */
function parseWorkSize(sourceData) {
  var workSize = null;

  if (sourceData.work_size) {
    workSize = sourceData.work_size;
  } else if (sourceData.작업사이즈) {
    workSize = sourceData.작업사이즈;
  } else if (sourceData.블리드) {
    // Calculate work size from trim size and bleed
    var trim = parseTrimSize(sourceData);
    var bleed = sourceData.블리드;
    if (trim && bleed) {
      workSize = {
        width: trim.width + (bleed * 2),
        height: trim.height + (bleed * 2)
      };
    }
  }

  if (typeof workSize === 'string') {
    return parseSize(workSize);
  }

  return workSize;
}
