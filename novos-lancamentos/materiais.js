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

};
