# Cafe24 OAuth 2.0 인증

## 개요

Cafe24 Admin API는 OAuth 2.0 기반 인증을 사용합니다.

### 토큰 유효기간
| 토큰 유형 | 유효기간 | 갱신 방법 |
|----------|---------|----------|
| Access Token | 2시간 | Refresh Token으로 갱신 |
| Refresh Token | 14일 | 재인증 필요 |

## 인증 플로우

### 1단계: Authorization Code 요청

```
GET https://{mall_id}.cafe24api.com/api/v2/oauth/authorize
```

**파라미터:**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| response_type | ✅ | "code" 고정 |
| client_id | ✅ | 앱 Client ID |
| redirect_uri | ✅ | 콜백 URL (등록된 URL과 일치해야 함) |
| scope | ✅ | 권한 범위 (공백 구분) |
| state | ❌ | CSRF 방지용 난수 |

**Scope 목록:**
```
mall.read_order      # 주문 조회
mall.write_order     # 주문 수정
mall.read_product    # 상품 조회
mall.write_product   # 상품 수정
mall.read_customer   # 회원 조회
mall.write_customer  # 회원 수정
mall.read_store      # 쇼핑몰 설정 조회
mall.write_store     # 쇼핑몰 설정 수정
mall.read_supply     # 공급사 조회
mall.write_supply    # 공급사 수정
mall.read_category   # 카테고리 조회
mall.write_category  # 카테고리 수정
mall.read_collection # 브랜드/제조사 조회
mall.write_collection # 브랜드/제조사 수정
mall.read_promotion  # 프로모션 조회
mall.write_promotion # 프로모션 수정
mall.read_community  # 게시판 조회
mall.write_community # 게시판 수정
mall.read_design     # 디자인 조회
mall.write_design    # 디자인 수정
mall.read_application # 앱 조회
mall.write_application # 앱 수정
```

### 2단계: Access Token 발급

사용자 인증 후 redirect_uri로 authorization_code가 전달됩니다.

```
POST https://{mall_id}.cafe24api.com/api/v2/oauth/token
```

**헤더:**
```
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded
```

**요청 본문:**
```
grant_type=authorization_code
&code={authorization_code}
&redirect_uri={redirect_uri}
```

**응답:**
```json
{
  "access_token": "21EZes0dGSfN...",
  "expires_in": 7200,
  "refresh_token": "FGRee36g...",
  "refresh_token_expires_in": 1209600,
  "client_id": "your_client_id",
  "mall_id": "your_mall_id",
  "user_id": "admin_user",
  "scopes": ["mall.read_order", "mall.write_order"],
  "issued_at": "2024-01-01T00:00:00.000"
}
```

### 3단계: Access Token 갱신

Access Token 만료 전에 Refresh Token으로 갱신합니다.

```
POST https://{mall_id}.cafe24api.com/api/v2/oauth/token
```

**요청 본문:**
```
grant_type=refresh_token
&refresh_token={refresh_token}
```

**응답:**
```json
{
  "access_token": "new_access_token...",
  "expires_in": 7200,
  "refresh_token": "new_refresh_token...",
  "refresh_token_expires_in": 1209600
}
```

## API 요청 시 인증 헤더

```
GET https://{mall_id}.cafe24api.com/api/v2/admin/orders

Authorization: Bearer {access_token}
Content-Type: application/json
X-Cafe24-Api-Version: 2024-06-01
```

## 토큰 저장 권장사항

1. **암호화 저장**: 토큰은 암호화하여 저장
2. **만료 시간 관리**: 만료 5분 전에 미리 갱신
3. **Refresh Token 보호**: 서버 측에만 저장, 클라이언트 노출 금지
4. **에러 처리**: 401 응답 시 자동 갱신 로직 구현

## 에러 응답

| HTTP 상태 | 에러 코드 | 설명 | 대응 |
|----------|----------|------|------|
| 401 | invalid_token | 토큰 만료/무효 | Refresh Token으로 갱신 |
| 401 | invalid_grant | Refresh Token 만료 | 재인증 필요 |
| 400 | invalid_request | 잘못된 요청 형식 | 파라미터 확인 |
| 400 | invalid_scope | 잘못된 Scope | Scope 확인 |

## Python 예제

```python
import base64
import requests

class Cafe24Auth:
    BASE_URL = "https://{mall_id}.cafe24api.com"
    
    def __init__(self, mall_id, client_id, client_secret):
        self.mall_id = mall_id
        self.client_id = client_id
        self.client_secret = client_secret
        self._access_token = None
        self._refresh_token = None
    
    def _get_basic_auth(self):
        credentials = f"{self.client_id}:{self.client_secret}"
        return f"Basic {base64.b64encode(credentials.encode()).decode()}"
    
    def get_authorization_url(self, redirect_uri, scope):
        return (
            f"{self.BASE_URL.format(mall_id=self.mall_id)}"
            f"/api/v2/oauth/authorize"
            f"?response_type=code"
            f"&client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
        )
    
    def exchange_code(self, code, redirect_uri):
        response = requests.post(
            f"{self.BASE_URL.format(mall_id=self.mall_id)}/api/v2/oauth/token",
            headers={
                "Authorization": self._get_basic_auth(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri
            }
        )
        response.raise_for_status()
        data = response.json()
        self._access_token = data["access_token"]
        self._refresh_token = data["refresh_token"]
        return data
    
    def refresh_token(self):
        response = requests.post(
            f"{self.BASE_URL.format(mall_id=self.mall_id)}/api/v2/oauth/token",
            headers={
                "Authorization": self._get_basic_auth(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": self._refresh_token
            }
        )
        response.raise_for_status()
        data = response.json()
        self._access_token = data["access_token"]
        self._refresh_token = data["refresh_token"]
        return data
```
