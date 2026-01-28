"""
Cafe24 OAuth 2.0 인증 관리 모듈
- Access Token: 2시간 유효
- Refresh Token: 14일 유효
"""

import os
import json
import time
import base64
import requests
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any


class Cafe24Auth:
    """Cafe24 OAuth 2.0 인증 클라이언트"""
    
    BASE_URL = "https://{mall_id}.cafe24api.com"
    TOKEN_ENDPOINT = "/api/v2/oauth/token"
    
    def __init__(
        self,
        mall_id: str,
        client_id: str,
        client_secret: str,
        redirect_uri: str = None,
        token_path: str = None
    ):
        self.mall_id = mall_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri or os.getenv("CAFE24_REDIRECT_URI", "")
        self.token_path = Path(token_path or os.path.expanduser("~/.cafe24/tokens.json"))
        
        self._access_token = None
        self._refresh_token = None
        self._expires_at = None
        
        # 저장된 토큰 로드
        self._load_tokens()
    
    @property
    def base_url(self) -> str:
        return self.BASE_URL.format(mall_id=self.mall_id)
    
    def _get_auth_header(self) -> str:
        """Basic Auth 헤더 생성"""
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"
    
    def _load_tokens(self):
        """저장된 토큰 로드"""
        if self.token_path.exists():
            try:
                with open(self.token_path, 'r') as f:
                    data = json.load(f)
                    self._access_token = data.get("access_token")
                    self._refresh_token = data.get("refresh_token")
                    expires_at = data.get("expires_at")
                    if expires_at:
                        self._expires_at = datetime.fromisoformat(expires_at)
            except (json.JSONDecodeError, IOError):
                pass
    
    def _save_tokens(self):
        """토큰 저장"""
        self.token_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "access_token": self._access_token,
            "refresh_token": self._refresh_token,
            "expires_at": self._expires_at.isoformat() if self._expires_at else None,
            "updated_at": datetime.now().isoformat()
        }
        with open(self.token_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def is_token_expired(self) -> bool:
        """토큰 만료 여부 확인 (5분 여유)"""
        if not self._expires_at:
            return True
        return datetime.now() >= (self._expires_at - timedelta(minutes=5))
    
    def get_authorization_url(self, scope: str = "mall.read_order mall.write_order mall.read_product mall.write_product") -> str:
        """OAuth 인증 URL 생성"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": scope,
            "state": base64.urlsafe_b64encode(os.urandom(16)).decode()
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{self.base_url}/api/v2/oauth/authorize?{query}"
    
    def exchange_code(self, authorization_code: str) -> Dict[str, Any]:
        """Authorization Code를 Access Token으로 교환"""
        url = f"{self.base_url}{self.TOKEN_ENDPOINT}"
        
        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": self.redirect_uri
        }
        
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self._update_tokens(token_data)
        return token_data
    
    def refresh_access_token(self) -> Dict[str, Any]:
        """Refresh Token으로 Access Token 갱신"""
        if not self._refresh_token:
            raise ValueError("Refresh token이 없습니다. 재인증이 필요합니다.")
        
        url = f"{self.base_url}{self.TOKEN_ENDPOINT}"
        
        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self._refresh_token
        }
        
        response = requests.post(url, headers=headers, data=data)
        
        if response.status_code == 401:
            raise ValueError("Refresh token이 만료되었습니다. 재인증이 필요합니다.")
        
        response.raise_for_status()
        
        token_data = response.json()
        self._update_tokens(token_data)
        return token_data
    
    def _update_tokens(self, token_data: Dict[str, Any]):
        """토큰 정보 업데이트"""
        self._access_token = token_data.get("access_token")
        self._refresh_token = token_data.get("refresh_token", self._refresh_token)
        
        expires_in = token_data.get("expires_in", 7200)  # 기본 2시간
        self._expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        self._save_tokens()
    
    def get_valid_token(self) -> str:
        """유효한 Access Token 반환 (필요시 자동 갱신)"""
        if self.is_token_expired():
            self.refresh_access_token()
        return self._access_token
    
    def get_auth_headers(self) -> Dict[str, str]:
        """API 요청용 인증 헤더 반환"""
        return {
            "Authorization": f"Bearer {self.get_valid_token()}",
            "Content-Type": "application/json",
            "X-Cafe24-Api-Version": "2024-06-01"
        }


# 환경변수 기반 팩토리 함수
def create_auth_from_env() -> Cafe24Auth:
    """환경변수에서 인증 정보 로드"""
    return Cafe24Auth(
        mall_id=os.environ["CAFE24_MALL_ID"],
        client_id=os.environ["CAFE24_CLIENT_ID"],
        client_secret=os.environ["CAFE24_CLIENT_SECRET"],
        redirect_uri=os.getenv("CAFE24_REDIRECT_URI")
    )


if __name__ == "__main__":
    # 테스트 코드
    auth = create_auth_from_env()
    print(f"Authorization URL: {auth.get_authorization_url()}")
