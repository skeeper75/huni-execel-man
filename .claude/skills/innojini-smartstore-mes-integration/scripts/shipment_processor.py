"""
배송 처리 모듈
- MES 생산완료 → 송장 등록
- 배송 상태 관리
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass


# 택배사 코드 매핑
CARRIER_CODES = {
    "CJ대한통운": "0019",
    "CJ": "0019",
    "롯데택배": "0002",
    "롯데": "0002",
    "한진택배": "0003",
    "한진": "0003",
    "로젠택배": "0004",
    "로젠": "0004",
    "우체국택배": "0005",
    "우체국": "0005",
    "대신택배": "0012",
    "경동택배": "0014",
    "합동택배": "0018",
    "GS": "0039",
    "CVS": "0050"
}


@dataclass
class ShipmentResult:
    """배송 처리 결과"""
    order_id: str
    tracking_no: str
    carrier: str
    status: str
    message: str
    processed_at: str


class ShipmentProcessor:
    """배송 처리기"""
    
    def __init__(self, cafe24_client):
        self.client = cafe24_client
    
    def register_shipment(
        self,
        order_id: str,
        tracking_no: str,
        carrier: str,
        order_item_codes: List[str] = None
    ) -> ShipmentResult:
        """
        송장 등록
        
        Args:
            order_id: 주문 ID
            tracking_no: 송장번호
            carrier: 택배사명 또는 코드
            order_item_codes: 품목 코드 (부분 배송 시)
        
        Returns:
            ShipmentResult
        """
        # 택배사 코드 변환
        carrier_code = self._get_carrier_code(carrier)
        
        try:
            result = self.client.register_shipment(
                order_id=order_id,
                tracking_no=tracking_no,
                shipping_company_code=carrier_code,
                order_item_code=order_item_codes
            )
            
            return ShipmentResult(
                order_id=order_id,
                tracking_no=tracking_no,
                carrier=carrier,
                status="SUCCESS",
                message="송장 등록 완료",
                processed_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            return ShipmentResult(
                order_id=order_id,
                tracking_no=tracking_no,
                carrier=carrier,
                status="FAILED",
                message=str(e),
                processed_at=datetime.now().isoformat()
            )
    
    def _get_carrier_code(self, carrier: str) -> str:
        """택배사명 → 코드 변환"""
        # 이미 코드인 경우
        if carrier in CARRIER_CODES.values():
            return carrier
        
        # 이름으로 검색
        for name, code in CARRIER_CODES.items():
            if name in carrier or carrier in name:
                return code
        
        # 기본값: CJ대한통운
        return "0019"
    
    def bulk_register_shipments(
        self,
        shipments: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        대량 송장 등록
        
        Args:
            shipments: [{"order_id": "...", "tracking_no": "...", "carrier": "..."}]
        
        Returns:
            처리 결과 {success: [], failed: []}
        """
        result = {
            "success": [],
            "failed": [],
            "total": len(shipments)
        }
        
        for shipment in shipments:
            res = self.register_shipment(
                order_id=shipment["order_id"],
                tracking_no=shipment["tracking_no"],
                carrier=shipment.get("carrier", "CJ대한통운")
            )
            
            if res.status == "SUCCESS":
                result["success"].append({
                    "order_id": res.order_id,
                    "tracking_no": res.tracking_no
                })
            else:
                result["failed"].append({
                    "order_id": res.order_id,
                    "error": res.message
                })
        
        return result
    
    def get_shipment_ready_orders(self) -> List[Dict]:
        """배송준비중(N20) 주문 조회"""
        return self.client.get_orders(
            order_status="N20",
            embed=["items", "receivers"]
        )
    
    def update_order_to_shipping(self, order_id: str) -> Dict:
        """주문 상태를 배송중(N30)으로 변경"""
        return self.client.update_order_status(order_id, "N30")
    
    def get_delivery_status(self, order_id: str) -> Dict[str, Any]:
        """배송 상태 조회"""
        order = self.client.get_order(order_id, embed=["shipments"])
        
        shipments = order.get("shipments", [])
        if not shipments:
            return {
                "order_id": order_id,
                "status": "NO_SHIPMENT",
                "message": "송장 정보 없음"
            }
        
        latest = shipments[-1]
        return {
            "order_id": order_id,
            "tracking_no": latest.get("tracking_no"),
            "carrier": latest.get("shipping_company_name"),
            "status": order.get("order_status"),
            "shipped_date": latest.get("shipped_date")
        }


class MESShipmentBridge:
    """MES-배송 연동 브릿지"""
    
    def __init__(self, shipment_processor: ShipmentProcessor):
        self.processor = shipment_processor
    
    def process_production_complete(
        self,
        work_order_no: str,
        tracking_no: str,
        carrier: str = "CJ대한통운"
    ) -> ShipmentResult:
        """
        MES 생산완료 → 송장 등록
        
        Args:
            work_order_no: 작업지시 번호 (WO-{order_id} 형식)
            tracking_no: 송장번호
            carrier: 택배사
        
        Returns:
            ShipmentResult
        """
        # 작업지시 번호에서 주문 ID 추출
        order_id = work_order_no.replace("WO-", "")
        
        return self.processor.register_shipment(
            order_id=order_id,
            tracking_no=tracking_no,
            carrier=carrier
        )
    
    def sync_from_mes(
        self,
        mes_completed_orders: List[Dict]
    ) -> Dict[str, Any]:
        """
        MES 출고 데이터 → Cafe24 송장 일괄 등록
        
        Args:
            mes_completed_orders: MES에서 출고 완료된 주문 목록
                [{"work_order_no": "...", "tracking_no": "...", "carrier": "..."}]
        
        Returns:
            처리 결과
        """
        shipments = []
        
        for mes_order in mes_completed_orders:
            order_id = mes_order["work_order_no"].replace("WO-", "")
            shipments.append({
                "order_id": order_id,
                "tracking_no": mes_order["tracking_no"],
                "carrier": mes_order.get("carrier", "CJ대한통운")
            })
        
        return self.processor.bulk_register_shipments(shipments)
