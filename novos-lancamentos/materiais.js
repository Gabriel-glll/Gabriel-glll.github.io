/*
  MATERIAIS POR EMPREENDIMENTO — Book, Vídeos, Tabela e Fluxo de pagamento.

  A chave é o "slug" do empreendimento (nome em minúsculas, sem acento, com hífen).
  Ele aparece na URL da página do projeto, ex.:  #/p/vista-horizonte  →  "vista-horizonte".

  Cada aba aceita UM link (texto) ou VÁRIOS (lista). Pode ser:
    • arquivo no próprio site:  "materiais/vista-horizonte/book.pdf"   (PDF, JPG, PNG, MP4)
    • link do Google Drive:     "https://drive.google.com/file/d/XXXX/view"
    • vídeo do YouTube/Vimeo:   "https://youtu.be/XXXX"
  Para dar um nome ao arquivo use { url: "...", titulo: "Tabela Outubro" }.

  Dica: vídeos pesados → YouTube (não listado) ou Drive. O GitHub não aceita arquivos > 100 MB.

  Exemplo:
  "vista-horizonte": {
    book:   "materiais/vista-horizonte/book.pdf",
    videos: ["https://youtu.be/abc123", { url: "https://drive.google.com/file/d/XYZ/view", titulo: "Tour decorado" }],
    tabela: { url: "materiais/vista-horizonte/tabela-out26.pdf", titulo: "Tabela Out/2026" },
    fluxo:  "materiais/vista-horizonte/fluxo.pdf",
  },
*/
window.MATERIAIS = {

};
