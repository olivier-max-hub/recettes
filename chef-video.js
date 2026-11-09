/* Mes recettes — vidéo pas à pas avec Chef Léa ou Chef Hugo.
   Usage : ChefVideo.open(recette, indexEtape)
   recette = { name, cat, type, ingredients: [texte], steps: [texte], notes: [texte] }
   Une mini-vidéo par phrase : animation dessinée + voix de synthèse du navigateur + sous-titres. */
(function () {
"use strict";

/* ---------------- Styles (tout est préfixé .cv-) ---------------- */
var CSS = `
.cv-modal{position:fixed;inset:0;z-index:40;background:rgba(10,32,36,.62);display:flex;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px))}
.cv-modal[hidden]{display:none!important}
.cv-dialog{width:min(1180px,100%);max-height:100%;overflow:auto;background:#eef8fb;border-radius:22px;padding:12px 14px 14px;box-shadow:0 10px 40px rgba(0,0,0,.35);color:#1f2a24;font:1rem/1.5 "Economica","Arial Narrow",Arial,sans-serif}
.cv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px}
.cv-top b{font-size:1.35rem;line-height:1.15;color:#0f6b78;min-width:0}
.cv-x{flex:none;border:1px solid #0f6b78;background:#fff;color:#0f6b78;border-radius:99px;padding:6px 16px;font:inherit;cursor:pointer}
.cv-body{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:14px}
.cv-main{min-width:0;display:grid;gap:10px;align-content:start}
.cv-stage{position:relative;aspect-ratio:16/9;max-width:100%;border-radius:18px;overflow:hidden;background:#e9f6f8;box-shadow:0 3px 10px rgba(0,0,0,.12);container-type:inline-size}
.cv-stage>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.cv-badge{position:absolute;left:2.2%;top:3.5%;background:#0f6b78;color:#fff;border-radius:99px;padding:.25em .9em;font-size:clamp(12px,2.1cqw,19px);font-weight:700}
.cv-subs{position:absolute;left:50%;bottom:4%;transform:translateX(-50%);width:min(92%,860px);background:rgba(17,30,33,.8);color:#fff;border-radius:14px;padding:.45em .9em;font-size:clamp(13px,2.5cqw,23px);line-height:1.3;text-align:center;text-wrap:balance}
.cv-subs:empty{display:none}
.cv-clipbar{position:absolute;left:0;right:0;bottom:0;height:5px;background:rgba(15,107,120,.18)}
.cv-clipbar i{display:block;height:100%;width:0;background:#0f6b78}
.cv-ingr{position:absolute;right:3%;top:12%;width:44%;max-height:70%;overflow:hidden;background:rgba(255,255,255,.96);border-radius:16px;padding:.7em 1em;font-size:clamp(11px,1.9cqw,18px);line-height:1.35;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.cv-ingr[hidden]{display:none!important}
.cv-ingr h4{margin:0 0 .3em;color:#0f6b78;font-size:1.25em}
.cv-ingr ul{margin:0;padding-left:1.1em}
.cv-ingr li{opacity:0;animation:cvLine .4s ease forwards;animation-delay:var(--d)}
@keyframes cvLine{to{opacity:1}}
.cv-ov{position:absolute;inset:0;display:grid;place-items:center;background:rgba(233,246,248,.72);backdrop-filter:blur(2px);padding:3%}
.cv-ov[hidden]{display:none!important}
.cv-ov.light{backdrop-filter:none;background:rgba(233,246,248,.3)}
.cv-ovbox{text-align:center;display:grid;gap:.6em;justify-items:center;font-size:clamp(13px,2.3cqw,20px)}
.cv-ovbox h4{margin:0;font-size:1.7em;color:#0b4f59;line-height:1.1}
.cv-ovbox p{margin:0}
.cv-pick{display:flex;gap:1em;justify-content:center;flex-wrap:wrap}
.cv-pick button{border:2px solid transparent;background:#fff;border-radius:18px;padding:.4em .6em .6em;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.1);display:grid;justify-items:center;gap:.1em;color:#1f2a24;width:9.5em;font:inherit}
.cv-pick button:hover,.cv-pick button[aria-pressed=true]{border-color:#0f6b78}
.cv-pick svg{width:100%;height:auto;display:block}
.cv-pick b{font-size:1.15em;color:#0f6b78}
.cv-pick small{color:#5d6f73;font-size:.85em}
.cv-acts{display:flex;gap:.6em;flex-wrap:wrap;justify-content:center}
.cv-btn{border:1px solid #0f6b78;background:#0f6b78;color:#fff;border-radius:99px;padding:.45em 1.2em;font:inherit;font-size:1em;cursor:pointer;display:inline-flex;align-items:center;gap:.4em;line-height:1.2}
.cv-btn.alt{background:#fff;color:#0f6b78}
.cv-btn.big{font-size:1.15em;padding:.55em 1.6em}
.cv-btn svg,.cv-ctl svg{width:1em;height:1em;flex:none}
.cv-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.cv-grow{flex:1 1 auto}
.cv-ctl{border:1px solid #d3e6ea;background:#fff;color:#0b4f59;border-radius:99px;padding:7px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;line-height:1.2;font:inherit}
.cv-ctl.main{background:#0f6b78;border-color:#0f6b78;color:#fff;padding-inline:18px}
.cv-ctl:disabled{opacity:.45;cursor:default}
.cv-ctl[aria-pressed=false]{color:#5d6f73}
.cv-opts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:.9rem;color:#5d6f73}
.cv-opts label{display:inline-flex;gap:6px;align-items:center}
.cv-opts select{border:1px solid #d3e6ea;border-radius:10px;background:#fff;color:#1f2a24;padding:3px 8px;max-width:210px;font:inherit}
.cv-segs{display:flex;gap:3px;height:8px}
.cv-segs button{flex:1 1 0;min-width:0;border:0;padding:0;border-radius:4px;background:#d3e6ea;cursor:pointer;position:relative;overflow:hidden}
.cv-segs button i{position:absolute;inset:0 auto 0 0;width:0;background:#0f6b78}
.cv-segs button.gap{margin-left:5px}
.cv-chap{background:#fff;border:1px solid #d3e6ea;border-radius:18px;padding:10px;overflow:auto;align-self:start;max-height:min(70vh,560px)}
.cv-chap h4{margin:4px 6px 6px;font-size:1.15rem;color:#0f6b78}
.cv-chap ol{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.cv-chap .grp{margin:8px 6px 2px;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:#5d6f73}
.cv-chap button{width:100%;text-align:left;border:0;background:none;color:#1f2a24;border-radius:10px;padding:5px 8px;cursor:pointer;display:flex;gap:8px;align-items:baseline;font:inherit;font-size:.92rem;line-height:1.25}
.cv-chap button:hover{background:#eef8fb}
.cv-chap button[aria-current=true]{background:#e3f6f8;color:#0b4f59;font-weight:700}
.cv-chap .n{flex:none;width:1.4em;height:1.4em;border-radius:50%;display:inline-grid;place-items:center;background:#eef8fb;font-size:.8em;color:#0b4f59}
.cv-chap button[aria-current=true] .n{background:#0f6b78;color:#fff}
.cv-note{font-size:.85rem;color:#5d6f73;margin:0}
.cv-warn{color:#8a4b12}
.cv-modal :focus-visible{outline:3px solid #0f6b78;outline-offset:2px}
@media (max-width:860px){.cv-body{grid-template-columns:minmax(0,1fr)}.cv-chap{max-height:260px}}
@media (max-width:699px){.cv-modal{padding:0}.cv-dialog{border-radius:0;height:100%;max-height:none;padding:max(10px,env(safe-area-inset-top,0px)) max(10px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(10px,env(safe-area-inset-left,0px))}.cv-opts{width:100%}}

.cv-modal .cv-chef-f{--skin:#f6cfae;--skin2:#e9b48f;--hair:#8b3d22;--lips:#c8506a;--iris:#3f7a5c;--scarf:#ef8f7a}
.cv-modal .cv-chef-m{--skin:#dba67d;--skin2:#c68c63;--hair:#30241f;--lips:#a5574a;--iris:#5a3b25;--scarf:#0f6b78}
.cv-modal .sk{fill:var(--skin)}.cv-modal .sk2{fill:var(--skin2)}.cv-modal .hr{fill:var(--hair)}.cv-modal .lp{fill:var(--lips)}
.cv-modal .ir{fill:var(--iris)}.cv-modal .sc{fill:var(--scarf)}
.cv-modal .jk{fill:#fbfbf8;stroke:#cfdfe2;stroke-width:2}
.cv-modal .tq{fill:#fff;stroke:#cfdfe2;stroke-width:2}
.cv-modal .pip{fill:none;stroke:#0f6b78;stroke-width:2.5}
.cv-modal .btnj{fill:#0f6b78}
.cv-modal .emb{font:700 12px "Economica","Arial Narrow",Arial,sans-serif;fill:#0f6b78}
.cv-modal .brow{fill:none;stroke:var(--hair);stroke-linecap:round}
.cv-modal .lid{fill:none;stroke:#2a1d18;stroke-linecap:round;stroke-linejoin:round}
.cv-modal .nose{fill:none;stroke:var(--skin2);stroke-width:2.4;stroke-linecap:round}
.cv-modal .fd{fill:var(--food)}.cv-modal .fd2{fill:var(--food2)}.cv-modal .fdl{fill:var(--food3)}
.cv-modal .fds{fill:none;stroke:var(--food)}.cv-modal .fdk{stroke:var(--food2)}
.cv-modal .ch-body{animation:cvBreathe 3.4s ease-in-out infinite}
.cv-modal .ch-head{transform-origin:240px 228px;transition:transform .4s}
.cv-modal .cv-chef.talking .ch-head{animation:cvNod 1.3s ease-in-out infinite}
.cv-modal .eye{transform-box:fill-box;transform-origin:center;animation:cvBlink 5.2s infinite}
.cv-modal .ar-u,.cv-modal .ar-f{transform-origin:0 0;transform-box:view-box;transition:transform .55s cubic-bezier(.3,1.25,.5,1)}
.cv-modal .ar-u.r{transform:rotate(-14deg)}.cv-modal .ar-f.r{transform:rotate(-62deg)}
.cv-modal .ar-u.l{transform:rotate(14deg)}.cv-modal .ar-f.l{transform:rotate(62deg)}
.cv-modal .m1,.cv-modal .m2{display:none}
.cv-modal .cv-chef[data-mouth="1"] .m0,.cv-modal .cv-chef[data-mouth="2"] .m0{display:none}
.cv-modal .cv-chef[data-mouth="1"] .m1,.cv-modal .cv-chef[data-mouth="2"] .m2{display:inline}
.cv-modal .cv-t{display:none}
.cv-modal .cv-chef[data-tool=knife] .t-knife,.cv-modal .cv-chef[data-tool=spoon] .t-spoon,.cv-modal .cv-chef[data-tool=shaker] .t-shaker{display:inline}
.cv-modal .cv-chef[data-g=wave] .ar-u.r{transform:rotate(-152deg)}
.cv-modal .cv-chef[data-g=wave] .ar-f.r{animation:cvWave .7s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=point] .ar-u.r{animation:cvPoint 1.8s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=point] .ar-f.r{transform:rotate(-12deg)}
.cv-modal .cv-chef[data-g=chop] .ar-u.r{transform:rotate(-22deg)}
.cv-modal .cv-chef[data-g=chop] .ar-f.r{animation:cvChop .32s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=stir] .ar-u.r{animation:cvStirU 1.1s ease-in-out infinite}
.cv-modal .cv-chef[data-g=stir] .ar-f.r{animation:cvStirF 1.1s ease-in-out infinite}
.cv-modal .cv-chef[data-g=sprinkle] .ar-u.r{transform:rotate(-98deg)}
.cv-modal .cv-chef[data-g=sprinkle] .ar-f.r{animation:cvShake .22s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=pour] .ar-u.r{transform:rotate(-88deg)}
.cv-modal .cv-chef[data-g=pour] .ar-f.r{animation:cvTilt 1.6s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=spread] .ar-u.r{animation:cvSpreadU 1.3s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=spread] .ar-f.r{transform:rotate(-72deg)}
.cv-modal .cv-chef[data-g=explain] .ar-u.r{transform:rotate(-38deg)}
.cv-modal .cv-chef[data-g=explain] .ar-f.r{animation:cvExplain 1.5s ease-in-out infinite alternate}
.cv-modal .cv-chef[data-g=present] .ar-u.r{transform:rotate(-72deg)}.cv-modal .cv-chef[data-g=present] .ar-f.r{transform:rotate(-38deg)}
.cv-modal .cv-chef[data-g=present] .ar-u.l{transform:rotate(72deg)}.cv-modal .cv-chef[data-g=present] .ar-f.l{transform:rotate(38deg)}
@keyframes cvBreathe{50%{transform:translateY(2px)}}
@keyframes cvNod{0%,100%{transform:rotate(0)}30%{transform:rotate(-2.5deg)}70%{transform:rotate(2deg)}}
@keyframes cvBlink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
@keyframes cvWave{from{transform:rotate(-28deg)}to{transform:rotate(22deg)}}
@keyframes cvPoint{from{transform:rotate(-100deg)}to{transform:rotate(-110deg)}}
@keyframes cvChop{from{transform:rotate(-38deg)}to{transform:rotate(-96deg)}}
@keyframes cvStirU{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(-44deg)}}
@keyframes cvStirF{0%,100%{transform:rotate(-58deg)}50%{transform:rotate(-38deg)}}
@keyframes cvShake{from{transform:rotate(-28deg)}to{transform:rotate(-52deg)}}
@keyframes cvTilt{from{transform:rotate(-20deg)}to{transform:rotate(-48deg)}}
@keyframes cvSpreadU{from{transform:rotate(-10deg)}to{transform:rotate(-50deg)}}
@keyframes cvExplain{from{transform:rotate(-58deg)}to{transform:rotate(-96deg)}}

.cv-modal .scene{display:none}
.cv-modal .scene.on{display:inline;animation:cvIn .45s ease}
@keyframes cvIn{from{opacity:0}to{opacity:1}}
.cv-modal .pop{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:cvPop .45s cubic-bezier(.3,1.5,.5,1) forwards;animation-delay:var(--d,0s)}
@keyframes cvPop{to{transform:scale(1)}}
.cv-modal .knife{animation:cvKnife .32s ease-in-out infinite alternate}
@keyframes cvKnife{from{transform:translateY(0)}to{transform:translateY(46px)}}
.cv-modal .wobble{transform-box:fill-box;transform-origin:center bottom;animation:cvWob .5s ease-in-out infinite alternate}
@keyframes cvWob{from{transform:skewX(-4deg) scaleY(.97)}to{transform:skewX(4deg) scaleY(1.04)}}
.cv-modal .spin{transform-box:fill-box;transform-origin:center;animation:cvSpin .35s linear infinite}
.cv-modal .spin-slow{transform-box:fill-box;transform-origin:center;animation:cvSpin 2.4s linear infinite}
@keyframes cvSpin{to{transform:rotate(360deg)}}
.cv-modal .bits{transform-box:view-box;transform-origin:740px 270px;animation:cvSpin 1.1s linear infinite}
.cv-modal .stream{stroke-dasharray:16 10;animation:cvFlow .5s linear infinite}
@keyframes cvFlow{to{stroke-dashoffset:-26}}
.cv-modal .grow{transform-box:fill-box;transform-origin:center;transform:scale(.15);animation:cvGrow 4s ease-out forwards}
@keyframes cvGrow{to{transform:scale(1)}}
.cv-modal .fall{animation:cvFall 1.7s ease-in infinite;animation-delay:var(--d,0s);opacity:0}
@keyframes cvFall{0%{transform:translateY(-170px);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateY(0);opacity:0}}
.cv-modal .drop{animation:cvDrop 1.1s ease-in infinite;animation-delay:var(--d,0s);opacity:0}
@keyframes cvDrop{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(118px);opacity:0}}
.cv-modal .stirspoon{animation:cvSpoon 1.1s ease-in-out infinite}
@keyframes cvSpoon{0%,100%{transform:translate(-70px,0) rotate(-12deg)}25%{transform:translate(0,7px) rotate(0)}50%{transform:translate(70px,0) rotate(12deg)}75%{transform:translate(0,-7px) rotate(0)}}
.cv-modal .spreading{transform-box:fill-box;transform-origin:left center;transform:scaleX(.18);animation:cvSpreadX 4.5s ease-out forwards}
@keyframes cvSpreadX{to{transform:scaleX(1)}}
.cv-modal .spatula{animation:cvSpat 1.3s ease-in-out infinite alternate}
@keyframes cvSpat{from{transform:translateX(0)}to{transform:translateX(250px)}}
.cv-modal .glow{animation:cvGlow 1.6s ease-in-out infinite alternate}
@keyframes cvGlow{from{opacity:.35}to{opacity:.8}}
.cv-modal .bake{animation:cvBake 7s ease-in forwards}
@keyframes cvBake{from{fill:#eeb062}to{fill:#c98235}}
.cv-modal .shine{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:cvPop .8s ease forwards;animation-delay:var(--d,0s)}
.cv-modal .steam{animation:cvSteam 2.4s ease-in-out infinite;animation-delay:var(--d,0s);opacity:0}
@keyframes cvSteam{0%{transform:translateY(8px);opacity:0}40%{opacity:.7}100%{transform:translateY(-26px);opacity:0}}
.cv-modal .hop{animation:cvHop .6s ease-in-out infinite alternate;animation-delay:var(--d,0s)}
@keyframes cvHop{from{transform:translateY(0)}to{transform:translateY(-16px)}}
.cv-modal .bubble{animation:cvBub 1.4s ease-in infinite;animation-delay:var(--d,0s);opacity:0}
@keyframes cvBub{0%{transform:translateY(10px) scale(.4);opacity:0}30%{opacity:1}100%{transform:translateY(-8px) scale(1.1);opacity:0}}
.cv-stage.paused *,.cv-stage.idle .scene *,.cv-stage.idle .cv-chef *{animation-play-state:paused!important}
.cv-stage.paused .cv-ingr li{animation-play-state:paused}
.cv-stage.ended .cv-chef .ch-body,.cv-stage.ended .cv-chef .eye{animation-play-state:running!important}
@media (prefers-reduced-motion:reduce){.cv-modal .scene *,.cv-modal .ch-head,.cv-modal .ch-body{animation-duration:.01s!important;animation-iteration-count:1!important}.cv-modal .fall,.cv-modal .drop,.cv-modal .steam,.cv-modal .bubble{display:none}}
`;

var CHEFS = { f: { name: "Léa", role: "Cuisinière", pitch: 1.12 }, m: { name: "Hugo", role: "Cuisinier", pitch: 0.82 } };

/* ---------------- Texte → français parlé ---------------- */
var IRREG = { jeter: "jette", rejeter: "rejette", prélever: "prélève", lever: "lève", soulever: "soulève", peler: "pèle", appeler: "appelle", acheter: "achète", ficeler: "ficelle", feuilleter: "feuillette", tenir: "tiens", maintenir: "maintiens", retenir: "retiens", venir: "viens", offrir: "offre", cueillir: "cueille", bouillir: "fais bouillir", frire: "fais frire", rôtir: "fais rôtir", mettre: "mets", faire: "fais", prendre: "prends", cuire: "fais cuire", battre: "bats", remettre: "remets", couvrir: "couvre", ouvrir: "ouvre", servir: "sers", répartir: "répartis", laisser: "laisse", rendre: "rends", sortir: "sors", recouvrir: "recouvre", plonger: "plonge", manger: "mange", dissoudre: "dissous", moudre: "mouds", peindre: "peins", étendre: "étends" };
function toTu(w) {
  var lw = w.toLowerCase();
  if (IRREG[lw]) return IRREG[lw];
  if (/er$/.test(lw)) return lw.slice(0, -1);
  if (/ir$/.test(lw)) return lw.slice(0, -1) + "s";
  if (/ez$/.test(lw) && lw.length > 4) return lw.slice(0, -1);
  return null;
}
var VERB = /^[a-zà-ÿ]+(er|ir|re|ez)$/i;
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function lowerFirst(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
function imperative(sentence) {
  var s = sentence.trim(), m = s.match(/^Bien\s+([a-zà-ÿ]+)(?![a-zà-ÿ])(.*)$/i), v;
  var pr = function (p) { p = p.toLowerCase(); return p === "l’" || p === "l'" ? "le" : p; };
  var mp = s.match(/^(?:(La|Le|Les|Y)\s+|(L’|L'))([a-zà-ÿ]+(?:er|ir|re))(?![a-zà-ÿ])(.*)$/);
  if (mp && toTu(mp[3])) s = cap(toTu(mp[3])) + "-" + pr(mp[1] || mp[2]) + mp[4];
  else if (m) { v = toTu(m[1]); if (v) s = cap(v) + " bien" + m[2]; }
  else {
    m = s.match(/^([A-Za-zÀ-ÿ]+)(?![a-zà-ÿ])(.*)$/);
    if (m && VERB.test(m[1])) { v = toTu(m[1]); if (v) s = cap(v) + m[2]; }
  }
  if (/^(il faut|il suffit|on peut|vous pouvez|tu peux|il est|c’est|c'est)\b/i.test(s)) return s;
  s = s.replace(/(\bet|\bpuis|,) bien ([a-zà-ÿ]+(?:er|ir))(?![a-zà-ÿ])/gi, function (a, c, vb) { var t = toTu(vb); return t ? c + " " + t + " bien" : a; });
  s = s.replace(/, (le|la|les) ([a-zà-ÿ]+(?:er|ir|re))(?![a-zà-ÿ])/gi, function (a, p, vb) { var t = toTu(vb); return t && t.indexOf(" ") < 0 ? ", " + t + "-" + pr(p) : a; });
  s = s.replace(/\b(et|puis) (?:(le|la|les|y)\s+|(l’|l'))([a-zà-ÿ]+(?:er|ir|re))(?![a-zà-ÿ])/gi, function (a, c, p1, p2, vb) { var t = toTu(vb); if (!t) return a; if (t.indexOf(" ") > 0) { var w = t.split(" "); return c + " " + w[0] + "-" + pr(p1 || p2) + " " + w.slice(1).join(" "); } return c + " " + t + "-" + pr(p1 || p2); });
  s = s.replace(/\b(puis|et|ou) ([A-Za-zÀ-ÿ]+)(?![a-zà-ÿ])/g, function (a, c, vb) {
    if (!VERB.test(vb) || /^(le|la|les|une?|des|du|de|sucre|beurre|poivre|lait|eau|mettre)$/i.test(vb) && !IRREG[vb.toLowerCase()]) return a;
    var t = toTu(vb); return t ? c + " " + t : a;
  });
  s = s.replace(/, ([a-zà-ÿ]+(?:er|ir))(?![a-zà-ÿ])/g, function (a, vb) { if (/^(sucre|beurre|poivre|lait|hier|fer|cuiller|plaisir|désir|avenir)$/i.test(vb)) return a; var t = toTu(vb); return t ? ", " + t : a; });
  return s;
}
function speakable(s) {
  return String(s).replace(/c\. ?à ?c\.?/gi, "cuillère à café").replace(/c\. ?à ?s\.?/gi, "cuillère à soupe")
    .replace(/\bcac\b/gi, "cuillère à café").replace(/\bcas\b/gi, "cuillère à soupe")
    .replace(/(\d+)\s?kg\b/g, "$1 kilo").replace(/(\d+)\s?g\b/g, "$1 grammes").replace(/(\d+)\s?cl\b/g, "$1 centilitres").replace(/(\d+)\s?ml\b/g, "$1 millilitres")
    .replace(/(\d+)\s?°\s?C?/g, "$1 degrés").replace(/(\d+)\s?min\b/g, "$1 minutes").replace(/(\d+)\s?mn\b/g, "$1 minutes").replace(/(\d+)\s?h\b/g, "$1 heure")
    .replace(/\bth\.?\s?(\d+)/gi, "thermostat $1");
}
var DOMAIN = /\b[\w-]+\.(?:com|net|fr|org|be|ch|ca|eu|info)\b\S*/gi;
function sentences(t) {
  var clean = String(t).replace(DOMAIN, " ").replace(/\s+/g, " ").trim();
  var out = clean.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [];
  return out.map(function (x) { return x.trim(); }).filter(function (x) { return x.replace(/[^a-zà-ÿ ]/gi, "").trim().split(/\s+/).length >= 2; });
}

/* ---------------- Couleur de l'ingrédient principal ---------------- */
var FOOD = [
  [/butternut|courge|potiron|carotte|patate douce|abricot|mangue|orange|curcuma|citrouille|melon/i, "#f0a04b", "#d9822f", "#f8c27e"],
  [/courgette|concombre|épinard|poireau|brocoli|petits? pois|herbe|persil|basilic|coriandre|avocat|pistache|kiwi|haricots? verts?|salade|menthe|pesto|chou\b/i, "#8cc56a", "#5f9a43", "#b9e09a"],
  [/tomate|poivron|fraise|framboise|betterave|cerise|chorizo|paprika|piment|harissa/i, "#e2553f", "#b8382a", "#f08a76"],
  [/chocolat|cacao|café|caramel|nutella|praliné/i, "#7a4a2e", "#5a321d", "#a26a48"],
  [/aubergine|myrtille|cassis|prune|chou rouge|figue|mûre/i, "#7b4a8f", "#5a3168", "#a77bb8"],
  [/boeuf|bœuf|viande|agneau|porc|saucisse|lardon|jambon|saumon|crevette|bacon|steak|veau|canard/i, "#d9776a", "#b0554a", "#eba195"],
  [/oignon|échalote|ail\b|chou-fleur|poisson|cabillaud|poulet|dinde|fromage|feta|mozzarella|crème|lait|yaourt|riz|pâtes|chèvre|ricotta|blanc/i, "#f3ead6", "#d8c9a6", "#fbf6ea"],
  [/pomme de terre|champignon|lentille|pois chiche|farine|banane|pomme|poire|amande|noisette|pâte|semoule|noix|miel|biscuit|beurre|oeuf|œuf/i, "#e8d29a", "#c9ad66", "#f3e6bf"]
];
function foodOf(text, fallback) {
  for (var i = 0; i < FOOD.length; i++) if (FOOD[i][0].test(text)) return FOOD[i].slice(1);
  return fallback || ["#f0a04b", "#d9822f", "#f8c27e"];
}

/* ---------------- Action → scène + geste ---------------- */
/* Mots entiers, accents compris (\b ne fonctionne pas avant « é ») */
function W(words, open) { return new RegExp("(?:^|[^a-zà-ÿ])(" + words + ")" + (open ? "" : "(?![a-zà-ÿ])"), "i"); }
var RULES = [
  { scene: "chop", g: "chop", re: W("coupe|découpe|hache|émince|taille|tranche|râpe|épluche|pèle|cisèle|détaille|écrase|coupe-les|coupe-le|coupe-la") },
  { scene: "blend", g: "point", re: W("mixe|mixe-le|mixe-la|mixe-les|mouds|broie|réduis en purée|blender|robot") },
  { scene: "pour", g: "pour", re: W("verse|arrose|nappe|transvase") },
  { scene: "add", g: "sprinkle", re: W("ajoute|incorpore|assaisonne|sale|poivre") },
  { scene: "mix", g: "stir", re: W("mélange|melange|remue|fouette|bats|monte|malaxe|pétris|travaille|homogénéise") },
  { scene: "spread", g: "spread", re: W("étale|etale|répartis|abaisse|abaisse-la|répartie|réparti|papier sulfurisé|moules?|chemise|badigeonne|badigeonne-la|dépose-les|dépose|pose|dispose") },
  { scene: "sprinkle", g: "sprinkle", re: W("saupoudre|parsème|décore") },
  { scene: "oil", g: "pour", re: W("huile", true) },
  { scene: "pan", g: "stir", re: W("poêle|fais revenir|fais dorer|fais sauter|saute|wok|fais frire|frire|fais fondre") },
  { scene: "pot", g: "stir", re: W("casserole|bouill|ébullition|cocotte|mijot|marmite|fais chauffer|fais bouillir", true) },
  { scene: "oven", g: "point", re: /((?:^|[^a-zà-ÿ])(four|enfourne|préchauffe|thermostat)(?![a-zà-ÿ])|\d+\s?degrés)/i },
  { scene: "outro", g: "present", re: W("sers|déguste|régale|présente|croquer|déguster|servir") }
];
var TOOL = { chop: "knife", stir: "spoon", spread: "spoon", sprinkle: "shaker" };
function detect(spoken) {
  var probe = spoken.replace(/plaque du four/gi, "plaque").replace(/coupe le feu|éteins le feu/gi, "feu éteint"), found = [];
  RULES.forEach(function (r) { var m = probe.match(r.re); if (m) found.push({ scene: r.scene, g: r.g, pos: m.index / probe.length }); });
  var has = function (s) { return found.some(function (f) { return f.scene === s; }); };
  if (has("oil")) found = found.filter(function (f) { return f.scene !== "pour"; });
  if (has("pan")) found = found.filter(function (f) { return f.scene !== "oil"; });
  if (has("oven")) found = found.filter(function (f) { return f.scene !== "pot" || /casserole|bouill/i.test(probe); });
  found.sort(function (a, b) { return a.pos - b.pos; });
  var out = [];
  found.forEach(function (f) { if (!out.length || out[out.length - 1].scene !== f.scene) out.push(f); });
  if (!out.length && /plaque/i.test(probe)) out.push({ scene: "spread", g: "spread", pos: 0 });
  if (out.length) out[0].pos = 0;
  return out;
}

/* ---------------- Construction des mini-vidéos ---------------- */
var CAT_PHR = { "apéritif": "l’apéritif", "entrée": "une entrée", "plat": "un bon plat", "plat unique": "un repas complet", "plat unique végétarien": "un repas complet", "accompagnement": "accompagner tes plats", "préparation salée": "tes préparations salées", "dessert": "le dessert", "préparation sucrée": "les gourmands", "biscuits": "le goûter" };
function buildClips(R) {
  var clips = [], vege = /végé/i.test(R.type || "") || /végé/i.test(R.cat || "");
  var main = foodOf((R.ingredients || []).join(" ") + " " + R.name);
  var phr = CAT_PHR[(R.cat || "").toLowerCase()];
  clips.push({ group: "Introduction", badge: "Introduction", label: "Bienvenue", step: null, food: main,
    text: "Bonjour, et bienvenue dans ma cuisine ! Aujourd’hui, on prépare : " + R.name + "." + (vege ? " C’est une recette végétarienne" + (phr ? ", idéale pour " + phr : "") + "." : phr ? " Idéal pour " + phr + "." : ""),
    acts: [{ scene: "intro", g: "wave", pos: 0 }] });
  if (R.ingredients && R.ingredients.length) {
    clips.push({ group: "Introduction", badge: "Ingrédients", label: "Les ingrédients", step: null, ingr: true, food: main,
      text: "Pour cette recette, il te faut : " + R.ingredients.map(function (t, k) { var s = speakable(t).replace(/[.;]+$/, ""); return k ? lowerFirst(s) : s; }).join(", ") + ".",
      acts: [{ scene: "intro", g: "present", pos: 0 }] });
  }
  var openers = ["Ensuite,", "Maintenant,", "Après ça,"], last = "intro", lastFood = main;
  R.steps.forEach(function (st, si) {
    var ss = sentences(st);
    ss.forEach(function (s, k) {
      var spoken = speakable(imperative(s));
      if (k === 0) {
        if (si === 0) spoken = "On commence. " + spoken;
        else if (si === R.steps.length - 1 && R.steps.length > 1) spoken = "Pour finir, " + lowerFirst(spoken);
        else spoken = openers[(si - 1) % openers.length] + " " + lowerFirst(spoken);
      }
      var acts = detect(spoken);
      if (!acts.length) acts = [{ scene: last, g: "explain", pos: 0 }];
      last = acts[acts.length - 1].scene;
      lastFood = foodOf(s, lastFood);
      clips.push({ group: "Étape " + (si + 1), badge: ss.length > 1 ? "Étape " + (si + 1) + " · " + (k + 1) + "/" + ss.length : "Étape " + (si + 1),
        label: s, step: si, text: spoken, acts: acts, food: lastFood });
    });
  });
  var times = (R.notes || []).filter(function (n) { return /temps|cuisson|préparation|repos/i.test(n); }).join(" ");
  clips.push({ group: "Fin", badge: "Bon appétit", label: "C’est prêt !", step: null, food: main,
    text: "Et voilà, c’est prêt ! " + (times ? speakable(times) + " " : "") + "Bon appétit !", acts: [{ scene: "outro", g: "present", pos: 0 }] });
  return clips;
}

/* ---------------- Dessin des chefs ---------------- */
function arm(side, sx) {
  var thumb = side === "r" ? -10 : 10;
  return '<g transform="translate(' + sx + ' 292)"><g class="ar-u ' + side + '"><rect x="-17" y="-12" width="34" height="100" rx="17" class="jk"/>' +
    '<g transform="translate(0 84)"><g class="ar-f ' + side + '"><rect x="-12" y="0" width="24" height="68" rx="12" class="sk"/><rect x="-17" y="-8" width="34" height="18" rx="9" class="jk"/>' +
    '<g transform="translate(0 76)">' +
    '<g class="cv-t t-knife"><rect x="-5" y="-4" width="10" height="26" rx="4" fill="#3b3b3b"/><path d="M-6,20 L6,20 L8,72 Q-2,68 -6,20Z" fill="#d6dee1" stroke="#9fb0b6" stroke-width="1.5"/></g>' +
    '<g class="cv-t t-spoon"><rect x="-3.5" y="-6" width="7" height="60" rx="3.5" fill="#c58a4a"/><ellipse cx="0" cy="62" rx="9" ry="13" fill="#c58a4a"/></g>' +
    '<g class="cv-t t-shaker"><rect x="-11" y="-6" width="22" height="34" rx="6" fill="#fff" stroke="#cfdfe2" stroke-width="2"/><rect x="-11" y="22" width="22" height="12" rx="4" fill="#c8402a"/></g>' +
    '<circle r="15" class="sk"/><ellipse cx="' + thumb + '" cy="-7" rx="6" ry="9" class="sk"/></g></g></g></g></g>';
}
function eye(F, x, flip) {
  var tf = "translate(" + x + " 158)" + (flip ? " scale(-1 1)" : "");
  if (F) return '<g transform="' + tf + '"><g class="eye"><path d="M-13,0 Q0,-11 13,0 Q0,9 -13,0Z" fill="#fff"/><circle cy="0.5" r="6.5" class="ir"/><circle cy="0.5" r="3" fill="#1d1411"/><circle cx="2.2" cy="-1.8" r="1.7" fill="#fff"/>' +
    '<path class="lid" stroke-width="2.8" d="M-14,1 Q0,-12 14,-1 L18,-5"/><path class="lid" stroke-width="1.6" d="M9,-6 L12,-10 M4,-8 L6,-12"/></g><path class="brow" stroke-width="2.6" d="M-13,-18 Q1,-26 15,-18"/></g>';
  return '<g transform="' + tf + '"><g class="eye"><path d="M-12,0 Q0,-9 12,0 Q0,8 -12,0Z" fill="#fff"/><circle cy="0.5" r="6" class="ir"/><circle cy="0.5" r="2.8" fill="#1d1411"/><circle cx="2" cy="-1.6" r="1.5" fill="#fff"/>' +
    '<path class="lid" stroke-width="2.2" d="M-13,0.5 Q0,-10 13,-0.5"/></g><path class="brow" stroke-width="4.6" d="M-15,-15 Q0,-21 15,-16"/></g>';
}
function mouth(F) {
  if (F) return '<g transform="translate(240 203)"><g class="m0"><path class="lp" d="M-14,0 Q-7,-5 0,-2 Q7,-5 14,0 Q7,8 0,8 Q-7,8 -14,0Z"/><path d="M-13,0.5 Q0,3.5 13,0.5" fill="none" stroke="#9a3a4f" stroke-width="1.4"/></g>' +
    '<g class="m1"><path class="lp" d="M-13,-2 Q0,-7 13,-2 Q8,9 0,9 Q-8,9 -13,-2Z"/><path d="M-9,0 Q0,-2 9,0 Q5,5 0,5 Q-5,5 -9,0Z" fill="#5a1f2b"/><path d="M-7,0 Q0,-1.6 7,0 L6,1.8 Q0,1 -6,1.8Z" fill="#fff"/></g>' +
    '<g class="m2"><path class="lp" d="M-13,-3 Q0,-8 13,-3 Q9,14 0,14 Q-9,14 -13,-3Z"/><path d="M-9,-1 Q0,-3 9,-1 Q6,10 0,10 Q-6,10 -9,-1Z" fill="#5a1f2b"/><ellipse cy="7.5" rx="5" ry="2.4" fill="#e58a96"/><path d="M-7,-1 Q0,-2.6 7,-1 L6,1.4 Q0,0.6 -6,1.4Z" fill="#fff"/></g></g>';
  return '<g transform="translate(240 207)"><g class="m0"><path d="M-14,-2 Q0,9 14,-2" fill="none" stroke="#5b2f22" stroke-width="2.8" stroke-linecap="round"/></g>' +
    '<g class="m1"><path d="M-12,-2 Q0,-3 12,-2 Q8,8 0,8 Q-8,8 -12,-2Z" fill="#4a1c18"/><path d="M-9,-2 L9,-2 L8,0.5 L-8,0.5Z" fill="#fff"/></g>' +
    '<g class="m2"><path d="M-12,-3 Q0,-4 12,-3 Q8,13 0,13 Q-8,13 -12,-3Z" fill="#4a1c18"/><ellipse cy="9" rx="5" ry="2.4" fill="#d9776f"/><path d="M-9,-3 L9,-3 L8,-0.5 L-8,-0.5Z" fill="#fff"/></g></g>';
}
function chefMarkup(k) {
  var F = k === "f";
  var hairBack = F ? '<path class="hr" d="M176,140 Q168,58 240,56 Q314,58 306,140 Q318,208 334,258 Q312,284 290,262 Q298,214 294,176 L186,176 Q182,214 190,262 Q168,284 146,258 Q162,208 176,140Z"/>' : "";
  var torso = F ? "M162,300 Q162,272 198,266 L282,266 Q318,272 318,300 Q314,348 300,372 L306,424 L174,424 L180,372 Q166,348 162,300Z" : "M146,304 Q148,270 192,264 L288,264 Q332,270 334,304 L342,424 L138,424Z";
  var face = F ? "M186,150 Q186,94 240,94 Q294,94 294,150 Q294,204 240,230 Q186,204 186,150Z" : "M183,146 Q183,92 240,92 Q297,92 297,146 L295,182 Q288,216 240,230 Q192,216 185,182Z";
  var bx = F ? [222, 280] : [214, 290], sx = F ? [166, 314] : [158, 322];
  var hairFront = F
    ? '<path class="hr" d="M188,130 Q172,186 184,236 Q190,200 194,150Z"/><path class="hr" d="M292,128 Q310,186 298,236 Q290,204 286,150Z"/><path class="hr" d="M188,152 Q176,84 240,80 Q304,82 296,146 Q286,112 256,104 Q236,132 190,152Z"/>' +
      '<g transform="rotate(-10 240 70)"><path class="tq" d="M196,70 Q180,36 214,34 Q222,8 252,18 Q286,8 292,40 Q308,54 290,70Z"/><rect class="tq" x="198" y="62" width="90" height="20" rx="6"/></g>'
    : '<path class="hr" d="M186,140 Q184,96 238,92 Q294,92 296,138 Q288,116 266,110 Q248,122 228,112 Q204,116 190,142Z"/><path class="hr" d="M184,124 L193,124 L193,170 L186,166Z"/><path class="hr" d="M287,124 L296,124 L294,166 L287,170Z"/>' +
      '<path class="hr" opacity=".22" d="M186,168 Q192,214 240,230 Q288,214 294,168 Q292,198 264,206 Q240,198 216,206 Q188,198 186,168Z"/><path class="hr" opacity=".55" d="M223,197 Q240,188 257,197 Q240,193 223,197Z"/>' +
      '<path class="tq" d="M190,86 Q168,40 206,32 Q214,-2 248,6 Q282,-4 290,30 Q318,38 292,86Z"/><rect class="tq" x="188" y="76" width="104" height="24" rx="7"/>';
  var buttons = [312, 350, 388].map(function (y) { return '<circle cx="' + bx[0] + '" cy="' + y + '" r="4.5"/><circle cx="' + bx[1] + '" cy="' + y + '" r="4.5"/>'; }).join("");
  var cheek = F ? .38 : .14;
  return '<g class="cv-chef cv-chef-' + k + '" data-g="rest" data-mouth="0" data-tool=""><g class="ch-body">' + hairBack +
    '<path class="sk2" d="M224,212 L256,212 L258,268 Q240,278 222,268Z"/><path class="jk" d="' + torso + '"/>' +
    '<path class="pip" d="' + (F ? "M262,270 Q286,300 274,424" : "M264,268 Q294,304 282,424") + '"/><g class="btnj">' + buttons + '</g>' +
    '<text class="emb" x="' + (F ? 186 : 176) + '" y="302">Mes recettes</text>' +
    '<path class="jk" d="M210,252 Q240,266 270,252 L268,266 Q240,280 212,266Z"/><path class="sc" d="M226,268 Q240,276 254,268 L248,288 Q240,300 232,288Z"/>' +
    '<g class="ch-head"><ellipse class="sk" cx="186" cy="160" rx="9" ry="14"/><ellipse class="sk" cx="294" cy="160" rx="9" ry="14"/>' +
    (F ? '<circle cx="186" cy="179" r="3.6" fill="#e1b54a"/><circle cx="294" cy="179" r="3.6" fill="#e1b54a"/>' : "") +
    '<path class="sk" d="' + face + '"/><ellipse cx="206" cy="186" rx="10" ry="6" fill="#f08f8f" opacity="' + cheek + '"/><ellipse cx="274" cy="186" rx="10" ry="6" fill="#f08f8f" opacity="' + cheek + '"/>' +
    eye(F, 218, true) + eye(F, 262, false) + '<path class="nose" d="' + (F ? "M241,168 Q236,183 242,185" : "M241,166 Q234,185 244,187") + '"/>' + mouth(F) + hairFront + '</g>' +
    arm("l", sx[0]) + arm("r", sx[1]) + '</g></g>';
}

/* ---------------- Décors ---------------- */
var veg = '<path class="fd" d="M0,0 C-34,0 -36,-50 -12,-62 C-18,-92 -16,-122 0,-128 C16,-122 18,-92 12,-62 C36,-50 34,0 0,0Z" stroke="rgba(0,0,0,.18)" stroke-width="2.5"/>' +
  '<path class="fds" d="M-6,-20 C-14,-30 -12,-50 -2,-58" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round"/><rect x="-4" y="-141" width="8" height="15" rx="3" fill="#6b8e3a"/>';
function portion(x, y, r, d) {
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')"><g class="pop" style="--d:' + d + 's"><rect x="-28" y="-17" width="56" height="34" rx="9" fill="#d98f3a"/><rect x="-25" y="-15" width="50" height="28" rx="8" fill="#eeb062"/>' +
    '<circle cx="-12" cy="-4" r="2.4" class="fd2"/><circle cx="6" cy="5" r="2.4" class="fd2"/><circle cx="14" cy="-7" r="2" fill="#f6e7b0"/><circle cx="-4" cy="7" r="2" fill="#f6e7b0"/></g></g>';
}
function plate(cx, rx) { return '<ellipse cx="' + cx + '" cy="394" rx="' + rx + '" ry="16" fill="#fff" stroke="#d3e6ea" stroke-width="3"/><ellipse cx="' + cx + '" cy="392" rx="' + (rx - 30) + '" ry="10" fill="none" stroke="#e8f0f2" stroke-width="2"/>'; }
function bowlFront() { return '<path d="M600,330 A140,16 0 0 0 880,330 Q868,404 740,404 Q612,404 600,330Z" fill="#fff" stroke="#d3e6ea" stroke-width="3"/><ellipse cx="740" cy="330" rx="140" ry="16" fill="none" stroke="#0f6b78" stroke-width="4"/>'; }
function tray(dough) { return '<path d="M560,332 L880,332 L912,394 L528,394Z" fill="#7f8c90" stroke="#5f6b70" stroke-width="3"/><path d="M572,338 L868,338 L894,388 L546,388Z" fill="#f7efe0"/>' + (dough || ""); }
var doughFull = '<path d="M580,342 L860,342 L884,384 L556,384Z" fill="#eeb062"/>';
function fallers(n, x0, x1, yEnd, kinds, spread) {
  spread = spread || 1.7; var s = "";
  for (var i = 0; i < n; i++) {
    var x = x0 + ((i * 53) % (x1 - x0)), y = yEnd - (i % 4) * 6, k = kinds[i % kinds.length], d = ((i * 0.23) % spread).toFixed(2), sh;
    var fill = k.c ? 'fill="' + k.c + '"' : 'class="' + k.cls + '"';
    if (k.t === "dot") sh = '<circle cx="' + x + '" cy="' + y + '" r="' + (k.r || 3) + '" ' + fill + '/>';
    else if (k.t === "flake") sh = '<rect x="' + (x - 6) + '" y="' + (y - 3) + '" width="12" height="6" rx="2" ' + fill + ' transform="rotate(' + ((i * 37) % 60 - 30) + ' ' + x + ' ' + y + ')"/>';
    else sh = '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="5" ' + fill + ' transform="rotate(' + ((i * 41) % 80) + ' ' + x + ' ' + y + ')"/>';
    s += '<g class="fall" style="--d:' + d + 's">' + sh + '</g>';
  }
  return s;
}
var SCENES = {
  intro: '<path d="M640,330 A100,14 0 0 0 840,330 Q832,396 740,396 Q648,396 640,330Z" fill="#fff" stroke="#d3e6ea" stroke-width="3"/><ellipse cx="740" cy="330" rx="100" ry="14" fill="none" stroke="#0f6b78" stroke-width="4"/>' +
    '<g transform="translate(590 400)">' + veg + '</g>' +
    '<g class="pop" style="--d:.5s"><rect x="852" y="318" width="52" height="80" rx="12" fill="#fff1b8" stroke="#e5cf7a" stroke-width="2"/><rect x="848" y="306" width="60" height="16" rx="6" fill="#0f6b78"/></g>' +
    '<g class="pop" style="--d:.9s"><rect x="726" y="250" width="8" height="70" rx="4" fill="#c58a4a" transform="rotate(18 730 300)"/></g>',
  chop: '<rect x="560" y="382" width="330" height="18" rx="8" fill="#d9a066"/><rect x="560" y="394" width="330" height="8" rx="4" fill="#b98146"/><g transform="translate(700 362) rotate(-90)">' + veg + '</g>' +
    [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect class="pop fdl" style="--d:' + (0.5 + i * 0.45).toFixed(2) + 's" x="' + (770 + (i % 3) * 30) + '" y="' + (358 - Math.floor(i / 3) * 24) + '" width="22" height="22" rx="5" stroke="rgba(0,0,0,.2)" stroke-width="2"/>'; }).join("") +
    '<g transform="translate(860 290)"><g class="knife"><path d="M0,0 L-92,8 Q-62,28 0,26Z" fill="#d6dee1" stroke="#9fb0b6" stroke-width="2"/><rect x="0" y="4" width="46" height="17" rx="6" fill="#3b3b3b"/></g></g>',
  blend: '<rect x="684" y="328" width="112" height="72" rx="14" fill="#0b4f59"/><circle cx="740" cy="368" r="11" fill="#e3f6f8"/><circle cx="740" cy="368" r="5" fill="#0f6b78"/>' +
    '<path class="wobble fd" d="M698,328 L703,246 Q740,234 777,246 L782,328Z"/><g class="bits"><rect x="716" y="262" width="12" height="12" rx="3" class="fdl"/><rect x="756" y="282" width="10" height="10" rx="3" class="fd2"/><rect x="736" y="300" width="11" height="11" rx="3" class="fdl"/></g>' +
    '<g transform="translate(740 320)"><g class="spin"><ellipse rx="26" ry="5" fill="#9fb0b6"/></g></g><path d="M692,328 L700,190 L780,190 L788,328Z" fill="#dff3f6" fill-opacity=".4" stroke="#9cc9cf" stroke-width="3"/><rect x="694" y="178" width="92" height="16" rx="6" fill="#0b4f59"/>',
  pour: '<ellipse cx="740" cy="330" rx="132" ry="14" fill="#efe3c8"/><ellipse class="grow fd" cx="740" cy="330" rx="96" ry="10"/>' + bowlFront() +
    '<path class="stream fds" d="M694,250 Q712,276 728,330" stroke-width="12" stroke-linecap="round"/>' +
    '<g transform="translate(650 216) rotate(38)"><ellipse rx="56" ry="10" class="fd"/><path d="M-56,0 A56,10 0 0 0 56,0 Q50,44 0,46 Q-50,44 -56,0Z" fill="#fff" stroke="#d3e6ea" stroke-width="3"/><ellipse rx="56" ry="10" fill="none" stroke="#0f6b78" stroke-width="3"/></g>',
  add: '<ellipse cx="740" cy="330" rx="132" ry="14" class="fdl"/>' +
    fallers(20, 650, 830, 328, [{ t: "dot", c: "#e9d8a6" }, { t: "flake", c: "#f3e3a0" }, { t: "dot", c: "#e8b100", r: 2.5 }, { t: "dot", c: "#c8402a", r: 2.5 }, { t: "seed", c: "#5a4a3a" }, { t: "flake", cls: "fd" }]) + bowlFront(),
  mix: '<ellipse cx="740" cy="330" rx="132" ry="14" class="fdl"/><g transform="translate(740 330) scale(1 .11)"><g class="spin-slow"><path d="M-20,0 a20,20 0 1,1 40,0 a40,40 0 1,1 -80,0 a60,60 0 1,1 120,0 a80,80 0 1,1 -160,0" class="fds" style="stroke:var(--food2)" stroke-width="10"/></g></g>' +
    '<g transform="translate(740 334)"><g class="stirspoon"><rect x="-5" y="-130" width="10" height="134" rx="5" fill="#c58a4a"/></g></g>' + bowlFront(),
  spread: tray('<path class="spreading" d="M580,342 L860,342 L884,384 L556,384Z" fill="#eeb062"/>') + '<g transform="translate(590 300)"><g class="spatula"><rect x="-4" y="-50" width="8" height="54" rx="4" fill="#c58a4a"/><rect x="-22" y="2" width="44" height="30" rx="6" fill="#9fb0b6"/></g></g>',
  sprinkle: tray(doughFull) + fallers(26, 580, 860, 372, [{ t: "dot", c: "#f6e7b0", r: 2.6 }, { t: "dot", c: "#e9d8a6", r: 2.2 }, { t: "dot", cls: "fd2", r: 2.4 }], 1.9),
  oil: tray(doughFull) + [[640, 360, .6], [720, 352, 1.4], [800, 366, 2.2], [690, 374, 3], [770, 346, 3.8]].map(function (a) { return '<ellipse class="shine" style="--d:' + a[2] + 's" cx="' + a[0] + '" cy="' + a[1] + '" rx="22" ry="5" fill="#fff6c8" opacity=".65"/>'; }).join("") +
    [0, .28, .56, .84].map(function (d) { return '<path class="drop" style="--d:' + d + 's" d="M719,236 q-5,9 0,12 q5,-3 0,-12Z" fill="#d6b733"/>'; }).join("") +
    '<g transform="translate(780 190) rotate(-120)"><rect x="-22" y="-40" width="44" height="92" rx="12" fill="#b9a23a" opacity=".92"/><rect x="-8" y="-68" width="16" height="30" rx="4" fill="#b9a23a"/><rect x="-6" y="-76" width="12" height="10" rx="3" fill="#7a5a3a"/><rect x="-18" y="-6" width="36" height="28" rx="4" fill="#fff4d6"/></g>',
  pan: '<rect x="520" y="362" width="100" height="14" rx="7" fill="#3b3b3b"/><ellipse cx="740" cy="372" rx="128" ry="24" fill="#2f3b3f"/><ellipse cx="740" cy="366" rx="116" ry="19" fill="#46555a"/>' +
    [[690, 360, 0], [730, 356, .15], [770, 362, .3], [810, 358, .45], [712, 368, .6], [790, 370, .75]].map(function (a) { return '<g class="hop" style="--d:' + a[2] + 's"><rect x="' + (a[0] - 11) + '" y="' + (a[1] - 9) + '" width="22" height="16" rx="5" class="fdl" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/></g>'; }).join("") +
    [0, .8, 1.6].map(function (d, i) { return '<path class="steam" style="--d:' + d + 's" d="M' + (700 + i * 40) + ',330 q-8,-12 0,-24 q8,-12 0,-24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'; }).join(""),
  pot: '<rect x="636" y="300" width="22" height="12" rx="5" fill="#5f6b70"/><rect x="822" y="300" width="22" height="12" rx="5" fill="#5f6b70"/><rect x="650" y="290" width="180" height="112" rx="16" fill="#9fb0b6"/><rect x="650" y="290" width="180" height="20" fill="#8a9ba1"/>' +
    '<ellipse cx="740" cy="290" rx="92" ry="14" fill="#5f6b70"/><ellipse cx="740" cy="292" rx="82" ry="10" class="fdl"/>' +
    [[700, 290, 0], [735, 294, .35], [770, 289, .7], [752, 293, 1.05], [718, 292, 1.2]].map(function (a) { return '<circle class="bubble" style="--d:' + a[2] + 's" cx="' + a[0] + '" cy="' + a[1] + '" r="6" fill="#fff" opacity=".8"/>'; }).join("") +
    [0, .8, 1.6].map(function (d, i) { return '<path class="steam" style="--d:' + d + 's" d="M' + (705 + i * 35) + ',262 q-8,-12 0,-24 q8,-12 0,-24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'; }).join(""),
  oven: '<rect x="568" y="160" width="324" height="240" rx="16" fill="#3d4b50"/><rect x="568" y="160" width="324" height="50" rx="16" fill="#2f3b3f"/><rect x="690" y="172" width="96" height="28" rx="6" fill="#142024"/>' +
    '<text class="cv-temp" x="738" y="193" text-anchor="middle" font-family="monospace" font-size="20" font-weight="700" fill="#8fe3b0">180°C</text>' +
    '<circle cx="612" cy="185" r="11" fill="#9fb0b6"/><circle cx="645" cy="185" r="11" fill="#9fb0b6"/><g transform="translate(840 185)"><circle r="14" fill="#f6efe4"/><g class="spin-slow"><rect x="-1.5" y="-11" width="3" height="11" rx="1.5" fill="#c8402a"/></g></g>' +
    '<rect x="598" y="226" width="264" height="148" rx="12" fill="#1d2a2e"/><rect class="glow" x="604" y="232" width="252" height="136" rx="9" fill="#f5a742"/><rect x="618" y="330" width="224" height="8" rx="3" fill="#5f6b70"/>' +
    '<path class="bake" d="M632,318 L828,318 L838,330 L622,330Z" fill="#eeb062"/><rect x="610" y="214" width="240" height="8" rx="4" fill="#9fb0b6"/>',
  outro: plate(740, 150) + [[680, 372, -8, .1], [740, 368, 6, .3], [800, 374, -4, .5], [860, 370, 8, .7], [710, 348, 10, .9], [775, 346, -12, 1.1], [835, 348, 6, 1.3], [742, 324, 4, 1.5]].map(function (a) { return portion(a[0], a[1], a[2], a[3]); }).join("") +
    [0, .8, 1.6].map(function (d, i) { return '<path class="steam" style="--d:' + d + 's" d="M' + (715 + i * 30) + ',300 q-8,-12 0,-24 q8,-12 0,-24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'; }).join("")
};

var BACKDROP = '<defs><pattern id="cvTiles" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#eaf7f9"/><path d="M48 0H0V48" fill="none" stroke="#d6eaee" stroke-width="2"/></pattern>' +
  '<radialGradient id="cvSpot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
  '<rect width="960" height="540" fill="url(#cvTiles)"/><circle cx="240" cy="250" r="230" fill="url(#cvSpot)"/>' +
  '<rect x="520" y="112" width="400" height="10" rx="5" fill="#c9a37a"/>' +
  '<rect x="545" y="70" width="34" height="42" rx="8" fill="#bfe8ee"/><rect x="543" y="62" width="38" height="10" rx="4" fill="#0f6b78"/><rect x="595" y="80" width="28" height="32" rx="7" fill="#ffd9c7"/><rect x="593" y="73" width="32" height="9" rx="4" fill="#0b4f59"/>' +
  '<rect x="640" y="64" width="40" height="48" rx="9" fill="#fff1b8"/><rect x="638" y="56" width="44" height="10" rx="4" fill="#0f6b78"/><rect x="845" y="74" width="30" height="38" rx="7" fill="#e9d6f2"/><rect x="843" y="66" width="34" height="10" rx="4" fill="#0b4f59"/>' +
  '<rect x="885" y="84" width="24" height="28" rx="6" fill="#cdeccb"/><rect x="883" y="78" width="28" height="8" rx="3" fill="#0f6b78"/>' +
  '<g class="cv-chefslot"></g>' +
  '<rect y="396" width="960" height="26" fill="#f6efe4"/><rect y="418" width="960" height="5" fill="#e3d6c3"/><rect y="423" width="960" height="117" fill="#0f6b78"/>' +
  '<g fill="none" stroke="#0b4f59" stroke-width="3"><rect x="24" y="440" width="214" height="120" rx="10"/><rect x="258" y="440" width="214" height="120" rx="10"/><rect x="492" y="440" width="214" height="120" rx="10"/><rect x="726" y="440" width="214" height="120" rx="10"/></g>' +
  '<g fill="#e3f6f8"><rect x="111" y="452" width="40" height="7" rx="3.5"/><rect x="345" y="452" width="40" height="7" rx="3.5"/><rect x="579" y="452" width="40" height="7" rx="3.5"/><rect x="813" y="452" width="40" height="7" rx="3.5"/></g>' +
  '<g class="cv-scenes">' + Object.keys(SCENES).map(function (k) { return '<g class="scene" data-scene="' + k + '">' + SCENES[k] + '</g>'; }).join("") + '</g>';

var ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5z" fill="currentColor"/></svg>';
var ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor"/></svg>';

/* ---------------- Utilitaires ---------------- */
var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
var speechOk = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

/* ---------------- Voix ---------------- */
var FEM = /(amélie|amelie|audrey|aurélie|aurelie|marie|julie|hortense|denise|céline|celine|virginie|léa|lea|google français|female|femme|sylvie|chantal|juliette|eloise|vivienne|brigitte|coralie|jacqueline|yvette|joséphine|josephine|charlotte|ariane|manon)/i;
var MASC = /(thomas|paul|henri|claude|nicolas|daniel|mathieu|rémy|remy|antoine|jean|louis|\bmale\b|homme|gérard|guillaume|alain|fabrice|frédéric|frederic|jérôme|jerome|maurice|yves|olivier|denis|rémi|remi|alexandre|benoît|benoit|gabriel)/i;
var VOICES = [];
function loadVoices() { if (speechOk) VOICES = speechSynthesis.getVoices().filter(function (v) { return /^fr/i.test(v.lang); }); }
/* Note d'une voix de l'appareil : les voix « naturelles » / neuronales passent devant les voix robotiques */
function voiceScore(v, chef) {
  var n = v.name, s = 0;
  if (/natural|naturel|neural|online|en ligne/i.test(n)) s += 60;
  if (/premium|enhanced|amélioré|siri/i.test(n)) s += 45;
  if (/google/i.test(n)) s += 30;
  if (/fr-FR/i.test(v.lang)) s += 8;
  if ((chef === "m" ? MASC : FEM).test(n)) s += 25;
  if ((chef === "m" ? FEM : MASC).test(n)) s -= 40;
  if (/compact|espeak|hortense|^microsoft paul|^microsoft julie/i.test(n) && !/natural|online/i.test(n)) s -= 15;
  return s;
}

/* ---------------- Voix enregistrées (fichiers MP3 générés avec ElevenLabs) ---------------- */
function hashText(s) {
  var h1 = 0x811c9dc5, h2 = 0x9747b28c;
  for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822507) ^ (h2 >>> 13); }
  return ("0000000" + (h1 >>> 0).toString(16)).slice(-8) + ("0000000" + (h2 >>> 0).toString(16)).slice(-8);
}
var AUDIO_DIR = "audio/", MANIFEST = null, manifestP = null;
function loadManifest() {
  if (!manifestP) manifestP = fetch(AUDIO_DIR + "index.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) { MANIFEST = m; return m; }).catch(function () { MANIFEST = null; return null; });
  return manifestP;
}
function audioUrl(chef, text) {
  if (!MANIFEST || !MANIFEST[chef]) return null;
  var h = hashText(text);
  return MANIFEST[chef][h] ? AUDIO_DIR + chef + "/" + h + ".mp3?v=" + MANIFEST[chef][h] : null;
}
if (speechOk) { loadVoices(); if ("onvoiceschanged" in speechSynthesis) speechSynthesis.addEventListener("voiceschanged", function () { loadVoices(); if (P) P.fillVoices(); }); }

/* ---------------- Lecteur ---------------- */
var P = null;
function Player() {
  var self = this;
  var root = document.createElement("div");
  root.className = "cv-modal"; root.hidden = true;
  root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
  root.innerHTML = '<div class="cv-dialog"><div class="cv-top"><b class="cv-title"></b><button type="button" class="cv-x">Fermer ✕</button></div>' +
    '<div class="cv-body"><div class="cv-main"><div class="cv-stage idle"><svg viewBox="0 0 960 540" role="img" aria-label="Cuisine animée">' + BACKDROP + '</svg>' +
    '<div class="cv-badge"></div><div class="cv-ingr" hidden></div><div class="cv-subs" aria-live="polite"></div><div class="cv-clipbar"><i></i></div><div class="cv-ov"></div></div>' +
    '<div class="cv-segs" aria-label="Progression"></div>' +
    '<div class="cv-controls"><button class="cv-ctl" type="button" data-a="prev"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h2v12H3zM14 2.5v11L6 8z" fill="currentColor"/></svg>Précédent</button>' +
    '<button class="cv-ctl" type="button" data-a="replay"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.6 3H1.2A7 7 0 1 0 3 3.2V1L.5 4.5 4 6.5V4.4A5 5 0 0 1 8 3z" fill="currentColor"/></svg>Rejouer</button>' +
    '<button class="cv-ctl main" type="button" data-a="play"><span class="cv-pi"></span><span class="cv-pl">Lancer</span></button>' +
    '<button class="cv-ctl" type="button" data-a="next">Continuer<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2h2v12h-2zM2 2.5v11L10 8z" fill="currentColor"/></svg></button>' +
    '<span class="cv-grow"></span><div class="cv-opts"><button class="cv-ctl" type="button" data-a="sound">Son</button><button class="cv-ctl" type="button" data-a="auto">Enchaîner</button>' +
    '<button class="cv-ctl" type="button" data-a="chef">Changer de chef</button><label>Voix de l’appareil <select class="cv-voice"><option value="">Automatique</option></select></label></div></div>' +
    '<p class="cv-note">Une mini-vidéo par phrase. À la fin de chaque phrase, la vidéo s’arrête : rejoue-la ou continue.</p></div>' +
    '<nav class="cv-chap" aria-label="Chapitres"><h4>Chapitres</h4><ol></ol></nav></div></div>';
  document.body.appendChild(root);
  var q = function (s) { return root.querySelector(s); };
  this.root = root;
  this.stage = q(".cv-stage"); this.slot = q(".cv-chefslot"); this.scenes = q(".cv-scenes"); this.subs = q(".cv-subs"); this.badge = q(".cv-badge");
  this.ingr = q(".cv-ingr"); this.ov = q(".cv-ov"); this.fill = q(".cv-clipbar i"); this.segs = q(".cv-segs"); this.chap = q(".cv-chap ol");
  this.note = q(".cv-note"); this.voiceSel = q(".cv-voice"); this.title = q(".cv-title");
  this.btn = {}; root.querySelectorAll("[data-a]").forEach(function (b) { self.btn[b.dataset.a] = b; });
  this.S = { i: 0, status: "idle", chef: store.get("mr-chef") || null, sound: store.get("mr-sound") !== "0", auto: store.get("mr-auto") === "1",
    voiceURI: store.get("mr-voice") || "", token: 0, frac: 0, elapsed: 0, tStart: 0, est: 3000, actIdx: 0, mode: "silent", restart: false, pending: 0 };
  this.timers = {};

  q(".cv-x").onclick = function () { self.close(); };
  root.addEventListener("click", function (e) { if (e.target === root) self.close(); });
  this.btn.play.onclick = function () { self.toggle(); };
  this.btn.replay.onclick = function () { self.play(self.S.i); };
  this.btn.prev.onclick = function () { self.play(self.S.i - 1); };
  this.btn.next.onclick = function () { self.play(self.S.i + 1); };
  this.btn.sound.onclick = function () { var S = self.S; S.sound = !S.sound; store.set("mr-sound", S.sound ? "1" : "0"); self.syncOpts(); if (S.status === "playing" || S.status === "paused") self.play(S.i); };
  this.btn.auto.onclick = function () { var S = self.S; S.auto = !S.auto; store.set("mr-auto", S.auto ? "1" : "0"); self.syncOpts(); };
  this.btn.chef.onclick = function () { var S = self.S, active = S.status === "playing" || S.status === "paused"; self.chooseChef(S.chef === "m" ? "f" : "m", false); if (active) self.play(S.i); };
  this.voiceSel.onchange = function () { var S = self.S; S.voiceURI = self.voiceSel.value; store.set("mr-voice", S.voiceURI); if (S.status === "playing" || S.status === "paused") self.play(S.i); };
  this.chap.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) self.play(+b.dataset.i); });
  this.segs.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) self.play(+b.dataset.i); });
  window.addEventListener("keydown", function (e) {
    if (root.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); self.close(); return; }
    if (e.target.closest && e.target.closest("select,input,textarea") || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === " " && !(e.target.closest && e.target.closest("button"))) { e.preventDefault(); self.toggle(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); self.play(self.S.i + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); self.play(self.S.i - 1); }
    else if (e.key === "r" || e.key === "R") self.play(self.S.i);
  }, true);
  window.addEventListener("hashchange", function () { if (!root.hidden) self.close(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && self.S.status === "playing") self.pause(); });
  this.syncOpts(); this.fillVoices();
}
Player.prototype.syncOpts = function () {
  this.btn.sound.setAttribute("aria-pressed", String(this.S.sound));
  this.btn.auto.setAttribute("aria-pressed", String(this.S.auto));
  this.btn.chef.textContent = this.S.chef ? "Chef " + CHEFS[this.S.chef].name + " · changer" : "Changer de chef";
};
Player.prototype.fillVoices = function () {
  var cur = this.voiceSel.value || this.S.voiceURI;
  this.voiceSel.innerHTML = '<option value="">Automatique</option>' + VOICES.map(function (v) { return '<option value="' + esc(v.voiceURI) + '">' + esc(v.name) + " (" + esc(v.lang) + ")</option>"; }).join("");
  if (cur && VOICES.some(function (v) { return v.voiceURI === cur; })) this.voiceSel.value = cur;
  this.voiceSel.parentNode.hidden = !speechOk || !VOICES.length;
};
Player.prototype.pickVoice = function () {
  var S = this.S, v;
  if (S.voiceURI) { v = VOICES.filter(function (x) { return x.voiceURI === S.voiceURI; })[0]; if (v) return { v: v, adjust: false }; }
  if (!VOICES.length) return { v: null, adjust: true };
  var best = VOICES.slice().sort(function (a, b) { return voiceScore(b, S.chef) - voiceScore(a, S.chef); })[0];
  var want = S.chef === "m" ? MASC : FEM;
  return { v: best, adjust: !want.test(best.name) };
};
Player.prototype.mountChef = function () { this.slot.innerHTML = chefMarkup(this.S.chef || "f"); this.chef = this.slot.querySelector(".cv-chef"); };
Player.prototype.setGesture = function (g) { if (!this.chef) return; this.chef.setAttribute("data-g", g); this.chef.setAttribute("data-tool", TOOL[g] || ""); };
Player.prototype.setMouth = function (n) { if (this.chef) this.chef.setAttribute("data-mouth", String(n)); };
Player.prototype.showScene = function (name) { this.scenes.querySelectorAll(".scene").forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-scene") === name); }); };
Player.prototype.setFood = function (f) { this.stage.style.setProperty("--food", f[0]); this.stage.style.setProperty("--food2", f[1]); this.stage.style.setProperty("--food3", f[2]); };
Player.prototype.setStatus = function (st) {
  var S = this.S, last = S.i >= this.clips.length - 1; S.status = st;
  this.stage.classList.toggle("paused", st === "paused"); this.stage.classList.toggle("idle", st === "idle"); this.stage.classList.toggle("ended", st === "ended");
  if (this.chef) this.chef.classList.toggle("talking", st === "playing");
  this.root.querySelector(".cv-pi").innerHTML = st === "playing" ? ICON_PAUSE : ICON_PLAY;
  this.root.querySelector(".cv-pl").textContent = st === "playing" ? "Pause" : st === "paused" ? "Reprendre" : st === "ended" ? (last ? "Revoir" : "Continuer") : "Lancer";
  this.btn.prev.disabled = S.i === 0; this.btn.next.disabled = last;
};
Player.prototype.renderLists = function () {
  var html = "", grp = null, n = 0, self = this;
  this.clips.forEach(function (c, i) {
    if (c.group !== grp) { html += '<li class="grp">' + esc(c.group) + "</li>"; grp = c.group; n = 0; }
    n++; html += '<li><button type="button" data-i="' + i + '"><span class="n">' + n + "</span><span>" + esc(c.label) + "</span></button></li>";
  });
  this.chap.innerHTML = html;
  this.segs.innerHTML = this.clips.map(function (c, i) { return '<button type="button" data-i="' + i + '" title="' + esc(c.badge) + '" aria-label="' + esc(c.badge) + '"' + (i > 0 && self.clips[i - 1].group !== c.group ? ' class="gap"' : "") + "><i></i></button>"; }).join("");
};
Player.prototype.markCurrent = function () {
  var i = this.S.i, chap = this.chap.parentNode;
  this.chap.querySelectorAll("button[data-i]").forEach(function (b) { b.setAttribute("aria-current", +b.dataset.i === i ? "true" : "false"); });
  var cur = this.chap.querySelector('button[aria-current="true"]');
  if (cur && chap.scrollHeight > chap.clientHeight) { var top = cur.offsetTop - chap.clientHeight / 2; chap.scrollTop = Math.max(0, top); }
  Array.prototype.forEach.call(this.segs.children, function (b, k) { b.firstChild.style.width = k < i ? "100%" : "0"; });
};
Player.prototype.setFrac = function (f) {
  var S = this.S, c = this.clips[S.i];
  S.frac = Math.max(S.frac, Math.min(1, f));
  this.fill.style.width = (S.frac * 100).toFixed(1) + "%";
  var seg = this.segs.children[S.i]; if (seg) seg.firstChild.style.width = (S.frac * 100).toFixed(1) + "%";
  while (S.actIdx + 1 < c.acts.length && S.frac >= c.acts[S.actIdx + 1].pos) { S.actIdx++; this.showScene(c.acts[S.actIdx].scene); this.setGesture(c.acts[S.actIdx].g); }
};
Player.prototype.renderIngr = function (on) {
  if (!on) { this.ingr.hidden = true; this.ingr.innerHTML = ""; return; }
  var list = this.recipe.ingredients, per = (this.S.est * 0.85) / list.length;
  this.ingr.innerHTML = "<h4>Ingrédients</h4><ul>" + list.map(function (t, k) { return '<li style="--d:' + ((800 + k * per) / 1000).toFixed(2) + 's">' + esc(t) + "</li>"; }).join("") + "</ul>";
  this.ingr.hidden = false;
};
Player.prototype.portrait = function (k) { return '<svg viewBox="140 0 200 290" aria-hidden="true">' + chefMarkup(k) + "</svg>"; };
Player.prototype.showPicker = function (startAt) {
  var self = this, S = this.S; S.pending = startAt == null ? S.i : startAt;
  this.ov.className = "cv-ov";
  this.ov.innerHTML = '<div class="cv-ovbox"><h4>Qui cuisine avec toi ?</h4><div class="cv-pick">' +
    ["f", "m"].map(function (k) { return '<button type="button" data-chef="' + k + '" aria-pressed="' + (S.chef === k) + '">' + self.portrait(k) + "<b>Chef " + CHEFS[k].name + "</b><small>" + CHEFS[k].role + "</small></button>"; }).join("") +
    "</div><p>Choisis ton chef pour lancer la vidéo.</p></div>";
  this.ov.hidden = false;
  this.ov.querySelectorAll("[data-chef]").forEach(function (b) { b.onclick = function () { self.chooseChef(b.getAttribute("data-chef"), true); }; });
};
Player.prototype.showStart = function () {
  var self = this, S = this.S;
  this.ov.className = "cv-ov";
  this.ov.innerHTML = '<div class="cv-ovbox"><h4>' + esc(this.recipe.name) + "</h4><p>Avec Chef " + CHEFS[S.chef].name + " · " + this.clips.length + " mini-vidéos</p>" +
    '<div class="cv-acts"><button class="cv-btn big" type="button" data-o="go">' + ICON_PLAY + 'Lancer la vidéo</button><button class="cv-btn alt" type="button" data-o="swap">Changer de chef</button></div></div>';
  this.ov.hidden = false;
  this.ov.querySelector('[data-o="go"]').onclick = function () { self.play(S.pending); };
  this.ov.querySelector('[data-o="swap"]').onclick = function () { self.showPicker(S.pending); };
  this.ov.querySelector('[data-o="go"]').focus({ preventScroll: true });
};
Player.prototype.showEnd = function () {
  var self = this, S = this.S, last = S.i >= this.clips.length - 1;
  this.ov.className = "cv-ov light";
  this.ov.innerHTML = last
    ? '<div class="cv-ovbox"><h4>Bon appétit !</h4><div class="cv-acts"><button class="cv-btn alt" type="button" data-o="re">↺ Rejouer</button><button class="cv-btn big" type="button" data-o="all">Revoir depuis le début</button></div></div>'
    : '<div class="cv-ovbox"><div class="cv-acts"><button class="cv-btn alt big" type="button" data-o="re">↺ Rejouer</button><button class="cv-btn big" type="button" data-o="next">Continuer ▶</button></div><p>Suivant : ' + esc(this.clips[S.i + 1].badge) + "</p></div>";
  this.ov.hidden = false;
  this.ov.querySelector('[data-o="re"]').onclick = function () { self.play(S.i); };
  var nx = this.ov.querySelector(last ? '[data-o="all"]' : '[data-o="next"]');
  nx.onclick = function () { self.play(last ? 0 : S.i + 1); };
  nx.focus({ preventScroll: true });
};
Player.prototype.hideOv = function () { this.ov.hidden = true; this.ov.innerHTML = ""; };
Player.prototype.clearTimers = function () { var t = this.timers; clearInterval(t.tick); clearInterval(t.mouth); clearTimeout(t.safety); clearTimeout(t.end); this.timers = {}; };
Player.prototype.stopAll = function () {
  this.S.token++; this.clearTimers();
  if (speechOk) { try { speechSynthesis.cancel(); } catch (e) {} }
  if (this.audio) { this.audio.onended = this.audio.onerror = this.audio.ontimeupdate = null; try { this.audio.pause(); } catch (e) {} }
  this.utt = null; this.setMouth(0);
};
Player.prototype.startMouth = function () {
  var self = this; clearInterval(this.timers.mouth);
  if (this.S.mode === "audio" && this.an) {
    var buf = new Uint8Array(this.an.fftSize);
    this.timers.mouth = setInterval(function () {
      self.an.getByteTimeDomainData(buf);
      var sum = 0; for (var i = 0; i < buf.length; i++) { var d = (buf[i] - 128) / 128; sum += d * d; }
      var rms = Math.sqrt(sum / buf.length);
      self.setMouth(rms < 0.02 ? 0 : rms < 0.07 ? 1 : 2);
    }, 70);
    return;
  }
  this.timers.mouth = setInterval(function () { var r = Math.random(); self.setMouth(r < .3 ? 0 : r < .7 ? 1 : 2); }, 115);
};
Player.prototype.startTick = function () {
  var self = this, S = this.S; clearInterval(this.timers.tick); S.tStart = performance.now();
  this.timers.tick = setInterval(function () {
    var el = S.elapsed + (performance.now() - S.tStart);
    if (S.mode === "audio") { var a = self.audio; if (a && a.duration) self.setFrac(a.currentTime / a.duration); }
    else if (S.mode === "silent") { self.setFrac(el / S.est); if (el >= S.est) self.finish(S.token); }
    else self.setFrac(Math.min(.96, el / S.est));
  }, 60);
};
Player.prototype.playAudio = function (url, text, tok) {
  var self = this, S = this.S;
  if (!this.audio) {
    this.audio = new Audio(); this.audio.preload = "auto";
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { this.actx = new AC(); var src = this.actx.createMediaElementSource(this.audio); this.an = this.actx.createAnalyser(); this.an.fftSize = 512; src.connect(this.an); this.an.connect(this.actx.destination); }
    } catch (e) { this.an = null; }
  }
  if (this.actx && this.actx.state === "suspended") { try { this.actx.resume(); } catch (e) {} }
  var a = this.audio, fallback = function () { if (tok !== S.token) return; a.onended = a.onerror = null; S.mode = speechOk && S.sound ? "voice" : "silent"; self.startMouth(); if (S.mode === "voice") self.speak(text, tok); };
  a.onended = function () { if (tok === S.token) self.finish(tok); };
  a.onerror = fallback;
  a.onloadedmetadata = function () { if (tok === S.token && a.duration && isFinite(a.duration)) { S.est = a.duration * 1000; if (self.clips[S.i].ingr) self.renderIngr(true); } };
  a.src = url;
  var p = a.play(); if (p && p.catch) p.catch(function (e) { if (e && e.name === "AbortError") return; fallback(); });
};
Player.prototype.play = function (i) {
  var S = this.S;
  if (!S.chef) { this.showPicker(i); return; }
  this.stopAll(); this.hideOv();
  S.i = Math.max(0, Math.min(this.clips.length - 1, i));
  var c = this.clips[S.i], tok = S.token;
  S.frac = 0; S.elapsed = 0; S.actIdx = 0; S.restart = false;
  S.est = Math.max(2600, c.text.split(/\s+/).length / 2.55 * 1000 + 600);
  this.badge.textContent = c.badge; this.subs.textContent = c.text;
  this.setFood(c.food); this.showScene(c.acts[0].scene); this.setGesture(c.acts[0].g);
  var temp = c.text.match(/(\d{2,3}) degrés/); var tEl = this.root.querySelector(".cv-temp"); if (tEl) tEl.textContent = (temp ? temp[1] : "180") + "°C";
  this.renderIngr(!!c.ingr);
  this.markCurrent(); this.fill.style.width = "0";
  this.setStatus("playing");
  var url = S.sound ? audioUrl(S.chef, c.text) : null;
  S.mode = url ? "audio" : S.sound && speechOk ? "voice" : "silent";
  if (url) this.playAudio(url, c.text, tok);
  this.startMouth(); this.startTick();
  if (S.mode === "voice") this.speak(c.text, tok);
};
Player.prototype.speak = function (text, tok) {
  var self = this, S = this.S, u = new SpeechSynthesisUtterance(text), pv = this.pickVoice();
  if (pv.v) { u.voice = pv.v; u.lang = pv.v.lang; } else u.lang = "fr-FR";
  u.rate = pv.v && /natural|neural|online|premium|enhanced/i.test(pv.v.name) ? 1 : 0.95; u.pitch = pv.adjust ? CHEFS[S.chef].pitch : 1;
  u.onboundary = function (e) { if (tok !== S.token) return; if (typeof e.charIndex === "number") self.setFrac(e.charIndex / text.length); self.setMouth(2); };
  u.onend = function () { if (tok === S.token) self.finish(tok); };
  u.onerror = function (e) {
    if (tok !== S.token || e.error === "interrupted" || e.error === "canceled") return;
    self.note.innerHTML = '<span class="cv-warn">La voix n’est pas disponible sur cet appareil : la vidéo continue avec les sous-titres.</span>';
    S.mode = "silent"; S.elapsed += performance.now() - S.tStart; self.startTick();
  };
  this.utt = u;
  this.timers.safety = setTimeout(function () { if (tok === S.token && S.status === "playing") self.finish(tok); }, S.est * 2.6 + 5000);
  speechSynthesis.speak(u);
};
Player.prototype.finish = function (tok) {
  var self = this, S = this.S;
  if (tok !== S.token || S.status === "ended") return;
  this.clearTimers(); this.setFrac(1); this.setMouth(0); this.setStatus("ended");
  this.setGesture(S.i === this.clips.length - 1 ? "present" : "rest");
  if (S.auto && S.i < this.clips.length - 1) this.timers.end = setTimeout(function () { if (tok === S.token) self.play(S.i + 1); }, 900);
  else this.showEnd();
};
Player.prototype.pause = function () {
  var S = this.S; if (S.status !== "playing") return;
  clearInterval(this.timers.tick); clearInterval(this.timers.mouth); this.setMouth(0);
  S.elapsed += performance.now() - S.tStart; this.setStatus("paused");
  if (S.mode === "audio" && this.audio) { this.audio.pause(); return; }
  if (S.mode === "voice") {
    try { speechSynthesis.pause(); } catch (e) {}
    var tok = S.token;
    setTimeout(function () { if (tok === S.token && S.status === "paused" && speechSynthesis.speaking && !speechSynthesis.paused) { S.restart = true; S.token++; speechSynthesis.cancel(); } }, 350);
  }
};
Player.prototype.resume = function () {
  var self = this, S = this.S; if (S.status !== "paused") return;
  if (S.restart) { this.play(S.i); return; }
  this.setStatus("playing"); this.startMouth(); this.startTick();
  if (S.mode === "audio" && this.audio) { if (this.actx && this.actx.state === "suspended") this.actx.resume(); var p = this.audio.play(); if (p && p.catch) p.catch(function () { self.play(S.i); }); return; }
  if (S.mode === "voice") {
    try { speechSynthesis.resume(); } catch (e) {}
    var tok = S.token;
    setTimeout(function () { if (tok === S.token && S.status === "playing" && !speechSynthesis.speaking) self.play(S.i); }, 600);
  }
};
Player.prototype.toggle = function () {
  var S = this.S;
  if (!S.chef) return this.showPicker(S.i);
  if (S.status === "playing") this.pause();
  else if (S.status === "paused") this.resume();
  else if (S.status === "ended") this.play(S.i < this.clips.length - 1 ? S.i + 1 : 0);
  else this.play(S.i);
};
Player.prototype.chooseChef = function (k, start) {
  this.S.chef = k; store.set("mr-chef", k);
  this.mountChef(); this.setGesture(this.clips[this.S.i].acts[0].g); this.syncOpts();
  if (start) this.play(this.S.pending);
};
Player.prototype.open = function (recipe, stepIndex, opts) {
  opts = opts || {};
  this.recipe = recipe; this.clips = buildClips(recipe);
  this.stopAll(); loadManifest();
  var start = 0;
  if (stepIndex != null) { for (var i = 0; i < this.clips.length; i++) if (this.clips[i].step === stepIndex) { start = i; break; } }
  this.S.i = start; this.S.pending = start;
  this.title.textContent = recipe.name;
  this.root.setAttribute("aria-label", "Vidéo : " + recipe.name);
  this.renderLists(); this.mountChef();
  this.setFood(this.clips[start].food); this.showScene(this.clips[start].acts[0].scene); this.setGesture(start ? this.clips[start].acts[0].g : "wave");
  this.badge.textContent = this.clips[start].badge; this.subs.textContent = ""; this.renderIngr(false);
  this.markCurrent(); this.fill.style.width = "0"; this.setStatus("idle"); this.syncOpts(); this.fillVoices();
  this.note.textContent = speechOk ? "Une mini-vidéo par phrase. À la fin de chaque phrase, la vidéo s’arrête : rejoue-la ou continue." : "Ce navigateur ne sait pas lire à voix haute : la vidéo passe avec les sous-titres.";
  this.lastFocus = document.activeElement;
  this.root.hidden = false; document.documentElement.style.overflow = "hidden";
  if (this.S.chef && !opts.pick) this.showStart(); else this.showPicker(start);
};
Player.prototype.close = function () {
  this.stopAll(); this.setStatus("idle"); this.hideOv();
  this.root.hidden = true; document.documentElement.style.overflow = "";
  if (this.lastFocus && this.lastFocus.focus) try { this.lastFocus.focus({ preventScroll: true }); } catch (e) {}
};

/* ---------------- API ---------------- */
function ensure() {
  if (!P) { var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); P = new Player(); }
  return P;
}
window.ChefVideo = {
  open: function (recipe, stepIndex, opts) { if (!recipe || !recipe.steps || !recipe.steps.length) return; ensure().open(recipe, stepIndex, opts); },
  close: function () { if (P) P.close(); },
  _buildClips: buildClips,
  _hash: hashText,
  CHEFS: CHEFS
};
})();
