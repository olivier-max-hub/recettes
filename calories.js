/* Livre de recettes / Cookapli — moteur d'estimation des calories (outil indicatif, sans aucune valeur médicale)
   Partagé par le Livre de recettes (index.html) et l'accueil Cookapli (carrousel « Besoin d'inspiration ? »).
   Chaque ligne d'ingrédient est lue (quantité + unité + aliment), convertie en grammes, puis multipliée par une valeur
   moyenne en kcal pour 100 g (ordres de grandeur inspirés de la table Ciqual). Pour corriger une valeur ou ajouter
   un aliment, il suffit de modifier la liste ALIM ci-dessous. */
/* A(motif sans accents, kcal pour 100 g, options) — p : poids d'une pièce (g) ; d : densité (g/ml) ; cs : g par cuillère à soupe ;
   kv : kcal pour 100 ml quand l'aliment est mesuré en volume ; u : poids (ou ml pour brique/verre) d'une unité particulière ; neg : négligeable */
function A(re,k,o){o=o||{};o.re=re;o.k=k;return o}
var ALIM=[
 A(/vinaigre balsamique|creme de balsamique|\bbalsamique/,100,{cs:15,d:1.1}),
 A(/vinaigre/,20,{cs:15,d:1}),
 A(/bouillon|fond de (?:veau|volaille|boeuf)|fumet/,250,{kv:5,cs:10,u:{cube:10,tablette:10,sachet:10}}),
 A(/thon a l'huile/,190,{u:{boite:140}}),
 A(/sardines?|maquereaux?/,200,{p:40,u:{boite:100}}),
 A(/anchois/,200,{p:4}),
 A(/tomates? sechees?/,250,{p:8}),
 A(/beurre de cacahuetes?|beurre d'arachide|peanut butter/,600,{cs:16}),
 A(/(?<!a l')\bhuile/,900,{d:.92,cs:13,u:{filet:5,trait:5}}),
 A(/petits? beurres?/,450,{p:8,u:{paquet:200}}),
 A(/\bbeurre/,745,{cs:15,u:{noix:10,noisette:5,plaquette:250}}),
 A(/tofu soyeux/,55,{cs:15}),
 A(/\btofu|tempeh/,130,{p:200}),
 A(/\bmiso\b/,200,{cs:18,cc:6}),
 A(/\balgues?\b|wakame|\bnori\b|kombu/,200,{cs:3,u:{feuille:3}}),
 A(/margarine/,700,{cs:15,u:{noix:10,noisette:5}}),
 A(/saindoux|graisse de canard|graisse d'oie/,900,{cs:13}),
 A(/chocolat blanc/,560,{u:{tablette:100,carre:5}}),
 A(/chocolat|pepites/,540,{u:{tablette:200,carre:5}}),
 A(/cacao/,380,{cs:7}),
 A(/nutella|pate a tartiner/,540,{cs:20}),
 A(/creme de coco|lait de coco/,190,{d:1,u:{boite:400,brique:200}}),
 A(/creme de marrons?/,240,{cs:20,u:{boite:250}}),
 A(/\bcreme\b.*(?:legere|allegee|15 ?%|light)/,150,{d:1,cs:15,u:{brique:200,pot:200}}),
 A(/\bcreme\b(?! (?:de |d'|glacee|anglaise|patissiere|brulee|dessert))/,290,{d:1,cs:15,u:{brique:200,pot:200}}),
 A(/lait concentre/,330,{d:1.3,u:{boite:397}}),
 A(/lait en poudre/,500,{cs:8}),
 A(/lait d'amande|lait d'avoine|lait de soja|lait de riz|boisson vegetale/,40,{d:1,u:{brique:1000}}),
 A(/lait entier/,65,{d:1.03,u:{brique:1000}}),
 A(/\blait\b/,47,{d:1.03,u:{brique:1000}}),
 A(/fromage blanc|faisselle/,75,{cs:20,u:{pot:500}}),
 A(/skyr/,60,{p:150,u:{pot:150}}),
 A(/yaourt grec|yaourt a la grecque/,120,{p:150,u:{pot:150}}),
 A(/yaourt|yogourt|yoghourt/,60,{p:125,u:{pot:125}}),
 A(/petits?[- ]suisses?/,140,{p:60}),
 A(/mascarpone/,420,{cs:20,u:{pot:250,barquette:250}}),
 A(/ricotta/,140,{cs:20,u:{pot:250}}),
 A(/mozzarella/,250,{p:125,u:{boule:125,sachet:125}}),
 A(/burrata/,300,{p:125}),
 A(/parmesan|parmigiano|grana padano|pecorino/,390,{cs:6}),
 A(/gruyere|emmental|comte|beaufort|fromage rape|cheddar|gouda|mimolette|abondance|cantal|tomme/,390,{cs:6,u:{tranche:20}}),
 A(/\bfeta/,265,{p:200,u:{bloc:200,paquet:200}}),
 A(/chevre/,300,{p:150,u:{buche:180,crottin:60,tranche:15,rondelle:15}}),
 A(/roquefort|agur|\bbleus?\b|gorgonzola|fourme/,360,{}),
 A(/camembert|\bbrie\b|coulommiers|reblochon|munster|maroilles|vacherin|mont d'or/,310,{p:250,u:{tranche:20}}),
 A(/raclette/,340,{u:{tranche:30}}),
 A(/fromage frais|philadelphia|st moret|saint moret|cream cheese|carre frais|boursin|kiri|vache qui rit/,250,{cs:20,u:{pot:150,boite:150}}),
 A(/fromage/,330,{u:{tranche:20}}),
 A(/vin (?:blanc|rouge|rose)|\bvins?\b|porto|madere|martini/,80,{d:1,u:{verre:150}}),
 A(/cidre|bieres?/,45,{d:1}),
 A(/cognac|rhum|vermouth|armagnac|calvados|whisky|vodka|kirsch|grand marnier|cointreau|amaretto|liqueur|alcool|eau[- ]de[- ]vie/,230,{d:.95}),
 A(/jus d'oranges?|jus de pommes?|jus de fruits?|jus d'ananas|jus de raisin/,45,{d:1}),
 A(/jus de citron/,25,{d:1}),
 A(/jaunes? d'?oeufs?|^jaunes?$/,330,{p:18}),
 A(/blancs? d'?oeufs?|^blancs?$/,47,{p:33}),
 A(/\boeufs?\b/,140,{p:55}),
 A(/fecule|maizena|amidon/,350,{cs:10,d:.6}),
 A(/farine/,345,{cs:10,d:.55}),
 A(/sucre glace/,400,{cs:8,d:.55}),
 A(/sucre vanill/,400,{cs:12,u:{sachet:7.5}}),
 A(/sucre|cassonade|vergeoise|rapadura|muscovado/,400,{cs:13,d:.85,u:{morceau:5}}),
 A(/\bmiel/,320,{cs:20,d:1.4}),
 A(/sirop/,270,{cs:20,d:1.3}),
 A(/confiture|gelee de|marmelade/,250,{cs:20,u:{pot:350}}),
 A(/levure (?:de )?boulang|levure fraiche|levure seche|levure du boulanger|levure deshydratee/,100,{u:{sachet:8,cube:42}}),
 A(/levure maltee|flocons de levure|levure nutritionnelle|levure en paillettes/,340,{cs:5,cc:2}),
A(/\blevure\b(?! chimique)/,100,{u:{sachet:10}}),
 A(/gelatine|agar/,340,{u:{feuille:2,sachet:2}}),
 A(/amandes?/,620,{cs:8,p:1.2}),
 A(/noisettes?/,650,{cs:8,p:1.5}),
 A(/noix de coco|\bcoco\b/,650,{cs:6}),
 A(/noix de cajou|cajou/,590,{p:1.5}),
 A(/noix de pecan|pecan/,700,{p:4}),
 A(/saint[- ]jacques|st[- ]jacques/,90,{p:30}),
 A(/\bnoix\b(?! de (?:muscade|beurre|margarine))/,690,{cs:7,p:5}),
 A(/\bpignons?/,680,{cs:10}), /* \b : « champignons » contient « pignons » */
 A(/pistaches?/,600,{cs:10}),
 A(/cacahuetes?|arachides?/,600,{cs:10}),
 A(/graines? de (?:sesame|lin|courge|tournesol|chia|pavot)|\bsesame/,580,{cs:9}),
 A(/tahin|puree de sesame/,600,{cs:15}),
 A(/raisins? secs?/,300,{cs:12}),
 A(/dattes?/,280,{p:8}),
 A(/abricots? secs?|pruneaux?|figues? seches?/,250,{p:10}),
 A(/flocons? d'avoine|\bavoine|muesli|granola/,370,{cs:6,d:.4}),
 A(/biscottes?/,400,{p:9}),
 A(/speculoos|biscuits?|\bsables?\b|boudoirs?|palets?|cookies?|galettes? bretonnes?|crackers?|gaufrettes?|meringues?/,450,{p:8,u:{paquet:200}}),
 A(/chapelure|panure/,380,{cs:8}),
 A(/pates? (?:feuilletees?|brisees?|sablees?|a tarte)/,400,{p:230,u:{rouleau:230}}),
 A(/pates? a pizza/,260,{p:260,u:{rouleau:260}}),
 A(/feuilles? de brick|\bbrick|filo|phyllo/,300,{p:10,u:{feuille:10,paquet:170}}),
 A(/tortillas?|wraps?|galettes? de ble/,300,{p:60}),
 A(/pains? (?:de mie|burger|hamburger|a burger|hot dog|pita)|\bbuns?\b|pitas?/,280,{p:60,u:{tranche:25}}),
 A(/baguettes?/,270,{p:250,u:{tranche:15}}),
 A(/brioches?/,360,{p:400,u:{tranche:30}}),
 A(/croutons?/,400,{cs:5}),
 A(/\bpains?\b/,260,{p:250,u:{tranche:35}}),
 A(/gnocchis?/,150,{u:{paquet:500}}),
 A(/ravioli|tortellini|raviole/,250,{u:{paquet:250}}),
 A(/bechamel/,120,{cs:15}),
A(/\b(?:pates|spaghettis?|tagliatelles?|penne|macaronis?|coquillettes|fusilli|farfalles?|linguine|nouilles|vermicelles?|lasagnes?|cannellonis?|conchiglie|orzo|rigatoni)\b/,355,{u:{paquet:500,feuille:20,tube:10,tubes:10}}),
 A(/\briz\b/,350,{d:.85}),
 A(/semoule|couscous|boulgour|quinoa|polenta|\bebly|\bble\b/,360,{d:.75}),
 A(/pois chiches? secs|haricots? secs/,340,{d:.8}),
 A(/lentilles?|pois casses/,330,{d:.8}),
 A(/pois chiches?|haricots? (?:rouges|blancs|noirs|coco|tarbais)|flageolets?|\bfeves?\b/,120,{u:{boite:265,bocal:265}}),
 A(/petits? pois/,80,{u:{boite:280}}),
 A(/\bmais\b(?! aussi| pas)/,100,{u:{boite:285}}),
 A(/patates? douces?/,86,{p:300}),
 A(/pommes? de terre|\bpatates?\b|grenailles?/,80,{p:150}),
 A(/\bfrites/,150,{}),
 A(/lardons?|allumettes/,270,{u:{barquette:200,paquet:200}}),
 A(/bacon|poitrine fumee|pancetta|\blard\b/,280,{u:{tranche:15}}),
 A(/quenelles?/,200,{p:60}),
 A(/jambon (?:cru|de parme|de bayonne|serrano|sec)|coppa|bresaola|viande des grisons/,250,{u:{tranche:15}}),
 A(/jambon/,115,{u:{tranche:45}}),
 A(/chorizo|saucisson|salami/,450,{p:250,u:{tranche:5,rondelle:5}}),
 A(/merguez/,290,{p:60}),
 A(/chair a saucisse|saucisses?|chipolatas?|knacks?|francfort|morteau|montbeliard|boudin/,280,{p:80}),
 A(/steaks? haches?|viande hachee|hache de boeuf|boeuf hache|\bhache\b/,200,{p:125}),
 A(/foie gras/,450,{u:{tranche:40}}),
 A(/pate de campagne|rillettes|terrine/,320,{u:{tranche:40}}),
 A(/magrets?/,200,{p:350}),
 A(/canard|confit/,220,{p:250}),
 A(/(?:blancs?|filets?|escalopes?|aiguillettes?) de (?:poulet|dinde|volaille)|suprem/,115,{p:150}),
 A(/cuisses? de poulet|hauts? de cuisse|pilons?|ailes? de poulet/,190,{p:200}),
 A(/poulet|volaille|poularde|chapon|pintade|dinde/,150,{p:1400}),
 A(/lapin/,150,{p:1300}),
 A(/agneau|mouton|gigot/,220,{p:300}),
 A(/filet mignon/,140,{p:450}),
 A(/\bporc|cochon|echine|cotes? de porc|travers|jarret/,200,{p:200}),
 A(/\bveau|escalopes?/,150,{p:130}),
 A(/boeuf|bourguignon|paleron|macreuse|joue|bavette|entrecote|rumsteck|faux[- ]filet|onglet|steaks?|\broti/,170,{p:150}),
 A(/\bfoie|rognons?/,140,{}),
 A(/saumon fume|truite fumee/,180,{u:{tranche:25}}),
 A(/saumon|truite/,200,{p:130}),
 A(/thon/,120,{p:150,u:{boite:140}}),
 A(/crevettes?|gambas|langoustines?/,95,{p:15}),
 A(/sauce d'huitres?/,100,{cs:16}),
 A(/huitres?/,70,{p:15}),
 A(/moules?/,40,{}),
 A(/calamars?|encornets?|seiches?|poulpe/,80,{}),
 A(/surimi/,100,{p:15}),
 A(/cabillaud|colin|merlu|\blieu\b(?! de)|dos de|filets? de poisson|poissons?|haddock|merlan|\bsole\b|\bbar\b|dorade|daurade|lotte|eglefin|julienne|tilapia|panga/,85,{p:150}),
 A(/concentre de tomates?|double concentre/,90,{cs:16,u:{boite:70,tube:140}}),
 A(/tomates? (?:concassees|pelees|en des|en conserve)|coulis de tomates?|passata|puree de tomates?|pulpe de tomates?|sauce tomate/,30,{d:1,u:{boite:400,brique:500,bocal:500}}),
 A(/tomates? cerises?/,20,{p:15,u:{barquette:250}}),
 A(/tomates?/,20,{p:120}),
 A(/oignons? nouveaux?|cebettes?/,30,{p:20,u:{botte:150}}),
 A(/oignons?/,40,{p:100}),
 A(/echalotes?/,72,{p:25}),
 A(/\bail\b/,130,{p:5,u:{gousse:5,tete:40}}),
 A(/carottes?/,36,{p:100}),
 A(/courgettes?/,16,{p:250}),
 A(/aubergines?/,20,{p:300}),
 A(/poivrons?/,30,{p:150}),
 A(/concombres?/,12,{p:300}),
 A(/avocats?/,200,{p:150}),
 A(/champignons?|cepes?|girolles?|pleurotes?|shiitake/,25,{p:20,u:{barquette:250,boite:230}}),
 A(/epinards?|blettes?/,25,{u:{sachet:300}}),
 A(/brocolis?/,35,{p:400,u:{tete:400}}),
 A(/chou[- ]fleur/,30,{p:800}),
 A(/choux? de bruxelles/,45,{}),
 A(/\bchoux?\b/,30,{p:1000}),
 A(/pousses? de soja|germes? de soja/,30,{}),
 A(/poireaux?/,30,{p:150}),
 A(/celeri[- ]rave/,30,{p:600}),
 A(/celeri/,15,{p:40,u:{branche:40}}),
 A(/butternut|courges?|potiron|potimarron|citrouille/,40,{p:1000}),
 A(/radis/,15,{p:10,u:{botte:200}}),
 A(/betteraves?/,45,{p:150}),
 A(/endives?/,17,{p:120}),
 A(/fenouils?/,20,{p:250}),
 A(/navets?|panais/,40,{p:120}),
 A(/artichauts?/,40,{p:250}),
 A(/asperges?/,25,{p:20,u:{botte:500}}),
 A(/haricots? verts?/,30,{u:{boite:440}}),
 A(/salade|laitue|\bmache|roquette|mesclun|batavia|frisee|romaine|cresson|jeunes pousses/,15,{p:300,u:{sachet:125}}),
 A(/olives?/,150,{p:4,u:{bocal:150}}),
 A(/cornichons?/,20,{p:8}),
 A(/capres/,30,{cs:10}),
 A(/gingembre/,80,{u:{morceau:10,cm:5}}),
 A(/citrons? verts?/,30,{p:60}),
 A(/citrons?/,30,{p:100}),
 A(/compote/,70,{u:{pot:100}}),
 A(/\boranges?\b|clementines?|mandarines?/,45,{p:180}),
 A(/pamplemousses?/,40,{p:350}),
 A(/\bpommes?\b/,52,{p:150}),
 A(/\bpoires?\b/,55,{p:170}),
 A(/bananes?/,90,{p:120}),
 A(/fraises?/,32,{p:15,u:{barquette:250}}),
 A(/framboises?/,45,{u:{barquette:125}}),
 A(/airelles?|cranberr|canneberges?|myrtilles?|\bmures?\b|cassis|groseilles?|fruits rouges/,50,{u:{barquette:125}}),
 A(/cerises?/,60,{p:7}),
 A(/abricots?/,45,{p:45}),
 A(/\bpeches?\b|nectarines?|brugnons?/,40,{p:150}),
 A(/\bprunes?\b|mirabelles?|quetsches?/,50,{p:35}),
 A(/mangues?/,65,{p:400}),
 A(/ananas/,50,{p:1000,u:{boite:340,tranche:80}}),
 A(/kiwis?/,60,{p:80}),
 A(/\braisins?\b/,70,{u:{grappe:200}}),
 A(/rhubarbe/,20,{p:150,u:{tige:150}}),
 A(/figues?/,70,{p:50}),
 A(/melons?/,35,{p:800}),
 A(/pasteque/,30,{}),
 A(/mayonnaise/,700,{cs:15}),
 A(/moutarde(?! en grains| graines)/,150,{cs:15}),
 A(/ketchup/,110,{cs:17}),
 A(/pesto/,450,{cs:15,u:{pot:190}}),
 A(/sauce soja|\bsoja\b|tamari/,60,{cs:16,d:1.1}),
 A(/nuoc|sauce (?:de )?poisson/,40,{cs:16}),
 A(/sauce (?:barbecue|bbq|worcestershire|piquante)|harissa|tabasco|worcestershire/,100,{cs:16}),
 A(/\bcafe\b/,2,{d:1}),
 A(/\b(?:sel|poivre|eau|glacons?|bicarbonate|epices?|ras.el.hanout|cumin|curcuma|paprika|curry|cannelle|muscade|piments?|cayenne|herbes?|thym|romarin|laurier|origan|basilic|persil|coriandre|ciboulette|menthe|aneth|estragon|sauge|cerfeuil|safran|girofle|cardamome|badiane|anis|ras el hanout|colorant|aromes?|vanille|zestes?|fleur d'oranger|levure chimique|poudre a lever|garam|tandoori|sumac|zaatar|fenugrec|bouquet garni|citronnelle|graines de moutarde|chili|chicoree)\b/,0,{neg:1})
];
var KC_ML={ml:1,cl:10,dl:100,l:1000,verre:200,tasse:250,bol:300,louche:100,trait:5,brique:200};
var KC_GR={kg:1000,g:1,mg:.001};
var KC_DEFU={sachet:10,boite:400,pot:125,tranche:30,gousse:5,botte:150,bouquet:20,branche:5,brin:1,feuille:1,noix:10,noisette:5,poignee:30,zeste:2,cube:10,tablette:100,carre:5,barquette:250,rouleau:230,paquet:250,morceau:30,cm:5,tete:40,bocal:300,buche:180,crottin:60,rondelle:10,boule:125,bloc:200,plaquette:250,tube:140,grappe:200,tige:100,pincee:.5,pointe:.3};
var KC_UNITS=[["kg",/^(?:kg|kilos?|kilogrammes?)(?![a-z])\.?/],["mg",/^mg(?![a-z])/],["g",/^(?:g|gr|grs|grammes?)(?![a-z])\.?/],["ml",/^(?:ml|millilitres?)(?![a-z])/],["cl",/^(?:cl|centilitres?)(?![a-z])/],["dl",/^(?:dl|decilitres?)(?![a-z])/],["l",/^(?:l|litres?)(?![a-z'])/],["cs",/^cs(?![a-z])/],["cc",/^cc(?![a-z])/],
  ["*",/^(?:sachets?|boites?|conserves?|briques?|pots?|tranches?|gousses?|bottes?|bouquets?|branches?|brins?|feuilles?|noix(?= de (?:beurre|margarine))|noisettes?(?= de (?:beurre|margarine))|filets?(?= (?:d'huile|de vinaigre|de citron|de jus|de sirop|de creme|de miel|de lait|de sauce))|traits?|poignees?|zestes?|cubes?|tablettes?|carres?|barquettes?|rouleaux?|paquets?|morceaux?|cm|tetes?|bocal|bocaux|buches?|crottins?|rondelles?|boules?|blocs?|plaquettes?|tubes?|grappes?|tiges?|louches?|pincees?|pointes?|verres?|tasses?|bols?)(?![a-z])/]];
var KC_WN={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,douze:12,quelques:3};
function kcNorm(t){
  var s=String(t).replace(/½/g," 1/2").replace(/¼/g," 1/4").replace(/¾/g," 3/4").replace(/⅓/g," 1/3").replace(/⅔/g," 2/3").replace(/(\d)\s*\/\s*(\d)/g,"$1/$2")
    .normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/œ/g,"oe").replace(/æ/g,"ae").replace(/[’`´]/g,"'").replace(/\s+/g," ").trim();
  s=s.replace(/\b(?:un|une) demie?[- ]/g,"0.5 ").replace(/\bdemie?[- ](?=[a-z])/g,"0.5 ").replace(/\b(?:une )?dizaine (?:de |d')?/g,"10 ").replace(/\b(?:une )?douzaine (?:de |d')?/g,"12 ")
    .replace(/(^|\b(?:de|d')\s?)(un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|douze|quelques)\b(?!-)/g,function(a,p,w){return p+" "+KC_WN[w]+" "});
  s=s.replace(/\b(?:cuil+e?r?e?s?|cuil+)\.?\s*(?:a|de)?\s*soupe\b\.?/g," cs ").replace(/\b(?:cuil+e?r?e?s?|cuil+)\.?\s*(?:a|de)?\s*(?:cafe|the)\b\.?/g," cc ")
    .replace(/\bc\.?\s?a\.?\s?soupe\b/g," cs ").replace(/\bc\.?\s?a\.?\s?(?:cafe|the)\b/g," cc ").replace(/\bc\.?\s?a\.?\s?s\b\.?/g," cs ").replace(/\bc\.?\s?a\.?\s?c\b\.?/g," cc ").replace(/\bc\.\s?s\.?(?![a-z])/g," cs ").replace(/\bc\.\s?c\.?(?![a-z])/g," cc ")
    .replace(/\b(?:cas|tbsp|cuil+eres?|cuil+)\b\.?/g," cs ").replace(/\b(?:cac|tsp)\b\.?/g," cc ");
  s=s.replace(/(\d)\s+(?:grande?s?|petite?s?|grosse?s?|belles?|bonnes?)\s+(?=(?:tranches?|gousses?|poignees?|cs|cc|boites?|bottes?|branches?|feuilles?|tetes?|rondelles?|boules?|morceaux?|louches?|pincees?)\b)/g,"$1 "); /* « 4 grandes tranches » = 4 tranches */
  return s.replace(/\s+/g," ").trim()}
function kcFood(x){if(!x)return null;for(var i=0;i<ALIM.length;i++)if(ALIM[i].re.test(x))return ALIM[i];return null}
function kcUnit(u){return u.replace(/^bocaux$/,"bocal").replace(/^(rouleau|morceau)x$/,"$1").replace(/^conserves?$/,"boite").replace(/s$/,"")}
function kcNum(m){var v=parseFloat(m[1].replace(",","."));if(m[2])v+=(+m[2])/(+m[3]);else if(m[4])v=v/(+m[4]);if(m[5]){var v2=parseFloat(m[5].replace(",","."));v=v2<v?v2:(v+v2)/2}return v}  /* « 800 à 1 kg » : on garde la 2e valeur, qui porte l'unité */
/* analyse d'une ligne d'ingrédient : {t, g (grammes), k (kcal), st : ok | neg (négligeable) | nq (quantité non précisée) | inconnu} */
function kcLigne(t){
  var s=kcNorm(t),o={t:t,g:0,k:0,st:"inconnu"};
  /* ingrédient facultatif : jamais compté (calories ni budget), c'est à l'utilisateur de l'ajouter s'il le met */
  if(/facultati|falcultati|optionnel|pour servir/.test(s)){o.st="fac";return o}
  var paren=(s.match(/\(([^)]*)\)/g)||[]).join(" "),s2=s.replace(/\([^)]*\)/g," ").replace(/\s+/g," ").trim();
  var QR=/(\d+(?:[.,]\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?(?:\s*(?:a|-|–|ou)\s*(\d+(?:[.,]\d+)?)(?![\d\/]))?/g,m,q=null,before="",after=s2;
  while((m=QR.exec(s2))){var nx=s2.slice(m.index+m[0].length);if(/^\s*%/.test(nx)||/[a-z]$/.test(s2.slice(0,m.index)))continue;q=kcNum(m);before=s2.slice(0,m.index);after=nx;break}
  after=after.trim();var u=null,um;
  for(var i=0;i<KC_UNITS.length;i++){if((um=after.match(KC_UNITS[i][1]))){u=KC_UNITS[i][0]==="*"?kcUnit(um[0]):KC_UNITS[i][0];after=after.slice(um[0].length).trim();break}}
  var per=null,pm=u&&!KC_GR[u]&&!KC_ML[u]&&u!=="cs"&&u!=="cc"?after.match(/^(?:de |d')?\s*(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammes|cl|ml|l)\b/):null;
  if(pm){after=after.slice(pm[0].length).trim()}
  /* « 4 pavés de saumon de 150 g chacun » : poids unitaire donné après l'aliment */
  if(!pm&&!KC_GR[u]&&!KC_ML[u]&&u!=="cs"&&u!=="cc"){var pm2=after.match(/\bde\s+(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammes)\s+(?:chacun|chacune|piece|l'un|l'une)\b/);if(pm2)pm=[pm2[0],pm2[1],pm2[2]]}
  after=after.replace(/^(?:de la |de l'|des |du |de |d')\s*/,"");
  var f=kcFood(after)||kcFood((before+" "+after).trim())||kcFood(s);
  if(!f){o.st=q==null?"nq":"inconnu";return o}
  if(f.neg){o.st="neg";return o}
  var d=f.d||1,uu=f.u||{};
  function mass(n,un){n=parseFloat(String(n).replace(",","."));return KC_GR[un]?n*KC_GR[un]:/^(?:gr|grammes)$/.test(un)?n:n*(KC_ML[un]||1)*d}
  if(pm)per=mass(pm[1],pm[2]);
  var pg=null,pp=paren.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammes|cl|ml|l)\b/g);
  if(pp){var lm=pp[pp.length-1].match(/(\d+(?:[.,]\d+)?)\s*(kg|g|gr|grammes|cl|ml|l)\b/);pg=mass(lm[1],lm[2])}
  var total=/soit|total|en tout|environ/.test(paren)&&!/chacun|piece|par /.test(paren),g=null,ml=null;
  if(q==null){if(pg!=null&&!u){g=pg}else if(u){q=1}else{o.st="nq";return o}}
  if(g==null){
    if(KC_GR[u])g=q*KC_GR[u];
    else if(KC_ML[u])ml=q*(uu[u]||KC_ML[u]);
    else if(u==="cs"||u==="cc")g=q*(f.cs||15*d)/(u==="cc"?3:1);
    else if(u==="filet"){if(uu.filet)g=q*uu.filet;else ml=q*5}
    else if(u){g=pg!=null?(total?pg:q*pg):q*(per||uu[u]||KC_DEFU[u]||30)}
    else if(pg!=null)g=total?pg:q*pg;
    else if(per)g=q*per;
    else if(f.p&&f.p<10&&q>=50)g=q;  /* « 150 noix » : 150 g */
    else if(f.p)g=q*f.p;
    else if(q>=20)g=q;
    else{o.st="nq";return o}
  }
  if(ml!=null){o.k=f.kv!=null?ml*f.kv/100:ml*d*f.k/100;g=ml*d}else o.k=g*f.k/100;
  o.g=Math.round(g);o.k=Math.round(o.k);o.st="ok";return o}
function persNb(f){var m=String((f.m&&f.m.pers)||f.pers||"").match(/\d+/),n=m?+m[0]:0;
  if(!n){var m2=String(f.r||"").match(/(\d+)\s*(?:a\s*\d+\s*)?(?:pers|part|portion|convive|gourmand)/i);if(m2)n=+m2[1]}
  return n>0&&n<100?n:0}

/* estimations pour une fiche (format du tableau « Fiches ») : calories et budget par personne.
   Les lignes de sous-titre sont ignorées, sauf si elles commencent par une quantité.
   guess(texte) relie une ligne à un ingrédient du référentiel Friscan ; CookBudget vient de ../cookapli/budget.js. */
var CookCalc=(function(){
  function lignes(f){var out=[];(f&&f.ing||[]).forEach(function(it){var t=String(it.t||"").replace(/<[^>]*>/g," ").trim();if(!t)return;
    if(it.l&&(/:\s*$/.test(t)||!/^\s*(?:\d|[½¼¾⅓⅔]|une?\s|environ\s)/i.test(t)))return;out.push(t)});return out}
  function kcal(f){var L=lignes(f);if(!L.length)return 0;var tot=0,ok=0,ko=0,nq=0;
    L.forEach(function(t){var a=kcLigne(t);if(a.st==="ok"){tot+=a.k;ok++}else if(a.st==="inconnu")ko++;else if(a.st==="nq")nq++});
    var pers=persNb(f);return pers&&tot>0&&tot/pers<=3000&&ko+nq<=ok?Math.max(10,Math.round(tot/pers/10)*10):0}
  function budget(f,guess){if(typeof CookBudget==="undefined"||!CookBudget.pret()||!guess)return null;var L=lignes(f);if(!L.length)return null;var tot=0,ok=0,ko=0;
    L.forEach(function(t){var a=kcLigne(t),id=guess(t),e=id?CookBudget.prixKg(id):null;if(a.st==="fac")return;if(a.st==="neg")ok++;else if(a.st==="ok"&&e!=null){tot+=a.g/1000*e;ok++}else ko++});
    var pers=persNb(f);if(!pers||tot<=0||ko*3>ok)return null;var pp=tot/pers;return{pp:pp,niv:CookBudget.niveau(pp)}}
  return{kcal:kcal,budget:budget}})();
