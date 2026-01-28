# ETL Pipeline Guide

## Contents
- Pipeline Overview
- Extract Phase
- Transform Phase
- Load Phase
- Validation
- CLI Usage

---

## Pipeline Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Extract   │ ──► │  Transform  │ ──► │    Load     │
│ Read Excel  │     │ Normalize   │     │ Save JSON/DB│
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
 Sheet DataFrames    Entity separation   File creation
 Parse markers       Generate keys       Index setup
 Extract colors      Validation rules    Change logging
```

---

## Extract Phase

### Workbook Extraction

```python
from openpyxl import load_workbook
import pandas as pd

def extract_workbook(filepath):
    wb = load_workbook(filepath)
    
    extracted = {
        'sheets': {},
        'metadata': {
            'filename': filepath,
            'sheet_count': len(wb.sheetnames),
            'tab_colors': {}
        }
    }
    
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        
        # Tab color
        if ws.sheet_properties.tabColor:
            extracted['metadata']['tab_colors'][sheet_name] = \
                ws.sheet_properties.tabColor.rgb
        
        # DataFrame
        df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
        
        extracted['sheets'][sheet_name] = {
            'data': df,
            'shape': df.shape,
            'header_row': detect_header_row(df)
        }
    
    return extracted
```

### MES Code Parsing

```python
import re

def parse_mes_code(code):
    if not code:
        return None
    
    pattern = r'^(\d{3})-(\d{4})$'
    match = re.match(pattern, str(code).strip())
    
    if match:
        return {
            'full_code': str(code).strip(),
            'category': match.group(1),
            'sequence': match.group(2)
        }
    return None
```

### Marker Parsing

```python
MARKERS = {
    '▶︎': 'category_header',
    '★': 'new_product',
    '●': 'applicable',
    '#': 'reference_tag',
}

def parse_markers(value):
    if not isinstance(value, str):
        return {'value': value, 'markers': []}
    
    markers = []
    clean_value = value
    
    for marker, meaning in MARKERS.items():
        if marker in value:
            markers.append(meaning)
            clean_value = clean_value.replace(marker, '').strip()
    
    return {
        'value': clean_value,
        'markers': markers,
        'original': value
    }
```

---

## Transform Phase

### Entity Separation

| Entity | Source Sheet | Description |
|--------|-------------|-------------|
| papers | !디지털인쇄용지 | Paper master |
| categories | MAP | Category hierarchy |
| products | Product sheets | Product master |
| processes | MES품목(공정) | Process definitions |
| channels | Channel sheets | Channel mappings |

### Reference Creation

```python
def create_references(entities):
    # Paper name → ID mapping
    paper_map = {p['name']: p['paper_id'] for p in entities['papers']}
    
    # Link products to papers
    for product in entities['products']:
        paper_name = product.get('paper')
        if paper_name and paper_name in paper_map:
            product['paper_id'] = paper_map[paper_name]
        else:
            product['paper_id'] = None
    
    return entities
```

---

## Load Phase

### JSON Output

```python
import json
from datetime import datetime

def export_to_json(entities, output_dir):
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    outputs = {}
    
    for entity_name in ['papers', 'categories', 'products']:
        data = entities.get(entity_name, [])
        filename = f"{output_dir}/{entity_name}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        outputs[entity_name] = {
            'filename': filename,
            'record_count': len(data)
        }
    
    return outputs
```

### SQLite Output

```sql
CREATE TABLE papers (
    paper_id TEXT PRIMARY KEY,
    name TEXT,
    gram TEXT,
    full_sheet_size TEXT,
    price REAL
);

CREATE TABLE products (
    mes_code TEXT PRIMARY KEY,
    name TEXT,
    category_code TEXT,
    paper_id TEXT REFERENCES papers(paper_id),
    source_sheet TEXT,
    size_option TEXT,
    bleed REAL,
    pansu INTEGER,
    is_new INTEGER
);
```

---

## Validation

### Rules

```python
def validate_entities(entities):
    errors = []
    warnings = []
    
    # MES code format
    for product in entities['products']:
        if not parse_mes_code(product['mes_code']):
            errors.append({
                'type': 'INVALID_MES_CODE',
                'product': product.get('name'),
                'value': product['mes_code']
            })
    
    # Duplicate MES codes
    mes_codes = [p['mes_code'] for p in entities['products']]
    duplicates = [c for c in set(mes_codes) if mes_codes.count(c) > 1]
    for dup in duplicates:
        warnings.append({
            'type': 'DUPLICATE_MES_CODE',
            'value': dup
        })
    
    # Paper reference integrity
    paper_ids = {p['paper_id'] for p in entities['papers']}
    for product in entities['products']:
        pid = product.get('paper_id')
        if pid and pid not in paper_ids:
            warnings.append({
                'type': 'ORPHAN_PAPER_REF',
                'product': product.get('name')
            })
    
    return {
        'errors': errors,
        'warnings': warnings,
        'valid': len(errors) == 0
    }
```

---

## CLI Usage

### Basic Commands

```bash
# JSON output
python scripts/etl_pipeline.py master.xlsx -o ./output -f json

# SQLite output
python scripts/etl_pipeline.py master.xlsx -o ./output -f sqlite

# Both formats
python scripts/etl_pipeline.py master.xlsx -o ./output -f both

# Validation only
python scripts/etl_pipeline.py master.xlsx --validate-only

# Specific sheets
python scripts/etl_pipeline.py master.xlsx --sheets "디지털인쇄,스티커"
```

### Output Structure

```
output/
├── papers.json
├── categories.json
├── products.json
├── products.db (if --format sqlite)
└── export_meta.json
```
