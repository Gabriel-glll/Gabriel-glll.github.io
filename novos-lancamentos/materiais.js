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
      "url": "https://zff-books.zffrealty.workers.dev/luce-cambui.pdf?v=1790975365",
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
      "url": "https://zff-books.zffrealty.workers.dev/alto-das-mansoes.pdf?v=1791210971",
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
    ],
    "fotos": 18,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/grand-paysage.pdf?v=1791290525",
      "titulo": "Book Grand Paysage"
    }
  },
  "high-life": {
    "tabela": [
      {
        "url": "materiais/high-life/tabela/tabela-high-life-2026-10-flex.pdf",
        "titulo": "Tabela Out/2026 — Flex"
      }
    ],
    "fotos": 24,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/high-life.pdf?v=1791290199",
      "titulo": "Manual do corretor High Life"
    }
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
      "url": "https://zff-books.zffrealty.workers.dev/lake-louise-taquaral.pdf?v=1791290575",
      "titulo": "Book Lake Louise"
    }
  },
  "lazur": {
    "tabela": [
      {
        "url": "materiais/lazur/tabela/tabela-lazur-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ],
    "fotos": 22,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/lazur.pdf?v=1791290321",
      "titulo": "Book Lazur"
    }
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
      "url": "https://zff-books.zffrealty.workers.dev/liv-guanabara.pdf?v=1791211697",
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
    ],
    "fotos": 19,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/reserva-perfetto.pdf?v=1791290272",
      "titulo": "Apresentação Reserva Perfetto"
    }
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
      "url": "https://zff-books.zffrealty.workers.dev/sensia-taquaral.pdf?v=1791211801",
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
  "vista-horizonte": {
    "tabela": [
      {
        "url": "materiais/vista-horizonte/tabela/tabela-vista-horizonte-2026-09.pdf",
        "titulo": "Tabela Set/2026"
      }
    ],
    "fotos": 19,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/vista-horizonte.pdf?v=1791210851",
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
      "url": "https://zff-books.zffrealty.workers.dev/alto-do-galleria-ii.pdf?v=1791290479",
      "titulo": "Book do corretor Alto do Galleria II"
    }
  },
  "cores-da-mata": {
    "fotos": 12,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/cores-da-mata.pdf?v=1791211621",
      "titulo": "Book Cores da Mata Mangará"
    }
  },
  "alta-vista": {
    "fotos": 14,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/alta-vista.pdf?v=1791290458",
      "titulo": "Book Alta Vista Mangará"
    }
  },
  "oni-dijon-taquaral": {
    "fotos": 16,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/oni-dijon-taquaral.pdf?v=1791211729",
      "titulo": "Book Oni Dijon"
    }
  },
  "maxi-bonfim": {
    "fotos": 8,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/maxi-bonfim.pdf?v=1791211830",
      "titulo": "Book HM Maxi Campinas"
    }
  },
  "yard": {
    "fotos": 19,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/yard.pdf?v=1791211886",
      "titulo": "Book Yard Cambuí"
    }
  },
  "san-pietro": {
    "fotos": 11,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/san-pietro.pdf?v=1791290633",
      "titulo": "Book San Pietro"
    }
  },
  "casa-da-mata-gramado": {
    "fotos": 21,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/casa-da-mata-gramado.pdf?v=1791289738",
      "titulo": "Book Casa da Mata"
    }
  },
  "avenida-105": {
    "fotos": 26,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/avenida-105.pdf?v=1791290484",
      "titulo": "Book Avenida 105"
    }
  },
  "verter": {
    "fotos": 19,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/verter.pdf?v=1791290663",
      "titulo": "Book Vërtër Cambuí"
    }
  },
  "casa-bella": {
    "fotos": 20,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/casa-bella.pdf?v=1791289820",
      "titulo": "Book Casa Bella"
    }
  },
  "vestra": {
    "fotos": 11,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/vestra.pdf?v=1791289898",
      "titulo": "Treinamento de produto Vestra"
    }
  },
  "edge-cambui": {
    "fotos": 11,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/edge-cambui.pdf?v=1791289923",
      "titulo": "Book Edge Cambuí"
    }
  },
  "maziero-betel": {
    "fotos": 18,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/maziero-betel.pdf?v=1791290437",
      "titulo": "Book Residencial Maziero"
    }
  },
  "belgravia": {
    "fotos": 18,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/belgravia.pdf?v=1791290497",
      "titulo": "Book Belgravia"
    }
  },
  "house-me-taquaral": {
    "fotos": 16,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/house-me-taquaral.pdf?v=1791290030",
      "titulo": "Book House Me Taquaral"
    }
  },
  "villa-vita-taquaral": {
    "tabela": [
      {
        "url": "materiais/villa-vita-taquaral/tabela/tabela-villa-vita-taquaral-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ],
    "fotos": 10,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/villa-vita-taquaral.pdf?v=1791290673",
      "titulo": "Apresentação Villa Vita"
    }
  },
  "tresor": {
    "fotos": 16,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/tresor.pdf?v=1791290659",
      "titulo": "Book Trésor"
    }
  },
  "wyn-residence": {
    "fotos": 23,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/wyn-residence.pdf?v=1791290106",
      "titulo": "Apresentação WYN Residence"
    }
  },
  "tay": {
    "fotos": 12,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/tay.pdf?v=1791290131",
      "titulo": "Book Tay"
    }
  },
  "yees-taquaral": {
    "fotos": 15,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/yees-taquaral.pdf?v=1791290224",
      "titulo": "Apresentação Taquaral Residence"
    },
    "tabela": [
      {
        "url": "materiais/yees-taquaral/tabela/tabela-yees-taquaral-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "frame": {
    "fotos": 6,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/frame.pdf?v=1791290251",
      "titulo": "Apresentação Frame"
    }
  },
  "yees-mansoes": {
    "fotos": 13,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/yees-mansoes.pdf?v=1791290698",
      "titulo": "Book Mansões Residencial"
    },
    "tabela": [
      {
        "url": "materiais/yees-mansoes/tabela/tabela-yees-mansoes-2026-10.pdf",
        "titulo": "Tabela Out/2026"
      }
    ]
  },
  "city-galleria": {
    "fotos": 10,
    "book": {
      "url": "https://zff-books.zffrealty.workers.dev/city-galleria.pdf?v=1791290347",
      "titulo": "Book City Galleria"
    }
  }
};
