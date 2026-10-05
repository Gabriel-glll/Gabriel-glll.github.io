"""Junta a captação recém-gerada (ou excluída) à lista.json mais atual do repositório."""
import json, os, subprocess

try:
    atual = json.loads(subprocess.run(["git", "show", "origin/main:captacao/lista.json"],
                                      capture_output=True, check=True).stdout.decode("utf-8"))
except Exception:
    atual = []
mudou = False
if os.path.exists("captacao/_remover.txt"):
    fora = {l.strip() for l in open("captacao/_remover.txt", encoding="utf-8") if l.strip()}
    atual = [i for i in atual if i["slug"] not in fora]
    mudou = True
if os.path.exists("captacao/_entrada.json"):
    nova = json.load(open("captacao/_entrada.json", encoding="utf-8"))
    atual = [i for i in atual if i["slug"] != nova["slug"] and i["codigo"] != nova["codigo"]]
    atual.insert(0, nova)
    mudou = True
if True:  # sempre parte da lista do repositório (nunca da cópia antiga deste pedido)
    with open("captacao/lista.json", "w", encoding="utf-8") as f:
        json.dump(atual, f, ensure_ascii=False, indent=1)
