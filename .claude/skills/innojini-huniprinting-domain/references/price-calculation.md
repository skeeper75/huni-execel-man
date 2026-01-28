# Price Calculation Reference

## Contents
- Core Formulas
- Quantity Discount Tiers
- Finishing Options
- Digital vs Offset Breakeven
- Quotation Generation

---

## Core Formulas

### Basic Unit Price

```
Unit Price = (Paper Cost / Pansu) + Print Cost + Finishing Cost
```

| Variable | Description | Example |
|----------|-------------|---------|
| Paper Cost | Cost per full sheet | ₩500/sheet |
| Pansu | Products per sheet | 15 pieces |
| Print Cost | Per-piece printing | ₩50/piece |
| Finishing Cost | Per-piece finishing | ₩10/piece |

### Complete Calculation

```python
def calculate_total_price(
    paper_cost,      # Paper cost per full sheet
    pansu,           # Products per sheet
    print_cost,      # Per-piece printing cost
    finishing_cost,  # Per-piece finishing cost
    quantity,        # Order quantity
    margin=0.30      # Margin rate (30%)
):
    # 1. Base unit cost
    unit_cost = (paper_cost / pansu) + print_cost + finishing_cost
    
    # 2. Apply margin
    unit_price = unit_cost / (1 - margin)
    
    # 3. Apply quantity discount
    discount_rate = get_discount_rate(quantity)
    discounted_price = unit_price * (1 - discount_rate)
    
    # 4. Calculate total
    total = discounted_price * quantity
    
    # 5. Round to 10-unit
    total = round(total / 10) * 10
    
    return total
```

---

## Quantity Discount Tiers

### Standard Structure

| Quantity | Discount |
|----------|----------|
| 1-9 | 0% |
| 10-49 | 3% |
| 50-99 | 6% |
| 100-499 | 10% |
| 500-999 | 15% |
| 1000+ | 20% |

### Implementation

```python
DISCOUNT_TIERS = [
    (1, 9, 0.00),
    (10, 49, 0.03),
    (50, 99, 0.06),
    (100, 499, 0.10),
    (500, 999, 0.15),
    (1000, float('inf'), 0.20),
]

def get_discount_rate(quantity):
    for min_qty, max_qty, rate in DISCOUNT_TIERS:
        if min_qty <= quantity <= max_qty:
            return rate
    return 0.0
```

---

## Finishing Options

### Price Table

| Finishing | Basis | Base Price | Notes |
|-----------|-------|------------|-------|
| Matte coating | Per side | ₩5 | Both sides = ×2 |
| Gloss coating | Per side | ₩5 | Both sides = ×2 |
| Gold foil | Per area | ₩100 | Per location |
| Silver foil | Per area | ₩100 | Per location |
| Embossing | Per area | ₩80 | |
| Round corners | Per corner | ₩10 | 4 corners = ×4 |
| Hole punch | Per hole | ₩20 | |
| Scoring | Per line | ₩15 | |
| Perforation | Per line | ₩20 | |
| Die cut (simple) | Per piece | ₩50 | |
| Die cut (complex) | Per piece | ₩200 | Die fee separate |

### Compound Calculation

```python
FINISHING_PRICES = {
    'coating_matte': 5,
    'coating_glossy': 5,
    'foil_gold': 100,
    'foil_silver': 100,
    'emboss': 80,
    'round_corner': 10,
    'hole_punch': 20,
    'scoring': 15,
    'perforation': 20,
    'die_cut_simple': 50,
    'die_cut_complex': 200,
}

def calculate_finishing_cost(options):
    """options: dict of {option: count_or_bool}"""
    total = 0
    for option, value in options.items():
        if option in FINISHING_PRICES:
            if isinstance(value, bool) and value:
                total += FINISHING_PRICES[option]
            elif isinstance(value, (int, float)):
                total += FINISHING_PRICES[option] * value
    return total

# Example: Both sides matte + 4 corners + 1 hole
cost = calculate_finishing_cost({
    'coating_matte': 2,
    'round_corner': 4,
    'hole_punch': 1
})
# → 5×2 + 10×4 + 20×1 = ₩70/piece
```

---

## Digital vs Offset Breakeven

### Calculation

```python
def calculate_breakeven(
    digital_click_cost,  # Digital per-click cost
    offset_plate_cost,   # Offset plate setup cost
    paper_cost,          # Paper cost per sheet
    pansu                # Products per sheet
):
    offset_unit = paper_cost / pansu
    
    if digital_click_cost <= offset_unit:
        return float('inf')  # Digital always cheaper
    
    bep = offset_plate_cost / (digital_click_cost - offset_unit)
    return int(bep)

# Example
bep = calculate_breakeven(
    digital_click_cost=50,
    offset_plate_cost=50000,
    paper_cost=500,
    pansu=15
)
# → ~1136 pieces
```

### Decision Rule

- Below breakeven → Digital printing
- Above breakeven → Offset printing

---

## Quotation Generation

```python
def generate_quotation(product_config, quantities=[100, 500, 1000]):
    quotation = {
        'product': product_config['name'],
        'spec': product_config['spec'],
        'items': []
    }
    
    for qty in quantities:
        total = calculate_total_price(
            paper_cost=product_config['paper_cost'],
            pansu=product_config['pansu'],
            print_cost=product_config['print_cost'],
            finishing_cost=product_config['finishing_cost'],
            quantity=qty
        )
        
        quotation['items'].append({
            'quantity': qty,
            'total': total,
            'unit_price': round(total / qty)
        })
    
    return quotation

# Example
config = {
    'name': 'Premium Postcard',
    'spec': '102×152mm / Snow 250g / Both color / Matte',
    'paper_cost': 500,
    'pansu': 8,
    'print_cost': 50,
    'finishing_cost': 10
}

quote = generate_quotation(config)
```
