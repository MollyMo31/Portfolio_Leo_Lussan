/* == SYSTEME I18N - FR / EN == */
var _LANGS = {
  fr: {
    nav_about:'Profil', nav_skills:'Comp\u00E9tences', nav_projects:'Projets',
    nav_cv:'CV', nav_contact:'Contact', nav_cta:'Me contacter',
    hero_tag:'// Level Designer \u00B7 Game Designer \u00B7 Brassart Toulouse',
    hero_role:'Level Design \u00B7 Game Design \u00B7 Unity \u00B7 Unreal Engine',
    hero_desc:'Passionn\u00E9 par le level design depuis 2016, je con\u00E7ois des niveaux comme on dessine des plans \u2014 avec rigueur, intention narrative et ambition cr\u00E9ative constante.',
    stat_brassart:'Ans \u00E0 Brassart', stat_projects:'Projets r\u00E9alis\u00E9s', stat_start:"D\u00E9but de l'aventure",
    label_gallery:'Galerie du projet', label_about:'// 001 \u2014 Profil', label_skills:'// 002 \u2014 Outils & Moteurs',
    label_projects:'// 003 \u2014 Portfolio', label_cv:'// 005 \u2014 Curriculum Vitae',
    label_contact:'// 006 \u2014 Contact', label_personal:'// 004 \u2014 Projets personnels',
    title_about:'\u00C0 PROPOS', title_skills:'COMP\u00C9TENCES', title_projects:'PROJETS',
    title_cv:'MON CV', title_contact:'CONTACT',
    cat_personal:'Projets personnels',
    proj_unjudged:'UNJUDGED', proj_priest:'DEVOURING PRIEST', proj_city:'CITY RIDER',
    proj_tower:'TOWER DEFENSE', proj_silence:'THE SILENCE', proj_draconium:'DRACONIUM',
    proj_mira:'PROJET MIRA', proj_coaching:'COACHING E-SPORT',
    proj_streaming:'STREAMING TWITCH', proj_musiques:'MUSIQUES',
    cv_btn:'\u2192 Voir le CV styli\u00E9',
  },
  en: {
    nav_about:'Profile', nav_skills:'Skills', nav_projects:'Projects',
    nav_cv:'Resume', nav_contact:'Contact', nav_cta:'Contact me',
    hero_tag:'// Level Designer \u00B7 Game Designer \u00B7 Brassart Toulouse',
    hero_role:'Level Design \u00B7 Game Design \u00B7 Unity \u00B7 Unreal Engine',
    hero_desc:'Passionate about level design since 2016, I craft levels like blueprints \u2014 with precision, narrative intent and constant creative ambition.',
    stat_brassart:'Years at Brassart', stat_projects:'Projects done', stat_start:'Adventure start',
    label_gallery:'Galerie du projet', label_about:'// 001 \u2014 Profile', label_skills:'// 002 \u2014 Tools & Engines',
    label_projects:'// 003 \u2014 Portfolio', label_cv:'// 005 \u2014 Resume',
    label_contact:'// 006 \u2014 Contact', label_personal:'// 004 \u2014 Personal projects',
    title_about:'ABOUT', title_skills:'SKILLS', title_projects:'PROJECTS',
    title_cv:'MY RESUME', title_contact:'CONTACT',
    cat_personal:'Personal projects',
    proj_unjudged:'UNJUDGED', proj_priest:'DEVOURING PRIEST', proj_city:'CITY RIDER',
    proj_tower:'TOWER DEFENSE', proj_silence:'THE SILENCE', proj_draconium:'DRACONIUM',
    proj_mira:'PROJECT MIRA', proj_coaching:'ESPORT COACHING',
    proj_streaming:'TWITCH STREAMING', proj_musiques:'MUSIC',
    cv_btn:'\u2192 View styled resume',
  },
};
var _currentLang = 'fr';
// Sauvegarder les valeurs originales FR du DOM au chargement
var _originalHTML = {};
function _saveOriginals() {
  var ids = ['about-p1','about-p2','about-p3','about-p4',
             'hero-desc','cv-desc','contact-desc','contact-heading',
             'skills-hint','sk-cat-engines'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) _originalHTML[id] = el.innerHTML;
  });
}
document.addEventListener('DOMContentLoaded', _saveOriginals);

function setLang(lang) {
  if (!_LANGS[lang]) return;
  _currentLang = lang;
  try { localStorage.setItem('portfolio_lang', lang); } catch(e) {}
  var dict = _LANGS[lang];
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // Traductions du modal Tower Defense
  var tw = {
    fr: {
      'tw-lore-title': 'Le Lore',
      'tw-lore-p1': "Dans un monde magique o\u00f9 la m\u00e9t\u00e9o r\u00e8gne, les gnomes \u00e9taient autrefois les gardiens des jardins enchant\u00e9s. Mais un jour, un groupe de gnomes lass\u00e9s d\u2019ob\u00e9ir aux plantes d\u00e9cid\u00e8rent de devenir des envahisseurs \u2014 leur but\u00a0: conqu\u00e9rir tous les jardins et prendre le pouvoir sur le monde magique.",
      'tw-lore-p2': "Ils envahirent le jardin de la <strong>d\u00e9esse du climat</strong>, o\u00f9 chardons, lotus et roseaux fleurissaient. F\u00e9rieuse, la d\u00e9esse appela ses plantes pour d\u00e9fendre son jardin. La bataille fit rage des jours durant \u2014 les plantes repouss\u00e8rent l\u2019arm\u00e9e de gnomes, mais le sort final resta inconnu. <strong>Et vous, quel destin r\u00e9servez-vous \u00e0 ce monde\u00a0?</strong>",
      'tw-mec-title': 'M\u00e9caniques de jeu',
      'tw-base-label': 'Base Tower Defense',
      'tw-orig-label': 'M\u00e9caniques originales',
      'tw-enemies-title': 'Les Ennemis',
      'tw-build-title': 'B\u00e2timents d\u00e9fensifs',
      'tw-weather-title': 'Syst\u00e8me M\u00e9t\u00e9o',
      'tw-weather-p': 'La m\u00e9t\u00e9o est <strong>limit\u00e9e \u00e0 une utilisation toutes les deux vagues</strong>. Elle influence directement les stats des ennemis et des b\u00e2timents.',
      'tw-eco-title': '\u00c9conomie',
      'tw-team-title': '\u00c9quipe & R\u00e9partition',
      'tw-tools-label': 'Outils utilis\u00e9s',
    },
    en: {
      'tw-lore-title': 'Lore',
      'tw-lore-p1': "In a magical world where weather reigns supreme, gnomes were once the guardians of enchanted gardens. But one day, a group of gnomes, tired of obeying the plants, decided to become invaders \u2014 their goal: conquer all gardens and seize power over the magical world.",
      'tw-lore-p2': "They invaded the garden of the <strong>climate goddess</strong>, where thistles, lotuses and reeds were blooming. Furious, the goddess called her plants to defend her garden. The battle raged for days \u2014 the plants repelled the gnome army, but the final outcome remained unknown. <strong>And you, what fate do you have in store for this world?</strong>",
      'tw-mec-title': 'Game Mechanics',
      'tw-base-label': 'Tower Defense Core',
      'tw-orig-label': 'Original Mechanics',
      'tw-enemies-title': 'Enemies',
      'tw-build-title': 'Defensive Buildings',
      'tw-weather-title': 'Weather System',
      'tw-weather-p': 'Weather is <strong>limited to once every two waves</strong>. It directly influences enemy and building stats.',
      'tw-eco-title': 'Economy',
      'tw-team-title': 'Team & Tasks',
      'tw-tools-label': 'Tools Used',
    },
  };

  var twDict = tw[lang] || tw.fr;
  Object.keys(twDict).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = twDict[id];
  });

  // === TRADUCTIONS GLOBALES DU PORTFOLIO ===
  var TRANSLATIONS = {
    fr: {
      'about-p1': "Mein Name ist L\u00E9o Lussan, ich studiere im 3. Jahr des Game Design Bachelors an der <a href=\"https://www.brassart.fr/formations/bachelor-formation-animation-jeux-video-game-design\" target=\"_blank\" style=\"color:var(--red);text-decoration:underline;text-underline-offset:3px\">Brassart</a> Schule in Toulouse.",
      'about-p2': "Ich entdeckte Videospiele 2016 zum ersten Mal auf dem Laptop meiner Eltern und erkunde Universen wie <a href=\"https://www.leagueoflegends.com/en-us/\" target=\"_blank\" style=\"color:var(--red);text-decoration:underline;text-underline-offset:3px\">League of Legends</a> und <a href=\"https://www.minecraft.net/en-us\" target=\"_blank\" style=\"color:var(--red);text-decoration:underline;text-underline-offset:3px\">Minecraft</a>. Ich begeisterte mich schnell f\u00FCr League of Legends \u2014 Mechaniken, Wettkampf und Lore \u2014 und f\u00FCr Minecraft durch das Bauen und Erstellen von <a href=\"https://minecraft.fr/categorie/maps/map-parkour/\" target=\"_blank\" style=\"color:var(--red);text-decoration:underline;text-underline-offset:3px\">Parkour-Karten</a>.",
      'about-p3': "Ich liebte es, Levels zu erstellen, Universen zu erkunden und ihre Umgebungen zu erforschen. Ich bin leidenschaftlich f\u00FCr Videospiele und besonders f\u00FCr Level Design. Musik ist ebenfalls meine Leidenschaft \u2014 ich spiele Klavier und Trompete.",
      'about-p4': "Dieser Bereich erm\u00F6glicht es Ihnen, einige meiner Projekte zu entdecken.",
      'skills-hint': 'Trois fa\u00e7ons d\u2019explorer mes outils : par logo, par tableau ou par cartes \u2192',
      'sk-cat-engines': 'Moteurs de jeu',
      'contact-heading': 'TRAVAILLONS<br/>ENSEMBLE',
      'contact-desc': "Disponible pour des opportunit\u00e9s de stage, des collaborations cr\u00e9atives ou des \u00e9changes autour du jeu vid\u00e9o.",
      'cv-desc': "Game Designer sp\u00e9cialis\u00e9 en Level Design, avec exp\u00e9rience en gestion de projet et cr\u00e9ation d\u2019univers.",
      'pm-num-unjudged': '// 01 \u2014 Projet d\u2019\u00e9cole \u00b7 3\u00e8me Ann\u00e9e',
      "unjudged-ctx-title": "Contexte du projet",
      "unjudged-ctx-p1": "Unjudged est notre <strong>projet de fin d\u2019\u00e9tudes</strong> \u00e0 Brassart. Il commence d\u00e8s la 2\u1d49 ann\u00e9e : nous devions proposer des id\u00e9es de jeu, les r\u00e9duire progressivement, puis choisir un seul jeu \u00e0 d\u00e9velopper.",
      "unjudged-ctx-p2": "Le d\u00e9veloppement s\u2019est fait \u00e0 <strong>4</strong> sur le <strong>second semestre de la 3\u1d49 ann\u00e9e</strong>.",
      "unjudged-role-title": "Mon r\u00f4le \u2014 Lead Level Designer & Chef de projet",
      "unjudged-role-label": "Mes missions principales :",
      "unjudged-role-1": "\u2192 Lead Level Designer",
      "unjudged-role-2": "\u2192 Chef de projet",
      "unjudged-role-3": "\u2192 Communication entre l\u2019\u00e9quipe et les artistes",
      "unjudged-role-4": "\u2192 R\u00e9daction d\u2019une partie des documents",
      "unjudged-role-5": "\u2192 Aide \u00e0 la pr\u00e9sentation orale du projet",
      "unjudged-tools-title": "Outils",
      "unjudged-learn-title": "Ce que j\u2019ai appris",
      "unjudged-learn-p": "Ce projet m\u2019a surtout appris \u00e0 <strong>communiquer en \u00e9quipe</strong> : r\u00e9partir les t\u00e2ches, organiser des r\u00e9unions qui favorisent les \u00e9changes, et pr\u00e9senter mes id\u00e9es de level design de fa\u00e7on <strong>compr\u00e9hensible pour des personnes non sp\u00e9cialistes</strong>.",
      "unjudged-tools-p": "<strong>Unreal Engine 5</strong> \u00b7 <strong>Miro</strong> \u00b7 <strong>LDtk</strong> \u00b7 <strong>Git</strong> \u00b7 <strong>Google Workspace</strong> (Docs\u2026) \u00b7 <strong>Hack\u2019n Plan</strong> \u00b7 Roadmaps",
      'pm-num-priest':   '// 02 \u2014 Projet d\u2019\u00e9cole \u00b7 2\u00e8me Ann\u00e9e',
      'pm-num-city':     '// 03 \u2014 Projet d\u2019\u00e9cole \u00b7 2\u00e8me Ann\u00e9e',
      'pm-num-tower':    '// 04 \u2014 Projet d\u2019\u00e9cole \u00b7 1\u00e8re Ann\u00e9e',
      'tw-unjudged-title': 'Conception du niveau',
      'tw-priest-title': "L\u2019atmosph\u00e8re de chasse",
      'tw-city-title': 'Conception urbaine interactive',
      'tw-musiques-title': 'Ma d\u00e9marche musicale',
      'proj-draco-title-lore': 'Le Lore',
      'proj-draco-title-gameplay': 'Gameplay',
      'proj-draco-title-visual': 'Univers visuel',
      'proj-coaching-title1': 'Jeux coach\u00e9s',
      'proj-coaching-title2': "D\u00e9roul\u00e9 d\u2019une s\u00e9ance",
      'proj-mira-title1': 'Introduction',
      'proj-mira-title2': 'Une de nos constructions',
      'proj-mira-title3': 'Mon r\u00f4le \u2014 Level Designer / Builder',
      'mentions-p1': "Portfolio personnel de L\u00e9o Lussan, \u00e9tudiant Bachelor Game Design, Brassart Toulouse.",
      'mentions-p2': "Tout le contenu est la propri\u00e9t\u00e9 de L\u00e9o Lussan sauf mention contraire.",
      'mentions-p3': "Ce site ne collecte aucune donn\u00e9e personnelle. Aucun cookie de suivi.",
    },
    en: {
      'about-p1': "My name is L\u00e9o Lussan, I am a student at <a href='https://www.brassart.fr' target='_blank' style='color:var(--red)'>Brassart</a> school in Toulouse, 3rd year Game Design Bachelor.",
      'about-p2': "I first discovered video games in 2016 and never stopped. Passionate about level design, game design and world-building.",
      'about-p3': "I loved creating levels, exploring universes and researching environments to craft coherent, immersive experiences.",
      'about-p4': "This space will let you discover some of my projects.",
      'skills-hint': 'Three ways to explore my tools: by logo, by table or by cards \u2192',
      'sk-cat-engines': 'Game Engines',
      'contact-desc': "Available for internship opportunities, creative collaborations or exchanges around video games.",
      'cv-desc': "Game Designer specialized in Level Design, with experience in project management and world creation.",
      'pm-num-unjudged': '// 01 \u2014 School Project \u00b7 3rd Year',
      "unjudged-ctx-title": "Project Context",
      "unjudged-ctx-p1": "Unjudged is our <strong>final-year project</strong> at Brassart. It began in 2nd year: we had to come up with game ideas, narrow them down, then choose a single game to develop.",
      "unjudged-ctx-p2": "Development was done by a team of <strong>4</strong> over the <strong>second semester of 3rd year</strong>.",
      "unjudged-role-title": "My Role \u2014 Lead Level Designer & Project Manager",
      "unjudged-role-label": "My main tasks:",
      "unjudged-role-1": "\u2192 Lead Level Designer",
      "unjudged-role-2": "\u2192 Project manager",
      "unjudged-role-3": "\u2192 Communication between the team and the artists",
      "unjudged-role-4": "\u2192 Writing part of the documentation",
      "unjudged-role-5": "\u2192 Helping with the project\u2019s oral presentation",
      "unjudged-tools-title": "Tools",
      "unjudged-learn-title": "What I learned",
      "unjudged-learn-p": "This project taught me above all how to <strong>communicate within a team</strong>: distributing tasks, organizing meetings that encourage exchange, and explaining my level design ideas in a way that is <strong>understandable to non-specialists</strong>.",
      "unjudged-tools-p": "<strong>Unreal Engine 5</strong> \u00b7 <strong>Miro</strong> \u00b7 <strong>LDtk</strong> \u00b7 <strong>Git</strong> \u00b7 <strong>Google Workspace</strong> (Docs\u2026) \u00b7 <strong>Hack\u2019n Plan</strong> \u00b7 Roadmaps",
      'pm-num-priest':   '// 02 \u2014 School Project \u00b7 2nd Year',
      'pm-num-city':     '// 03 \u2014 School Project \u00b7 2nd Year',
      'pm-num-tower':    '// 04 \u2014 School Project \u00b7 1st Year',
      'tw-unjudged-title': 'Level Design',
      'tw-priest-title': 'The Hunt Atmosphere',
      'tw-city-title': 'Interactive Urban Design',
      'tw-musiques-title': 'My Musical Approach',
      'proj-draco-title-lore': 'Lore',
      'proj-draco-title-gameplay': 'Gameplay',
      'proj-draco-title-visual': 'Visual Universe',
      'proj-coaching-title1': 'Games Coached',
      'proj-coaching-title2': 'Session Breakdown',
      'proj-mira-title1': 'Introduction',
      'proj-mira-title2': 'One of Our Builds',
      'proj-mira-title3': 'My Role \u2014 Level Designer / Builder',
      'proj-city-p1': "City Rider is an urban racing game in a neon environment. Level design targets flow, readability and speed.",
      'proj-city-p2': "Strategically placed roads, well-positioned points of interest, balanced traffic flow.",
      'proj-silence-p1': "<strong>The Silence</strong> is a narrative atmospheric horror game based on sound and exploration.",
      'proj-silence-p2': "An experience where sound (or its absence) guides as much as visuals.",
      'proj-draco-p1': "A 2D medieval fantasy platformer where you play a young dragon on a quest for revenge.",
      'proj-draco-p2': "In a medieval kingdom steeped in magic, an alchemist seeks to unlock the secrets of dragon blood.",
      'proj-draco-p3': "Throughout the adventure, the alchemist injects you with substances and uses you as a test subject.",
      'proj-coaching-p1': "A natural extension of my competitive journey. I participated in several esports teams.",
      'proj-coaching-p2': "Macro, game vision, objectives, consistency and mindset.",
      'proj-coaching-p3': "Loops, mind games, map reading and optimization.",
      'proj-coaching-p4': "One-off sessions or regular follow-up depending on your goals.",
      'proj-streaming-p1': "Streaming is much more than just live gaming for me. It is a space for creation and community.",
      'proj-streaming-p2': "I stream seriously and consistently, wanting to provide quality content.",
      'proj-streaming-p3': "My high-level competitive background has given me a very analytical reading of the game.",
      'proj-mira-p1': "Project Mira is a collaborative project created with friends at Epic Games.",
      'proj-mira-p2': "For my part, this project is primarily a way to develop my level design skills.",
      'proj-mira-p3': "We spent about 4 months working together on this project.",
      'proj-mira-p4': "On Project Mira, I work primarily as a Level Designer and Builder.",
      'proj-musiques-p1': "Music is part of my creative process. Producing tracks lets me explore unique atmospheres.",
      'proj-musiques-p2': "Music production lets me approach creation from a different angle.",
      'mentions-p1': "Personal portfolio of L\u00e9o Lussan, Game Design Bachelor student, Brassart Toulouse.",
      'mentions-p2': "All content is the property of L\u00e9o Lussan unless otherwise stated.",
      'mentions-p3': "This site collects no personal data. No tracking cookies.",
    },
  };

  var globalDict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  Object.keys(globalDict).forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    // Pour le FR : utiliser les originaux du DOM si disponibles
    if (lang === 'fr' && _originalHTML[id] !== undefined) {
      el.innerHTML = _originalHTML[id];
    } else {
      el.innerHTML = globalDict[id];
    }
  });

  // Galerie labels (multiple elements with data-i18n)
  document.querySelectorAll('[data-i18n="label_gallery"]').forEach(function(el) {
    var galleries = {fr:'Galerie du projet', en:'Project Gallery'};
    el.textContent = galleries[lang] || galleries.fr;
  });
  // Update flag buttons opacity
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    var isActive = btn.id === 'lang-'+lang;
    btn.style.opacity = isActive ? '1' : '.35';
    btn.classList.toggle('active', isActive);
  });
  // Sync modal lang bar too
  ['fr','en'].forEach(function(l){
    var b=document.getElementById('mlang-'+l);
    if(b) b.style.opacity=(l===lang)?'1':'.35';
  });
  // Update html lang attribute
  document.documentElement.lang = lang;
}

// Restaurer la langue sauvegardee au chargement
(function() {
  try {
    var saved = localStorage.getItem('portfolio_lang');
    if (saved && _LANGS[saved] && saved !== 'fr') {
      // Attendre que le DOM soit pret
      // Les scripts sont en defer : on attend DOMContentLoaded pour que i18n-en.js soit charge
      if (document.readyState !== 'complete') {
        document.addEventListener('DOMContentLoaded', function() { window.setLang(saved); });
      } else {
        window.setLang(saved);
      }
    }
  } catch(e) {}
})();
