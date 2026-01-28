/**
 * Configuration constants for Huniprinting Data Migration Tool
 *
 * This file contains all configuration constants including:
 * - Master table definitions
 * - Code format patterns
 * - Mapping dictionaries
 * - Validation rules
 */

// ============================================
// MASTER TABLE SHEET NAMES
// ============================================
var MASTER_TABLES = {
  PAPER: 'PAPER_MASTER',
  SIZE: 'SIZE_MASTER',
  FINISH: 'FINISH_MASTER',
  BINDING: 'BINDING_MASTER',
  PRODUCT: 'PRODUCT_MASTER',
  CODE_DEFINITION: 'CODE_DEFINITION',
  MIGRATION_LOG: 'MIGRATION_LOG'
};

// ============================================
// CODE FORMAT PATTERNS
// ============================================
var CODE_PATTERNS = {
  // Pattern: [CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]
  PAPER: /^PAPER_[A-Z]+_\d+$/,
  SIZE: /^SIZE_[A-Z]+_[A-Z]+$/,
  FINISH: /^FINISH_[A-Z]+_[A-Z]+$/,
  BINDING: /^BIND_[A-Z]+_[A-Z]+$/,
  PRODUCT: /^PROD_[A-Z]+_\d{3}$/,
  CODE_DEF: /^[A-Z]+_[A-Z0-9]+$/
};

// ============================================
// PAPER TYPE MAPPING (Source -> Normalized)
// ============================================
var PAPER_TYPE_MAP = {
  // Korean variations -> Normalized code
  '아트지': 'ART',
  '아트': 'ART',
  '스노우지': 'SNOW',
  '스노우': 'SNOW',
  '스노화이트': 'SNOW',
  '모조지': 'MOJO',
  '모조': 'MOJO',
  '크라프트': 'KRAFT',
  '크라프트지': 'KRAFT',
  '아이보리': 'IVORY',
  '백상지': 'IVORY',
  '랑데뷰': 'SPECIAL',
  '마시멜로': 'SPECIAL',
  '빛나래': 'SPECIAL',
  '누브지': 'SPECIAL',
  '스타드림': 'SPECIAL'
};

// ============================================
// SIZE MAPPING (Source -> Standard)
// ============================================
var SIZE_STANDARDS = {
  // ISO 216 sizes
  'A3': { width: 297, height: 420, standard: 'ISO' },
  'A4': { width: 210, height: 297, standard: 'ISO' },
  'A5': { width: 148, height: 210, standard: 'ISO' },
  'A6': { width: 105, height: 148, standard: 'ISO' },

  // JIS sizes
  'B4': { width: 257, height: 364, standard: 'JIS' },
  'B5': { width: 182, height: 257, standard: 'JIS' },

  // Korean sizes
  '국전': { width: 636, height: 939, standard: 'KS' },
  '국전지': { width: 636, height: 939, standard: 'KS' },
  '4x6': { width: 788, height: 1091, standard: 'KS' },
  '46전': { width: 788, height: 1091, standard: 'KS' },

  // Custom sizes
  '명함': { width: 90, height: 50, standard: 'CUSTOM' }
};

// ============================================
// FINISH TYPE MAPPING
// ============================================
var FINISH_TYPE_MAP = {
  // Lamination (LAM)
  '유광 라미네이팅': { category: 'LAM', sub_type: 'GLOSS' },
  '유광코팅': { category: 'LAM', sub_type: 'GLOSS' },
  '무광 라미네이팅': { category: 'LAM', sub_type: 'MATTE' },
  '무광코팅': { category: 'LAM', sub_type: 'MATTE' },
  '벨벳 라미네이팅': { category: 'LAM', sub_type: 'VELVET' },

  // UV Coating (UV)
  'UV코팅': { category: 'UV', sub_type: 'SPOT' },
  '부분UV': { category: 'UV', sub_type: 'SPOT' },
  '전면UV': { category: 'UV', sub_type: 'FULL' },

  // Foil (FOIL)
  '금박': { category: 'FOIL', sub_type: 'GOLD' },
  '금색박': { category: 'FOIL', sub_type: 'GOLD' },
  '은박': { category: 'FOIL', sub_type: 'SILVER' },
  '은색박': { category: 'FOIL', sub_type: 'SILVER' },
  '홀로그램박': { category: 'FOIL', sub_type: 'HOLO' },

  // Embossing (EMB)
  '엠보싱': { category: 'EMB', sub_type: 'STD' },
  '형압': { category: 'EMB', sub_type: 'STD' },

  // Die Cutting (DIE)
  '도무송': { category: 'DIE', sub_type: 'STD' },
  '타공': { category: 'DIE', sub_type: 'PUNCH' },
  '귀도리': { category: 'DIE', sub_type: 'ROUND' }
};

// ============================================
// BINDING TYPE MAPPING
// ============================================
var BINDING_TYPE_MAP = {
  '중철': { type: 'SADDLE', min_pages: 8, max_pages: 64, page_unit: 4, cover_required: false },
  '중철제본': { type: 'SADDLE', min_pages: 8, max_pages: 64, page_unit: 4, cover_required: false },
  '무선': { type: 'PERFECT', min_pages: 48, max_pages: 500, page_unit: 4, cover_required: true },
  '무선제본': { type: 'PERFECT', min_pages: 48, max_pages: 500, page_unit: 4, cover_required: true },
  '떡제본': { type: 'PERFECT', min_pages: 48, max_pages: 500, page_unit: 4, cover_required: true },
  '양장': { type: 'CASE', min_pages: 100, max_pages: 1000, page_unit: 4, cover_required: true },
  '양장제본': { type: 'CASE', min_pages: 100, max_pages: 1000, page_unit: 4, cover_required: true },
  '와이어': { type: 'WIRE', min_pages: 10, max_pages: 200, page_unit: 2, cover_required: false },
  '와이어제본': { type: 'WIRE', min_pages: 10, max_pages: 200, page_unit: 2, cover_required: false },
  '스프링': { type: 'SPIRAL', min_pages: 10, max_pages: 300, page_unit: 2, cover_required: false },
  '스프링제본': { type: 'SPIRAL', min_pages: 10, max_pages: 300, page_unit: 2, cover_required: false },
  'PUR제본': { type: 'PUR', min_pages: 100, max_pages: 800, page_unit: 4, cover_required: true }
};

// ============================================
// GSM VALIDATION RANGES
// ============================================
var GSM_VALIDATION = {
  MIN_GSM: 50,
  MAX_GSM: 500,
  COMMON_VALUES: [80, 100, 120, 150, 180, 200, 250, 300, 350, 400],
  TOLERANCE: 0.05  // 5%
};

// ============================================
// STATUS CODES
// ============================================
var STATUS = {
  ACTIVE: 'A',
  INACTIVE: 'I'
};

// ============================================
// DATETIME FORMATS
// ============================================
var DATETIME_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ss';

// ============================================
// EXPORT FOR TESTS
// ============================================
if (typeof module !== 'undefined') {
  module.exports = {
    MASTER_TABLES: MASTER_TABLES,
    CODE_PATTERNS: CODE_PATTERNS,
    PAPER_TYPE_MAP: PAPER_TYPE_MAP,
    SIZE_STANDARDS: SIZE_STANDARDS,
    FINISH_TYPE_MAP: FINISH_TYPE_MAP,
    BINDING_TYPE_MAP: BINDING_TYPE_MAP,
    GSM_VALIDATION: GSM_VALIDATION,
    STATUS: STATUS,
    DATETIME_FORMAT: DATETIME_FORMAT
  };
}
