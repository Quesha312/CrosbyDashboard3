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
    console.log("Building nav with", W.length, "lessons");

    const nav = document.getElementById("nav");
    nav.innerHTML = "";

    W.forEach((l, i) => {
      if (!validateLesson(l)) {
        console.warn("Skipping invalid lesson:", l);
        return;
      }
      const item = document.createElement("div");
      item.className = "witem";
      item.textContent = `Unit ${l.u} Week ${l.w}: ${safe(l,"t")}`;
      item.onclick = () => loadLesson(i);
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
    console.log("Loading lesson index:", i, "mode:", mode);
    renderLesson();
  } catch (err) {
    console.error("Lesson load failed:", err);
  }
}

function renderLesson() {
  try {
    if (sel === null) {
      console.warn("No lesson selected yet");
      return;
    }
    const l = W[sel];
    if (!l) throw new Error("Lesson not found at index " + sel);
    // ... rest of render logic ...
  } catch (err) {
    console.error("Render failed:", err);
    document.getElementById("cw").innerHTML = "<p>Error loading lesson.</p>";
  }
}

// ====== Tab Switching ======
function switchTab(i) {
  try {
    console.log("Switching to tab:", i);
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
  } catch (err) {
    console.error("Tab switch failed:", err);
  }
}

// ====== Generators ======
function genOverview(l) {
  const tc = document.getElementById("tc0");
  tc.innerHTML = `<h3>Overview</h3>
                  <p>${safe(l.p,"co")}</p>
                  <p>${safe(l.p,"lo")}</p>`;
}

function genIDo(l) {
  const tc = document.getElementById("tc1");
  tc.innerHTML = `<h3>I Do</h3><p>${safe(l.l,"co")}</p>`;
}

function genWeDo(l) {
  const tc = document.getElementById("tc2");
  tc.innerHTML = `<h3>We Do</h3><p>${safe(l.l,"lo")}</p>`;
}

function genYouDo(l) {
  const tc = document.getElementById("tc3");
  tc.innerHTML = `<h3>You Do</h3><pre>${JSON.stringify(safe(l.l,"wd",{}),null,2)}</pre>`;
}

function genScaffold(l) {
  const tc = document.getElementById("tc4");
  tc.innerHTML = `<h3>Scaffold & Diff</h3><pre>${JSON.stringify(safe(l,"df",{}),null,2)}</pre>`;
}

// ====== Data Tracker ======
function loadDT(unit, mode) {
  try {
    const key = `dt_${unit}_${mode}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    console.log("Loaded Data Tracker:", key, data.length, "records");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Data Tracker load failed:", err);
    return [];
  }
}

function saveDT(unit, mode, data) {
  try {
    const key = `dt_${unit}_${mode}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log("Saved Data Tracker:", key, data.length, "records");
  } catch (err) {
    console.error("Data Tracker save failed:", err);
  }
}

function genDT(unit, mode) {
  try {
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
  } catch (err) {
    console.error("Data Tracker render failed:", err);
    document.getElementById("tc5").innerHTML = "<p>Error loading Data Tracker.</p>";
  }
}

// ====== Daily Plan ======
function genDailyPlan(l) {
  try {
    const tc = document.getElementById("tc6");
    tc.innerHTML = "<h3>Daily Plan</h3>";

    if (!l) throw new Error("No lesson selected");

    // Try This Prompt
    tc.innerHTML += `<div class="try">
                       <div class="try-i">💡</div>
                       <div>
                         <div class="try-l">Try This</div>
                         <div class="try-t">${safe(l,"tp","No prompt available")}</div>
                       </div>
                     </div>`;

    // Differentiation
    const df = safe(l,"df",{});
    const levels = ["b","o","a","e"];
    levels.forEach(lvl => {
      if (df[lvl]) {
        tc.innerHTML += `<div class="do">
                           <div class="dl">${lvl.toUpperCase()}</div>
                           <div>${df[lvl]}</div>
                         </div>`;
      }
    });
  } catch (err) {
    console.error("Daily Plan render failed:", err);
    document.getElementById("tc6").innerHTML = "<p>Error loading Daily Plan.</p>";
  }
}

// ====== Mode Toggle & Print ======
function toggleMode(newMode) {
  if (sel === null) {
    console.warn("No lesson selected yet");
    return;
  }
  console.log("Switching mode:", newMode);
  mode = newMode;
  renderLesson();
}

const bp = document.getElementById("bp");   // Push-In
if (bp) bp.onclick = () => toggleMode("push");

const bl = document.getElementById("bl");   // Pull-Out
if (bl) bl.onclick = () => toggleMode("pull");

const sbtog = document.getElementById("sbtog"); // Units toggle
if (sbtog) sbtog.onclick = () => {
  console.log("Toggling sidebar");
  document.getElementById("sb").classList.toggle("open");
};

const pbtn = document.getElementById("pbtn");   // Print
if (pbtn) pbtn.onclick = () => {
  console.log("Printing lesson");
  window.print();
};

// ====== Init ======
document.addEventListener("DOMContentLoaded", buildNav);
