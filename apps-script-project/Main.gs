/**
 * Huniprinting Data Migration Tool
 *
 * Main entry point for migrating xlsx data to normalized master tables
 * in Google Sheets.
 *
 * Usage:
 *   1. Open this script in Google Apps Script editor
 *   2. Run 'showMigrationUI()' to start the migration
 *   3. Or run individual functions for specific operations
 */

// ============================================
// MAIN ENTRY POINTS
// ============================================

/**
 * Show migration UI sidebar
 */
function showMigrationUI() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('후니프린팅 데이터 마이그레이션')
    .setWidth(400);

  SpreadsheetApp.getActiveSpreadsheet().sidebar(html);
}

/**
 * Run full migration from xlsx files
 * @param {Object} options - Migration options
 * @return {Object} Migration result
 */
function runMigration(options) {
  options = options || {};

  logInfo('=== Starting Migration ===');

  var result = {
    status: 'SUCCESS',
    startTime: getTimestamp(),
    endTime: null,
    migrated: {},
    validation: null,
    errors: [],
    warnings: []
  };

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Step 1: Load and parse source data
    logInfo('Loading source data...');
    var sourceData = loadSourceData(options.sourceFileIds);
    result.source = {
      papers: sourceData.papers.length,
      sizes: sourceData.sizes.length,
      finishes: sourceData.finishes.length,
      bindings: sourceData.bindings.length,
      products: sourceData.products.length
    };

    // Step 2: Transform data
    logInfo('Transforming data...');
    var transformed = {
      papers: transformPapers(sourceData.papers),
      sizes: transformSizes(sourceData.sizes),
      finishes: transformFinishes(sourceData.finishes),
      bindings: transformBindings(sourceData.bindings),
      products: transformProducts(sourceData.products)
    };

    result.migrated = {
      papers: transformed.papers.length,
      sizes: transformed.sizes.length,
      finishes: transformed.finishes.length,
      bindings: transformed.bindings.length,
      products: transformed.products.length
    };

    // Step 3: Write to master tables
    logInfo('Writing to master tables...');
    if (options.clearExisting) {
      clearAllMasterTables(spreadsheet);
    }

    writePapers(transformed.papers, spreadsheet);
    writeSizes(transformed.sizes, spreadsheet);
    writeFinishes(transformed.finishes, spreadsheet);
    writeBindings(transformed.bindings, spreadsheet);
    writeProducts(transformed.products, spreadsheet);

    // Generate code definitions
    var codeDefs = generateCodeDefinitions(transformed);
    writeCodeDefinitions(codeDefs, spreadsheet);

    // Step 4: Setup named ranges and validation
    createNamedRanges(spreadsheet);
    setupDataValidation(spreadsheet);

    // Step 5: Validate
    logInfo('Validating migrated data...');
    var validation = validateMasterDataset(transformed);
    result.validation = validation;

    // Step 6: Write migration log
    writeMigrationLog(spreadsheet, {
      operation: 'FULL_MIGRATION',
      recordsAffected: sumValues(result.migrated),
      status: validation.valid ? 'SUCCESS' : 'WARNING',
      message: validation.summary,
      details: result
    });

    if (!validation.valid) {
      result.status = 'WARNING';
      result.warnings.push('Validation failed with errors');
    }

    logInfo('=== Migration Complete ===');

  } catch (e) {
    result.status = 'ERROR';
    result.errors.push(e.toString());
    logError('Migration failed: ' + e.toString());

    writeMigrationLog(SpreadsheetApp.getActiveSpreadsheet(), {
      operation: 'FULL_MIGRATION',
      recordsAffected: 0,
      status: 'ERROR',
      message: e.toString(),
      details: result
    });
  }

  result.endTime = getTimestamp();

  return result;
}

/**
 * Load source data from xlsx files
 * @param {Object} fileIds - Object with file IDs
 * @return {Object} Loaded source data
 */
function loadSourceData(fileIds) {
  // This is a placeholder - actual implementation would use Drive API
  // to read xlsx files and parse them

  return {
    papers: [],    // Array of paper objects
    sizes: [],     // Array of size objects
    finishes: [],  // Array of finish objects
    bindings: [],  // Array of binding objects
    products: []   // Array of product objects
  };
}

/**
 * Transform products from source data
 * @param {Array} sourceProducts - Source product data
 * @return {Array} Transformed products
 */
function transformProducts(sourceProducts) {
  var transformed = [];
  var seenCodes = {};

  for (var i = 0; i < sourceProducts.length; i++) {
    try {
      var product = transformProduct(sourceProducts[i]);
      var code = product.product_code;

      // Check for duplicates
      if (seenCodes[code]) {
        logWarning('Duplicate product code detected: ' + code);
        continue;
      }

      seenCodes[code] = true;
      transformed.push(product);
    } catch (e) {
      logError('Error transforming product at index ' + i + ': ' + e.toString());
    }
  }

  return transformed;
}

/**
 * Transform single product from source data
 * @param {Object} sourceProduct - Source product data
 * @return {Object} Transformed product
 */
function transformProduct(sourceProduct) {
  // Extract basic info
  var productName = extractProductName(sourceProduct);
  var category = extractProductCategory(sourceProduct);
  var mesCode = sourceProduct.mes_code || null;

  // Generate code
  var existingCodes = [];  // Would fetch from sheet
  var sequence = getNextSequence(category, existingCodes);
  var productCode = generateProductCode(category, sequence);

  // Parse size info
  var trimSize = parseTrimSize(sourceProduct);
  var sizeCode = null;
  if (trimSize) {
    var normalized = normalizeSize(trimSize.width + 'x' + trimSize.height);
    if (normalized) {
      sizeCode = generateSizeCode(
        normalized.standard === 'CUSTOM' ? 'CUSTOM' : 'A' + normalized.width + 'X' + normalized.height,
        normalized.standard
      );
    }
  }

  // Parse paper info
  var paperName = extractPaperName(sourceProduct);
  var paperType = normalizePaperType(paperName);
  var gsm = extractGSM(paperName);
  var paperCode = null;
  if (gsm) {
    paperCode = generatePaperCode(paperType, gsm);
  }

  // Build transformed record
  return {
    product_code: productCode,
    product_name_ko: productName,
    product_name_en: generateEnglishProductName(category, productName),
    category: category,
    sub_category: extractSubCategory(sourceProduct),
    default_paper_code: paperCode,
    default_size_code: sizeCode,
    available_papers: extractAvailablePapers(sourceProduct),
    available_sizes: extractAvailableSizes(sourceProduct),
    available_finishes: extractAvailableFinishes(sourceProduct),
    min_quantity: extractMinQuantity(sourceProduct),
    quantity_unit: extractQuantityUnit(sourceProduct),
    lead_time_days: extractLeadTime(sourceProduct),
    description: extractDescription(sourceProduct),
    status: STATUS.ACTIVE,
    mes_code: mesCode,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };
}

/**
 * Generate code definitions from all transformed data
 * @param {Object} transformed - Transformed data
 * @return {Array} Code definition records
 */
function generateCodeDefinitions(transformed) {
  var codes = [];
  var sortOrders = {
    PAPER: 1,
    SIZE: 2,
    FINISH: 3,
    BINDING: 4,
    PROD: 5
  };

  // Paper types
  var paperTypes = {};
  for (var i = 0; i < transformed.papers.length; i++) {
    var type = transformed.papers[i].paper_type;
    if (!paperTypes[type]) {
      paperTypes[type] = {
        code_prefix: 'PAPER',
        code_value: type,
        name_ko: getKoreanPaperTypeName(type),
        name_en: getEnglishPaperTypeName(type),
        category: 'PAPER_TYPE',
        parent_code: 'PAPER',
        sort_order: sortOrders.PAPER + Object.keys(paperTypes).length,
        status: STATUS.ACTIVE
      };
      codes.push(paperTypes[type]);
    }
  }

  // Size standards
  var sizeStandards = {};
  for (var j = 0; j < transformed.sizes.length; j++) {
    var standard = transformed.sizes[j].standard;
    if (!sizeStandards[standard]) {
      sizeStandards[standard] = {
        code_prefix: 'SIZE',
        code_value: standard,
        name_ko: getKoreanStandardName(standard),
        name_en: standard,
        category: 'SIZE_STANDARD',
        parent_code: 'SIZE',
        sort_order: sortOrders.SIZE + Object.keys(sizeStandards).length,
        status: STATUS.ACTIVE
      };
      codes.push(sizeStandards[standard]);
    }
  }

  // Add timestamps
  for (var k = 0; k < codes.length; k++) {
    codes[k].created_at = getTimestamp();
    codes[k].updated_at = getTimestamp();
  }

  return codes;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Extract product name from source data
 */
function extractProductName(sourceProduct) {
  if (sourceProduct.name) return sourceProduct.name;
  if (sourceProduct.상품명) return sourceProduct.상품명;
  return 'Unknown Product';
}

/**
 * Extract product category from source data
 */
function extractProductCategory(sourceProduct) {
  if (sourceProduct.category) return sourceProduct.category;
  if (sourceProduct.카테고리) return sourceProduct.카테고리;

  // Determine from sheet or MES code
  var mesCode = sourceProduct.mes_code;
  if (mesCode) {
    var parsed = parse_mes_code(mesCode);
    if (parsed && parsed.category) {
      return getAbbreviationForCategory(parsed.category);
    }
  }

  return 'DIG';  // Default
}

/**
 * Get abbreviation for MES category
 */
function getAbbreviationForCategory(categoryNum) {
  var map = {
    '001': 'DIG',  // Postcards
    '002': 'STK',  // Stickers
    '003': 'DIG',  // Promotional
    '004': 'LG',   // Large format
    '005': 'LG',   // Signs
    '006': 'BOOK', // Booklets
    '007': 'CAL',  // Calendars
    '008': 'STN',  // Stationery
    '009': 'ACR',  // Acrylic
    '010': 'GOODS' // Goods
  };
  return map[categoryNum] || 'DIG';
}

/**
 * Extract sub-category
 */
function extractSubCategory(sourceProduct) {
  if (sourceProduct.sub_category) return sourceProduct.sub_category;
  return null;
}

/**
 * Extract available papers
 */
function extractAvailablePapers(sourceProduct) {
  if (sourceProduct.available_papers) return sourceProduct.available_papers;
  return 'PAPER_ART_*';  // Default wildcard
}

/**
 * Extract available sizes
 */
function extractAvailableSizes(sourceProduct) {
  if (sourceProduct.available_sizes) return sourceProduct.available_sizes;
  return null;
}

/**
 * Extract available finishes
 */
function extractAvailableFinishes(sourceProduct) {
  if (sourceProduct.available_finishes) return sourceProduct.available_finishes;
  return null;
}

/**
 * Extract min quantity
 */
function extractMinQuantity(sourceProduct) {
  if (sourceProduct.min_quantity) return sourceProduct.min_quantity;
  if (sourceProduct.제작수량) {
    var match = sourceProduct.제작수량.match(/(\d+)\s*~/);
    return match ? parseInt(match[1], 10) : 100;
  }
  return 100;  // Default
}

/**
 * Extract quantity unit
 */
function extractQuantityUnit(sourceProduct) {
  if (sourceProduct.quantity_unit) return sourceProduct.quantity_unit;
  if (sourceProduct.수량단위) return sourceProduct.수량단위;
  return 100;  // Default
}

/**
 * Extract lead time
 */
function extractLeadTime(sourceProduct) {
  if (sourceProduct.lead_time_days) return sourceProduct.lead_time_days;
  if (sourceProduct.제작일) return sourceProduct.제작일;
  return 3;  // Default 3 days
}

/**
 * Extract description
 */
function extractDescription(sourceProduct) {
  if (sourceProduct.description) return sourceProduct.description;
  if (sourceProduct.설명) return sourceProduct.설명;
  return null;
}

/**
 * Generate English product name
 */
function generateEnglishProductName(category, koreanName) {
  var categoryNames = {
    'DIG': 'Digital',
    'STK': 'Sticker',
    'BOOK': 'Booklet',
    'CAL': 'Calendar',
    'LG': 'Large Format',
    'STN': 'Stationery',
    'ACR': 'Acrylic',
    'GOODS': 'Goods'
  };

  return (categoryNames[category] || 'Product') + ' - ' + koreanName;
}

/**
 * Get Korean paper type name
 */
function getKoreanPaperTypeName(type) {
  var names = {
    'ART': '아트지',
    'SNOW': '스노우지',
    'MOJO': '모조지',
    'KRAFT': '크라프트지',
    'IVORY': '아이보리지',
    'SPECIAL': '특수지'
  };
  return names[type] || type;
}

/**
 * Get English paper type name
 */
function getEnglishPaperTypeName(type) {
  var names = {
    'ART': 'Art Paper',
    'SNOW': 'Snow White',
    'MOJO': 'Uncoated',
    'KRAFT': 'Kraft',
    'IVORY': 'Ivory Board',
    'SPECIAL': 'Specialty'
  };
  return names[type] || type;
}

/**
 * Get Korean standard name
 */
function getKoreanStandardName(standard) {
  var names = {
    'ISO': 'ISO 216',
    'JIS': 'JIS',
    'KS': '한국산업규격',
    'CUSTOM': '사용자정의'
  };
  return names[standard] || standard;
}

/**
 * Sum object values
 */
function sumValues(obj) {
  var sum = 0;
  for (var key in obj) {
    sum += obj[key];
  }
  return sum;
}

/**
 * Parse MES code (alias for compatibility)
 */
function parse_mes_code(code) {
  return parseMesCode(code);
}
