// app.js — Ms. Crosby ELL Dashboard
(function () {
  "use strict";

  // — crash-guard ——————————————————————————————————————————————
  if (!window.ELL_UNITS || window.ELL_UNITS.length < 5) {
    document.getElementById("app").innerHTML =
      "<div class=\"error-banner\">" +
      "<h2>&#9888; Dashboard Error</h2>" +
      "<p>One or more unit files failed to load. Confirm that unit1.js through unit5.js are in the same folder as index.html and that all five script tags appear before app.js.</p>" +
      "</div>";
    return;
  }

  var UNITS = window.ELL_UNITS;
  var TABS  = ["Overview", "I Do", "We Do", "You Do", "Vocabulary", "Differentiation", "5-Day Plan"];

  var state = { unit:0, week:0, tab:0, mode:"push-in" };

  // — localStorage ————————————————————————————————————————————
  function saveState() {
    try {
      localStorage.setItem("ell_nav", JSON.stringify({
        u:state.unit, w:state.week, t:state.tab, m:state.mode
      }));
    } catch (e) {}
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem("ell_nav") || "{}");
      if (typeof s.u === "number" && s.u < UNITS.length) state.unit = s.u;
      if (typeof s.w === "number" && s.w < UNITS[state.unit].weeks.length) state.week = s.w;
      if (typeof s.t === "number" && s.t < TABS.length) state.tab  = s.t;
      if (s.m === "pull-out" || s.m === "push-in") state.mode = s.m;
    } catch (e) {}
  }

  // — sidebar —————————————————————————————————————————————————
  function renderSidebar() {
    var html = "";
    for (var u = 0; u < UNITS.length; u++) {
      var active = (u === state.unit);
      html += "<div class=\"unit-group" + (active ? " active" : "") + "\" data-unit=\"" + u + "\">";
      html += "<div class=\"unit-title\">" + UNITS[u].title + "</div>";
      if (active) {
        html += "<ul class=\"week-list\">";
        for (var w = 0; w < UNITS[u].weeks.length; w++) {
          html += "<li class=\"week-item" + (w === state.week ? " active" : "") +
                  "\" data-unit=\"" + u + "\" data-week=\"" + w + "\">" +
                  "Week " + UNITS[u].weeks[w].w + ": " + UNITS[u].weeks[w].t + "</li>";
        }
        html += "</ul>";
      }
      html += "</div>";
    }
    document.getElementById("sidebar").innerHTML = html;
  }

  // — tabs ————————————————————————————————————————————————————
  function renderTabs() {
    var html = "";
    for (var i = 0; i < TABS.length; i++) {
      html += "<button class=\"tab-btn" + (i === state.tab ? " active" : "") +
              "\" data-tab=\"" + i + "\">" + TABS[i] + "</button>";
    }
    document.getElementById("tabs").innerHTML = html;
  }

  // — mode button ————————————————————————————————————————————
  function renderModeBtn() {
    var btn = document.getElementById("mode-toggle");
    if (!btn) return;
    if (state.mode === "push-in") {
      btn.textContent = "Switch to Pull-Out";
      btn.classList.remove("pull-out");
    } else {
      btn.textContent = "Switch to Push-In";
      btn.classList.add("pull-out");
    }
  }

  // — content helpers ————————————————————————————————————————
  function stepList(arr) {
    if (!arr || !arr.length) return "<p class=\"empty\">No content available.</p>";
    var h = "<ol class=\"step-list\">";
    for (var i = 0; i < arr.length; i++) { h += "<li>" + arr[i] + "</li>"; }
    return h + "</ol>";
  }

  function vocabGrid(arr) {
    if (!arr || !arr.length) return "<p class=\"empty\">No vocabulary listed.</p>";
    var h = "<div class=\"vocab-grid\">";
    for (var i = 0; i < arr.length; i++) {
      h += "<div class=\"vocab-card\">" +
           "<span class=\"vocab-word\">" + arr[i].word + "</span>" +
           "<span class=\"vocab-def\">" + arr[i].def + "</span>" +
           "</div>";
    }
    return h + "</div>";
  }

  function diffBlock(df) {
    if (!df) return "<p class=\"empty\">No differentiation notes.</p>";
    var h = "";
    if (df.scaffolds && df.scaffolds.length) {
      h += "<div class=\"diff-group\"><h4>Scaffolds &mdash; ELL Support</h4><ul>";
      for (var i = 0; i < df.scaffolds.length; i++) { h += "<li>" + df.scaffolds[i] + "</li>"; }
      h += "</ul></div>";
    }
    if (df.extensions && df.extensions.length) {
      h += "<div class=\"diff-group\"><h4>Extensions &mdash; On-Level &amp; Above</h4><ul>";
      for (var j = 0; j < df.extensions.length; j++) { h += "<li>" + df.extensions[j] + "</li>"; }
      h += "</ul></div>";
    }
    return h || "<p class=\"empty\">No differentiation notes.</p>";
  }

  function planTable(plan) {
    if (!plan || !plan.length) return "<p class=\"empty\">No 5-day plan available.</p>";
    var h = "<table class=\"plan-table\"><thead><tr><th>Day</th><th>Min</th><th>Activity</th></tr></thead><tbody>";
    for (var i = 0; i < plan.length; i++) {
      h += "<tr><td>" + plan[i].day + "</td><td>" + plan[i].min + "</td><td>" + plan[i].activity + "</td></tr>";
    }
    return h + "</tbody></table>";
  }

  // — lesson panel ——————————————————————————————————————————
  function renderLesson() {
    var L = UNITS[state.unit].weeks[state.week];
    var isPi = (state.mode === "push-in");
    var h = "";

    // header
    h += "<div class=\"lesson-header\">";
    h += "<h2>" + L.t + "</h2>";
    h += "<div class=\"badges\">";
    h += "<span class=\"badge " + (isPi ? "mode-badge-pi" : "mode-badge-po") + "\">" +
         (isPi ? "&#x1F7E2; Push-In" : "&#x1F7E0; Pull-Out") + "</span>";
    if (L.c)  h += "<span class=\"badge cip-badge\">"   + L.c  + "</span>";
    if (L.vi) h += "<span class=\"badge vista-badge\">Vista: " + L.vi + "</span>";
    h += "</div></div>";

    if (L.s && L.s.length) {
      h += "<div class=\"lesson-sol\"><strong>SOL:</strong> ";
      for (var i = 0; i < L.s.length; i++) {
        h += "<span class=\"sol-tag\">" + L.s[i] + "</span>";
      }
      h += "</div>";
    }

    h += "<div class=\"tab-panel\">";

    if (state.tab === 0) {
      h += "<h3>Overview</h3><p class=\"ov-text\">" + (L.ov || "") + "</p>";

    } else if (state.tab === 1) {
      var idArr  = isPi ? L.id_pi : L.id_po;
      var idHead = isPi
        ? "I Do &mdash; <span class=\"mode-callout pi\">Push-In: Co-Teaching Support</span>"
        : "I Do &mdash; <span class=\"mode-callout po\">Pull-Out: Small Group Instruction</span>";
      h += "<h3>" + idHead + "</h3>" + stepList(idArr);

    } else if (state.tab === 2) {
      h += "<h3>We Do &mdash; Guided Practice</h3>" + stepList(L.wd);

    } else if (state.tab === 3) {
      h += "<h3>You Do &mdash; Independent Task</h3>" + stepList(L.yd);

    } else if (state.tab === 4) {
      h += "<h3>Vocabulary</h3>" + vocabGrid(L.voc);

    } else if (state.tab === 5) {
      h += "<h3>Differentiation</h3>" + diffBlock(L.df);

    } else if (state.tab === 6) {
      var planArr  = isPi ? L.plan_pi : L.plan_po;
      var planHead = isPi
        ? "5-Day Plan (30 min/day) &mdash; <span class=\"mode-callout pi\">Push-In Schedule</span>"
        : "5-Day Plan (30 min/day) &mdash; <span class=\"mode-callout po\">Pull-Out Schedule</span>";
      h += "<h3>" + planHead + "</h3>" + planTable(planArr);
    }

    h += "</div>";
    document.getElementById("lesson-content").innerHTML = h;
  }

  // — full render ————————————————————————————————————————————
  function render() {
    renderSidebar();
    renderTabs();
    renderModeBtn();
    renderLesson();
    saveState();
  }

  // — event delegation ——————————————————————————————————————
  document.addEventListener("click", function (e) {
    var t = e.target;

    if (t.classList && t.classList.contains("unit-title")) {
      var ug = t.parentElement;
      if (ug && ug.dataset.unit !== undefined) {
        state.unit = parseInt(ug.dataset.unit, 10);
        state.week = 0;
        state.tab  = 0;
        render();
      }
      return;
    }

    if (t.classList && t.classList.contains("week-item")) {
      state.unit = parseInt(t.dataset.unit, 10);
      state.week = parseInt(t.dataset.week, 10);
      state.tab  = 0;
      render();
      return;
    }

    if (t.classList && t.classList.contains("tab-btn")) {
      state.tab = parseInt(t.dataset.tab, 10);
      render();
      return;
    }

    if (t.id === "mode-toggle") {
      state.mode = (state.mode === "push-in") ? "pull-out" : "push-in";
      render();
      return;
    }

    if (t.id === "print-btn") { window.print(); }
  });

  // — init ——————————————————————————————————————————————————
  loadState();
  render();

}());
