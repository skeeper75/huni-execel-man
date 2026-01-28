# Project Structure

## Overview

This project implements a Google Sheets-based price management system using Apps Script for automation.

## Directory Structure

```
huni.excel.man/
├── .moai/                          # MoAI-ADK configuration
│   ├── config/                     # Project settings
│   │   └── sections/               # Modular config files
│   ├── project/                    # Project documentation
│   │   ├── product.md              # Product overview
│   │   ├── structure.md            # This file
│   │   └── tech.md                 # Technology stack
│   └── specs/                      # SPEC documents
│
├── ref/                            # Reference documents
│   ├── 후니프린팅_가격표_분석보고서_260127.md
│   └── 후니프린팅_상품마스터_분석보고서_260127.md
│
├── src/                            # Source code
│   ├── apps-script/                # Google Apps Script code
│   │   ├── Code.gs                 # Main entry point
│   │   ├── MasterDataAgent.gs      # Product/option management
│   │   ├── PriceLookupAgent.gs     # Price query and quotes
│   │   ├── ValidationAgent.gs      # Data validation logic
│   │   ├── Utils.gs                # Shared utilities
│   │   └── Config.gs               # Configuration constants
│   │
│   └── templates/                  # Sheet templates
│       ├── M_ProductMaster.json    # Product master schema
│       ├── M_OptionMaster.json     # Option master schema
│       ├── M_PaperMaster.json      # Paper master schema
│       ├── M_CodeDefinition.json   # Code definition schema
│       └── P_PriceMatrix.json      # Price matrix schema
│
├── docs/                           # Documentation
│   ├── user-guide/                 # End-user documentation
│   │   ├── getting-started.md      # Quick start guide
│   │   ├── price-lookup.md         # How to lookup prices
│   │   └── quote-creation.md       # How to create quotes
│   │
│   └── technical/                  # Technical documentation
│       ├── architecture.md         # System architecture
│       ├── data-model.md           # Data model design
│       └── api-reference.md        # Apps Script API docs
│
├── tests/                          # Test files
│   ├── MasterDataAgent.test.js     # Master data tests
│   ├── PriceLookupAgent.test.js    # Price lookup tests
│   └── ValidationAgent.test.js     # Validation tests
│
├── scripts/                        # Utility scripts
│   ├── deploy.sh                   # Deploy to Google Sheets
│   ├── backup.sh                   # Backup sheet data
│   └── migrate.sh                  # Data migration scripts
│
├── CLAUDE.md                       # AI assistant instructions
├── README.md                       # Project readme
└── .clasp.json                     # clasp deployment config
```

## Google Sheets Structure

### Master Data Sheets (M_)

| Sheet Name | Purpose | Key Columns |
|------------|---------|-------------|
| M_ProductMaster | Product registry | product_code, category_l, category_m, product_name |
| M_OptionMaster | Option definitions | option_code, option_type, option_value |
| M_PaperMaster | Paper specifications | paper_code, paper_name, weight, price_per_sheet |
| M_ProcessMaster | Post-processing types | process_code, process_name, unit_price |
| M_PrintMaster | Print methods | print_code, print_name, base_cost |
| M_SizeMaster | Standard sizes | size_code, size_name, width_mm, height_mm |
| M_CodeDefinition | Code system reference | code_prefix, category, description |

### Price Data Sheets (P_)

| Sheet Name | Purpose | Structure |
|------------|---------|-----------|
| P_DigitalPrint | Digital printing prices | 2D matrix (quantity x paper) |
| P_PostProcess | Post-processing prices | 2D matrix (quantity x process) |
| P_Binding | Binding prices | 2D matrix (quantity x type) |
| P_Sticker | Sticker prices | 2D matrix (quantity x size) |
| P_Acrylic | Acrylic product prices | 2D matrix (quantity x thickness) |
| P_Poster | Poster prices | Multi-table (material types) |
| P_Sign | Signage prices | Multi-table (material types) |
| P_Goods | General goods prices | List format |

### Query/Output Sheets (Q_)

| Sheet Name | Purpose |
|------------|---------|
| Q_PriceLookup | Interactive price lookup interface |
| Q_QuoteSheet | Quote generation template |

### Admin Sheets (A_)

| Sheet Name | Purpose |
|------------|---------|
| A_ChangeLog | Change history tracking |
| A_ValidationResults | Data validation reports |

## Module Responsibilities

### MasterDataAgent.gs
- `createProduct()`: Register new product
- `updateProduct()`: Modify product info
- `searchProduct()`: Find products by criteria
- `manageOption()`: CRUD for options
- `generateCode()`: Auto-generate product codes

### PriceLookupAgent.gs
- `getUnitPrice()`: Lookup price by product/option/quantity
- `calculateTotal()`: Calculate total for product list
- `createQuote()`: Generate formatted quote
- `comparePrices()`: Compare prices across quantities
- `recommendQuantity()`: Suggest optimal order quantity

### ValidationAgent.gs
- `validateData()`: Check data integrity
- `checkPriceLogic()`: Verify pricing rules
- `logChange()`: Record modifications
- `compareVersion()`: Diff between versions
- `generateReport()`: Create validation report
