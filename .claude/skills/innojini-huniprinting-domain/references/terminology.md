# Printing Terminology Reference

## Contents
- Size Terminology
- Core Formulas
- Standard Paper Sizes
- Finishing Terminology
- Clarification Rules

---

## Size Terminology

| Korean | English | Definition |
|--------|---------|------------|
| 재단사이즈 | Trim Size | Final product dimensions after cutting |
| 작업사이즈 | Document Size | Trim size + bleed area |
| 블리드/도련 | Bleed | Extra area for cutting tolerance (1-3mm) |
| 안전영역 | Safe Zone | Inner area protected from trimming |
| 출력용지규격 | Media Size | Full sheet dimensions |
| 판수 | Pansu/Imposition | Products per full sheet |

---

## Core Formulas

### Work Size Calculation

```
Work Size = Trim Size + (Bleed × 2)

Example: A4 with 3mm bleed
= (210×297) + (3×2)
= 216×303mm
```

### Pansu Calculation

```python
def calculate_pansu(sheet_w, sheet_h, product_w, product_h, bleed=1):
    work_w = product_w + (bleed * 2)
    work_h = product_h + (bleed * 2)
    
    layout1 = (sheet_w // work_w) * (sheet_h // work_h)
    layout2 = (sheet_w // work_h) * (sheet_h // work_w)
    
    return max(layout1, layout2)

# Example: 316×467 sheet, 73×98 product, 1mm bleed → 15
```

---

## Standard Paper Sizes

| Format | Trim Size | Work Size (3mm bleed) |
|--------|-----------|----------------------|
| A4 | 210×297 | 216×303 |
| A3 | 297×420 | 303×426 |
| A5 | 148×210 | 154×216 |
| Business Card | 90×50 | 92×52 (1mm bleed) |

---

## Finishing Terminology

| Korean | English | Description |
|--------|---------|-------------|
| 반칼 | Kiss Cut | Cuts sticker only, backing intact |
| 완칼 | Die Cut | Cuts through all layers |
| 오시 | Scoring | Fold line for paper folding |
| 미싱 | Perforation | Tear-off line |
| 도무송 | Die Cutting | Custom shape cutting |
| 박가공 | Foil Stamping | Metallic foil application |
| 형압 | Embossing | Raised surface texture |
| 코팅 | Coating | Surface protection (matte/glossy) |
| 귀돌이 | Round Corners | Rounded corner cutting |
| 타공 | Hole Punch | Hole punching |

---

## Clarification Rules

### When "사이즈" is mentioned without context

Ask: "Which size do you mean? Trim size (finished) or work size (with bleed)?"

### When "파일크기" appears without unit

- In digital context → Data size (MB)
- In 실사/아크릴 context → Physical dimensions (mm)

### When only numbers appear

Always confirm: unit (mm, cm, px) and context (trim vs work size)
