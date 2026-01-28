# Shipments API 상세 스펙

배송/송장 관련 엔드포인트의 전체 요청/응답 파라미터 상세.

---

## POST /api/v2/admin/shipments

다건 송장 일괄 등록

### Request Body

```json
{
  "shop_no": 1,
  "request": [
    {
      "order_id": "20250112-0000001",
      "shipping_company_code": "0019",
      "tracking_no": "123456789012",
      "order_item_code": ["20250112-0000001-01"],
      "status": "shipped"
    },
    {
      "order_id": "20250112-0000002",
      "shipping_company_code": "0019",
      "tracking_no": "123456789013",
      "status": "shipped"
    }
  ]
}
```

### Request Fields

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| `order_id` | string | Y | 주문번호 | |
| `shipping_company_code` | string | Y | 택배사 코드 | 코드표 참조 |
| `tracking_no` | string | Y | 송장번호 | 최대 30자 |
| `order_item_code` | array | N | 품목코드 목록 | 생략시 전체 품목 |
| `status` | string | N | 배송상태 | `standby`, `shipped`, `delivered` |
| `shipping_date` | string | N | 발송일 | YYYY-MM-DD |

### Response

```json
{
  "shipments": [
    {
      "shop_no": 1,
      "order_id": "20250112-0000001",
      "shipping_code": "S0001",
      "shipping_company_code": "0019",
      "shipping_company_name": "CJ대한통운",
      "tracking_no": "123456789012",
      "status": "shipped",
      "status_text": "배송중"
    }
  ]
}
```

---

## PUT /api/v2/admin/shipments

다건 송장 일괄 수정

### Request Body

```json
{
  "shop_no": 1,
  "request": [
    {
      "order_id": "20250112-0000001",
      "shipping_code": "S0001",
      "shipping_company_code": "0002",
      "tracking_no": "987654321098"
    }
  ]
}
```

---

## POST /api/v2/admin/orders/{order_id}/shipments

개별 주문 송장 등록

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| `order_id` | string | Y | 주문번호 |

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "tracking_no": "123456789012",
    "shipping_company_code": "0019",
    "status": "shipped",
    "order_item_code": ["20250112-0000001-01", "20250112-0000001-02"],
    "shipping_date": "2025-01-12"
  }
}
```

### Request Fields

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|:----:|------|---------|
| `tracking_no` | string | Y | 송장번호 | 최대 30자 |
| `shipping_company_code` | string | Y | 택배사 코드 | 코드표 참조 |
| `status` | string | N | 배송 상태 | `standby`, `shipped`, `delivered` |
| `order_item_code` | array | N | 적용 품목코드 | 생략시 전체 품목 |
| `shipping_date` | string | N | 발송일 | YYYY-MM-DD |

### Response

```json
{
  "shipment": {
    "shop_no": 1,
    "order_id": "20250112-0000001",
    "shipping_code": "S0001",
    "tracking_no": "123456789012",
    "shipping_company_code": "0019",
    "shipping_company_name": "CJ대한통운",
    "status": "shipped",
    "shipping_date": "2025-01-12T10:00:00+09:00",
    "order_item_code": ["20250112-0000001-01", "20250112-0000001-02"]
  }
}
```

---

## GET /api/v2/admin/orders/{order_id}/shipments

주문 배송정보 조회

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| `order_id` | string | Y | 주문번호 |

### Response

```json
{
  "shipments": [
    {
      "shop_no": 1,
      "shipping_code": "S0001",
      "tracking_no": "123456789012",
      "shipping_company_code": "0019",
      "shipping_company_name": "CJ대한통운",
      "status": "shipped",
      "status_text": "배송중",
      "shipping_date": "2025-01-12T10:00:00+09:00",
      "delivery_date": null,
      "order_item_code": ["20250112-0000001-01"]
    }
  ]
}
```

---

## PUT /api/v2/admin/orders/{order_id}/shipments/{shipping_code}

주문 배송정보 수정

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| `order_id` | string | Y | 주문번호 |
| `shipping_code` | string | Y | 배송코드 |

### Request Body

```json
{
  "shop_no": 1,
  "request": {
    "tracking_no": "987654321098",
    "shipping_company_code": "0002",
    "status": "shipped"
  }
}
```

---

## DELETE /api/v2/admin/orders/{order_id}/shipments/{shipping_code}

주문 배송정보 삭제

### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| `order_id` | string | Y | 주문번호 |
| `shipping_code` | string | Y | 배송코드 |

### Response

```json
{
  "shipment": {
    "shop_no": 1,
    "order_id": "20250112-0000001",
    "shipping_code": "S0001"
  }
}
```

---

## POST /api/v2/admin/fulfillments

Fulfillment 방식 다건 송장 등록

외부 풀필먼트 서비스 연동용 API

### Request Body

```json
{
  "shop_no": 1,
  "request": [
    {
      "order_id": "20250112-0000001",
      "shipping_company_code": "0019",
      "tracking_no": "123456789012",
      "status": "shipped",
      "order_item_code": ["20250112-0000001-01"],
      "shipping_date": "2025-01-12",
      "carrier_memo": "풀필먼트 센터 발송"
    }
  ]
}
```

---

## 택배사 코드 (shipping_company_code)

### 주요 국내 택배사

| 코드 | 택배사명 | 비고 |
|------|---------|------|
| `0019` | CJ대한통운 | ⭐ 가장 많이 사용 |
| `0002` | 롯데택배 | |
| `0003` | 한진택배 | |
| `0004` | 로젠택배 | |
| `0001` | 우체국택배 | |
| `0017` | 경동택배 | |
| `0016` | 대신택배 | |
| `0018` | 합동택배 | |
| `0020` | 천일택배 | |
| `0011` | 일양로지스 | |
| `0031` | KGL네트웍스 | |
| `0039` | GS NETWORKS | |
| `0040` | 홈픽택배 | |
| `0046` | CU편의점택배 | |
| `0050` | CVS편의점택배 | |
| `0038` | 농협택배 | |

### 퀵/당일배송

| 코드 | 택배사명 | 비고 |
|------|---------|------|
| `0056` | 카카오T당일배송 | |
| `0048` | 홈픽 | |
| `0049` | 두발히어로 | |
| `0053` | 팀프레시 | |
| `0047` | 우리동네택배 | |

### 해외배송

| 코드 | 택배사명 | 비고 |
|------|---------|------|
| `0012` | EMS | 우체국 국제특송 |
| `0013` | DHL | |
| `0014` | UPS | |
| `0015` | FedEx | |
| `0027` | TNT Express | |
| `0028` | USPS | 미국 우편 |
| `0051` | 큐익스프레스 | |

---

## 배송 상태 코드 (status)

| 코드 | 설명 | 주문상태 변경 |
|------|------|-------------|
| `standby` | 배송대기 | N21 (배송대기) |
| `shipped` | 배송중 | N30 (배송중) |
| `delivered` | 배송완료 | N40 (배송완료) |

---

## 배송 상태 흐름

```
송장등록 (status=shipped)
       ↓
    N20 → N30 (배송중)
       ↓
  배송완료 처리
       ↓
    N30 → N40 (배송완료)
       ↓
  구매확정 (자동/수동)
       ↓
    N40 → N50 (구매확정)
```

---

## MES 연동 예시 코드

### 생산완료 → 송장등록

```python
from cafe24_auth import Cafe24Auth
from cafe24_client import Cafe24Client
from datetime import datetime

# 인증 초기화
auth = Cafe24Auth(
    mall_id="printly",
    client_id="your_client_id",
    client_secret="your_client_secret"
)
client = Cafe24Client(auth)

def register_shipment_from_mes(mes_production_data):
    """
    MES 생산완료 데이터로 송장 등록
    
    Args:
        mes_production_data: {
            "order_id": "20250112-0000001",
            "tracking_no": "123456789012",
            "carrier": "CJ대한통운",
            "items": ["20250112-0000001-01"]
        }
    """
    # 택배사 코드 매핑
    carrier_codes = {
        "CJ대한통운": "0019",
        "롯데택배": "0002",
        "한진택배": "0003",
        "로젠택배": "0004",
        "우체국택배": "0001"
    }
    
    carrier_code = carrier_codes.get(
        mes_production_data["carrier"], 
        "0019"  # 기본값: CJ대한통운
    )
    
    # 송장 등록
    result = client.register_shipment(
        order_id=mes_production_data["order_id"],
        tracking_no=mes_production_data["tracking_no"],
        shipping_company_code=carrier_code,
        order_item_code=mes_production_data.get("items")
    )
    
    return result

# 사용 예시
production_complete = {
    "order_id": "20250112-0000001",
    "tracking_no": "123456789012",
    "carrier": "CJ대한통운",
    "items": ["20250112-0000001-01"]
}

result = register_shipment_from_mes(production_complete)
print(f"송장 등록 완료: {result}")
```

### 일괄 송장 등록

```python
def bulk_register_shipments(shipment_list):
    """
    여러 주문 일괄 송장 등록
    
    Args:
        shipment_list: [
            {"order_id": "...", "tracking_no": "...", "carrier_code": "0019"},
            ...
        ]
    """
    request_data = []
    for item in shipment_list:
        request_data.append({
            "order_id": item["order_id"],
            "tracking_no": item["tracking_no"],
            "shipping_company_code": item["carrier_code"],
            "status": "shipped"
        })
    
    # 일괄 등록 API 호출
    response = client._request(
        "POST",
        "/shipments",
        data={"request": request_data}
    )
    
    return response

# 사용 예시
shipments = [
    {"order_id": "20250112-0000001", "tracking_no": "123456789012", "carrier_code": "0019"},
    {"order_id": "20250112-0000002", "tracking_no": "123456789013", "carrier_code": "0019"},
    {"order_id": "20250112-0000003", "tracking_no": "123456789014", "carrier_code": "0002"}
]

results = bulk_register_shipments(shipments)
print(f"일괄 등록 완료: {len(results.get('shipments', []))}건")
```

### 외부몰(스마트스토어) 송장 동기화

```python
def sync_shipment_to_marketplace(order_id, tracking_no, carrier_code):
    """
    송장 등록 시 외부몰에도 자동 동기화됨
    (마켓플러스 연동 주문의 경우)
    """
    # 주문 정보 조회
    order = client.get_order(order_id)
    
    # 외부몰 주문인지 확인
    if order.get("order_place_id") != "self":
        print(f"외부몰 주문: {order.get('order_place_name')}")
        print(f"외부몰 주문번호: {order.get('market_order_no')}")
    
    # 송장 등록 (외부몰 자동 동기화)
    result = client.register_shipment(
        order_id=order_id,
        tracking_no=tracking_no,
        shipping_company_code=carrier_code
    )
    
    # 동기화 결과 확인
    # - 스마트스토어: 발송처리로 자동 상태 변경
    # - 쿠팡: 출고완료로 자동 상태 변경
    
    return result
```

---

## 에러 케이스 및 대응

| 에러 메시지 | 원인 | 대응 방법 |
|------------|------|----------|
| `이미 배송 처리된 주문` | 이미 N30/N40 상태 | 중복 등록 확인, PUT으로 수정 |
| `주문을 찾을 수 없음` | 잘못된 order_id | 주문번호 형식 확인 |
| `유효하지 않은 택배사` | 잘못된 carrier_code | 택배사 코드표 확인 |
| `송장번호 형식 오류` | 형식 불일치 | 택배사별 송장번호 형식 확인 |
| `취소된 주문` | C00~C40 상태 | 취소 주문 제외 처리 |
| `품목코드 오류` | 존재하지 않는 품목 | order_item_code 확인 |

### 에러 처리 예시

```python
def safe_register_shipment(order_id, tracking_no, carrier_code):
    """안전한 송장 등록 (에러 처리 포함)"""
    try:
        # 주문 상태 확인
        order = client.get_order(order_id)
        status = order.get("order_status", "")
        
        # 송장 등록 가능 상태 확인
        if status.startswith("C") or status.startswith("R"):
            return {"success": False, "reason": f"취소/반품 주문: {status}"}
        
        if status in ["N30", "N40", "N50"]:
            return {"success": False, "reason": f"이미 배송처리됨: {status}"}
        
        # 송장 등록
        result = client.register_shipment(
            order_id=order_id,
            tracking_no=tracking_no,
            shipping_company_code=carrier_code
        )
        
        return {"success": True, "data": result}
        
    except Exception as e:
        return {"success": False, "reason": str(e)}
```

---

## 주의사항

1. **송장번호 형식**: 택배사별로 다름 (보통 10~15자리 숫자)
2. **중복 등록**: 동일 주문에 여러 송장 등록 가능 (분할 배송)
3. **상태 자동 변경**: 송장 등록 시 N30으로 자동 변경
4. **삭제 제한**: 배송완료(N40) 후에는 삭제 불가
5. **외부몰 연동**: 스마트스토어 등 외부몰도 송장 등록 시 자동 동기화
6. **Rate Limit**: 일괄 등록 시에도 요청당 처리 (버킷 소비 주의)
