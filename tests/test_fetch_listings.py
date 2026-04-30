import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fetch_listings import (
    extract_json_balanced,
    extract_initial_state,
    extract_pinia_state,
    extract_listing_ids,
    extract_listing_detail,
)


def test_extract_json_balanced_simple():
    html = 'window.__INITIAL_STATE__ = {"foo": "bar"};</script>'
    result = extract_json_balanced(html, "window.__INITIAL_STATE__")
    assert result == '{"foo": "bar"}'


def test_extract_json_balanced_nested():
    html = 'window.__INITIAL_STATE__ = {"a": {"b": 1}};</script>'
    result = extract_json_balanced(html, "window.__INITIAL_STATE__")
    assert result == '{"a": {"b": 1}}'


def test_extract_json_balanced_missing_marker():
    result = extract_json_balanced("no marker here", "window.__INITIAL_STATE__")
    assert result is None


def test_extract_initial_state_regex():
    payload = {"resultList": {"search": {"fullSearch": {"result": {"listings": []}}}}}
    html = f"<script>window.__INITIAL_STATE__ = {json.dumps(payload)};</script>"
    result = extract_initial_state(html)
    assert result == payload


def test_extract_initial_state_none_on_missing():
    result = extract_initial_state("<script>var x = 1;</script>")
    assert result is None


def test_extract_pinia_state_regex():
    payload = {"listing": {"listing": {"id": "123"}}}
    html = f"<script>window.__PINIA_INITIAL_STATE__ = {json.dumps(payload)};</script>"
    result = extract_pinia_state(html)
    assert result == payload


def test_extract_pinia_state_none_on_missing():
    result = extract_pinia_state("<script>var x = 1;</script>")
    assert result is None


def test_extract_listing_ids_happy_path():
    state = {
        "resultList": {
            "search": {
                "fullSearch": {
                    "result": {
                        "listings": [
                            {"listing": {"id": "111"}},
                            {"listing": {"id": "222"}},
                        ]
                    }
                }
            }
        }
    }
    result = extract_listing_ids(state)
    assert result == ["111", "222"]


def test_extract_listing_ids_missing_key():
    result = extract_listing_ids({"wrong": "structure"})
    assert result == []


def test_extract_listing_detail_happy_path():
    detail = {"id": "123", "address": {"locality": "Zürich"}}
    pinia = {"listing": {"listing": detail}}
    result = extract_listing_detail(pinia)
    assert result == detail


def test_extract_listing_detail_missing_key():
    result = extract_listing_detail({"wrong": "structure"})
    assert result is None
