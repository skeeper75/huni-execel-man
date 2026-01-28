"""
Cafe24 Admin API 클라이언트
- Rate Limit 핸들링 (Leaky Bucket)
- 자동 페이지네이션
- 에러 재시도 로직
"""

import time
import requests
from typing import Optional, Dict, Any, List, Generator
from datetime import datetime


class RateLimiter:
    """Leaky Bucket Rate Limiter"""
    
    def __init__(self, requests_per_second: float = 2.0):
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0.0
    
    def wait(self):
        """Rate Limit 준수를 위한 대기"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self.last_request_time = time.time()


class Cafe24Client:
    """Cafe24 Admin API 클라이언트"""
    
    API_VERSION = "2024-06-01"
    
    def __init__(self, auth, shop_no: int = 1, max_retries: int = 3):
        """
        Args:
            auth: Cafe24Auth 인스턴스
            shop_no: 멀티쇼핑몰 번호 (기본값 1)
            max_retries: 최대 재시도 횟수
        """
        self.auth = auth
        self.shop_no = shop_no
        self.max_retries = max_retries
        self.rate_limiter = RateLimiter()
        self._session = requests.Session()
    
    @property
    def base_url(self) -> str:
        return f"https://{self.auth.mall_id}.cafe24api.com/api/v2/admin"
    
    def _request(
        self,
        method: str,
        endpoint: str,
        params: Dict = None,
        data: Dict = None,
        retry_count: int = 0
    ) -> Dict[str, Any]:
        """API 요청 수행 (Rate Limit 및 재시도 핸들링)"""
        
        self.rate_limiter.wait()
        
        url = f"{self.base_url}{endpoint}"
        headers = self.auth.get_auth_headers()
        
        # shop_no 파라미터 추가
        if params is None:
            params = {}
        if "shop_no" not in params:
            params["shop_no"] = self.shop_no
        
        try:
            response = self._session.request(
                method=method,
                url=url,
                headers=headers,
                params=params if method == "GET" else None,
                json=data if method != "GET" else None
            )
            
            # Rate Limit 초과
            if response.status_code == 429:
                if retry_count < self.max_retries:
                    wait_time = 2 ** retry_count  # Exponential backoff
                    time.sleep(wait_time)
                    return self._request(method, endpoint, params, data, retry_count + 1)
                raise RateLimitError("Rate limit exceeded after retries")
            
            # 토큰 만료
            if response.status_code == 401:
                self.auth.refresh_access_token()
                return self._request(method, endpoint, params, data, retry_count)
            
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            if retry_count < self.max_retries:
                time.sleep(2 ** retry_count)
                return self._request(method, endpoint, params, data, retry_count + 1)
            raise
    
    def _paginate(
        self,
        endpoint: str,
        params: Dict = None,
        limit: int = 100,
        max_items: int = None
    ) -> Generator[Dict, None, None]:
        """페이지네이션 자동 처리"""
        
        if params is None:
            params = {}
        
        params["limit"] = min(limit, 100)
        offset = 0
        total_fetched = 0
        
        while True:
            params["offset"] = offset
            response = self._request("GET", endpoint, params)
            
            # 데이터 키 추출 (orders, products 등)
            data_key = next((k for k in response.keys() if k not in ["links"]), None)
            if not data_key:
                break
            
            items = response.get(data_key, [])
            if not items:
                break
            
            for item in items:
                yield item
                total_fetched += 1
                if max_items and total_fetched >= max_items:
                    return
            
            offset += len(items)
            if len(items) < params["limit"]:
                break
    
    # ============ 주문 관련 API ============
    
    def get_orders(
        self,
        start_date: str = None,
        end_date: str = None,
        order_status: str = None,
        order_ids: List[str] = None,
        limit: int = 100,
        embed: List[str] = None
    ) -> List[Dict]:
        """
        주문 목록 조회
        
        Args:
            start_date: 조회 시작일 (YYYY-MM-DD)
            end_date: 조회 종료일 (YYYY-MM-DD)
            order_status: 주문 상태 (N00, N10, N20, N30, N40, N50 등)
            order_ids: 특정 주문 ID 목록
            limit: 조회 개수 (최대 100)
            embed: 추가 조회 항목 (items, receivers 등)
        
        Returns:
            주문 목록
        """
        params = {}
        
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        if order_status:
            params["order_status"] = order_status
        if order_ids:
            params["order_id"] = ",".join(order_ids[:100])
        if embed:
            params["embed"] = ",".join(embed)
        
        return list(self._paginate("/orders", params, limit))
    
    def get_order(self, order_id: str, embed: List[str] = None) -> Dict:
        """주문 상세 조회"""
        params = {}
        if embed:
            params["embed"] = ",".join(embed)
        
        response = self._request("GET", f"/orders/{order_id}", params)
        return response.get("order", {})
    
    def update_order_status(self, order_id: str, status: str) -> Dict:
        """주문 상태 변경"""
        data = {"order": {"order_status": status}}
        return self._request("PUT", f"/orders/{order_id}", data=data)
    
    # ============ 배송 관련 API ============
    
    def register_shipment(
        self,
        order_id: str,
        tracking_no: str,
        shipping_company_code: str,
        order_item_code: List[str] = None
    ) -> Dict:
        """
        송장 등록
        
        Args:
            order_id: 주문 ID
            tracking_no: 송장번호
            shipping_company_code: 택배사 코드 (예: "0019"=CJ대한통운)
            order_item_code: 품목 코드 (부분 배송 시)
        """
        data = {
            "shipment": {
                "tracking_no": tracking_no,
                "shipping_company_code": shipping_company_code
            }
        }
        if order_item_code:
            data["shipment"]["order_item_code"] = order_item_code
        
        return self._request("POST", f"/orders/{order_id}/shipments", data=data)
    
    # ============ 상품 관련 API ============
    
    def get_products(
        self,
        product_nos: List[int] = None,
        product_code: str = None,
        display: str = None,
        selling: str = None,
        limit: int = 100,
        embed: List[str] = None
    ) -> List[Dict]:
        """상품 목록 조회"""
        params = {}
        
        if product_nos:
            params["product_no"] = ",".join(map(str, product_nos[:100]))
        if product_code:
            params["product_code"] = product_code
        if display:
            params["display"] = display
        if selling:
            params["selling"] = selling
        if embed:
            params["embed"] = ",".join(embed)
        
        return list(self._paginate("/products", params, limit))
    
    def get_product(self, product_no: int, embed: List[str] = None) -> Dict:
        """상품 상세 조회"""
        params = {}
        if embed:
            params["embed"] = ",".join(embed)
        
        response = self._request("GET", f"/products/{product_no}", params)
        return response.get("product", {})
    
    def get_product_inventory(self, product_no: int) -> List[Dict]:
        """상품 재고 조회"""
        response = self._request("GET", f"/products/{product_no}/inventories")
        return response.get("inventories", [])
    
    def update_product_inventory(
        self,
        product_no: int,
        variant_code: str,
        quantity: int
    ) -> Dict:
        """상품 재고 수정"""
        data = {
            "inventory": {
                "variant_code": variant_code,
                "quantity": quantity
            }
        }
        return self._request("PUT", f"/products/{product_no}/inventories", data=data)
    
    # ============ 클레임 관련 API ============
    
    def get_cancellations(
        self,
        start_date: str = None,
        end_date: str = None,
        limit: int = 100
    ) -> List[Dict]:
        """취소 목록 조회"""
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        return list(self._paginate("/cancellation", params, limit))
    
    def get_returns(
        self,
        start_date: str = None,
        end_date: str = None,
        limit: int = 100
    ) -> List[Dict]:
        """반품 목록 조회"""
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        return list(self._paginate("/return", params, limit))
    
    def get_exchanges(
        self,
        start_date: str = None,
        end_date: str = None,
        limit: int = 100
    ) -> List[Dict]:
        """교환 목록 조회"""
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        return list(self._paginate("/exchange", params, limit))


class RateLimitError(Exception):
    """Rate Limit 초과 에러"""
    pass


# 택배사 코드
SHIPPING_COMPANIES = {
    "CJ대한통운": "0019",
    "롯데택배": "0002",
    "한진택배": "0003",
    "로젠택배": "0004",
    "우체국택배": "0005",
    "대신택배": "0012",
    "경동택배": "0014",
    "합동택배": "0018",
    "GS NETWORKS": "0039",
    "CVS편의점택배": "0050"
}
