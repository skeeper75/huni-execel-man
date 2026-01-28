# Technology Stack

## Overview

This project uses Google Workspace ecosystem for seamless integration with existing business processes.

## Core Technologies

### Platform
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Spreadsheet | Google Sheets | Latest | Data storage and UI |
| Backend | Google Apps Script | V8 Runtime | Business logic |
| Deployment | clasp | 2.x | Code management |

### Development Tools
| Tool | Purpose |
|------|---------|
| clasp | Google Apps Script CLI for local development |
| Node.js | Local development environment |
| TypeScript | Type-safe Apps Script development (optional) |
| ESLint | Code quality |
| Prettier | Code formatting |

## Architecture Pattern

### Agent-Based Design

```
┌─────────────────────────────────────────────────────────┐
│                   Price Management System                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Master     │  │   Price      │  │  Validation  │   │
│  │   Data       │  │   Lookup     │  │   Agent      │   │
│  │   Agent      │  │   Agent      │  │              │   │
│  │              │  │              │  │              │   │
│  │ • Product    │  │ • Lookup     │  │ • Integrity  │   │
│  │ • Option     │  │ • Quote      │  │ • Logic      │   │
│  │ • Code       │  │ • Compare    │  │ • History    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
│         └─────────────────┼─────────────────┘            │
│                           │                              │
│              ┌────────────▼────────────┐                 │
│              │    Data Layer           │                 │
│              │   (Google Sheets)       │                 │
│              └─────────────────────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Google Apps Script Features Used

### Spreadsheet Service
- `SpreadsheetApp.getActiveSpreadsheet()` - Access current spreadsheet
- `sheet.getDataRange()` - Read all data
- `sheet.getRange().setValues()` - Write data
- `sheet.getRange().setDataValidation()` - Add dropdowns

### Triggers
- `onEdit(e)` - Track cell changes for logging
- `onOpen(e)` - Add custom menus
- Time-driven triggers - Scheduled validation

### UI Services
- `SpreadsheetApp.getUi()` - Custom menus and dialogs
- `HtmlService` - Custom sidebar/dialog UI
- `toast()` - User notifications

## Data Model

### Product Code Schema
```
Format: [CAT]_[SUBCAT]_[SEQ]

Examples:
- DIG_PAPER_0001  → Digital Print, Paper, #0001
- STK_HALF_0001   → Sticker, Half-cut, #0001
- BIND_SADDLE_001 → Binding, Saddle stitch, #001
```

### Category Codes
| Code | Category (Korean) | Category (English) |
|------|-------------------|-------------------|
| DIG | 디지털인쇄 | Digital Print |
| STK | 스티커 | Sticker |
| BIND | 제본 | Binding |
| POST | 후가공 | Post-processing |
| GOODS | 굿즈 | Goods |
| SIGN | 사인물 | Signage |
| PHOTO | 포토상품 | Photo Products |

### Price Table Schema
```javascript
{
  price_id: "P001",           // Unique ID
  product_code: "DIG_FLY_001", // FK to Product
  option_set: "A4_WHITE_100G", // Option combination
  qty_from: 100,              // Quantity range start
  qty_to: 499,                // Quantity range end
  unit_price: 150,            // Price per unit
  effective_from: "2026-01-01", // Valid from
  effective_to: "2026-12-31"   // Valid until
}
```

## Key Formulas

### Price Lookup (INDEX-MATCH)
```
=INDEX(PriceTable,
  MATCH(1,
    (ProductCode=A2)*(Option=B2)*(Qty>=C2)*(Qty<=D2),
    0),
  5)
```

### Dependent Dropdown (INDIRECT)
```
=INDIRECT(CONCATENATE("CAT_",A2))
```

### Auto Code Generation
```
=CONCATENATE(B2,"-",C2,"-",TEXT(MAXIFS($A:$A,$B:$B,B2,$C:$C,C2)+1,"0000"))
```

## Development Setup

### Prerequisites
1. Google Account with Sheets access
2. Node.js 18+ installed
3. clasp CLI installed globally

### Local Development
```bash
# Install clasp
npm install -g @google/clasp

# Login to Google
clasp login

# Clone existing project
clasp clone <scriptId>

# Or create new project
clasp create --type sheets --title "Huni Price Manager"

# Push local changes
clasp push

# Pull remote changes
clasp pull
```

### Project Configuration (.clasp.json)
```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./src/apps-script",
  "fileExtension": "gs"
}
```

## Deployment Strategy

### Development Flow
1. Local development with clasp
2. Push to development spreadsheet
3. Test with sample data
4. Deploy to production spreadsheet

### Version Control
- Git for source code
- Apps Script versioning for deployed code
- Sheet backup before major changes

## Security Considerations

### Access Control
- Sheet protection for master data
- Role-based editing permissions
- Audit trail via change log

### Data Validation
- Server-side validation in Apps Script
- Client-side validation via Data Validation rules
- Required field enforcement

## Performance Optimization

### Batch Operations
- Use `getValues()`/`setValues()` for bulk operations
- Minimize `getRange()` calls
- Cache frequently accessed data

### Indexing Strategy
- Named ranges for common lookups
- Sorted data for binary search
- Pre-computed lookup tables
