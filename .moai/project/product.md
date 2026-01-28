# Huni Printing Price Management System

## Project Overview

**Project Name**: huni.excel.man (Huni Excel Manager)
**Domain**: Print Shop Price and Product Data Management
**Target Users**: Huni Printing internal staff (sales, production, management)

## Problem Statement

Current price management using Google Sheets suffers from:

1. **Data Inconsistency**: Different header positions and column names across 18+ sheets
2. **Code System Chaos**: Mixed English/Korean codes, duplicate code/ID usage
3. **Maintenance Burden**: Same product data scattered across multiple sheets
4. **No Validation**: Free text input leads to typos and naming inconsistencies
5. **Automation Barriers**: Unpredictable data locations prevent VLOOKUP automation

## Solution

Build an integrated price management system with three core components:

### 1. Master Data Agent
- Unified product/option/code management
- Automatic code generation (format: `[Category]_[SubCat]_[Sequence]`)
- Standardized table structure (Row 1: Header, Row 2+: Data)

### 2. Price Lookup Agent
- Unit price lookup by product/option/quantity
- Quote generation with total calculation
- Price comparison and optimal quantity recommendation

### 3. Validation Agent
- Data integrity checks (required fields, data types, FK references)
- Price logic validation (quantity up = price down rule)
- Change history logging with rollback capability

## Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Product Master | Unified product registry with standardized codes | High |
| Price Matrix | Quantity-based pricing with option combinations | High |
| Quote Generator | Automated quote creation from product selection | High |
| Data Validation | Real-time input validation and error detection | Medium |
| Change Log | Automatic change history tracking | Medium |
| Dashboard | Product status and price monitoring | Low |

## Expected Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Price Lookup | 3-5 min | 10 sec | 95% faster |
| Quote Creation | 20 min | 3 min | 85% faster |
| Price Update | 30 min | 5 min | 83% faster |
| Data Error Rate | 5% | 0.1% | 98% reduction |

## Target Products

Based on current sheet analysis:

- **Digital Printing**: Postcards, flyers, brochures
- **Stickers**: Half-cut, free-form, shaped
- **Booklets**: Saddle stitch, perfect binding, twin ring, PUR
- **Photo Products**: Photo books, calendars
- **Goods**: Acrylic, mugs, coasters, mirrors
- **Signage**: Posters, banners, PET/mesh signs

## Success Criteria

1. Single source of truth for all product data
2. 100% automated price lookup (no manual calculation)
3. Zero duplicate product entries
4. Complete change history for audit trail
5. User-friendly interface requiring minimal training
