# TOON 변환 예시

## 1. 균일 객체 배열 (최적 케이스)

### JSON (원본)
```json
{
  "employees": [
    {"id": 1, "name": "김철수", "dept": "개발팀", "salary": 5000},
    {"id": 2, "name": "이영희", "dept": "디자인팀", "salary": 4500},
    {"id": 3, "name": "박민수", "dept": "개발팀", "salary": 5500}
  ]
}
```

### TOON (변환)
```toon
employees[3]{id,name,dept,salary}:
  1,김철수,개발팀,5000
  2,이영희,디자인팀,4500
  3,박민수,개발팀,5500
```

**토큰 절감: ~55%**

---

## 2. 인쇄 견적 단가표 (실제 스킬 적용)

### JSON (원본)
```json
{
  "binding_prices": [
    {"qty_min": 1, "qty_max": 3, "unit_price": 3000},
    {"qty_min": 4, "qty_max": 9, "unit_price": 2000},
    {"qty_min": 10, "qty_max": 29, "unit_price": 1000},
    {"qty_min": 30, "qty_max": 69, "unit_price": 700},
    {"qty_min": 70, "qty_max": 99, "unit_price": 500},
    {"qty_min": 100, "qty_max": 9999, "unit_price": 500}
  ],
  "discount_rates": [
    {"qty_min": 10, "qty_max": 49, "rate": 0.03},
    {"qty_min": 50, "qty_max": 99, "rate": 0.06},
    {"qty_min": 100, "qty_max": 499, "rate": 0.10},
    {"qty_min": 500, "qty_max": 999, "rate": 0.15},
    {"qty_min": 1000, "qty_max": 99999, "rate": 0.20}
  ]
}
```

### TOON (변환)
```toon
binding_prices[6]{qty_min,qty_max,unit_price}:
  1,3,3000
  4,9,2000
  10,29,1000
  30,69,700
  70,99,500
  100,9999,500
discount_rates[5]{qty_min,qty_max,rate}:
  10,49,0.03
  50,99,0.06
  100,499,0.10
  500,999,0.15
  1000,99999,0.20
```

**토큰 절감: ~60%**

---

## 3. API 엔드포인트 목록

### JSON
```json
{
  "endpoints": [
    {"method": "GET", "path": "/api/orders", "auth": true, "desc": "주문 목록"},
    {"method": "POST", "path": "/api/orders", "auth": true, "desc": "주문 생성"},
    {"method": "GET", "path": "/api/products", "auth": false, "desc": "상품 목록"}
  ]
}
```

### TOON
```toon
endpoints[3]{method,path,auth,desc}:
  GET,/api/orders,true,주문 목록
  POST,/api/orders,true,주문 생성
  GET,/api/products,false,상품 목록
```

---

## 4. 중첩 구조 (비권장 케이스)

### JSON
```json
{
  "config": {
    "database": {
      "host": "localhost",
      "port": 5432,
      "credentials": {
        "user": "admin",
        "pass": "secret"
      }
    }
  }
}
```

### TOON
```toon
config:
  database:
    host: localhost
    port: 5432
    credentials:
      user: admin
      pass: secret
```

**참고**: 깊은 중첩에서는 JSON compact가 더 효율적일 수 있음

---

## 5. 혼합 배열 (리스트 형식)

### JSON
```json
{
  "items": [
    {"type": "text", "value": "hello"},
    {"type": "number", "value": 42, "format": "int"},
    {"type": "bool", "value": true}
  ]
}
```

### TOON
```toon
items[3]:
  - type: text
    value: hello
  - type: number
    value: 42
    format: int
  - type: bool
    value: true
```

---

## 6. 마크다운 테이블 → TOON

### 마크다운 (원본)
```markdown
| 용지 | 평량 | 두께 |
|-----|------|-----|
| 모조지 | 100g | 0.10mm |
| 아트지 | 120g | 0.10mm |
| 스노우지 | 150g | 0.13mm |
```

### TOON (변환)
```toon
papers[3]{용지,평량,두께}:
  모조지,100g,0.10mm
  아트지,120g,0.10mm
  스노우지,150g,0.13mm
```

---

## 7. CSV → TOON

### CSV (원본)
```csv
sku,name,price,stock
A001,위젯,9900,150
A002,가젯,14500,80
A003,도구,7500,200
```

### TOON (변환)
```toon
products[3]{sku,name,price,stock}:
  A001,위젯,9900,150
  A002,가젯,14500,80
  A003,도구,7500,200
```

---

## 효율성 가이드

| 데이터 패턴 | JSON 토큰 | TOON 토큰 | 절감률 |
|------------|----------|----------|-------|
| 균일 객체 배열 (10행) | ~150 | ~60 | **60%** |
| 균일 객체 배열 (100행) | ~1500 | ~550 | **63%** |
| 단순 키-값 객체 | ~30 | ~25 | 17% |
| 깊은 중첩 (3레벨) | ~80 | ~85 | -6% ❌ |
| 비균일 배열 | ~100 | ~110 | -10% ❌ |
