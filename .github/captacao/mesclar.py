"""Junta a captação recém-gerada à lista.json mais atual do repositório (pedidos em paralelo)."""
import json, os, subprocess

ent = "captacao/_entrada.json"
if os.path.exists(ent):
    nova = json.load(open(ent, encoding="utf-8"))
    try:
        atual = json.loads(subprocess.run(["git", "show", "origin/main:captacao/lista.json"],
                                          capture_output=True, check=True).stdout.decode("utf-8"))
    except Exception:
        atual = []
    atual = [i for i in atual if i["slug"] != nova["slug"] and i["codigo"] != nova["codigo"]]
    atual.insert(0, nova)
    with open("captacao/lista.json", "w", encoding="utf-8") as f:
        json.dump(atual, f, ensure_ascii=False, indent=1)
