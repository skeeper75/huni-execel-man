# Cafe24 API 버전 관리

## 버전 관리 정책

### 버전 형식
```
YYYY-MM-DD
예: 2024-06-01
```

### 버전 지정 방법

모든 API 요청에 버전 헤더 포함:

```
X-Cafe24-Api-Version: 2024-06-01
```

### 버전 수명 주기

| 상태 | 설명 | 기간 |
|------|------|------|
| Current | 현재 활성 버전 | 무기한 |
| Supported | 지원 중 | 최신 버전 릴리즈 후 최대 1년 |
| Deprecated | 지원 종료 예정 | 지원 종료 6개월 전 공지 |
| Retired | 지원 종료 | 더 이상 사용 불가 |

### 버전별 변경 내역

| 버전 | 릴리즈일 | 주요 변경 |
|------|---------|----------|
| 2024-06-01 | 2024-06-01 | 현재 최신 버전 |
| 2024-03-01 | 2024-03-01 | 주문 API 응답 필드 추가 |
| 2023-12-01 | 2023-12-01 | Rate Limit 정책 변경 |
| 2023-09-01 | 2023-09-01 | 상품 API 구조 개선 |

## 하위 호환성

### 하위 호환 변경 (Breaking Changes 아님)

다음 변경은 기존 버전에서도 적용됩니다:

- 새로운 API 엔드포인트 추가
- 응답에 새로운 필드 추가 (선택적)
- 새로운 선택적 파라미터 추가
- 에러 메시지 개선

### Breaking Changes

다음 변경은 새 버전에서만 적용됩니다:

- 기존 필드 제거 또는 이름 변경
- 필드 타입 변경
- 필수 파라미터 추가
- 응답 구조 변경
- 엔드포인트 URL 변경

## 버전 업그레이드 가이드

### 1. 변경 내역 확인

```python
# API 버전 변경 내역 조회
response = requests.get(
    "https://developers.cafe24.com/api/v2/versions",
    headers={"X-Cafe24-Api-Version": "2024-06-01"}
)
```

### 2. 테스트 환경에서 검증

```python
# 새 버전으로 테스트
headers = {
    "Authorization": f"Bearer {access_token}",
    "X-Cafe24-Api-Version": "2024-06-01"  # 새 버전
}

response = requests.get(url, headers=headers)
```

### 3. 점진적 마이그레이션

```python
# 버전 관리 클래스
class VersionedClient:
    def __init__(self, version="2024-06-01"):
        self.version = version
    
    def get_headers(self, access_token):
        return {
            "Authorization": f"Bearer {access_token}",
            "X-Cafe24-Api-Version": self.version,
            "Content-Type": "application/json"
        }
    
    def upgrade_version(self, new_version):
        self.version = new_version
```

## 버전 미지정 시

버전 헤더를 지정하지 않으면:
- **기본 버전** 적용 (가장 오래된 지원 버전)
- 예상치 못한 동작 가능
- **항상 명시적으로 버전 지정 권장**

```python
# ❌ 권장하지 않음
headers = {
    "Authorization": f"Bearer {access_token}"
}

# ✅ 권장
headers = {
    "Authorization": f"Bearer {access_token}",
    "X-Cafe24-Api-Version": "2024-06-01"
}
```

## 버전 관련 에러

| 에러 코드 | HTTP 상태 | 설명 |
|----------|----------|------|
| invalid_api_version | 400 | 존재하지 않는 버전 |
| deprecated_api_version | 400 | 지원 종료된 버전 |

## 모범 사례

1. **버전 고정**: 프로덕션 환경에서는 특정 버전 고정
2. **정기 업데이트**: 분기별로 새 버전 검토
3. **변경 로그 구독**: 개발자 센터 공지 확인
4. **테스트 자동화**: 버전 변경 시 자동 테스트 실행
5. **롤백 계획**: 문제 발생 시 이전 버전으로 롤백

```python
# 환경별 버전 관리
import os

API_VERSIONS = {
    "production": "2024-03-01",  # 안정 버전
    "staging": "2024-06-01",     # 최신 버전
    "development": "2024-06-01"  # 최신 버전
}

current_version = API_VERSIONS.get(
    os.getenv("ENVIRONMENT", "development")
)
```
