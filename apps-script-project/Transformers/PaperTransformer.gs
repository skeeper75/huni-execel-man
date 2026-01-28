/**
 * Paper Transformer
 *
 * Transforms source paper data to normalized PAPER_MASTER format
 */

/**
 * Transform source paper data to master format
 * @param {Object} sourcePaper - Source paper data from xlsx
 * @return {Object} Transformed paper record
 */
function transformPaper(sourcePaper) {
  var paperName = extractPaperName(sourcePaper);
  var paperType = normalizePaperType(paperName);
  var gsm = extractGSM(paperName) || sourcePaper.gram;

  // Validate GSM
  var gsmValidation = validateGSM(gsm);
  if (!gsmValidation.valid) {
    logWarning('Invalid GSM for paper: ' + paperName, gsmValidation.warnings);
  }

  // Generate code
  var paperCode = generatePaperCode(paperType, gsm);

  // Build transformed record
  var transformed = {
    paper_code: paperCode,
    paper_name_ko: paperName,
    paper_name_en: generateEnglishPaperName(paperType, gsm),
    paper_type: paperType,
    gsm: gsm,
    thickness_um: sourcePaper.thickness || null,
    finish: extractFinish(sourcePaper),
    color: extractColor(sourcePaper),
    opacity: sourcePaper.opacity || null,
    printability: extractPrintability(sourcePaper),
    status: STATUS.ACTIVE,
    mes_code: sourcePaper.mes_code || null,
    created_at: getTimestamp(),
    updated_at: getTimestamp()
  };

  return transformed;
}

/**
 * Transform batch of papers
 * @param {Array} sourcePapers - Array of source paper data
 * @return {Array} Array of transformed paper records
 */
function transformPapers(sourcePapers) {
  var transformed = [];
  var seenCodes = {};

  for (var i = 0; i < sourcePapers.length; i++) {
    try {
      var paper = transformPaper(sourcePapers[i]);
      var code = paper.paper_code;

      // Check for duplicates
      if (seenCodes[code]) {
        logWarning('Duplicate paper code detected: ' + code);
        // Update existing record instead of creating new one
        updateExistingPaper(transformed, seenCodes[code], paper);
      } else {
        seenCodes[code] = transformed.length;
        transformed.push(paper);
      }
    } catch (e) {
      logError('Error transforming paper at index ' + i + ': ' + e.toString());
    }
  }

  return transformed;
}

/**
 * Extract paper name from source data
 * @param {Object} sourcePaper - Source paper data
 * @return {string} Paper name
 */
function extractPaperName(sourcePaper) {
  if (sourcePaper.name) {
    // Remove special markers
    var name = sourcePaper.name;
    name = name.replace(/[▶▶★●#※]/g, '').trim();
    return name;
  }
  if (sourcePaper.종이명) {
    return sourcePaper.종이명;
  }
  return 'Unknown Paper';
}

/**
 * Generate English paper name
 * @param {string} paperType - Normalized paper type
 * @param {number} gsm - GSM value
 * @return {string} English name
 */
function generateEnglishPaperName(paperType, gsm) {
  var typeNames = {
    'ART': 'Art Paper',
    'SNOW': 'Snow White',
    'MOJO': 'Uncoated',
    'KRAFT': 'Kraft',
    'IVORY': 'Ivory Board',
    'SPECIAL': 'Specialty'
  };

  var typeName = typeNames[paperType] || 'Specialty';
  return typeName + ' ' + gsm + 'gsm';
}

/**
 * Extract finish from source data
 * @param {Object} sourcePaper - Source paper data
 * @return {string|null} Finish type
 */
function extractFinish(sourcePaper) {
  if (sourcePaper.finish) {
    return sourcePaper.finish;
  }
  if (sourcePaper.표면처리) {
    return sourcePaper.표면처리;
  }
  // Default based on paper type
  return 'GLOSS';  // Most common for art papers
}

/**
 * Extract color from source data
 * @param {Object} sourcePaper - Source paper data
 * @return {string|null} Color
 */
function extractColor(sourcePaper) {
  if (sourcePaper.color) {
    return sourcePaper.color;
  }
  if (sourcePaper.색상) {
    return sourcePaper.색상;
  }
  return 'WHITE';  // Default
}

/**
 * Extract printability from source data
 * @param {Object} sourcePaper - Source paper data
 * @return {string|null} Printability rating
 */
function extractPrintability(sourcePaper) {
  if (sourcePaper.printability) {
    return sourcePaper.printability;
  }
  // Default based on paper type
  return 'HIGH';
}

/**
 * Update existing paper record with new data
 * @param {Array} papers - Array of papers
 * @param {number} index - Index of paper to update
 * @param {Object} newData - New data to merge
 */
function updateExistingPaper(papers, index, newData) {
  var existing = papers[index];
  existing.updated_at = getTimestamp();

  // Update fields if new data has values
  if (newData.mes_code && !existing.mes_code) {
    existing.mes_code = newData.mes_code;
  }
  if (newData.thickness_um && !existing.thickness_um) {
    existing.thickness_um = newData.thickness_um;
  }
  if (newData.paper_name_en && !existing.paper_name_en) {
    existing.paper_name_en = newData.paper_name_en;
  }
}
