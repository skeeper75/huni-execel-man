# Cafe24 API Rate Limit

## Leaky Bucket 알고리즘

Cafe24 API는 **Leaky Bucket** 알고리즘으로 요청 속도를 제한합니다.

### 기본 설정

| 항목 | 값 | 설명 |
|------|---|------|
| Bucket 크기 | 40 | 최대 버스트 요청 수 |
| Leak Rate | 2/초 | 초당 처리되는 요청 수 |
| 복구 시간 | 20초 | 빈 버킷에서 가득 찰 때까지 |

### 동작 방식

```
[요청] → [Bucket] → [처리]
           ↓
      (초당 2개 leak)
```

1. 요청이 들어오면 Bucket에 추가
2. Bucket이 가득 차면 429 에러 반환
3. 초당 2개씩 요청이 처리됨 (leak)
4. 처리된 만큼 Bucket에 여유 공간 생김

### 예시 시나리오

```
시간 0초: Bucket = 0/40
  → 순간적으로 30개 요청
시간 0초: Bucket = 30/40 ✅ 성공

시간 1초: 2개 leak → Bucket = 28/40
  → 15개 추가 요청
시간 1초: Bucket = 43/40 ❌ 3개 실패 (429)
```

## Rate Limit 응답

### 429 응답 시

```json
{
  "error": {
    "code": "too_many_request",
    "message": "Rate limit exceeded"
  }
}
```

### 응답 헤더

| 헤더 | 설명 |
|------|------|
| X-Api-Call-Limit | 현재 사용량 / 최대 허용량 (예: "35/40") |
| Retry-After | 재시도까지 대기 시간 (초) |

## 최적화 전략

### 1. 요청 간격 유지

```python
import time

class RateLimiter:
    def __init__(self, requests_per_second=2):
        self.min_interval = 1.0 / requests_per_second
        self.last_request = 0
    
    def wait(self):
        elapsed = time.time() - self.last_request
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request = time.time()

# 사용
limiter = RateLimiter()
for item in items:
    limiter.wait()
    api_call(item)
```

### 2. 배치 처리

```python
# ❌ 비효율적: 개별 요청
for order_id in order_ids:
    order = client.get_order(order_id)  # 100개 = 100번 요청

# ✅ 효율적: 배치 요청
orders = client.get_orders(order_ids=order_ids[:100])  # 1번 요청
```

### 3. Embed 파라미터 활용

```python
# ❌ 비효율적: 별도 요청
order = client.get_order(order_id)
items = client.get_order_items(order_id)
receivers = client.get_receivers(order_id)

# ✅ 효율적: Embed로 한 번에
order = client.get_order(order_id, embed=["items", "receivers"])
```

### 4. 조건부 요청 (If-None-Match)

변경되지 않은 데이터는 캐시 활용:

```python
# 첫 요청
response = requests.get(url, headers=headers)
etag = response.headers.get("ETag")

# 다음 요청
headers["If-None-Match"] = etag
response = requests.get(url, headers=headers)
if response.status_code == 304:
    # 변경 없음 - 캐시 사용
    pass
```

### 5. Exponential Backoff

```python
def request_with_backoff(url, max_retries=5):
    for attempt in range(max_retries):
        response = requests.get(url)
        
        if response.status_code == 429:
            wait_time = min(2 ** attempt, 60)  # 최대 60초
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
            continue
        
        return response
    
    raise Exception("Max retries exceeded")
```

## 동시 요청 관리

### asyncio 환경에서의 제한

```python
import asyncio
import aiohttp

class AsyncRateLimiter:
    def __init__(self, rate=2):
        self.rate = rate
        self.semaphore = asyncio.Semaphore(rate)
        self.lock = asyncio.Lock()
    
    async def acquire(self):
        async with self.lock:
            await self.semaphore.acquire()
            asyncio.create_task(self._release_after(1.0 / self.rate))
    
    async def _release_after(self, delay):
        await asyncio.sleep(delay)
        self.semaphore.release()

# 사용
limiter = AsyncRateLimiter(rate=2)

async def fetch(session, url):
    await limiter.acquire()
    async with session.get(url) as response:
        return await response.json()
```

## 권장 설정

| 상황 | 권장 요청 간격 | 비고 |
|------|--------------|------|
| 일반 조회 | 500ms | 초당 2회 안전 |
| 대량 처리 | 1000ms | 버스트 방지 |
| 실시간 동기화 | 300ms | 모니터링 필수 |
| 배치 작업 | 2000ms | 야간 권장 |

## 모니터링

```python
def monitor_rate_limit(response):
    limit_header = response.headers.get("X-Api-Call-Limit", "")
    if limit_header:
        current, maximum = map(int, limit_header.split("/"))
        usage_percent = (current / maximum) * 100
        
        if usage_percent > 80:
            print(f"⚠️ Rate limit warning: {usage_percent:.1f}% used")
        
        return current, maximum
    return None, None
```
