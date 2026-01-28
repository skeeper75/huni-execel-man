# Huniprinting Master Structure Analysis

## Contents
- Overall Structure
- Data Flow
- MES Code System
- Special Markers
- Color Coding
- Core Formulas
- Entity Relationships
- Price Table Structure (NEW)
- Sheet-by-Sheet Reference (NEW)

---

## Overall Structure

### Sheet Role Classification (by Tab Color)

| Tab Color | Hex Code | Role | Sheets |
|-----------|----------|------|--------|
| Orange | FFE36C09 | Master/Mapping | MAP |
| Red | FFFF0000 | Reference Data | !디지털인쇄용지 |
| None | Default | Core Product | 디지털인쇄, 스티커, 책자, 포토북, 캘린더, 실사, 아크릴, 굿즈, 문구(노트), 상품악세사리, MES품목(공정) |
| Green | FF6AA84F | External Channel | 비즈하우스, 후지필름, 스토어 |

---

## Data Flow

```
!디지털인쇄용지 (Reference Data)
    │ Paper specifications, #tags
    ▼
MAP (Product Categories)
    │ Category hierarchy, ▶︎ markers
    ▼
Product Sheets (디지털인쇄, 스티커, etc.)
    │ MES codes, sizes, paper references
    ▼
MES품목(공정)
    │ Production processes
    ▼
External Channels (비즈하우스, 후지필름, 스토어)
    Channel-specific mappings
```

### Cross-File Data Flow (NEW)

```
┌─────────────────────────────────────────────────────────┐
│                    상품마스터                            │
│  !디지털인쇄용지 → MAP → 상품시트 → MES품목(공정)        │
│         │                   │                          │
│         │ 용지명            │ 상품옵션, 수량, 사이즈     │
│         ▼                   ▼                          │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    인쇄가격표                            │
│  디지털용지 + 디지털출력비 + 후가공 = 최종가격           │
└─────────────────────────────────────────────────────────┘
```

---

## MES Code System

### Code Structure

```
[3-digit category]-[4-digit sequence]
       ↓                  ↓
     001-              0001
   Product group     Serial number
```

### Category Mapping

| Prefix | Category | Sheet | 한글명 |
|--------|----------|-------|-------|
| 001 | Postcards | 디지털인쇄 | 엽서 |
| 002 | Stickers | 스티커 | 스티커 |
| 003 | Promotional | 디지털인쇄 | 인쇄홍보물 |
| 004 | Posters | 실사 | 포스터 |
| 005 | Signs/Banners | 실사 | 사인/배너 |
| 006 | Booklets | 책자 | 책자 |
| 007 | Calendars | 캘린더 | 캘린더 |
| 008 | Stationery | 문구(노트) | 문구 |
| 009 | Acrylic | 아크릴 | 아크릴 |
| 010 | Goods | 굿즈 | 굿즈 |

### MES Code Presence by Sheet (NEW)

| 시트 | MES 코드 | 형식 | 비고 |
|------|---------|------|------|
| 디지털인쇄 | ✅ | 001-XXXX | 표준 형식 |
| 스티커 | ✅ | 002-XXXX | 표준 형식 |
| 책자 | ✅ | (SET) | SET 기준 |
| 포토북 | ❌ | - | ID 별도 |
| 캘린더 | ❌ | - | code 컬럼 |
| 실사 | ❌ | - | code 컬럼 |
| 아크릴 | ❌ | - | code 컬럼 |
| 굿즈 | ❌ | - | ID 컬럼 |
| 문구(노트) | ✅ | (SET) | SET 기준 |
| 비즈하우스 | ✅ | 표준 | 외부채널 |
| 후지필름 | ✅ | 표준 | 외부채널 |
| 스토어 | ✅ | 표준 | 품목코드 |
| MES품목(공정) | ✅ | 표준 | 공정 정의 |

---

## Special Markers

| Marker | Meaning | Location | Example |
|--------|---------|----------|---------|
| ▶︎ | Main category header | MAP sheet | ▶︎엽서, ▶︎스티커 |
| ★ | New or special | MAP, Products | 투명엽서★ |
| ● | Applicable/enabled | !디지털인쇄용지 | ● = usable |
| # | Reference tag | Column headers | #엽서, #스티커 |
| ! | Reference data prefix | Sheet tabs | !디지털인쇄용지 |

### # Tag System Detail (NEW)

용지 시트에서 # 태그는 해당 용지가 적용 가능한 상품군을 표시:

| 태그 | 적용 상품 | 비고 |
|------|----------|------|
| #디지털인쇄용지 | 소량전단지, 포스터, 리플렛 | 코팅/오시/접지 가능 |
| #엽서 | 엽서, 카드 | 오시/접지 가능 |
| #봉투 | 봉투류 | - |
| #상품권 | 상품권 | 오시/미싱 |
| #반칼스티커 | 반칼커팅 스티커 | - |
| #완칼스티커 | 낱장스티커, 대형스티커 | 평판커팅 |
| #타투스티커 | 타투스티커 | - |
| #합판스티커 | 합판스티커 | - |

---

## Color Coding

### Column Header Colors (상세)

| Hex Code | Visual | Meaning | 해당 컬럼 |
|----------|--------|---------|----------|
| FFC4BD97 | 🟤 Beige | 시스템 필수 필드 | 구분, code, MES ITEM_CD, 상품명, 판수, 종이, 인쇄(4도), 코팅, 커팅가공, 접지가공, 추가상품, 수량 |
| FFD8D8D8 | ⬜ Gray | 사용자 옵션 | 사이즈옵션 |
| FF93C47D | 🟢 Light Green | 계산/작업 사이즈 | 블리드, 작업사이즈, 재단사이즈, 출력용지규격, 파일명약어, 출력파일, 인쇄방법 |
| FFF6B26B | 🟠 Orange | 기능 옵션 | 업로드, 편집기, 모서리, 오시, 미싱, 가변(텍스트), 가변(이미지) |
| FFE06666 | 🔴 Red | 별색 인쇄 옵션 | 화이트별색, 클리어별색, 핑크별색, 금별색, 은별색 |
| FFFABF8F | 🟡 Peach | 박/형압 가공 | 박/형압 가공, 박크기, 박칼라 |
| FF6D9EEB | 🔵 Blue | 수량 관련 | 건수유무, 제작수량(최소), 제작수량(최대), 제작수량(증가폭) |
| FFDAEEF3 | 💙 Light Blue | MAP 카테고리 헤더 | 01~07 카테고리 |
| FFFFFF00 | 🟨 Yellow | 주의/수정 필요 | 데이터 셀 강조 |

### Sheet Tab Colors

| Hex Code | Visual | Meaning |
|----------|--------|---------|
| FFE36C09 | Orange | Master/mapping sheet |
| FFFF0000 | Red | Reference data |
| FF6AA84F | Green | External channel |

---

## Core Formulas

### Size Calculation

```
Work Size = Trim Size + (Bleed × 2)
```

**Verified examples**:

| Bleed | Trim Size | Work Size | Check |
|-------|-----------|-----------|-------|
| 1.0mm | 73×98 | 75×100 | ✅ |
| 1.0mm | 100×150 | 102×152 | ✅ |
| 3.0mm | 210×297 | 216×303 | ✅ |

### Pansu Reference

| Product Size | Output Sheet | Pansu |
|--------------|--------------|-------|
| 73×98 | 316×467 | 15 |
| 100×150 | 316×467 | 8 |
| 135×135 | 316×467 | 6 |
| 148×210 | 316×467 | 4 |

### Price Calculation (NEW)

```python
# 단위 가격 계산
unit_price = (paper_cost / pansu) + print_cost + finishing_cost

# 최종 가격 계산
final_price = unit_price × (1 - discount_rate) × quantity
```

---

## Entity Relationships

### ERD (Enhanced)

```
┌──────────────────┐     ┌──────────────────┐
│    Category      │     │      Paper       │
│──────────────────│     │──────────────────│
│ cat_id (PK)      │     │ paper_id (PK)    │
│ name             │     │ name             │
│ parent_id (FK)   │     │ gram             │
│ level (1/2/3)    │     │ full_sheet_size  │
│ is_new (★)       │     │ price_per_ream   │
│ display_order    │     │ price_4cut       │
└──────────────────┘     │ applicable_tags  │
       │                 └──────────────────┘
       │                        │
       ▼                        ▼
┌─────────────────────────────────────────────┐
│                  Product                     │
│─────────────────────────────────────────────│
│ mes_code (PK)                               │
│ internal_code                               │
│ name                                        │
│ category_id (FK)                            │
│ paper_id (FK)                               │
│ size_option                                 │
│ trim_size_w, trim_size_h                    │
│ work_size_w, work_size_h                    │
│ bleed                                       │
│ pansu                                       │
│ output_sheet_size                           │
│ print_method (디지털/옵셋)                   │
│ print_sides (단면/양면)                      │
│ min_qty, max_qty, qty_step                  │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│              ProductOption                   │
│─────────────────────────────────────────────│
│ option_id (PK)                              │
│ mes_code (FK)                               │
│ option_type (coating/cutting/folding/foil)  │
│ option_value                                │
│ is_special_color (화이트/클리어/핑크/금/은)  │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│               Process                        │
│─────────────────────────────────────────────│
│ process_id (PK)                             │
│ mes_code (FK)                               │
│ process_name                                │
│ is_required                                 │
│ file_required                               │
│ internal_process                            │
│ external_process                            │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│              PriceTable                      │
│─────────────────────────────────────────────│
│ price_id (PK)                               │
│ product_id (FK)                             │
│ paper_id (FK)                               │
│ quantity_tier                               │
│ paper_unit_price                            │
│ print_unit_price                            │
│ finishing_unit_price                        │
│ discount_rate                               │
│ final_unit_price                            │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│             ChannelMapping                   │
│─────────────────────────────────────────────│
│ mapping_id (PK)                             │
│ mes_code (FK)                               │
│ channel_name (비즈하우스/후지필름/스토어)    │
│ channel_product_code                        │
│ channel_product_name                        │
│ channel_category                            │
└─────────────────────────────────────────────┘
```

---

## Price Table Structure (NEW)

### 인쇄가격표 시트 구조

| 시트 | 역할 | 수식 수 | 구조 |
|------|------|--------|------|
| 사이즈별 판걸이수 | 판수 참조 | 0 | 사이즈 → 판수 매핑 |
| 디지털용지 | 용지 단가 | 164 | 용지 × 상품 매트릭스 |
| 디지털출력비 | 인쇄 단가 | 161 | 수량 × 인쇄유형 매트릭스 |
| 후가공 | 후가공 단가 | 0 | 수량 × 옵션 매트릭스 |
| 후가공_박 | 박 단가 | 0 | 수량 × 박종류 매트릭스 |
| 제본 | 제본 단가 | 0 | 제본유형별 |
| 스티커 | 스티커 단가 | 0 | 사이즈/판수별 |
| 아크릴 | 아크릴 단가 | 13 | 직접입력형 |
| 포스터(실사) | 실사 단가 | 0 | 사이즈별 |
| 굿즈 | 굿즈 단가 | 784 | 상품/옵션별 |
| 파우치 | 파우치 단가 | 473 | 상품/옵션별 |

### 디지털출력비 구조

```
A열: 수량 티어 (1, 2, 5, 10, 20, 30, 40, 50...)
B열: (빈 열)
C열: 단면1도 단가
D열: 양면1도 = C × 2
E열: 단면칼라 단가
F열: 양면칼라 = E × 2
G열: 단면화이트 단가
H열: 양면화이트 = G × 2
...
```

### 수량별 할인 패턴 (참고)

| 수량 구간 | 예상 할인율 |
|----------|-----------|
| 1-9 | 0% |
| 10-49 | ~3% |
| 50-99 | ~6% |
| 100+ | ~10% |

---

## Sheet-by-Sheet Reference (NEW)

### 상품마스터 시트 요약

| 시트 | 행 | 열 | 데이터행 | MES | 핵심 컬럼 |
|------|---|---|---------|-----|----------|
| MAP | 1042 | 26 | ~33 | ❌ | 01 엽서 ~ 12 포장 |
| !디지털인쇄용지 | 1006 | 31 | ~88 | ❌ | 종이명, 평량, #태그 |
| 디지털인쇄 | 1099 | 43 | ~131 | ✅ | MES, 상품명, 사이즈, 종이 |
| 스티커 | 1086 | 37 | ~75 | ✅ | MES, 상품명, 사이즈, 커팅 |
| 책자 | 1013 | 45 | ~41 | ✅ | MES(SET), 내지, 표지 |
| 포토북 | 1079 | 55 | ~34 | ❌ | ID, 내지, 옵션 |
| 캘린더 | 1000 | 36 | ~21 | ❌ | code, 사이즈 |
| 실사 | 883 | 34 | ~106 | ❌ | code, Custom Dimension |
| 아크릴 | 1044 | 35 | ~80 | ❌ | code, Custom Dimension |
| 굿즈 | 1018 | 29 | ~241 | ❌ | ID, 상품명, 옵션 |
| 문구(노트) | 941 | 29 | ~17 | ✅ | MES(SET), 내지종이 |
| 상품악세사리 | 63 | 4 | ~61 | ❌ | 품목, 옵션 |
| 비즈하우스 | 1177 | 28 | ~146 | ✅ | code, 상품구분 |
| 후지필름 | 1144 | 23 | ~87 | ✅ | MES code, 상품코드 |
| 스토어 | 924 | 21 | ~300 | ✅ | 품목코드, 네이버카테고리 |
| MES품목(공정) | 1007 | 43 | ~270 | ✅ | MES코드, 공정 |

---

## Validation Rules

```python
# Size calculation
assert work_size == trim_size + (bleed * 2)

# MES code format
assert re.match(r'^\d{3}-\d{4}$', mes_code)

# Paper reference integrity
assert paper_name in paper_master_table

# Pansu positive
assert pansu > 0

# Price monotonic (qty↑ → unit_price↓)
for i in range(1, len(prices)):
    if quantities[i] > quantities[i-1]:
        assert unit_prices[i] <= unit_prices[i-1]

# Cross-file paper name matching (NEW)
master_papers = normalize_paper_names(master_sheet)
price_papers = normalize_paper_names(price_sheet)
assert master_papers.issubset(price_papers), "용지명 불일치 발견"
```
