```javascript
var UNITS=[{n:"Environments"},{n:"Interactions"},{n:"Heroes"},{n:"Events That Matter"},{n:"Finding Solutions"}];
var TABS=["Overview","I Do","We Do","You Do","Scaffold and Diff","Data Tracker","Daily Plan"];
var WC={"ELP 1":"e1","ELP 2":"e2","ELP 3":"e3","ELP 4":"e4","ELP 5-6":"e56"};
var W=LESSONS;
var mode="push",sel=null,curTab=0,uW;

window.addEventListener("DOMContentLoaded",function(){
  uW=[[],[],[],[],[]];
  W.forEach(function(w,i){uW[w.u].push(i);});
  buildNav();

  document.getElementById("bp").addEventListener("click",function(){setMode("push");});
  document.getElementById("bl").addEventListener("click",function(){setMode("pull");});
  document.getElementById("sbtog").addEventListener("click",function(){document.getElementById("sb").classList.toggle("open");});
  document.getElementById("pbtn").addEventListener("click",function(){window.print();});
  document.getElementById("srch").addEventListener("input",function(){buildNav(this.value.toLowerCase());});

  document.getElementById("nav").addEventListener("click",function(e){
    var uh=e.target.closest(".uhdr");
    if(uh){toggleU(parseInt(uh.dataset.ui));return;}
    var wi=e.target.closest(".witem");
    if(wi){loadLesson(parseInt(wi.dataset.wi));return;}
  });

  document.getElementById("cw").addEventListener("click",function(e){
    var t=e.target.closest(".tab");
    if(t){switchTab(parseInt(t.dataset.tab));return;}
    var act=e.target.dataset.action;
    if(act==="showAF"){showAF();return;}
    if(act==="hideAF"){hideAF();return;}
    if(act==="addS"){addStudent();return;}
    if(act==="printDT"){printDT();return;}
    var del=e.target.closest("[data-action='del']");
    if(del){delStudent(parseInt(del.dataset.idx));return;}
  });

  document.getElementById("cw").addEventListener("change",function(e){
    var el=e.target;
    if(el.classList.contains("dtck")){
      var a=loadDT();
      a[parseInt(el.dataset.i)][el.dataset.f]=el.checked;
      saveDT(a);
      refreshSummary();
    }
  });

  document.getElementById("cw").addEventListener("input",function(e){
    var el=e.target;
    if(el.classList.contains("dtnote")){
      var a=loadDT();
      a[parseInt(el.dataset.i)].notes=el.value;
      saveDT(a);
    }
  });
});

function buildNav(q){
  q=q||"";
  var nav=document.getElementById("nav");
  nav.innerHTML="";
  UNITS.forEach(function(u,ui){
    var rows=uW[ui].filter(function(wi){
      return !q||(W[wi].t+" "+W[wi].x+" "+W[wi].s.join(" ")).toLowerCase().indexOf(q)>-1;
    });
    if(q&&!rows.length)return;
    var open=!q&&sel!==null&&W[sel].u===ui;
    var div=document.createElement("div");
    div.className="unit";
    var hdr=document.createElement("div");
    hdr.className="uhdr";
    hdr.dataset.ui=ui;
    hdr.innerHTML="<div class='un'>"+(ui+1)+"</div><div class='uname'>Unit "+(ui+1)+": "+u.n+"</div><span class='uchev"+(open?" o":"")+"' id='ch"+ui+"'>&#9658;</span>";
    div.appendChild(hdr);
    var wl=document.createElement("div");
    wl.className="wks"+(open?" o":"");
    wl.id="wl"+ui;
    rows.forEach(function(wi){
      var it=document.createElement("div");
      it.className="witem"+(sel===wi?" sel":"");
      it.id="wr"+wi;
      it.dataset.wi=wi;
      it.textContent="Wk "+W[wi].w+": "+W[wi].t;
      wl.appendChild(it);
    });
    div.appendChild(wl);
    nav.appendChild(div);
  });
}

function toggleU(ui){
  var wl=document.getElementById("wl"+ui);
  var ch=document.getElementById("ch"+ui);
  if(wl)wl.classList.toggle("o");
  if(ch)ch.classList.toggle("o");
}

function setMode(m){
  mode=m;
  document.getElementById("bp").classList.toggle("on",m==="push");
  document.getElementById("bl").classList.toggle("on",m==="pull");
  if(sel!==null)renderLesson();
}

function loadLesson(wi){
  if(sel!==null){
    var p=document.getElementById("wr"+sel);
    if(p)p.classList.remove("sel");
  }
  sel=wi;
  curTab=0;
  var r=document.getElementById("wr"+wi);
  if(r)r.classList.add("sel");
  document.getElementById("sb").classList.remove("open");
  document.getElementById("wel").style.display="none";
  document.getElementById("cw").style.display="block";
  renderLesson();
  window.scrollTo(0,0);
}

function switchTab(i){
  curTab=i;
  document.querySelectorAll(".tab").forEach(function(t){t.classList.toggle("on",parseInt(t.dataset.tab)===i);});
  document.querySelectorAll(".tc").forEach(function(t,ti){t.classList.toggle("on",ti===i);});
}

function safe(s){
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function widaHtml(wd){
  var h="";
  Object.keys(wd).forEach(function(lv){
    var cl=WC[lv]||"e56";
    h+="<div class='wrow'><span class='wb "+cl+"'>"+safe(lv)+"</span><span class='wtx'>"+safe(wd[lv])+"</span></div>";
  });
  return h;
}

function vocabHtml(d){
  var h="<div class='tg'><div class='tlb'>Tier 1</div><div class='vchips'>";
  h+=d.v1.map(function(v){return "<span class='vc'>"+safe(v)+"</span>";}).join("");
  h+="</div></div><div class='tg'><div class='tlb'>Tier 2</div><div class='vchips'>";
  h+=d.v2.map(function(v){return "<span class='vc t2'>"+safe(v)+"</span>";}).join("");
  h+="</div></div><div class='tg'><div class='tlb'>Tier 3</div><div class='vchips'>";
  h+=d.v3.map(function(v){return "<span class='vc t3'>"+safe(v)+"</span>";}).join("");
  h+="</div></div>";
  return h;
}

function diffHtml(df){
  var h="<div class='dr'>";
  h+="<div class='drow'><span class='dlv d0'>Below</span><span class='dtx'>"+safe(df.b)+"</span></div>";
  h+="<div class='drow'><span class='dlv d1'>On Level</span><span class='dtx'>"+safe(df.o)+"</span></div>";
  h+="<div class='drow'><span class='dlv d2'>Above</span><span class='dtx'>"+safe(df.a)+"</span></div>";
  h+="<div class='drow'><span class='dlv d3'>ELP Mix</span><span class='dtx'>"+safe(df.e)+"</span></div>";
  h+="</div>";
  return h;
}

function tryBox(tp){
  return "<div class='try'><div class='try-i'>&#10024;</div><div><div class='try-l'>Try This</div><div class='try-t'>"+safe(tp)+"</div></div></div>";
}

function say(lbl,txt){
  return "<div class='say'><span class='sl2'>"+lbl+"</span>"+txt+"</div>";
}

function doBox(lbl,txt){
  return "<div class='do'><span class='dl'>"+lbl+"</span>"+txt+"</div>";
}

function elpBox(lbl,txt){
  return "<div class='elpb'><span class='el'>"+lbl+"</span>"+safe(txt)+"</div>";
}

function genOverview(d){
  var h="<div class='ob'><div class='olb'>Content Objective</div><div class='stx'>"+safe(d.co)+"</div></div>";
  h+="<div class='ob lang'><div class='olb'>Language Objective</div><div class='stx'>"+safe(d.lo)+"</div></div>";
  h+="<div class='sh'>WIDA ELP Levels</div>"+widaHtml(d.wd);
  h+="<div class='sh'>Vocabulary</div>"+vocabHtml(d);
  return h;
}

function genIDo(d){
  var h="<div class='phdr ido-h'>I DO - Teacher Models</div>";
  h+=say("SAY:","Today we are going to "+safe(d.co)+" Our language goal is: <em>"+safe(d.lo)+"</em>");
  h+=doBox("SETUP:","Distribute <strong>"+safe(d.mn[0])+"</strong>. Write the language objective frame on the board.");
  h+=doBox("VOCAB PREVIEW:","Preview Tier 2 words: <strong>"+d.v2.map(safe).join(" - ")+"</strong>. Say each word, show the picture, students repeat chorally 3 times.");
  h+=say("THINK ALOUD:","Watch me model this step by step. I am going to THINK OUT LOUD. Watch and listen - do not write yet.");
  h+=doBox("MODEL 1:","Complete one full example using "+safe(d.mn[0])+". Narrate every step of your thinking using the LO frame.");
  h+=say("SAY:","Notice what I did: found evidence first, used a vocabulary word, completed the frame. Let me try one more example.");
  h+=doBox("MODEL 2:","A second example with different evidence and a different color marker. Ask: did I follow the same steps?");
  h+=elpBox("ELP 1-2 SUPPORT:",d.sc[0]+" Ensure ELP 1-2 students have a completed model to reference.");
  h+=say("CHECK:","Thumbs up if you understand. Thumbs sideways if you need to see it once more. Thumbs down for more help.");
  h+=tryBox(d.tp);
  return h;
}

function genWeDo(d){
  var wk=Object.keys(d.wd);
  var h="<div class='phdr wedo-h'>WE DO - Guided Practice</div>";
  h+=say("SAY:","Now let us try this together. We are going to practice as a team.");
  h+=doBox("GUIDED TASK:","Begin "+safe(d.ac)+" together as a class. Complete the first item together before releasing to partner work.");
  h+=say("PARTNER TALK:","Turn to your partner. Use the language objective frame to start. I will give you 45 seconds.");
  h+=doBox("WAIT TIME:","Give genuine 45 to 60 second think time. Circulate and note who is using the frame independently.");
  h+=elpBox("PROMPT ELP 1-2:",wk[0]?d.wd[wk[0]]:"Accept pointing, gesturing, and one-word responses.");
  h+=elpBox("PROMPT ELP 3-4:",wk[2]?d.wd[wk[2]]:"Use sentence starters to support.");
  h+=elpBox("PROMPT ELP 5-6:",wk[4]?d.wd[wk[4]]:(wk[3]?d.wd[wk[3]]:"Extend thinking with evidence."));
  h+=doBox("PRAISE:","I love how you used the sentence frame. That is exactly the right vocabulary word.");
  h+=doBox("SHARE OUT:","Call on 2 to 3 students. Restate using full academic language. Say it together as a class.");
  h+=say("TRANSITION:","You worked so well together. Now I want to see you try this on your own.");
  return h;
}

function genYouDo(d){
  var h="<div class='phdr youdo-h'>YOU DO - Independent Practice</div>";
  h+=say("SAY:","Now it is your turn. You have everything you need. I believe in you.");
  h+=doBox("STUDENT TASK:",safe(d.ac));
  h+=say("REMIND:","If you are stuck: check your language objective frame, check the word wall, ask your partner, then raise your hand.");
  h+="<div class='sh'>Differentiated Tasks by ELP Level:</div>"+widaHtml(d.wd);
  h+="<div class='sh'>Differentiated Tasks by Reading Level:</div>"+diffHtml(d.df);
  h+=doBox("MONITOR:","Circulate with the data tracker open. Note who uses the frame independently and who is stuck.");
  h+=say("CLOSE:","Let us share out. There is no wrong answer if you used evidence and tried your best.");
  h+=tryBox(d.tp);
  return h;
}

function genSD(d){
  var h="<div class='sh'>Manipulatives and Materials</div><div class='mchips'>";
  h+=d.mn.map(function(m){return "<span class='mch'>&#128230; "+safe(m)+"</span>";}).join("");
  h+="</div><div class='sh'>Scaffolding Strategies</div><ul class='sul'>";
  h+=d.sc.map(function(s){return "<li>"+safe(s)+"</li>";}).join("");
  h+="</ul><div class='sh'>WIDA ELP Level Modifications</div>"+widaHtml(d.wd);
  h+="<div class='sh'>Differentiation by Reading Level</div>"+diffHtml(d.df);
  h+="<div class='sh'>Common Misconceptions</div>";
  h+=d.ms.map(function(m){return "<div class='mib'>&#9888; "+safe(m)+"</div>";}).join("");
  h+=tryBox(d.tp);
  return h;
}

function dtKey(){return "dt_"+sel+"_"+mode;}
function loadDT(){
  try{return JSON.parse(localStorage.getItem(dtKey()))||[];}
  catch(e){return [];}
}
function saveDT(a){localStorage.setItem(dtKey(),JSON.stringify(a));}

function genDT(){
  var arr=loadDT();
  var d=mode==="push"?W[sel].p:W[sel].l;
  var tot=arr.length;
  var both=arr.filter(function(s){return s.co&&s.lo;}).length;
  var part=arr.filter(function(s){return (s.co||s.lo)&&!(s.co&&s.lo);}).length;
  var none=arr.filter(function(s){return !s.co&&!s.lo;}).length;
  var h="<div class='dth'><div class='dtt'>Data Tracker<br><small style='font-size:.63rem;color:#a78bfa'>";
  h+=(mode==="push"?"Push-In":"Pull-Out")+" - "+safe(W[sel].t)+"</small></div>";
  h+="<div style='display:flex;gap:6px;flex-wrap:wrap'><button class='btn' data-action='showAF'>+ Add Student</button>";
  h+="<button class='btno' data-action='printDT'>&#128424; Print Data</button></div></div>";
  h+="<div class='sums'><div class='sb2'><div class='snum' id='sumT'>"+tot+"</div><div class='slab'>Total</div></div>";
  h+="<div class='sb2' style='background:#f0fdf4;border-color:#bbf7d0'><div class='snum' id='sumB' style='color:#059669'>"+both+"</div><div class='slab'>Both Met</div></div>";
  h+="<div class='sb2' style='background:#fffbeb;border-color:#fcd34d'><div class='snum' id='sumP' style='color:#d97706'>"+part+"</div><div class='slab'>Partial</div></div>";
  h+="<div class='sb2' style='background:#fff7ed;border-color:#fed7aa'><div class='snum' id='sumN' style='color:#ea580c'>"+none+"</div><div class='slab'>Not Yet</div></div></div>";
  h+="<div class='aform' id='addFm'><div class='frow'><input class='fi' id='sn' placeholder='Student name or initials'>";
  h+="<select class='fsel' id='sp'><option value=''>ELP Level</option><option>ELP 1</option><option>ELP 2</option><option>ELP 3</option><option>ELP 4</option><option>ELP 5</option><option>ELP 6</option></select></div>";
  h+="<div class='frow'><button class='btn g' data-action='addS'>Add Student</button><button class='btn r' data-action='hideAF'>Cancel</button></div></div>";
  if(arr.length){
    h+="<div style='overflow-x:auto'><table class='dttable'><thead><tr><th>Student</th><th>ELP</th><th>CO</th><th>LO</th><th>Key Skill</th><th>Notes</th><th></th></tr></thead><tbody>";
    arr.forEach(function(s,i){
      h+="<tr><td><strong>"+safe(s.name)+"</strong></td><td><span class='vc t2'>"+safe(s.elp||"-")+"</span></td>";
      h+="<td><label class='cbx'><input type='checkbox' class='dtck' data-i='"+i+"' data-f='co'"+(s.co?" checked":"")+">&nbsp;Met</label></td>";
      h+="<td><label class='cbx'><input type='checkbox' class='dtck' data-i='"+i+"' data-f='lo'"+(s.lo?" checked":"")+">&nbsp;Met</label></td>";
      h+="<td><label class='cbx'><input type='checkbox' class='dtck' data-i='"+i+"' data-f='sk'"+(s.sk?" checked":"")+">&nbsp;Met</label></td>";
      h+="<td><textarea class='ni dtnote' rows='2' data-i='"+i+"'>"+safe(s.notes||"")+"</textarea></td>";
      h+="<td><button class='delb' data-action='del' data-idx='"+i+"'>&#10005;</button></td></tr>";
    });
    h+="</tbody></table></div>";
  }else{
    h+="<div class='demp'>No students added yet. Tap plus Add Student to begin.</div>";
  }
  return h;
}

function refreshSummary(){
  var arr=loadDT();
  var both=arr.filter(function(s){return s.co&&s.lo;}).length;
  var part=arr.filter(function(s){return (s.co||s.lo)&&!(s.co&&s.lo);}).length;
  var none=arr.filter(function(s){return !s.co&&!s.lo;}).length;
  var t=document.getElementById("sumT");if(t)t.textContent=arr.length;
  var b=document.getElementById("sumB");if(b)b.textContent=both;
  var p=document.getElementById("sumP");if(p)p.textContent=part;
  var n=document.getElementById("sumN");if(n)n.textContent=none;
}

function showAF(){
  var f=document.getElementById("addFm");
  if(f){f.classList.add("open");var s=document.getElementById("sn");if(s)s.focus();}
}
function hideAF(){
  var f=document.getElementById("addFm");
  if(f)f.classList.remove("open");
}

function addStudent(){
  var nmEl=document.getElementById("sn");
  var nm=nmEl?nmEl.value.trim():"";
  if(!nm){alert("Please enter a name or initials.");return;}
  var spEl=document.getElementById("sp");
  var elp=spEl?spEl.value:"";
  var arr=loadDT();
  arr.push({name:nm,elp:elp,co:false,lo:false,sk:false,notes:""});
  saveDT(arr);
  hideAF();
  if(nmEl)nmEl.value="";
  if(spEl)spEl.value="";
  var tabs=document.querySelectorAll(".tc");
  if(tabs[5])tabs[5].innerHTML=genDT();
}

function delStudent(i){
  if(!confirm("Remove this student from tracking?"))return;
  var arr=loadDT();
  arr.splice(i,1);
  saveDT(arr);
  var tabs=document.querySelectorAll(".tc");
  if(tabs[5])tabs[5].innerHTML=genDT();
}

function printDT(){
  var arr=loadDT();
  if(!arr.length){alert("No student data to print yet.");return;}
  var l=W[sel];
  var win=window.open("","_blank");
  var rows=arr.map(function(s){
    var coC=s.co?"green":"#ccc";
    var loC=s.lo?"green":"#ccc";
    var skC=s.sk?"green":"#ccc";
    return "<tr><td>"+safe(s.name)+"</td><td>"+safe(s.elp||"")+"</td>"+
      "<td style='color:"+coC+"'>"+(s.co?"Yes":"-")+"</td>"+
      "<td style='color:"+loC+"'>"+(s.lo?"Yes":"-")+"</td>"+
      "<td style='color:"+skC+"'>"+(s.sk?"Yes":"-")+"</td>"+
      "<td>"+safe(s.notes||"")+"</td></tr>";
  }).join("");
  var html="<!DOCTYPE html><html><head><title>Data Tracker</title><style>";
  html+="body{font-family:system-ui,sans-serif;font-size:12px;padding:20px}";
  html+="table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px 7px}";
  html+="th{background:#ede9fe;font-size:10px;text-transform:uppercase}</style></head><body>";
  html+="<h2>Data Tracker: "+safe(l.t)+"</h2><p>Unit "+(l.u+1)+": "+safe(UNITS[l.u].n)+" - Week "+l.w+" - ";
  html+=(mode==="push"?"Push-In":"Pull-Out")+" - "+new Date().toLocaleDateString()+"</p>";
  html+="<table><thead><tr><th>Student</th><th>ELP</th><th>CO Met</th><th>LO Met</th><th>Key Skill</th><th>Notes</th></tr></thead><tbody>"+rows+"</tbody></table></body></html>";
  win.document.write(html);
  win.document.close();
  win.print();
}

function genDailyPlan(d,l){
  var co=safe(d.co);
  var lo=safe(d.lo);
  var mn=safe(d.mn&&d.mn[0]?d.mn[0]:"materials");
  var sc=safe(d.sc&&d.sc[0]?d.sc[0]:"visual support");
  var ac=safe(d.ac);
  var tp=safe(d.tp);
  var tx=safe(l.x);
  var tt=safe(l.t);
  var v2=d.v2?d.v2.map(safe).join(", "):"";
  var dfb=safe(d.df&&d.df.b?d.df.b:"");
  var dfo=safe(d.df&&d.df.o?d.df.o:"");
  var dfa=safe(d.df&&d.df.a?d.df.a:"");
  var wv=Object.values(d.wd||{});
  var e1=safe(wv.length>0?wv[0]:"Point to answer");
  var e3=safe(wv.length>2?wv[2]:"Use sentence starters");
  var e5=safe(wv.length>4?wv[4]:(wv.length>3?wv[3]:"Apply skill independently"));

  function R(t,n,c){
    var h="<div class='dprow'>";
    h+="<div class='dptime'>"+t+"</div>";
    h+="<div class='dpbody'><div class='dplabel'>"+n+"</div><div class='dptext'>"+c+"</div></div>";
    h+="</div>";
    return h;
  }

  function C(lbl,foc,cls,rows){
    var h="<div class='dpcard'>";
    h+="<div class='dphead "+cls+"'>&#128197; "+lbl+" - "+foc+"</div>";
    h+="<div class='dpcontent'>"+rows+"</div>";
    h+="</div>";
    return h;
  }

  var hd="<div class='dpintro'><strong>30-Minute Daily Breakdown</strong> - <em>"+tt+"</em><br>";
  hd+="<span style='color:#7c3aed'>CO:</span> "+co+" &nbsp;|&nbsp; <span style='color:#0891b2'>LO:</span> "+lo+"</div>";

  var d1rows=R("5 min","Hook",tp);
  d1rows+=R("8 min","Vocabulary Preview","Tier 2 words: <strong>"+v2+"</strong>. Say, clap, repeat 3 times. Post on word wall.");
  d1rows+=R("10 min","Read Aloud","Read <em>"+tx+"</em> aloud. Pause to think aloud 2 to 3 times. Post the content objective: "+co);
  d1rows+=R("5 min","Turn and Talk","What is this text mostly about? Use 1 vocabulary word. ELP 1-2: point and label. ELP 3 plus: sentence starter.");
  d1rows+=R("2 min","Exit Ticket","Write or draw one new word and one thing noticed about the text.");
  var d1=C("Day 1 - Monday","Hook and Vocabulary Preview","c1",d1rows);

  var d2rows=R("3 min","Warm-Up Review","Quick vocab flash: thumbs up if you know the meaning. Review CO and LO on board.");
  d2rows+=R("12 min","I Do - Two Full Models","Distribute "+mn+". Model 1: think aloud every step using the LO frame. Model 2: different evidence, different color. ELP 1-2 support: "+sc+".");
  d2rows+=R("10 min","We Do - Guided Attempt","Complete the first item together. ELP 1-2: "+e1+". ELP 3-4: "+e3+".");
  d2rows+=R("5 min","Partner Practice","Partners complete one more item. Give specific, immediate feedback.");
  var d2=C("Day 2 - Tuesday","I Do - Teacher Models","c2",d2rows);

  var d3rows=R("3 min","Review","One student recalls the content objective. Class reads the LO frame chorally.");
  d3rows+=R("5 min","We Do Round 2","One more guided example. Cold-call with 15-second wait time.");
  d3rows+=R("15 min","You Do",ac+" Below: "+dfb+" On Level: "+dfo+" Above: "+dfa+" Circulate with the Data Tracker open.");
  d3rows+=R("5 min","Share Out","Call on 2 to 3 students. Echo the sentence frame as a class.");
  d3rows+=R("2 min","Exit Ticket","One sentence using the LO frame. Collect all.");
  var d3=C("Day 3 - Wednesday","We Do and You Do","c3",d3rows);

  var d4rows=R("5 min","Group Students","Sort Day 3 exit tickets into mastered both, partial, and not yet. Pull not-yet students to small group.");
  d4rows+=R("15 min","Differentiated Practice","Small group ELP 1-2: reteach with "+mn+". Scaffold: "+sc+". Partner group ELP 3-4: "+e3+". Extension ELP 5-6: "+e5+".");
  d4rows+=R("8 min","Data Tracker","Record CO, LO, and Key Skill for each student. Add notes.");
  d4rows+=R("2 min","Wrap Up","One student from each group shares.");
  var d4=C("Day 4 - Thursday","Small Group and Data Collection","c4",d4rows);

  var d5rows=R("5 min","Vocabulary Game","Say the definition, students race to point to the word on the word wall.");
  d5rows+=R("10 min","Student Share Out","Share completed "+mn+". ELP 1-2: point to best response. ELP 3-4: read the sentence. ELP 5-6: explain thinking.");
  d5rows+=R("10 min","Exit Ticket Assessment","Content objective: "+co+". Language objective: complete the frame independently: "+lo+". Mark CO and LO in the Data Tracker today.");
  d5rows+=R("5 min","Celebrate","Specific praise by name. Students write one thing they are proud of. Preview next week.");
  var d5=C("Day 5 - Friday","Share Out and Celebrate","c5",d5rows);

  return hd+d1+d2+d3+d4+d5;
}

function renderLesson(){
  var l=W[sel];
  var u=UNITS[l.u];
  var d=mode==="push"?l.p:l.l;
  var mL=mode==="push"?"Push-In Co-Teaching":"Pull-Out Small Group";
  var mC=mode==="push"?"push":"pull";

  var tabsHtml=TABS.map(function(t,i){
    return "<button class='tab"+(i===curTab?" on":"")+"' data-tab='"+i+"'>"+safe(t)+"</button>";
  }).join("");

  var contents=[genOverview(d),genIDo(d),genWeDo(d),genYouDo(d),genSD(d),genDT(),genDailyPlan(d,l)];
  var tcsHtml=contents.map(function(c,i){
    return "<div class='tc"+(i===curTab?" on":"")+"'>"+c+"</div>";
  }).join("");

  var hdr="<div class='chdr "+mC+"'>";
  hdr+="<div class='cbc'>Unit "+(l.u+1)+": "+safe(u.n)+" - Week "+l.w+" - "+mL+"</div>";
  hdr+="<div class='ctitle'>"+safe(l.t)+"</div>";
  hdr+="<div class='ctags'><span class='ctag'>"+safe(l.x)+"</span><span class='ctag'>"+safe(l.g)+"</span></div></div>";

  var stds="<div class='stds'><span class='slbl'>VDOE SOL</span>";
  stds+=l.s.map(function(s){return "<span class='chip'>"+safe(s)+"</span>";}).join("");
  stds+="<span class='chip ci'>CIP: "+safe(l.c)+"</span><span class='chip cv'>Vista: "+safe(l.vi)+"</span></div>";

  document.getElementById("cw").innerHTML=hdr+stds+"<div class='tabs'>"+tabsHtml+"</div>"+tcsHtml;
}
