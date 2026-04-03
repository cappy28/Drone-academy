import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ══════════════════════════════════════════════════════════
// DATA — Leçons, exercices, shop, classement, badges
// ══════════════════════════════════════════════════════════

const UNITS = [
  {
    id:"u1",title:"Les Bases",icon:"🚁",color:"#58CC02",
    lessons:[
      {id:"l1",title:"Types de drones",icon:"🚁",xp:10,exercises:[
        {type:"mcq",q:"Combien de rotors a un quadricoptère ?",opts:["2","4","6","8"],ok:1,exp:"QUADRI = 4 en latin ! Le quadricoptère est le drone le plus répandu au monde.",src:"Mécanique des multirotors"},
        {type:"tf",stmt:"Un drone FPV se pilote avec des lunettes vidéo.",ok:true,exp:"FPV = First Person View. Tu vois en temps réel comme si tu étais dans le drone !",src:"Vocabulaire FPV standard"},
        {type:"fillblank",before:"Les drones à aile fixe ont une meilleure",blank:"endurance",after:"que les multirotors.",opts:["endurance","vitesse","stabilité","puissance"],exp:"L'aile fixe consomme bien moins d'énergie en croisière → vols de plusieurs heures !",src:"Comparatif drones"},
        {type:"match",pairs:[["Quadricoptère","4 rotors"],["Hexacoptère","6 rotors"],["FPV Racer","Casque vidéo"],["Aile fixe","Longue endurance"]]},
        {type:"mcq",q:"Quel format de drone est le plus utilisé en agriculture de précision ?",opts:["FPV racing","Multirotors lourds","Mini-drones","Ballons"],ok:1,exp:"Les hexacoptères et octocopters portent des charges lourdes (capteurs, sprayers) pour l'agriculture.",src:"Agriculture de précision"},
      ]},
      {id:"l2",title:"Composants essentiels",icon:"⚙️",xp:10,exercises:[
        {type:"mcq",q:"Que signifie ESC dans les drones ?",opts:["Easy Speed Control","Electronic Speed Controller","Engine Stop Control","Electric Signal Converter"],ok:1,exp:"ESC = Electronic Speed Controller. Il convertit les signaux du FC en courant pour chaque moteur brushless.",src:"Électronique embarquée"},
        {type:"tf",stmt:"Le Flight Controller est le « cerveau » du drone.",ok:true,exp:"Le FC lit tous les capteurs (gyro, baro, GPS) et envoie des ordres aux ESC jusqu'à 4000x/seconde !",src:"Architecture système drone"},
        {type:"fillblank",before:"La batterie la plus utilisée dans les drones est la",blank:"LiPo",after:"pour son ratio énergie/poids.",opts:["LiPo","NiMH","Alcaline","Plomb"],exp:"LiPo = Lithium Polymer. Excellent ratio énergie/poids et courant de décharge très élevé.",src:"Électronique embarquée"},
        {type:"match",pairs:[["FC","Cerveau du drone"],["ESC","Contrôleur moteur"],["LiPo","Batterie légère"],["IMU","Gyro + Accéléro"]]},
        {type:"mcq",q:"Que mesure le baromètre dans un drone ?",opts:["La vitesse","L'altitude","La direction","La température"],ok:1,exp:"Le baromètre mesure la pression atmosphérique et en déduit l'altitude. Précis à ~1 mètre !",src:"Capteurs aéronautiques"},
      ]},
      {id:"l3",title:"Histoire des drones",icon:"📜",xp:10,exercises:[
        {type:"mcq",q:"Dans quel secteur les drones ont-ils été utilisés en premier ?",opts:["Loisir","Agriculture","Militaire","Livraison"],ok:2,exp:"Les drones militaires existent depuis 1910 ! D'abord pour la reconnaissance, puis les frappes.",src:"Histoire de l'aviation militaire"},
        {type:"tf",stmt:"DJI est une entreprise française.",ok:false,exp:"DJI (Da-Jiang Innovations) est CHINOISE, fondée à Shenzhen en 2006 par Frank Wang.",src:"Histoire de DJI"},
        {type:"mcq",q:"Quelle entreprise livre du sang par drone au Rwanda ?",opts:["Amazon","Wing","Zipline","UPS"],ok:2,exp:"Zipline effectue des milliers de livraisons médicales (sang, vaccins) par drone en Afrique !",src:"Zipline - Medical Drone Delivery"},
        {type:"tf",stmt:"Le marché mondial des drones dépasse 40 milliards € en 2024.",ok:true,exp:"Explosion du marché ! Agriculture, cinéma, défense, livraison... toutes les industries adoptent les drones.",src:"Rapport marché drone 2024"},
        {type:"fillblank",before:"Le DJI Mini 4 pèse moins de",blank:"250",after:"grammes.",opts:["250","500","100","800"],exp:"249g = juste sous la limite C0 ! Moins de 250g = réglementation simplifiée en Europe.",src:"Fiche technique DJI Mini 4"},
      ]}
    ]
  },
  {
    id:"u2",title:"Physique du Vol",icon:"⚡",color:"#1CB0F6",
    lessons:[
      {id:"l4",title:"Les 4 forces",icon:"⚡",xp:15,exercises:[
        {type:"mcq",q:"Quelle force s'oppose au poids d'un drone en vol ?",opts:["La traînée","La poussée","L'inertie","La friction"],ok:1,exp:"POUSSÉE des hélices vs POIDS (gravité). Si poussée > poids → montée ! Si égaux → vol stationnaire.",src:"Physique du vol - Newton"},
        {type:"tf",stmt:"En vol stationnaire, la poussée est égale au poids.",ok:true,exp:"Équilibre parfait : Poussée = Poids. C'est la 2ème loi de Newton appliquée aux drones !",src:"Mécanique du vol"},
        {type:"match",pairs:[["Poussée ↑","Hélices"],["Poids ↓","Gravité"],["Traînée ←","Résistance air"],["Portance ↑","Profil aile"]]},
        {type:"mcq",q:"Quelle est l'accélération gravitationnelle sur Terre ?",opts:["9,81 m/s²","10,5 m/s²","8,5 m/s²","1 m/s²"],ok:0,exp:"g = 9,81 m/s². Un drone de 500g doit produire > 4,9 N pour décoller.",src:"Constantes physiques"},
        {type:"tf",stmt:"Des hélices plus grandes créent plus de poussée.",ok:true,exp:"Plus grande pale = plus d'air déplacé = plus de poussée.",src:"Aérodynamique des hélices"},
      ]},
      {id:"l5",title:"Contrôle du vol",icon:"🕹️",xp:15,exercises:[
        {type:"mcq",q:"Comment s'appelle la rotation autour de l'axe vertical ?",opts:["Roll","Pitch","Yaw","Throttle"],ok:2,exp:"YAW = rotation gauche/droite sur l'axe Z. Produit par le différentiel CW vs CCW des moteurs.",src:"Mécanique des multirotors"},
        {type:"match",pairs:[["Pitch","Avant/Arrière"],["Roll","Gauche/Droite"],["Yaw","Rotation Z"],["Throttle","Montée/Descente"]]},
        {type:"tf",stmt:"En mode Acro, le drone revient seul à l'horizontale.",ok:false,exp:"Mode ACRO = AUCUNE stabilisation automatique. Tu contrôles la vitesse angulaire.",src:"Modes de vol Betaflight"},
        {type:"mcq",q:"Pour rouler à gauche, que font les moteurs gauches ?",opts:["Ils accélèrent","Ils ralentissent","Ils s'arrêtent","Rien"],ok:1,exp:"Pour roll gauche : moteurs gauches ralentissent + moteurs droits accélèrent.",src:"Contrôle quadricoptère"},
        {type:"fillblank",before:"Le yaw est produit par le",blank:"couple de réaction",after:"entre moteurs CW et CCW.",opts:["couple de réaction","vent relatif","gyroscope","GPS"],exp:"Moteurs CW et CCW créent des couples opposés. La différence de vitesse génère la rotation en yaw !",src:"Physique du quadricoptère"},
      ]},
      {id:"l6",title:"Aérodynamique",icon:"🌀",xp:15,exercises:[
        {type:"mcq",q:"Quel profil est utilisé pour les pales d'hélice de drone ?",opts:["Profil carré","Profil NACA","Profil rond","Profil hexagonal"],ok:1,exp:"Les profils NACA sont des formes aérodynamiques standardisées.",src:"Aérodynamique NACA"},
        {type:"tf",stmt:"La traînée est proportionnelle au carré de la vitesse.",ok:true,exp:"F_drag = ½ρv²CdA. Doubler la vitesse = 4× plus de traînée !",src:"Aérodynamique théorique"},
        {type:"mcq",q:"Qu'est-ce que l'effet de sol ?",opts:["Rebond sur le sol","Portance accrue près du sol","Bruit augmenté","Signal GPS perturbé"],ok:1,exp:"Près du sol, l'air comprimé crée un 'coussin' → plus de portance.",src:"Aérodynamique du sol"},
        {type:"fillblank",before:"La traînée augmente avec le",blank:"carré",after:"de la vitesse.",opts:["carré","double","cube","triple"],exp:"F_drag = ½ρv²CdA. Le facteur v² explique pourquoi aller vite coûte beaucoup d'énergie !",src:"Physique aérodynamique"},
        {type:"tf",stmt:"Une hélice tri-pale est toujours plus efficace qu'une bi-pale.",ok:false,exp:"Bi-pale = plus efficace à haute vitesse. Tri-pale = plus de poussée à basse vitesse.",src:"Comparatif hélices drone"},
      ]}
    ]
  },
  {
    id:"u3",title:"Réglementation",icon:"📋",color:"#FF9600",
    lessons:[
      {id:"l7",title:"Catégories EASA",icon:"🇪🇺",xp:20,exercises:[
        {type:"mcq",q:"Combien de catégories le règlement EASA définit-il pour les drones ?",opts:["2","3","4","5"],ok:1,exp:"3 catégories : Ouverte (loisir+pro simple), Spécifique (autorisation DGAC), Certifiée (très gros drones).",src:"Règlement UE 2019/947"},
        {type:"tf",stmt:"La catégorie Ouverte est la plus restrictive.",ok:false,exp:"La catégorie Ouverte est la MOINS restrictive ! Accessible à tous sans autorisation préalable.",src:"Règlement UE 2019/947"},
        {type:"match",pairs:[["A1","< 250g, près des gens"],["A2","< 4kg, 30m personnes"],["A3","Loin zones habitées"],["Spécifique","Autorisation DGAC"]]},
        {type:"mcq",q:"Depuis quand le règlement européen drones est-il applicable ?",opts:["Janvier 2019","Janvier 2021","Juillet 2022","Mars 2020"],ok:1,exp:"Applicable depuis janvier 2021 dans toute l'Europe.",src:"Règlement UE 2019/947 - art. 1"},
        {type:"fillblank",before:"La formation A1/A3 se passe sur",blank:"Alphanumeric",after:".interieur.gouv.fr.",opts:["Alphanumeric","DGAC-online","Drone-cert","Géoportail"],exp:"alphanumeric.interieur.gouv.fr = portail officiel DGAC. Gratuit !",src:"DGAC - Portail drone"},
      ]},
      {id:"l8",title:"Zones de vol",icon:"🗺️",xp:20,exercises:[
        {type:"mcq",q:"Hauteur max autorisée en catégorie ouverte ?",opts:["50 m","100 m","120 m","200 m"],ok:2,exp:"120 mètres au-dessus du sol ! Règlement UE 2019/947, article 4.",src:"Règlement UE 2019/947, Art. 4"},
        {type:"tf",stmt:"Il faut une autorisation pour voler dans un rayon de 5 km d'un aéroport.",ok:true,exp:"Les zones CTR autour des aéroports sont réglementées. Utilise Géoportail Drones !",src:"Code aviation civile - DGAC"},
        {type:"mcq",q:"Quel outil officiel permet de vérifier les zones de vol en France ?",opts:["DJI Fly","AirMap","Géoportail Drones","Google Maps"],ok:2,exp:"Géoportail Drones est l'outil officiel DGAC avec toutes les zones réglementées.",src:"DGAC - Zones de vol"},
        {type:"tf",stmt:"On peut voler au-dessus d'un rassemblement avec un drone de 50g.",ok:false,exp:"JAMAIS au-dessus d'un rassemblement, quelle que soit la taille !",src:"Règlement UE 2019/947, Art. 4"},
        {type:"fillblank",before:"L'amende pour violation de zone interdite peut atteindre",blank:"15 000",after:"€.",opts:["15 000","1 000","500","5 000"],exp:"Jusqu'à 15 000€ d'amende ET 1 an de prison !",src:"Code de l'aviation civile"},
      ]},
      {id:"l9",title:"Enregistrement",icon:"📝",xp:20,exercises:[
        {type:"mcq",q:"À partir de quel poids un drone doit-il être enregistré ?",opts:["100 g","250 g","800 g","1 kg"],ok:2,exp:"≥ 800g OU équipé d'une caméra → enregistrement obligatoire. Gratuit sur Alphanumeric !",src:"Arrêté du 3 décembre 2020, Art. 4"},
        {type:"tf",stmt:"Un drone avec caméra de 200g doit être enregistré.",ok:true,exp:"La caméra = obligation d'enregistrement quelle que soit la masse.",src:"Arrêté du 3 décembre 2020"},
        {type:"mcq",q:"L'attestation A1/A3 DGAC est valable combien de temps ?",opts:["1 an","5 ans","À vie","3 ans"],ok:2,exp:"À VIE ! Une fois l'examen passé, aucun renouvellement.",src:"DGAC - Attestation A1/A3"},
        {type:"fillblank",before:"Le test A1/A3 comporte",blank:"40",after:"questions.",opts:["40","20","60","30"],exp:"40 questions, 75% requis (30/40 bonnes réponses).",src:"Formation DGAC A1/A3"},
        {type:"tf",stmt:"L'enregistrement d'un drone coûte 35€.",ok:false,exp:"L'enregistrement est GRATUIT sur alphanumeric.interieur.gouv.fr !",src:"DGAC - Enregistrement drone"},
      ]}
    ]
  },
  {
    id:"u4",title:"Électronique",icon:"🔋",color:"#CE82FF",
    lessons:[
      {id:"l10",title:"Batteries LiPo",icon:"🔋",xp:20,exercises:[
        {type:"mcq",q:"Que signifie '4S' dans 'LiPo 4S 1500mAh' ?",opts:["4 secondes","4 cellules série","4 ampères","4 cellules parallèle"],ok:1,exp:"S = cellules en Série. 4S = 4 × 3,7V = 14,8V nominal.",src:"Électronique LiPo"},
        {type:"tf",stmt:"Une cellule LiPo ne doit jamais descendre sous 3,5V.",ok:true,exp:"Sous 3,5V/cellule = dommages irréversibles.",src:"Guide maintenance LiPo"},
        {type:"match",pairs:[["1S","3,7V"],["2S","7,4V"],["3S","11,1V"],["4S","14,8V"]]},
        {type:"mcq",q:"Que signifie '75C' pour une batterie LiPo ?",opts:["75 Celsius","Taux de décharge max","75 cycles","Taille"],ok:1,exp:"C = taux de décharge. 75C × 1,5Ah = 112,5A max !",src:"Électronique LiPo"},
        {type:"tf",stmt:"Stocker une LiPo à 4,2V/cellule est recommandé.",ok:false,exp:"Voltage de stockage idéal = 3,8V par cellule.",src:"Guide sécurité LiPo"},
      ]},
      {id:"l11",title:"Moteurs Brushless",icon:"⚡",xp:20,exercises:[
        {type:"mcq",q:"Que signifie 'kv' dans '2450kv' pour un moteur ?",opts:["Kilovolt","Tours/min par volt","Watts","Diamètre mm"],ok:1,exp:"kv = RPM/V. 2450kv × 14,8V (4S) = ~36 260 tr/min !",src:"Moteurs brushless - technique"},
        {type:"tf",stmt:"Un moteur brushless n'a pas de balais (brushes).",ok:true,exp:"Sans balais = moins de friction, plus efficace, durée de vie bien plus longue !",src:"Électrotechnique moteurs"},
        {type:"fillblank",before:"Un moteur '2306' a un stator de",blank:"23",after:"mm de diamètre.",opts:["23","30","20","26"],exp:"Notation 2306 : '23' = diamètre stator mm, '06' = hauteur stator mm.",src:"Nomenclature moteurs FPV"},
        {type:"mcq",q:"Quel moteur convient mieux pour un drone cinéma ?",opts:["3000kv haut","800kv bas","Identiques","Brushed"],ok:1,exp:"Bas kv + grandes hélices = plus de stabilité, moins de vibrations → parfait pour la cinéma !",src:"Drones cinéma - technique"},
        {type:"match",pairs:[["Stator","Partie fixe"],["Rotor","Partie tournante"],["kv","RPM/Volt"],["Bobinage","Cuivre électro"]]},
      ]},
      {id:"l12",title:"Flight Controller",icon:"🖥️",xp:20,exercises:[
        {type:"mcq",q:"À quelle fréquence un FC moderne calcule-t-il ?",opts:["100 Hz","1 000 Hz","4 000 Hz","10 Hz"],ok:2,exp:"Les FC modernes (Betaflight) calculent jusqu'à 4 kHz ou 8 kHz !",src:"Documentation Betaflight"},
        {type:"tf",stmt:"L'IMU contient un gyroscope et un accéléromètre.",ok:true,exp:"IMU = Inertial Measurement Unit. Gyroscope (vitesse angulaire) + accéléromètre (accélération).",src:"Capteurs inertiels"},
        {type:"match",pairs:[["Gyroscope","Vitesse rotation"],["Accéléromètre","Accélération"],["Baromètre","Altitude"],["GPS","Position/vitesse"]]},
        {type:"mcq",q:"Quel firmware est le plus populaire pour le FPV racing ?",opts:["ArduPilot","PX4","Betaflight","iNAV"],ok:2,exp:"Betaflight est le standard du FPV racing !",src:"Communauté FPV - Betaflight"},
        {type:"fillblank",before:"Le protocole digital entre FC et ESC le plus rapide est",blank:"DSHOT",after:".",opts:["DSHOT","PWM","OneShot","Multishot"],exp:"DSHOT est un protocole digital sans calibration entre FC et ESC.",src:"Betaflight - Protocoles ESC"},
      ]}
    ]
  },
  {
    id:"u5",title:"Pilotage FPV",icon:"🎮",color:"#FF4B4B",
    lessons:[
      {id:"l13",title:"Modes de vol",icon:"🕹️",xp:25,exercises:[
        {type:"mcq",q:"En mode Angle, que se passe-t-il si tu lâches les sticks ?",opts:["Il continue","Il revient à plat","Il descend","Il fait demi-tour"],ok:1,exp:"Mode ANGLE = auto-niveau ! Le drone revient toujours à l'horizontale.",src:"Modes vol Betaflight"},
        {type:"tf",stmt:"Les pilotes FPV pros volent principalement en mode Angle.",ok:false,exp:"Les pros volent en ACRO (Rate Mode) ! Contrôle total.",src:"FPV Pros - Technique"},
        {type:"match",pairs:[["Angle","Auto-niveau débutant"],["Horizon","Semi-acro flips"],["Acro","Pas de stabilisation"],["GPS","Position hold"]]},
        {type:"mcq",q:"Qu'est-ce qu'un simulateur FPV ?",opts:["Un vrai drone","Logiciel d'entraînement","Mode spécial","Caméra FPV"],ok:1,exp:"Simulateurs (Liftoff, Velocidrone, DRL Sim) = t'entraîner sans risque ni coût !",src:"FPV Simulator - Guide"},
        {type:"fillblank",before:"La latence vidéo idéale pour le FPV racing est < ",blank:"20",after:"millisecondes.",opts:["20","100","50","5"],exp:"< 20ms de latence = réponse quasi-instantanée.",src:"Systèmes vidéo FPV"},
      ]},
      {id:"l14",title:"Matériel FPV",icon:"🥽",xp:25,exercises:[
        {type:"mcq",q:"Que signifie VTX en FPV ?",opts:["Very Thin eXtra","Video TransmiXer","Video Transmitter","Vertical TX"],ok:2,exp:"VTX = Video Transmitter. Module qui envoie le flux vidéo vers ton casque FPV.",src:"Matériel FPV - Lexique"},
        {type:"tf",stmt:"Le système DJI O3 offre une meilleure qualité qu'un système analogique.",ok:true,exp:"DJI O3 = vidéo 1080p HD, ~20ms latence. L'analogique est plus rapide (~5ms) mais qualité SD.",src:"Comparatif systèmes vidéo FPV"},
        {type:"match",pairs:[["Caméra FPV","Capture l'image"],["VTX","Émet la vidéo"],["Casque FPV","Reçoit/affiche"],["Antenne","Améliore portée"]]},
        {type:"mcq",q:"La taille standard des hélices pour un drone FPV racing est ?",opts:["2 pouces","3 pouces","5 pouces","8 pouces"],ok:2,exp:"5 pouces = format standard du FPV racing !",src:"FPV Racing - Standards"},
        {type:"tf",stmt:"Un drone FPV 5 pouces peut dépasser 150 km/h.",ok:true,exp:"Les drones FPV 5 pouces racing peuvent atteindre 160-180 km/h !",src:"DRL - Données techniques"},
      ]},
      {id:"l15",title:"Compétitions",icon:"🏆",xp:25,exercises:[
        {type:"mcq",q:"Que signifie MultiGP ?",opts:["Multiple GPS","Organisation courses FPV","Multi-rotor GP","Logiciel vol"],ok:1,exp:"MultiGP = la plus grande organisation mondiale de courses FPV !",src:"MultiGP - Site officiel"},
        {type:"tf",stmt:"La Drone Racing League (DRL) est une ligue professionnelle.",ok:true,exp:"DRL = la F1 des drones ! Des pilotes pros s'affrontent à 160+ km/h.",src:"DRL - Site officiel"},
        {type:"match",pairs:[["Racing","Vitesse sur circuit"],["Freestyle","Figures créatives"],["Cinéma","Plans pro"],["Long Range","Dizaines de km"]]},
        {type:"mcq",q:"Combien de temps dure un vol FPV racing typique ?",opts:["30 secondes","2-3 minutes","10 minutes","30 minutes"],ok:1,exp:"2-3 minutes par vol ! La batterie se décharge vite à pleine puissance.",src:"FPV Racing - Pratique"},
        {type:"tf",stmt:"Le freestyle FPV consiste à voler le plus vite possible.",ok:false,exp:"Non ! Freestyle = vol artistique et acrobatique filmé. La créativité prime.",src:"Freestyle FPV - Définition"},
      ]}
    ]
  },
  {
    id:"u6",title:"Ingénierie",icon:"⚙️",color:"#FFD900",
    lessons:[
      {id:"l16",title:"Parcours ingénieur",icon:"🎓",xp:30,exercises:[
        {type:"mcq",q:"Quelle école forme des ingénieurs aéronautiques à Toulouse ?",opts:["Polytechnique","ISAE-SUPAERO","Arts et Métiers","INSA Lyon"],ok:1,exp:"ISAE-SUPAERO = LA grande école française d'aéronautique.",src:"ISAE-SUPAERO - Présentation"},
        {type:"tf",stmt:"Python est utilisé pour programmer des drones autonomes.",ok:true,exp:"Python est très utilisé (ArduPilot, ROS2, MAVSDK-Python).",src:"Programmation drone - Langages"},
        {type:"match",pairs:[["ArduPilot","Firmware open-source"],["ROS2","Middleware robotique"],["PX4","Firmware pro"],["MAVSDK","SDK haut niveau"]]},
        {type:"mcq",q:"Quel BAC est recommandé pour devenir ingénieur drone ?",opts:["BAC Pro","BAC Général","STI2D","STMG"],ok:1,exp:"BAC Général + Maths/Physique/NSI/SI = meilleure porte d'entrée !",src:"Orientation - Ingénierie aéronautique"},
        {type:"fillblank",before:"Le stage de pilote ULM",blank:"A2",after:"permet de voler avec des drones jusqu'à 4 kg.",opts:["A2","A1","A3","B2"],exp:"La qualification A2 autorise les drones C2 jusqu'à 4 kg près des personnes.",src:"DGAC - Qualification A2"},
      ]},
      {id:"l17",title:"Programmation",icon:"💻",xp:30,exercises:[
        {type:"mcq",q:"Que signifie MAVLink ?",opts:["Micro Air Vehicle Link","Main AViation Link","Maximum AV Link","Mini AV Link"],ok:0,exp:"MAVLink = Micro Air Vehicle Link. Protocole léger de communication drones ↔ stations sol.",src:"MAVLink Protocol - Documentation"},
        {type:"tf",stmt:"ArduPilot est un firmware open-source.",ok:true,exp:"ArduPilot est sur GitHub, contribué par des milliers d'ingénieurs monde entier.",src:"ArduPilot - GitHub"},
        {type:"mcq",q:"Quel langage est utilisé dans Betaflight ?",opts:["Python","Java","C/C++","JavaScript"],ok:2,exp:"Betaflight est écrit en C. C est le roi des systèmes embarqués.",src:"Betaflight - GitHub source"},
        {type:"fillblank",before:"ROS signifie Robot",blank:"Operating System",after:".",opts:["Operating System","Online Service","Open Source","Output Signal"],exp:"ROS = framework open-source pour robotique et drones autonomes.",src:"ROS - Documentation officielle"},
        {type:"tf",stmt:"Un Raspberry Pi peut être un companion computer sur un drone.",ok:true,exp:"Le Raspberry Pi est souvent utilisé pour la vision par ordinateur et l'IA embarquée !",src:"Companion Computer - ArduPilot"},
      ]},
      {id:"l18",title:"Métiers & Projets",icon:"💼",xp:30,exercises:[
        {type:"mcq",q:"Quel secteur recrute le plus d'ingénieurs drones en France ?",opts:["Tourisme","Défense + Aéronautique","Sport","Alimentation"],ok:1,exp:"Thales, Safran, Airbus, MBDA... La défense et l'aéronautique française recrutent massivement !",src:"Offres emploi - Ingénieur drone 2024"},
        {type:"tf",stmt:"Thales et Safran recrutent des ingénieurs spécialisés en drones.",ok:true,exp:"Thales (systèmes de défense), Safran (navigation/inertiel)... deux géants !",src:"Thales + Safran - Recrutement"},
        {type:"match",pairs:[["Zipline","Livraison médicale"],["DJI","Matériel grand public"],["Skydio","Drones autonomes IA"],["Volocopter","Taxi aérien"]]},
        {type:"mcq",q:"Quel diplôme est généralement requis pour ingénieur drone ?",opts:["Bac+2 BTS","Bac+3 Licence","Bac+5 Ingénieur","Bac seul"],ok:2,exp:"Bac+5 minimum ! École d'ingénieur ou Master en aéronautique/électronique.",src:"Fiche métier - Ingénieur drone"},
        {type:"tf",stmt:"Les drones peuvent inspecter des infrastructures difficiles d'accès.",ok:true,exp:"Ponts, pylônes, toitures, éoliennes... Les drones remplacent les échafaudages !",src:"Drones inspection - Applications"},
      ]}
    ]
  }
];

const ACHIEVEMENTS = [
  {id:"a1",icon:"🚁",title:"Premier Vol",desc:"Termine ta 1ère leçon",req:s=>s.lessonsCompleted>=1,color:"#58CC02"},
  {id:"a2",icon:"🔥",title:"En Feu !",desc:"3 jours de streak",req:s=>s.streak>=3,color:"#FF9600"},
  {id:"a3",icon:"💎",title:"Riche !",desc:"Obtiens 200 gemmes",req:s=>s.gems>=200,color:"#1CB0F6"},
  {id:"a4",icon:"📚",title:"Étudiant",desc:"5 leçons terminées",req:s=>s.lessonsCompleted>=5,color:"#CE82FF"},
  {id:"a5",icon:"⚡",title:"Rapide !",desc:"200 XP gagnés",req:s=>s.xp>=200,color:"#FFD900"},
  {id:"a6",icon:"🎮",title:"Pilote FPV",desc:"Score 10 au simulateur",req:s=>s.fpvBest>=10,color:"#FF4B4B"},
  {id:"a7",icon:"🏆",title:"Champion",desc:"Toutes les leçons terminées",req:s=>s.lessonsCompleted>=18,color:"#FFD900"},
  {id:"a8",icon:"🧠",title:"Génie Drone",desc:"500 XP gagnés",req:s=>s.xp>=500,color:"#58CC02"},
  {id:"a9",icon:"❤️",title:"Sans Faute",desc:"Leçon sans erreur",req:s=>s.perfectLessons>=1,color:"#FF4B4B"},
  {id:"a10",icon:"🌟",title:"Niveau 10",desc:"Atteins le niveau 10",req:s=>s.level>=10,color:"#FFD900"},
  {id:"a11",icon:"🦅",title:"Maître DGAC",desc:"Unité réglementation terminée",req:s=>s.unitsCompleted&&s.unitsCompleted.includes("u3"),color:"#FF9600"},
  {id:"a12",icon:"⚙️",title:"Ingénieur",desc:"Unité ingénierie terminée",req:s=>s.unitsCompleted&&s.unitsCompleted.includes("u6"),color:"#CE82FF"},
];

const SHOP_ITEMS = [
  {id:"s1",icon:"❤️",title:"1 Cœur",desc:"Récupère un cœur perdu",cost:50,type:"heart",amount:1},
  {id:"s2",icon:"❤️",title:"5 Cœurs",desc:"Recharge complète !",cost:200,type:"heart",amount:5},
  {id:"s3",icon:"🛡️",title:"Gel de Streak",desc:"Protège ton streak 1 jour",cost:150,type:"streakFreeze",amount:1},
  {id:"s4",icon:"⚡",title:"Boost XP x2",desc:"Double XP prochaine leçon",cost:300,type:"xpBoost",amount:1},
  {id:"s5",icon:"🎯",title:"Pack Starter",desc:"3 cœurs + Boost XP",cost:400,type:"combo",amount:1},
  {id:"s6",icon:"🌈",title:"Streak 7j",desc:"7 jours de streak cadeau",cost:500,type:"streak",amount:7},
];

const LB_DATA = [
  {rank:1,name:"DroneKing",flag:"🇫🇷",xp:1840,ava:"👑"},
  {rank:2,name:"FPVmaster",flag:"🇧🇪",xp:1520,ava:"🚀"},
  {rank:3,name:"SkyPilot",flag:"🇨🇭",xp:1310,ava:"🎯"},
  {rank:4,name:"DroneNinja",flag:"🇫🇷",xp:1180,ava:"⚡"},
  {rank:5,name:"AeroLucas",flag:"🇫🇷",xp:990,ava:"🛸"},
  {rank:6,name:"RC_expert",flag:"🇩🇪",xp:880,ava:"🔧"},
  {rank:7,name:"PixelFly",flag:"🇮🇹",xp:750,ava:"📸"},
  {rank:8,name:"Turbine3",flag:"🇪🇸",xp:640,ava:"💨"},
  {rank:9,name:"ZenDrone",flag:"🇫🇷",xp:520,ava:"🌸"},
  {rank:10,name:"MiniFlyer",flag:"🇵🇹",xp:410,ava:"🐝"},
];

const DAILY_CHALLENGES = [
  {id:"d1",icon:"🎯",title:"Quiz Express",desc:"Réponds à 5 questions en moins de 30s",xp:30,gems:15},
  {id:"d2",icon:"🔥",title:"Sans Faute",desc:"Termine une leçon sans perdre de cœur",xp:50,gems:25},
  {id:"d3",icon:"⚡",title:"Vitesse Éclair",desc:"Termine une leçon complète",xp:25,gems:10},
];

// ═══════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --g:#58CC02;--gd:#45A800;--gl:#D7FFB8;
  --y:#FFD900;--yd:#E6C300;
  --r:#FF4B4B;--rl:#FFDFE0;
  --b:#1CB0F6;--bd:#0091D9;--bl:#DDF4FF;
  --pu:#CE82FF;--or:#FF9600;
  --gray:#E5E5E5;--gray2:#AFAFAF;--gray3:#777;
  --txt:#3C3C3C;--bg:#FFFFFF;--bg2:#F7F7F7;
  --shadow:0 2px 0 rgba(0,0,0,.15);
  --shadow2:0 4px 0 rgba(0,0,0,.15);
  --f:'Nunito',sans-serif;
}
html,body{background:var(--bg2);font-family:var(--f);color:var(--txt)}
.app{max-width:480px;margin:0 auto;min-height:100vh;background:var(--bg);display:flex;flex-direction:column;position:relative}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--bg);border-top:2px solid var(--gray);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0)}
.nbi{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 8px;border:none;background:none;cursor:pointer;font-family:var(--f);font-size:10px;font-weight:700;color:var(--gray2);gap:3px;transition:color .15s;text-transform:uppercase;letter-spacing:.5px}
.nbi.act{color:var(--b)}
.nbi-ic{font-size:22px}
.cont{flex:1;overflow-y:auto;padding:0 0 80px;-webkit-overflow-scrolling:touch}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;position:sticky;top:0;background:var(--bg);z-index:50;border-bottom:2px solid var(--gray)}
.hdr-logo{font-size:18px;font-weight:900;color:var(--g)}
.hdr-stats{display:flex;gap:14px;align-items:center}
.hstat{display:flex;align-items:center;gap:4px;font-weight:800;font-size:15px}
.hstat-ic{font-size:16px}
.uhdr{padding:20px 16px 14px;margin-top:2px}
.upill{display:inline-flex;align-items:center;gap:7px;background:var(--c,var(--g));color:#fff;padding:8px 16px;border-radius:14px;font-weight:800;font-size:14px;margin-bottom:12px;box-shadow:0 3px 0 rgba(0,0,0,.18)}
.utitle{font-size:20px;font-weight:900;color:var(--txt);margin-bottom:4px}
.usub{font-size:13px;color:var(--gray3);font-weight:600}
.path-col{display:flex;flex-direction:column;align-items:center;gap:0;padding:4px 0 12px}
.pline{width:3px;height:28px;background:var(--gray)}
.pline.done{background:var(--c,var(--g))}
.pnode-wrap{display:flex;flex-direction:column;align-items:center}
.pn{width:70px;height:70px;border-radius:50%;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:22px;transition:transform .15s;position:relative;font-family:var(--f)}
.pn:active{transform:scale(.93)}
.pn.available{background:var(--c,var(--g));box-shadow:0 5px 0 var(--cd,var(--gd));color:#fff}
.pn.done{background:var(--c,var(--g));box-shadow:0 5px 0 var(--cd,var(--gd));color:#fff}
.pn.locked{background:var(--gray);box-shadow:0 5px 0 #c0c0c0;cursor:not-allowed;color:var(--gray2)}
.pn-crown{position:absolute;top:-10px;font-size:14px}
.pn-stars{font-size:10px;margin-top:1px;letter-spacing:1px}
.pn-lbl{font-size:11px;font-weight:800;color:var(--gray3);margin-top:7px;text-align:center;max-width:90px;line-height:1.3}
.chest{width:56px;height:56px;border-radius:14px;background:var(--y);box-shadow:0 4px 0 var(--yd);display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;margin:4px 0;transition:transform .15s}
.chest:active{transform:scale(.93)}
.chest.opened{background:var(--gray);box-shadow:0 4px 0 #c0c0c0;filter:grayscale(1)}
.lesson-wrap{position:fixed;inset:0;background:var(--bg);z-index:200;display:flex;flex-direction:column;max-width:480px;margin:0 auto}
.lhdr{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:2px solid var(--gray)}
.lclose{background:none;border:none;font-size:22px;cursor:pointer;color:var(--gray2);padding:2px}
.lxpbar-wrap{flex:1;height:16px;background:var(--gray);border-radius:8px;overflow:hidden}
.lxpbar{height:100%;background:var(--g);border-radius:8px;transition:width .4s cubic-bezier(.4,0,.2,1)}
.lhearts{display:flex;gap:3px;font-size:20px;margin-left:2px}
.lbody{flex:1;overflow-y:auto;padding:24px 20px 16px;display:flex;flex-direction:column;gap:18px}
.lquestion{font-size:20px;font-weight:800;color:var(--txt);line-height:1.5}
.lhint{font-size:14px;font-weight:700;color:var(--gray3);margin-top:-6px}
.opts{display:flex;flex-direction:column;gap:10px}
.opt{padding:14px 18px;background:var(--bg);border:2.5px solid var(--gray);border-radius:16px;font-size:16px;font-weight:700;cursor:pointer;transition:all .15s;text-align:left;color:var(--txt);font-family:var(--f);display:flex;align-items:center;gap:12px}
.opt:hover:not(:disabled){border-color:var(--b);background:var(--bl)}
.opt.selected{border-color:var(--b);background:var(--bl)}
.opt.correct{border-color:var(--g);background:var(--gl);color:var(--gd)}
.opt.wrong{border-color:var(--r);background:var(--rl);color:var(--r)}
.opt-ic{width:34px;height:34px;border-radius:8px;border:2px solid var(--gray);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0}
.opt.correct .opt-ic{border-color:var(--g);background:var(--g);color:#fff}
.opt.wrong .opt-ic{border-color:var(--r);background:var(--r);color:#fff}
.opt.selected .opt-ic{border-color:var(--b);background:var(--b);color:#fff}
.tf-opts{display:flex;gap:12px}
.tf-btn{flex:1;padding:20px;border:2.5px solid var(--gray);border-radius:16px;font-size:16px;font-weight:800;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:6px}
.tf-btn:hover:not(:disabled){border-color:var(--b);background:var(--bl)}
.tf-btn.selected{border-color:var(--b);background:var(--bl)}
.tf-btn.correct{border-color:var(--g);background:var(--gl);color:var(--gd)}
.tf-btn.wrong{border-color:var(--r);background:var(--rl);color:var(--r)}
.tf-ic{font-size:28px}
.fb-sent{font-size:18px;font-weight:800;line-height:2;color:var(--txt);margin-bottom:16px;text-align:center}
.fb-blank{display:inline-block;min-width:120px;border-bottom:3px solid var(--b);padding:0 8px;font-style:italic;color:var(--b)}
.fb-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.fb-opt{padding:10px 18px;border:2.5px solid var(--gray);border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);transition:all .15s}
.fb-opt:hover:not(:disabled){border-color:var(--b);background:var(--bl);color:var(--b)}
.fb-opt.selected{border-color:var(--b);background:var(--b);color:#fff}
.fb-opt.correct{border-color:var(--g);background:var(--g);color:#fff}
.fb-opt.wrong{border-color:var(--r);background:var(--r);color:#fff}
.match-grid{display:flex;gap:10px}
.match-col{flex:1;display:flex;flex-direction:column;gap:8px}
.match-item{padding:12px 10px;border:2.5px solid var(--gray);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);transition:all .15s;text-align:center;min-height:50px;display:flex;align-items:center;justify-content:center}
.match-item:hover:not(.matched):not(.wrong-match){border-color:var(--b);background:var(--bl)}
.match-item.sel{border-color:var(--b);background:var(--b);color:#fff}
.match-item.matched{border-color:var(--g);background:var(--gl);color:var(--gd);pointer-events:none}
.match-item.wrong-match{border-color:var(--r);background:var(--rl);color:var(--r)}
.lfeedback{padding:16px 20px;border-top:2px solid var(--gray)}
.lfeedback.correct{background:var(--gl);border-top-color:var(--g)}
.lfeedback.wrong{background:var(--rl);border-top-color:var(--r)}
.lf-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.lf-ic{font-size:28px}
.lf-title{font-size:18px;font-weight:900}
.lf-correct .lf-title{color:var(--gd)}
.lf-wrong .lf-title{color:var(--r)}
.lf-exp{font-size:13px;color:var(--gray3);font-weight:600;line-height:1.6;margin-bottom:12px}
.lf-src{font-size:11px;color:var(--gray2);font-weight:700;font-style:italic}
.check-btn{width:100%;padding:16px;border-radius:16px;border:none;font-size:17px;font-weight:900;cursor:pointer;font-family:var(--f);transition:all .15s;box-shadow:var(--shadow2)}
.check-btn.idle{background:var(--gray);color:var(--gray2);cursor:not-allowed;box-shadow:none}
.check-btn.ready{background:var(--g);color:#fff}
.check-btn.ready:hover{background:var(--gd)}
.check-btn.correct{background:var(--g);color:#fff}
.check-btn.wrong{background:var(--r);color:#fff}
.celebration{position:fixed;inset:0;background:linear-gradient(135deg,#58CC02,#45A800);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:300;gap:16px;max-width:480px;margin:0 auto;padding:24px}
.cel-ic{font-size:80px;animation:bounce 1s ease infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
.cel-title{font-size:30px;font-weight:900;color:#fff;text-align:center}
.cel-sub{font-size:15px;color:rgba(255,255,255,.85);font-weight:700;text-align:center}
.cel-stats{display:flex;gap:16px;margin:12px 0}
.cel-stat{background:rgba(255,255,255,.2);border-radius:14px;padding:14px 20px;text-align:center;color:#fff}
.cel-sval{font-size:26px;font-weight:900}
.cel-slbl{font-size:12px;font-weight:700;opacity:.85}
.cel-btn{width:100%;max-width:320px;padding:18px;border-radius:16px;border:none;background:#fff;color:var(--g);font-size:18px;font-weight:900;cursor:pointer;font-family:var(--f);box-shadow:0 4px 0 rgba(0,0,0,.2);transition:transform .15s}
.cel-btn:active{transform:scale(.97)}
.card{background:var(--bg);border:2px solid var(--gray);border-radius:20px;padding:16px;margin:0 16px 12px}
.card-title{font-size:16px;font-weight:900;color:var(--txt);margin-bottom:3px}
.card-sub{font-size:13px;color:var(--gray3);font-weight:600}
.shop-item{display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg);border:2px solid var(--gray);border-radius:18px;margin:0 16px 10px}
.si-ic{font-size:30px;width:50px;height:50px;background:var(--bg2);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.si-info{flex:1}
.si-title{font-size:15px;font-weight:800;color:var(--txt)}
.si-desc{font-size:12px;color:var(--gray3);font-weight:600;margin-top:2px}
.si-btn{background:var(--b);color:#fff;border:none;border-radius:12px;padding:10px 16px;font-size:14px;font-weight:800;cursor:pointer;font-family:var(--f);box-shadow:0 3px 0 var(--bd);transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap}
.si-btn:hover{background:var(--bd)}
.si-btn.cant{background:var(--gray);color:var(--gray2);box-shadow:none;cursor:not-allowed}
.lb-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1.5px solid var(--bg2)}
.lb-rank{width:30px;font-size:16px;font-weight:900;text-align:center}
.lb-rank.gold{color:var(--y)}
.lb-rank.silver{color:#B0B8C1}
.lb-rank.bronze{color:#CD7F32}
.lb-ava{font-size:26px;width:40px;height:40px;background:var(--bg2);border-radius:50%;display:flex;align-items:center;justify-content:center}
.lb-name{flex:1;font-weight:800;font-size:15px;color:var(--txt)}
.lb-flag{font-size:14px}
.lb-xp{font-weight:900;font-size:15px;color:var(--b)}
.lb-me{background:var(--bl);border-left:4px solid var(--b)}
.prof-head{padding:24px 20px;text-align:center;background:linear-gradient(180deg,var(--bg2),var(--bg));border-bottom:2px solid var(--gray)}
.prof-ava{font-size:70px;margin-bottom:10px}
.prof-name{font-size:22px;font-weight:900;color:var(--txt)}
.prof-lvl{font-size:13px;font-weight:700;color:var(--gray3);margin-bottom:16px}
.xpbar-wrap{margin:0 20px;background:var(--gray);height:16px;border-radius:8px;overflow:hidden;position:relative;margin-bottom:4px}
.xpbar-fill{height:100%;background:var(--g);border-radius:8px;transition:width .5s}
.xpbar-lbl{text-align:center;font-size:12px;font-weight:700;color:var(--gray3);margin:0 20px 4px}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:16px;background:var(--bg)}
.sstat{background:var(--bg2);border-radius:14px;padding:14px 8px;text-align:center}
.sstat-v{font-size:22px;font-weight:900}
.sstat-l{font-size:11px;font-weight:700;color:var(--gray3);margin-top:2px}
.ach-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:16px}
.ach{background:var(--bg2);border-radius:14px;padding:14px 8px;text-align:center;border:2px solid transparent;transition:all .2s}
.ach.earned{border-color:var(--y);background:#FFFDE7}
.ach-ic{font-size:28px;margin-bottom:4px}
.ach-t{font-size:10px;font-weight:800;color:var(--txt)}
.ach-d{font-size:9px;color:var(--gray3);font-weight:600;margin-top:1px;line-height:1.3}
.daily-card{margin:0 16px 10px;background:var(--bg);border:2px solid var(--gray);border-radius:18px;overflow:hidden}
.dc-top{padding:14px 16px;display:flex;align-items:center;gap:12px}
.dc-ic{font-size:28px;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--bg2)}
.dc-btn{background:var(--g);color:#fff;border:none;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:var(--f);margin-left:auto;white-space:nowrap}
.qq-q{font-size:18px;font-weight:800;color:var(--txt);margin-bottom:16px;line-height:1.5;background:var(--bg2);padding:16px;border-radius:16px}
.toast{position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#3C3C3C;color:#fff;padding:12px 20px;border-radius:14px;font-size:14px;font-weight:700;z-index:500;animation:fadein .3s,fadeout .3s 1.7s forwards;pointer-events:none;white-space:nowrap;max-width:90vw;font-family:var(--f)}
@keyframes fadein{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes fadeout{to{opacity:0}}
.badgepop{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--y);color:var(--txt);padding:14px 20px;border-radius:20px;font-weight:800;font-size:15px;z-index:500;animation:badgein .4s cubic-bezier(.4,0,.2,1),fadeout .3s 2.7s forwards;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.2);white-space:nowrap;max-width:90vw;font-family:var(--f)}
@keyframes badgein{from{opacity:0;transform:translateX(-50%) scale(.7)}to{opacity:1;transform:translateX(-50%) scale(1)}}
.gift-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px}
.gift-box{background:#fff;border-radius:24px;padding:28px 24px;text-align:center;max-width:340px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.gift-emoji{font-size:72px;animation:bounce 1s ease infinite;display:block;margin-bottom:12px}
.gift-title{font-size:24px;font-weight:900;color:var(--txt);margin-bottom:8px}
.gift-reward{display:flex;gap:12px;justify-content:center;margin:16px 0}
.gift-pill{padding:10px 18px;border-radius:20px;font-weight:900;font-size:16px}
.aiq-wrap{padding:16px}
.aiq-sel{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.aiq-tag{padding:8px 14px;border:2px solid var(--gray);border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);transition:all .15s}
.aiq-tag.act{background:var(--b);border-color:var(--b);color:#fff}
.aiq-genbtn{width:100%;padding:16px;background:var(--b);color:#fff;border:none;border-radius:16px;font-size:16px;font-weight:800;cursor:pointer;font-family:var(--f);box-shadow:0 3px 0 var(--bd);margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s}
.aiq-genbtn:hover{background:var(--bd)}
.aiq-genbtn:disabled{background:var(--gray);color:var(--gray2);box-shadow:none;cursor:not-allowed}
.spin{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.sec-title{padding:16px 16px 8px;font-size:13px;font-weight:900;color:var(--gray3);text-transform:uppercase;letter-spacing:.8px}
/* 3D VIEWER */
.viewer3d-wrap{padding:0 16px 16px}
.viewer3d-tabs{display:flex;gap:8px;padding:12px 0 8px;overflow-x:auto}
.vtab{padding:8px 14px;border-radius:20px;border:2px solid var(--gray);font-size:13px;font-weight:800;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);white-space:nowrap;transition:all .15s}
.vtab.act{background:var(--pu);border-color:var(--pu);color:#fff}
.v3d-canvas{width:100%;border-radius:16px;border:2px solid var(--gray);display:block;background:#0a0a1a;touch-action:none}
.v3d-controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.v3d-btn{padding:8px 14px;border-radius:10px;border:2px solid var(--gray);font-size:13px;font-weight:800;cursor:pointer;background:var(--bg);color:var(--txt);font-family:var(--f);transition:all .15s}
.v3d-btn:hover{background:var(--pu);border-color:var(--pu);color:#fff}
.v3d-btn.act{background:var(--pu);border-color:var(--pu);color:#fff}
.part-info{background:var(--bg2);border-radius:14px;padding:14px;margin-top:10px}
.part-info-title{font-size:14px;font-weight:900;color:var(--pu);margin-bottom:4px}
.part-info-desc{font-size:12px;color:var(--gray3);font-weight:600;line-height:1.6}
/* FPV 3D */
#fpv3d{width:100%;border-radius:16px;border:2px solid var(--gray);display:block;background:#001;touch-action:none}
.fpv-btns{display:flex;justify-content:space-between;padding:16px;gap:12px}
.fpv-dir{width:64px;height:64px;border:2.5px solid var(--gray);border-radius:16px;background:var(--bg);font-size:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;transition:background .1s;font-family:var(--f)}
.fpv-dir:active{background:var(--bl)}
.fpv-joystick-wrap{display:flex;justify-content:space-between;padding:0 16px 16px;gap:20px}
.fpv-stick{width:110px;height:110px;background:var(--bg2);border:2px solid var(--gray);border-radius:50%;position:relative;touch-action:none;flex-shrink:0}
.fpv-stick-knob{width:44px;height:44px;background:var(--b);border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transition:background .1s;box-shadow:0 2px 8px rgba(28,176,246,.4)}
`;

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════

const initState = {
  xp:50, gems:80, hearts:5, streak:3, level:1,
  lessonsCompleted:0, perfectLessons:0, fpvBest:0,
  completed:[], stars:{}, unitsCompleted:[],
  unitProgress:{}, openedChests:[],
};

function reducer(state, action) {
  switch(action.type) {
    case 'addXP': {
      const xp = state.xp + action.xp;
      return { ...state, xp, level: Math.floor(xp/300)+1 };
    }
    case 'completeLesson': {
      const { lessonId, xpEarned, stars, perfect, unitId } = action;
      if(state.completed.includes(lessonId)) return state;
      const xp = state.xp + xpEarned;
      const gems = state.gems + (perfect ? 20 : 8);
      const completed = [...state.completed, lessonId];
      const unitProgress = { ...state.unitProgress, [unitId]: (state.unitProgress[unitId]||0)+1 };
      const unit = UNITS.find(u=>u.id===unitId);
      const unitsCompleted = unit && unitProgress[unitId]===unit.lessons.length
        ? [...(state.unitsCompleted||[]), unitId]
        : state.unitsCompleted||[];
      return {
        ...state, xp, gems, completed,
        stars:{...state.stars,[lessonId]:stars},
        lessonsCompleted: state.lessonsCompleted+1,
        perfectLessons: state.perfectLessons+(perfect?1:0),
        unitProgress, unitsCompleted, level: Math.floor(xp/300)+1
      };
    }
    case 'updateFPV': return { ...state, fpvBest: Math.max(state.fpvBest, action.score) };
    case 'openChest': {
      const { chestId, xp, gems } = action;
      if(state.openedChests?.includes(chestId)) return state;
      return { ...state, xp: state.xp + xp, gems: state.gems + gems, openedChests:[...(state.openedChests||[]),chestId] };
    }
    case 'buy': {
      const {item} = action;
      if(state.gems < item.cost) return state;
      const gems = state.gems - item.cost;
      let hearts = state.hearts;
      let streak = state.streak;
      if(item.type==='heart') hearts = Math.min(5, hearts+item.amount);
      if(item.type==='combo') hearts = Math.min(5, hearts+3);
      if(item.type==='streak') streak = streak+item.amount;
      return { ...state, gems, hearts, streak };
    }
    default: return state;
  }
}

// ═══════════════════════════════════════════════
// EXERCISE COMPONENTS
// ═══════════════════════════════════════════════

function MCQ({ ex, answered, selected, onSelect }) {
  const letters = ['A','B','C','D','E'];
  return (
    <div className="opts">
      {ex.opts.map((o, i) => {
        let cls = 'opt';
        if (answered) { if (i === ex.ok) cls += ' correct'; else if (i === selected) cls += ' wrong'; }
        else if (i === selected) cls += ' selected';
        return (
          <button key={i} className={cls} onClick={() => !answered && onSelect(i)} disabled={answered}>
            <span className="opt-ic">{answered && i === ex.ok ? '✓' : answered && i === selected && i !== ex.ok ? '✗' : letters[i]}</span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function TF({ ex, answered, selected, onSelect }) {
  const items = [{ v: true, ic: '✅', lbl: 'VRAI' }, { v: false, ic: '❌', lbl: 'FAUX' }];
  return (
    <div className="tf-opts">
      {items.map(item => {
        let cls = 'tf-btn';
        if (answered) {
          if (item.v === ex.ok) cls += ' correct';
          else if (item.v === selected) cls += ' wrong';
        } else if (item.v === selected) cls += ' selected';
        return (
          <button key={String(item.v)} className={cls} onClick={() => !answered && onSelect(item.v)} disabled={answered}>
            <span className="tf-ic">{item.ic}</span>{item.lbl}
          </button>
        );
      })}
    </div>
  );
}

function FillBlank({ ex, answered, selected, onSelect }) {
  return (
    <div>
      <div className="fb-sent">
        {ex.before} <span className="fb-blank">{selected !== null ? selected : '______'}</span> {ex.after}
      </div>
      <div className="fb-opts">
        {ex.opts.map((o, i) => {
          let cls = 'fb-opt';
          if (answered) {
            if (o === ex.blank) cls += ' correct';
            else if (o === selected) cls += ' wrong';
          } else if (o === selected) cls += ' selected';
          return <button key={i} className={cls} onClick={() => !answered && onSelect(o)} disabled={answered}>{o}</button>;
        })}
      </div>
    </div>
  );
}

function Match({ ex, onComplete }) {
  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongs, setWrongs] = useState([]);
  const pairs = ex.pairs;
  const lefts = pairs.map(p => p[0]);
  const rights = useRef([...pairs.map(p => p[1])].sort(() => Math.random() - .5)).current;

  const tryMatch = useCallback((l, r) => {
    const correctR = pairs.find(p => p[0] === l)?.[1];
    if (r === correctR) {
      const nm = [...matched, l];
      setMatched(nm);
      setSelLeft(null); setSelRight(null);
      if (nm.length === pairs.length) setTimeout(() => onComplete(true), 400);
    } else {
      setWrongs([l, r]);
      setTimeout(() => { setWrongs([]); setSelLeft(null); setSelRight(null); onComplete(false); }, 800);
    }
  }, [matched, pairs, onComplete]);

  useEffect(() => {
    if (selLeft !== null && selRight !== null) tryMatch(selLeft, selRight);
  }, [selLeft, selRight, tryMatch]);

  const isMatchedLeft = l => matched.includes(l);
  const isMatchedRight = r => matched.some(l => pairs.find(p => p[0] === l)?.[1] === r);

  return (
    <div className="match-grid">
      <div className="match-col">
        {lefts.map((l, i) => {
          let cls = 'match-item';
          if (isMatchedLeft(l)) cls += ' matched';
          else if (wrongs.includes(l)) cls += ' wrong-match';
          else if (selLeft === l) cls += ' sel';
          return <button key={i} className={cls} onClick={() => !isMatchedLeft(l) && setSelLeft(l === selLeft ? null : l)}>{l}</button>;
        })}
      </div>
      <div className="match-col">
        {rights.map((r, i) => {
          let cls = 'match-item';
          if (isMatchedRight(r)) cls += ' matched';
          else if (wrongs.includes(r)) cls += ' wrong-match';
          else if (selRight === r) cls += ' sel';
          return <button key={i} className={cls} onClick={() => !isMatchedRight(r) && setSelRight(r === selRight ? null : r)}>{r}</button>;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// LESSON FLOW
// ═══════════════════════════════════════════════

function LessonFlow({ lesson, unitColor, onClose, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [matchCorrect, setMatchCorrect] = useState(null);

  const ex = lesson.exercises[idx];
  const progress = idx / lesson.exercises.length;
  const isReady = ex.type === 'match' ? matchCorrect !== null : selected !== null;

  const handleCheck = () => {
    if (answered) {
      if (idx + 1 >= lesson.exercises.length) setDone(true);
      else { setIdx(i => i + 1); setSelected(null); setAnswered(false); setCorrect(null); setMatchCorrect(null); }
      return;
    }
    if (!isReady) return;
    let isCorrect;
    if (ex.type === 'mcq') isCorrect = selected === ex.ok;
    else if (ex.type === 'tf') isCorrect = selected === ex.ok;
    else if (ex.type === 'fillblank') isCorrect = selected === ex.blank;
    else if (ex.type === 'match') isCorrect = matchCorrect;
    setCorrect(isCorrect);
    setAnswered(true);
    if (!isCorrect) { setHearts(h => Math.max(0, h - 1)); setErrors(e => e + 1); }
  };

  const handleMatchComplete = useCallback((ok) => {
    setMatchCorrect(ok);
    setCorrect(ok);
    setAnswered(true);
    if (!ok) { setHearts(h => Math.max(0, h - 1)); setErrors(e => e + 1); }
  }, []);

  if (done) {
    const xpEarned = Math.round(lesson.xp * (1 + (errors === 0 ? 0.5 : 0)));
    const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
    return (
      <div className="celebration">
        <div className="cel-ic">🎉</div>
        <div className="cel-title">Leçon terminée !</div>
        <div className="cel-sub">{errors === 0 ? 'PARFAIT ! Aucune erreur 🌟' : `${errors} erreur${errors > 1 ? 's' : ''} — Continue tes efforts !`}</div>
        <div className="cel-stats">
          <div className="cel-stat"><div className="cel-sval">+{xpEarned}</div><div className="cel-slbl">⚡ XP</div></div>
          <div className="cel-stat"><div className="cel-sval">{'⭐'.repeat(stars)}</div><div className="cel-slbl">Étoiles</div></div>
          <div className="cel-stat"><div className="cel-sval">+{perfect ? 20 : 8}💎</div><div className="cel-slbl">Gemmes</div></div>
        </div>
        <button className="cel-btn" onClick={() => onComplete(xpEarned, stars, errors === 0)}>CONTINUER →</button>
      </div>
    );
    var perfect = errors === 0;
  }

  const fbCls = answered ? (correct ? 'lfeedback correct lf-correct' : 'lfeedback wrong lf-wrong') : 'lfeedback';
  const btnCls = !answered ? (isReady ? 'check-btn ready' : 'check-btn idle') : (correct ? 'check-btn correct' : 'check-btn wrong');
  const btnTxt = !answered ? 'VÉRIFIER' : correct ? '✓ CONTINUER' : "✗ OK, j'ai compris";

  return (
    <div className="lesson-wrap">
      <div className="lhdr">
        <button className="lclose" onClick={onClose}>✕</button>
        <div className="lxpbar-wrap"><div className="lxpbar" style={{ width: `${progress * 100}%`, background: unitColor }}></div></div>
        <div className="lhearts">{Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < hearts ? '❤️' : '🖤'}</span>)}</div>
      </div>
      <div className="lbody">
        {ex.type === 'mcq' && <>
          <div className="lhint">Quelle est la bonne réponse ?</div>
          <div className="lquestion">{ex.q}</div>
          <MCQ ex={ex} answered={answered} selected={selected} onSelect={setSelected} />
        </>}
        {ex.type === 'tf' && <>
          <div className="lhint">Vrai ou faux ?</div>
          <div className="lquestion">{ex.stmt}</div>
          <TF ex={ex} answered={answered} selected={selected} onSelect={setSelected} />
        </>}
        {ex.type === 'fillblank' && <>
          <div className="lhint">Complète la phrase !</div>
          <FillBlank ex={ex} answered={answered} selected={selected} onSelect={setSelected} />
        </>}
        {ex.type === 'match' && <>
          <div className="lhint">Associe les paires !</div>
          <Match ex={ex} answered={answered} onComplete={handleMatchComplete} />
        </>}
      </div>
      <div className={fbCls}>
        {answered && (
          <>
            <div className="lf-row">
              <span className="lf-ic">{correct ? '🎉' : '💡'}</span>
              <div><div className="lf-title">{correct ? 'Excellent !' : 'Pas tout à fait...'}</div></div>
            </div>
            <div className="lf-exp">{ex.exp}</div>
            {ex.src && <div className="lf-src">📚 {ex.src}</div>}
          </>
        )}
        {ex.type !== 'match' && (
          <button className={btnCls} onClick={handleCheck} disabled={!isReady && !answered}>{btnTxt}</button>
        )}
        {ex.type === 'match' && answered && (
          <button className={btnCls} onClick={handleCheck}>{btnTxt}</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// GIFT MODAL
// ═══════════════════════════════════════════════

function GiftModal({ onClose, xp, gems }) {
  return (
    <div className="gift-modal" onClick={onClose}>
      <div className="gift-box" onClick={e => e.stopPropagation()}>
        <span className="gift-emoji">🎁</span>
        <div className="gift-title">Coffre débloqué !</div>
        <div style={{fontSize:14,color:'var(--gray3)',fontWeight:600,marginBottom:8}}>Tu as terminé l'unité — voici ta récompense !</div>
        <div className="gift-reward">
          <div className="gift-pill" style={{background:'#DDF4FF',color:'#0091D9'}}>+{xp} ⚡ XP</div>
          <div className="gift-pill" style={{background:'#E8F5E9',color:'#45A800'}}>+{gems} 💎</div>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:14,background:'var(--g)',color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:900,cursor:'pointer',fontFamily:'var(--f)',marginTop:8}}>
          Super ! 🎉
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3D FPV GAME (Three.js)
// ═══════════════════════════════════════════════

function FPV3DGame({ onXP, onBest }) {
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const startGame = useCallback(() => {
    if (gameRef.current) gameRef.current.reset();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth || 440;
    const H = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    scene.fog = new THREE.Fog(0x001122, 30, 120);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 200);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: mount, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    scene.add(new THREE.AmbientLight(0x112244, 2));
    const pLight = new THREE.PointLight(0x4488ff, 3, 30);
    pLight.position.set(0, 5, -5);
    scene.add(pLight);

    // Grid floor
    const gridHelper = new THREE.GridHelper(200, 40, 0x003366, 0x002244);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Drone (camera body) - small indicator
    const droneGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.15, 0.6);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x00ff88, emissive: 0x004422 });
    droneGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
    // Arms
    const armMat = new THREE.MeshPhongMaterial({ color: 0x00cc66 });
    [[-0.4,-0.4],[0.4,-0.4],[-0.4,0.4],[0.4,0.4]].forEach(([ax,az])=>{
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
      armGeo.rotateZ(Math.PI/2);
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(ax, 0, az);
      droneGroup.add(arm);
      const propGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 8);
      const propMat = new THREE.MeshPhongMaterial({ color: 0x88ffcc, transparent: true, opacity: 0.7 });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.position.set(ax, 0.08, az);
      prop.userData.isProp = true;
      droneGroup.add(prop);
    });
    droneGroup.position.set(0, 0, -3);
    scene.add(droneGroup);

    // Gates array
    const gates = [];
    const gateMat = new THREE.MeshPhongMaterial({ color: 0x1CB0F6, emissive: 0x003366, wireframe: false, transparent: true, opacity: 0.85 });
    const gatePassed = new THREE.MeshPhongMaterial({ color: 0x58CC02, emissive: 0x112200, transparent: true, opacity: 0.85 });

    function createGate(z) {
      const gateGroup = new THREE.Group();
      const gx = (Math.random() - 0.5) * 10;
      const gy = (Math.random() - 0.5) * 6;
      gateGroup.position.set(gx, gy, z);
      gateGroup.userData = { passed: false, cx: gx, cy: gy };

      // Gate frame
      const frameGeo = new THREE.TorusGeometry(2.8, 0.2, 8, 24);
      const frameMesh = new THREE.Mesh(frameGeo, gateMat.clone());
      gateGroup.add(frameMesh);

      // Glow ring
      const glowGeo = new THREE.TorusGeometry(3.0, 0.05, 8, 24);
      const glowMat = new THREE.MeshPhongMaterial({ color: 0x1CB0F6, emissive: 0x1CB0F6, transparent: true, opacity: 0.4 });
      gateGroup.add(new THREE.Mesh(glowGeo, glowMat));

      scene.add(gateGroup);
      gates.push(gateGroup);
      return gateGroup;
    }

    // Initial gates
    for (let i = 0; i < 8; i++) createGate(-20 - i * 18);

    // Game state
    const state = {
      droneX: 0, droneY: 0, velX: 0, velY: 0,
      score: 0, speed: 0.12, frame: 0,
      alive: true, started: false
    };

    gameRef.current = {
      reset: () => {
        Object.assign(state, { droneX:0, droneY:0, velX:0, velY:0, score:0, speed:0.12, frame:0, alive:true, started:true });
        gates.forEach(g => scene.remove(g));
        gates.length = 0;
        for (let i = 0; i < 8; i++) createGate(-20 - i * 18);
        setScore(0); setOver(false); setStarted(true);
      }
    };

    // Particles
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 100;
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.15, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(particleGeo, particleMat));

    // HUD overlay (canvas texture)
    let animId;
    const clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (state.started && state.alive) {
        state.frame++;
        state.speed = Math.min(0.35, 0.12 + state.score * 0.008);

        const k = keysRef.current;
        if (k.up) state.velY += 0.015;
        if (k.down) state.velY -= 0.015;
        if (k.left) state.velX -= 0.012;
        if (k.right) state.velX += 0.012;

        state.velX *= 0.88;
        state.velY *= 0.88;
        state.droneX += state.velX;
        state.droneY += state.velY;
        state.droneX = Math.max(-7, Math.min(7, state.droneX));
        state.droneY = Math.max(-5, Math.min(5, state.droneY));

        // Move camera + drone
        droneGroup.position.x += (state.droneX - droneGroup.position.x) * 0.15;
        droneGroup.position.y += (state.droneY - droneGroup.position.y) * 0.15;
        droneGroup.rotation.z = -state.velX * 4;
        droneGroup.rotation.x = state.velY * 2;

        camera.position.x += (state.droneX * 0.3 - camera.position.x) * 0.08;
        camera.position.y += (state.droneY * 0.3 - camera.position.y) * 0.08;

        // Spin props
        droneGroup.children.forEach(c => {
          if (c.userData.isProp) c.rotation.y += 0.4;
        });

        // Move gates
        gates.forEach((g, i) => {
          g.position.z += state.speed * 60 * dt;
          g.rotation.z += 0.005;

          // Check pass
          if (!g.userData.passed && g.position.z > -2 && g.position.z < 2) {
            const dx = Math.abs(state.droneX - g.userData.cx);
            const dy = Math.abs(state.droneY - g.userData.cy);
            if (dx < 2.4 && dy < 2.4) {
              g.userData.passed = true;
              g.children[0].material.color.set(0x58CC02);
              g.children[0].material.emissive.set(0x112200);
              state.score++;
              const newScore = state.score;
              setScore(newScore);
              if (newScore > 0 && newScore % 1 === 0) onXP(5);
            } else {
              state.alive = false;
              setOver(true);
              const finalScore = state.score;
              setBestScore(prev => {
                const nb = Math.max(prev, finalScore);
                if (nb > prev) onBest(nb);
                return nb;
              });
            }
          }

          // Recycle gate
          if (g.position.z > 8) {
            g.position.z -= gates.length * 18;
            g.userData.cx = (Math.random() - 0.5) * 10;
            g.userData.cy = (Math.random() - 0.5) * 6;
            g.position.x = g.userData.cx;
            g.position.y = g.userData.cy;
            g.userData.passed = false;
            g.children[0].material.color.set(0x1CB0F6);
            g.children[0].material.emissive.set(0x003366);
          }
        });

        // Spawn more gates as score increases
        if (state.frame % 180 === 0 && gates.length < 12) {
          createGate(-90);
        }
      }

      // Point light pulse
      pLight.intensity = 2 + Math.sin(Date.now() * 0.003) * 1;

      renderer.render(scene, camera);
    }

    animate();

    const kd = e => {
      const d = e.type === 'keydown';
      if (['ArrowUp','w',' '].includes(e.key)) { keysRef.current.up = d; if(d) e.preventDefault(); }
      if (['ArrowDown','s'].includes(e.key)) { keysRef.current.down = d; if(d) e.preventDefault(); }
      if (['ArrowLeft','a'].includes(e.key)) { keysRef.current.left = d; if(d) e.preventDefault(); }
      if (['ArrowRight','d'].includes(e.key)) { keysRef.current.right = d; if(d) e.preventDefault(); }
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', kd);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', kd);
      renderer.dispose();
    };
  }, [onXP, onBest]);

  // Joystick handling
  const leftStickRef = useRef(null);
  const rightStickRef = useRef(null);
  const leftKnobRef = useRef(null);
  const rightKnobRef = useRef(null);

  const setupJoystick = (stickEl, knobEl, axisX, axisY) => {
    if (!stickEl || !knobEl) return;
    const R = 33;
    let active = false, startX = 0, startY = 0;

    const onStart = e => {
      active = true;
      const touch = e.touches ? e.touches[0] : e;
      startX = touch.clientX; startY = touch.clientY;
      e.preventDefault();
    };
    const onMove = e => {
      if (!active) return;
      const touch = e.touches ? e.touches[0] : e;
      let dx = touch.clientX - startX;
      let dy = touch.clientY - startY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist > R) { dx = dx/dist*R; dy = dy/dist*R; }
      knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      keysRef.current[axisX === 'left' ? 'left' : 'right'] = dx < -8;
      keysRef.current[axisX === 'left' ? 'right' : 'right'] = false;
      if (axisX === 'h') {
        keysRef.current.left = dx < -8;
        keysRef.current.right = dx > 8;
      }
      if (axisY === 'v') {
        keysRef.current.up = dy < -8;
        keysRef.current.down = dy > 8;
      }
      e.preventDefault();
    };
    const onEnd = () => {
      active = false;
      knobEl.style.transform = 'translate(-50%, -50%)';
      if (axisX === 'h') { keysRef.current.left = false; keysRef.current.right = false; }
      if (axisY === 'v') { keysRef.current.up = false; keysRef.current.down = false; }
    };

    stickEl.addEventListener('touchstart', onStart, { passive: false });
    stickEl.addEventListener('touchmove', onMove, { passive: false });
    stickEl.addEventListener('touchend', onEnd);
    stickEl.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    return () => {
      stickEl.removeEventListener('touchstart', onStart);
      stickEl.removeEventListener('touchmove', onMove);
      stickEl.removeEventListener('touchend', onEnd);
      stickEl.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  };

  useEffect(() => {
    const c1 = setupJoystick(leftStickRef.current, leftKnobRef.current, 'h', null);
    const c2 = setupJoystick(rightStickRef.current, rightKnobRef.current, null, 'v');
    return () => { c1?.(); c2?.(); };
  }, []);

  return (
    <div style={{ padding: '0 16px' }}>
      <canvas ref={mountRef} id="fpv3d" width={440} height={280} />
      {!started && (
        <div style={{ textAlign: 'center', padding: '12px 0 4px', fontSize: 13, fontWeight: 700, color: 'var(--gray3)' }}>
          Passe à travers les portes bleues 🔵 → elles deviennent vertes ✅
        </div>
      )}
      {over && (
        <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--r)', fontWeight: 900, fontSize: 16 }}>
          💥 CRASH ! Score : {score} portes · Meilleur : {bestScore}
        </div>
      )}
      {started && !over && (
        <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--g)', fontWeight: 900, fontSize: 15 }}>
          🏆 {score} portes · Meilleur : {bestScore}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <button
          style={{ padding: '12px 28px', background: 'var(--g)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--f)', boxShadow: '0 3px 0 var(--gd)' }}
          onClick={startGame}
        >
          {over ? '🔄 Rejouer' : started ? '🔄 Restart' : '▶ Commencer'}
        </button>
      </div>
      {/* Joysticks */}
      <div className="fpv-joystick-wrap">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray3)' }}>← →</div>
          <div ref={leftStickRef} className="fpv-stick">
            <div ref={leftKnobRef} className="fpv-stick-knob" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray3)' }}>Joysticks tactiles</div>
          <div style={{ fontSize: 11, color: 'var(--gray2)', fontWeight: 600 }}>ou flèches clavier</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray3)' }}>↑ ↓</div>
          <div ref={rightStickRef} className="fpv-stick">
            <div ref={rightKnobRef} className="fpv-stick-knob" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3D DRONE VIEWER (exploded view)
// ═══════════════════════════════════════════════

const DRONE_PARTS = [
  { id: 'frame', label: 'Châssis (Frame)', color: 0x444444, desc: 'La structure principale du drone. En carbone pour les FPV, plastique pour les drones grand public. Définit la taille (3", 5", 7"...).' },
  { id: 'fc', label: 'Flight Controller', color: 0x1CB0F6, desc: 'Le "cerveau" du drone. Tourne Betaflight ou ArduPilot. Calcule les corrections jusqu\'à 4000x/seconde via gyroscope + accéléromètre.' },
  { id: 'esc', label: 'ESC (4-en-1)', color: 0xFF9600, desc: 'Electronic Speed Controller. Reçoit les signaux DSHOT du FC et contrôle la vitesse de chaque moteur en temps réel.' },
  { id: 'motor', label: 'Moteurs Brushless', color: 0xCE82FF, desc: 'Moteurs sans balais (2306, 2207...). Le kv définit les RPM/Volt. Un 5" utilise ~2400kv sur 4S pour atteindre 160+ km/h.' },
  { id: 'prop', label: 'Hélices', color: 0x58CC02, desc: 'Pales bi ou tri-pale en polycarbonate. Pour un 5" FPV : hélices 5.1x4.1x3. Profil NACA pour l\'efficacité aérodynamique.' },
  { id: 'lipo', label: 'Batterie LiPo', color: 0xFF4B4B, desc: 'Lithium Polymer. 4S 1500mAh 100C pour le FPV racing. Voltage de stockage : 3,8V/cellule. Ne jamais descendre sous 3,5V !' },
  { id: 'vtx', label: 'Caméra + VTX', color: 0xFFD900, desc: 'La caméra FPV capture l\'image. Le VTX (Video Transmitter) l\'envoie au casque à 5,8GHz. DJI O4 offre une qualité HD.' },
  { id: 'rx', label: 'Récepteur (RX)', color: 0x00ff88, desc: 'Reçoit les ordres de la radiocommande (ExpressLRS, CRSF). Connecté au FC via UART. Portée : 2 à 30+ km selon le protocole.' },
];

function Drone3DViewer() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [exploded, setExploded] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [activeTab, setActiveTab] = useState('fpv5');
  const [rotating, setRotating] = useState(true);
  const partsGroupRef = useRef(null);
  const rendererRef = useRef(null);

  const DRONE_MODELS = {
    fpv5: 'FPV 5 pouces',
    mini: 'DJI Mini (style)',
    hex: 'Hexacoptère',
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth || 440;
    const H = 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 6, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: mount, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(5, 10, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4488ff, 2);
    rimLight.position.set(-5, 2, -8);
    scene.add(rimLight);

    // Ground grid
    const grid = new THREE.GridHelper(20, 20, 0x223355, 0x112233);
    grid.position.y = -3;
    scene.add(grid);

    function buildFPV5() {
      const group = new THREE.Group();
      // Frame
      const frameMat = new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 100 });
      const armGeo = new THREE.BoxGeometry(0.18, 0.08, 3.4);
      ['ne','nw','se','sw'].forEach((_, qi) => {
        const arm = new THREE.Mesh(armGeo, frameMat.clone());
        arm.position.set(qi < 2 ? 1.1 : -1.1, 0, qi % 2 === 0 ? -1.1 : 1.1);
        arm.rotation.y = Math.PI / 4 * (qi % 2 === 0 ? 1 : -1);
        arm.userData = { partId: 'frame' };
        group.add(arm);
      });
      // Center plate
      const plateMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 150 });
      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.4), plateMat);
      plate.userData = { partId: 'frame' };
      group.add(plate);

      // FC (blue board)
      const fcMat = new THREE.MeshPhongMaterial({ color: 0x0055aa, emissive: 0x001133 });
      const fc = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.6), fcMat);
      fc.position.y = 0.12;
      fc.userData = { partId: 'fc', explodeY: 1.2 };
      group.add(fc);

      // ESC (orange board)
      const escMat = new THREE.MeshPhongMaterial({ color: 0xaa4400, emissive: 0x220800 });
      const esc = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.8), escMat);
      esc.position.y = -0.12;
      esc.userData = { partId: 'esc', explodeY: -1.2 };
      group.add(esc);

      // Motors x4
      const motorMat = new THREE.MeshPhongMaterial({ color: 0x9933cc, shininess: 200 });
      const motorPositions = [[2.0, 0, -2.0],[2.0, 0, 2.0],[-2.0, 0, -2.0],[-2.0, 0, 2.0]];
      motorPositions.forEach(([mx, my, mz], mi) => {
        const motorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.35, 12), motorMat.clone());
        motorBase.position.set(mx, my, mz);
        motorBase.userData = { partId: 'motor', explodeOffset: [mx * 0.3, 0.8, mz * 0.3] };
        group.add(motorBase);

        // Props
        const propMat = new THREE.MeshPhongMaterial({ color: mi % 2 === 0 ? 0x00ee44 : 0x33aaff, transparent: true, opacity: 0.85 });
        const propGroup = new THREE.Group();
        propGroup.position.set(mx, my + 0.3, mz);
        propGroup.userData = { partId: 'prop', explodeOffset: [mx * 0.3, 1.8, mz * 0.3], isPropGroup: true };
        // 3 blades
        for (let b = 0; b < 3; b++) {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.03, 0.85),
            propMat.clone()
          );
          blade.rotation.y = (b / 3) * Math.PI * 2;
          blade.position.z = 0.42;
          blade.rotation.y += Math.PI / 6;
          propGroup.add(blade);
        }
        group.add(propGroup);
      });

      // Camera + VTX
      const camMat = new THREE.MeshPhongMaterial({ color: 0xccaa00, shininess: 180 });
      const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.6), camMat);
      camBody.position.set(0, 0.6, -1.3);
      camBody.userData = { partId: 'vtx', explodeOffset: [0, 2.2, -1.5] };
      group.add(camBody);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 300 }));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0.6, -1.62);
      group.add(lens);

      // Battery
      const lipoMat = new THREE.MeshPhongMaterial({ color: 0xcc2200, shininess: 60 });
      const lipo = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.1), lipoMat);
      lipo.position.y = -0.42;
      lipo.userData = { partId: 'lipo', explodeY: -2.5 };
      group.add(lipo);

      // RX
      const rxMat = new THREE.MeshPhongMaterial({ color: 0x00cc55, emissive: 0x002211 });
      const rx = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), rxMat);
      rx.position.set(0.8, 0.25, 0.8);
      rx.userData = { partId: 'rx', explodeOffset: [1.5, 0.8, 1.5] };
      group.add(rx);

      return group;
    }

    function buildHex() {
      const group = new THREE.Group();
      const frameMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 2.8), frameMat.clone());
        arm.rotation.y = angle;
        arm.position.set(Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2);
        arm.userData = { partId: 'frame' };
        group.add(arm);
        const motorMat = new THREE.MeshPhongMaterial({ color: 0x9933cc });
        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 10), motorMat);
        motor.position.set(Math.cos(angle) * 2.4, 0.2, Math.sin(angle) * 2.4);
        motor.userData = { partId: 'motor', explodeOffset: [Math.cos(angle) * 0.6, 0.9, Math.sin(angle) * 0.6] };
        group.add(motor);
        const propMat = new THREE.MeshPhongMaterial({ color: i % 2 === 0 ? 0x00ee44 : 0x33aaff, transparent: true, opacity: 0.8 });
        const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.03, 12), propMat);
        prop.position.set(Math.cos(angle) * 2.4, 0.4, Math.sin(angle) * 2.4);
        prop.userData = { partId: 'prop', explodeOffset: [Math.cos(angle) * 0.6, 1.8, Math.sin(angle) * 0.6] };
        group.add(prop);
      }
      const center = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.14, 12), new THREE.MeshPhongMaterial({ color: 0x111111 }));
      center.userData = { partId: 'frame' };
      group.add(center);
      const fc = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.4), new THREE.MeshPhongMaterial({ color: 0x0055aa }));
      fc.position.y = 0.15;
      fc.userData = { partId: 'fc', explodeY: 1.2 };
      group.add(fc);
      const lipo = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 1.3), new THREE.MeshPhongMaterial({ color: 0xcc2200 }));
      lipo.position.y = -0.45;
      lipo.userData = { partId: 'lipo', explodeY: -2 };
      group.add(lipo);
      return group;
    }

    function buildMini() {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), new THREE.MeshPhongMaterial({ color: 0xeeeeee }));
      body.userData = { partId: 'frame' };
      group.add(body);
      const motorPos = [[0.9,0.3,0.9],[0.9,0.3,-0.9],[-0.9,0.3,0.9],[-0.9,0.3,-0.9]];
      motorPos.forEach(([mx, my, mz], mi) => {
        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.22, 10), new THREE.MeshPhongMaterial({ color: 0x666666 }));
        motor.position.set(mx, my, mz);
        motor.userData = { partId: 'motor', explodeOffset: [mx * 0.4, 0.8, mz * 0.4] };
        group.add(motor);
        const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.025, 10), new THREE.MeshPhongMaterial({ color: 0x222222, transparent: true, opacity: 0.7 }));
        prop.position.set(mx, my + 0.18, mz);
        prop.userData = { partId: 'prop', explodeOffset: [mx * 0.4, 1.6, mz * 0.4] };
        group.add(prop);
      });
      const cam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.3), new THREE.MeshPhongMaterial({ color: 0x333333 }));
      cam.position.set(0, 0.3, 0.8);
      cam.userData = { partId: 'vtx', explodeOffset: [0, 1.8, 1.2] };
      group.add(cam);
      const lipo = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 0.7), new THREE.MeshPhongMaterial({ color: 0xcc2200 }));
      lipo.position.y = -0.32;
      lipo.userData = { partId: 'lipo', explodeY: -1.5 };
      group.add(lipo);
      const fc = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.9), new THREE.MeshPhongMaterial({ color: 0x0055aa }));
      fc.position.y = 0.08;
      fc.userData = { partId: 'fc', explodeY: 0.8 };
      group.add(fc);
      return group;
    }

    const builders = { fpv5: buildFPV5, hex: buildHex, mini: buildMini };
    const droneGroup = builders[activeTab]?.() || buildFPV5();
    scene.add(droneGroup);
    partsGroupRef.current = droneGroup;

    // Part labels
    let rotSpeed = 0.005;
    let isDragging = false, lastX = 0;
    let autoRotate = true;

    mount.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; });
    mount.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; }, { passive: true });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('touchend', () => { isDragging = false; });
    mount.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      droneGroup.rotation.y += dx * 0.01;
      lastX = e.clientX;
      autoRotate = false;
      setTimeout(() => { autoRotate = true; }, 3000);
    });
    mount.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - lastX;
      droneGroup.rotation.y += dx * 0.01;
      lastX = e.touches[0].clientX;
      e.preventDefault();
    }, { passive: false });

    // Click to select part
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mount.addEventListener('click', e => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / W) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / H) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(droneGroup.children, true);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData.partId && obj.parent) obj = obj.parent;
        if (obj?.userData?.partId) setSelectedPart(obj.userData.partId);
      }
    });

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (autoRotate) droneGroup.rotation.y += rotSpeed;

      // Explode animation
      droneGroup.children.forEach(child => {
        const targetY = exploded ? (child.userData.explodeY || 0) : 0;
        const targetOff = exploded ? (child.userData.explodeOffset || [0, 0, 0]) : [0, 0, 0];
        if (child.userData.explodeY !== undefined) {
          child.position.y += (targetY - child.position.y) * 0.1;
        }
        if (child.userData.explodeOffset) {
          child.position.x += (targetOff[0] - child.position.x) * 0.1;
          child.position.y += (targetOff[1] - child.position.y) * 0.1;
          child.position.z += (targetOff[2] - child.position.z) * 0.1;
        }
        // Highlight selected
        if (child.material) {
          const isSelected = child.userData.partId === selectedPart;
          child.material.emissiveIntensity = isSelected ? 1.5 : 0;
        } else if (child.children) {
          child.children.forEach(c => {
            if (c.material) c.material.emissiveIntensity = c.userData.partId === selectedPart ? 1.5 : 0;
          });
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [activeTab]);

  // Update explode state in animation
  useEffect(() => {
    // Re-render will be triggered naturally
  }, [exploded, selectedPart]);

  const partInfo = selectedPart ? DRONE_PARTS.find(p => p.id === selectedPart) : null;

  return (
    <div className="viewer3d-wrap">
      <div className="viewer3d-tabs">
        {Object.entries(DRONE_MODELS).map(([key, label]) => (
          <button key={key} className={`vtab${activeTab === key ? ' act' : ''}`} onClick={() => setActiveTab(key)}>
            {key === 'fpv5' ? '🏎️' : key === 'mini' ? '🎥' : '🏭'} {label}
          </button>
        ))}
      </div>
      <canvas ref={mountRef} className="v3d-canvas" width={440} height={260} />
      <div className="v3d-controls">
        <button className={`v3d-btn${exploded ? ' act' : ''}`} onClick={() => setExploded(e => !e)}>
          {exploded ? '🔧 Assembler' : '💥 Vue Éclatée'}
        </button>
        <button className="v3d-btn" onClick={() => setSelectedPart(null)}>
          ↩ Désélectionner
        </button>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray3)', display: 'flex', alignItems: 'center' }}>
          👆 Tourne / clique sur une pièce
        </div>
      </div>
      {/* Parts selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {DRONE_PARTS.slice(0, 6).map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPart(p.id === selectedPart ? null : p.id)}
            style={{
              padding: '6px 12px', borderRadius: 20, border: `2px solid ${selectedPart === p.id ? '#CE82FF' : 'var(--gray)'}`,
              background: selectedPart === p.id ? '#CE82FF' : 'var(--bg)', color: selectedPart === p.id ? '#fff' : 'var(--txt)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)'
            }}
          >
            {p.label.split(' ')[0]}
          </button>
        ))}
      </div>
      {partInfo && (
        <div className="part-info">
          <div className="part-info-title">{partInfo.label}</div>
          <div className="part-info-desc">{partInfo.desc}</div>
        </div>
      )}
      {!partInfo && (
        <div className="part-info">
          <div className="part-info-title" style={{ color: 'var(--gray3)' }}>Vue 3D Interactive</div>
          <div className="part-info-desc">Clique sur une pièce ou un bouton pour voir sa description. Active "Vue Éclatée" pour séparer tous les composants !</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AI QUIZ
// ═══════════════════════════════════════════════

function AIQuiz({ onXP }) {
  const topics = [
    {id:'reglementation DGAC et EASA pour les drones',l:'📋 Réglementation'},
    {id:'physique du vol des drones multirotors',l:'⚡ Physique'},
    {id:'électronique des drones (moteurs, ESC, batteries, FC)',l:'🔋 Électronique'},
    {id:"sécurité et procédures en cas d'urgence drone",l:'🛡️ Sécurité'},
    {id:'ingénierie et programmation de drones autonomes',l:'⚙️ Ingénierie'},
  ];
  const [topic,setTopic]=useState(topics[0].id);
  const [loading,setLoading]=useState(false);
  const [q,setQ]=useState(null);
  const [ans,setAns]=useState(null);
  const [score,setScore]=useState({ok:0,tot:0});

  const gen=async()=>{
    setLoading(true);setAns(null);setQ(null);
    try{
      const r=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',max_tokens:800,
          system:`Tu es expert en drones, aéronautique et DGAC/EASA. Génère UNE question QCM adaptée à un jeune passionné voulant devenir ingénieur drone. Réponds UNIQUEMENT en JSON valide (sans backticks ni markdown) :
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"...","source":"...","funfact":"..."}
correct = index 0-3 de la bonne réponse.`,
          messages:[{role:'user',content:`Question sur: ${topic}`}]
        })
      });
      const data=await r.json();
      const txt=data.content?.[0]?.text||'';
      const clean = txt.replace(/```json\n?|\n?```/g,'').trim();
      setQ(JSON.parse(clean));
    }catch(e){setQ({error:true});}
    setLoading(false);
  };

  const pick=i=>{
    if(ans!==null)return;
    setAns(i);
    if(i===q.correct){onXP(20);setScore(s=>({ok:s.ok+1,tot:s.tot+1}));}
    else setScore(s=>({...s,tot:s.tot+1}));
  };

  return(
    <div className="aiq-wrap">
      <div style={{fontWeight:800,fontSize:13,color:'var(--gray3)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Choisis un thème</div>
      <div className="aiq-sel">
        {topics.map(t=>(
          <button key={t.id} className={`aiq-tag${topic===t.id?' act':''}`} onClick={()=>setTopic(t.id)}>{t.l}</button>
        ))}
      </div>
      {score.tot>0&&(
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 0',borderTop:'2px solid var(--gray)',borderBottom:'2px solid var(--gray)',marginBottom:14}}>
          <span style={{fontSize:13,fontWeight:700,color:'var(--gray3)'}}>{score.tot} questions</span>
          <div style={{flex:1,height:10,background:'var(--gray)',borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',background:'var(--g)',width:`${score.tot?score.ok/score.tot*100:0}%`,borderRadius:5,transition:'width .4s'}}></div></div>
          <span style={{fontWeight:800,color:'var(--g)',fontSize:14}}>{Math.round(score.ok/(score.tot||1)*100)}%</span>
        </div>
      )}
      <button className="aiq-genbtn" onClick={gen} disabled={loading}>
        {loading?<><div className="spin"></div>Génération...</>:<>🤖 Générer une question · +20 XP si correct</>}
      </button>
      {q&&!q.error&&(
        <div>
          <div className="qq-q">{q.question}</div>
          <div className="opts" style={{marginBottom:14}}>
            {q.options.map((o,i)=>{
              let cls='opt';
              if(ans!==null){if(i===q.correct)cls+=' correct';else if(i===ans)cls+=' wrong';}
              return<button key={i} className={cls} onClick={()=>pick(i)} disabled={ans!==null}>
                <span className="opt-ic">{ans!==null&&i===q.correct?'✓':ans!==null&&i===ans?'✗':['A','B','C','D'][i]}</span>{o}
              </button>;
            })}
          </div>
          {ans!==null&&(
            <div style={{background:ans===q.correct?'var(--gl)':'var(--rl)',border:`2px solid ${ans===q.correct?'var(--g)':'var(--r)'}`,borderRadius:16,padding:16}}>
              <div style={{fontWeight:900,fontSize:16,color:ans===q.correct?'var(--gd)':'var(--r)',marginBottom:8}}>
                {ans===q.correct?'✅ Parfait ! +20 XP':'❌ Pas tout à fait...'}
              </div>
              <div style={{fontSize:13,fontWeight:600,color:'var(--txt)',lineHeight:1.7,marginBottom:8}}>{q.explanation}</div>
              {q.funfact&&<div style={{background:'rgba(28,176,246,.1)',border:'2px solid var(--bl)',borderRadius:12,padding:10,fontSize:12,fontWeight:700,color:'var(--bd)',marginBottom:8}}>💡 Fun fact : {q.funfact}</div>}
              {q.source&&<div style={{fontSize:11,color:'var(--gray3)',fontWeight:700,fontStyle:'italic'}}>📚 {q.source}</div>}
              <button style={{marginTop:12,width:'100%',padding:14,background:'var(--b)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:'var(--f)'}} onClick={gen}>Question suivante →</button>
            </div>
          )}
        </div>
      )}
      {q?.error&&<div style={{padding:16,textAlign:'center',color:'var(--r)',fontWeight:700}}>Erreur de connexion. <button style={{color:'var(--b)',fontWeight:800,background:'none',border:'none',cursor:'pointer',fontFamily:'var(--f)'}} onClick={gen}>Réessayer</button></div>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════

function PageLearn({ gameState, dispatch, setLesson }) {
  const { completed, unitProgress } = gameState;
  const [giftModal, setGiftModal] = useState(null);

  const handleChestClick = (unit) => {
    const chestId = `chest_${unit.id}`;
    if (gameState.openedChests?.includes(chestId)) return;
    // Check if unit is complete
    const unitDone = unitProgress?.[unit.id] === unit.lessons.length;
    if (!unitDone) { return; }
    const xp = 30; const gems = 20;
    dispatch({ type: 'openChest', chestId, xp, gems });
    setGiftModal({ xp, gems });
  };

  return (
    <div className="cont">
      {giftModal && <GiftModal xp={giftModal.xp} gems={giftModal.gems} onClose={() => setGiftModal(null)} />}
      <div className="hdr">
        <div className="hdr-logo">🚁 DroneAcademy</div>
        <div className="hdr-stats">
          <span className="hstat"><span className="hstat-ic">🔥</span>{gameState.streak}</span>
          <span className="hstat"><span className="hstat-ic">💎</span>{gameState.gems}</span>
          <span className="hstat" style={{color:'var(--b)'}}><span className="hstat-ic">⚡</span>{gameState.xp}</span>
        </div>
      </div>

      <div className="sec-title">🎯 Défis du jour</div>
      {DAILY_CHALLENGES.map((dc,i)=>(
        <div className="daily-card" key={dc.id}>
          <div className="dc-top">
            <div className="dc-ic">{dc.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14}}>{dc.title}</div>
              <div style={{fontSize:12,color:'var(--gray3)',fontWeight:600,marginTop:2}}>{dc.desc}</div>
              <div style={{fontSize:11,fontWeight:800,color:'var(--b)',marginTop:4}}>+{dc.xp} XP · +{dc.gems}💎</div>
            </div>
            <button className="dc-btn" style={{background:gameState.dailyDone?.includes(dc.id)?'var(--gray)':'var(--g)',color:gameState.dailyDone?.includes(dc.id)?'var(--gray2)':'#fff'}}>
              {gameState.dailyDone?.includes(dc.id)?'✓ Fait':'Commencer'}
            </button>
          </div>
        </div>
      ))}

      {UNITS.map((unit,ui) => {
        const prevDone = ui === 0 || (unitProgress?.[UNITS[ui-1].id] === UNITS[ui-1].lessons.length);
        const unitDone = unitProgress?.[unit.id] === unit.lessons.length;
        const chestId = `chest_${unit.id}`;
        const chestOpened = gameState.openedChests?.includes(chestId);
        return (
          <div key={unit.id}>
            <div className="uhdr">
              <div className="upill" style={{'--c':unit.color}}>
                {unit.icon} Unité {ui+1}
              </div>
              <div className="utitle">{unit.title}</div>
              <div className="usub">{unit.lessons.length} leçons · {unit.lessons.reduce((a,l)=>a+l.xp,0)} XP</div>
            </div>
            <div className="path-col">
              {unit.lessons.map((lesson,li) => {
                const lessonDone = completed.includes(lesson.id);
                const prevLessonDone = li === 0 ? prevDone : completed.includes(unit.lessons[li-1].id);
                const available = prevLessonDone && !lessonDone;
                const status = lessonDone?'done':available?'available':'locked';
                const stars = gameState.stars?.[lesson.id] || 0;
                const isLast = li === unit.lessons.length - 1;

                return (
                  <div key={lesson.id} className="pnode-wrap">
                    {li > 0 && <div className={`pline${completed.includes(unit.lessons[li-1].id)?` done`:''}`} style={completed.includes(unit.lessons[li-1].id)?{'--c':unit.color}:{}}></div>}
                    <div
                      className={`pn ${status}`}
                      style={{'--c':unit.color,'--cd':unit.color+'cc'}}
                      onClick={()=>status!=='locked'&&setLesson({lesson,unit})}
                    >
                      {status==='locked'?'🔒':lessonDone?'✓':lesson.icon}
                      {status==='available'&&<div className="pn-crown">👑</div>}
                      {lessonDone&&stars>0&&<div className="pn-stars">{'⭐'.repeat(stars)}</div>}
                    </div>
                    <div className="pn-lbl">{lesson.title}</div>
                    {isLast && (
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                        <div className="pline" style={lessonDone?{background:unit.color}:{}}></div>
                        <div
                          className={`chest${chestOpened?' opened':''}`}
                          onClick={() => handleChestClick(unit)}
                          title={chestOpened ? 'Coffre ouvert' : unitDone ? 'Cliquer pour ouvrir !' : 'Termine toutes les leçons'}
                        >
                          {chestOpened ? '📦' : unitDone ? '🎁' : '🔒'}
                        </div>
                        {unitDone && !chestOpened && (
                          <div style={{fontSize:10,fontWeight:800,color:'var(--or)',marginTop:3,textAlign:'center'}}>Tap pour ouvrir !</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PagePractice({ gameState, dispatch }) {
  const [mode,setMode]=useState('fpv3d');
  const MODES=[
    {id:'fpv3d',l:'🚁 FPV 3D'},
    {id:'viewer',l:'🔬 Maquettes 3D'},
    {id:'ai',l:'🤖 Quiz IA'},
    {id:'rapid',l:'⚡ Quiz Express'},
  ];
  const [qi,setQi]=useState(0);
  const [ans,setAns]=useState(null);
  const [timer,setTimer]=useState(15);
  const [score,setScore]=useState({ok:0,tot:0});
  const timerRef=useRef(null);
  const allQ = UNITS.flatMap(u=>u.lessons.flatMap(l=>l.exercises.filter(e=>e.type==='mcq')));
  const q = allQ[qi % allQ.length];

  useEffect(()=>{
    if(mode!=='rapid')return;
    setTimer(15);
    timerRef.current=setInterval(()=>{
      setTimer(t=>{if(t<=1){setAns(-1);clearInterval(timerRef.current);return 0;}return t-1;});
    },1000);
    return()=>clearInterval(timerRef.current);
  },[qi,mode]);

  const pickR=i=>{
    if(ans!==null)return;
    clearInterval(timerRef.current);setAns(i);
    if(i===q.ok){dispatch({type:'addXP',xp:10});setScore(s=>({ok:s.ok+1,tot:s.tot+1}));}
    else setScore(s=>({...s,tot:s.tot+1}));
  };

  const nextQ=()=>{setQi(i=>(i+1)%allQ.length);setAns(null);};

  return(
    <div className="cont">
      <div className="hdr">
        <div className="hdr-logo">💪 Entraînement</div>
        <div className="hdr-stats">
          <span className="hstat"><span className="hstat-ic">💎</span>{gameState.gems}</span>
          <span className="hstat" style={{color:'var(--b)'}}><span className="hstat-ic">⚡</span>{gameState.xp}</span>
        </div>
      </div>
      <div style={{display:'flex',gap:8,padding:'12px 16px',overflowX:'auto'}}>
        {MODES.map(m=>(
          <button key={m.id}
            style={{padding:'10px 16px',borderRadius:20,border:'2px solid',borderColor:mode===m.id?'var(--b)':'var(--gray)',background:mode===m.id?'var(--b)':'var(--bg)',color:mode===m.id?'#fff':'var(--txt)',fontWeight:800,fontSize:13,cursor:'pointer',fontFamily:'var(--f)',whiteSpace:'nowrap'}}
            onClick={()=>{setMode(m.id);setAns(null);}}>
            {m.l}
          </button>
        ))}
      </div>

      {mode==='fpv3d'&&(
        <FPV3DGame
          onXP={xp=>dispatch({type:'addXP',xp})}
          onBest={score=>dispatch({type:'updateFPV',score})}
        />
      )}
      {mode==='viewer'&&<Drone3DViewer />}
      {mode==='ai'&&<AIQuiz onXP={xp=>dispatch({type:'addXP',xp})}/>}
      {mode==='rapid'&&(
        <div className="aiq-wrap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--gray3)'}}>{score.tot} questions · ✓ {score.ok}</span>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:100,height:8,background:'var(--gray)',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',background:timer>7?'var(--g)':timer>3?'var(--y)':'var(--r)',width:`${timer/15*100}%`,transition:'width 1s linear',borderRadius:4}}></div>
              </div>
              <span style={{fontWeight:900,fontSize:15,color:timer>7?'var(--g)':timer>3?'var(--yd)':'var(--r)',width:24}}>{timer}s</span>
            </div>
          </div>
          <div className="qq-q">{q.q}</div>
          <div className="opts" style={{marginBottom:14}}>
            {q.opts.map((o,i)=>{
              let cls='opt';
              if(ans!==null){if(i===q.ok)cls+=' correct';else if(i===ans)cls+=' wrong';}
              return<button key={i} className={cls} onClick={()=>pickR(i)} disabled={ans!==null}>
                <span className="opt-ic">{ans!==null&&i===q.ok?'✓':ans!==null&&i===ans?'✗':['A','B','C','D'][i]}</span>{o}
              </button>;
            })}
          </div>
          {ans!==null&&(
            <div style={{background:ans===q.ok?'var(--gl)':'var(--rl)',borderRadius:16,padding:16,border:`2px solid ${ans===q.ok?'var(--g)':'var(--r)'}`}}>
              <b style={{color:ans===q.ok?'var(--gd)':'var(--r)',fontSize:16}}>{ans===q.ok?'✅ +10 XP !':ans===-1?'⏱ Temps écoulé !':'❌ Pas tout à fait...'}</b>
              <div style={{fontSize:13,marginTop:6,color:'var(--txt)',lineHeight:1.6}}>{q.exp}</div>
              <button style={{marginTop:12,width:'100%',padding:14,background:'var(--b)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:'var(--f)'}} onClick={nextQ}>Question suivante →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageShop({ gameState, dispatch }) {
  const [toast,setToast]=useState(null);
  const buy=item=>{
    if(gameState.gems<item.cost){setToast('💎 Pas assez de gemmes !');setTimeout(()=>setToast(null),2000);return;}
    dispatch({type:'buy',item});
    setToast(`✅ ${item.title} acheté !`);setTimeout(()=>setToast(null),2000);
  };
  return(
    <div className="cont">
      <div className="hdr">
        <div className="hdr-logo">🏪 Boutique</div>
        <div className="hdr-stats">
          <span className="hstat" style={{color:'var(--b)'}}><span className="hstat-ic">💎</span>{gameState.gems} gemmes</span>
          <span className="hstat"><span className="hstat-ic">❤️</span>{gameState.hearts}/5</span>
        </div>
      </div>
      {toast&&<div className="toast">{toast}</div>}
      <div style={{padding:'16px 16px 8px',background:'linear-gradient(135deg,#58CC02,#45A800)',margin:'0 16px 16px',borderRadius:20,textAlign:'center',color:'#fff'}}>
        <div style={{fontSize:40,marginBottom:6}}>💎</div>
        <div style={{fontSize:18,fontWeight:900}}>Tu as {gameState.gems} gemmes</div>
        <div style={{fontSize:13,fontWeight:700,opacity:.85,marginTop:4}}>Gagne des gemmes en terminant des leçons !</div>
      </div>
      <div className="sec-title">Articles disponibles</div>
      {SHOP_ITEMS.map(item=>(
        <div className="shop-item" key={item.id}>
          <div className="si-ic">{item.icon}</div>
          <div className="si-info">
            <div className="si-title">{item.title}</div>
            <div className="si-desc">{item.desc}</div>
          </div>
          <button className={`si-btn${gameState.gems<item.cost?' cant':''}`} onClick={()=>buy(item)}>
            💎 {item.cost}
          </button>
        </div>
      ))}
      <div className="sec-title">Comment gagner des gemmes 💡</div>
      {[['✅ Terminer une leçon','5-20 💎'],['⭐ Leçon parfaite','20 💎'],['🔥 Streak quotidien','10 💎/jour'],['🎁 Coffres d\'unité','20 💎'],['🤖 Quiz IA correct','5 💎']].map(([a,b],i)=>(
        <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1.5px solid var(--bg2)',fontWeight:700,fontSize:14}}>
          <span>{a}</span><span style={{color:'var(--b)'}}>{b}</span>
        </div>
      ))}
    </div>
  );
}

function PageLeaderboard({ gameState }) {
  const myXP = gameState.xp;
  const myPos = LB_DATA.findIndex(p=>p.xp<myXP);
  const myRank = myPos===-1?LB_DATA.length+1:myPos+1;
  const getRankStyle = r => r===1?'gold':r===2?'silver':r===3?'bronze':'';

  return(
    <div className="cont">
      <div className="hdr">
        <div className="hdr-logo">🏆 Classement</div>
        <div className="hdr-stats">
          <span className="hstat" style={{color:'var(--b)'}}><span className="hstat-ic">⚡</span>{gameState.xp} XP</span>
        </div>
      </div>
      <div style={{padding:'14px 16px',background:'linear-gradient(135deg,#FFD900,#E6C300)',margin:'0 16px 16px',borderRadius:20,textAlign:'center'}}>
        <div style={{fontSize:13,fontWeight:900,color:'#5a4000',textTransform:'uppercase',letterSpacing:.5}}>Ta position</div>
        <div style={{fontSize:40,fontWeight:900,color:'#3a2800'}}>#{myRank}</div>
        <div style={{fontSize:13,fontWeight:700,color:'#5a4000'}}>{myXP} XP cette semaine</div>
      </div>
      <div className="sec-title">Top Pilotes — Cette semaine</div>
      <div className="lb-row lb-me">
        <div className="lb-rank" style={{color:'var(--b)'}}>#{myRank}</div>
        <div className="lb-ava">🧑‍✈️</div>
        <div className="lb-name">Toi 🫵</div>
        <span className="lb-flag">🇫🇷</span>
        <div className="lb-xp">{myXP} XP</div>
      </div>
      {LB_DATA.map((p,i)=>(
        <div className="lb-row" key={i}>
          <div className={`lb-rank ${getRankStyle(i+1)}`}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
          <div className="lb-ava">{p.ava}</div>
          <div className="lb-name">{p.name}</div>
          <span className="lb-flag">{p.flag}</span>
          <div className="lb-xp">{p.xp} XP</div>
        </div>
      ))}
    </div>
  );
}

function PageProfile({ gameState }) {
  const xpLvl = gameState.xp % 300;
  const earnedAch = ACHIEVEMENTS.filter(a => { try { return a.req(gameState); } catch { return false; } });

  const ROADMAP = [
    {t:'Formation A1/A3 DGAC (en ligne, gratuit)',done:gameState.xp>50},
    {t:'Maîtriser physique & électronique drone',done:gameState.xp>150},
    {t:'Simulateur FPV (Liftoff, Velocidrone)',done:gameState.fpvBest>5},
    {t:'Construire son 1er drone DIY',done:false},
    {t:'Lycée BAC Général (Maths, Physique, NSI)',done:false},
    {t:'BTS Électronique / DUT GEII / CPGE',done:false},
    {t:"École d'ingénieur (ISAE, ENAC, Centrale...)",done:false},
  ];

  return(
    <div className="cont">
      <div className="prof-head">
        <div className="prof-ava">🧑‍✈️</div>
        <div className="prof-name">Pilote Niveau {gameState.level}</div>
        <div className="prof-lvl">Futur Ingénieur Drone 🚀</div>
        <div className="xpbar-wrap"><div className="xpbar-fill" style={{width:`${xpLvl/300*100}%`}}></div></div>
        <div className="xpbar-lbl">{xpLvl} / 300 XP → Niveau {gameState.level+1}</div>
      </div>
      <div className="stats-grid">
        {[['⚡',gameState.xp,'XP Total'],['🔥',gameState.streak,'Streak'],['❤️',`${gameState.hearts}/5`,'Cœurs'],['💎',gameState.gems,'Gemmes'],['📚',gameState.lessonsCompleted,'Leçons'],['⭐',Object.values(gameState.stars||{}).reduce((a,b)=>a+b,0),'Étoiles']].map(([ic,v,l])=>(
          <div className="sstat" key={l}><div className="sstat-v">{ic} {v}</div><div className="sstat-l">{l}</div></div>
        ))}
      </div>

      <div className="sec-title">🏅 Badges ({earnedAch.length}/{ACHIEVEMENTS.length})</div>
      <div className="ach-grid">
        {ACHIEVEMENTS.map(a=>{
          let earned=false;try{earned=a.req(gameState);}catch{}
          return(
            <div key={a.id} className={`ach${earned?' earned':''}`} title={a.desc}>
              <div className="ach-ic" style={{filter:earned?'none':'grayscale(1) opacity(.35)'}}>{a.icon}</div>
              <div className="ach-t">{a.title}</div>
              <div className="ach-d">{a.desc}</div>
              {earned&&<div style={{fontSize:9,color:'var(--yd)',fontWeight:900,marginTop:2}}>OBTENU ✓</div>}
            </div>
          );
        })}
      </div>

      <div className="sec-title">🗺️ Parcours Ingénieur Drone</div>
      <div style={{padding:'0 16px 16px'}}>
        {ROADMAP.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:12,marginBottom:14,alignItems:'flex-start'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:s.done?'var(--g)':'var(--bg)',border:`2.5px solid ${s.done?'var(--g)':'var(--gray)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:s.done?'#fff':'var(--gray2)',flexShrink:0}}>
              {s.done?'✓':i+1}
            </div>
            <div style={{flex:1,paddingTop:3}}>
              <div style={{fontSize:14,fontWeight:700,color:s.done?'var(--gd)':'var(--txt)'}}>{s.t}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{margin:'0 16px 24px',background:'linear-gradient(135deg,#DDF4FF,#BDE8FF)',border:'2px solid var(--bl)',borderRadius:20,padding:18,textAlign:'center'}}>
        <div style={{fontSize:30,marginBottom:8}}>💡</div>
        <div style={{fontSize:14,fontWeight:800,color:'var(--bd)',marginBottom:6}}>Conseil du jour</div>
        <div style={{fontSize:13,fontWeight:600,color:'var(--txt)',lineHeight:1.6}}>Concentre-toi sur les maths et la physique ! C'est la base de tout ce que tu aimeras faire dans l'aéronautique.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// APP PRINCIPALE
// ═══════════════════════════════════════════════

const PAGES = [
  {id:'learn',ic:'📚',l:'Apprendre'},
  {id:'practice',ic:'🏋️',l:'Pratiquer'},
  {id:'shop',ic:'🏪',l:'Boutique'},
  {id:'leaderboard',ic:'🏆',l:'Classement'},
  {id:'profile',ic:'👤',l:'Profil'},
];

export default function DroneAcademy() {
  const [gs, setGs] = useState(initState);
  const [page, setPage] = useState('learn');
  const [activeLesson, setActiveLesson] = useState(null);
  const [toast, setToast] = useState(null);
  const [badgePop, setBadgePop] = useState(null);

  const doDispatch = useCallback((action) => {
    setGs(s => reducer(s, action));
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null),2000);
  },[]);

  useEffect(() => {
    const earned = ACHIEVEMENTS.filter(a => { try{return a.req(gs);}catch{return false;} });
    const prev = ACHIEVEMENTS.filter(a => { try{return a.req({...gs,xp:gs.xp-1,lessonsCompleted:gs.lessonsCompleted-1});}catch{return false;} });
    const newBadge = earned.find(a=>!prev.find(p=>p.id===a.id));
    if(newBadge) { setBadgePop(newBadge); setTimeout(()=>setBadgePop(null),3000); }
  }, [gs.xp, gs.lessonsCompleted]);

  const handleLessonComplete = useCallback((xpEarned, stars, perfect, lesson, unit) => {
    doDispatch({ type:'completeLesson', lessonId:lesson.id, unitId:unit.id, xpEarned, stars, perfect });
    setActiveLesson(null);
    showToast(`+${xpEarned} XP ${perfect?'· Leçon parfaite ! ⭐⭐⭐':''}`);
  },[doDispatch, showToast]);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {toast&&<div className="toast">{toast}</div>}
        {badgePop&&<div className="badgepop">{badgePop.icon} Badge débloqué : {badgePop.title} !</div>}

        {activeLesson && (
          <LessonFlow
            lesson={activeLesson.lesson}
            unitColor={activeLesson.unit.color}
            onClose={()=>setActiveLesson(null)}
            onComplete={(xp,stars,perfect)=>handleLessonComplete(xp,stars,perfect,activeLesson.lesson,activeLesson.unit)}
          />
        )}

        {page==='learn'&&<PageLearn gameState={gs} dispatch={doDispatch} setLesson={setActiveLesson}/>}
        {page==='practice'&&<PagePractice gameState={gs} dispatch={doDispatch}/>}
        {page==='shop'&&<PageShop gameState={gs} dispatch={doDispatch}/>}
        {page==='leaderboard'&&<PageLeaderboard gameState={gs}/>}
        {page==='profile'&&<PageProfile gameState={gs}/>}

        <nav className="bnav">
          {PAGES.map(p=>(
            <button key={p.id} className={`nbi${page===p.id?' act':''}`} onClick={()=>setPage(p.id)}>
              <span className="nbi-ic">{p.ic}</span>{p.l}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
