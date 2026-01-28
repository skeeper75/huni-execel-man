# Cafe24 ↔ MES 데이터 매핑

## 주문 데이터 매핑

### 기본 필드
| Cafe24 필드 | MES 필드 | 타입 | 설명 |
|-------------|----------|------|------|
| order_id | work_order_no | string | WO- 접두어 추가 |
| order_date | order_date | datetime | ISO 형식 |
| buyer.name | customer_name | string | 주문자명 |
| buyer.phone | customer_phone | string | 연락처 |
| buyer.email | customer_email | string | 이메일 |

### 품목 필드
| Cafe24 필드 | MES 필드 | 타입 | 설명 |
|-------------|----------|------|------|
| items[].product_name | item_name | string | 품목명 |
| items[].product_code | item_code | string | 품목코드 |
| items[].option_value | spec | object | 파싱 필요 |
| items[].quantity | qty | integer | 수량 |
| items[].product_price | unit_price | decimal | 단가 |

### 배송 필드
| Cafe24 필드 | MES 필드 | 타입 | 설명 |
|-------------|----------|------|------|
| receivers[].name | ship_to_name | string | 수령인 |
| receivers[].phone | ship_to_phone | string | 연락처 |
| receivers[].address1 + address2 | ship_to_address | string | 주소 |
| receivers[].zipcode | ship_to_zipcode | string | 우편번호 |
| shipping_message | remark | string | 배송 메모 |

## 인쇄 옵션 파싱

### 옵션 문자열 형식
```
"{판형}/{수량}/{인쇄면}/{후가공}"
예: "A4/100부/양면/무광코팅"
```

### 파싱 결과 구조
```json
{
  "size": "A4",
  "print_quantity": 100,
  "sides": "duplex",
  "coating": "matte",
  "binding": null,
  "paper": null
}
```

### 판형 코드
| 입력값 | MES 코드 | 크기(mm) |
|--------|----------|----------|
| A3 | A3 | 297×420 |
| A4 | A4 | 210×297 |
| A5 | A5 | 148×210 |
| B4 | B4 | 257×364 |
| B5 | B5 | 182×257 |

### 인쇄면 코드
| 입력값 | MES 코드 |
|--------|----------|
| 단면 | simplex |
| 양면 | duplex |

### 코팅 코드
| 입력값 | MES 코드 |
|--------|----------|
| 무광, 무코팅 | matte |
| 유광 | gloss |
| 코팅 | gloss |

### 제본 코드
| 입력값 | MES 코드 |
|--------|----------|
| 무선, 무선제본 | perfect |
| 중철 | saddle |
| 스프링 | spiral |
| 떡제본 | case |

### 용지 코드
| 입력값 | MES 코드 |
|--------|----------|
| 모조, 백상지 | offset |
| 아트지 | art |
| 스노우지 | snow |
| 랑데뷰 | rendezvous |

## 상태 매핑

### 주문 상태 → 작업 상태
| Cafe24 상태 | MES 상태 | 설명 |
|-------------|----------|------|
| N10 | PENDING | 작업 대기 |
| N20 | IN_PROGRESS | 작업 중 |
| N30 | SHIPPED | 출고 완료 |
| N40 | DELIVERED | 배송 완료 |
| C00~C34 | CANCELLED | 취소 |

### 작업 상태 → 주문 상태
| MES 상태 | Cafe24 상태 | 액션 |
|----------|-------------|------|
| PENDING | N10 | - |
| IN_PROGRESS | N10 | - |
| COMPLETED | N20 | - |
| SHIPPED | N30 | 송장 등록 |

## 재고 매핑

### 상품 코드 매칭
```python
# Cafe24 상품코드 → MES 품목코드
def map_product_code(cafe24_code: str) -> str:
    # 매핑 테이블 조회 또는 규칙 적용
    return mes_item_code

# 예시 매핑 규칙
# P000000001 → ITEM-001
# P000000002 → ITEM-002
```

### 재고 수량 동기화
```python
# MES → Cafe24 방향으로 동기화 (MES가 마스터)
def sync_inventory(mes_item_code: str, quantity: int):
    cafe24_code = reverse_map_product_code(mes_item_code)
    product = client.get_products(product_code=cafe24_code)[0]
    client.update_product_inventory(
        product_no=product["product_no"],
        variant_code=product["variants"][0]["variant_code"],
        quantity=quantity
    )
```

## 정산 데이터 매핑

### 주문 금액 필드
| Cafe24 필드 | MES 필드 | 설명 |
|-------------|----------|------|
| order_amount | total_amount | 주문 총액 |
| actual_payment | payment_amount | 실결제액 |
| shipping_fee | shipping_cost | 배송비 |
| discount_amount | discount | 할인액 |

### 정산 검증
```python
# 주문금액 일치 여부 확인
def verify_settlement(cafe24_order, mes_order):
    cafe24_amount = cafe24_order["actual_payment"]
    mes_amount = mes_order["payment_amount"]
    
    return {
        "order_id": cafe24_order["order_id"],
        "cafe24_amount": cafe24_amount,
        "mes_amount": mes_amount,
        "match": cafe24_amount == mes_amount,
        "diff": cafe24_amount - mes_amount
    }
```
