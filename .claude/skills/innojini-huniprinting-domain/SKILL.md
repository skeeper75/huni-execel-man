---
name: huniprinting-domain
description: Comprehensive printing industry domain skill for analyzing Excel product masters, validating pricing tables, calculating print costs, and ETL data migration. Covers terminology (trim size, bleed, pansu), MES code parsing, color-coded sheet interpretation, formula error detection, quantity discount tiers, cross-file paper name validation, and Excel to JSON/SQLite conversion. Use when working with printing company spreadsheets, auditing price tables, generating quotations, or migrating product catalogs to databases.
---

# Huniprinting Domain Skill

## Overview

This skill provides comprehensive support for printing industry workflows:

1. **Terminology** - Printing terms and disambiguation
2. **Excel Analysis** - Reverse engineering complex spreadsheets
3. **Price Validation** - Detecting formula errors and price inversions
4. **Cross-File Validation** - Paper name matching between master and price files (NEW)
5. **Price Calculation** - Pansu-based pricing with quantity discounts
6. **ETL Pipeline** - Excel to JSON/SQLite conversion

## Quick Reference

### Critical Term: "File Size" Disambiguation

| Context | Meaning | Unit |
|---------|---------|------|
| Digital files | Data volume | MB, GB |
| 실사/아크릴 sheets | Physical dimensions | mm |

**Rule**: In 실사 (large format) and 아크릴 (acrylic), "파일크기" means physical dimensions.

### Core Formula

```
Work Size = Trim Size + (Bleed × 2)
```

### Price Calculation Formula (NEW)

```python
unit_price = (paper_cost / pansu) + print_cost + finishing_cost
final_price = unit_price × (1 - discount_rate) × quantity
```

### MES Code Format

```
[3-digit category]-[4-digit sequence]
Example: 001-0001 (Postcards, item #1)
```

## Workflows

### Workflow 1: Analyze Excel Product Master

```
1. Classify sheets by tab color (Orange=Master, Red=Reference, Green=External)
2. Extract column header colors for field type identification
3. Extract special markers (▶︎=Category, ★=New, ●=Applicable, #=Reference)
4. Map cross-sheet references
5. Generate ERD draft
```

For detailed analysis methodology, see [references/excel-analysis.md](references/excel-analysis.md)

### Workflow 2: Validate Price Table

```
1. Run: python scripts/validate_price_sheet.py pricing.xlsx
2. Check for #REF!, #DIV/0! errors
3. Detect price inversions (qty↑ → price↑)
4. Fix errors and re-validate
```

For validation checklist, see [references/validation-checklist.md](references/validation-checklist.md)

### Workflow 3: Cross-File Paper Name Validation (NEW)

```
1. Extract paper names from master (!디지털인쇄용지 sheet)
2. Extract paper names from price table (디지털용지 sheet)
3. Normalize names (remove ★, expand abbreviations like WH→울트라화이트)
4. Compare and report discrepancies
5. Sync paper names across files
```

For paper name matching rules, see [references/data-flow.md](references/data-flow.md)

### Workflow 4: Calculate Print Price

```python
unit_price = (paper_cost / pansu) + print_cost + finishing_cost
final_price = unit_price * (1 - discount_rate) * quantity
```

For discount tiers and finishing options, see [references/price-calculation.md](references/price-calculation.md)

### Workflow 5: ETL Product Data

```bash
# JSON output
python scripts/etl_pipeline.py master.xlsx -o ./output -f json

# SQLite output
python scripts/etl_pipeline.py master.xlsx -o ./output -f sqlite
```

For ETL details, see [references/etl-guide.md](references/etl-guide.md)

## Special Markers Dictionary

| Marker | Meaning | Example |
|--------|---------|---------|
| ▶︎ | Category header | ▶︎엽서 |
| ★ | New/special item | 투명엽서★ |
| ● | Applicable/enabled | ● = usable |
| # | Reference tag | #엽서, #스티커 |
| ! | Reference data sheet | !디지털인쇄용지 |

## Tab Color Meanings

| Color | Hex | Role |
|-------|-----|------|
| Orange | FFE36C09 | Master/Mapping sheet |
| Red | FFFF0000 | Reference data (edit with caution) |
| Green | FF6AA84F | External channel |
| None | Default | Core product sheets |

## Column Header Color System (NEW)

| Hex Code | Visual | Meaning |
|----------|--------|---------|
| FFC4BD97 | 🟤 Beige | System required field |
| FFD8D8D8 | ⬜ Gray | User option field |
| FF93C47D | 🟢 Light Green | Calculated/internal field |
| FFF6B26B | 🟠 Orange | Feature option |
| FFE06666 | 🔴 Red | Special color print option |
| FFFABF8F | 🟡 Peach | Foil/emboss finishing |
| FF6D9EEB | 🔵 Blue | Quantity configuration |
| FFDAEEF3 | 💙 Light Blue | MAP category header |

For complete color system, see [references/column-color-system.md](references/column-color-system.md)

## Validation Priority

### P0 - Deployment Blockers
- Excel formula errors (#REF!, #DIV/0!)
- Quantity-price inversions
- Negative prices

### P1 - Pre-deployment
- Discount tier boundaries
- Option combination completeness
- **Paper name cross-validation** (NEW)

### P2 - Periodic Monitoring
- Tab color consistency
- Hidden row/column audit

## Reference Documents

- [references/terminology.md](references/terminology.md) - Complete printing terminology
- [references/excel-analysis.md](references/excel-analysis.md) - Excel reverse engineering guide
- [references/huniprinting-structure.md](references/huniprinting-structure.md) - Huniprinting master analysis (ENHANCED)
- [references/validation-checklist.md](references/validation-checklist.md) - Price validation checklist (ENHANCED)
- [references/price-calculation.md](references/price-calculation.md) - Pricing formulas and tiers
- [references/etl-guide.md](references/etl-guide.md) - ETL pipeline documentation
- **[references/data-flow.md](references/data-flow.md)** - Cross-file data flow and paper name matching (NEW)
- **[references/column-color-system.md](references/column-color-system.md)** - Detailed column color coding guide (NEW)

## Scripts

- `scripts/validate_price_sheet.py` - Price table validation
- `scripts/validate_schema.py` - Schema-based validation
- `scripts/etl_pipeline.py` - Excel to JSON/SQLite ETL
- `scripts/validate_paper_names.py` - Cross-file paper name validation (NEW)
- `scripts/validate_tab_colors.py` - Tab color consistency check (NEW)

## Dependencies

```bash
pip install pandas openpyxl
# Optional: pip install pandera
```

## File Naming Convention

```
_후니프린팅_상품마스터_YYMMDD.xlsx   → Product definitions, options, channel mappings
_후니프린팅_인쇄상품_가격표_YYMMDD.xlsx → Pricing tables, discounts, finishing costs
```

## Version History

- **2026-01**: Initial structure analysis, cross-file validation added
- Column color system documented
- Paper name normalization rules established
