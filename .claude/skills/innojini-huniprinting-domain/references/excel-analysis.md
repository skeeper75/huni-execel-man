# Excel Reverse Engineering Guide

## Contents
- Core Principle
- Analysis Framework
- Practical Techniques
- Output Checklist
- Guidelines

---

## Core Principle

> **Absolute rule**: Original data represents years of domain expertise.
> Column names, colors, markers, and layout all carry meaning.
> Focus on **understanding**, not modification.

---

## Analysis Framework

### Phase 1: Initial Scan

Extract these elements first:
- Sheet names and tab colors
- Sheet dimensions (rows × columns)
- Column headers and their colors
- Data type distribution
- Hidden sheets/rows/columns

### Phase 2: Structure Analysis

| Element | Question | Inference |
|---------|----------|-----------|
| Tab color | Why this color? | Role/priority |
| Column color | Why different? | Required/optional/calculated |
| Special markers | Why this symbol? | Internal convention |
| Empty columns | Why empty? | Structural separator |
| Merged cells | Why merged? | Grouping/hierarchy |

### Phase 3: Meaning Inference

Common color conventions (financial modeling standard):
- Blue: Input values, assumptions
- Black: Formulas, calculations
- Green: Cross-sheet references
- Red: External links

### Phase 4: Relationship Mapping

1. Identify entity (table) candidates
2. Infer primary/foreign keys
3. Extract referential integrity rules
4. Generate ERD draft

### Phase 5: Validation

1. Verify inferred formulas
2. Check referential integrity
3. Detect edge cases
4. Generate development guide

---

## Practical Techniques

### Color Extraction

```python
from openpyxl import load_workbook

wb = load_workbook('file.xlsx')
ws = wb.active

for row in ws.iter_rows():
    for cell in row:
        if cell.fill.fgColor:
            color = cell.fill.fgColor.rgb
            print(f"{cell.coordinate}: {color}")
```

### Cross-Sheet Reference Detection

```python
def find_cross_refs(workbook):
    refs = []
    for sheet in workbook.sheetnames:
        ws = workbook[sheet]
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and '!' in str(cell.value):
                    refs.append((sheet, cell.coordinate, cell.value))
    return refs
```

### Special Marker Detection

```python
MARKERS = ['▶', '★', '●', '#', '!', '※', '→']

def detect_markers(text):
    found = []
    for marker in MARKERS:
        if marker in str(text):
            found.append(marker)
    return found
```

### Formula Dependency Analysis

```python
from openpyxl import load_workbook

wb = load_workbook('file.xlsx')
ws = wb.active

for row in ws.iter_rows():
    for cell in row:
        if cell.data_type == 'f':  # Formula
            print(f"{cell.coordinate}: {cell.value}")
```

---

## Output Checklist

Required outputs:
- [ ] Sheet role classification table
- [ ] Data flow diagram
- [ ] Special marker dictionary
- [ ] Column mapping table
- [ ] Validated calculation formulas
- [ ] ERD draft
- [ ] Terminology glossary

---

## Guidelines

**DO**:
- Question every anomaly: "Why?"
- Form hypotheses and verify them
- Infer meaning as if conversing with the author
- Respect original data structure
- Mark uncertain parts explicitly

**DON'T**:
- Arbitrarily rename columns
- Suggest "this would be cleaner"
- Ignore color/marker information
- Extract data without context
- Force normalization against author's intent
