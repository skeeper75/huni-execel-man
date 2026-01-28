# Cafe24 Admin API - Order 도메인

주문, 배송, 클레임(취소/반품/교환) 관련 API (38개 리소스)

## 주요 엔드포인트

### 주문 조회

#### GET /orders
주문 목록 조회

**파라미터:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| shop_no | int | ❌ | 멀티쇼핑몰 번호 (기본값: 1) |
| start_date | string | ❌ | 조회 시작일 (YYYY-MM-DD) |
| end_date | string | ❌ | 조회 종료일 (YYYY-MM-DD) |
| date_type | string | ❌ | 날짜 기준 (order_date, pay_date, ship_date) |
| order_id | string | ❌ | 주문번호 (콤마 구분, 최대 100개) |
| order_status | string | ❌ | 주문상태 코드 |
| payment_status | string | ❌ | 결제상태 (paid, unpaid) |
| payment_method | string | ❌ | 결제수단 |
| order_place_id | string | ❌ | 주문경로 (naver, coupang, 11st 등) |
| member_id | string | ❌ | 회원 ID |
| buyer_name | string | ❌ | 주문자명 |
| buyer_cellphone | string | ❌ | 주문자 연락처 |
| receiver_name | string | ❌ | 수령자명 |
| product_no | int | ❌ | 상품번호 |
| product_code | string | ❌ | 상품코드 |
| embed | string | ❌ | 추가 조회 (items, receivers, buyer, return, cancellation, exchange) |
| limit | int | ❌ | 조회 개수 (최대 100) |
| offset | int | ❌ | 시작 위치 |

**응답:**
```json
{
  "orders": [
    {
      "shop_no": 1,
      "order_id": "20241201-0000001",
      "order_status": "N20",
      "order_date": "2024-12-01T10:30:00+09:00",
      "payment_date": "2024-12-01T10:31:00+09:00",
      "currency": "KRW",
      "order_price_amount": "50000.00",
      "payment_amount": "45000.00",
      "total_discount_amount": "5000.00",
      "buyer": {
        "name": "홍길동",
        "email": "hong@example.com",
        "phone": "010-1234-5678",
        "cellphone": "010-1234-5678"
      },
      "items": [...],
      "receivers": [...]
    }
  ]
}
```

#### GET /orders/{order_id}
주문 상세 조회

#### PUT /orders/{order_id}
주문 수정 (상태 변경 등)

### 배송 관리

#### POST /orders/{order_id}/shipments
송장 등록

**요청:**
```json
{
  "shop_no": 1,
  "shipment": {
    "tracking_no": "123456789012",
    "shipping_company_code": "0019",
    "order_item_code": ["20241201-0000001-01"]
  }
}
```

#### GET /orders/{order_id}/shipments
송장 조회

#### PUT /orders/{order_id}/shipments/{shipment_no}
송장 수정

#### DELETE /orders/{order_id}/shipments/{shipment_no}
송장 삭제

### 클레임 - 취소

#### GET /cancellation
취소 목록 조회

#### POST /cancellation
취소 접수

**요청:**
```json
{
  "shop_no": 1,
  "requests": [
    {
      "order_id": "20241201-0000001",
      "order_item_code": ["20241201-0000001-01"],
      "reason_type": "C",
      "reason": "단순변심"
    }
  ]
}
```

취소 사유 코드:
- C: 고객변심
- E: 상품불만
- D: 배송지연
- A: 기타

#### PUT /cancellation/{claim_code}
취소 처리 (승인/거부)

### 클레임 - 반품

#### GET /return
반품 목록 조회

#### POST /return
반품 접수

**요청:**
```json
{
  "shop_no": 1,
  "requests": [
    {
      "order_id": "20241201-0000001",
      "order_item_code": ["20241201-0000001-01"],
      "reason_type": "R",
      "reason": "상품 불량",
      "pickup_address": {
        "zipcode": "12345",
        "address1": "서울시 강남구",
        "address2": "테헤란로 123"
      }
    }
  ]
}
```

#### PUT /return/{claim_code}
반품 처리

### 클레임 - 교환

#### GET /exchange
교환 목록 조회

#### POST /exchange
교환 접수

#### PUT /exchange/{claim_code}
교환 처리

### 환불

#### GET /refunds
환불 목록 조회

#### POST /refunds
환불 처리

## 주문 상태 코드

### 정상 주문 흐름
```
N00 (입금전)
  ↓
N10 (상품준비중)
  ↓
N20 (배송준비중)
  ↓
N21 (배송대기) / N22 (배송보류)
  ↓
N30 (배송중)
  ↓
N40 (배송완료)
  ↓
N50 (구매확정)
```

### 취소 흐름
```
C00 (취소신청)
  ↓
C10 (취소접수/환불전)
  ↓
C34 (취소완료/환불완료)
```

### 반품 흐름
```
R00 (반품신청)
  ↓
R10 (반품접수)
  ↓
R12 (수거중)
  ↓
R13 (수거완료)
  ↓
R30 (반품완료/환불전)
  ↓
R34 (반품완료/환불완료)
```

### 교환 흐름
```
E00 (교환신청)
  ↓
E10 (교환접수)
  ↓
E20 (교환준비)
  ↓
E30 (교환배송중)
  ↓
E40 (교환완료)
```

## 결제 수단 코드

| 코드 | 결제수단 |
|------|---------|
| card | 신용카드 |
| tcash | 계좌이체 |
| icash | 가상계좌 |
| cell | 휴대폰결제 |
| point | 적립금 |
| mileage | 마일리지 |
| deposit | 예치금 |
| coupon | 쿠폰 |
| etc | 기타 |
| payco | 페이코 |
| naverpay | 네이버페이 |
| kakaopay | 카카오페이 |
| samsungpay | 삼성페이 |
| lpay | L.Pay |
| ssgpay | SSG페이 |
| tosspay | 토스페이 |

## 택배사 코드

| 택배사 | 코드 |
|--------|------|
| CJ대한통운 | 0019 |
| 롯데택배 | 0002 |
| 한진택배 | 0003 |
| 로젠택배 | 0004 |
| 우체국택배 | 0005 |
| 대신택배 | 0012 |
| 경동택배 | 0014 |
| 합동택배 | 0018 |
| GS NETWORKS | 0039 |
| CVS편의점택배 | 0050 |
| 홈픽택배 | 0054 |
| 천일택배 | 0020 |
| 건영택배 | 0021 |
| 일양로지스 | 0033 |
| 굿투럭 | 0071 |
| KGL네트웍스 | 0041 |

## 주문경로 코드 (order_place_id)

| 코드 | 경로 |
|------|------|
| self | 자사몰 |
| naver | 네이버 스마트스토어 |
| coupang | 쿠팡 |
| 11st | 11번가 |
| gmarket | G마켓 |
| auction | 옥션 |
| interpark | 인터파크 |
| tmon | 티몬 |
| wemakeprice | 위메프 |
| kakao | 카카오쇼핑 |

## Embed 파라미터

| 값 | 포함 데이터 |
|----|-----------|
| items | 주문 품목 목록 |
| receivers | 수령자 정보 |
| buyer | 주문자 상세 정보 |
| return | 반품 정보 |
| cancellation | 취소 정보 |
| exchange | 교환 정보 |
| receipts | 영수증 정보 |
| payment | 결제 상세 정보 |

**사용 예시:**
```
GET /orders?embed=items,receivers,buyer
```
