---
name: edicus-integration
description: |
  Edicus 플랫폼(모션원) 연동을 위한 API 및 SDK 가이드. 온라인 편집기 기반 맞춤형 인쇄물(포토북, 명함, 스티커 등) 주문 시스템 연동.
  
  🔹 Server API: "에디쿠스 API", "주문 조회", "프로젝트 생성", "토큰 발급", "렌더링 상태"
  🔹 JS SDK: "편집기 연동", "에디쿠스 SDK", "create_project", "open_project"
  🔹 주문 처리: "주문 확정", "주문 취소", "tentative order", "definitive order"
  🔹 리소스 API: "템플릿 등록", "상품 정보", "폰트 정보"
  🔹 MES 연동: "주문 상태 동기화", "배송 정보", "품목 매핑"
  
  지원 기능: 프로젝트 CRUD, 주문 워크플로우, 템플릿 관리, 썸네일/미리보기, VDP(가변데이터인쇄)
---

# Edicus Integration Skill

## 개요

Edicus는 모션원에서 제공하는 온라인 편집기 플랫폼으로, 맞춤형 인쇄물(포토북, 명함, 스티커, 달력 등)을 웹에서 편집하고 주문할 수 있는 SaaS 서비스입니다.

## API 기본 정보

### Base URLs
```
Server API: https://api-dot-edicusbase.appspot.com
Resource API: https://resource-dot-edicusbase.appspot.com
```

### 인증
모든 API는 `edicus-api-key` 헤더가 필요합니다. 키는 모션원에서 발급받아야 하며, **서버 측에서만 사용**해야 합니다 (브라우저 노출 금지).

### 사용자 식별
- `edicus-uid`: 고객사의 unique user id (64byte 이내, hash 형태 권장)
- 허용 문자: `[a-z, A-Z, 0-9, @, -, _, +, =]`
- 금지 문자: `. # $ [ ] / \`

## 핵심 워크플로우

### 1. 인증 토큰 발급
```
POST /api/auth/token
Headers: edicus-api-key, edicus-uid
Response: { token: "<JWT>" }  // 유효기간 1시간
```

### 2. 프로젝트 생성 → 편집 → 주문 흐름
```
[토큰발급] → [JS SDK로 편집기 열기] → [프로젝트 저장]
    ↓
[Tentative Order] → [Definitive Order] → [렌더링] → [출하]
    (임시주문)         (주문확정)
```

### 3. 주문 상태 코드
| 상태 | 설명 |
|-----|-----|
| `editing` | 편집 중 |
| `ordering` | 임시 주문 (취소 가능) |
| `ordered` | 주문 확정 (취소 불가) |
| `rendering` | 렌더링 진행 중 |
| `rendered` | 렌더링 완료 |
| `canceled` | 취소됨 |

## 상세 API 레퍼런스

상세 API 스펙은 다음 파일 참조:
- **Server API 전체**: `references/server-api.md`
- **JS SDK 전체**: `references/js-sdk.md`
- **Resource API**: `references/resource-api.md`
- **MES 연동 설계**: `references/mes-integration.md`

## 주요 API 요약

### Server API

#### 프로젝트 관리
```javascript
// 프로젝트 목록 조회
GET /api/projects
Headers: edicus-api-key, edicus-uid

// 프로젝트 상세 조회
GET /api/projects/:prjid
GET /api/projects/:prjid/data?doc=true  // 문서 데이터 포함

// 프로젝트 삭제
DELETE /api/projects/:prjid

// 프로젝트 복제 (동기)
POST /api/projects/:prjid/clone

// 프로젝트 복제 (비동기) - 포토북 등 대용량
POST /api/projects/:prjid/clone_async
Body: { callback_url: "https://..." }
```

#### 주문 처리
```javascript
// 임시 주문 (취소 가능)
POST /api/projects/:prjid/order/tentative
Body: {
  order_count: 1,
  total_price: 23500,
  partner_order_id: "MES주문번호",  // MES 연동 시 필수
  order_name: "주문자명",
  userdata_json: "{...}"  // 1000자 이내
}

// 주문 확정 (렌더링 시작, 취소 불가)
POST /api/projects/:prjid/order/definitive

// 주문 취소 (ordering 상태에서만)
POST /api/orders/:order_id/cancel

// 주문 조회
POST /api/order/query
Body: { by_time: { from, to, status } }
Body: { by_partner_order_id: { partner_order_id } }
```

#### 미리보기/썸네일
```javascript
// 단일 프로젝트 썸네일
GET /api/projects/:prjid/preview_urls

// 복수 프로젝트 썸네일 (최대 25개)
POST /api/projects/preview_urls
Body: { "project-ids": ["id1", "id2", ...] }
```

### JS SDK

#### 초기화
```javascript
const editor = window.edicusSDK.init({ base_url: "..." });
```

#### 프로젝트 생성
```javascript
editor.create_project({
  parent_element: document.getElementById('editor-container'),
  partner: "partner-id",
  token: "JWT토큰",
  ps_code: "90x50@NC",         // 상품+사이즈 코드
  template_uri: "gcs://...",
  title: "제목",
  mobile: false,
  lang: "ko"
}, (err, data) => {
  if (data.action === 'project-id-created') {
    console.log(data.info.project_id);
  }
  if (data.action === 'goto-cart') {
    // 편집 완료
  }
});
```

#### 프로젝트 열기
```javascript
editor.open_project({
  parent_element: el,
  prjid: "-Kti4dGm3_I6iyZSpB5n",
  token: "JWT토큰"
}, callback);
```

#### 편집기 닫기/파괴
```javascript
editor.close({ parent_element: el });
editor.destroy({ parent_element: el });
```

#### 패시브 모드 (외부 UI 연동)
```javascript
// 패시브 모드로 열기
editor.create_project({ ..., run_mode: 'passive' }, callback);

// 메시지 송신
editor.post_to_editor('command', { type: 'save', force_save: true });
editor.post_to_editor('add-image', { src_type: 'file-input', method: 'add' });

// 콜백으로 메시지 수신
// action: 'doc-changed', 'save-doc-report', 'page-changed', 'var-changed' 등
```

#### TnView (썸네일 뷰어) & VDP
```javascript
// 썸네일 뷰어 열기
editor.open_tnview({ parent_element, prjid, token, npage: 2 }, callback);

// 가변데이터 주입
editor.set_variable_data_row({
  cols: [
    { id: 'name', value: { text: '홍길동' }, shrink: true },
    { id: 'title', value: { text: '대리' } }
  ]
});
```

## 상품 코드 체계 (ps_code)

형식: `{사이즈코드}@{상품코드}`

예시:
- `90x50@NC` - 명함 90x50mm
- `150x300@MB` - 머그컵 150x300
- `8x10@MP` - 멀티 포토 8x10

## 에러 처리

```javascript
// 논리적 오류: HTTP 200 + err 객체
{ err: { code: "...", message: "...", info: {...} } }

// 인증/서버 오류: HTTP 400~500
```

## MES 연동 시 주요 고려사항

1. **partner_order_id 활용**: Tentative Order 시 MES 주문번호 저장
2. **Query API로 조회**: `by_partner_order_id`로 양방향 조회
3. **상태 동기화**: Edicus 상태 변경 시 MES에 반영 필요
4. **렌더링 파일**: 주문 완료 후 렌더링 파일 URL 획득하여 인쇄

상세한 MES 연동 설계는 `references/mes-integration.md` 참조.
