// ====== Safety Helpers ======
function safe(obj, key, fallback = "") {
  return obj && obj[key] !== undefined ? obj[key] : fallback;
}

function validateLesson(l) {
  const required = ["u","w","t","x","p","l"];
  return required.every(k => l.hasOwnProperty(k));
}

// ====== Global State ======
var W = Array.isArray(LESSONS) ? LESSONS : [];
var sel = null;
var mode = "push"; // default mode

// ====== Navigation ======
function buildNav() {
  try {
    if (!W.length) throw new Error("LESSONS array is empty or invalid");
    const nav = document.getElementById("nav");
    nav.innerHTML = "";

    W.forEach((l, i) => {
      if (!validateLesson(l)) return;
      const item = document.createElement("div");
      item.className = "witem";
      item.textContent = `Unit ${l.u} Week ${l.w}: ${safe(l,"t")}`;
      item.onclick = () => {
        sel = i;
        loadLesson(i);
        document.getElementById("sb").classList.remove("open"); // auto-close sidebar
      };
      nav.appendChild(item);
    });
  } catch (err) {
    console.error("Navigation build failed:", err);
  }
}

// ====== Lesson Rendering ======
function loadLesson(i) {
  try {
    sel = i;
    renderLesson();
  } catch (err) {
    console.error("Lesson load failed:", err);
  }
}

function renderLesson() {
  try {
    if (sel === null) return;
    const l = W[sel];
    if (!l) throw new Error("Lesson not found at index " + sel);

    const cw = document.getElementById("cw");
    cw.style.display = "block";
    cw.innerHTML = "";

    // Header
    const header = document.createElement("div");
    header.className = "chdr " + mode;
    header.innerHTML = `<div class="ctitle">${safe(l,"t")}</div>
                        <div class="cbc">${safe(l,"c")}</div>`;
    cw.appendChild(header);

    // Tabs
    const tabs = ["Overview","I Do","We Do","You Do","Scaffold & Diff","Data Tracker","Daily Plan"];
    const tabBar = document.createElement("div");
    tabBar.className = "tabs";

    tabs.forEach((tabName, idx) => {
      const tab = document.createElement("button");
      tab.className = "tab";
      tab.textContent = tabName;
      tab.onclick = () => switchTab(idx);
      tabBar.appendChild(tab);
    });
    cw.appendChild(tabBar);

    // Tab content containers
    tabs.forEach((_, idx) => {
      const tc = document.createElement("div");
      tc.className = "tc";
      tc.id = "tc" + idx;
      cw.appendChild(tc);
    });

    switchTab(0); // default to Overview
  } catch (err) {
    console.error("Render failed:", err);
    document.getElementById("cw").innerHTML = "<p>Error loading lesson.</p>";
  }
}

// ====== Tab Switching ======
function switchTab(i) {
  document.querySelectorAll(".tab").forEach((t, idx) => {
    t.classList.toggle("on", idx === i);
  });
  document.querySelectorAll(".tc").forEach((c, idx) => {
    c.classList.toggle("on", idx === i);
  });

  const l = W[sel];
  if (!l) return;

  if (i === 0) genOverview(l);
  if (i === 1) genIDo(l);
  if (i === 2) genWeDo(l);
  if (i === 3) genYouDo(l);
  if (i === 4) genScaffold(l);
  if (i === 5) genDT(l.u, mode);
  if (i === 6) genDailyPlan(l);
}

// ====== Generators ======
function genOverview(l) {
  const tc = document.getElementById("tc0");
  tc.innerHTML = `<h3>Overview</h3>
                  <p>${safe(l.p,"co")}</p>
                  <p>${safe(l.p,"lo")}</p>`;
}

function genIDo(l) {
  document.getElementById("tc1").innerHTML = `<h3>I Do</h3><p>${safe(l.l,"co")}</p>`;
}

function genWeDo(l) {
  document.getElementById("tc2").innerHTML = `<h3>We Do</h3><p>${safe(l.l,"lo")}</p>`;
}

function genYouDo(l) {
  document.getElementById("tc3").innerHTML = `<h3>You Do</h3><pre>${JSON.stringify(safe(l.l,"wd",{}),null,2)}</pre>`;
}

function genScaffold(l) {
  document.getElementById("tc4").innerHTML = `<h3>Scaffold & Diff</h3><pre>${JSON.stringify(safe(l,"df",{}),null,2)}</pre>`;
}

// ====== Data Tracker ======
function loadDT(unit, mode) {
  try {
    const key = `dt_${unit}_${mode}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function genDT(unit, mode) {
  const data = loadDT(unit, mode);
  const tc = document.getElementById("tc5");
  tc.innerHTML = "<h3>Data Tracker</h3>";

  if (!data.length) {
    tc.innerHTML += "<p class='demp'>No student data yet.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "dttable";
  table.innerHTML = "<tr><th>Name</th><th>Notes</th></tr>";

  data.forEach(stu => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${safe(stu,"name","(Unnamed)")}</td>
                    <td>${safe(stu,"notes","")}</td>`;
    table.appendChild(tr);
  });

  tc.appendChild(table);
}

// ====== Daily Plan ======
function genDailyPlan(l) {
  const tc = document.getElementById("tc6");
  tc.innerHTML = "<h3>Daily Plan</h3>";

  tc.innerHTML += `<div class="try">
                     <div class="try-i">💡</div>
                     <div>
                       <div class="try-l">Try This</div>
                       <div class="try-t">${safe(l,"tp","No prompt available")}</div>
                     </div>
                   </div>`;

  const df = safe(l,"df",{});
  ["b","o","a","e"].forEach(lvl => {
    if (df[lvl]) {
      tc.innerHTML += `<div class="do">
                         <div class="dl">${lvl.toUpperCase()}</div>
                         <div>${df[lvl]}</div>
                       </div>`;
    }
  });
}

// ====== Mode Toggle & Print ======
function toggleMode(newMode) {
  if (sel === null) {
    console.warn("No lesson selected yet");
    return;
  }
  mode = newMode;
  renderLesson();
}

document.addEventListener("DOMContentLoaded", () => {
  buildNav();

  const bp = document.getElementById("bp");
  if (bp) bp.onclick = () => toggleMode("push");

  const bl = document.getElementById("bl");
  if (bl) bl.onclick = () => toggleMode("pull");

  const sbtog = document.getElementById("sbtog");
  if (sbtog) sbtog.onclick = () => {
    document.getElementById("sb").classList.toggle("open");
  };

  const pbtn = document.getElementById("pbtn");
  if (pbtn) pbtn.onclick = () => window.print();
});
