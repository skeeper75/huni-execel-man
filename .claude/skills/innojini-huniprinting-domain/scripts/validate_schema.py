#!/usr/bin/env python3
"""
Schema-based spreadsheet validation.

Usage:
    python validate_schema.py <excel_file> <sheet_name> [price_columns]

Example:
    python validate_schema.py prices.xlsx "Sheet1" "unit_price,total"
"""

import sys
import json
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print(json.dumps({
        "status": "ERROR",
        "message": "pandas required. Install with: pip install pandas"
    }))
    sys.exit(2)

try:
    import pandera as pa
    PANDERA_AVAILABLE = True
except ImportError:
    PANDERA_AVAILABLE = False


def create_price_schema(price_columns, min_price=0, max_price=10_000_000):
    """Create Pandera schema for price columns."""
    if not PANDERA_AVAILABLE:
        return None
    
    columns = {}
    for col in price_columns:
        columns[col] = pa.Column(
            float,
            checks=[
                pa.Check.ge(min_price),
                pa.Check.le(max_price),
            ],
            nullable=True,
            coerce=True
        )
    
    return pa.DataFrameSchema(columns, strict=False, coerce=True)


def validate_with_pandera(df, schema):
    """Validate DataFrame with Pandera."""
    try:
        schema.validate(df, lazy=True)
        return {"status": "PASS", "errors": []}
    except pa.errors.SchemaErrors as e:
        errors = []
        for _, row in e.failure_cases.iterrows():
            errors.append({
                "check": str(row.get("check", "")),
                "column": str(row.get("column", "")),
                "index": str(row.get("index", "")),
                "failure_case": str(row.get("failure_case", ""))
            })
        return {"status": "FAIL", "errors": errors}


def validate_basic(df):
    """Basic statistical validation."""
    validations = []
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) == 0:
            continue
        
        stats = {
            "column": col,
            "min": float(col_data.min()),
            "max": float(col_data.max()),
            "mean": float(col_data.mean()),
            "null_count": int(df[col].isna().sum()),
            "negative_count": int((col_data < 0).sum()),
            "zero_count": int((col_data == 0).sum())
        }
        
        warnings = []
        if stats["negative_count"] > 0:
            warnings.append(f"Contains {stats['negative_count']} negative values")
        if stats["zero_count"] > 0 and stats["zero_count"] < len(col_data) * 0.5:
            warnings.append(f"Contains {stats['zero_count']} zero values")
        
        if warnings:
            stats["warnings"] = warnings
        
        validations.append(stats)
    
    return validations


def validate_sheet(filepath, sheet_name, price_columns=None):
    """Validate specific sheet."""
    results = {
        "file": filepath,
        "sheet": sheet_name,
        "pandera_available": PANDERA_AVAILABLE,
        "validations": []
    }
    
    try:
        df = pd.read_excel(filepath, sheet_name=sheet_name)
        results["shape"] = {"rows": len(df), "columns": len(df.columns)}
        results["columns"] = df.columns.tolist()
    except Exception as e:
        results["status"] = "ERROR"
        results["message"] = f"Failed to load sheet: {e}"
        return results
    
    results["validations"] = validate_basic(df)
    
    if price_columns and PANDERA_AVAILABLE:
        existing_cols = [c for c in price_columns if c in df.columns]
        if existing_cols:
            schema = create_price_schema(existing_cols)
            results["schema_validation"] = validate_with_pandera(df, schema)
        else:
            results["schema_validation"] = {
                "status": "SKIP",
                "message": f"Columns not found. Available: {df.columns.tolist()}"
            }
    elif price_columns and not PANDERA_AVAILABLE:
        results["schema_validation"] = {
            "status": "SKIP",
            "message": "Pandera not installed"
        }
    
    has_errors = False
    for v in results["validations"]:
        if v.get("negative_count", 0) > 0:
            has_errors = True
            break
    
    if results.get("schema_validation", {}).get("status") == "FAIL":
        has_errors = True
    
    results["status"] = "FAIL" if has_errors else "PASS"
    
    return results


def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "status": "ERROR",
            "message": "Usage: python validate_schema.py <excel_file> <sheet_name> [col1,col2,...]"
        }))
        sys.exit(2)
    
    filepath = sys.argv[1]
    sheet_name = sys.argv[2]
    price_columns = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    
    if not Path(filepath).exists():
        print(json.dumps({"status": "ERROR", "message": f"File not found: {filepath}"}))
        sys.exit(2)
    
    results = validate_sheet(filepath, sheet_name, price_columns)
    print(json.dumps(results, indent=2, ensure_ascii=False, default=str))
    
    sys.exit(0 if results.get("status") == "PASS" else 1)


if __name__ == '__main__':
    main()
