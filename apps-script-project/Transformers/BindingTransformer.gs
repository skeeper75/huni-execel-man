/**
 * Binding Transformer
 *
 * Transforms source binding data to normalized BINDING_MASTER format
 */

/**
 * Transform source binding data to master format
 * @param {Object} sourceBinding - Source binding data from xlsx
 * @return {Object} Transformed binding record
 */
function transformBinding(sourceBinding) {
  var bindingName = extractBindingName(sourceBinding);
  var normalized = normalizeBindingType(bindingName);

  if (!normalized) {
    throw new Error('Cannot normalize binding: ' + bindingName);
  }

  // Generate code
  var bindingCode = generateBindingCode(normalized.type, 'STD');

  // Build transformed record
  var transformed = {
    binding_code: bindingCode,
    binding_name_ko: bindingName,
    binding_name_en: generateEnglishBindingName(normalized.type),
    binding_type: normalized.type,
    min_pages: normalized.min_pages,
    max_pages: normalized.max_pages,
    page_unit: normalized.page_unit,
    cover_required: normalized.cover_required,
    spine_calculation: extractSpineCalculation(sourceBinding),
    applicable_sizes: extractApplicableSizes(sourceBinding),
    status: STATUS.ACTIVE,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };

  return transformed;
}

/**
 * Transform batch of bindings
 * @param {Array} sourceBindings - Array of source binding data
 * @return {Array} Array of transformed binding records
 */
function transformBindings(sourceBindings) {
  var transformed = [];
  var seenCodes = {};

  for (var i = 0; i < sourceBindings.length; i++) {
    try {
      var binding = transformBinding(sourceBindings[i]);
      var code = binding.binding_code;

      // Check for duplicates
      if (seenCodes[code]) {
        logWarning('Duplicate binding code detected: ' + code);
        // Skip duplicates
        continue;
      }

      seenCodes[code] = true;
      transformed.push(binding);
    } catch (e) {
      logError('Error transforming binding at index ' + i + ': ' + e.toString());
    }
  }

  return transformed;
}

/**
 * Extract binding name from source data
 * @param {Object} sourceBinding - Source binding data
 * @return {string} Binding name
 */
function extractBindingName(sourceBinding) {
  if (sourceBinding.name) {
    return sourceBinding.name.trim();
  }
  if (sourceBinding.binding_name) {
    return sourceBinding.binding_name.trim();
  }
  if (sourceBinding.제본) {
    return sourceBinding.제본.trim();
  }
  if (sourceBinding.제본방식) {
    return sourceBinding.제본방식.trim();
  }
  return 'Unknown';
}

/**
 * Generate English binding name
 * @param {string} bindingType - Normalized binding type
 * @return {string} English name
 */
function generateEnglishBindingName(bindingType) {
  var typeNames = {
    'SADDLE': 'Saddle Stitch',
    'PERFECT': 'Perfect Binding',
    'CASE': 'Case Binding',
    'WIRE': 'Wire Binding',
    'SPIRAL': 'Spiral Binding',
    'PUR': 'PUR Binding'
  };

  return typeNames[bindingType] || 'Standard Binding';
}

/**
 * Extract spine calculation formula from source data
 * @param {Object} sourceBinding - Source binding data
 * @return {string|null} Spine calculation formula
 */
function extractSpineCalculation(sourceBinding) {
  if (sourceBinding.spine_calculation) {
    return sourceBinding.spine_calculation;
  }
  if (sourceBinding.등두께계산) {
    return sourceBinding.등두께계산;
  }

  // Default formula based on binding type
  var type = sourceBinding.binding_type;
  if (type === 'PERFECT' || type === 'CASE' || type === 'PUR') {
    return '(pages/2)*gsm*0.001';  // Standard formula
  }
  return null;
}

/**
 * Extract applicable sizes from source data
 * @param {Object} sourceBinding - Source binding data
 * @return {string|null} Comma-separated size codes
 */
function extractApplicableSizes(sourceBinding) {
  if (sourceBinding.applicable_sizes) {
    return sourceBinding.applicable_sizes;
  }
  if (sourceBinding.적용사이즈) {
    return sourceBinding.적용사이즈;
  }

  // Default: common sizes
  return 'A4,A5,B5';
}

/**
 * Validate page count for binding type
 * @param {string} bindingType - Binding type
 * @param {number} pageCount - Page count to validate
 * @return {Object} Validation result
 */
function validatePageCount(bindingType, pageCount) {
  var normalized = BINDING_TYPE_MAP[bindingType];

  if (!normalized) {
    return {
      valid: false,
      error: 'Unknown binding type: ' + bindingType
    };
  }

  if (pageCount < normalized.min_pages) {
    return {
      valid: false,
      error: 'Page count below minimum (' + normalized.min_pages + ')'
    };
  }

  if (pageCount > normalized.max_pages) {
    return {
      valid: false,
      error: 'Page count above maximum (' + normalized.max_pages + ')'
    };
  }

  // Check page unit alignment
  if (pageCount % normalized.page_unit !== 0) {
    return {
      valid: false,
      warning: 'Page count not aligned to unit (' + normalized.page_unit + ')'
    };
  }

  return { valid: true };
}

/**
 * Calculate spine width
 * @param {number} pageCount - Number of pages
 * @param {number} gsm - Paper GSM
 * @param {string} bindingType - Binding type
 * @return {number} Spine width in mm
 */
function calculateSpineWidth(pageCount, gsm, bindingType) {
  // Basic formula: (pageCount / 2) * (gsm / 1000)
  // This gives spine width in mm

  var baseWidth = (pageCount / 2) * (gsm / 1000);

  // Adjust for different binding types
  switch (bindingType) {
    case 'SADDLE':
      return baseWidth * 0.8;  // Saddle stitch compresses more
    case 'PERFECT':
    case 'PUR':
      return baseWidth * 1.1;  // Perfect binding adds glue thickness
    case 'CASE':
      return baseWidth * 1.2;  // Case binding has more material
    case 'WIRE':
    case 'SPIRAL':
      return baseWidth * 0.9;  // Wire/spiral doesn't compress as much
    default:
      return baseWidth;
  }
}
