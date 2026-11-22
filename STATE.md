# MAG FLAV — estado (19/11/2026, 2ª rodada)

Site pessoal do Fernando com a arquitetura do stillmakingstuff.com (Mauricio Daniachi): uma tela, rosto no centro, cinco portas-frase. Código, textos e imagens são próprios; nada do site dele foi copiado.

O site v3 (`~/Documents/Claude/fern-portfolio/v3`) **não foi tocado**.

## Abrir

Pelo painel do Claude: configuração `mag-flav` em `~/Portifolio/.claude/launch.json` (porta 4180). Ou:

```bash
python3 -m http.server 4180 --directory ~/Sites/mag-flav
```

## O que tem

| Porta | Rota | O que faz |
|---|---|---|
| Home | `/` | Cabeça 3D do Fern virando pra onde o mouse (ou o dedo) vai; parado, olha em volta sozinho; clique dá um glitch e troca o visual (foto · portátil verde em pixel · TV de tubo · duotone MAG · xerox de fanzine), e a cada ~7 s ele troca sozinho, sempre passando pelo glitch. As trocas são shader, então valem igual quando entrar um modelo 3D completo. É a foto real recortada (Vision do macOS) com relevo do Depth Anything V2 rodado no Mac (ambiente do ComfyUI), em three.js 0.160 local (`js/vendor`). Custo zero, rosto não redesenhado. "Or whatever" troca sozinho |
| More about me | `#about` | Contagem de película 3-2-1 e créditos subindo em perspectiva. Botões de velocidade (1x/2x/4x) e idioma (EN/PT/ES) |
| Check my fancy title | (home) | Cargo troca a cada clique |
| Here's my random stuff | `#stuff` | Esfera com as 12 capas e 4 aparelhos (portátil, ovo, celular, TV). Arrastar gira; clicar abre |
| (capa) | `#watch-N` | O trabalho toca num aparelho antigo, alternando TV de tubo + videocassete, portátil verde e celular. Clicar na tela liga o som; link pro filme completo |
| (portátil) | `#play` | FERN vs DEADLINE: plataforma original. Bloco J solta um job (o Fern cresce), estrelas, relógios de prazo pra pisar, pilhas de HD, buracos. Cada fase termina num troféu = um prêmio real (VMB → Oscar → Wave → Emmy → KAIA → Cannes GP) |
| Poke me | `#poke` | FERN.PET em 3D (22/11, `js/pet3d.js`): ovo de bolso vintage (plástico perolado, corrente, botões 3D que funcionam) e, na tela, o quarto do editor estilo casinha: o Fern deita na cama (SONO), senta no computador (TRAMPO), pega breja na geladeira e bebe no pufe (BREJA), recebe o job na porta e come (JOB), e anda sozinho pelo quarto. Clicar na tela entra no quarto (zoom). Se não houver WebGL, volta o ovo 2D. Bichinho: vive de JOB, pouco SONO, BREJA e TRAMPO. Necessidades caem com o tempo e ficam salvas no navegador. 3 brejas em 30 s = fica alegrinho. TRAMPO abre a timeline de cortar o take ruim, que alimenta o bicho |
| Say hi | `#contact` | Claquete com o rosto em pixel verde (feito da foto real) e os contatos públicos do v3, sem telefone |

Conteúdo todo em `js/data.js`. Fotos: `assets/head.png` + `assets/head_depth.png` (cabeça 3D, da avatar_800 do kit), `assets/rosto.jpg` (kit, avatar_800) e `assets/rosto_glitch.mp4` (do fern-portfolio). Capas: `assets/stuff/` (kit v11, reduzidas a 520 px).

## Escaneamento da cabeça (19/11, em andamento)

- Guia de fotos: `_scan/COMO_FOTOGRAFAR.md`. Fotos (ou vídeo) vão em `_scan/fotos/`.
- Montagem local: `_scan/montar <fotos> <saida> [preview|reduced|medium|full]` (Swift + Object Capture, já compilado, sem custo). Gera `obj/` (obj+mtl+textura) e `cabeca.usdz`.
- O site já está pronto: se existir `assets/head3d/cabeca.obj` (+ `cabeca.mtl`, textura e `pose.json` pra acertar o giro), a home usa o modelo completo (gira até ~57°); se não, usa o relevo. Testado com um modelo de teste, já removido.
- `_scan/` não vai pro ar (tirar na hora de publicar).

## Pendências (do Fernando)

- Textos do ABOUT são rascunho do Claude: revisar.
- Prévias de vídeo copiadas do v3 (`assets/prev/p01–p11.mp4`); ASSOMBRAMENTO mostra a capa.
- Jogo: `FernGame._test(n)` é um gancho de teste (avança n quadros). Testado: começar, bloco J → crescer, estrelas, morte, game over. A tela de prêmio não foi alcançada no teste automático (o robô de teste caía num buraco); conferir jogando.
- Celular: layout do jogo e do bichinho não conferido em tela de telefone.
- Portátil (19/11): plástico com textura, faixas no bisel, marca MAG POCKET colorida em Archivo (Google Fonts). Nome próprio, não o logo registrado.
- Cabeça 3D é relevo de uma foto: girando muito, a nuca não existe (as laterais esticam). Caminho recomendado (19/11) pro 3D completo: escanear a cabeça real com o iPhone (fotos em volta) e montar no Mac com Object Capture da Apple (M4 Max + Xcode já instalados), sem custo, sem subir foto e sem rosto inventado. Alternativa: IA imagem→3D (Hunyuan3D/TRELLIS, ~US$0,15–0,80 por geração), que inventa a nuca e pode mudar o rosto, e por isso só com OK.
- Git local em `~/Sites/mag-flav` (branch main, `_scan/` fora). Link privado no Claude (22/11): https://claude.ai/artifact/FrVZpxKK1kmXUnnSAoXwwP; pra outra pessoa abrir, compartilhar pelo menu Share. Não está no GitHub. Custo zero.
