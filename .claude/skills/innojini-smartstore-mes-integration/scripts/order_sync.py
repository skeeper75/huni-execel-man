"""
스마트스토어 주문 동기화 모듈
- Cafe24 마켓플러스 주문 수집
- MES 작업지시 변환
"""

import re
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict


@dataclass
class WorkOrder:
    """MES 작업지시 데이터"""
    work_order_no: str
    order_id: str
    order_date: str
    customer_name: str
    product_name: str
    product_code: str
    spec: Dict[str, Any]
    quantity: int
    due_date: str
    shipping_info: Dict[str, str]
    remark: str
    status: str = "PENDING"
    
    def to_dict(self) -> Dict:
        return asdict(self)


class SmartStoreOrderSync:
    """스마트스토어 주문 동기화"""
    
    # 주문 상태 매핑
    ORDER_STATUS = {
        "N00": "입금전",
        "N10": "상품준비중",
        "N20": "배송준비중",
        "N30": "배송중",
        "N40": "배송완료",
        "N50": "구매확정"
    }
    
    def __init__(self, cafe24_client):
        self.client = cafe24_client
    
    def get_pending_orders(
        self,
        days: int = 7,
        status: str = "N10"
    ) -> List[Dict]:
        """
        신규 주문 조회 (MES 작업지시 대상)
        
        Args:
            days: 조회 기간 (일)
            status: 주문 상태 (기본: N10 상품준비중)
        
        Returns:
            주문 목록
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        orders = self.client.get_orders(
            start_date=start_date.strftime("%Y-%m-%d"),
            end_date=end_date.strftime("%Y-%m-%d"),
            order_status=status,
            embed=["items", "receivers"]
        )
        
        # 스마트스토어(마켓플러스) 주문만 필터링
        smartstore_orders = [
            order for order in orders
            if self._is_smartstore_order(order)
        ]
        
        return smartstore_orders
    
    def _is_smartstore_order(self, order: Dict) -> bool:
        """스마트스토어 주문 여부 확인"""
        # 마켓플러스 연동 주문은 특정 필드로 구분
        # 실제 구현 시 마켓플러스 설정에 따라 조정 필요
        mall_id = order.get("mall_id", "")
        order_from = order.get("order_from", "")
        return "naver" in mall_id.lower() or "smartstore" in order_from.lower()
    
    def create_work_order(self, order: Dict) -> WorkOrder:
        """
        주문 데이터 → MES 작업지시 변환
        
        Args:
            order: Cafe24 주문 데이터
        
        Returns:
            WorkOrder 객체
        """
        items = order.get("items", [])
        receiver = order.get("receivers", [{}])[0] if order.get("receivers") else {}
        
        # 첫 번째 품목 기준 (복수 품목 시 별도 처리 필요)
        item = items[0] if items else {}
        
        # 옵션 파싱
        spec = self._parse_print_options(item.get("option_value", ""))
        
        # 작업지시 생성
        work_order = WorkOrder(
            work_order_no=f"WO-{order['order_id']}",
            order_id=order["order_id"],
            order_date=order.get("order_date", ""),
            customer_name=order.get("buyer", {}).get("name", ""),
            product_name=item.get("product_name", ""),
            product_code=item.get("product_code", ""),
            spec=spec,
            quantity=item.get("quantity", 1),
            due_date=self._calculate_due_date(order),
            shipping_info={
                "name": receiver.get("name", ""),
                "phone": receiver.get("phone", ""),
                "address": f"{receiver.get('address1', '')} {receiver.get('address2', '')}",
                "zipcode": receiver.get("zipcode", "")
            },
            remark=order.get("shipping_message", "")
        )
        
        return work_order
    
    def _parse_print_options(self, option_str: str) -> Dict[str, Any]:
        """
        인쇄 옵션 문자열 파싱
        예: "A4/100부/양면/무광코팅" → {"size": "A4", "quantity": 100, ...}
        """
        if not option_str:
            return {}
        
        spec = {}
        parts = option_str.split("/")
        
        for part in parts:
            part = part.strip()
            
            # 판형 (A4, A5, B5 등)
            if re.match(r'^[AB]\d$', part, re.IGNORECASE):
                spec["size"] = part.upper()
            
            # 수량 (100부, 500매 등)
            elif re.search(r'\d+[부매권]', part):
                qty_match = re.search(r'(\d+)', part)
                if qty_match:
                    spec["print_quantity"] = int(qty_match.group(1))
            
            # 인쇄 면수
            elif "양면" in part:
                spec["sides"] = "duplex"
            elif "단면" in part:
                spec["sides"] = "simplex"
            
            # 코팅
            elif "무광" in part or "무코팅" in part:
                spec["coating"] = "matte"
            elif "유광" in part:
                spec["coating"] = "gloss"
            elif "코팅" in part:
                spec["coating"] = "gloss"
            
            # 제본
            elif "무선" in part:
                spec["binding"] = "perfect"
            elif "중철" in part:
                spec["binding"] = "saddle"
            elif "스프링" in part:
                spec["binding"] = "spiral"
            
            # 용지
            elif "모조" in part or "백상지" in part:
                spec["paper"] = "offset"
            elif "아트" in part:
                spec["paper"] = "art"
            elif "스노우" in part:
                spec["paper"] = "snow"
        
        return spec
    
    def _calculate_due_date(self, order: Dict, days: int = 3) -> str:
        """납기일 계산 (기본 3일)"""
        order_date = order.get("order_date", "")
        if order_date:
            try:
                dt = datetime.fromisoformat(order_date.replace("Z", "+00:00"))
                due = dt + timedelta(days=days)
                return due.strftime("%Y-%m-%d")
            except ValueError:
                pass
        
        return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
    
    def sync_orders_to_mes(
        self,
        orders: List[Dict],
        mes_api_client=None
    ) -> Dict[str, Any]:
        """
        주문 목록을 MES로 동기화
        
        Args:
            orders: 주문 목록
            mes_api_client: MES API 클라이언트 (선택)
        
        Returns:
            동기화 결과 {success: [], failed: []}
        """
        result = {
            "success": [],
            "failed": [],
            "total": len(orders)
        }
        
        for order in orders:
            try:
                work_order = self.create_work_order(order)
                
                if mes_api_client:
                    # 실제 MES API 호출
                    mes_api_client.create_work_order(work_order.to_dict())
                
                result["success"].append({
                    "order_id": order["order_id"],
                    "work_order_no": work_order.work_order_no
                })
                
            except Exception as e:
                result["failed"].append({
                    "order_id": order.get("order_id", "unknown"),
                    "error": str(e)
                })
        
        return result
    
    def get_order_summary(self, days: int = 7) -> Dict[str, Any]:
        """주문 현황 요약"""
        summary = {
            "period": f"최근 {days}일",
            "by_status": {},
            "total": 0
        }
        
        for status_code in ["N10", "N20", "N30", "N40"]:
            orders = self.client.get_orders(
                start_date=(datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d"),
                end_date=datetime.now().strftime("%Y-%m-%d"),
                order_status=status_code
            )
            
            count = len(orders)
            summary["by_status"][self.ORDER_STATUS.get(status_code, status_code)] = count
            summary["total"] += count
        
        return summary
