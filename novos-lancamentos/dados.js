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
  { n:"San Pietro", c:"Caprem", b:"Mansões Santo Antônio", t:"apto", m:[51,60], d:[2,3], v:"1 (vinculada)", vc:"ambas", e:"2027-12", p:[[null,620]], vis:"stand_dec",
    tip:"Plantas de 51 m² e 60 m² (2 e 3 dormitórios) · previsão de ar-condicionado na sala e dormitórios · ponto de água quente nos chuveiros e na pia da cozinha",
    end:"Rua Lauro Vannucci, 381 — Parque Rural Fazenda Santa Cândida",
    ficha:[["Torres","4 (A, B, C e D)"],["Garagem","Edifício-garagem: subsolo (cobertas e algumas descobertas), térreo (cobertas) e 1º andar (descobertas) · vagas vinculadas"],["Terreno","10.756,27 m²"],["Área construída","20.343,57 m²"],["Estrutura","Concreto armado e alvenaria estrutural"]],
    lazer:["Piscina","Churrasqueiras 1 e 2","Salão de festas","Sala de jogos","Espaço fitness","Brinquedoteca","Playground","Campo gramado","Pet place","Praça e espaço leitura","Office lounge","Espaço bem-estar"] },
  { n:"Lazur", c:"Tegra", b:"Mansões Santo Antônio", t:"apto", m:[57,70], d:[2,3], v:"1", e:"2027-12", p:[[57,590],[70,710]], vis:"stand_dec" },
  { n:"Liv Mansões", c:"ADN", b:"Mansões Santo Antônio", t:"apto", m:[47], d:[2,2], v:"1 e 2", e:"2028-04", p:[[null,520]], vis:"stand_dec" },
  { n:"High Life", c:"Valadares Gontijo", b:"Mansões Santo Antônio", t:"apto", m:[67], d:[2,2], v:"1 e 2", e:"2028-03", p:[[null,760]], vis:"stand_dec" },
  { n:"Yees Mansões", c:"Yees", b:"Mansões Santo Antônio", t:"apto", m:[34,55], d:[1,2], v:"1", e:"2027-07", p:[[null,570]], vis:"stand" },
  { n:"Be Mansões", c:"Vertaz", b:"Mansões Santo Antônio", t:"apto", m:[42], d:[1,2], v:"1", e:"2027-12", p:[[null,480]], vis:"nenhum" },
  { n:"Cores da Mata", c:"Direcional e Acro", b:"Mansões Santo Antônio", t:"apto", m:[45.28,46.69], d:[2,2], suite:true, v:"1", vc:"coberta", e:"2028-06", p:[[null,450]], vis:"stand_dec",
    tip:"2 dormitórios com suíte (exceto PCD) e varanda grill · plantas de 45,28 m² (ponta) e 46,69 m² (meio) · gardens no térreo com 5,96 m² ou 17,47 m² de área descoberta",
    end:"Rua Dois, 115 — Residencial Reserva Villa Bella",
    ficha:[["Unidades","300 em 2 torres (térreo + 18 pavimentos)"],["Por andar","8 apartamentos (6 gardens no térreo)"],["Vagas","Cobertas, não vinculadas às unidades"],["Complexo","Mangará Campinas: mais de 68 mil m², com ~29 mil m² de mata preservada e parque linear"],["Terreno","8.564,58 m²"],["Sistema","Paredes de concreto · pé-direito 2,52 m"],["Localização","250 m do Parque Dom Pedro Shopping"]],
    lazer:["Piscina adulto com deck molhado","Piscina infantil e solário","Academia e fitness externo","Salão de festas","Espaço gourmet e lounge gourmet","Churrasqueira com lounge","Pub e lounge wine","Coworking","Mini quadra","Playground e jogos","Pet place","Bike sharing","Lavanderia","Mini market","Vaga para carro elétrico","Parque linear com pomar e caminho aromático"] },
  { n:"Alta Vista", c:"Direcional e Acro", b:"Mansões Santo Antônio", t:"apto", m:[46,48], d:[2,2], suite:true, v:"1 (vinculada)", vc:"ambas", e:"2029-06", p:[[null,490]], vis:"stand_dec",
    tip:"Alta Vista Mangará · 2 dormitórios com suíte e varanda grill · plantas de 46 m² (ponta) e 48 m² (meio) · gardens no térreo com 55 m² e 66 m² · opção de vaga coberta",
    ficha:[["Complexo","Mangará Campinas (3º residencial): mais de 68 mil m², ~29 mil m² de mata preservada e parque linear de 4.400 m²"],["Vagas","Vinculadas às unidades, com opção de vaga coberta"],["Localização","2 min do Shopping Dom Pedro · 3 min do The Mall Villa Bella · 6 min da Unicamp"]],
    lazer:["Piscina adulto e infantil com deck","Academia com lounge","Espaço pilates","Quadra de areia recreativa","Salão de festas","Lounge gourmet","Churrasqueira com lounge","Wine lounge","Coworking / espaço influencer","Brinquedoteca","Playground","Praça de convívio e piquenique","Pet place","Bike sharing","Mini market","Vaga para carro elétrico","Parque linear com pomar e caminho aromático"] },
  { n:"Alto das Mansões", c:"PAGV", b:"Mansões Santo Antônio", t:"apto", m:[30.58,31.02,62.04], d:[1,2], v:"1 (direito de uso, com manobrista)", e:"2029-10", p:[[null,350]], vis:"stand_dec",
    tip:"Studios de 30,58 a 31,02 m² · 4 studios com Sky Garden (31,02 m² + 30,71 m² de jardim) · 7 coberturas duplex de 2 quartos (62,04 m²) · Powered by Housi (gestão de locação)",
    end:"Rua Prof. Luiz de Pádua, 185 — Santa Cândida",
    ficha:[["Unidades","188 residenciais em torre única (térreo + 24 pavimentos)"],["Studios","177 unidades de 30,58 a 31,02 m²"],["Studios Sky Garden","4 unidades de 31,02 m² + jardim de 30,71 m²"],["Duplex","7 coberturas de 2 quartos com 62,04 m²"],["Garagem","Com manobrista: 138 vagas de carro (2 descobertas), 4 PCD e 33 de moto"],["Lojas","5 lojas no térreo com pé-direito duplo"],["Terreno","2.000 m²"],["Locação","Parceria Housi (Vitacon) para gestão de aluguel"]],
    lazer:["Casa de Campo com churrasqueira, WC e piscina privativa","Piscina com deck molhado","Quadra de beach tennis e lounge","Gourmet com Steak House","Lounge gourmet","Academia","Sauna","Coworking / meeting room","Mini mercado","Laundry","Praça pet","Wine lounge","Hall instagramável","Bicicletário"] },
  { n:"WYN Residence", c:"Acro", b:"Mansões Santo Antônio", t:"apto", m:[77,95], d:[2,3], v:"2", e:"2029-01", p:[[77,865],[95,1200]], vis:"stand_dec", obs:"77 m² = 2 dorms · 95 m² = 3 dorms" },
  { n:"Freedom", c:"Ytcon", b:"Mansões Santo Antônio", t:"apto", m:[66], d:[2,3], v:"1", e:"2028-03", p:[[null,640]], vis:"stand_dec" },

  // ── NOVA CAMPINAS ─────────────────────────────────────
  { n:"Vista Horizonte", c:"Tegra", b:"Nova Campinas", t:"apto", m:[60,76.5], d:[2,3], suite:true, v:"1 ou 2", vc:"coberta", e:"2027-09", p:[[60,630],[76.5,820]], vis:"torre",
    tip:"60 m²: 2 dorms (1 suíte) ou sala ampliada com 1 suíte · 76,5 m²: 3 dorms (1 suíte) ou sala ampliada com 2 suítes · 12 unidades de 76,5 m² com 2 vagas",
    end:"Rua Maestro Agide Azzoni, 295 — Chácara da Barra (entre o Cambuí e Nova Campinas)",
    ficha:[["Unidades","272 em torre única de 34 andares (8 por andar)"],["60 m²","136 unidades · 1 suíte · 1 vaga"],["76,5 m²","124 unidades com 1 vaga + 12 com 2 vagas · 1 suíte"],["Garagem","Edifício-garagem (2 subsolos ao 1º pavimento), vagas vinculadas"],["Elevadores","5 (4 sociais e 1 de serviço)"],["Terreno","4.669,82 m²"],["Arquitetura","Primi & Appoloni"],["Decoração","Bohrer Arquitetos"],["Paisagismo","Marcelo Novaes"],["Certificação","AQUA-HQE (sustentabilidade)"]],
    lazer:["Family Pool com piscinas adulto e infantil e solário","Play Aventura","Quadra esportiva","Churrasqueira","Salão de festas","Festas gourmet","Lounge Square","Praça Boas-Vindas","Fit Place (academia) e fitness externo","Brinquedoteca","Game Room","Bicicletário decorado","Espaço delivery","Infraestrutura para carro elétrico","Controle de acesso e CFTV"] },
  { n:"Frame", c:"Vanguard", b:"Nova Campinas", t:"apto", m:[50,85,120], d:[1,3], v:"1 e 2", e:"2028-06", p:[[50,630],[85,950],[120,1500]], vis:"stand_dec" },
  { n:"Wide", c:"EBM", b:"Nova Campinas", t:"apto", m:[104], d:[3,3], su:true, v:"2", e:"2027-02", p:[[null,1300]], vis:"torre" },
  { n:"Tay", c:"Vanguard", b:"Nova Campinas", t:"apto", m:[68,76,96,105], d:[2,3], v:"1 e 2", e:"2027-08", p:[[68,830],[76,935],[96,1250],[105,1400]], vis:"stand" },
  { n:"Belgravia", c:"Plaenge", b:"Nova Campinas", t:"apto", m:[136], d:[3,3], su:true, v:"2 e 3", e:"2030-02", p:[[null,1450]], vis:"stand_dec" },
  { n:"Velasca", c:"Arkesi", b:"Nova Campinas", t:"apto", m:[82,114], d:[2,3], su:true, v:"2", e:"2027-08", p:[[null,1200]], vis:"stand_dec" },

  // ── JD. PROENÇA ───────────────────────────────────────
  { n:"Eco Vila Primavera", c:"Furlan", b:"Jd. Proença", t:"apto", m:[67,77], d:[2,3], v:"2", e:"pronto", p:[[67,700],[77,845]], vis:"torre" },
  { n:"Upside", c:"Ytcon", b:"Jd. Proença", t:"apto", m:[68,87], d:[2,3], v:"1 e 2", e:"2028-04", p:[[68,800],[87,1100]], vis:"stand_dec" },

  // ── GUANABARA ─────────────────────────────────────────
  { n:"Liv Guanabara", c:"ADN", b:"Guanabara", t:"apto", m:[47.19,47.73], d:[2,2], suite:true, v:"1", e:"2029-07", p:[[null,530]], vis:"stand_dec",
    tip:"2 dormitórios (1 suíte) com varanda gourmet e ponto a gás para churrasqueira · apê centro 47,19 m² e apê canto de 47,37 a 47,73 m² · pé-direito 2,60 m · depósito individual por andar (consultar)",
    end:"Rua Doutor Cândido Gomide, 738 — Jardim Guanabara",
    ficha:[["Unidades","96 apartamentos em 1 torre (subsolo + térreo + 16 andares)"],["Vagas","108: 49 P, 47 M, 2 PCD e 10 de moto"],["Terreno","1.964,98 m²"],["Área construída","7.416,20 m²"],["Diferenciais","Áreas comuns entregues equipadas e decoradas · portaria 24h com CFTV · Wi-Fi e USB nas áreas comuns"]],
    lazer:["Piscina","Salão de festas","Academia","Coworking","Brinquedoteca"] },

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
  { n:"Yard", c:"Tegra", b:"Cambuí", t:"apto", m:[126], d:[3,3], su:true, v:"2 (vinculadas)", e:"pronto", p:[[null,1400]], vis:"torre",
    tip:"Yard Cambuí · 3 suítes · terraço com laje nivelada à sala · 4 apartamentos por andar · previsão de ar-condicionado na sala e dormitórios, persianas com previsão de motorização",
    ficha:[["Por andar","4 apartamentos"],["Vagas","Vinculadas às unidades"],["Áreas comuns","Entregues climatizadas, equipadas e decoradas"],["Infraestrutura","Gerador para elevadores de serviço e bombas · carregamento de carro elétrico · CFTV nos acessos"]],
    lazer:["Piscina adulto com raia de 25 m","Piscina adulto com deck molhado","Piscina infantil e solário","Fitness com apoio externo","Salão de festas com apoio externo","Espaço gourmet com churrasqueira e forno de pizza","Churrasqueira","Salão de jogos","Brinquedoteca","Playground","Quadra recreativa","Pet place","Praça de chegada e lobby","Bicicletário decorado"] },
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
  { n:"Alto do Galleria II", c:"Zuma", b:"Galleria", t:"apto", m:[41.39,42.66], d:[2,2], v:"1 (carro ou moto)", e:"2029-08", p:[[null,320]], vis:"stand_dec",
    tip:"2 dormitórios com varanda · planta de ponta 41,39 m² (finais 1, 2, 5 e 6) e planta de meio 42,66 m² (finais 3 e 4) · previsão de ar-condicionado no quarto do casal",
    end:"Rua Antônio Pavin, 227 — Jardim Conceição",
    ficha:[["Unidades","108 apartamentos em torre única"],["Vagas","89 aptos com vaga de carro, 3 com carro + moto e 16 só com vaga de moto"],["Visitantes","5 vagas"],["Elevadores","2"],["Terreno","2.818,74 m²"],["Construtora","Zuma Engenharia"]],
    lazer:["Piscina","Playground","Academia","Salão gourmet com churrasqueira","Espaço multiuso","Bicicletário (10 vagas)","Portaria"] },

  // ── SWISS PARK ────────────────────────────────────────
  { n:"Swiss Garden", c:"Sensia", b:"Swiss Park", t:"apto", m:[61,74], d:[2,3], v:"1 e 2", e:"2028-12", p:[[61,600],[74,760]], vis:"stand_dec" },
  { n:"Best View", c:"F.A. Oliva", b:"Swiss Park", t:"apto", m:[66,78], d:[2,3], v:null, e:"2027-04", p:[[66,700],[78,800]], vis:"stand" },

  // ── JD. AURÉLIA ───────────────────────────────────────
  { n:"Reserva Perfetto", c:"Stan", b:"Jd. Aurélia", t:"apto", m:[63,76,97], d:[2,3], v:"1 e 2", e:"pronto", p:[[63,620],[76,750],[97,null]], vis:"nenhum" },
  { n:"Terrace Home Resort", c:"Soedil", b:"Jd. Aurélia", t:"apto", m:[69], d:[3,3], v:"2", e:"2028-02", p:[[null,720]], vis:"stand_dec" },
  { n:"Spot", c:"Ytcon", b:"Jd. Aurélia", t:"apto", m:[66], d:[2,2], v:"1", e:"2027-05", p:[[null,530]], vis:"stand_dec" },

  // ── BONFIM ────────────────────────────────────────────
  { n:"Maxi Bonfim", c:"HM", b:"Bonfim", t:"apto", m:[64.49], d:[2,3], v:"1", vc:"coberta", e:"pronto", p:[[null,510]], vis:"nenhum",
    tip:"HM Maxi Campinas · 64,49 m² com 3 dorms ou 2 dorms com sala estendida (também versão PCD) · varanda gourmet com churrasqueira a carvão · área técnica para ar-condicionado",
    end:"Rua da Constituição esquina com Rua Luiz Gama — Bonfim",
    ficha:[["Torres","5 (térreo + 17 pavimentos), 4 unidades por andar"],["Garagem","Edifício-garagem, 1 vaga por unidade"],["Terreno","8.829,18 m²"],["PCD","Unidades adaptáveis no 17º pavimento"]],
    lazer:["Piscinas adulto e infantil com prainha","Beach arena","Quadra poliesportiva","Espaço fitness","Espaço gourmet duplo","Quiosque churrasco","Coworking","Playground e espaço play kids","Pomar","Praça boas-vindas","Minimercado","Portaria de pedestres com porte-cochère","Lazer entregue equipado e decorado"] },
  { n:"Blend", c:"Living", b:"Bonfim", t:"apto", m:[55,66,80], d:[2,3], v:"1 e 2", e:"pronto", p:[[55,null],[66,null],[80,860]], vis:"stand" },

  // ── TAQUARAL ──────────────────────────────────────────
  { n:"Sensia Taquaral", c:"Sensia", b:"Taquaral", t:"apto", m:[61.17,63.22,122.32], d:[2,2], suite:true, v:"1 e 2", vc:"coberta", e:"2027-08", p:[[null,630]], vis:"stand_dec",
    tip:"2 quartos com suíte e varanda · tipo meio 61,17 m² e tipo ponta 63,22 m² · cobertura linear de 2 quartos com 122,32 m² · planta flexível",
    end:"Rua Rodolfo Noronha, 47 — Jardim Nossa Senhora Auxiliadora (2ª portaria: Rua Dr. Oswaldo Cruz, 799)",
    ficha:[["Unidades","108 em torre única (14 pavimentos de apartamentos)"],["Garagem","Edifício-garagem com 3 pavimentos"],["Terreno","3.139,41 m²"],["Construção","Alvenaria + drywall"],["Incorporadora","Sensia (grupo MRV)"]],
    lazer:["Piscina adulto e infantil com deck molhado","Quadra de beach tennis","Academia equipada","Spa e sauna","Salão de festas","Coworking e sala de reunião","Praça de convivência","Playground e espaço kids","Bicicletário coberto","Vaga para carro elétrico","Lazer entregue equipado e decorado"] },
  { n:"Yees Taquaral", c:"Yees", b:"Taquaral", t:"apto", m:[55], d:[2,2], v:"1", e:"2027-07", p:[[null,650]], vis:"stand" },

  // ── PARQUE PRADO ──────────────────────────────────────
  { n:"Casa Prado", c:"Riva", b:"Parque Prado", t:"apto", m:[69,96], d:[2,3], v:"1 e 2", e:"2028-08", p:[[69,750],[96,1000]], vis:"stand_dec" },
  { n:"Florae Jambeiro", c:"Vitta", b:"Parque Prado", t:"apto", m:[44], d:[2,2], v:"1", e:"2028-12", p:[[null,340]], vis:"virtual" },
  { n:"Portal dos Jatobás", suite:true, c:"MRV", b:"Parque Prado", t:"apto", m:[44], d:[2,2], v:"até 1", e:"2029-12", el:"2029", p:[[null,290],[null,360]], vis:"stand", obs:"Com ou sem suíte. Preço de R$ 290 mil a R$ 360 mil." },

  // ── CASAS ─────────────────────────────────────────────
  { n:"Oni Dijon Taquaral", c:"Peconi", b:"Taquaral", t:"casa", m:[128.94,166.89,171.75], d:[3,3], su:true, v:"2", e:"2026-12", p:[[null,1500]], vis:"dec",
    tip:"Casas de 3 pavimentos: térreo com sala de estar e jantar, lavabo e cozinha americana · 1º pavimento com 3 suítes (master com closet) · rooftop com churrasqueira, banheiro e área preparada para spa · 4 plantas: Íris e Tulipa (171,75 m²), Lavanda (166,89 m²) e Rosa (128,94 m²)",
    ficha:[["Casas","21 em condomínio fechado (OniDijon Résidence)"],["Garagem","2 vagas por casa, com tomada para carro elétrico"],["Automação","Infraestrutura House.Oni (fechadura digital, iluminação, persianas, ar-condicionado)"],["Segurança","Portaria e guarita blindadas, pulmão de segurança, portão automatizado, preparado para reconhecimento facial"],["Localização","2 min da Lagoa do Taquaral · 3 min do The Mall · 4 min do Shopping Dom Pedro"]],
    lazer:["Rooftop privativo com churrasqueira e área para spa/jacuzzi","Salão de festas","Academia","Playground","Pet place"] },
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
