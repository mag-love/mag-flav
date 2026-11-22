/* MAG FLAV — todo o conteúdo mora aqui. Trocar texto, cargo ou item da esfera é só mexer neste arquivo.
   Textos do ABOUT são rascunho do Claude (18/11/2026), a revisar pelo Fernando. */
window.MF = {
  whatever: ['OR WHATEVER', 'OR FERN', 'OR FFF', 'OR MAG', 'OR HEY YOU'],
  titles: [
    ['SENIOR', 'EDITOR'], ['CREATIVE', 'DIRECTOR'], ['AI', 'DIRECTOR'],
    ['SOMETIMES', 'COMIC ARTIST'], ['FATHER', 'OF TWO'], ['STILL', 'CUTTING']
  ],
  about: {
    EN: [
      'A long time ago, in an edit bay far, far away…',
      'FERNANDO FREITAS',
      'Senior editor and creative director. From São Paulo, now cutting from València, Spain.',
      'I find the shape of films: documentaries, case films, commercials and music videos.',
      'THE AMAZON GREENVENTORY · Natura — Cannes Lions 2025, Grand Prix. Editor.',
      'AMARELO: É TUDO PRA ONTEM · Netflix — International Emmy nominee 2021. Editor.',
      'EMICIDA, ENTÃO TOMA — MTV VMB 2011, Video of the Year.',
      'O MENINO E O MUNDO — soundtrack video for the Oscar-nominated film.',
      'NEGREDO feat. MANO BROWN, LINHA DO TIRO — director and editor.',
      'Then AI showed up. I built my own post-production island around it: new camera angles from a take already shot, agents that read my timeline, a pipeline that runs mostly for free.',
      'I also write and draw. ASSOMBRAMENTO is my graphic novel, published under my own imprint, MAG ZINE.',
      'The tools changed. The cut is still mine.',
      'THE END (not really)'
    ],
    PT: [
      'Há muito tempo, numa ilha de edição muito, muito distante…',
      'FERNANDO FREITAS',
      'Editor sênior e diretor criativo. De São Paulo, hoje cortando de València, Espanha.',
      'Eu acho a forma dos filmes: documentários, case films, comerciais e clipes.',
      'THE AMAZON GREENVENTORY · Natura — Cannes Lions 2025, Grand Prix. Montador.',
      'AMARELO: É TUDO PRA ONTEM · Netflix — indicado ao Emmy Internacional 2021. Montador.',
      'EMICIDA, ENTÃO TOMA — MTV VMB 2011, Clipe do Ano.',
      'O MENINO E O MUNDO — vídeo da trilha do filme indicado ao Oscar.',
      'NEGREDO feat. MANO BROWN, LINHA DO TIRO — direção e montagem.',
      'Aí chegou a IA. Montei em volta dela a minha própria ilha de pós: novos ângulos de um take já filmado, agentes que leem a minha timeline, uma esteira que roda quase toda de graça.',
      'Também escrevo e desenho. ASSOMBRAMENTO é a minha graphic novel, pelo meu selo, MAG ZINE.',
      'As ferramentas mudaram. O corte continua meu.',
      'FIM (mentira)'
    ],
    ES: [
      'Hace mucho tiempo, en una sala de montaje muy, muy lejana…',
      'FERNANDO FREITAS',
      'Montador sénior y director creativo. De São Paulo, hoy montando desde València.',
      'Encuentro la forma de las películas: documentales, case films, publicidad y videoclips.',
      'THE AMAZON GREENVENTORY · Natura — Cannes Lions 2025, Grand Prix. Montador.',
      'AMARELO: É TUDO PRA ONTEM · Netflix — nominado al Emmy Internacional 2021. Montador.',
      'EMICIDA, ENTÃO TOMA — MTV VMB 2011, Vídeo del Año.',
      'O MENINO E O MUNDO — vídeo de la banda sonora de la película nominada al Óscar.',
      'NEGREDO feat. MANO BROWN, LINHA DO TIRO — dirección y montaje.',
      'Y llegó la IA. Construí a su alrededor mi propia isla de postproducción: nuevos ángulos de una toma ya rodada, agentes que leen mi timeline, un flujo que funciona casi gratis.',
      'También escribo y dibujo. ASSOMBRAMENTO es mi novela gráfica, en mi propio sello, MAG ZINE.',
      'Las herramientas cambiaron. El corte sigue siendo mío.',
      'FIN (mentira)'
    ]
  },
  /* Cada capa abre num aparelho antigo tocando a prévia (assets/prev). href = filme completo. */
  stuff: [
    { img: '01_greenventory.jpg', v: 'p01.mp4', href: 'https://vimeo.com/1115603278', t: 'NATURA — THE AMAZON GREENVENTORY · CANNES LIONS GP 2025' },
    { img: '02_amarelo_netflix.jpg', v: 'p02.mp4', href: 'https://vimeo.com/503183790', t: 'NETFLIX — AMARELO: É TUDO PRA ONTEM · EMMY NOMINEE' },
    { img: '03_case_films_africa.jpg', v: 'p03.mp4', href: 'https://vimeo.com/fernstorm', t: 'AFRICA CREATIVE — CASE FILMS' },
    { img: '04_um_take_novos_planos_ia.jpg', v: 'p04.mp4', href: 'https://vimeo.com/fernstorm', t: 'ONE TAKE, NEW CAMERAS — AI ON REAL FOOTAGE' },
    { img: '05_emicida_entao_toma.jpg', v: 'p05.mp4', href: 'https://www.youtube.com/watch?v=7QnXzVjck6M', t: 'EMICIDA — ENTÃO TOMA · VMB 2011' },
    { img: '06_negredo_linha_do_tiro.jpg', v: 'p06.mp4', href: 'https://www.youtube.com/watch?v=7Dc5cKI9Sqo', t: 'NEGREDO FEAT. MANO BROWN — LINHA DO TIRO' },
    { img: '07_menino_e_o_mundo.jpg', v: 'p07.mp4', href: 'https://vimeo.com/230524152', t: 'O MENINO E O MUNDO — SOUNDTRACK VIDEO' },
    { img: '08_seu_estilo_seu_impacto.jpg', v: 'p08.mp4', href: 'https://vimeo.com/1121859316', t: 'SEU ESTILO, SEU IMPACTO — DOCUMENTARY' },
    { img: '09_vivo_game_changers.jpg', v: 'p09.mp4', href: 'https://vimeo.com/228494574', t: 'VIVO — GAME CHANGERS' },
    { img: '10_commercial_selects.jpg', v: 'p10.mp4', href: 'https://vimeo.com/fernstorm', t: 'COMMERCIALS — SELECTED SPOTS' },
    { img: '11_music_video_selects.jpg', v: 'p11.mp4', href: 'https://vimeo.com/fernstorm', t: 'MUSIC VIDEOS — SELECTS' },
    { img: '12_assombramento_hq.jpg', v: null, href: 'https://www.behance.net/gallery/258404677/ASSOMBRAMENTO-Graphic-Novel', t: 'ASSOMBRAMENTO — GRAPHIC NOVEL · MAG ZINE' }
  ],

  /* Jogo FERN vs DEADLINE: cada fase vencida = um prêmio de verdade, nesta ordem. */
  awards: [
    { a: 'MTV VMB 2011', c: 'VIDEO OF THE YEAR', p: 'EMICIDA · ENTÃO TOMA' },
    { a: 'ACADEMY AWARDS 2016', c: 'FILM NOMINATED · ANIMATED FEATURE', p: 'O MENINO E O MUNDO' },
    { a: 'WAVE FESTIVAL', c: 'BRONZE · BRANDED CONTENT', p: 'VIVO GAME CHANGERS' },
    { a: 'INTERNATIONAL EMMY 2021', c: 'NOMINEE · ARTS PROGRAMMING', p: 'AMARELO · NETFLIX' },
    { a: 'KAIA IFF 2025', c: 'BEST DOCUMENTARY DIRECTION', p: 'SEU ESTILO, SEU IMPACTO' },
    { a: 'CANNES LIONS 2025', c: 'GRAND PRIX · SDG', p: 'THE AMAZON GREENVENTORY' }
  ]
};
