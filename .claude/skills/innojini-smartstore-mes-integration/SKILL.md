---
name: smartstore-mes-integration
description: |
  네이버 스마트스토어-Printly MES 연동 스킬. Cafe24 마켓플러스를 통한 주문 동기화, 배송 처리, 재고 관리, 정산 분석.
  
  🔹 주문: "스마트스토어 주문", "네이버 주문 조회", "주문 동기화", "발주확인"
  🔹 배송: "네이버 배송", "송장 등록", "배송추적", "출고 처리"
  🔹 재고: "스마트스토어 재고", "재고 동기화", "품절 처리"
  🔹 클레임: "취소 처리", "반품 접수", "교환 처리"
  🔹 정산: "스마트스토어 정산", "정산 분석", "매출 리포트"
  🔹 MES: "MES 작업지시", "인쇄 공정", "생산 연동"
  
  사용 시점: (1) 스마트스토어 주문→MES 작업지시 연동, (2) MES 생산완료→배송 처리, (3) 정산 데이터 분석
  의존 스킬: cafe24-api-integration
---

# SmartStore MES Integration

Printly MES 시스템과 네이버 스마트스토어 연동. Cafe24 마켓플러스 기반.

## Architecture

```
[스마트스토어 주문]
       ↓ (네이버 커머스 API)
[Cafe24 마켓플러스] ← 자동 주문 수집
       ↓
[Cafe24 Admin API] ← cafe24-api-integration 스킬
       ↓
[smartstore-mes-integration] ← 이 스킬
       ↓
[Printly MES]
   ├── 작업지시 생성
   ├── 인쇄 공정 처리
   ├── 생산 완료
   └── 배송 처리
```

## Quick Start

### 주문 동기화
```python
from order_sync import SmartStoreOrderSync

sync = SmartStoreOrderSync(cafe24_client)

# 신규 주문 수집 (배송준비중 상태)
new_orders = sync.get_pending_orders()

# MES 작업지시로 변환
for order in new_orders:
    work_order = sync.create_work_order(order)
    # MES에 작업지시 등록
```

### 배송 처리
```python
from shipment_processor import ShipmentProcessor

processor = ShipmentProcessor(cafe24_client)

# 생산 완료 건 배송 처리
processor.register_shipment(
    order_id="20241205-0000001",
    tracking_no="123456789012",
    carrier="CJ대한통운"
)
```

## Core Workflows

### 1. 주문→생산 플로우
상세 워크플로우: `references/order-workflow.md` 참조

```
[스마트스토어 주문 발생]
       ↓
[마켓플러스 자동 수집] 
       ↓ (N00→N10 자동 변경)
[MES 주문 조회] 
       ↓ GET /orders?order_status=N10
[작업지시 생성]
   ├── 주문 파싱 (옵션/수량/납기)
   ├── 조판 계산 (huni-printing-estimator 연계)
   └── 공정 스케줄링
```

### 2. 생산→배송 플로우

```
[MES 생산 완료]
       ↓
[출고 지시]
       ↓
[송장 등록] POST /orders/{id}/shipments
       ↓
[마켓플러스→스마트스토어 자동 전송]
       ↓
[고객 배송 알림]
```

### 3. 재고 동기화

```
[MES 재고 변동]
   ├── 생산 완료 (+)
   └── 자재 사용 (-)
       ↓
[Cafe24 재고 업데이트]
       ↓
[마켓플러스→스마트스토어 동기화]
```

## MES Data Mapping

주문 데이터 → 작업지시 매핑: `references/data-mapping.md` 참조

### 필수 매핑 필드
| Cafe24 필드 | MES 필드 | 설명 |
|-------------|----------|------|
| order_id | work_order_no | 작업지시 번호 |
| order_date | order_date | 주문일 |
| product_name | item_name | 품목명 |
| option_value | spec | 옵션/사양 |
| quantity | qty | 수량 |
| shipping_message | remark | 배송 메시지 |

### 인쇄 옵션 파싱 예시
```python
# 스마트스토어 옵션: "A4/100부/양면/무광코팅"
def parse_print_options(option_str):
    parts = option_str.split("/")
    return {
        "size": parts[0],      # A4
        "quantity": parts[1],   # 100부
        "sides": parts[2],      # 양면
        "coating": parts[3]     # 무광코팅
    }
```

## Claim Processing

### 취소 처리
```python
from claim_processor import ClaimProcessor

claim = ClaimProcessor(cafe24_client)

# 취소 가능 여부 확인
if claim.can_cancel(order_id):
    claim.process_cancellation(order_id, reason="고객 요청")
```

### 반품/교환 처리
```python
# 반품 접수
claim.process_return(order_id, items=[...])

# 교환 처리
claim.process_exchange(order_id, items=[...], new_items=[...])
```

## Settlement Analysis

huni-printing-estimator 스킬과 연계하여 정산 분석:

```python
# 스마트스토어 정산 데이터 조회
settlements = sync.get_settlements(
    start_date="2024-12-01",
    end_date="2024-12-31"
)

# 주문 데이터와 매칭
matched = settlement_analyzer.match_orders(settlements, orders)

# 불일치 건 확인
discrepancies = settlement_analyzer.find_discrepancies(matched)
```

## Configuration

### 마켓플러스 설정 (필수)
상세 설정: `references/marketplus-setup.md` 참조

**중요:** 스마트스토어 API 대행사 설정에서 **Cafe24를 첫 번째**로 지정 필수

### 환경 변수
```bash
# cafe24-api-integration 스킬 환경변수 + 추가 설정
MES_API_URL=https://mes.printly.io/api
MES_API_KEY=your_mes_api_key
```

## Dependencies

- cafe24-api-integration (필수)
- huni-printing-estimator (선택, 정산 분석 시)

## Limitations

⚠️ **마켓플러스 제약사항:**
1. 연동 이전 주문 데이터 수집 불가
2. 리뷰/톡톡 상담 API 미지원
3. 네이버 커머스 API Rate Limit: 초당 2회

## Related Skills

- `cafe24-api-integration`: 기반 API 클라이언트
- `huni-printing-estimator`: 인쇄 견적/정산 분석
