/*
  BASE DE LANÇAMENTOS — fonte: "LANÇAMENTOS CAMPINAS 2026 ATUALIZADO" (PDF ZFF)
  Para atualizar: edite/adicione objetos abaixo. Campos:
    n  = nome do empreendimento        c  = construtora
    b  = bairro                         t  = "apto" | "casa"
    m  = metragens em m² (lista)        d  = [dorms mín, dorms máx] (null = não informado)
    su = true se as unidades são suítes v  = vagas (texto)
    e  = entrega "AAAA-MM" | "pronto"   el = rótulo opcional da entrega
    p  = preços médios: [[m², valor em R$ mil | null = esgotado], ...]  (m² null = valor geral)
    vis = "stand_dec" | "stand" | "torre" | "imovel" | "dec" | "virtual" | "nenhum"
    vo = observação da visita            tip = tipologia extra   obs = observações
    end = endereço   ficha = [["rótulo","valor"], ...]   lazer = ["item", ...]   (seção "Sobre o empreendimento")

  CAMPOS QUE O PDF NÃO TRAZ (preencha quando souber; sem o campo = "não informado"):
    vc    = tipo de vaga: "coberta" | "descoberta" | "ambas"
    fgts  = aceita FGTS na entrada: true | false
    inv   = ótimo para investimento: true | false
    suite = tem suíte: true | false   (projetos com su:true já contam como "tem suíte")
  Ex.: { n:"Lazur", ..., vc:"coberta", fgts:true, inv:true, suite:true },
*/
window.ATUALIZADO_EM = "Out/2026";

window.LANCAMENTOS = [
  // ── MANSÕES SANTO ANTÔNIO ─────────────────────────────
  { n:"Alentejo", c:"Riva", b:"Mansões Santo Antônio", t:"apto", m:[58,74], d:[2,3], v:"1 e 2", e:"2027-06", p:[[null,800]], vis:"stand" },
  { n:"San Pietro", c:"Caprem", b:"Mansões Santo Antônio", t:"apto", m:[51,60], d:[2,3], v:"2", e:"2027-12", p:[[null,620]], vis:"stand_dec" },
  { n:"Lazur", c:"Tegra", b:"Mansões Santo Antônio", t:"apto", m:[57,70], d:[2,3], v:"1", e:"2027-12", p:[[57,590],[70,710]], vis:"stand_dec" },
  { n:"Liv Mansões", c:"ADN", b:"Mansões Santo Antônio", t:"apto", m:[47], d:[2,2], v:"1 e 2", e:"2028-04", p:[[null,520]], vis:"stand_dec" },
  { n:"High Life", c:"Valadares Gontijo", b:"Mansões Santo Antônio", t:"apto", m:[67], d:[2,2], v:"1 e 2", e:"2028-03", p:[[null,760]], vis:"stand_dec" },
  { n:"Yees Mansões", c:"Yees", b:"Mansões Santo Antônio", t:"apto", m:[34,55], d:[1,2], v:"1", e:"2027-07", p:[[null,570]], vis:"stand" },
  { n:"Be Mansões", c:"Vertaz", b:"Mansões Santo Antônio", t:"apto", m:[42], d:[1,2], v:"1", e:"2027-12", p:[[null,480]], vis:"nenhum" },
  { n:"Cores da Mata", c:"Direcional", b:"Mansões Santo Antônio", t:"apto", m:[46], d:[2,2], v:"1", e:"2028-06", p:[[null,450]], vis:"stand_dec" },
  { n:"Alta Vista", c:"Direcional", b:"Mansões Santo Antônio", t:"apto", m:[46], d:[2,2], v:"1", e:"2029-06", p:[[null,490]], vis:"stand_dec" },
  { n:"Alto das Mansões", c:"PAGV", b:"Mansões Santo Antônio", t:"apto", m:[35], d:[1,1], tip:"Studio", v:"1 (direito de uso)", e:"2029-10", p:[[null,350]], vis:"stand_dec" },
  { n:"WYN Residence", c:"Acro", b:"Mansões Santo Antônio", t:"apto", m:[77,95], d:[2,3], v:"2", e:"2029-01", p:[[77,865],[95,1200]], vis:"stand_dec", obs:"77 m² = 2 dorms · 95 m² = 3 dorms" },
  { n:"Freedom", c:"Ytcon", b:"Mansões Santo Antônio", t:"apto", m:[66], d:[2,3], v:"1", e:"2028-03", p:[[null,640]], vis:"stand_dec" },

  // ── NOVA CAMPINAS ─────────────────────────────────────
  { n:"Vista Horizonte", c:"Tegra", b:"Nova Campinas", t:"apto", m:[60,76], d:[2,3], v:"1", e:"2027-12", p:[[60,630],[76,820]], vis:"torre" },
  { n:"Frame", c:"Vanguard", b:"Nova Campinas", t:"apto", m:[50,85,120], d:[1,3], v:"1 e 2", e:"2028-06", p:[[50,630],[85,950],[120,1500]], vis:"stand_dec" },
  { n:"Wide", c:"EBM", b:"Nova Campinas", t:"apto", m:[104], d:[3,3], su:true, v:"2", e:"2027-02", p:[[null,1300]], vis:"torre" },
  { n:"Tay", c:"Vanguard", b:"Nova Campinas", t:"apto", m:[68,76,96,105], d:[2,3], v:"1 e 2", e:"2027-08", p:[[68,830],[76,935],[96,1250],[105,1400]], vis:"stand" },
  { n:"Belgravia", c:"Plaenge", b:"Nova Campinas", t:"apto", m:[136], d:[3,3], su:true, v:"2 e 3", e:"2030-02", p:[[null,1450]], vis:"stand_dec" },
  { n:"Velasca", c:"Arkesi", b:"Nova Campinas", t:"apto", m:[82,114], d:[2,3], su:true, v:"2", e:"2027-08", p:[[null,1200]], vis:"stand_dec" },

  // ── JD. PROENÇA ───────────────────────────────────────
  { n:"Eco Vila Primavera", c:"Furlan", b:"Jd. Proença", t:"apto", m:[67,77], d:[2,3], v:"2", e:"pronto", p:[[67,700],[77,845]], vis:"torre" },
  { n:"Upside", c:"Ytcon", b:"Jd. Proença", t:"apto", m:[68,87], d:[2,3], v:"1 e 2", e:"2028-04", p:[[68,800],[87,1100]], vis:"stand_dec" },

  // ── GUANABARA ─────────────────────────────────────────
  { n:"Liv Guanabara", c:"Livon", b:"Guanabara", t:"apto", m:[47], d:[2,2], v:"1 e 2", e:"2029-07", p:[[null,530]], vis:"stand_dec" },

  // ── CAMBUÍ ────────────────────────────────────────────
  { n:"Intento", c:"Bild", b:"Cambuí", t:"apto", m:[90,120], d:[2,3], su:true, v:"2 e 3", e:"2027-02", p:[[90,1200],[120,1350]], vis:"torre" },
  { n:"Verter", c:"AZO", b:"Cambuí", t:"apto", m:[156], d:[3,3], su:true, v:"3", e:"2026-02", p:[[null,2300]], vis:"nenhum" },
  { n:"The Mark", c:"Plaenge", b:"Cambuí", t:"apto", m:[133,193], d:[3,4], su:true, v:"2 a 4", e:"2026-03", p:[[null,2400]], vis:"stand" },
  { n:"Pininfarina", c:"Plaenge", b:"Cambuí", t:"apto", m:[240,348], d:[3,4], su:true, v:"3 e 4", e:"2029-05", p:[[null,7000]], vis:"stand" },
  { n:"Autentic", c:"Plaenge", b:"Cambuí", t:"apto", m:[155], d:[3,3], su:true, v:"3", e:"2028-03", p:[[null,3000]], vis:"stand" },
  { n:"Luce Cambuí", c:"Tegra", b:"Cambuí", t:"apto", m:[85,110], d:[2,3], suite:true, v:"2 + depósito", vc:"coberta", e:"2026-11", p:[[85,1100],[110,1450]], vis:"torre",
    tip:"85 m²: 3 dorms (1 suíte) ou 2 suítes · 110 m²: 3 suítes · cada unidade com depósito privativo de 2 m² (87 e 112 m² no total)",
    end:"Rua Américo Brasiliense, 443 — Cambuí",
    ficha:[["Unidades","136 em 2 torres (Clari e Lumi)"],["85 m²","66 unidades · 3 dorms (1 suíte) ou 2 suítes"],["110 m²","70 unidades · 3 suítes"],["Vagas","2 cobertas + 1 depósito privativo, vinculados"],["Terreno","3.382,71 m²"],["Arquitetura","Primi & Appoloni"],["Decoração","Debora Aguiar Arquitetos"],["Paisagismo","Neusa Nakata"],["Certificação","AQUA-HQE (sustentabilidade)"]],
    lazer:["Piscina com vista elevada","Fitness com sala de pilates","Family Space externo com churrasqueira e piscina","Family Space interno gourmet","Salão de festas","Salão de jogos","Brinquedoteca","Playground","Praça central com paisagismo","Bicicletário decorado","Delivery space","Carregador de carro elétrico","Portaria blindada e controle de acesso","Lazer em dois níveis"] },
  { n:"Ateliê", c:"ACT", b:"Cambuí", t:"apto", m:[43], d:[1,1], v:"1", e:"2025-12", p:[[null,600]], vis:"nenhum" },
  { n:"Yard", c:"Tegra", b:"Cambuí", t:"apto", m:[126], d:[3,3], su:true, v:"2", e:"pronto", p:[[null,1400]], vis:"torre" },
  { n:"Vestra", c:"Setin", b:"Cambuí", t:"apto", m:[139], d:[3,3], su:true, v:"2", e:"pronto", p:[[null,1650]], vis:"torre" },
  { n:"Belleville", c:"Santo André", b:"Cambuí", t:"apto", m:[128], d:[3,3], su:true, v:"2 e 3", e:"2027-12", el:"Final de 2027", p:[[null,1800]], vis:"torre" },
  { n:"Grand Paysage", c:"Stefany Nogueira", b:"Cambuí", t:"apto", m:[117], d:[3,3], su:true, v:"2", e:"pronto", p:[[null,1700]], vis:"torre" },
  { n:"HOX", c:"Acro", b:"Cambuí", t:"apto", m:[31,38,56,58,61,83], d:null, tip:"Studio, apartamento e loft duplex", v:"1", e:"2029-08", p:[[31,650],[58,935],[61,1100],[83,1380]], vis:"stand_dec" },
  { n:"Edge Cambuí", c:"One Innovation", b:"Cambuí", t:"apto", m:[110,136,180], d:[2,3], su:true, v:"2 e 3", e:"pronto", p:[[110,1550],[136,1700],[180,2500]], vis:"imovel", vo:"Visita ao apartamento" },
  { n:"Vivio", c:"Congesa", b:"Cambuí", t:"apto", m:[112,114], d:[3,3], su:true, v:"2 e 3", e:"2028-01", p:[[null,1800]], vis:"stand_dec", obs:"O PDF traz informação conflitante (\"tem stand e decorado\" e \"não tem stand nem decorado\") — confirmar antes de agendar." },
  { n:"Gallery Cambuí", c:"Grucom", b:"Cambuí", t:"apto", m:[73], d:[2,2], su:true, v:"1 e 2", e:"2029-05", p:[[null,1150]], vis:"stand_dec" },
  { n:"Mood Cambuí", c:"Congesa", b:"Cambuí", t:"apto", m:[76], d:[2,2], su:true, v:"1 e 2", e:"pronto", p:[[null,1240]], vis:"imovel", vo:"Visita no condomínio" },

  // ── IGUATEMI ──────────────────────────────────────────
  { n:"Avenida 105", c:"Building", b:"Iguatemi", t:"apto", m:[154,158], d:[3,4], v:"3", e:"2028-04", p:[[null,2300]], vis:"stand_dec" },
  { n:"Tresor", c:"Furlan", b:"Iguatemi", t:"apto", m:[80,100], d:[2,3], v:"2 e 3", e:"2028-12", p:[[80,1000],[100,1200]], vis:"stand_dec" },
  { n:"Hípica Boulevard", c:"Santo André", b:"Iguatemi", t:"apto", m:[91], d:[3,3], v:"2", e:"pronto", p:[[null,1100]], vis:"nenhum" },

  // ── GALLERIA ──────────────────────────────────────────
  { n:"Sensia Galleria", c:"Sensia", b:"Galleria", t:"apto", m:[61,74], d:[2,3], v:"1 e 2", e:"pronto", p:[[61,510],[74,650]], vis:"stand" },
  { n:"City Galleria", c:"MRV", b:"Galleria", t:"apto", m:[45,53], d:[2,2], v:"1", e:"2028-07", p:[[45,430],[53,530]], vis:"stand_dec" },
  { n:"Alto Galleria 2", c:"Zuma", b:"Galleria", t:"apto", m:[45], d:[2,2], v:"1", e:"2029-12", p:[[null,320]], vis:"stand_dec" },

  // ── SWISS PARK ────────────────────────────────────────
  { n:"Swiss Garden", c:"Sensia", b:"Swiss Park", t:"apto", m:[61,74], d:[2,3], v:"1 e 2", e:"2028-12", p:[[61,600],[74,760]], vis:"stand_dec" },
  { n:"Best View", c:"F.A. Oliva", b:"Swiss Park", t:"apto", m:[66,78], d:[2,3], v:null, e:"2027-04", p:[[66,700],[78,800]], vis:"stand" },

  // ── JD. AURÉLIA ───────────────────────────────────────
  { n:"Reserva Perfetto", c:"Stan", b:"Jd. Aurélia", t:"apto", m:[63,76,97], d:[2,3], v:"1 e 2", e:"pronto", p:[[63,620],[76,750],[97,null]], vis:"nenhum" },
  { n:"Terrace Home Resort", c:"Soedil", b:"Jd. Aurélia", t:"apto", m:[69], d:[3,3], v:"2", e:"2028-02", p:[[null,720]], vis:"stand_dec" },
  { n:"Spot", c:"Ytcon", b:"Jd. Aurélia", t:"apto", m:[66], d:[2,2], v:"1", e:"2027-05", p:[[null,530]], vis:"stand_dec" },

  // ── BONFIM ────────────────────────────────────────────
  { n:"Maxi Bonfim", c:"HM", b:"Bonfim", t:"apto", m:[64], d:[2,3], v:"1", e:"pronto", p:[[null,510]], vis:"nenhum" },
  { n:"Blend", c:"Living", b:"Bonfim", t:"apto", m:[55,66,80], d:[2,3], v:"1 e 2", e:"pronto", p:[[55,null],[66,null],[80,860]], vis:"stand" },

  // ── TAQUARAL ──────────────────────────────────────────
  { n:"Sensia Taquaral", c:"Sensia", b:"Taquaral", t:"apto", m:[63], d:[2,2], v:"1 e 2", e:"2026-05", p:[[null,630]], vis:"stand_dec" },
  { n:"Yees Taquaral", c:"Yees", b:"Taquaral", t:"apto", m:[55], d:[2,2], v:"1", e:"2027-07", p:[[null,650]], vis:"stand" },

  // ── PARQUE PRADO ──────────────────────────────────────
  { n:"Casa Prado", c:"Riva", b:"Parque Prado", t:"apto", m:[69,96], d:[2,3], v:"1 e 2", e:"2028-08", p:[[69,750],[96,1000]], vis:"stand_dec" },
  { n:"Florae Jambeiro", c:"Vitta", b:"Parque Prado", t:"apto", m:[44], d:[2,2], v:"1", e:"2028-12", p:[[null,340]], vis:"virtual" },
  { n:"Portal dos Jatobás", suite:true, c:"MRV", b:"Parque Prado", t:"apto", m:[44], d:[2,2], v:"até 1", e:"2029-12", el:"2029", p:[[null,290],[null,360]], vis:"stand", obs:"Com ou sem suíte. Preço de R$ 290 mil a R$ 360 mil." },

  // ── CASAS ─────────────────────────────────────────────
  { n:"Oni Dijon Taquaral", c:"Peconi", b:"Taquaral", t:"casa", m:[168,171], d:[3,3], su:true, v:"2", e:"2026-12", p:[[null,1500]], vis:"dec" },
  { n:"Lake Louise Taquaral", c:"CPN", b:"Taquaral", t:"casa", m:[136,193], d:[3,3], su:true, v:"2", e:"2027-03", p:[[136,1700],[193,2150]], vis:"dec", tip:"136 m² em 2 pavimentos · 193 m² em 3 pavimentos" },
  { n:"Club House Taquaral", c:"Concini", b:"Taquaral", t:"casa", m:[167], d:[3,3], su:true, v:"2", e:"2027-06", p:[[null,1400]], vis:"dec", tip:"3 pavimentos" },
  { n:"Quinta do Miranda Taquaral", c:"Miranda", b:"Taquaral", t:"casa", m:[174], d:[3,3], su:true, v:"2", e:"pronto", p:[[null,1700]], vis:"imovel", vo:"Visita na casa", tip:"3 pavimentos" },
  { n:"Moreira 1730", suite:true, c:"Não informada", b:"Mansões Santo Antônio", t:"casa", m:[158], d:[3,3], v:"2", e:"pronto", p:[[null,1300]], vis:"imovel", vo:"Visita na casa", tip:"3 dorms (1 suíte) · 3 pavimentos" },
  { n:"House Me Taquaral", suite:true, c:"Ravic", b:"Taquaral", t:"casa", m:[130], d:[3,3], v:null, e:"pronto", p:[[null,1250]], vis:"imovel", vo:"Visita na casa", tip:"3 dorms (1 suíte) · térrea ou 2 pavimentos" },
  { n:"Casa da Mata Gramado", suite:true, c:"AZO", b:"Gramado", t:"casa", m:[187,216], d:[3,4], v:"4", e:"2028-01", p:[[null,2350]], vis:"stand_dec", tip:"2 pavimentos · 3 suítes ou 4 dorms" },
  { n:"Maziero Betel", c:"Simoplan", b:"Betel (Paulínia)", t:"casa", m:[140], d:[3,3], su:true, v:"2", e:"2029-04", p:[[null,1500]], vis:"stand_dec", tip:"Térrea ou sobrado" },
  { n:"Casa Bella", c:"GNO", b:"Alphaville", t:"casa", m:[149,177], d:[3,3], su:true, v:"2", e:"2028-05", p:[[null,2000]], vis:"stand_dec", tip:"Sobrados" },
  { n:"Arborais Alta Vista", c:"Congesa", b:"Alphaville", t:"casa", m:[160,195], d:[3,4], su:true, v:"2 e 3", e:"2028-11", p:[[null,2400]], vis:"stand_dec" },
  { n:"Alpha Housing", c:"Não informada", b:"Alphaville", t:"casa", m:[120], d:[3,3], su:true, v:"2", e:"pronto", p:[[null,1400]], vis:"imovel", vo:"Visita na casa" },
  { n:"Lauzanne", c:"Santo André", b:"Não informado", t:"casa", m:[208], d:[3,4], su:true, v:"4", e:"2026-12", p:[[null,1550]], vis:"dec", vo:"Casa decorada" },
  { n:"Vila Vitta Taquaral", c:"I7", b:"Taquaral", t:"casa", m:[89,113,129], d:[2,3], su:true, v:"2", e:"2028-06", p:[[null,1100]], vis:"nenhum" },
];
