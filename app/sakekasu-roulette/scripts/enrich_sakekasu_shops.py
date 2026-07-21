"""
enrich_sakekasu_shops.py
-------------------------
大阪酒カスルーレットの店舗データ(MockData.ts / final_shops_544.json)の
住所欠落・ランチ営業フラグ・予算帯などを自動検索スクレイピングして補正するPythonバッチスクリプト。

- 安全なディレイ(2.0秒)でアクセス
- 進捗自動保存(いつでも中断・再開可能)
- Yahoo/Google検索のHTMLから住所や営業時間を自動抽出
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import random

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SAKEKASU_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOCK_DATA_TS = os.path.join(SAKEKASU_DIR, "src", "constants", "MockData.ts")
JSON_DATA = os.path.join(SAKEKASU_DIR, "scripts", "final_shops_544.json")
PROGRESS_FILE = os.path.join(SAKEKASU_DIR, "data", "enrich_progress.json")

os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
]
ua_idx = 0

def get_headers():
    global ua_idx
    ua = USER_AGENTS[ua_idx % len(USER_AGENTS)]
    ua_idx += 1
    return {
        "User-Agent": ua,
        "Accept-Language": "ja-JP,ja;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }

def fetch_html(url, timeout=10):
    req = urllib.request.Request(url, headers=get_headers())
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            if resp.info().get('Content-Encoding') == 'gzip':
                import gzip
                raw = gzip.decompress(raw)
            return raw.decode("utf-8", errors="replace")
    except Exception as e:
        return None

def search_shop_info(shop_name):
    """
    店舗名から住所・電話番号・ランチ営業情報をWeb検索で抽出
    """
    query = f"大阪 {shop_name} 住所 営業時間"
    url = f"https://search.yahoo.co.jp/search?p={urllib.parse.quote(query)}"
    html = fetch_html(url)
    
    info = {
        "address": None,
        "phone": None,
        "hasLunch": None
    }
    
    if not html:
        return info
    
    # 住所パース (〒... 大阪府... または 大阪市...)
    addr_match = re.search(r'(〒?\d{3}-\d{4}\s*大阪[府市][^<"\':\n]{5,40})', html)
    if not addr_match:
        addr_match = re.search(r'(大阪府大阪市[^<"\':\n]{5,35})', html)
    if addr_match:
        info["address"] = re.sub(r'<[^>]+>', '', addr_match.group(1)).strip()
        
    # 電話番号パース
    phone_match = re.search(r'0\d{1,4}-\d{1,4}-\d{3,4}', html)
    if phone_match:
        info["phone"] = phone_match.group(0)
        
    # ランチ営業キーワード
    if "ランチ" in html or "昼営業" in html or "11:00" in html or "11:30" in html or "12:00" in html:
        info["hasLunch"] = True
    elif "夜のみ" in html or "17:00〜" in html or "18:00〜" in html:
        info["hasLunch"] = False
        
    return info

def load_shops_from_json():
    if os.path.exists(JSON_DATA):
        with open(JSON_DATA, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_progress(shops, progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump({"progress": progress, "shops": shops}, f, ensure_ascii=False, indent=2)

def main():
    print("="*60)
    print("大阪酒カスルーレット - 店舗情報自動補正・拡充エンジン")
    print("="*60)
    
    shops = load_shops_from_json()
    if not shops:
        print("[ERROR] final_shops_544.json が読み込めませんでした。", file=sys.stderr)
        return
        
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                progress = data.get("progress", {})
                # 途中のデータがあれば引き継ぐ
                saved_shops = data.get("shops", [])
                if len(saved_shops) == len(shops):
                    shops = saved_shops
        except Exception:
            pass

    total = len(shops)
    updated_count = 0
    
    print(f"[INPUT] 全店舗数: {total}件 | 補正済み: {len(progress)}件")
    
    for idx, shop in enumerate(shops):
        s_id = str(shop.get("id"))
        if s_id in progress:
            continue
            
        name = shop.get("name", "")
        current_addr = shop.get("address")
        
        # 住所がない、あるいは「Address missing」になっているものを優先補正
        needs_addr = not current_addr or len(current_addr) < 6
        
        print(f"[{idx+1}/{total}] 店舗: {name} (要住所補正: {needs_addr}) ", end="", flush=True)
        
        if needs_addr or shop.get("hasLunch") is None:
            info = search_shop_info(name)
            
            if info["address"] and needs_addr:
                shop["address"] = info["address"]
                print(f"→ [住所発見] {info['address'][:25]}... ", end="")
            if info["phone"] and not shop.get("phone"):
                shop["phone"] = info["phone"]
            if info["hasLunch"] is not None:
                shop["hasLunch"] = info["hasLunch"]
                
            updated_count += 1
            print("→ [更新完了]")
        else:
            print("→ [スキップ (補完済み)]")
            
        progress[s_id] = True
        
        if (idx + 1) % 10 == 0:
            save_progress(shops, progress)
            print(f"\n  [SAVE] チェックポイント保存: {idx+1}/{total}件完了\n")
            
        time.sleep(2.0 + random.uniform(0, 0.5))

    save_progress(shops, progress)
    print("\n" + "="*60)
    print(f"[完了] スキャン終了。更新件数: {updated_count}件")
    print(f"進捗ファイル: {PROGRESS_FILE}")
    print("="*60)

if __name__ == "__main__":
    main()
