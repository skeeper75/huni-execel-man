# 인쇄 업계 표준 및 데이터 정규화 리서치 보고서

> **작성일**: 2026년 1월 28일
> **목적**: 후니프린팅 엑셀 데이터 정규화를 위한 업계 표준 조사

---

## 1. 국제 인쇄 업계 표준

### 1.1 JDF/XJDF (Job Definition Format)

**개요**
- JDF는 1999년 Adobe, Agfa, Heidelberg, MAN Roland가 공동 개발
- CIP4 (International Cooperation for Integration of Processes in Prepress, Press and Postpress) 관리
- XML 기반 오픈 표준으로 인쇄 작업 정보 교환

**XJDF (Exchange JDF)** - 2018년 발표
- JDF의 간소화 버전
- 순수 정보 교환 인터페이스
- 더 빠르고 간단하며 견고한 통합

**JDF 1.8 스펙 기준**
- 약 100개 프로세스 정의
- 약 170개 리소스 정의

**참고**: [CIP4 Organization](https://www.cip4.org/print-automation/jdf), [JDF Wikipedia](https://en.wikipedia.org/wiki/Job_Definition_Format)

### 1.2 CGATS (Committee for Graphic Arts Technologies Standards)

- APTech (Association for PRINT Technologies) 관리
- ANSI 인증 표준
- ISO/TC 130 (Graphic Technology) 미국 기술자문그룹 운영
- 인쇄, 출판, 컨버팅 기술 전 범위 표준화

**참고**: [APTech Standards](https://printtechnologies.org/standards/)

### 1.3 ISO 216 (용지 규격)

**A 시리즈**
| 규격 | 크기 (mm) | 용도 |
|------|-----------|------|
| A0 | 841 × 1189 | 기술 도면, 포스터 |
| A1 | 594 × 841 | 포스터, 도면 |
| A2 | 420 × 594 | 포스터 |
| A3 | 297 × 420 | 도면, 프레젠테이션 |
| A4 | 210 × 297 | 문서, 서신 (표준) |
| A5 | 148 × 210 | 노트, 소책자 |
| A6 | 105 × 148 | 엽서, 플라이어 |

**핵심 특성**: √2 비율 (1:1.414...)
- 절반으로 자르면 동일 비율 유지
- 확대/축소 시 왜곡 없음

**참고**: [ISO 216 Wikipedia](https://en.wikipedia.org/wiki/ISO_216)

### 1.4 GSM (Grammage)

**정의**: ISO 536 기준, g/m² (그램 per 제곱미터)

| GSM 범위 | 용도 |
|----------|------|
| 35-55 | 신문지 |
| 75-90 | 일반 복사용지 |
| 100-130 | 브로셔, 잡지 |
| 150-200 | 고급 인쇄물 |
| 216-300 | 명함, 카드 |
| 300+ | 패키지, 두꺼운 커버 |

**참고**: [Instantprint GSM Guide](https://www.instantprint.co.uk/printspiration/print-design-tips/what-is-gsm-and-how-do-you-choose-which-one-you-need)

---

## 2. 한국 인쇄 용어 및 규격

### 2.1 한국 용지 규격 특수성

- **공식 표준**: KS M ISO216 (ISO 216 준용)
- **실무 표준**: JIS 규격 (일본식) 혼용

| 구분 | 국제(ISO) | 한국 실무(JIS) |
|------|-----------|----------------|
| B5 | 176×250 | 182×257 |
| B4 | 250×353 | 257×364 |

### 2.2 전지/절지 체계

**국전지 (菊全紙)**: 939×636 mm
- A 계열 인쇄물 생산 기준

**4×6 전지**: 1,091×788 mm
- B 계열 인쇄물 생산 기준
- 주간지, 여성지, 단행본

**절지 명칭**
- 1절지 (전지) → 2절 → 4절 → 8절 → 16절 → 32절
- 숫자가 클수록 작은 사이즈

**국배판 vs A4**
- 국배판: 218×304 mm (국전지의 8절)
- A4: 210×297 mm
- 실무에서 "같은 것"으로 간주

### 2.3 평량 (坪量)

- 1㎡ 당 종이 무게 (g/㎡)
- 평량 높을수록 두꺼움
- 책/인쇄물 두께 결정 요소

**참고**: [나무위키 종이/규격](https://namu.wiki/w/%EC%A2%85%EC%9D%B4/%EA%B7%9C%EA%B2%A9), [박스마스터 블로그](https://boxmaster.co.kr/blog/%EC%9D%B8%EC%87%84%ED%95%99%EA%B0%9C%EB%A1%A0/%EC%9D%B8%EC%87%84%EC%9A%A9-%EC%A2%85%EC%9D%B4-%EC%82%AC%EC%9D%B4%EC%A6%88-%EA%B7%9C%EA%B2%A9)

---

## 3. 후가공 (Finishing) 표준 용어

### 3.1 코팅/라미네이팅

| 용어 | 영문 | 설명 |
|------|------|------|
| 유광 코팅 | Gloss Lamination | 광택 있는 필름 |
| 무광 코팅 | Matte Lamination | 광택 없는 필름 |
| 벨벳 터치 | Soft Touch | 부드러운 촉감 |
| UV 코팅 | UV Coating | 자외선 경화 코팅 |

### 3.2 제본 (Binding)

| 용어 | 영문 | 설명 |
|------|------|------|
| 중철 제본 | Saddle Stitching | 스테이플 제본, 얇은 책자 |
| 무선 제본 | Perfect Binding | 접착제 제본, 일반 도서 |
| 트윈링 | Wire-O / Twin Ring | 와이어 링 제본 |
| 스프링 | Spiral/Coil Binding | 플라스틱/금속 코일 |
| PUR 제본 | PUR Binding | 고강도 접착제 제본 |
| 양장 제본 | Case/Hardcover | 하드커버 |
| 실 제본 | Smyth Sewn | 실로 꿰매는 고급 제본 |

**참고**: [Duplo USA Finishing 101](https://www.duplousa.com/2024/10/print-finishing-101/), [Prepressure Finishing](https://www.prepressure.com/finishing)

### 3.3 특수 가공

| 용어 | 영문 | 설명 |
|------|------|------|
| 반칼 | Kiss Cut / Half Cut | 스티커 절반만 칼집 |
| 날장 | Sheet Cut | 낱장 재단 |
| 모양칼 | Die Cut | 특수 모양 재단 |
| 미싱 | Perforation | 절취선 |
| 오시 | Scoring/Creasing | 접힘선 |
| 형압 | Embossing/Debossing | 양각/음각 |
| 박 | Foil Stamping | 금박/은박 |
| 도무송 | Die Cutting | 칼선 재단 |

---

## 4. 인쇄 MIS (Management Information System) 표준

### 4.1 주요 기능 영역

1. **견적 (Estimating)**
   - 재료비, 인건비, 장비비, 후가공비 계산
   - 수량별 단가 산출

2. **주문 관리 (Order Management)**
   - 주문 접수, 추적, 이력 관리

3. **생산 관리 (Production)**
   - 작업 지시, 공정 관리, 일정

4. **재고 관리 (Inventory)**
   - 용지, 자재 재고

5. **가격 정책 (Pricing)**
   - 수량 구간별 단가
   - 옵션별 추가 비용

### 4.2 주요 솔루션

| 솔루션 | 특징 |
|--------|------|
| PrintMIS | Web-to-Print 통합, 디지털/오프셋/브로커 지원 |
| PressWise | 올인원 MIS, 워크플로우 자동화 |
| Ordant | 대형 출력 특화, 정확한 원가 계산 |
| Logic Print | 무료 견적 계산, 예산 1분 계산 |
| iQuote | 상세 원가 분석, 이익률 관리 |

**참고**: [SourceForge Print Estimating](https://sourceforge.net/software/print-estimating/), [Capterra Print Estimating](https://www.capterra.com/print-estimating-software/)

### 4.3 한국 인쇄 견적 시스템

**피카소 솔루션** (파란소프트)
- 도서, 전단지, 포토앨범, 명함 견적
- 규격/수량/제본 입력 → 자동 견적
- 물품/기자재 관리, 매출 DB화

**인쇄 견적 특허 기술** (KR101389313B1)
- 기본 정보, 본문 정보, 표지 정보, 제본 정보 입력
- 자동 견적 정보 산출

**참고**: [전자신문 - 파란소프트](https://www.etnews.com/20140704000187), [Google Patents](https://patents.google.com/patent/KR101389313B1/ko)

---

## 5. 데이터 정규화 권장 사항

### 5.1 코드 체계 설계 원칙

JDF/XJDF 및 업계 표준을 참고한 권장 코드 체계:

```
[CATEGORY]_[SUBCATEGORY]_[ATTRIBUTE]_[SEQUENCE]

예시:
PAPER_ART_100G_001      → 용지_아트지_100g_001
FINISH_LAM_GLOSS_001    → 후가공_코팅_유광_001
BIND_PERFECT_PUR_001    → 제본_무선_PUR_001
SIZE_A4_STD_001         → 사이즈_A4_표준_001
```

### 5.2 마스터 테이블 설계

**1. 용지 마스터 (PAPER_MASTER)**
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| paper_code | VARCHAR | PK | PAPER_ART_100G |
| paper_name_ko | VARCHAR | 한글명 | 아트지 100g |
| paper_name_en | VARCHAR | 영문명 | Art Paper 100gsm |
| paper_type | VARCHAR | 종류 | 아트지, 모조지, 스노우지 |
| gsm | INTEGER | 평량 | 100 |
| thickness_um | INTEGER | 두께(μm) | 90 |
| price_per_sheet | DECIMAL | 장당 단가 | 50 |
| iso_size | VARCHAR | ISO 규격 | A4, A3, B5 |

**2. 후가공 마스터 (FINISH_MASTER)**
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| finish_code | VARCHAR | PK | FINISH_LAM_MATTE |
| finish_name_ko | VARCHAR | 한글명 | 무광 코팅 |
| finish_name_en | VARCHAR | 영문명 | Matte Lamination |
| finish_category | VARCHAR | 분류 | 코팅, 제본, 가공 |
| unit | VARCHAR | 단위 | 매, 건, cm |
| base_price | DECIMAL | 기본 단가 | 100 |

**3. 제본 마스터 (BINDING_MASTER)**
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| binding_code | VARCHAR | PK | BIND_SADDLE_001 |
| binding_name_ko | VARCHAR | 한글명 | 중철 제본 |
| binding_name_en | VARCHAR | 영문명 | Saddle Stitching |
| min_pages | INTEGER | 최소 페이지 | 8 |
| max_pages | INTEGER | 최대 페이지 | 64 |
| page_unit | INTEGER | 페이지 단위 | 4 |

**4. 사이즈 마스터 (SIZE_MASTER)**
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| size_code | VARCHAR | PK | SIZE_A4_STD |
| size_name | VARCHAR | 명칭 | A4 |
| width_mm | INTEGER | 가로 | 210 |
| height_mm | INTEGER | 세로 | 297 |
| iso_standard | BOOLEAN | ISO 표준 | TRUE |
| jis_standard | BOOLEAN | JIS 표준 | FALSE |
| custom | BOOLEAN | 자유형 | FALSE |

### 5.3 가격 테이블 설계

**수량 구간별 가격 (PRICE_MATRIX)**
| 필드 | 타입 | 설명 |
|------|------|------|
| price_id | VARCHAR | PK |
| product_code | VARCHAR | FK to PRODUCT |
| option_combination | VARCHAR | 옵션 조합 키 |
| qty_from | INTEGER | 시작 수량 |
| qty_to | INTEGER | 종료 수량 |
| unit_price | DECIMAL | 단가 |
| setup_cost | DECIMAL | 셋업비 |
| effective_from | DATE | 유효 시작일 |
| effective_to | DATE | 유효 종료일 |

### 5.4 업계 허용오차 표준

- **수량 허용오차**: ±5% (업계 표준)
- **페이지 수**: 4의 배수 (제본 시)
- **블리드**: 3mm (일반), 5mm (대형)

---

## 6. 결론 및 권장 사항

### 6.1 즉시 적용 가능한 표준

1. **ISO 216 사이즈 코드** 사용
2. **GSM 기반 평량 표기** 통일
3. **영문 표준 용어** 코드에 반영
4. **JDF 프로세스/리소스 명명** 참고

### 6.2 정규화 우선순위

1. **용지 마스터** - 가장 다양, 표준화 시급
2. **후가공 마스터** - 용어 통일 필요
3. **제본 마스터** - 페이지 규칙 적용
4. **사이즈 마스터** - ISO/JIS 구분 명확화

### 6.3 다음 단계

1. 기존 xlsx 파일 분석하여 현재 용어 매핑
2. 표준 코드 체계로 변환 규칙 수립
3. SPEC 문서에 마스터 테이블 스키마 포함
4. Apps Script로 자동 변환 도구 개발

---

## 참고 출처

### 국제 표준
- [CIP4 Organization - JDF](https://www.cip4.org/print-automation/jdf)
- [JDF Wikipedia](https://en.wikipedia.org/wiki/Job_Definition_Format)
- [APTech Standards](https://printtechnologies.org/standards/)
- [ISO 216 Wikipedia](https://en.wikipedia.org/wiki/ISO_216)

### 용지/인쇄 가이드
- [Instantprint GSM Guide](https://www.instantprint.co.uk/printspiration/print-design-tips/what-is-gsm-and-how-do-you-choose-which-one-you-need)
- [Paper Weight Guide](https://www.paperpapers.com/news/paper-weight-guide-gsm-vs-lbs/)

### 후가공 용어
- [Duplo USA Print Finishing 101](https://www.duplousa.com/2024/10/print-finishing-101/)
- [Prepressure Finishing](https://www.prepressure.com/finishing)
- [Printing Partners Glossary](https://www.printingpartners.net/printing-knowledge-library/glossary/)

### 한국 인쇄 표준
- [나무위키 종이/규격](https://namu.wiki/w/%EC%A2%85%EC%9D%B4/%EA%B7%9C%EA%B2%A9)
- [박스마스터 인쇄학개론](https://boxmaster.co.kr/blog/%EC%9D%B8%EC%87%84%ED%95%99%EA%B0%9C%EB%A1%A0/%EC%9D%B8%EC%87%84%EC%9A%A9-%EC%A2%85%EC%9D%B4-%EC%82%AC%EC%9D%B4%EC%A6%88-%EA%B7%9C%EA%B2%A9)

### MIS/견적 시스템
- [SourceForge Print Estimating](https://sourceforge.net/software/print-estimating/)
- [Capterra Print Estimating](https://www.capterra.com/print-estimating-software/)
- [전자신문 - 피카소 솔루션](https://www.etnews.com/20140704000187)
