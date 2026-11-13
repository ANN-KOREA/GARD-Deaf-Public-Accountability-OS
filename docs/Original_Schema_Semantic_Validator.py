#!/usr/bin/env python3
"""GARD DPA v1.0: standard-library structural and semantic smoke tests.

Purpose: verifies synthetic data bundle and detects common aggregation errors.
This is not a full implementation of JSON Schema Draft 2020-12 and not a legal audit.
If the optional 'jsonschema' package is present, full schema validation also runs.
"""
from __future__ import annotations

from copy import deepcopy
from datetime import date
from pathlib import Path
import json
import re
import sys
from urllib.parse import urlparse

BASE = Path(__file__).resolve().parent
SCHEMA = BASE / "GARD_DPA_Data_Schema_v1.0.json"
DATA = BASE / "GARD_DPA_Synthetic_Demo_v1.0.json"

def load_file(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def structural_errors(bundle: dict, schema: dict):
    errors = []
    required = set(schema["required"])
    if not isinstance(bundle, dict):
        return ["Root must be JSON object"]
    for k in sorted(required - bundle.keys()):
        errors.append(f"Root required field missing: {k}")
    for k in bundle.keys() - set(schema["properties"]):
        errors.append(f"Root unknown field: {k}")
    meta = bundle.get("meta", {})
    for k in schema["properties"]["meta"]["required"]:
        if k not in meta: errors.append(f"meta missing: {k}")
    if meta.get("schema_version") != "1.0.0": errors.append("Unsupported schema version")
    for key in ("organizations","facilities","finances","staff_aggregates","services","outcomes","governance","evidence","reviews"):
        rows=bundle.get(key)
        if not isinstance(rows,list):
            errors.append(f"{key} must be list")
            continue
        local_ref=schema["properties"][key]["items"]["$ref"].split("/")[-1]
        item_schema=schema["$defs"][local_ref]
        allowed=set(item_schema["properties"])
        required_fields=set(item_schema.get("required",[]))
        for idx,row in enumerate(rows):
            if not isinstance(row,dict):
                errors.append(f"{key}[{idx}]: must be object")
                continue
            for k in sorted(row.keys()-allowed):
                errors.append(f"{key}[{idx}]: unknown field {k}")
            for k in sorted(required_fields-row.keys()):
                errors.append(f"{key}[{idx}]: missing required field {k}")
    return errors

def semantic_errors(b: dict):
    errors = []
    def records(key):
        x = b.get(key)
        return x if isinstance(x,list) else []
    def check_nonnegative(record, field, origin):
        val = record.get(field)
        if val is not None and (isinstance(val,bool) or not isinstance(val,(int,float)) or val < 0):
            errors.append(f"{origin}: invalid nonnegative field {field}: {val!r}")
    id_tables = [
        ("organizations","org_id"),("facilities","facility_id"),("finances","finance_id"),
        ("staff_aggregates","staff_record_id"),("services","service_record_id"),
        ("outcomes","outcome_id"),("governance","governance_id"),
        ("evidence","evidence_id"),("reviews","review_id")
    ]
    for tab, ident in id_tables:
        ids = [r.get(ident) for r in records(tab)]
        if len(ids) != len(set(ids)): errors.append(f"Duplicate {ident} in {tab}")
    orgs = {x.get("org_id") for x in records("organizations")}
    facilities = {x.get("facility_id") for x in records("facilities")}
    evidence = {x.get("evidence_id") for x in records("evidence")}
    for row in records("facilities"):
        operator = row.get("operator_org_id")
        if operator is not None and operator not in orgs:
            errors.append(f"{row.get('facility_id')}: missing operator org")
    for tab in ("finances","staff_aggregates","services","outcomes"):
        for row in records(tab):
            idv=row.get("facility_id")
            if idv is not None and idv not in facilities:
                errors.append(f"{tab}: unknown facility_id: {idv}")
    for row in records("governance"):
        if row.get("org_id") not in orgs: errors.append("governance: unknown org")
    for tab in ("organizations","facilities","finances","staff_aggregates","services","outcomes","governance"):
        for row in records(tab):
            for rid in row.get("evidence_ids", []):
                if rid not in evidence: errors.append(f"{tab}: unknown evidence_id {rid}")
    stages=set()
    for row in records("finances"):
        label=row.get("finance_id","(unknown)")
        check_nonnegative(row,"amount_krw",label)
        if row.get("recipient_org_id") not in orgs and row.get("recipient_org_id") is not None:
            errors.append(f"{label}: unknown recipient org")
        key=(row.get("facility_id"),row.get("fiscal_year"),row.get("money_flow_id"),row.get("accounting_stage"))
        if key in stages: errors.append(f"{label}: same money-flow + stage duplicate")
        stages.add(key)
    for row in records("staff_aggregates"):
        label=row.get("staff_record_id")
        for k in ("sign_interpreters","deaf_interpreters","other_staff","fte"):
            check_nonnegative(row,k,label)
    for row in records("services"):
        label=row.get("service_record_id","(unknown)")
        keys=("requests_total","completed_requests","unserved_requests","cancelled_by_user","pending_requests",
              "completed_service_events","unique_users")
        for k in keys: check_nonnegative(row,k,label)
        total=row.get("requests_total")
        states=[row.get(k) for k in ("completed_requests","unserved_requests","cancelled_by_user","pending_requests")]
        if total is not None and all(x is not None and isinstance(x,int) for x in states):
            if sum(states) != total: errors.append(f"{label}: request states do not equal requests_total")
        if row.get("period_start","")>row.get("period_end",""): errors.append(f"{label}: reversed period")
    for row in records("outcomes"):
        label=row.get("outcome_id","(unknown)")
        for k in ("eligible_cohort_count","respondents","positive_responses"):
            check_nonnegative(row,k,label)
        a,z,n=row.get("positive_responses"),row.get("respondents"),row.get("eligible_cohort_count")
        if a is not None and z is not None and a>z: errors.append(f"{label}: positive > respondents")
        if z is not None and n is not None and z>n: errors.append(f"{label}: respondents > cohort")
    for row in records("governance"):
        label=row.get("governance_id","(unknown)")
        for k in ("eligible_voters","ballots_cast","formal_complaints_received","formal_complaints_resolved"):
            check_nonnegative(row,k,label)
        e,v=row.get("eligible_voters"),row.get("ballots_cast")
        if e is not None and v is not None and v>e: errors.append(f"{label}: ballots > eligible voters")
        r,c=row.get("formal_complaints_received"),row.get("formal_complaints_resolved")
        if r is not None and c is not None and c>r: errors.append(f"{label}: resolved complaints > received")
    if b.get("meta",{}).get("dataset_kind")=="synthetic_demo":
        for tab in ("organizations","facilities","finances","staff_aggregates","services","outcomes","governance"):
            for row in records(tab):
                if row.get("record_status")!="synthetic_only": errors.append(f"Synthetic record not labelled: {tab}")
        for row in records("evidence"):
            if row.get("source_kind")!="synthetic": errors.append("Synthetic evidence labelled as real")
    return errors

def sum_finance_by_stage(b,stage):
    values=[r["amount_krw"] for r in b["finances"] if r.get("accounting_stage")==stage and isinstance(r.get("amount_krw"),int)]
    return sum(values)

def closed_fulfillment(b, facility_ids=None):
    service = [s for s in b["services"] if facility_ids is None or s["facility_id"] in facility_ids]
    required=("completed_requests","unserved_requests")
    if any(any(s.get(k) is None for k in required) for s in service):
        return None
    n=sum(s["completed_requests"] for s in service)
    d=n + sum(s["unserved_requests"] for s in service)
    return None if d==0 else n/d

def full_schema_errors(bundle, schema):
    try:
        import jsonschema
    except ImportError:
        return [], "optional jsonschema not installed"
    validator=jsonschema.Draft202012Validator(schema,format_checker=jsonschema.FormatChecker())
    errors=[f"{'/'.join(map(str,e.path))}: {e.message}" for e in validator.iter_errors(bundle)]
    return errors, "full JSON Schema validation"

def test(name, expr, error_log):
    if expr:
        print("PASS",name)
    else:
        print("FAIL",name)
        error_log.append(name)

def main():
    schema=load_file(SCHEMA)
    data=load_file(DATA)
    failures=[]
    test("S01 file presence and JSON parse",True,failures)
    test("S02 root structural validation",not structural_errors(data,schema),failures)
    errs,kind=full_schema_errors(data,schema)
    test("S03 "+kind,not errs,failures)
    if errs: print("\n".join(errs[:8]))
    errs=semantic_errors(data)
    test("S04 cross-record and numeric semantics",not errs,failures)
    if errs: print("\n".join(errs[:8]))
    test("T01 synthetic demo has exactly 3 facilities",len(data["facilities"])==3,failures)
    test("T02 unknown operator remains null",data["facilities"][2]["operator_org_id"] is None,failures)
    test("T03 missing financial record is not zero",not any(x["facility_id"]=="SYN-FAC-003" for x in data["finances"]),failures)
    test("T04 budget and disbursement separate",sum_finance_by_stage(data,"appropriation")==610000000 and sum_finance_by_stage(data,"disbursement")==370000000,failures)
    test("T05 A closed fulfillment",abs(closed_fulfillment(data,{"SYN-FAC-001"})-900/1020)<1e-12,failures)
    test("T06 A+B closed fulfillment",abs(closed_fulfillment(data)-1400/1595)<1e-12,failures)
    outcome=data["outcomes"][0]
    test("T07 observed self-decision ratio",abs(outcome["positive_responses"]/outcome["respondents"]-0.75)<1e-12,failures)
    test("T08 response rate is separate",abs(outcome["respondents"]/outcome["eligible_cohort_count"]-80/220)<1e-12,failures)
    gov=data["governance"][0]
    test("T09 member vote turnout is not public population",abs(gov["ballots_cast"]/gov["eligible_voters"]-0.64)<1e-12,failures)
    bad=deepcopy(data);bad["facilities"].append(deepcopy(bad["facilities"][0]))
    test("T10 duplicate facility detection",any("Duplicate" in x for x in semantic_errors(bad)),failures)
    bad=deepcopy(data);bad["services"][0]["unserved_requests"]=121
    test("T11 invalid service status sum",any("request states" in x for x in semantic_errors(bad)),failures)
    bad=deepcopy(data);bad["outcomes"][0]["positive_responses"]=81
    test("T12 respondent bound",any("positive >" in x for x in semantic_errors(bad)),failures)
    bad=deepcopy(data);bad["finances"][0]["amount_krw"]=-1
    test("T13 negative payment rejection",any("nonnegative" in x for x in semantic_errors(bad)),failures)
    bad=deepcopy(data);bad["services"][0]["facility_id"]="SYN-FAC-LOST"
    test("T14 broken facility reference",any("unknown facility" in x for x in semantic_errors(bad)),failures)
    bad=deepcopy(data);bad["facilities"][0]["person_name"]="not allowed"
    err2,_=full_schema_errors(bad,schema)
    test("T15 extra personally identifying field rejected by schema",bool(err2) or bool(structural_errors(bad,schema)),failures)
    bad=deepcopy(data);bad["evidence"][0]["source_kind"]="government"
    test("T16 synthetic source cannot be relabelled government",any("Synthetic evidence" in x for x in semantic_errors(bad)),failures)
    print("Checks:",20,"; failures:",len(failures))
    if failures:
        print("Errors:",failures)
        return 1
    return 0

if __name__=="__main__":
    sys.exit(main())
