// ==UserScript==
// @name         FEMNSS Bubble
// @version      2026-09-27
// @description  FEMNSS Bubble
// @author       Far Eastern Magic Napping Society of Summer
// @icon         https://techhero1.github.io/wp-tools/scripts/icon.png
// @match        *://*.wplace.live/*
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://techhero1.github.io/wp-tools/scripts/FEMNSS_Bubble.user.js
// @downloadURL  https://techhero1.github.io/wp-tools/scripts/FEMNSS_Bubble.user.js
// ==/UserScript==

var femnss_long = "Far Eastern Magic Napping Society of Summer";
var femnss_original = "極東魔術昼寝結社の夏";
var femnss_short = "FEMNSS";
var femnss_name = femnss_short+" Bubble";
var femnss_icon = "https://techhero1.github.io/wp-tools/scripts/icon.png";
var femnss_round = "50%";

var hq_timer = 10000;
var hq_first_load = false;

//Original bubble design -> https://greasyfork.org/scripts/546333-wplace-charge-regen-eta-bubble

(function () {
  'use strict';

  // --- Storage keys
  const K = {
    bubblePos: 'eta_bubble_pos'
  };

  let default_cur = 0;
  let default_max = 200;

  let player_droplets = 0;

  let player_level = 0;
  let pixels_painted = 0;
  let next_level = 0;

  let cooldown = 30000;
  let timer_offset = 0;

  let hq_charges = 0;
  let hq_charges_max = 0;

  function fetchMeFromServer() {
    /*
    if (document.body.contains(document.body.querySelector(".bubble_element"))) {
      for (let i = 0; i < document.body.querySelectorAll(".bubble_element").length; i++) {
        document.body.querySelectorAll(".bubble_element")[i].remove();
      }
    }
    */

    fetch("https://backend.wplace.live/me", {
      "credentials": "include",
    }).then((response) => {
      return response.json();
    }).then((dataJSON) => {
      // If the game can not retrieve the userdata...
      if (dataJSON['status'] && dataJSON['status']?.toString()[0] != '2') {
        // The server is probably down (NOT a 2xx status)
        return;
      }

      //log("Fetched user data", dataJSON);
      default_cur = Math.floor(dataJSON.charges.count);
      default_max = dataJSON.charges.max;

      player_droplets = dataJSON.droplets;

      player_level = dataJSON.level;
      pixels_painted = dataJSON.pixelsPainted;

      next_level = Math.ceil(Math.pow(Math.floor(player_level) * Math.pow(30, 0.65), (1/0.65)) - pixels_painted);

      cooldown = dataJSON.charges.cooldownMs;

      timer_offset = (dataJSON.charges.count % 1) * cooldown;

      // --- State
      let current = default_cur;
      let max = default_max;
      let lastTimer = null;           // seconds until next tick (parsed from (m:ss))
      let lastTickCheck = (Date.now() - timer_offset); // ms clock for AFK recovery
      let lastAutoIncAt = 0;          // ms guard to avoid double-increment on regen detection

      // --- UI elements
      let bubble;

      // --- Ensure body exists then init
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }

      function init() {
        if (!document.body.contains(document.body.querySelector(".bubble_element"))) {
          createBubble();
          makeDraggable(bubble, K.bubblePos, { bottom: 20, right: 20 });

          // Initial render
          render();

          // Ticker
          setInterval(tick, 500);
        } else {
          document.querySelector(".bubble-droplets").innerHTML = "Droplets: "+player_droplets;
          document.querySelector(".bubble-nextlevel").innerHTML = "Next level in: "+next_level+"  pixels";

          render();

          const timerEl = findTimerEl();
          const untilNext = parseTimer(timerEl.textContent);
          const etaSec = Math.max(0, (max - current - 1) * 30 + untilNext);
          setBubble(formatHMS(etaSec) + ' to full', `${current}/${max}`);
        }
      }

      // --- Core loop
      function tick() {
        const timerEl = findTimerEl();
    if (!timerEl) {
      // If we were one short, assume we just got the last charge
      if (current === max - 1) {
        current = max;
        log(`Final regen: assumed full → current=${current}/${max}`);
      }

      if (current >= max) {
        // Pretend we're at 0 to show total regen time
        const etaSec = (max - 1) * 30 + 30; // full cycle from empty
        setBubble(formatHMS(etaSec) + ' to full', `${current}/${max}`);
      } else {
        setBubble('Waiting for timer…', `${current}/${max}`);
      }
      return;
    }




        const untilNext = parseTimer(timerEl.textContent);
        if (untilNext == null) {
          setBubble('Invalid timer', `${current}/${max}`);
          return;
        }

        // Auto-increment on cycle reset (e.g., 0:01 -> 0:30)
        if (lastTimer != null) {
          const jumpedUp = untilNext > lastTimer + 10; // robust jump threshold
          const enoughSinceLastInc = (Date.now() - lastAutoIncAt) > 15000; // guard
          if (jumpedUp && current < max && enoughSinceLastInc) {
            current = default_cur;
            current += 1;
            lastAutoIncAt = Date.now();
            log(`Regen: timer reset detected (+1) → current=${current}/${max}`);
          }
        }
        lastTimer = untilNext;

        // AFK recovery (award charges for elapsed time)
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickCheck) / 1000);
        if (elapsed > 40) {
          const gained = Math.floor(elapsed / 30);
          if (gained > 0 && current < max) {
            const before = current;
            current = Math.min(max, current + gained);
            log(`AFK recovery: +${current - before} (elapsed ${elapsed}s) → current=${current}/${max}`);
          }
        }
        lastTickCheck = now;

        // Clamp and render
        if (current >= max) {
          current = max;
          setBubble('Fully charged', `${current}/${max}`);
          return;
        }

        current = default_cur;
        const etaSec = Math.max(0, (max - current - 1) * 30 + untilNext);
        setBubble(formatHMS(etaSec) + ' to full', `${current}/${max}`);
      }

      // --- Helpers
      function findTimerEl() {
        // Scan common inline text containers for a string like "(m:ss)"
        const candidates = document.querySelectorAll('time, span, div, p');
        for (const el of candidates) {
          const t = el.textContent || '';
          if (/\(\d+:\d{2}\)/.test(t)) return el;
        }
        return null;
      }

      function parseTimer(s) {
        const m = /\((\d+):(\d{2})\)/.exec(s || '');
        if (!m) return null;
        const mins = parseInt(m[1], 10);
        const secs = parseInt(m[2], 10);
        if (isNaN(mins) || isNaN(secs)) return null;
        return mins * 60 + secs;
      }

      function formatHMS(totalSec) {
        const s = Math.max(0, Math.ceil(totalSec));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
        return `${m}m ${String(sec).padStart(2,'0')}s`;
      }

      function clampInt(n, lo, hi) {
        if (!Number.isFinite(n)) return lo;
        return Math.min(hi, Math.max(lo, n | 0));
      }

      // --- Bubble renderer (adds edit button; listeners are delegated)
      function setBubble(line1, counts) {
        if (!bubble) return;
        bubble.innerHTML = `
          <div style="font-weight:600">${femnss_name}</div><br>
          <div style="font-weight:600" class="bubble-droplets">Droplets: ${player_droplets}</div>
          <div style="font-weight:600" class="bubble-nextlevel">Next level in: ${next_level} pixels</div>
          <div style="font-weight:600" class="bubble-chargeshq">Charges in HQ: ${hq_charges}/${hq_charges_max}</div><br>
          <div style="font-weight:600">${line1}</div>
        `;
      }

      function log(msg) {
        const ts = new Date();
        const t = ts.toLocaleTimeString([], { hour12: false });
        console.log(`[${t}] ${msg}`);
      }

      // --- UI builders
      function createBubble() {
        bubble = document.createElement('div');
        bubble.classList.add("bubble_element");
        Object.assign(bubble.style, {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 10px',
          background: 'rgba(16,18,22,0.9)',
          color: '#e6edf3',
          border: '1px solid #2b3138',
          borderRadius: '10px',
          font: '12px/1.4 system-ui, Segoe UI, Roboto, Arial, sans-serif',
          zIndex: 2147483647,
          boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
          cursor: 'move',
          minWidth: '160px'
        });

        // Delegate edit button click (no duplicate listeners on re-render)
        bubble.addEventListener('click', (e) => {
          const editBtn = e.target.closest('.bubble-edit-btn');
          if (!editBtn) return;
          e.stopPropagation();
          const inVal = prompt('Enter current/max charges:', `${current}/${max}`);
          if (!inVal) return;
          const m = inVal.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
          if (!m) {
            alert('Format must be: number/number (e.g., 7/10)');
            return;
          }
          const newCur = clampInt(parseInt(m[1], 10), 0, 9999);
          const newMax = clampInt(parseInt(m[2], 10), 1, 9999);
          current = Math.min(newCur, newMax);
          max = newMax;
          log(`Inline edit via button: current=${current}, max=${max}`);
          render();
        });

        // Prevent drag start when pressing the edit button
        bubble.addEventListener('mousedown', (e) => {
          if (e.target.closest('.bubble-edit-btn')) e.stopPropagation();
        }, true);

        document.body.appendChild(bubble);
        place(bubble, GM_getValue(K.bubblePos, null), { bottom: 20, right: 20 });
      }

      function styleBtn(b) {
        Object.assign(b.style, {
          background: '#0b63ff',
          color: 'white',
          border: '1px solid #1547b0',
          padding: '2px 6px',
          borderRadius: '6px',
          cursor: 'pointer',
          font: '600 11px system-ui, sans-serif'
        });
      }

      // --- Positioning + drag with persistence
      function makeDraggable(el, storageKey, fallback) {
        if (!el) return;
        let start = null;
        el.addEventListener('mousedown', (e) => {
          if (e.target.closest('button, input, textarea, select, a')) return;
          start = { x: e.clientX, y: e.clientY, left: el.offsetLeft, top: el.offsetTop };
          e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
          if (!start) return;
          const dx = e.clientX - start.x;
          const dy = e.clientY - start.y;
          el.style.left = (start.left + dx) + 'px';
          el.style.top = (start.top + dy) + 'px';
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        });
        window.addEventListener('mouseup', () => {
          if (!start) return;
          start = null;
          const rect = el.getBoundingClientRect();
          GM_setValue(storageKey, { x: rect.left + window.scrollX, y: rect.top + window.scrollY });
        });

        // Touch
        el.addEventListener('touchstart', (e) => {
          const t = e.touches[0];
          start = { x: t.clientX, y: t.clientY, left: el.offsetLeft, top: el.offsetTop };
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
          if (!start) return;
          const t = e.touches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          el.style.left = (start.left + dx) + 'px';
          el.style.top = (start.top + dy) + 'px';
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        }, { passive: true });
        window.addEventListener('touchend', () => {
          if (!start) return;
          start = null;
          const rect = el.getBoundingClientRect();
          GM_setValue(storageKey, { x: rect.left + window.scrollX, y: rect.top + window.scrollY });
        });

        // Initial placement
        place(el, GM_getValue(storageKey, null), fallback);
      }

      function place(el, saved, fallback) {
        if (!el) return;
        if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
          el.style.left = saved.x + 'px';
          el.style.top = saved.y + 'px';
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        } else {
          if (fallback.left != null) el.style.left = fallback.left + 'px';
          if (fallback.top != null) el.style.top = fallback.top + 'px';
          if (fallback.right != null) el.style.right = fallback.right + 'px';
          if (fallback.bottom != null) el.style.bottom = fallback.bottom + 'px';
        }
      }

      function render() {
        const timerEl = findTimerEl();
        const untilNext = timerEl ? parseTimer(timerEl.textContent) : null;
        if (current >= max) {
          current = max;
          setBubble('Fully charged', `${current}/${max}`);
          return;
        }
        if (untilNext == null) {
          setBubble('Waiting for timer…', `${current}/${max}`);
          return;
        }
        const etaSec = Math.max(0, (max - current - 1) * 30 + untilNext);
        setBubble(formatHMS(etaSec) + ' to full', `${current}/${max}`);
      }

      if (!hq_first_load) updateHQ();

    });
  }

  fetchMeFromServer();

  setInterval(fetchMeFromServer, 10000);

  function updateHQ() {
    hq_first_load = true;
    fetch("https://backend.wplace.live/alliance/headquarters", {
        "credentials": "include",
      }).then((response) => {
        return response.json();
      }).then((allianceJSON) => {
        hq_charges = allianceJSON.charges;
        hq_charges_max = allianceJSON.maxCharges;
        document.querySelector(".bubble-chargeshq").innerHTML = `Charges in HQ: ${hq_charges}/${hq_charges_max}`;
        hq_timer = (allianceJSON.chargeIntervalSeconds-1)*1000;
        setTimeout(updateHQ, hq_timer);
      });
  }

})();
