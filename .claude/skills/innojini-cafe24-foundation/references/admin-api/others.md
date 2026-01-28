# Cafe24 Admin API - 기타 도메인

Customer, Community, Promotion, Category, Application, Collection, Supply, Design 도메인 요약

---

## Customer 도메인 (10개 리소스)

회원, 등급, 메모 관리

### 주요 엔드포인트

#### GET /customers
회원 목록 조회

**파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| member_id | string | 회원 ID |
| name | string | 회원명 |
| cellphone | string | 휴대폰 번호 |
| email | string | 이메일 |
| group_no | int | 회원등급 번호 |
| created_start_date | string | 가입일 시작 |
| created_end_date | string | 가입일 종료 |

#### GET /customers/{member_id}
회원 상세 조회

#### PUT /customers/{member_id}
회원 정보 수정

#### GET /customergroups
회원등급 목록 조회

#### GET /customers/{member_id}/memos
회원 메모 조회

#### POST /customers/{member_id}/memos
회원 메모 등록

---

## Community 도메인 (9개 리소스)

게시판, 리뷰, 1:1 문의 관리

### 주요 엔드포인트

#### GET /boards
게시판 목록 조회

#### GET /boards/{board_no}/articles
게시글 목록 조회

#### GET /boards/{board_no}/articles/{article_no}
게시글 상세 조회

#### PUT /boards/{board_no}/articles/{article_no}
게시글 답변 등록

#### GET /reviews
리뷰 목록 조회

**파라미터:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| product_no | int | 상품번호 |
| rating | int | 평점 (1-5) |
| replied | string | 답변여부 (T/F) |

#### POST /reviews/{review_no}/reply
리뷰 답변 등록

#### GET /inquiries
1:1 문의 목록 조회

#### POST /inquiries/{inquiry_no}/reply
1:1 문의 답변

---

## Promotion 도메인 (10개 리소스)

쿠폰, 혜택, 할인코드 관리

### 주요 엔드포인트

#### GET /coupons
쿠폰 목록 조회

#### POST /coupons
쿠폰 생성

**요청:**
```json
{
  "coupon": {
    "coupon_name": "신규회원 할인쿠폰",
    "coupon_type": "A",
    "benefit_type": "A",
    "benefit_value": "5000",
    "available_date_start": "2024-01-01",
    "available_date_end": "2024-12-31",
    "available_min_price": "30000"
  }
}
```

쿠폰 타입:
- A: 금액 할인
- B: 비율 할인
- C: 배송비 할인
- D: 무료배송

#### POST /coupons/{coupon_no}/issue
쿠폰 발급 (회원에게)

#### GET /benefits
혜택 목록 조회

#### GET /promotioncode
할인코드 목록 조회

#### POST /promotioncode
할인코드 생성

---

## Category 도메인 (6개 리소스)

카테고리 관리

### 주요 엔드포인트

#### GET /categories
카테고리 목록 조회

**응답:**
```json
{
  "categories": [
    {
      "category_no": 1,
      "category_name": "의류",
      "parent_category_no": 0,
      "category_depth": 1,
      "full_category_name": "의류",
      "use_display": "T",
      "product_count": 100
    },
    {
      "category_no": 2,
      "category_name": "상의",
      "parent_category_no": 1,
      "category_depth": 2,
      "full_category_name": "의류 > 상의",
      "use_display": "T",
      "product_count": 50
    }
  ]
}
```

#### GET /categories/{category_no}
카테고리 상세 조회

#### POST /categories
카테고리 등록

#### PUT /categories/{category_no}
카테고리 수정

#### DELETE /categories/{category_no}
카테고리 삭제

#### GET /maincategory
메인 카테고리 조회

---

## Application 도메인 (7개 리소스)

앱, 스크립트, 웹훅 관리

### 주요 엔드포인트

#### GET /scripttags
스크립트 태그 목록 조회

#### POST /scripttags
스크립트 태그 등록

**요청:**
```json
{
  "scripttag": {
    "src": "https://your-cdn.com/script.js",
    "display_location": "ALL"
  }
}
```

display_location:
- ALL: 전체 페이지
- PRODUCT_LIST: 상품 목록
- PRODUCT_DETAIL: 상품 상세
- ORDER: 주문서
- ORDER_COMPLETE: 주문완료

#### GET /webhooks
웹훅 목록 조회

#### POST /webhooks
웹훅 등록

**요청:**
```json
{
  "webhook": {
    "event": "order.paid",
    "callback_url": "https://your-server.com/webhook"
  }
}
```

웹훅 이벤트:
- order.created: 주문 생성
- order.paid: 결제 완료
- order.shipped: 배송 시작
- order.delivered: 배송 완료
- product.created: 상품 등록
- product.updated: 상품 수정
- customer.created: 회원 가입

#### DELETE /webhooks/{webhook_id}
웹훅 삭제

---

## Collection 도메인 (5개 리소스)

브랜드, 제조사, 원산지 관리

### 주요 엔드포인트

#### GET /brands
브랜드 목록 조회

#### POST /brands
브랜드 등록

#### GET /manufacturers
제조사 목록 조회

#### POST /manufacturers
제조사 등록

#### GET /origins
원산지 목록 조회

---

## Supply 도메인 (4개 리소스)

공급사 관리

### 주요 엔드포인트

#### GET /suppliers
공급사 목록 조회

**응답:**
```json
{
  "suppliers": [
    {
      "supplier_code": "S0001",
      "supplier_name": "공급사A",
      "use_supplier": "T",
      "commission_rate": "10.00"
    }
  ]
}
```

#### POST /suppliers
공급사 등록

#### PUT /suppliers/{supplier_code}
공급사 수정

#### GET /suppliers/{supplier_code}/products
공급사별 상품 조회

---

## Design 도메인 (3개 리소스)

테마, 아이콘, 페이지 관리

### 주요 엔드포인트

#### GET /themes
테마 목록 조회

#### GET /icons
아이콘 목록 조회

#### GET /pages
페이지 목록 조회
