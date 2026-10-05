/*
  MATERIAIS POR EMPREENDIMENTO — Book, Vídeos, Tabela e Fluxo de pagamento.

  A chave é o "slug" do empreendimento (nome em minúsculas, sem acento, com hífen).
  Ele aparece na URL da página do projeto, ex.:  #/p/vista-horizonte  →  "vista-horizonte".

  Cada aba aceita UM link (texto) ou VÁRIOS (lista). Pode ser:
    • arquivo no próprio site:  "materiais/vista-horizonte/book.pdf"   (PDF, JPG, PNG, MP4)
    • link do Google Drive:     "https://drive.google.com/file/d/XXXX/view"
    • vídeo do YouTube/Vimeo:   "https://youtu.be/XXXX"
  Para dar um nome ao arquivo use { url: "...", titulo: "Tabela Outubro" }.

  FOTOS (capa do card + galeria com setas na página do projeto) — extraídas do book:
    fotos: 12   → usa materiais/<slug>/fotos/01.jpg … 12.jpg  (a 01 é a capa do card)
    ou uma lista: fotos: ["materiais/<slug>/fotos/fachada.jpg", ...]

  Dica: vídeos pesados → YouTube (não listado) ou Drive. O GitHub não aceita arquivos > 100 MB.

  Exemplo:
  "vista-horizonte": {
    fotos:  12,
    book:   "materiais/vista-horizonte/book.pdf",
    videos: ["https://youtu.be/abc123", { url: "https://drive.google.com/file/d/XYZ/view", titulo: "Tour decorado" }],
    tabela: { url: "materiais/vista-horizonte/tabela-out26.pdf", titulo: "Tabela Out/2026" },
    fluxo:  "materiais/vista-horizonte/fluxo.pdf",
  },
*/
window.MATERIAIS = {
  "luce-cambui": {
    "fotos": 16,
    "book": {
      "url": "materiais/luce-cambui/book.pdf",
      "titulo": "Book Luce Cambuí"
    }
  },
  "alto-das-mansoes": {
    "tabela": [
      {
        "url": "materiais/alto-das-mansoes/tabela/tabela-alto-das-mansoes-2026-09-studios-50-50.pdf",
        "titulo": "Tabela Set/2026 — Studios 50-50"
      }
    ],
    "fotos": 20,
    "book": {
      "url": "materiais/alto-das-mansoes/book.pdf",
      "titulo": "Book do corretor Alto das Mansões"
    }
  },
  "arborais-alta-vista": {
    "tabela": [
      {
        "url": "materiais/arborais-alta-vista/tabela/tabela-arborais-alta-vista-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "best-view": {
    "tabela": [
      {
        "url": "materiais/best-view/tabela/tabela-best-view-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "florae-jambeiro": {
    "tabela": [
      {
        "url": "materiais/florae-jambeiro/tabela/tabela-florae-jambeiro-2026-10-associativo-e-sfh.pdf",
        "titulo": "Tabela Out/2026 — Associativo e SFH"
      }
    ]
  },
  "freedom": {
    "tabela": [
      {
        "url": "materiais/freedom/tabela/tabela-freedom-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "grand-paysage": {
    "tabela": [
      {
        "url": "materiais/grand-paysage/tabela/tabela-grand-paysage-2026-10-direta.pdf",
        "titulo": "Tabela Out/2026 — Direta"
      },
      {
        "url": "materiais/grand-paysage/tabela/tabela-grand-paysage-2026-10-financiamento-bancario.pdf",
        "titulo": "Tabela Out/2026 — Financiamento bancário"
      }
    ]
  },
  "high-life": {
    "tabela": [
      {
        "url": "materiais/high-life/tabela/tabela-high-life-2026-10-flex.pdf",
        "titulo": "Tabela Out/2026 — Flex"
      }
    ]
  },
  "intento": {
    "tabela": [
      {
        "url": "materiais/intento/tabela/tabela-intento-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "lake-louise-taquaral": {
    "tabela": [
      {
        "url": "materiais/lake-louise-taquaral/tabela/tabela-lake-louise-taquaral-2026-09-a.pdf",
        "titulo": "Tabela Set/2026 — A"
      },
      {
        "url": "materiais/lake-louise-taquaral/tabela/tabela-lake-louise-taquaral-2026-09-b.pdf",
        "titulo": "Tabela Set/2026 — B"
      }
    ],
    "fotos": 17,
    "book": {
      "url": "materiais/lake-louise-taquaral/book.pdf",
      "titulo": "Book Lake Louise"
    }
  },
  "lazur": {
    "tabela": [
      {
        "url": "materiais/lazur/tabela/tabela-lazur-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ]
  },
  "liv-guanabara": {
    "tabela": [
      {
        "url": "materiais/liv-guanabara/tabela/tabela-liv-guanabara-2026-10-fluxo-ato-33.pdf",
        "titulo": "Tabela Out/2026 — Fluxo ato + 33"
      },
      {
        "url": "materiais/liv-guanabara/tabela/tabela-liv-guanabara-2026-10-valores-com-desconto.pdf",
        "titulo": "Tabela Out/2026 — Valores com desconto"
      }
    ],
    "fotos": 9,
    "book": {
      "url": "materiais/liv-guanabara/book.pdf",
      "titulo": "Book Liv Guanabara"
    }
  },
  "liv-mansoes": {
    "tabela": [
      {
        "url": "materiais/liv-mansoes/tabela/tabela-liv-mansoes-2026-10-fluxo-ato-14.pdf",
        "titulo": "Tabela Out/2026 — Fluxo ato + 14"
      },
      {
        "url": "materiais/liv-mansoes/tabela/tabela-liv-mansoes-2026-10-valores-com-desconto.pdf",
        "titulo": "Tabela Out/2026 — Valores com desconto"
      }
    ]
  },
  "mood-cambui": {
    "tabela": [
      {
        "url": "materiais/mood-cambui/tabela/tabela-mood-cambui-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "moreira-1730": {
    "tabela": [
      {
        "url": "materiais/moreira-1730/tabela/tabela-moreira-1730-2026-08.pdf",
        "titulo": "Tabela Ago/2026"
      }
    ]
  },
  "reserva-perfetto": {
    "tabela": [
      {
        "url": "materiais/reserva-perfetto/tabela/tabela-reserva-perfetto-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "sensia-galleria": {
    "tabela": [
      {
        "url": "materiais/sensia-galleria/tabela/tabela-sensia-galleria-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ]
  },
  "sensia-taquaral": {
    "tabela": [
      {
        "url": "materiais/sensia-taquaral/tabela/tabela-sensia-taquaral-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ],
    "fotos": 20,
    "book": {
      "url": "materiais/sensia-taquaral/book.pdf",
      "titulo": "Book Sensia Taquaral"
    }
  },
  "spot": {
    "tabela": [
      {
        "url": "materiais/spot/tabela/tabela-spot-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "swiss-garden": {
    "tabela": [
      {
        "url": "materiais/swiss-garden/tabela/tabela-swiss-garden-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ]
  },
  "terrace-home-resort": {
    "tabela": [
      {
        "url": "materiais/terrace-home-resort/tabela/tabela-terrace-home-resort-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "upside": {
    "tabela": [
      {
        "url": "materiais/upside/tabela/tabela-upside-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "vila-vitta-taquaral": {
    "tabela": [
      {
        "url": "materiais/vila-vitta-taquaral/tabela/tabela-vila-vitta-taquaral-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "vista-horizonte": {
    "tabela": [
      {
        "url": "materiais/vista-horizonte/tabela/tabela-vista-horizonte-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ],
    "fotos": 19,
    "book": {
      "url": "materiais/vista-horizonte/book.pdf",
      "titulo": "Book Vista Horizonte"
    }
  },
  "vivio": {
    "tabela": [
      {
        "url": "materiais/vivio/tabela/tabela-vivio-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "wide": {
    "tabela": [
      {
        "url": "materiais/wide/tabela/tabela-wide-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "alto-do-galleria-ii": {
    "tabela": [
      {
        "url": "materiais/alto-do-galleria-ii/tabela/tabela-alto-do-galleria-ii-2026-09-direta.pdf",
        "titulo": "Tabela Set/2026 — Direta"
      },
      {
        "url": "materiais/alto-do-galleria-ii/tabela/tabela-alto-do-galleria-ii-2026-09-sem-entrada.pdf",
        "titulo": "Tabela Set/2026 — Sem entrada"
      },
      {
        "url": "materiais/alto-do-galleria-ii/tabela/tabela-alto-do-galleria-ii-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ],
    "fotos": 14,
    "book": {
      "url": "materiais/alto-do-galleria-ii/book.pdf",
      "titulo": "Book do corretor Alto do Galleria II"
    }
  },
  "cores-da-mata": {
    "fotos": 12,
    "book": {
      "url": "materiais/cores-da-mata/book.pdf",
      "titulo": "Book Cores da Mata Mangará"
    }
  },
  "alta-vista": {
    "fotos": 14,
    "book": {
      "url": "materiais/alta-vista/book.pdf",
      "titulo": "Book Alta Vista Mangará"
    }
  },
  "oni-dijon-taquaral": {
    "fotos": 16,
    "book": {
      "url": "materiais/oni-dijon-taquaral/book.pdf",
      "titulo": "Book Oni Dijon"
    }
  },
  "maxi-bonfim": {
    "fotos": 8,
    "book": {
      "url": "materiais/maxi-bonfim/book.pdf",
      "titulo": "Book HM Maxi Campinas"
    }
  },
  "yard": {
    "fotos": 19,
    "book": {
      "url": "materiais/yard/book.pdf",
      "titulo": "Book Yard Cambuí"
    }
  },
  "san-pietro": {
    "fotos": 11,
    "book": {
      "url": "materiais/san-pietro/book.pdf",
      "titulo": "Book San Pietro"
    }
  }
};
