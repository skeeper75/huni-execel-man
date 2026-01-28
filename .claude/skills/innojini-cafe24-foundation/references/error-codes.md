# Cafe24 API 에러 코드

## HTTP 상태 코드

### 클라이언트 에러 (4xx)

| 상태코드 | 의미 | 원인 | 대응 방법 |
|---------|------|------|----------|
| 400 | Bad Request | 잘못된 요청 형식, 필수 파라미터 누락 | 요청 파라미터 검증 |
| 401 | Unauthorized | 인증 실패, 토큰 만료 | 토큰 갱신 후 재시도 |
| 403 | Forbidden | 권한 부족 (Scope 부족) | 필요한 Scope 확인 |
| 404 | Not Found | 리소스 없음 | ID/코드 확인 |
| 409 | Conflict | 리소스 충돌 (중복 데이터 등) | 기존 데이터 확인 |
| 422 | Unprocessable Entity | 비즈니스 로직 오류 | 에러 메시지 상세 확인 |
| 429 | Too Many Requests | Rate Limit 초과 | 대기 후 재시도 |

### 서버 에러 (5xx)

| 상태코드 | 의미 | 원인 | 대응 방법 |
|---------|------|------|----------|
| 500 | Internal Server Error | 서버 내부 오류 | Exponential backoff로 재시도 |
| 502 | Bad Gateway | 게이트웨이 오류 | 잠시 후 재시도 |
| 503 | Service Unavailable | 서비스 점검 중 | 점검 완료 후 재시도 |
| 504 | Gateway Timeout | 요청 시간 초과 | 대기 후 재시도 |

## 에러 응답 형식

```json
{
  "error": {
    "code": "에러코드",
    "message": "에러 설명",
    "more_info": {
      "field": "필드명",
      "reason": "상세 사유"
    }
  }
}
```

## 비즈니스 에러 코드

### 인증 관련

| 에러 코드 | HTTP 상태 | 설명 | 대응 |
|----------|----------|------|------|
| invalid_token | 401 | 토큰이 유효하지 않음 | 토큰 재발급 |
| expired_token | 401 | 토큰 만료 | Refresh Token으로 갱신 |
| invalid_grant | 401 | Refresh Token 만료 | 재인증 필요 |
| insufficient_scope | 403 | Scope 권한 부족 | 앱 권한 확인 |

### 주문 관련

| 에러 코드 | HTTP 상태 | 설명 | 대응 |
|----------|----------|------|------|
| order_not_found | 404 | 주문번호 없음 | 주문번호 확인 |
| invalid_order_status | 422 | 주문 상태 변경 불가 | 현재 상태 확인 |
| shipment_already_exists | 409 | 이미 송장 등록됨 | 기존 송장 확인 |
| invalid_tracking_no | 422 | 잘못된 송장번호 | 송장번호 형식 확인 |
| invalid_shipping_company | 422 | 잘못된 택배사 코드 | 택배사 코드 확인 |

### 상품 관련

| 에러 코드 | HTTP 상태 | 설명 | 대응 |
|----------|----------|------|------|
| product_not_found | 404 | 상품번호 없음 | 상품번호 확인 |
| variant_not_found | 404 | 품목코드 없음 | 품목코드 확인 |
| invalid_inventory | 422 | 재고 수량 오류 | 음수/최대값 확인 |
| duplicate_product_code | 409 | 중복 상품코드 | 상품코드 변경 |

### 고객 관련

| 에러 코드 | HTTP 상태 | 설명 | 대응 |
|----------|----------|------|------|
| customer_not_found | 404 | 회원 없음 | 회원 ID 확인 |
| duplicate_member_id | 409 | 중복 회원 ID | ID 변경 |

### 파라미터 관련

| 에러 코드 | HTTP 상태 | 설명 | 대응 |
|----------|----------|------|------|
| required_param_missing | 400 | 필수 파라미터 누락 | 파라미터 확인 |
| invalid_param_format | 400 | 파라미터 형식 오류 | 형식 확인 (날짜, 숫자 등) |
| invalid_param_value | 400 | 파라미터 값 오류 | 허용값 확인 |
| param_too_long | 400 | 파라미터 길이 초과 | 최대 길이 확인 |

## 에러 처리 예제

```python
import requests
import time

class Cafe24APIError(Exception):
    def __init__(self, status_code, error_code, message):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        super().__init__(f"[{status_code}] {error_code}: {message}")

def handle_response(response):
    if response.status_code >= 400:
        try:
            error = response.json().get("error", {})
            raise Cafe24APIError(
                response.status_code,
                error.get("code", "unknown"),
                error.get("message", "Unknown error")
            )
        except ValueError:
            raise Cafe24APIError(
                response.status_code,
                "unknown",
                response.text
            )
    return response.json()

def api_request_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers)
            
            # Rate Limit 처리
            if response.status_code == 429:
                wait_time = 2 ** attempt
                print(f"Rate limit hit, waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            
            # 토큰 만료 처리
            if response.status_code == 401:
                # refresh_token() 호출
                continue
            
            return handle_response(response)
            
        except requests.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise
    
    raise Exception("Max retries exceeded")
```

## 재시도 전략

### Exponential Backoff

```python
def exponential_backoff(attempt, base=2, max_wait=60):
    wait_time = min(base ** attempt, max_wait)
    return wait_time

# 사용 예시
for attempt in range(5):
    try:
        result = api_call()
        break
    except RateLimitError:
        wait = exponential_backoff(attempt)
        time.sleep(wait)
```

### 재시도 해야 하는 경우

| 상황 | 재시도 여부 | 대기 시간 |
|------|-----------|----------|
| 429 Rate Limit | ✅ | Exponential backoff |
| 500 Server Error | ✅ | 1-5초 후 |
| 502/503/504 | ✅ | 5-30초 후 |
| 401 Token Expired | ✅ (갱신 후) | 즉시 |
| 400 Bad Request | ❌ | - |
| 404 Not Found | ❌ | - |
| 422 Validation | ❌ | - |
