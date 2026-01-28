# Orders API 상세 스펙

Orders 엔드포인트의 전체 요청/응답 파라미터 상세.

---

## GET /api/v2/admin/orders

주문 목록 조회

### Request Parameters

| 파라미터 | 타입 | 필수 | 설명 | 제약조건 |
|---------|------|:----:|------|---------|
| `shop_no` | int | N | 멀티쇼핑몰 번호 | 기본값: 1 |
| `order_id` | string | N | 주문번호 | 콤마 구분, 최대 100개 |
| `member_id` | string | N | 회원 ID | |
| `member_email` | string | N | 회원 이메일 | |
| `buyer_name` | string | N | 주문자명 | |
| `buyer_email` | string | N | 주문자 이메일 | |
| `buyer_cellphone` | string | N | 주문자 휴대폰 | |
| `buyer_phone` | string | N | 주문자 일반전화 | |
| `receiver_name` | string | N | 수령인명 | |
| `receiver_cellphone` | string | N | 수령인 휴대폰 | |
| `receiver_phone` | string | N | 수령인 일반전화 | |
| `receiver_address` | string | N | 수령인 주소 (부분 일치) | |
| `receiver_zipcode` | string | N | 수령인 우편번호 | |
| `product_no` | int | N | 상품번호 | |
| `product_code` | string | N | 상품코드 | |
| `product_name` | string | N | 상품명 (부분 일치) | |
| `variant_code` | string | N | 품목코드 | |
| `date_type` | string | N | 날짜 기준 | `order_date`, `pay_date`, `ship_date`, `cancel_date`, `return_date`, `exchange_date` |
| `start_date` | string | N | 검색 시작일 | YYYY-MM-DD |
| `end_date` | string | N | 검색 종료일 | YYYY-MM-DD |
| `order_status` | string | N | 주문상태 코드 | 콤마 구분 가능, 코드표 참조 |
| `payment_status` | string | N | 결제상태 | `T`: 결제완료, `F`: 미결제 |
| `payment_method` | string | N | 결제수단 | 코드표 참조 |
| `order_place_id` | string | N | 외부몰 ID | `naver`, `coupang`, `11st` 등 |
| `inflow_path` | string | N | 유입경로 | |
| `subscription` | string | N | 정기배송 여부 | `T`/`F` |
| `group_no` | int | N | 회원등급 번호 | |
| `supplier_id` | string | N | 공급사 ID | |
| `market_cancel_request` | string | N | 외부몰 취소요청 여부 | `T`/`F` |
| `market_fail_reason_type` | string | N | 외부몰 주문실패 사유 | |
| `labels` | string | N | 주문 라벨 | |
| `since_order_id` | string | N | 해당 주문 이후 조회 | 커서 기반 페이지네이션용 |
| `embed` | string | N | 포함 데이터 | 콤마 구분, embed 옵션 참조 |
| `limit` | int | N | 조회 개수 | 기본값: 10, 최대: 100 |
| `offset` | int | N | 시작 위치 | 기본값: 0 |

### Embed 옵션

| 값 | 설명 |
|----|------|
| `items` | 주문 품목 정보 |
| `receivers` | 수령인 정보 |
| `buyer` | 주문자 상세 정보 |
| `return` | 반품 정보 |
| `cancellation` | 취소 정보 |
| `exchange` | 교환 정보 |
| `paymentgateway` | 결제 PG 정보 |
| `benefits` | 혜택 정보 |
| `coupons` | 쿠폰 정보 |
| `refunds` | 환불 정보 |
| `shipments` | 배송 정보 |
| `labels` | 라벨 정보 |

---

## Response Fields

### Order Object

| 필드 | 타입 | 설명 |
|------|------|------|
| `shop_no` | int | 멀티쇼핑몰 번호 |
| `order_id` | string | 주문번호 (형식: YYYYMMDD-XXXXXXX) |
| `order_sequence` | int | 주문 순번 |
| `order_date` | datetime | 주문일시 (ISO 8601) |
| `first_order` | string | 첫 주문 여부 (T/F) |
| `payment_date` | datetime | 결제완료일시 |
| `order_from_mobile` | string | 모바일 주문 여부 (T/F) |
| `order_place_id` | string | 주문 경로 ID |
| `order_place_name` | string | 주문 경로명 |
| `market_order_no` | string | 외부몰 주문번호 |
| `market_order_info` | string | 외부몰 주문정보 |
| `market_cancel_request` | string | 외부몰 취소요청 (T/F) |
| `market_cancel_request_quantity` | int | 취소요청 수량 |
| `member_id` | string | 회원 ID |
| `member_group_no` | int | 회원등급 번호 |
| `currency` | string | 통화 코드 |
| `order_status` | string | 주문 상태 코드 |
| `order_price_amount` | decimal | 상품 금액 합계 |
| `shipping_fee` | decimal | 기본 배송비 |
| `additional_shipping_fee` | decimal | 추가 배송비 |
| `regional_surcharge` | decimal | 지역별 추가 배송비 |
| `individual_shipping_fee` | decimal | 개별 배송비 |
| `international_shipping_insurance` | decimal | 해외배송 보험료 |
| `total_shipping_fee` | decimal | 총 배송비 |
| `coupon_discount_price` | decimal | 쿠폰 할인금액 |
| `points_spent_amount` | decimal | 적립금 사용액 |
| `credits_spent_amount` | decimal | 예치금 사용액 |
| `membership_discount_amount` | decimal | 회원등급 할인금액 |
| `shipping_fee_discount_amount` | decimal | 배송비 할인금액 |
| `set_discount_amount` | decimal | 세트할인 금액 |
| `total_discount_amount` | decimal | 총 할인금액 |
| `actual_order_amount` | decimal | 결제 예정 금액 |
| `gift_certificate_discount_amount` | decimal | 상품권 할인금액 |
| `initial_estimated_shipping_date` | date | 최초 예상 발송일 |
| `estimated_shipping_date` | date | 예상 발송일 |
| `additional_payment_amount` | decimal | 추가결제 금액 |
| `additional_payment_reason_type` | string | 추가결제 사유 |
| `total_amount_due` | decimal | 최종 결제금액 |
| `payment_method` | string | 결제수단 코드 |
| `paid` | string | 결제완료 여부 (T/F) |
| `subscription` | string | 정기배송 주문 여부 (T/F) |
| `multiple_shipping` | string | 다중배송 여부 (T/F) |
| `shipping_type` | string | 배송유형 |
| `shipping_message` | string | 배송 메시지 |
| `updated_date` | datetime | 주문 수정일시 |
| `carrier_id` | string | 택배사 코드 |
| `tracking_no` | string | 송장번호 |
| `invoice_no` | string | 전자세금계산서 번호 |
| `process_status` | string | 처리상태 |
| `region` | string | 배송지역 (국내/해외) |

### Buyer Object (embed=buyer)

| 필드 | 타입 | 설명 |
|------|------|------|
| `member_id` | string | 회원 ID (비회원: 빈값) |
| `name` | string | 주문자명 |
| `name_furigana` | string | 주문자명 후리가나 (일본어) |
| `email` | string | 이메일 |
| `phone` | string | 일반전화 |
| `cellphone` | string | 휴대전화 |
| `customer_notification` | string | 알림 수신동의 (T/F) |

### Receiver Object (embed=receivers)

| 필드 | 타입 | 설명 |
|------|------|------|
| `shipping_group_no` | int | 배송그룹 번호 |
| `shipping_group_name` | string | 배송그룹명 |
| `name` | string | 수령인명 |
| `name_furigana` | string | 수령인명 후리가나 |
| `phone` | string | 일반전화 |
| `cellphone` | string | 휴대전화 |
| `virtual_phone_no` | string | 안심번호 |
| `zipcode` | string | 우편번호 |
| `address1` | string | 기본주소 |
| `address2` | string | 상세주소 |
| `address_full` | string | 전체주소 |
| `address_state` | string | 시/도 |
| `address_city` | string | 시/군/구 |
| `address_street` | string | 도로명 |
| `address_type` | string | 주소유형 (street/building) |
| `country_code` | string | 국가코드 |
| `country_name` | string | 국가명 |
| `country_name_en` | string | 국가명(영문) |
| `shipping_message` | string | 배송메시지 |
| `shipping_company_code` | string | 택배사코드 |
| `shipping_company_name` | string | 택배사명 |
| `tracking_no` | string | 송장번호 |
| `shipping_date` | datetime | 발송일시 |
| `delivery_date` | datetime | 배송완료일시 |
| `clearance_information_type` | string | 통관정보 유형 |
| `clearance_information` | string | 통관정보 |

### Item Object (embed=items)

| 필드 | 타입 | 설명 |
|------|------|------|
| `order_item_code` | string | 품목코드 (주문번호-순번) |
| `item_no` | int | 품목 순번 |
| `shipping_group_no` | int | 배송그룹 번호 |
| `product_no` | int | 상품번호 |
| `product_code` | string | 상품코드 |
| `variant_code` | string | 품목코드 (상품별) |
| `product_name` | string | 상품명 |
| `product_name_default` | string | 상품명 (기본) |
| `option_id` | string | 옵션 ID |
| `option_value` | string | 옵션값 |
| `option_value_default` | string | 옵션값 (기본) |
| `additional_option_value` | string | 추가입력옵션값 |
| `product_bundle` | string | 세트상품 여부 (T/F) |
| `product_bundle_no` | int | 세트상품 번호 |
| `quantity` | int | 수량 |
| `product_price` | decimal | 상품가격 |
| `option_price` | decimal | 옵션 추가금액 |
| `additional_price` | decimal | 추가옵션 금액 |
| `discount_price` | decimal | 할인금액 |
| `coupon_discount_price` | decimal | 쿠폰할인 금액 |
| `points_spent_amount` | decimal | 적립금 사용액 |
| `credits_spent_amount` | decimal | 예치금 사용액 |
| `actual_payment` | decimal | 실결제금액 |
| `order_status` | string | 품목별 주문상태 |
| `market_item_no` | string | 외부몰 품목번호 |
| `market_custom_variant_code` | string | 외부몰 자체품목코드 |
| `claim_code` | string | 클레임 코드 |
| `claim_reason_type` | string | 클레임 사유유형 |
| `claim_reason` | string | 클레임 사유 |
| `refund_status` | string | 환불상태 |
| `order_done` | string | 처리완료 여부 (T/F) |
| `supplier_product_name` | string | 공급사 상품명 |
| `supplier_transaction_type` | string | 공급사 거래유형 |
| `supplier_code` | string | 공급사 코드 |

---

## 주문 상태 코드 (order_status)

### 정상 주문 흐름

| 코드 | 상태명 | 설명 | MES 연동 |
|------|-------|------|----------|
| `N00` | 입금전 | 무통장 입금 대기 | - |
| `N10` | 상품준비중 | 결제 완료 후 준비 | ⭐ 작업지시 대상 |
| `N20` | 배송준비중 | 출고 준비 중 | ⭐ 생산 진행 |
| `N21` | 배송대기 | 출고 대기 | 생산 완료 |
| `N22` | 배송보류 | 출고 보류 | ⚠️ 알림 필요 |
| `N30` | 배송중 | 택배 발송됨 | 배송 추적 |
| `N40` | 배송완료 | 배달 완료 | - |
| `N50` | 구매확정 | 고객 확정 | 정산 처리 |

### 취소 흐름

| 코드 | 상태명 | 설명 | MES 연동 |
|------|-------|------|----------|
| `C00` | 취소신청 | 고객 취소 요청 | 🚫 작업중단 검토 |
| `C10` | 취소접수(환불전) | 취소 승인, 환불 전 | 🚫 작업중단 |
| `C34` | 취소완료(환불완료) | 취소 완료 | - |
| `C35` | 취소완료(환불전) | 취소 완료, 환불 대기 | - |
| `C36` | 취소완료(환불보류) | 취소 완료, 환불 보류 | - |
| `C40` | 취소완료 | 취소 최종 완료 | - |

### 반품 흐름

| 코드 | 상태명 | 설명 | MES 연동 |
|------|-------|------|----------|
| `R00` | 반품신청 | 고객 반품 요청 | ⚠️ 알림 |
| `R10` | 반품접수 | 반품 승인 | - |
| `R12` | 수거중 | 택배 수거 중 | - |
| `R13` | 수거완료 | 수거 완료 | - |
| `R30` | 반품완료(환불전) | 반품 완료, 환불 전 | - |
| `R34` | 반품완료(환불완료) | 반품 완료, 환불 완료 | - |

### 교환 흐름

| 코드 | 상태명 | 설명 | MES 연동 |
|------|-------|------|----------|
| `E00` | 교환신청 | 고객 교환 요청 | ⚠️ 알림 |
| `E10` | 교환접수 | 교환 승인 | 재생산 검토 |
| `E20` | 교환준비 | 교환품 준비 | 재생산 진행 |
| `E30` | 교환배송중 | 교환품 발송 | - |
| `E40` | 교환완료 | 교환 완료 | - |

---

## 결제수단 코드 (payment_method)

| 코드 | 결제수단 | 비고 |
|------|---------|------|
| `cash` | 현금 | |
| `card` | 신용카드 | |
| `tcash` | 계좌이체 | 실시간 계좌이체 |
| `icash` | 가상계좌 | 무통장입금 |
| `cell` | 휴대폰결제 | |
| `deferpay` | 후불결제 | |
| `cvs` | 편의점결제 | |
| `point` | 적립금 | |
| `credits` | 예치금 | |
| `mileage` | 마일리지 | |
| `deposit` | 선불금 | |
| `giftcard` | 상품권 | |
| `etc` | 기타 | |
| `payco` | 페이코 | |
| `naverpay` | 네이버페이 | |
| `kakaopay` | 카카오페이 | |
| `samsungpay` | 삼성페이 | |
| `lpay` | L.Pay | |
| `ssgpay` | SSG페이 | |
| `tosspay` | 토스페이 | |
| `applepay` | 애플페이 | |

---

## 외부몰 코드 (order_place_id)

| 코드 | 외부몰 | 비고 |
|------|-------|------|
| `self` | 자사몰 | 기본값 |
| `naver` | 네이버 스마트스토어 | 마켓플러스 |
| `coupang` | 쿠팡 | 마켓플러스 |
| `11st` | 11번가 | 마켓플러스 |
| `gmarket` | G마켓 | 마켓플러스 |
| `auction` | 옥션 | 마켓플러스 |
| `interpark` | 인터파크 | 마켓플러스 |
| `tmon` | 티몬 | 마켓플러스 |
| `wemakeprice` | 위메프 | 마켓플러스 |
| `kakao` | 카카오쇼핑 | 마켓플러스 |
| `ably` | 에이블리 | 마켓플러스 |
| `brandi` | 브랜디 | 마켓플러스 |
| `zigzag` | 지그재그 | 마켓플러스 |

---

## 택배사 코드 (carrier_id/shipping_company_code)

### 국내 택배사

| 코드 | 택배사명 |
|------|---------|
| `0001` | 우체국택배 |
| `0002` | 롯데택배 |
| `0003` | 한진택배 |
| `0004` | 로젠택배 |
| `0005` | CJ대한통운 |
| `0006` | CJ대한통운(퍼스트)  |
| `0008` | KGB택배 |
| `0009` | 동부택배 |
| `0010` | 건영택배 |
| `0011` | 일양로지스 |
| `0012` | EMS |
| `0013` | DHL |
| `0014` | UPS |
| `0015` | FedEx |
| `0016` | 대신택배 |
| `0017` | 경동택배 |
| `0018` | 합동택배 |
| `0019` | CJ대한통운 |
| `0020` | 천일택배 |
| `0021` | 고려택배 |
| `0022` | 한덱스 |
| `0023` | 호남택배 |
| `0024` | SLX택배 |
| `0025` | 성원글로벌 |
| `0026` | 드림택배 |
| `0027` | TNT Express |
| `0028` | USPS |
| `0029` | 에어보이익스프레스 |
| `0030` | 범한판토스 |
| `0031` | KGL네트웍스 |
| `0032` | DPD |
| `0033` | i-Parcel |
| `0034` | GSMNtoN |
| `0035` | 롯데글로벌로지스 |
| `0036` | 용마로지스 |
| `0037` | 세방 |
| `0038` | 농협택배 |
| `0039` | GS NETWORKS |
| `0040` | 홈픽택배 |
| `0041` | KGL네트웍스 |
| `0042` | GSI Express |
| `0043` | 씨제이GLS |
| `0044` | 에스엘엑스 |
| `0045` | 팬스타익스프레스 |
| `0046` | CU편의점택배 |
| `0047` | 우리동네택배 |
| `0048` | 홈픽 |
| `0049` | 두발히어로 |
| `0050` | CVS편의점택배 |
| `0051` | 큐익스프레스 |
| `0052` | Post Box |
| `0053` | 팀프레시 |
| `0054` | 롯데칠성 |
| `0055` | 농협택배 |
| `0056` | 카카오T당일배송 |

---

## 응답 예시

```json
{
  "orders": [
    {
      "shop_no": 1,
      "order_id": "20250112-0000001",
      "order_date": "2025-01-12T10:30:00+09:00",
      "order_status": "N20",
      "order_place_id": "naver",
      "order_place_name": "네이버 스마트스토어",
      "market_order_no": "2025011278523187",
      "market_cancel_request": "F",
      "currency": "KRW",
      "order_price_amount": "25000.00",
      "shipping_fee": "3000.00",
      "total_amount_due": "28000.00",
      "payment_method": "card",
      "paid": "T",
      "buyer": {
        "member_id": "user123",
        "name": "홍길동",
        "email": "hong@example.com",
        "cellphone": "010-1234-5678"
      },
      "receivers": [
        {
          "name": "홍길동",
          "cellphone": "010-1234-5678",
          "zipcode": "06234",
          "address1": "서울특별시 강남구 테헤란로 123",
          "address2": "101동 1001호",
          "shipping_message": "부재 시 경비실에 맡겨주세요"
        }
      ],
      "items": [
        {
          "order_item_code": "20250112-0000001-01",
          "product_no": 123,
          "product_code": "POSTCARD-A4",
          "product_name": "엽서 (맞춤인쇄)",
          "option_value": "A4 / 200g 아르떼 / 양면",
          "quantity": 1,
          "product_price": "25000.00",
          "order_status": "N20",
          "market_item_no": "2025011278523187-01"
        }
      ]
    }
  ],
  "links": [
    {
      "rel": "next",
      "href": "https://printly.cafe24api.com/api/v2/admin/orders?limit=10&offset=10"
    }
  ]
}
```

---

## Python 예제

```python
# 주문 목록 조회 (배송준비중, 외부몰 포함)
orders = client.get_orders(
    start_date="2025-01-01",
    end_date="2025-01-31",
    order_status="N20",  # 배송준비중
    embed=["items", "receivers", "buyer"]
)

# 스마트스토어 주문만 필터링
naver_orders = [
    order for order in orders 
    if order.get("order_place_id") == "naver"
]

# MES 작업지시 대상 추출
for order in naver_orders:
    for item in order.get("items", []):
        print(f"주문: {order['order_id']}")
        print(f"상품: {item['product_name']}")
        print(f"옵션: {item['option_value']}")
        print(f"수량: {item['quantity']}")
```
