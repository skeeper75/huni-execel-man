# Cafe24 Front API

고객용 API - 인증 불필요 (~20개 리소스)

## 개요

Front API는 쇼핑몰 프론트엔드에서 사용하는 API입니다.
- **인증 불필요**: OAuth 토큰 없이 호출 가능
- **읽기 전용**: 대부분 GET 요청만 지원
- **CORS 지원**: 브라우저에서 직접 호출 가능

## Base URL

```
https://{mall_id}.cafe24api.com/api/v2/
```

## 버전 헤더

```
X-Cafe24-Api-Version: 2024-06-01
```

---

## Category API

### GET /categories
카테고리 목록 조회

**파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| shop_no | int | 멀티쇼핑몰 번호 |
| category_depth | int | 카테고리 깊이 (1-4) |
| parent_category_no | int | 상위 카테고리 번호 |

**응답:**
```json
{
  "categories": [
    {
      "category_no": 1,
      "category_name": "의류",
      "parent_category_no": 0,
      "category_depth": 1,
      "full_category_name": "의류"
    }
  ]
}
```

### GET /categories/{category_no}
카테고리 상세 조회

---

## Product API

### GET /products
상품 목록 조회

**파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| shop_no | int | 멀티쇼핑몰 번호 |
| product_no | string | 상품번호 (콤마 구분) |
| category | int | 카테고리 번호 |
| product_name | string | 상품명 검색 |
| price_min | int | 최소 가격 |
| price_max | int | 최대 가격 |
| sort | string | 정렬 (created_date, price, product_name) |
| order | string | 정렬 방향 (asc, desc) |
| limit | int | 조회 개수 (최대 100) |
| offset | int | 시작 위치 |

**응답:**
```json
{
  "products": [
    {
      "shop_no": 1,
      "product_no": 123,
      "product_code": "P000000A",
      "product_name": "샘플 상품",
      "price": "50000.00",
      "retail_price": "60000.00",
      "detail_image": "https://img.cafe24.com/...",
      "list_image": "https://img.cafe24.com/...",
      "tiny_image": "https://img.cafe24.com/...",
      "options": [...],
      "variants": [...]
    }
  ]
}
```

### GET /products/{product_no}
상품 상세 조회

### GET /products/{product_no}/variants
품목 목록 조회

**응답:**
```json
{
  "variants": [
    {
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

### GET /products/{product_no}/options
옵션 조회

### GET /products/{product_no}/images
이미지 조회

### GET /products/{product_no}/reviews
상품 리뷰 조회

---

## Cart API

### GET /cart
장바구니 조회

**Note:** 세션 기반, 쿠키 필요

**응답:**
```json
{
  "cart": {
    "item_count": 3,
    "total_price": "150000.00",
    "items": [
      {
        "cart_no": 1,
        "product_no": 123,
        "variant_code": "P000000A000A",
        "quantity": 2,
        "price": "100000.00"
      }
    ]
  }
}
```

### POST /cart/items
장바구니 상품 추가

**요청:**
```json
{
  "product_no": 123,
  "variant_code": "P000000A000A",
  "quantity": 2
}
```

---

## Customer API (로그인 필요)

### GET /customers/me
내 정보 조회

**Note:** 로그인 세션 필요

**응답:**
```json
{
  "customer": {
    "member_id": "user123",
    "name": "홍길동",
    "email": "hong@example.com",
    "cellphone": "010-1234-5678",
    "mileage": 5000,
    "credits": 10000,
    "group_name": "VIP"
  }
}
```

### GET /customers/me/orders
내 주문 목록 조회

### GET /customers/me/coupons
내 쿠폰 목록 조회

---

## Board API

### GET /boards
게시판 목록 조회

### GET /boards/{board_no}/articles
게시글 목록 조회

**파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| keyword | string | 검색어 |
| limit | int | 조회 개수 |
| offset | int | 시작 위치 |

---

## 사용 예시 (JavaScript)

### 상품 목록 조회

```javascript
const response = await fetch(
  'https://your-mall.cafe24api.com/api/v2/products?category=1&limit=20',
  {
    headers: {
      'X-Cafe24-Api-Version': '2024-06-01'
    }
  }
);
const data = await response.json();
console.log(data.products);
```

### 장바구니 추가

```javascript
const response = await fetch(
  'https://your-mall.cafe24api.com/api/v2/cart/items',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cafe24-Api-Version': '2024-06-01'
    },
    credentials: 'include',  // 쿠키 포함
    body: JSON.stringify({
      product_no: 123,
      variant_code: 'P000000A000A',
      quantity: 1
    })
  }
);
```

---

## 제한 사항

1. **인증이 필요한 API**: 고객 정보, 장바구니 등은 로그인 세션 필요
2. **Rate Limit**: Admin API와 동일한 정책 적용
3. **CORS**: 등록된 도메인에서만 호출 가능
4. **캐싱**: 상품/카테고리 데이터는 캐싱될 수 있음
