// Daily Games score rules (live-updatable: the Android app runs these on raw screen text it couldn't parse natively).
// Port of ScoreParser.java. Result: {gid, v, f, fl, title, puzzle}
(function(G){
const LI=[["mini sudoku","sudoku"],["sudoku","sudoku"],["wend","wend"],["zip","zip"],["patches","patches"],["tango","tango"],["queens","queens"],["crossclimb","crossclimb"],["pinpoint","pinpoint"]];
const norm=s=>s==null?"":String(s).replace(/[\u2019\u2018]/g,"'").replace(/[\u00a0\u2009]/g," ").replace(/[ \t]+/g," ").trim();
const R=(gid,o)=>Object.assign({gid,v:0,f:false,fl:false,title:null,puzzle:""},o||{});
function linkedin(L,all){
 const m=/\b([A-Za-z][A-Za-z ]{1,20}?)\s*#\s*(\d{1,5})\s*\|\s*(?:today'?s\s*)?avg\.?:?\s*(\d{1,2}:\d{2}|\d+(?:\.\d+)?)/i.exec(all);
 if(!m)return null;const game=m[1].trim().toLowerCase();let gid=null;
 for(const x of LI)if(game.endsWith(x[0])){gid=x[1];break}
 if(!gid)return null;const r=R(gid,{puzzle:m[2]});
 if(gid==="pinpoint"){
  for(const s of L){const p=/^(\d)\s*guess(?:es)?\s*!?$/i.exec(s);if(p){r.v=+p[1];return r}}
  const p=/\b(\d)\s*guess(?:es)?\s*!/i.exec(all);if(p){r.v=+p[1];return r}
  if(/better luck|not this time|out of guesses/i.test(all)){r.f=true;return r}
  return null}
 let t=null;
 for(const s of L){if(s.includes("|")||s.toLowerCase().includes("avg"))continue;
  const tm=/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.exec(s);if(tm){t=(tm[1]?+tm[1]:0)*3600+ +tm[2]*60+ +tm[3];break}}
 if(t==null){const pre=all.substring(0,m.index);const tm=/(?:^|\s)(\d{1,2}):(\d{2})(?![\s\S]*\d{1,2}:\d{2})/.exec(pre);if(tm)t=+tm[1]*60+ +tm[2]}
 if(t==null)return null;r.v=t;r.fl=/\bno (hints|mistakes|backtracks?)\b|flawless/i.test(all);return r}
function wordle(L,all){
 const sm=/wordle\s+[\d,.]+\s+([1-6X])\s*\/\s*6/i.exec(all);
 if(sm){return /x/i.test(sm[1])?R("wordle",{f:true}):R("wordle",{v:+sm[1]})}
 const ctx=all.toLowerCase().includes("wordle")||all.includes("nytimes.com")||/letter,?\s*[A-Z],?\s*(correct|present|absent)/i.test(all);
 if(!ctx)return null;const st=[];
 for(const s of L){const re=/(\d)(?:st|nd|rd|th)\s+letter,?\s*([A-Z]),?\s*(correct|present|absent|empty)/ig;let a,any=false;
  while((a=re.exec(s))){any=true;st.push(a[3].toLowerCase())}
  if(!any){const b=/^([A-Z])[,\s]+(correct|present|absent)\b/i.exec(s);if(b)st.push(b[2].toLowerCase())}}
 const filled=st.filter(s=>s!=="empty");if(filled.length<5)return null;const rows=Math.floor(filled.length/5);
 for(let i=0;i<rows&&i<6;i++){let ok=true;for(let j=0;j<5;j++)if(filled[i*5+j]!=="correct")ok=false;if(ok)return R("wordle",{v:i+1})}
 if(rows>=6)return R("wordle",{f:true});return null}
function connections(L,all){
 const lo=all.toLowerCase();const ctx=lo.includes("connections")&&(lo.includes("share your results")||lo.includes("back to puzzle")||lo.includes("view results"));
 let rows=0,solved=0;const SQ=new Set([0x1F7E8,0x1F7E9,0x1F7E6,0x1F7EA]);
 for(const s of all.split("\n")){const sq=[];for(const ch of s){const c=ch.codePointAt(0);if(SQ.has(c))sq.push(c)}
  if(sq.length===4){rows++;if(sq.every(c=>c===sq[0]))solved++}}
 if(rows>=4&&lo.includes("connections"))return R("connections",{v:rows-solved,f:solved<4});
 if(!ctx)return null;
 const heads=[["perfect!","0"],["great!","1"],["solid!","2"],["phew!","3"],["next time!","F"]];
 for(const s of L){const x=s.toLowerCase();for(const h of heads)if(x===h[0]||x===h[0].replace("!",""))return h[1]==="F"?R("connections",{f:true,v:4}):R("connections",{v:+h[1]})}
 const mm=/mistakes?\s*(?:made)?:?\s*(\d)/i.exec(all);if(mm){const v=+mm[1];return R("connections",{v,f:v>=4})}
 return null}
function globle(L,all,today){
 const lo=all.toLowerCase();if(!(lo.includes("globle")))return null;
 const m=/today'?s\s*guesses\s*:?\s*\n?\s*(\d{1,3})\b/i.exec(all);if(!m)return null;const v=+m[1];if(v<=0)return null;
 const lw=/last\s*win\s*:?\s*\n?\s*(\d{4}-\d{2}-\d{2})/i.exec(all);if(lw&&today&&lw[1]!==today)return null;
 return R("globle",{v})}
function songless(L,all){
 let iw=-1;for(let i=0;i<L.length;i++)if(L[i].toLowerCase().startsWith("the song was")){iw=i;break}
 if(iw<0)return null;let title=L[iw].substring(12).trim();if(!title&&iw+1<L.length)title=L[iw+1];if(!title)return null;
 const m=/solved\s*in\s*:?\s*\n?\s*([1-6]|[xX\u00d7\u2715\u2717])(?![\d.])/i.exec(all);if(!m)return null;
 return R("songless",{title,v:/\d/.test(m[1][0])?+m[1]:6})}
function krillion(L,all){
 const d=/dive\s*#\s*(\d+)\s*complete/i.exec(all);if(!d)return null;const after=all.substring(d.index+d[0].length);
 let v=null;const n=/^\s*(\d{1,4})\s*(?:pts|points)?\s*$/m.exec(after);if(n)v=+n[1];
 if(v==null){const s=/score\D{0,5}(\d{1,4})/i.exec(all);if(s)v=+s[1]}
 if(v==null)return null;return R("krillion",{v,puzzle:d[1]})}
function parse(lines,today){const L=[];for(const s of lines){const n=norm(s);if(n)L.push(n)}const all=L.join("\n");const out=[];
 for(const f of [linkedin,wordle,connections]){const r=f(L,all);if(r)out.push(r)}
 let r=globle(L,all,today);if(r)out.push(r);
 for(const f of [songless,krillion]){r=f(L,all);if(r)out.push(r)}
 return out}
G.DGRules={version:"2026-10-17",parse};
})(typeof window!=="undefined"?window:globalThis);
