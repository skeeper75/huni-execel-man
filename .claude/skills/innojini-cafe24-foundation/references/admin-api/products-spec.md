# Products API 상세 스펙

Products 엔드포인트의 전체 요청/응답 파라미터 상세.

---

## GET /api/v2/admin/products

상품 목록 조회

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 | 제약조건 |
|---------|------|:----:|------|---------|
| `shop_no` | int | N | 멀티쇼핑몰 번호 | 기본값: 1 |
| `product_no` | string | N | 상품번호 | 콤마 구분, 최대 100개 |
| `product_code` | string | N | 상품코드 | |
| `custom_product_code` | string | N | 자체 상품코드 | |
| `product_name` | string | N | 상품명 (부분 일치) | |
| `eng_product_name` | string | N | 영문 상품명 | |
| `supply_product_name` | string | N | 공급사 상품명 | |
| `internal_product_name` | string | N | 관리용 상품명 | |
| `model_name` | string | N | 모델명 | |
| `product_condition` | string | N | 상품 상태 | `N`, `B`, `R`, `U`, `E`, `F` |
| `origin_place_value` | string | N | 원산지 값 | |
| `display` | string | N | 진열상태 | `T`/`F` |
| `selling` | string | N | 판매상태 | `T`/`F` |
| `product_used_month` | int | N | 중고 상품 사용월수 | |
| `summary_description` | string | N | 상품 요약설명 | |
| `simple_description` | string | N | 상품 간략설명 | |
| `category` | int | N | 카테고리 번호 | |
| `brand_code` | string | N | 브랜드 코드 | |
| `manufacturer_code` | string | N | 제조사 코드 | |
| `supplier_code` | string | N | 공급사 코드 | |
| `trend_code` | string | N | 트렌드 코드 | |
| `product_tag` | string | N | 상품 태그 | |
| `price_min` | decimal | N | 최소 가격 | |
| `price_max` | decimal | N | 최대 가격 | |
| `retail_price_min` | decimal | N | 최소 소비자가 | |
| `retail_price_max` | decimal | N | 최대 소비자가 | |
| `supply_price_min` | decimal | N | 최소 공급가 | |
| `supply_price_max` | decimal | N | 최대 공급가 | |
| `created_start_date` | datetime | N | 등록일 시작 | ISO 8601 |
| `created_end_date` | datetime | N | 등록일 종료 | ISO 8601 |
| `updated_start_date` | datetime | N | 수정일 시작 | ISO 8601 |
| `updated_end_date` | datetime | N | 수정일 종료 | ISO 8601 |
| `classification_code` | string | N | 자체분류 코드 | |
| `tax_type` | string | N | 과세유형 | `A`: 과세, `B`: 면세, `C`: 영세 |
| `approve_status` | string | N | 승인상태 | `N`, `Y`, `R`, `C`, `I` |
| `shipping_fee_by_product` | string | N | 개별배송비 여부 | `T`/`F` |
| `origin_place_code` | int | N | 원산지 코드 | |
| `stock_quantity_max` | int | N | 최대 재고수량 | |
| `stock_quantity_min` | int | N | 최소 재고수량 | |
| `embed` | string | N | 포함 데이터 | 콤마 구분 |
| `limit` | int | N | 조회 개수 | 기본값: 10, 최대: 100 |
| `offset` | int | N | 시작 위치 | 기본값: 0 |

### Embed 옵션

| 값 | 설명 |
|----|------|
| `variants` | 품목(옵션조합) 정보 |
| `options` | 옵션 정보 |
| `discountprice` | 할인가 정보 |
| `decorationimages` | 꾸미기 이미지 |
| `benefits` | 혜택 정보 |
| `additionalimages` | 추가 이미지 |
| `tags` | 태그 정보 |
| `memos` | 메모 정보 |
| `hits` | 조회수 |
| `seo` | SEO 정보 |
| `category` | 카테고리 정보 |
| `icons` | 아이콘 정보 |

---

## Response Fields

### Product Object

| 필드 | 타입 | 설명 |
|------|------|------|
| `shop_no` | int | 멀티쇼핑몰 번호 |
| `product_no` | int | 상품번호 |
| `product_code` | string | 상품코드 (자동생성) |
| `custom_product_code` | string | 자체 상품코드 |
| `product_name` | string | 상품명 |
| `eng_product_name` | string | 영문 상품명 |
| `supply_product_name` | string | 공급사 상품명 |
| `internal_product_name` | string | 관리용 상품명 |
| `model_name` | string | 모델명 |
| `price` | decimal | 판매가 |
| `retail_price` | decimal | 소비자가 |
| `supply_price` | decimal | 공급가 |
| `display` | string | 진열상태 (T/F) |
| `selling` | string | 판매상태 (T/F) |
| `product_condition` | string | 상품 상태 |
| `product_used_month` | int | 중고상품 사용월수 |
| `summary_description` | string | 요약설명 |
| `simple_description` | string | 간략설명 |
| `product_tag` | string | 상품 태그 |
| `buy_unit_type` | string | 구매단위 유형 |
| `buy_unit` | int | 구매단위 |
| `order_quantity_limit_type` | string | 주문수량 제한유형 |
| `minimum_quantity` | int | 최소 주문수량 |
| `maximum_quantity` | int | 최대 주문수량 |
| `points_by_product` | string | 개별 적립금 사용 (T/F) |
| `points_amount` | decimal | 적립금액 |
| `points_unit_by_product` | string | 개별 적립금 단위 |
| `adult_certification` | string | 성인인증 필요 (T/F) |
| `detail_image` | string | 상세 이미지 URL |
| `list_image` | string | 목록 이미지 URL |
| `tiny_image` | string | 작은 이미지 URL |
| `small_image` | string | 축소 이미지 URL |
| `has_option` | string | 옵션 사용 (T/F) |
| `option_type` | string | 옵션 유형 |
| `shipping_calculation` | string | 배송비 계산 방식 |
| `shipping_fee_by_product` | string | 개별배송비 (T/F) |
| `shipping_method` | string | 배송방법 |
| `prepaid_shipping_fee` | string | 착불/선불 구분 |
| `shipping_period` | object | 배송기간 정보 |
| `shipping_scope` | string | 배송범위 |
| `shipping_area` | string | 배송지역 |
| `shipping_fee_type` | string | 배송비 유형 |
| `shipping_rates` | array | 배송비 구간 |
| `clearance_category_code` | string | 통관코드 |
| `image_upload_type` | string | 이미지 업로드 유형 |
| `hscode` | string | HS Code |
| `product_weight` | decimal | 상품 중량 (kg) |
| `product_material` | string | 상품 소재 |
| `created_date` | datetime | 등록일시 |
| `updated_date` | datetime | 수정일시 |
| `english_product_material` | string | 영문 소재 |
| `cloth_fabric` | string | 원단 정보 |
| `list_icon` | object | 목록 아이콘 |
| `sold_out` | string | 품절여부 (T/F) |
| `relational_product` | array | 관련상품 |
| `select_one_by_option` | string | 옵션별 1개 선택 (T/F) |
| `approve_status` | string | 승인 상태 |
| `classification_code` | string | 자체분류 코드 |
| `main` | array | 메인 카테고리 |
| `tax_calculation` | string | 세금계산 방식 |
| `tax_type` | string | 과세유형 |
| `tax_rate` | int | 세율 (%) |
| `origin_place_code` | int | 원산지 코드 |
| `origin_place_value` | string | 원산지 값 |
| `made_in_code` | string | 제조국 코드 |
| `icon_show_period` | object | 아이콘 표시 기간 |
| `additional_information` | array | 추가 정보 |
| `additional_image` | array | 추가 이미지 |

### Variant Object (embed=variants)

| 필드 | 타입 | 설명 |
|------|------|------|
| `shop_no` | int | 멀티쇼핑몰 번호 |
| `variant_code` | string | 품목코드 |
| `options` | array | 옵션 목록 |
| `display` | string | 진열상태 (T/F) |
| `selling` | string | 판매상태 (T/F) |
| `additional_amount` | decimal | 추가금액 |
| `quantity` | int | 재고수량 |
| `safety_inventory` | int | 안전재고 |
| `image` | string | 품목 이미지 URL |
| `use_inventory` | string | 재고사용 (T/F) |

### Option Object (embed=options)

| 필드 | 타입 | 설명 |
|------|------|------|
| `option_name` | string | 옵션명 |
| `option_value` | array | 옵션값 목록 |
| `option_type` | string | 옵션유형 코드 |
| `required` | string | 필수여부 (T/F) |

---

## POST /api/v2/admin/products

상품 등록

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "product_name": "맞춤 명함 인쇄",
    "internal_product_name": "명함_기본_양면",
    "product_code": "BC-001",
    "custom_product_code": "NAMECARD-A",
    "supply_product_name": "기본 명함",
    "model_name": "NC-BASIC",
    "price": "15000.00",
    "retail_price": "20000.00",
    "supply_price": "8000.00",
    "display": "T",
    "selling": "T",
    "product_condition": "N",
    "summary_description": "고품질 맞춤 명함",
    "simple_description": "양면 풀컬러 인쇄",
    "tax_type": "A",
    "tax_rate": 10,
    "shipping_fee_by_product": "T",
    "shipping_method": "01",
    "prepaid_shipping_fee": "P",
    "shipping_fee_type": "T",
    "shipping_rates": [
      {"shipping_fee": "3000.00"}
    ],
    "category": [
      {"category_no": 27, "recommend": "T"}
    ],
    "options": [
      {
        "option_name": "용지",
        "option_type": "T",
        "option_values": ["아르떼 250g", "스노우 250g", "모조지 180g"]
      },
      {
        "option_name": "수량",
        "option_type": "T",
        "option_values": ["100매", "200매", "500매", "1000매"]
      }
    ]
  }
}
```

### 주요 필드 설명

| 필드 | 필수 | 설명 |
|------|:----:|------|
| `product_name` | Y | 상품명 (최대 250자) |
| `price` | Y | 판매가 |
| `display` | N | 진열상태 (기본값: F) |
| `selling` | N | 판매상태 (기본값: F) |
| `category` | N | 카테고리 배열 |
| `options` | N | 옵션 배열 |

---

## PUT /api/v2/admin/products/{product_no}

상품 수정

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| `product_no` | int | Y | 상품번호 |

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "product_name": "수정된 상품명",
    "price": "18000.00",
    "display": "T",
    "selling": "T"
  }
}
```

---

## GET /api/v2/admin/products/{product_no}/variants

품목 목록 조회

### Response

```json
{
  "variants": [
    {
      "shop_no": 1,
      "variant_code": "P000123A000A",
      "options": [
        {"name": "용지", "value": "아르떼 250g"},
        {"name": "수량", "value": "100매"}
      ],
      "additional_amount": "0.00",
      "quantity": 9999,
      "safety_inventory": 10,
      "display": "T",
      "selling": "T",
      "use_inventory": "T"
    }
  ]
}
```

---

## PUT /api/v2/admin/products/{product_no}/variants/{variant_code}

품목 수정

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "display": "T",
    "selling": "T",
    "additional_amount": "5000.00",
    "quantity": 100
  }
}
```

---

## GET /api/v2/admin/products/{product_no}/variants/{variant_code}/inventories

품목 재고 상세 조회

### Response

```json
{
  "inventory": {
    "shop_no": 1,
    "variant_code": "P000123A000A",
    "quantity": 100,
    "safety_inventory": 10,
    "use_inventory": "T"
  }
}
```

---

## PUT /api/v2/admin/products/{product_no}/variants/{variant_code}/inventories

품목 재고 수정

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "quantity": 150,
    "safety_inventory": 20
  }
}
```

---

## 옵션 유형 코드 (option_type)

| 코드 | 설명 | 용도 |
|------|------|------|
| `T` | 텍스트 조합형 | 일반적인 옵션 선택 |
| `S` | 셀렉트박스 분리형 | 독립적 옵션 |
| `F` | 직접입력형 | 고객 입력 텍스트 |
| `E` | 색상 선택형 | 색상 칩 선택 |
| `C` | 이미지 선택형 | 이미지 칩 선택 |

---

## 상품상태 코드 (product_condition)

| 코드 | 설명 |
|------|------|
| `N` | 신상품 |
| `B` | 반품상품 |
| `R` | 재고상품 |
| `U` | 중고상품 |
| `E` | 전시상품 |
| `F` | 리퍼상품 |

---

## 승인상태 코드 (approve_status)

| 코드 | 설명 |
|------|------|
| `N` | 승인 신청 전 |
| `C` | 승인 취소 |
| `R` | 승인 반려 |
| `I` | 검수 중 |
| `Y` | 승인 완료 |

---

## 과세유형 코드 (tax_type)

| 코드 | 설명 |
|------|------|
| `A` | 과세 |
| `B` | 면세 |
| `C` | 영세 |

---

## 배송비 유형 (shipping_fee_type)

| 코드 | 설명 |
|------|------|
| `T` | 고정 배송비 |
| `R` | 실시간 계산 |
| `W` | 무료배송 |
| `C` | 조건부 무료 |
| `N` | 수량별 부과 |
| `M` | 금액별 부과 |
| `D` | 금액구간별 부과 |
| `E` | 수량구간별 부과 |

---

## 응답 예시

```json
{
  "products": [
    {
      "shop_no": 1,
      "product_no": 123,
      "product_code": "P000123",
      "custom_product_code": "POSTCARD-A4",
      "product_name": "엽서 (맞춤인쇄)",
      "internal_product_name": "엽서_A4_양면",
      "price": "25000.00",
      "retail_price": "30000.00",
      "supply_price": "15000.00",
      "display": "T",
      "selling": "T",
      "summary_description": "고품질 맞춤 엽서 인쇄",
      "detail_image": "//img.cafe24.com/product/123_main.jpg",
      "list_image": "//img.cafe24.com/product/123_list.jpg",
      "tax_type": "A",
      "tax_rate": 10,
      "product_weight": "0.10",
      "created_date": "2025-01-01T10:00:00+09:00",
      "updated_date": "2025-01-10T15:30:00+09:00",
      "variants": [
        {
          "variant_code": "P000123A000A",
          "options": [
            {"name": "용지", "value": "200g 아르떼"}
          ],
          "quantity": 9999,
          "safety_inventory": 10,
          "additional_amount": "0.00",
          "display": "T",
          "selling": "T"
        }
      ],
      "category": [
        {
          "category_no": 27,
          "category_name": "엽서/명함",
          "recommend": "T"
        }
      ]
    }
  ]
}
```

---

## Python 예제

```python
# 상품 목록 조회 (판매중인 상품)
products = client.get_products(
    display="T",
    selling="T",
    embed=["variants", "options", "category"]
)

# 특정 카테고리 상품 조회
category_products = client.get_products(
    category=27,  # 엽서/명함 카테고리
    limit=50
)

# 재고 조회 및 업데이트
for product in products:
    product_no = product["product_no"]
    variants = client.get_product_variants(product_no)
    
    for variant in variants:
        if variant["quantity"] < variant["safety_inventory"]:
            print(f"⚠️ 재고 부족: {variant['variant_code']}")

# 상품 가격 일괄 수정
for product in products:
    new_price = float(product["price"]) * 1.1  # 10% 인상
    client.update_product(
        product_no=product["product_no"],
        data={"price": str(new_price)}
    )
```
