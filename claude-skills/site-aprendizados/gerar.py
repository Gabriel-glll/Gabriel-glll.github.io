"""Gera gabriel-glll.github.io/aprendizados/index.html a partir dos dados abaixo.
Para incluir um aprendizado novo: acrescente em APRENDIZADOS (e, se fizer sentido, em PROJETOS) e rode de novo.
"""
import html
import json
import os

RAIZ = r'C:\Users\ogabr\Documents\claude'
SAIDA = os.path.join(RAIZ, 'Gabriel-glll.github.io', 'aprendizados', 'index.html')

# custo: gratis | pago | misto
APRENDIZADOS = [
    dict(id='motion', n='Dicionário de efeitos motion', skill='motion-design', origem='omatheusdaia', link='https://www.instagram.com/p/DeevrBGnLAJ/', custo='gratis',
         oque='Vocabulário para pedir animação com precisão (slide in 0,4 s ease out, stagger 0,15 s, punch zoom) e um estúdio Remotion que transforma isso em MP4.',
         bom=['criativos', 'reels', 'imoveis'], midia=('video', 'ex/motion-alentejo.mp4', 'Anúncio animado do Alentejo, 8 s, feito 100% em código')),
    dict(id='texturas', n='Texturas na arte', skill='texturas', origem='tatidesigner.ia', link='https://www.instagram.com/p/Dd7b4_6GIWV/', custo='gratis',
         oque='Papel, grunge, filme, concreto, mármore, halftone, vidro canelado: o detalhe que tira a arte do "genérico". Script próprio + granulado animado nos vídeos.',
         bom=['criativos', 'marca', 'imoveis'], midia=('img2', ['ex/textura-combo.jpg', 'ex/textura-grade.jpg'], 'Fachada com papel + grunge + filme, e as 10 texturas lado a lado')),
    dict(id='fontes', n='Fontes cinematográficas', skill='fontes-cinematograficas', origem='raktimcreates', link='https://www.instagram.com/p/Dd_TY9AiS4_/', custo='gratis',
         oque='A fonte define o clima: dramática, suave, elegante, casual, refinada. Gerador de pôster/slide 4:5 com título script gigante + 3 adjetivos, só com fontes livres para uso comercial.',
         bom=['criativos', 'imoveis', 'marca'], midia=('img3', ['ex/poster-1-elegante.jpg', 'ex/poster-2-casual.jpg', 'ex/poster-3-refinada.jpg'], 'Carrossel de teste do Alentejo: elegante, casual e refinada')),
    dict(id='anuncio', n='Criativo com direção de arte', skill='fontes-cinematograficas + texturas', origem='aprovado nas sessões', link='', custo='gratis',
         oque='O padrão de anúncio Meta aprovado: script gigante sobre a foto, preço enorme, papel com textura, borda rasgada, paleta tirada da foto e selo de status (pronto/na planta).',
         bom=['criativos', 'imoveis'], midia=('img2', ['ex/anuncio-lazur-feed.jpg', 'ex/anuncio-cambui-feed.jpg'], 'Anúncios de feed: Lazur (na planta) e Cambuí (pronto)')),
    dict(id='beat', n='Edição sincronizada com a música', skill='edicao-beat-sync', origem='madforamv', link='https://www.instagram.com/reel/DdwJguCqn8b/', custo='gratis',
         oque='Detecta o BPM e os golpes de bumbo de qualquer música e corta as fotos exatamente na batida (erro médio de 14 ms vs. o editor original). Foto parada, corte seco, flash nos golpes fortes.',
         bom=['reels', 'imoveis', 'marca'], midia=('video', 'ex/beat-viagem-semsom.mp4', 'Volta ao Mundo (sem som aqui: a música do teste é de terceiros; no Instagram, use a biblioteca de músicas)')),
    dict(id='brag', n='Vídeo de lançamento de site (/brag)', skill='video-lancamento-site', origem='99hud', link='https://www.instagram.com/reel/Dd4rSxmjvRG/', custo='gratis',
         oque='Lê o site/projeto e monta um vídeo de 15–25 s com as cores, fontes e a função real do produto em uso, trilha própria e capa. Ótimo para entregar junto com um site-demo.',
         bom=['sites', 'reels', 'produto'], midia=('video', 'ex/brag-boleros.mp4', 'Lançamento do site Bolêros: pedido montado e finalizado no WhatsApp')),
    dict(id='landing', n='Interface animada (GSAP e cia.)', skill='ui-animada', origem='guilhermemorais.ia', link='https://www.instagram.com/p/DeMap_akQjL/', custo='gratis',
         oque='5 skills instaladas (GSAP oficial, Three.js, Design DNA, Genjutsu, LottieFiles). Landing com título letra a letra, galeria horizontal que trava no scroll, números que contam.',
         bom=['sites', 'imoveis', 'produto'], midia=('iframe', 'ex/landing/index.html?animar=1', 'Landing do Lazur: role dentro do quadro')),
    dict(id='produto3d', n='Produto 3D interativo', skill='produto-3d', origem='tetra.ia', link='https://www.instagram.com/reel/DduYLQWueDm/', custo='gratis',
         oque='Three.js em uma página: 360°, troca de cor em tempo real e vista explodida com etiquetas. Fica premium em PRODUTO; em prédio feito à mão fica com cara de jogo (não usar).',
         bom=['produto', 'sites'], midia=('iframe', 'ex/celular-3d.html', 'Phone 18 Pro (conceito, sem marca): arraste, troque a cor, clique em Vista explodida')),
    dict(id='hairline', n='Ilustração em linha animada (Hairline)', skill='hairline-create', origem='leobeckerdesign', link='https://www.instagram.com/reel/DemFzHpTbCH/', custo='gratis',
         oque='Desenho isométrico em traço fino que responde ao ponteiro, num HTML único. Sem cor e sem texto no desenho: uma ideia por figura. Ótimo como ícone vivo em site e apresentação.',
         bom=['sites', 'imoveis', 'produto'], midia=('iframe', 'ex/hairline-torre.html', 'Prédio na planta: passe o mouse nos andares (a torre se abre acima do escolhido)')),
    dict(id='ambiente', n='Ambiente se montando', skill='ambiente-montagem', origem='enrriquesdesign', link='https://www.instagram.com/reel/DdJr5tsuUmG/', custo='misto',
         oque='De 1 foto do imóvel: a IA gera a versão vazia (mesmo ângulo) e o vídeo mostra os móveis surgindo no lugar. Versão grátis em Remotion; versão com IA de vídeo (montagem real) é paga.',
         bom=['imoveis', 'reels'], midia=('video2', ['ex/sala-montagem.mp4', 'ex/sala-antes-vazia.jpg'], 'A sala original e a versão vazia gerada pela IA (mesmo ângulo); no vídeo, os móveis surgem um a um (versão grátis)')),
    dict(id='reveal', n='Reveal aéreo (avião → fachada)', skill='video-reveal-aereo', origem='architect.apollo', link='https://www.instagram.com/reel/Ddiy0T9ioeV/', custo='misto',
         oque='Plano-sequência de IA: janela do avião, nuvens, mergulho de drone sobre a cidade, rua e fachada do empreendimento. Prompt com 5 SHOTS cronometrados + foto da fachada como referência.',
         bom=['imoveis', 'reels'], midia=('img2', ['ex/flow-reveal-2.jpg', 'prev/reveal-storyboard.jpg'], 'O 1º quadro gerado grátis no Google Flow e o roteiro de planos. O vídeo sai no Flow (modo Frames, 10 créditos grátis por clipe) ou na Kie (pago).')),
    dict(id='kie', n='Kie API: IA paga mais barata', skill='kie-api', origem='euguilhermepasin', link='https://www.instagram.com/reel/DdpIqW1z_GO/', custo='pago',
         oque='Os mesmos modelos do Higgsfield (Seedance 2.0, GPT Image 2, Veo, Kling) por API, pagando só o que usar. O Claude vira o "artista gráfico": gera e baixa sozinho.',
         bom=['reels', 'produto', 'imoveis'], midia=('nota', 'Pronto para usar assim que a chave KIE_API_KEY for configurada.', 'python kie.py imagem "..." --proporcao 4:5')),
    dict(id='estudio', n='Estúdio de IA (Open-Higgsfield / Muapi)', skill='estudio-ia', origem='felipetambara.ia', link='https://www.instagram.com/reel/Db3GIBkRhks/', custo='pago',
         oque='Central que diz qual ferramenta usar em cada pedido + 62 skills de mídia da Muapi (cinema director, drone, UGC, folder, planta → 3D). Gerar custa créditos por uso.',
         bom=['reels', 'produto', 'criativos'], midia=('nota', 'É o "mapa" de todas as ferramentas: consulte antes de começar qualquer criativo.', '')),
    dict(id='referencias', n='Banco de referências de design', skill='referencias-design', origem='kacio.filipe', link='https://www.instagram.com/p/Dd7AobimijR/', custo='gratis',
         oque='Recent/Godly, Awwwards, Muzli, Fontshare, SaaS Frame, Inspotype, Jitter, Design Reviewed, Brik Space, e o fluxo referência → extrair estilo (design-dna) → fontes → animação.',
         bom=['sites', 'criativos', 'marca'], midia=('links', [('Recent (Godly)', 'https://recent.design'), ('Awwwards', 'https://www.awwwards.com'), ('Fontshare', 'https://www.fontshare.com'), ('Inspotype', 'https://inspotype.com'), ('Design Reviewed', 'https://www.designreviewed.com'), ('Jitter', 'https://jitter.video')], '')),
    dict(id='iagratis', n='IA grátis: Google Flow, Pomelli, Fish Audio', skill='ia-gratis', origem='katecore.ai', link='https://www.instagram.com/reel/DdhoP0ExLKw/', custo='gratis',
         oque='Troca das pagas pelas grátis: Google Flow (imagem Nano Banana sem custo + 50 créditos/dia de vídeo Veo, com quadro inicial e final), Pomelli (posts com a identidade da marca a partir do site) e Fish Audio (narração com API grátis). Já conectadas na sua conta Google.',
         bom=['imoveis', 'reels', 'criativos', 'produto'], midia=('img3', ['ex/flow-reveal-1.jpg', 'ex/flow-reveal-2.jpg', 'ex/pomelli-boleros.jpg'], 'Google Flow (grátis): o 1º quadro do reveal aéreo. Pomelli (grátis): post do Bolêros com as cores e o tom da marca, lidos do site')),
]

PROJETOS = [
    dict(id='imoveis', n='Imóveis', sub='Lançamentos e revenda na ZFF', top=[
        ('anuncio', 'Anúncio de feed/story com direção de arte', 'o que mais vende: script gigante + preço enorme + selo "na planta/pronto"'),
        ('beat', 'Reels com as fotos do empreendimento no ritmo', 'foto parada, corte na batida, música da biblioteca do Instagram'),
        ('ambiente', 'Sala vazia → mobiliada', 'revenda de imóvel vazio ou "home staging" virtual'),
        ('landing', 'Página do lançamento animada', 'galeria de lazer que trava no scroll, números da obra'),
        ('reveal', 'Reveal aéreo', 'o "uau" de lançamento grande: agora dá para fazer no Google Flow grátis (Frames)'),
        ('iagratis', 'Imagem e vídeo com IA grátis', 'Google Flow: imagens sem custo + 5 vídeos curtos por dia'),
        ('hairline', 'Ícone vivo "na planta"', 'em apresentação ou site, explica a obra sem palavras'),
    ], evite='zoom e legenda em cima das fotos; layout "corporativo" (painel escuro + tabela); maquete 3D feita à mão.'),
    dict(id='sites', n='Sites para comércio', sub='Negócio de sites (R$ 800 + R$ 99/mês)', top=[
        ('brag', 'Vídeo de lançamento do site', 'vai junto da proposta: o cliente posta e vê o valor na hora'),
        ('landing', 'Animações de scroll (GSAP)', 'título letra a letra, seções que entram em sequência, contadores'),
        ('referencias', 'Referência + fontes Fontshare', 'cada demo com direção de arte própria, não "template"'),
        ('iagratis', 'Posts da marca do cliente (Pomelli)', 'lê o site do comércio e gera campanhas no estilo dele, grátis'),
        ('hairline', 'Ilustrações em linha nas seções', '"como funciona" sem ícones genéricos'),
        ('produto3d', 'Produto em 3D', 'só para loja com produto físico de destaque'),
    ], evite='3D pesado em site simples; animação que ignora "reduzir movimento"; fontes só para uso pessoal.'),
    dict(id='criativos', n='Criativos e posts', sub='Anúncios Meta, carrosséis, stories', top=[
        ('fontes', 'Fonte certa para o clima', 'elegante para alto padrão, refinada para imobiliária, dramática para urbano'),
        ('texturas', 'Textura (papel, grunge, filme)', 'sutil: é tempero, nunca o prato'),
        ('anuncio', 'Padrão de anúncio aprovado', 'paleta tirada da foto, borda rasgada, polaroids nos stories'),
        ('motion', 'Versão animada do mesmo criativo', 'slide in 0,4 s + stagger + punch zoom no final'),
    ], evite='"cara de Claude": layout limpo e genérico, Montserrat + painel escuro.'),
    dict(id='reels', n='Reels e vídeos curtos', sub='Conteúdo para Instagram/TikTok', top=[
        ('beat', 'Cortes na batida', 'o formato que mais prende: 1 foto por golpe de bumbo'),
        ('motion', 'Motion design em código', 'textos e formas animadas, 8–15 s, grátis'),
        ('brag', 'Vídeo de produto/site', 'mostra a coisa funcionando, com trilha própria'),
        ('iagratis', 'Cenas geradas por IA (grátis)', 'Google Flow primeiro; Kie só se precisar de mais que 5 vídeos/dia'),
        ('kie', 'Cenas por IA em volume', 'quando o grátis do dia não bastar (pago, barato)'),
    ], evite='zoom/Ken Burns em foto e texto em cima da imagem; música de terceiros fora da biblioteca do app.'),
    dict(id='produto', n='Produto e e-commerce', sub='Lojas, lançamentos de produto', top=[
        ('produto3d', 'Configurador 3D', '360°, cores e vista explodida: parece site de marca grande'),
        ('landing', 'Storytelling no scroll', 'a página conta a história do produto conforme rola'),
        ('brag', 'Vídeo de lançamento', 'para anunciar o produto/loja'),
        ('estudio', 'Vídeo de produto com IA', 'UGC, produto "gigante", anúncio cinematográfico (pago)'),
    ], evite='logos e marcas reais em modelos 3D de demonstração.'),
    dict(id='marca', n='Marca de roupa (VM)', sub='Drops, lookbook, posts', top=[
        ('texturas', 'Grunge, halftone, filme', 'a linguagem visual de streetwear'),
        ('fontes', 'Fonte dramática (pincel)', 'para nome do drop e frases'),
        ('beat', 'Lookbook no ritmo', 'fotos das peças cortando na batida'),
        ('referencias', 'Referências de moda', 'Recent (Branding/Posters) + Design Reviewed'),
    ], evite='fontes "grátis para uso pessoal" em peça que vai ser vendida.'),
]

CUSTO = {'gratis': ('grátis', 'g'), 'pago': ('pago (IA por uso)', 'p'), 'misto': ('grátis + opção paga', 'mx')}
E = html.escape
porid = {a['id']: a for a in APRENDIZADOS}


def midia(a):
    tipo, v, leg = a['midia']
    if tipo == 'video':
        return f'<figure class="m"><video src="{v}" controls muted loop playsinline preload="metadata"></video><figcaption>{E(leg)}</figcaption></figure>'
    if tipo == 'video2':  # vídeo + imagem de apoio
        return f'<figure class="m"><video src="{v[0]}" controls muted loop playsinline preload="metadata"></video><img class="apoio" src="{v[1]}" alt="" loading="lazy"><figcaption>{E(leg)}</figcaption></figure>'
    if tipo in ('img2', 'img3'):
        imgs = ''.join(f'<img src="{s}" alt="" loading="lazy">' for s in v)
        return f'<figure class="m {tipo}"><div class="imgs">{imgs}</div><figcaption>{E(leg)}</figcaption></figure>'
    if tipo == 'iframe':
        return f'<figure class="m"><iframe src="{v}" loading="lazy" title="{E(a["n"])}"></iframe><figcaption>{E(leg)} · <a href="{v}" target="_blank" rel="noopener">abrir em tela cheia ↗</a></figcaption></figure>'
    if tipo == 'links':
        ls = ''.join(f'<a href="{u}" target="_blank" rel="noopener">{E(t)} ↗</a>' for t, u in v)
        return f'<div class="m nota"><div class="links">{ls}</div></div>'
    cmd = f'<code>{E(leg)}</code>' if leg else ''
    return f'<div class="m nota"><p>{E(v)}</p>{cmd}</div>'


def card(i, a):
    c, cls = CUSTO[a['custo']]
    tags = ''.join(f'<span class="tag">{E(next(p["n"] for p in PROJETOS if p["id"] == b))}</span>' for b in a['bom'])
    orig = f'<a href="{a["link"]}" target="_blank" rel="noopener">@{E(a["origem"])}</a>' if a['link'] else E(a['origem'])
    return f'''<article class="ap" id="{a["id"]}" data-bom="{' '.join(a['bom'])}">
  <div class="ap-txt"><span class="num">{i:02d}</span><h3>{E(a["n"])}</h3>
    <p class="meta"><span class="custo {cls}">{c}</span> skill <code>{E(a["skill"])}</code> · origem {orig}</p>
    <p>{E(a["oque"])}</p><div class="tags">{tags}</div></div>
  {midia(a)}
</article>'''


# prévia de cada efeito nos cards do guia: (arquivo, ajuste) — ajuste "cover" corta para encher, "contain" mostra inteiro
PREVIAS = {
    'motion': ('prev/motion.mp4', 'contain'), 'texturas': ('ex/textura-combo.jpg', 'cover'), 'fontes': ('ex/poster-1-elegante.jpg', 'cover'),
    'anuncio': ('ex/anuncio-lazur-feed.jpg', 'cover'), 'beat': ('prev/beat.mp4', 'contain'), 'brag': ('prev/brag.mp4', 'contain'),
    'landing': ('prev/landing.mp4', 'cover esq'), 'produto3d': ('prev/celular.mp4', 'cover'), 'hairline': ('prev/hairline.mp4', 'cover'),
    'reveal': ('ex/flow-reveal-2.jpg', 'cover'), 'iagratis': ('ex/flow-reveal-1.jpg', 'cover'), 'kie': ('prev/reveal-storyboard.jpg', 'contain'),
    'estudio': ('prev/estudio-mosaico.jpg', 'cover'), 'referencias': ('prev/referencias.jpg', 'cover'),
    'ambiente': ('prev/sala.mp4', 'cover esq'),  # foto liberada pelo Gabriel em 20/10/2026
}


def previa(k, titulo):
    pv = PREVIAS.get(k)
    if not pv:
        return '<div class="pv pv-vazio"><span>Prévia só no PC<br><small>(foi feita com a foto de um apartamento real)</small></span></div>'
    src, fit = pv
    if src.endswith('.mp4'):
        capa = src.replace('.mp4', '-capa.jpg')
        return f'<div class="pv {fit}"><video data-src="{src}" poster="{capa}" muted loop playsinline preload="none" aria-label="{E(titulo)}"></video></div>'
    return f'<div class="pv {fit}"><img src="{src}" alt="{E(titulo)}" loading="lazy"></div>'


def projeto(p):
    cards = ''.join(f'''<a class="ef" href="#{k}">{previa(k, t)}
      <div class="ef-txt"><span class="rank">{n + 1}</span><b>{E(t)}</b><span class="desc">{E(d)}</span>
      <em class="custo {CUSTO[porid[k]["custo"]][1]}">{CUSTO[porid[k]["custo"]][0]}</em></div></a>''' for n, (k, t, d) in enumerate(p['top']))
    return f'''<section class="proj" id="p-{p["id"]}"><header><h3>{E(p["n"])}</h3><p>{E(p["sub"])}</p></header>
  <div class="efs">{cards}</div><p class="evite"><b>Evite:</b> {E(p["evite"])}</p></section>'''


cred = []
cj = os.path.join(RAIZ, 'motion-studio', 'public', 'viagem', 'creditos.json')
if os.path.exists(cj):
    vistos = set()
    for c in json.load(open(cj, encoding='utf-8')):
        chave = c['pagina']
        if chave in vistos:
            continue
        vistos.add(chave)
        cred.append(f'<a href="{c["pagina"]}" target="_blank" rel="noopener">{E(c["rotulo"])}: {E((c["autor"] or "autor")[:40])} ({E(c["licenca"])})</a>')

chips = ''.join(f'<button data-f="{p["id"]}">{E(p["n"])}</button>' for p in PROJETOS)
pagina = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Laboratório de Criativos · Gabriel Gil</title>
<meta name="description" content="Tudo o que aprendi sobre criativos, motion e vídeo com IA, com exemplo de cada técnica e qual usar em cada tipo de projeto.">
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="estilo.css">
</head>
<body>
<svg class="grao" aria-hidden="true"><filter id="ruido"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#ruido)"/></svg>
<header class="topo">
  <small>Laboratório de criativos · Gabriel Gil</small>
  <h1>O que eu aprendi<br><span>e quando usar.</span></h1>
  <p>{len(APRENDIZADOS)} técnicas de criativos, motion e vídeo com IA, cada uma com um exemplo real, e o guia de qual efeito funciona melhor em cada tipo de projeto.</p>
  <nav><a href="#guia">Qual efeito usar</a><a href="#aprendizados">Os aprendizados</a><a href="#pedir">Como pedir</a></nav>
</header>

<section id="guia" class="bloco">
  <div class="titulo"><span>01</span><h2>Qual efeito usar em cada projeto</h2><p>Em ordem de prioridade, com a prévia de cada efeito. Clique no card para ver o exemplo completo.</p></div>
  <div class="projs">{''.join(projeto(p) for p in PROJETOS)}</div>
</section>

<section id="aprendizados" class="bloco">
  <div class="titulo"><span>02</span><h2>Os aprendizados</h2><p>Filtre pelo tipo de projeto.</p></div>
  <div class="filtro"><button data-f="todos" class="on">Todos</button>{chips}</div>
  <div class="aps">{''.join(card(i + 1, a) for i, a in enumerate(APRENDIZADOS))}</div>
</section>

<section id="pedir" class="bloco">
  <div class="titulo"><span>03</span><h2>Como pedir para o Claude</h2><p>Frases curtas que já disparam a técnica certa.</p></div>
  <ul class="pedidos">
    <li><b>"Faz um reel no ritmo dessa música com essas fotos"</b><span>edição sincronizada, foto parada, corte na batida</span></li>
    <li><b>"Anúncio do [empreendimento] para o Meta, feed e story"</b><span>padrão aprovado: script, textura, preço, selo</span></li>
    <li><b>"Vídeo de lançamento desse site"</b><span>/brag com o site do cliente</span></li>
    <li><b>"Deixa essa página animada no scroll"</b><span>GSAP: letras, galeria que trava, números</span></li>
    <li><b>"Essa sala vazia virando mobiliada"</b><span>ambiente se montando (grátis) ou IA de vídeo (pago)</span></li>
    <li><b>"Produto em 3D girando com troca de cor"</b><span>configurador Three.js</span></li>
    <li><b>"Me traz 3 referências de site de [segmento]"</b><span>banco de referências + extração de estilo</span></li>
  </ul>
</section>

<footer>
  <p>Skills sincronizadas em <a href="https://raw.githubusercontent.com/Gabriel-glll/Gabriel-glll.github.io/main/claude-skills/LEIA.md">claude-skills/LEIA.md</a>. Imagens de empreendimentos são perspectivas ilustrativas das incorporadoras.</p>
  <details><summary>Créditos das fotos de viagem (Wikimedia Commons)</summary><p class="cred">{" · ".join(cred)}</p></details>
</footer>
<script src="app.js"></script>
</body>
</html>
'''
os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
with open(SAIDA, 'w', encoding='utf-8', newline='\n') as f:
    f.write(pagina)
print('ok', SAIDA, len(pagina), 'bytes')
