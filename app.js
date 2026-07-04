/* ============================================================================
   app.js — grounds map viewer + hidden edit mode
   No frameworks, no build step. Reads window.MARKERS / window.MARKER_TYPES
   from locations.js.
   ========================================================================== */
(function () {
  "use strict";

  var TYPES   = window.MARKER_TYPES || {};
  var markers = (window.MARKERS || []).map(function (m) { return Object.assign({}, m); });

  var EDIT = new URLSearchParams(location.search).get("edit") === "1";

  // ---- DOM ----
  var viewport    = document.getElementById("viewport");
  var canvas      = document.getElementById("canvas");
  var mapImg      = document.getElementById("map");
  var noMap       = document.getElementById("no-map");
  var layer       = document.getElementById("marker-layer");
  var card        = document.getElementById("card");
  var backdrop    = document.getElementById("card-backdrop");
  var editToolbar = document.getElementById("edit-toolbar");

  // ---- View transform state ----
  var scale = 1, tx = 0, ty = 0;
  var MIN = 0.5, MAX = 6;   // MIN is recomputed to the fit scale on load/resize

  // ---- Helpers ----
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function iconFor(m) { return m.icon || (TYPES[m.type] && TYPES[m.type].icon) || "📍"; }
  function isTournament(m) { return !!(m.time && String(m.time).trim()); }

  function applyTransform() {
    var vw = viewport.clientWidth, vh = viewport.clientHeight;
    var cw = canvas.offsetWidth * scale, ch = canvas.offsetHeight * scale;
    // keep the map from drifting entirely off screen
    tx = cw <= vw ? (vw - cw) / 2 : clamp(tx, vw - cw, 0);
    ty = ch <= vh ? (vh - ch) / 2 : clamp(ty, vh - ch, 0);
    canvas.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
    canvas.style.setProperty("--s", scale);
  }

  // Scale at which the WHOLE map fits inside the viewport (fit both width AND
  // height). For the near-square image on a tall phone this fits to width and
  // letterboxes vertically; on a wide/short screen it fits to height.
  function currentFit() {
    var vw = viewport.clientWidth, vh = viewport.clientHeight;
    var bw = canvas.offsetWidth, bh = canvas.offsetHeight;
    if (!bw || !bh) return 1;
    return Math.min(vw / bw, vh / bh);
  }

  // Reset to the default "see everything" view, centered.
  function refit() {
    scale = currentFit();
    MIN = scale;              // whole-map view is the most zoomed-out state
    tx = 0; ty = 0;
    applyTransform();         // applyTransform centers via its clamp
  }

  function zoomAt(cx, cy, factor) {
    var ns = clamp(scale * factor, MIN, MAX);
    factor = ns / scale;
    tx = cx - (cx - tx) * factor;
    ty = cy - (cy - ty) * factor;
    scale = ns;
    applyTransform();
  }

  // Convert a screen point to a % position on the map
  function pctFromEvent(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
      x: clamp((clientX - r.left) / r.width * 100, 0, 100),
      y: clamp((clientY - r.top) / r.height * 100, 0, 100)
    };
  }

  /* =========================================================================
     MARKERS
     ========================================================================= */
  var selectedId = null;

  function render() {
    layer.innerHTML = "";
    markers.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "marker" + (m.id === selectedId ? " selected" : "");
      el.style.left = m.x + "%";
      el.style.top  = m.y + "%";
      el.textContent = iconFor(m);
      el.dataset.id = m.id;
      attachMarker(el, m);
      layer.appendChild(el);
    });
  }

  function attachMarker(el, m) {
    var startX, startY, moved, dragging, pid;

    el.addEventListener("pointerdown", function (e) {
      e.stopPropagation();           // don't start a map pan
      pid = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      moved = false; dragging = EDIT;
      if (EDIT) el.classList.add("dragging");
      el.setPointerCapture(pid);
    });

    el.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pid) return;
      if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) moved = true;
      if (EDIT && dragging) {
        var p = pctFromEvent(e.clientX, e.clientY);
        m.x = p.x; m.y = p.y;
        el.style.left = m.x + "%";
        el.style.top  = m.y + "%";
        // keep an open card's fields from fighting the drag — nothing to update
      }
    });

    function end(e) {
      if (e.pointerId !== pid) return;
      el.classList.remove("dragging");
      try { el.releasePointerCapture(pid); } catch (_) {}
      if (!moved) { selectedId = m.id; render(); openCard(m); }
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  /* =========================================================================
     INFO CARD
     ========================================================================= */
  function closeCard() {
    card.hidden = true;
    backdrop.hidden = true;
    selectedId = null;
    render();
  }

  function openCard(m) {
    card.innerHTML = "";
    var grab = div("card-grab");
    card.appendChild(grab);

    if (!EDIT) buildViewCard(m); else buildEditCard(m);

    card.hidden = false;
    backdrop.hidden = false;
  }

  function buildViewCard(m) {
    var head = div("card-head");
    head.appendChild(withText(div("card-icon"), iconFor(m)));
    var titleWrap = document.createElement("div");
    var h = document.createElement("h2");
    h.className = "card-title"; h.textContent = m.name || "";
    titleWrap.appendChild(h);
    if (isTournament(m)) {
      var t = document.createElement("span");
      t.className = "card-time"; t.textContent = "⏰ Starts " + m.time;
      titleWrap.appendChild(t);
    }
    head.appendChild(titleWrap);
    card.appendChild(head);

    if (m.description) {
      var p = document.createElement("p");
      p.className = "card-desc"; p.textContent = m.description;
      card.appendChild(p);
    }
    var close = document.createElement("button");
    close.className = "card-close"; close.textContent = "Close";
    close.onclick = closeCard;
    card.appendChild(close);
  }

  function buildEditCard(m) {
    // Type / icon selector
    card.appendChild(labelEl("Type (icon)"));
    var sel = document.createElement("select");
    Object.keys(TYPES).forEach(function (key) {
      var o = document.createElement("option");
      o.value = key;
      o.textContent = TYPES[key].icon + "  " + TYPES[key].label;
      if (key === m.type) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = function () { m.type = sel.value; render(); };
    card.appendChild(sel);

    // Name
    card.appendChild(labelEl("Name"));
    var name = document.createElement("input");
    name.type = "text"; name.value = m.name || "";
    name.oninput = function () { m.name = name.value; };
    card.appendChild(name);

    // Time (optional)
    card.appendChild(labelEl("Tournament time (leave blank if none)"));
    var time = document.createElement("input");
    time.type = "text"; time.placeholder = "e.g. 1:30 PM";
    time.value = m.time || "";
    time.oninput = function () { m.time = time.value; };
    card.appendChild(time);

    // Description
    card.appendChild(labelEl("Description"));
    var desc = document.createElement("textarea");
    desc.value = m.description || "";
    desc.oninput = function () { m.description = desc.value; };
    card.appendChild(desc);

    // Buttons
    var row = div("card-btn-row");
    row.appendChild(btn("Duplicate", "btn-dup", function () { duplicate(m); }));
    row.appendChild(btn("Delete", "btn-del", function () { removeMarker(m); }));
    row.appendChild(btn("Done", "btn-done", closeCard));
    card.appendChild(row);
  }

  /* =========================================================================
     EDIT ACTIONS
     ========================================================================= */
  var clipboard = null;

  function newId(type) { return type + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1000); }

  function duplicate(m) {
    var copy = Object.assign({}, m);
    copy.id = newId(m.type);
    copy.x = clamp(m.x + 4, 0, 100);
    copy.y = clamp(m.y + 4, 0, 100);
    markers.push(copy);
    selectedId = copy.id;
    render();
    openCard(copy);
  }

  function removeMarker(m) {
    markers = markers.filter(function (x) { return x.id !== m.id; });
    closeCard();
  }

  function addMarkerAt(pct) {
    var firstType = Object.keys(TYPES)[0] || "restrooms";
    var m = {
      id: newId(firstType), type: firstType,
      x: pct.x, y: pct.y,
      name: (TYPES[firstType] && TYPES[firstType].label) || "New marker",
      description: "Edit me."
    };
    markers.push(m);
    selectedId = m.id;
    render();
    openCard(m);
  }

  /* =========================================================================
     MAP PAN / PINCH ZOOM
     ========================================================================= */
  var pointers = new Map();   // id -> {x,y}
  var pinchDist = 0, pinchScale = 1;
  var panMoved = false, panDown = false;

  viewport.addEventListener("pointerdown", function (e) {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    panDown = true; panMoved = false;
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinchDist = dist(pts[0], pts[1]);
      pinchScale = scale;
    }
    viewport.classList.add("grabbing");
  });

  viewport.addEventListener("pointermove", function (e) {
    if (!pointers.has(e.pointerId)) return;
    var prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) panMoved = true;
      tx += dx; ty += dy;
      applyTransform();
    } else if (pointers.size === 2) {
      panMoved = true;
      var pts = Array.from(pointers.values());
      var d = dist(pts[0], pts[1]);
      if (pinchDist > 0) {
        var mid = { x: (pts[0].x + pts[1].x) / 2 - vpLeft(), y: (pts[0].y + pts[1].y) / 2 - vpTop() };
        var target = clamp(pinchScale * d / pinchDist, MIN, MAX);
        zoomAt(mid.x, mid.y, target / scale);
      }
    }
  });

  function endPointer(e) {
    var wasTap = pointers.size === 1 && !panMoved;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) {
      viewport.classList.remove("grabbing");
      // add-marker: a clean tap on empty map while armed
      if (EDIT && addArmed && wasTap) {
        addMarkerAt(pctFromEvent(e.clientX, e.clientY));
        setArmed(false);
      }
      panDown = false;
    }
  }
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function vpLeft() { return viewport.getBoundingClientRect().left; }
  function vpTop()  { return viewport.getBoundingClientRect().top; }

  // Desktop wheel zoom
  viewport.addEventListener("wheel", function (e) {
    e.preventDefault();
    zoomAt(e.clientX - vpLeft(), e.clientY - vpTop(), e.deltaY < 0 ? 1.12 : 0.89);
  }, { passive: false });

  // Double-click / double-tap zoom
  viewport.addEventListener("dblclick", function (e) {
    zoomAt(e.clientX - vpLeft(), e.clientY - vpTop(), 1.6);
  });

  /* =========================================================================
     ZOOM BUTTONS
     ========================================================================= */
  function centerZoom(f) { zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, f); }
  document.getElementById("zoom-in").onclick  = function () { centerZoom(1.3); };
  document.getElementById("zoom-out").onclick = function () { centerZoom(1 / 1.3); };
  document.getElementById("zoom-reset").onclick = refit;

  /* =========================================================================
     EDIT TOOLBAR + PANELS
     ========================================================================= */
  var addArmed = false;
  function setArmed(on) {
    addArmed = on;
    document.getElementById("btn-add").classList.toggle("armed", on);
    viewport.classList.toggle("adding", on);
    document.getElementById("edit-hint").textContent = on
      ? "Now tap the map where you want the new pin."
      : "Tap a pin to edit it. Drag to move. Use Add, then tap the map to drop a new pin.";
  }

  function initEdit() {
    document.body.classList.add("edit-mode");
    editToolbar.hidden = false;

    var helpPanel   = document.getElementById("help-panel");
    var exportPanel = document.getElementById("export-panel");

    document.getElementById("btn-add").onclick    = function () { setArmed(!addArmed); };
    document.getElementById("btn-export").onclick = openExport;
    document.getElementById("btn-help").onclick   = function () { helpPanel.hidden = false; };
    document.getElementById("btn-help-close").onclick  = function () { helpPanel.hidden = true; };
    document.getElementById("btn-export-close").onclick = function () { exportPanel.hidden = true; };
    document.getElementById("btn-copy-export").onclick  = copyExport;

    // Never get trapped: clicking the dark area outside a panel closes it.
    helpPanel.addEventListener("click", function (e) { if (e.target === helpPanel) helpPanel.hidden = true; });
    exportPanel.addEventListener("click", function (e) { if (e.target === exportPanel) exportPanel.hidden = true; });

    // keyboard shortcuts
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {                 // Esc closes any open panel/card
        helpPanel.hidden = true;
        exportPanel.hidden = true;
        if (!card.hidden) closeCard();
        setArmed(false);
        return;
      }
      var meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key === "c" && selectedId) {
        clipboard = markers.find(function (m) { return m.id === selectedId; });
      } else if (e.key === "v" && clipboard) {
        e.preventDefault();
        duplicate(clipboard);
      }
    });

    // show help once on first load of edit mode
    helpPanel.hidden = false;
  }

  function buildFileText() {
    var lines = [];
    lines.push("/* ============================================================================");
    lines.push("   locations.js  —  ALL your map data lives here.");
    lines.push("   (Regenerated by Edit Mode. Edit by hand or use ?edit=1 and Export again.)");
    lines.push("   x / y are percentages 0-100 across the map image.");
    lines.push("   ========================================================================== */");
    lines.push("");
    lines.push("window.MARKER_TYPES = " + prettyTypes(TYPES) + ";");
    lines.push("");
    lines.push("window.MARKERS = [");
    markers.forEach(function (m, i) {
      lines.push("  " + markerLiteral(m) + (i < markers.length - 1 ? "," : ""));
    });
    lines.push("];");
    lines.push("");
    return lines.join("\n");
  }

  function prettyTypes(t) {
    var out = ["{"];
    var keys = Object.keys(t);
    keys.forEach(function (k, i) {
      out.push("  " + k + ": { icon: " + JSON.stringify(t[k].icon) +
               ", label: " + JSON.stringify(t[k].label) + " }" + (i < keys.length - 1 ? "," : ""));
    });
    out.push("}");
    return out.join("\n");
  }

  function markerLiteral(m) {
    var parts = [
      "id: " + JSON.stringify(m.id),
      "type: " + JSON.stringify(m.type),
      "x: " + round(m.x),
      "y: " + round(m.y),
      "name: " + JSON.stringify(m.name || ""),
      "description: " + JSON.stringify(m.description || "")
    ];
    if (m.time && String(m.time).trim()) parts.push("time: " + JSON.stringify(m.time));
    if (m.icon) parts.push("icon: " + JSON.stringify(m.icon));
    return "{ " + parts.join(", ") + " }";
  }
  function round(n) { return Math.round(n * 10) / 10; }

  function openExport() {
    document.getElementById("export-text").value = buildFileText();
    document.getElementById("export-panel").hidden = false;
  }

  function copyExport() {
    var ta = document.getElementById("export-text");
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (_) {}
    if (navigator.clipboard) navigator.clipboard.writeText(ta.value).catch(function () {});
    document.getElementById("btn-copy-export").textContent = ok || navigator.clipboard ? "✓ Copied!" : "Select all & copy";
    setTimeout(function () { document.getElementById("btn-copy-export").textContent = "📋 Copy to clipboard"; }, 1800);
  }

  /* =========================================================================
     small DOM helpers
     ========================================================================= */
  function div(cls) { var d = document.createElement("div"); d.className = cls; return d; }
  function withText(el, t) { el.textContent = t; return el; }
  function labelEl(t) { var l = document.createElement("label"); l.className = "edit-field"; l.textContent = t; return l; }
  function btn(text, cls, fn) { var b = document.createElement("button"); b.className = cls; b.textContent = text; b.onclick = fn; return b; }

  /* =========================================================================
     BOOT
     ========================================================================= */
  backdrop.addEventListener("click", closeCard);
  mapImg.addEventListener("error", function () { noMap.hidden = false; mapImg.style.visibility = "hidden"; });
  window.addEventListener("resize", function () {
    MIN = currentFit();
    if (scale < MIN) scale = MIN;   // never leave a gap below the fit view
    applyTransform();
  });

  function boot() {
    render();
    refit();
    if (EDIT) initEdit();
  }
  if (mapImg.complete) boot();
  else { mapImg.addEventListener("load", boot); mapImg.addEventListener("error", boot); }
})();
