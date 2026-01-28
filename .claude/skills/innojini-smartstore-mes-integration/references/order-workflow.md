# 주문-생산-배송 워크플로우

## 전체 플로우

```
[스마트스토어]          [마켓플러스]          [Cafe24]          [MES]
     │                      │                   │                │
     │  주문 발생            │                   │                │
     ├─────────────────────>│                   │                │
     │                      │  자동 수집         │                │
     │                      ├─────────────────>│                │
     │                      │                   │  N00→N10       │
     │                      │                   ├───────────────>│ 주문 조회
     │                      │                   │                │
     │                      │                   │<───────────────┤ 작업지시 생성
     │                      │                   │                │
     │                      │                   │                │ 생산 진행
     │                      │                   │                │
     │                      │                   │<───────────────┤ 생산 완료
     │                      │                   │  송장 등록      │
     │                      │<─────────────────┤                │
     │  배송 알림            │                   │                │
     │<─────────────────────┤                   │                │
```

## 주문 상태 흐름

### 정상 플로우
```
N00 (입금전)
 ↓ 입금 확인
N10 (상품준비중) ← MES 작업지시 생성 시점
 ↓ 발주 확인 (마켓플러스 자동)
N20 (배송준비중)
 ↓ 송장 등록
N30 (배송중)
 ↓ 배송 완료
N40 (배송완료)
 ↓ 구매 확정
N50 (구매확정)
```

### 취소 플로우
```
N00/N10/N20 → C00 (취소신청) → C10 (취소접수) → C34 (취소완료)
```

### 반품 플로우
```
N30/N40 → R00 (반품신청) → R10 (반품접수) → R12 (수거중) → R13 (수거완료) → R34 (반품완료)
```

### 교환 플로우
```
N30/N40 → E00 (교환신청) → E10 (교환접수) → E20 (교환준비) → E30 (교환배송중) → E40 (교환완료)
```

## MES 연동 시점

### 1. 주문 수집 (N10)
```python
# 주기적으로 실행 (예: 5분마다)
orders = sync.get_pending_orders(status="N10")
for order in orders:
    work_order = sync.create_work_order(order)
    mes.create_work_order(work_order)
```

### 2. 생산 완료 → 송장 등록
```python
# MES에서 생산 완료 이벤트 발생 시
def on_production_complete(work_order_no, tracking_no):
    bridge = MESShipmentBridge(processor)
    result = bridge.process_production_complete(
        work_order_no=work_order_no,
        tracking_no=tracking_no,
        carrier="CJ대한통운"
    )
```

### 3. 재고 동기화
```python
# MES 재고 변동 시
def on_inventory_change(product_code, new_quantity):
    # Cafe24 상품 조회
    products = client.get_products(product_code=product_code)
    if products:
        product = products[0]
        client.update_product_inventory(
            product_no=product["product_no"],
            variant_code=product["variant_code"],
            quantity=new_quantity
        )
```

## 에러 처리

### 주문 수집 실패
- Rate Limit: 대기 후 재시도
- 네트워크 오류: 지수 백오프
- 인증 오류: 토큰 갱신 후 재시도

### 송장 등록 실패
- 이미 등록됨: 스킵
- 잘못된 송장번호: 로그 기록 + 알림
- 주문 없음: 주문 ID 확인

### 재고 동기화 실패
- 상품 없음: 매핑 테이블 확인
- 수량 오류: 범위 검증

## 모니터링 포인트

| 지표 | 임계값 | 알림 |
|------|--------|------|
| 미처리 주문 | > 50건 | Slack 알림 |
| 송장 등록 실패율 | > 5% | 이메일 알림 |
| API 응답 시간 | > 3초 | 로그 기록 |
| Rate Limit 횟수 | > 10회/시간 | 요청 간격 조정 |
