// ==UserScript==
// @name         Remove Ellipsis in Paint Counts
// @version      2026-10-11
// @description  Remove Ellipsis in Paint Counts (Wplace)
// @author       Far Eastern Magic Napping Society of Summer
// @icon         https://techhero1.github.io/wp-tools/scripts/icon.png
// @match        *://*.wplace.live/*
// @run-at       document-idle
// @updateURL    https://techhero1.github.io/wp-tools/scripts/Remove_Ellipsis_Wplace.user.js
// @downloadURL  https://techhero1.github.io/wp-tools/scripts/Remove_Ellipsis_Wplace.user.js
// ==/UserScript==

(function() {
    'use strict';
    function removeClasses() {
        if (document.body.contains(document.querySelector(".paint-swatch-count"))) {
            document.querySelectorAll(".paint-swatch-count").forEach((text) => {
                text.classList.remove("text-ellipsis");
            });
        }

        if (document.body.contains(document.querySelector(".game-color-swatch"))) {
            document.querySelectorAll(".game-color-swatch").forEach((element) => {
                if (element.contains(element.querySelector("span"))) element.querySelector("span").classList.remove("text-ellipsis");
            });
        }
    }

    removeClasses();

    setInterval(removeClasses, 2000);
})();
