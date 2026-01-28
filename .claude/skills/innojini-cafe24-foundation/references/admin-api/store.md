# Cafe24 Admin API - Store 도메인

쇼핑몰 설정, 결제, 배송, 정책 관련 API (51개 리소스)

## 주요 엔드포인트

### 쇼핑몰 정보

#### GET /store
쇼핑몰 기본 정보 조회

**응답:**
```json
{
  "store": {
    "shop_no": 1,
    "mall_id": "your_mall_id",
    "shop_name": "샘플 쇼핑몰",
    "business_registration_no": "123-45-67890",
    "president_name": "대표자명",
    "phone": "02-1234-5678",
    "email": "admin@example.com",
    "address1": "서울시 강남구",
    "address2": "테헤란로 123",
    "zipcode": "06234",
    "timezone": "Asia/Seoul"
  }
}
```

#### PUT /store
쇼핑몰 정보 수정

### 멀티쇼핑몰

#### GET /shops
멀티쇼핑몰 목록 조회

**응답:**
```json
{
  "shops": [
    {
      "shop_no": 1,
      "shop_name": "메인 쇼핑몰",
      "is_default": "T",
      "language_code": "ko_KR",
      "currency_code": "KRW"
    },
    {
      "shop_no": 2,
      "shop_name": "영문 쇼핑몰",
      "is_default": "F",
      "language_code": "en_US",
      "currency_code": "USD"
    }
  ]
}
```

### 결제 설정

#### GET /paymentgateway
PG사 설정 조회

#### GET /paymentmethods
결제수단 목록 조회

**응답:**
```json
{
  "paymentmethods": [
    {
      "payment_method": "card",
      "payment_method_name": "신용카드",
      "use_payment": "T"
    },
    {
      "payment_method": "tcash",
      "payment_method_name": "계좌이체",
      "use_payment": "T"
    }
  ]
}
```

### 배송 설정

#### GET /shipping
배송 정책 조회

#### GET /shippingcarriers
택배사 목록 조회

**응답:**
```json
{
  "shippingcarriers": [
    {
      "shipping_carrier_id": "0019",
      "shipping_carrier_name": "CJ대한통운",
      "use_shipping": "T"
    }
  ]
}
```

#### GET /shippingfee
배송비 정책 조회

**응답:**
```json
{
  "shippingfee": {
    "shipping_fee_type": "T",
    "shipping_fee": "3000.00",
    "free_shipping_price": "50000.00",
    "free_shipping_use": "T"
  }
}
```

배송비 타입:
- T: 유료 (고정 금액)
- R: 무료
- M: 수량별
- A: 금액별
- N: 개별 배송비

### SMS/알림 설정

#### GET /sms
SMS 발송 설정 조회

#### GET /notifications
알림 설정 조회

### 약관/정책

#### GET /agreements
약관 목록 조회

#### GET /privacypolicy
개인정보 처리방침 조회

#### GET /returnpolicy
반품/교환 정책 조회

### 운영시간

#### GET /operatinghours
운영시간 조회

**응답:**
```json
{
  "operatinghours": {
    "weekday_start": "09:00",
    "weekday_end": "18:00",
    "saturday_start": "09:00",
    "saturday_end": "13:00",
    "sunday_holiday": "T",
    "cs_phone": "02-1234-5678"
  }
}
```

### 통계

#### GET /statistics/orders
주문 통계

#### GET /statistics/sales
매출 통계

#### GET /statistics/visitors
방문자 통계

### 공휴일

#### GET /holidays
공휴일 목록 조회

#### POST /holidays
공휴일 등록

### 창고/재고 위치

#### GET /warehouses
창고 목록 조회

#### POST /warehouses
창고 등록

### 세금 설정

#### GET /taxes
세금 설정 조회

#### GET /taxrates
세율 조회

## 주요 설정값

### 통화 코드

| 코드 | 통화 |
|------|------|
| KRW | 원화 |
| USD | 미국 달러 |
| JPY | 일본 엔 |
| CNY | 중국 위안 |
| EUR | 유로 |

### 언어 코드

| 코드 | 언어 |
|------|------|
| ko_KR | 한국어 |
| en_US | 영어 |
| ja_JP | 일본어 |
| zh_CN | 중국어 (간체) |
| zh_TW | 중국어 (번체) |

### 시간대

| 코드 | 시간대 |
|------|-------|
| Asia/Seoul | KST (한국) |
| Asia/Tokyo | JST (일본) |
| Asia/Shanghai | CST (중국) |
| America/Los_Angeles | PST (미국 서부) |
| America/New_York | EST (미국 동부) |
