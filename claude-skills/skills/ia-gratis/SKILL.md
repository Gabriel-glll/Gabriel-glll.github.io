---
name: ia-gratis
description: IAs com uso GRATUITO que substituem as pagas — Google Flow (imagem + vídeo Veo, 50 créditos/dia), Pomelli (conteúdo com a identidade da marca), Fish Audio (narração, API grátis) e Artflow — e como o Claude usa cada uma (navegador do app logado ou API). Use quando o usuário quiser gerar imagem, vídeo, voz/narração ou posts de marca SEM pagar, ou quando faltar crédito/chave nas rotas pagas (Kie, Weave, Muapi).
---

# IAs grátis (pago → grátis)

Origem: reel @katecore.ai. Pares mostrados: **Nano Banana → Google Flow**, **Kling → Artflow**, **Canva → Pomelli**, **ElevenLabs → Fish Audio**. Verificado em 20/10/2026:

| Ferramenta | Grátis de verdade? | Como o Claude usa | Melhor uso |
|---|---|---|---|
| **Google Flow** (flow.google.com) | Sim: **50 créditos/dia** sem assinatura (~5 vídeos Veo 3.1 Lite de 10 cr ou 2 Fast de 20; Quality custa 100). Imagens Nano Banana grátis ou quase (o "ilimitado" não foi confirmado). Sem 1080p no grátis, e o vídeo pode falhar no horário de pico. Disponível no Brasil, em PT. | **Navegador do app** com a conta Google logada (o usuário faz o login uma vez; o Claude nunca digita senha). O Claude cria o projeto, sobe a foto, cola o prompt, gera e baixa. | **Rota grátis** para `video-reveal-aereo`, `ambiente-montagem` (primeiro + último quadro) e qualquer imagem/edição com IA |
| **Pomelli** (labs.google.com/pomelli) | Sim, na fase experimental (algumas centenas de gerações). Interface em inglês; Brasil incluso na expansão para 170 países (confirmar no login). | Navegador logado: cria a "Business DNA" a partir do site do cliente e gera campanhas/posts no estilo da marca. | Posts e campanhas rápidas para os comércios dos sites-demo (Bolêros, Styllu's...) |
| **Fish Audio** (fish.audio) | **API grátis** com o modelo `s2.1-pro-free` (uso justo, prometida até 30/11/2026, sem SLA). Plano web grátis ≈ 8.000 créditos/mês. Uso comercial no grátis é ambíguo: confirmar nos termos. | **API**: `python motion-studio/audio/fish.py vozes "portuguese"` e `fish.py falar "texto" saida.mp3 --voz <id>`. Chave em `FISH_API_KEY` (o usuário cria). | Narração PT-BR para Reels, vídeo de lançamento (`/brag --voice`), anúncios |
| **Artflow** (artflow.ai) | ~100 créditos/mês, com **marca d'água** e **não comercial**. | Navegador logado. | Só teste/rascunho de personagem/storyboard (não usar em cliente) |

## Regras
- O Claude nunca cria conta nem digita senha: o usuário faz login no navegador do app uma vez e o Claude opera a partir daí.
- Antes de gerar em lote, diga quantos créditos do dia vão ser usados (Flow: 50/dia).
- Ordem de preferência para IA: **Flow (grátis)** → Weave imagem (créditos já existentes) → Kie (pago barato) → Muapi.
- Marca d'água ou licença não comercial → não entregar para cliente.

## Como operar o Flow (testado em 20/10/2026)
1. `flow.google.com` → "New project" (feche o aviso "What's new" com "Get started").
2. Botão de configurações ao lado do prompt: **Image** (Nano Banana 2.1, **0 créditos**) ou **Video** (Veo 3.1 Lite, 720p, 8 s, **10 créditos por vídeo**; x2 = 20). Modos de vídeo: **Frames** (quadro inicial/final, para reveal aéreo e sala se montando) e **Ingredients** (referências). Formatos 16:9 / 9:16.
3. Clique na caixa "What do you want to create?", digite o prompt e clique em "Start generation". Feche o menu antes de digitar (Escape), senão o texto não entra. Confira o texto por JS, porque a captura de tela do painel atrasa.
4. Os resultados aparecem como `<img src="https://flow-content.google/image/...?...Signature=...">` (768×1376 em 9:16). Pegue os src por JS e baixe com Invoke-WebRequest: são URLs assinadas e públicas por algumas horas.
5. Vídeo gasta os 50 créditos grátis do dia: diga quantos antes de gerar.
- Exemplo: `criativos/flow-teste/reveal-1.jpg` (janela do avião + torre nas nuvens: o 1º quadro do reveal aéreo, grátis).

## Pomelli (testado)
- Disponível no Brasil (tela em PT). Exige aceitar os termos (os dados podem treinar a IA do Google): o usuário autorizou em 20/10/2026. E-mails e pesquisas foram desmarcados.
- Fluxo: Let's go → "Enter your website" → Continue → "Generating your Business Profile" (leva alguns minutos) → "Your Business Profile is ready" → Campaigns → escolher uma sugestão (vêm em PT, no tom da marca) → gera 4 criativos 1080×1920 (~2 min).
- Resultado com o Bolêros: perfil perfeito (cores #4a2711/#faf6f0/#25d366, Nunito, slogan, valores, tom). **Problema:** em 3 dos 4 criativos ele usou fotos que NÃO eram do Bolêros (pessoa com notebook, piscina, sala), puxadas de outras páginas do domínio gabriel-glll.github.io. **Sempre revisar e trocar as imagens do perfil (Images) antes de gerar**, e nunca publicar criativo com foto que não é do cliente.
- Baixar: as imagens são `labs.google.com/pomelli_downloads/...` (precisam da sessão). Use o botão de compartilhar/baixar do próprio Pomelli (pedir OK antes de baixar) ou converta numa camada da página e capture a tela. O `fetch` para localhost é bloqueado pela página.
- Exemplo bom: `criativos/pomelli-boleros/pomelli-1.jpg` ("O Sabor de Estar em Família").

## Status da conexão (atualize)
- Flow: ✅ conectado (conta ogabrielgil1, navegador do app). Imagem grátis testada.
- Pomelli: ✅ conectado; Business Profile do Bolêros em geração (20/10/2026).
- Fish Audio: script pronto (`fish.py`); aguardando `FISH_API_KEY`.
- Artflow: não conectado (baixo valor).
