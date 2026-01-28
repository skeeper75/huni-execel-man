"""
클레임 처리 모듈
- 취소/반품/교환 처리
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class ClaimType(Enum):
    """클레임 유형"""
    CANCELLATION = "cancellation"
    RETURN = "return"
    EXCHANGE = "exchange"


class ClaimStatus(Enum):
    """클레임 상태"""
    REQUESTED = "requested"
    ACCEPTED = "accepted"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"


class ClaimProcessor:
    """클레임 처리기"""
    
    # 취소 가능 상태
    CANCELABLE_STATUS = ["N00", "N10", "N20"]
    
    # 반품 가능 상태
    RETURNABLE_STATUS = ["N30", "N40"]
    
    def __init__(self, cafe24_client):
        self.client = cafe24_client
    
    def can_cancel(self, order_id: str) -> Dict[str, Any]:
        """취소 가능 여부 확인"""
        order = self.client.get_order(order_id)
        status = order.get("order_status", "")
        
        return {
            "order_id": order_id,
            "current_status": status,
            "can_cancel": status in self.CANCELABLE_STATUS,
            "reason": "취소 가능" if status in self.CANCELABLE_STATUS else f"현재 상태({status})에서 취소 불가"
        }
    
    def can_return(self, order_id: str) -> Dict[str, Any]:
        """반품 가능 여부 확인"""
        order = self.client.get_order(order_id)
        status = order.get("order_status", "")
        
        return {
            "order_id": order_id,
            "current_status": status,
            "can_return": status in self.RETURNABLE_STATUS,
            "reason": "반품 가능" if status in self.RETURNABLE_STATUS else f"현재 상태({status})에서 반품 불가"
        }
    
    def process_cancellation(
        self,
        order_id: str,
        reason: str,
        refund_method: str = "same"
    ) -> Dict[str, Any]:
        """
        취소 처리
        
        Args:
            order_id: 주문 ID
            reason: 취소 사유
            refund_method: 환불 방법 (same=동일수단, bank=계좌이체)
        
        Returns:
            처리 결과
        """
        # 취소 가능 여부 확인
        check = self.can_cancel(order_id)
        if not check["can_cancel"]:
            return {
                "success": False,
                "order_id": order_id,
                "error": check["reason"]
            }
        
        try:
            # 주문 상세 조회
            order = self.client.get_order(order_id, embed=["items"])
            items = order.get("items", [])
            
            # 전체 취소 요청
            # 실제 API 호출은 cafe24_client의 메서드 구현 필요
            result = {
                "success": True,
                "order_id": order_id,
                "claim_type": "cancellation",
                "reason": reason,
                "items_count": len(items),
                "processed_at": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "order_id": order_id,
                "error": str(e)
            }
    
    def process_return(
        self,
        order_id: str,
        reason: str,
        pickup_requested: bool = True
    ) -> Dict[str, Any]:
        """
        반품 처리
        
        Args:
            order_id: 주문 ID
            reason: 반품 사유
            pickup_requested: 수거 요청 여부
        
        Returns:
            처리 결과
        """
        # 반품 가능 여부 확인
        check = self.can_return(order_id)
        if not check["can_return"]:
            return {
                "success": False,
                "order_id": order_id,
                "error": check["reason"]
            }
        
        try:
            result = {
                "success": True,
                "order_id": order_id,
                "claim_type": "return",
                "reason": reason,
                "pickup_requested": pickup_requested,
                "processed_at": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "order_id": order_id,
                "error": str(e)
            }
    
    def process_exchange(
        self,
        order_id: str,
        reason: str,
        exchange_option: str = None
    ) -> Dict[str, Any]:
        """
        교환 처리
        
        Args:
            order_id: 주문 ID
            reason: 교환 사유
            exchange_option: 교환 옵션 (동일상품/다른옵션 등)
        
        Returns:
            처리 결과
        """
        try:
            result = {
                "success": True,
                "order_id": order_id,
                "claim_type": "exchange",
                "reason": reason,
                "exchange_option": exchange_option,
                "processed_at": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "order_id": order_id,
                "error": str(e)
            }
    
    def get_pending_claims(self, claim_type: str = None) -> List[Dict]:
        """
        처리 대기 클레임 조회
        
        Args:
            claim_type: 클레임 유형 (cancellation/return/exchange)
        
        Returns:
            클레임 목록
        """
        claims = []
        
        if claim_type is None or claim_type == "cancellation":
            cancellations = self.client.get_cancellations()
            claims.extend([
                {**c, "claim_type": "cancellation"} 
                for c in cancellations
            ])
        
        if claim_type is None or claim_type == "return":
            returns = self.client.get_returns()
            claims.extend([
                {**r, "claim_type": "return"} 
                for r in returns
            ])
        
        if claim_type is None or claim_type == "exchange":
            exchanges = self.client.get_exchanges()
            claims.extend([
                {**e, "claim_type": "exchange"} 
                for e in exchanges
            ])
        
        return claims
    
    def get_claim_summary(self) -> Dict[str, int]:
        """클레임 현황 요약"""
        return {
            "cancellation": len(self.client.get_cancellations()),
            "return": len(self.client.get_returns()),
            "exchange": len(self.client.get_exchanges())
        }


class MESClaimHandler:
    """MES 연동 클레임 핸들러"""
    
    def __init__(self, claim_processor: ClaimProcessor):
        self.processor = claim_processor
    
    def handle_mes_claim(
        self,
        work_order_no: str,
        claim_type: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        MES에서 클레임 발생 시 처리
        
        Args:
            work_order_no: 작업지시 번호
            claim_type: 클레임 유형
            reason: 사유
        
        Returns:
            처리 결과
        """
        order_id = work_order_no.replace("WO-", "")
        
        if claim_type == "cancellation":
            return self.processor.process_cancellation(order_id, reason)
        elif claim_type == "return":
            return self.processor.process_return(order_id, reason)
        elif claim_type == "exchange":
            return self.processor.process_exchange(order_id, reason)
        else:
            return {
                "success": False,
                "error": f"Unknown claim type: {claim_type}"
            }
