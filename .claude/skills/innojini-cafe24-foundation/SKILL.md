---
name: innojini-cafe24-foundation
description: |
  Cafe24 API 전체 레퍼런스. Admin API(165개 리소스), Front API(20개 리소스) 완전 문서화.
  특화 스킬(주문연동, 상품연동, 정산 등)의 기반 스킬.
  
  🔹 전체: "Cafe24 API", "카페24 API", "Cafe24 개발"
  🔹 인증: "OAuth", "토큰 발급", "인증 흐름", "Access Token"
  🔹 Admin: "Admin API", "관리자 API", "쇼핑몰 관리"
  🔹 Front: "Front API", "프론트 API", "고객용 API"
  🔹 에러: "에러 코드", "Rate Limit", "429", "401"
---

# Cafe24 Foundation

Cafe24 API 전체 레퍼런스. Admin API(165개 리소스), Front API(20개 리소스) 완전 문서화.
특화 스킬(주문연동, 상품연동, 정산 등)의 기반 스킬.

## Quick Reference

### Base URLs
```
Admin API: https://{mall_id}.cafe24api.com/api/v2/admin/
Front API: https://{mall_id}.cafe24api.com/api/v2/
```

### API 버전
- **최신 버전**: 2024-06-01
- **헤더**: `X-Cafe24-Api-Version: 2024-06-01`
- **버전 만료**: 최신 릴리즈 후 최대 1년

### 인증 (Admin API만)
```python
# Authorization 헤더
Authorization: Bearer {access_token}
Content-Type: application/json
X-Cafe24-Api-Version: 2024-06-01
```

## API 규모 요약

| API 유형 | 도메인 | 리소스 | 엔드포인트 | 인증 |
|----------|--------|--------|-----------|------|
| Admin API | 11개 | ~165개 | ~400개 | OAuth 2.0 |
| Front API | 5개 | ~20개 | ~50개 | 불필요 |

## Admin API 도메인 (11개)

| 도메인 | 리소스 수 | 주요 기능 | 개요 | 상세 스펙 |
|--------|----------|----------|------|----------|
| Store | 51개 | 쇼핑몰 설정, 결제, 정책 | `admin-api/store.md` | - |
| Product | 22개 | 상품, 옵션, 재고, 이미지 | `admin-api/product.md` | ⭐ `products-spec.md` |
| Order | 38개 | 주문, 배송, 클레임, 정산 | `admin-api/order.md` | ⭐ `orders-spec.md` |
| Shipments | - | 송장 등록, 배송 관리 | `admin-api/order.md` | ⭐ `shipments-spec.md` |
| Customer | 10개 | 회원, 등급, 메모 | `admin-api/others.md` | - |
| Community | 9개 | 게시판, 리뷰, 문의 | `admin-api/others.md` | - |
| Design | 3개 | 테마, 아이콘, 페이지 | `admin-api/others.md` | - |
| Promotion | 10개 | 쿠폰, 혜택, 할인코드 | `admin-api/others.md` | - |
| Application | 7개 | 앱, 스크립트, 웹훅 | `admin-api/others.md` | - |
| Category | 6개 | 카테고리, 메인분류 | `admin-api/others.md` | - |
| Collection | 5개 | 브랜드, 제조사, 원산지 | `admin-api/others.md` | - |
| Supply | 4개 | 공급사, 배송설정 | `admin-api/others.md` | - |

## ⭐ 상세 스펙 파일 (전체 파라미터)

MES 연동 핵심 API의 **전체 요청/응답 파라미터** 상세:

| 파일 | 내용 | 주요 포함 항목 |
|------|------|---------------|
| `admin-api/orders-spec.md` | Orders API 전체 스펙 | 40+ 검색파라미터, Order/Buyer/Receiver/Item 응답필드, 주문상태 18개, 결제수단 20개, 외부몰 13개, 택배사 56개 |
| `admin-api/products-spec.md` | Products API 전체 스펙 | 30+ 검색파라미터, Product/Variant/Option 응답필드, 옵션유형 5개, 상품상태 6개, 승인상태 5개, 배송비유형 8개 |
| `admin-api/shipments-spec.md` | Shipments API 전체 스펙 | 일괄/개별 송장등록, MES연동 코드예시, 택배사 코드 전체, 에러처리 가이드 |

## Front API 도메인 (5개)

| 도메인 | 리소스 수 | 주요 기능 | 상세 |
|--------|----------|----------|------|
| Category | 2개 | 카테고리 조회 | `front-api/index.md` |
| Product | 6개 | 상품 조회, 품목 | `front-api/index.md` |
| Cart | 2개 | 장바구니 | `front-api/index.md` |
| Customer | 3개 | 회원정보 | `front-api/index.md` |
| Board | 2개 | 게시판 | `front-api/index.md` |

## 공통 레퍼런스

| 문서 | 내용 |
|------|------|
| `references/authentication.md` | OAuth 2.0 인증 흐름 상세 |
| `references/error-codes.md` | HTTP 상태코드 및 비즈니스 에러 |
| `references/rate-limit.md` | Rate Limit 정책 및 대응 |
| `references/versioning.md` | API 버전 관리 정책 |

## 스크립트

| 파일 | 용도 |
|------|------|
| `scripts/cafe24_auth.py` | OAuth 인증 클라이언트 |
| `scripts/cafe24_client.py` | API 호출 기본 클라이언트 |

## 관련 특화 스킬

| 스킬 | 용도 | Foundation 참조 영역 |
|------|------|---------------------|
| `cafe24-api-integration` | 기존 MES 연동 | Order, Product |
| `smartstore-mes-integration` | 스마트스토어 MES 연동 | Order, Marketplus |

## 사용 패턴

### 1. 주문 목록 가져오기
```python
from cafe24_auth import Cafe24Auth
from cafe24_client import Cafe24Client

# 인증 초기화
auth = Cafe24Auth(
    mall_id="your_mall_id",
    client_id="your_client_id",
    client_secret="your_client_secret"
)

# 클라이언트 생성
client = Cafe24Client(auth)

# 주문 조회 (배송준비중)
orders = client.get_orders(
    start_date="2024-01-01",
    end_date="2024-01-31",
    order_status="N20",
    embed=["items", "receivers"]
)

for order in orders:
    print(f"주문번호: {order['order_id']}")
    print(f"주문자: {order['buyer_name']}")
```

### 2. 상품 재고 조회/수정
```python
# 재고 조회
inventory = client.get_product_inventory(product_no=123)
print(f"현재 재고: {inventory[0]['quantity']}")

# 재고 수정
client.update_product_inventory(
    product_no=123,
    variant_code="P000000A000A",
    quantity=50
)
```

### 3. 송장 등록
```python
# 송장 등록
client.register_shipment(
    order_id="20241201-0000001",
    tracking_no="123456789012",
    shipping_company_code="0019"  # CJ대한통운
)
```

## 주문 상태 코드 (빠른 참조)

```
입금/배송:
  N00: 입금전 → N10: 상품준비중 → N20: 배송준비중 → N30: 배송중 → N40: 배송완료 → N50: 구매확정

취소:
  C00: 취소신청 → C10: 취소접수(환불전) → C34: 취소완료(환불완료)

반품:
  R00: 반품신청 → R10: 반품접수 → R12: 수거중 → R13: 수거완료 → R30: 반품완료(환불전) → R34: 반품완료(환불완료)

교환:
  E00: 교환신청 → E10: 교환접수 → E20: 교환준비 → E30: 교환배송중 → E40: 교환완료
```

## 택배사 코드 (빠른 참조)

| 택배사 | 코드 |
|--------|------|
| CJ대한통운 | 0019 |
| 롯데택배 | 0002 |
| 한진택배 | 0003 |
| 로젠택배 | 0004 |
| 우체국택배 | 0005 |
| 경동택배 | 0014 |

## 환경 변수 설정

```bash
CAFE24_MALL_ID=your_mall_id
CAFE24_CLIENT_ID=your_client_id
CAFE24_CLIENT_SECRET=your_client_secret
CAFE24_REDIRECT_URI=https://your-app.com/callback
```
