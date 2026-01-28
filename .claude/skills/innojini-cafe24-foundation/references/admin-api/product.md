# Cafe24 Admin API - Product 도메인

상품, 옵션, 재고, 이미지 관련 API (22개 리소스)

## 주요 엔드포인트

### 상품 조회

#### GET /products
상품 목록 조회

**파라미터:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| shop_no | int | ❌ | 멀티쇼핑몰 번호 (기본값: 1) |
| product_no | string | ❌ | 상품번호 (콤마 구분, 최대 100개) |
| product_code | string | ❌ | 상품코드 |
| product_name | string | ❌ | 상품명 검색 |
| category | int | ❌ | 카테고리 번호 |
| brand_code | string | ❌ | 브랜드 코드 |
| manufacturer_code | string | ❌ | 제조사 코드 |
| supplier_code | string | ❌ | 공급사 코드 |
| display | string | ❌ | 진열상태 (T/F) |
| selling | string | ❌ | 판매상태 (T/F) |
| product_condition | string | ❌ | 상품 상태 (N: 신상품, B: 반품, R: 재고, U: 중고, E: 전시, F: 리퍼) |
| custom_product_code | string | ❌ | 자체 상품코드 |
| price_min | int | ❌ | 최소 가격 |
| price_max | int | ❌ | 최대 가격 |
| embed | string | ❌ | 추가 조회 (variants, inventories, options, images, discountprice) |
| limit | int | ❌ | 조회 개수 (최대 100) |
| offset | int | ❌ | 시작 위치 |

**응답:**
```json
{
  "products": [
    {
      "shop_no": 1,
      "product_no": 123,
      "product_code": "P000000A",
      "product_name": "샘플 상품",
      "display": "T",
      "selling": "T",
      "price": "50000.00",
      "retail_price": "60000.00",
      "supply_price": "30000.00",
      "created_date": "2024-01-01T00:00:00+09:00",
      "updated_date": "2024-12-01T00:00:00+09:00",
      "variants": [...],
      "options": [...],
      "images": [...]
    }
  ]
}
```

#### GET /products/{product_no}
상품 상세 조회

#### POST /products
상품 등록

**요청:**
```json
{
  "shop_no": 1,
  "product": {
    "product_name": "새 상품",
    "product_code": "P000000B",
    "price": "50000.00",
    "retail_price": "60000.00",
    "supply_price": "30000.00",
    "display": "T",
    "selling": "T",
    "description": "<p>상품 상세 설명</p>",
    "category": [{"category_no": 1}],
    "options": [...],
    "variants": [...]
  }
}
```

#### PUT /products/{product_no}
상품 수정

#### DELETE /products/{product_no}
상품 삭제

### 재고 관리

#### GET /products/{product_no}/inventories
상품 재고 조회

**응답:**
```json
{
  "inventories": [
    {
      "shop_no": 1,
      "variant_code": "P000000A000A",
      "quantity": 100,
      "safety_inventory": 10,
      "use_inventory": "T"
    }
  ]
}
```

#### PUT /products/{product_no}/inventories
재고 수정

**요청:**
```json
{
  "shop_no": 1,
  "inventory": {
    "variant_code": "P000000A000A",
    "quantity": 50
  }
}
```

### 품목 (Variants)

#### GET /products/{product_no}/variants
품목 목록 조회

**응답:**
```json
{
  "variants": [
    {
      "shop_no": 1,
      "variant_code": "P000000A000A",
      "options": [
        {"option_name": "색상", "option_value": "빨강"},
        {"option_name": "사이즈", "option_value": "M"}
      ],
      "additional_amount": "0.00",
      "quantity": 100,
      "display": "T",
      "selling": "T"
    }
  ]
}
```

#### POST /products/{product_no}/variants
품목 추가

#### PUT /products/{product_no}/variants/{variant_code}
품목 수정

#### DELETE /products/{product_no}/variants/{variant_code}
품목 삭제

### 옵션 관리

#### GET /products/{product_no}/options
옵션 조회

**응답:**
```json
{
  "options": [
    {
      "option_name": "색상",
      "option_type": "T",
      "option_values": ["빨강", "파랑", "노랑"]
    },
    {
      "option_name": "사이즈",
      "option_type": "T",
      "option_values": ["S", "M", "L", "XL"]
    }
  ]
}
```

옵션 타입:
- T: 조합형 (텍스트)
- S: 분리형
- E: 연동형
- C: 색상

#### PUT /products/{product_no}/options
옵션 수정

### 이미지 관리

#### GET /products/{product_no}/images
이미지 조회

**응답:**
```json
{
  "images": [
    {
      "shop_no": 1,
      "image_no": 1,
      "big_image": "https://img.cafe24.com/...",
      "medium_image": "https://img.cafe24.com/...",
      "small_image": "https://img.cafe24.com/...",
      "detail_image": "https://img.cafe24.com/...",
      "sort": 1
    }
  ]
}
```

#### POST /products/{product_no}/images
이미지 등록

#### PUT /products/{product_no}/images/{image_no}
이미지 수정

#### DELETE /products/{product_no}/images/{image_no}
이미지 삭제

### 상품 할인가

#### GET /products/{product_no}/discountprice
할인가 조회

#### PUT /products/{product_no}/discountprice
할인가 수정

## 상품 상태 코드

| 코드 | 상태 | 설명 |
|------|------|------|
| N | 신상품 | 새 상품 |
| B | 반품 | 반품 상품 |
| R | 재고 | 재고 상품 |
| U | 중고 | 중고 상품 |
| E | 전시 | 전시 상품 |
| F | 리퍼 | 리퍼비시 상품 |

## 상품 승인 상태

| 코드 | 상태 |
|------|------|
| N | 승인대기 |
| Y | 승인완료 |
| R | 승인거부 |
| C | 승인취소 |
| E | 수정대기 |

## Embed 파라미터

| 값 | 포함 데이터 |
|----|-----------|
| variants | 품목 목록 |
| inventories | 재고 정보 |
| options | 옵션 정보 |
| images | 이미지 목록 |
| discountprice | 할인가 정보 |
| hits | 조회수 |
| seo | SEO 정보 |

**사용 예시:**
```
GET /products/{product_no}?embed=variants,inventories,options,images
```

## 대량 처리

### 일괄 재고 수정

```json
PUT /products/inventories

{
  "shop_no": 1,
  "inventories": [
    {"variant_code": "P000000A000A", "quantity": 100},
    {"variant_code": "P000000A000B", "quantity": 50},
    {"variant_code": "P000000A000C", "quantity": 30}
  ]
}
```

### 일괄 진열/판매 상태 변경

```json
PUT /products

{
  "shop_no": 1,
  "products": [
    {"product_no": 123, "display": "T", "selling": "T"},
    {"product_no": 124, "display": "F", "selling": "F"}
  ]
}
```

## 상품 복사

```json
POST /products/{product_no}/copy

{
  "shop_no": 1,
  "product_name": "복사된 상품",
  "product_code": "P000000C"
}
```
