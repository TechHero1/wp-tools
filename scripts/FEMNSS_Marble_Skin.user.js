// ==UserScript==
// @name         FEMNSS Marble Skin (2.0)
// @version      2026-09-27
// @description  Very Simple FEMNSS Skin for Blue Marble and variants
// @author       Far Eastern Magic Napping Society of Summer
// @icon         https://techhero1.github.io/wp-tools/scripts/icon.png
// @match        *://*.wplace.live/*
// @run-at       document-idle
// @updateURL    https://techhero1.github.io/wp-tools/scripts/FEMNSS_Marble_Skin.user.js
// @downloadURL  https://techhero1.github.io/wp-tools/scripts/FEMNSS_Marble_Skin.user.js
// ==/UserScript==

var femnss_name = "FEMNSS Marble";
var femnss_short = "FEMNSS";
var femnss_icon = "https://techhero1.github.io/wp-tools/scripts/icon.png";
var femnss_round = "50%";

(function() {
    'use strict';
    function replaceImages() {
        //Blue Marble - Title
        document.querySelectorAll("h1").forEach((h1) => {
            if (h1.innerHTML.startsWith("Blue Marble")) {
                h1.innerHTML = femnss_name;
            }
        });

        //Blue Marble (Old/Modded) - Icon
        document.querySelectorAll("img").forEach((img) => {
            if (img.src.startsWith("https://raw.githubusercontent.com/SwingTheVine/Wplace-BlueMarble/main/dist/assets/Favicon.png")) {
                img.src = femnss_icon;
                img.style.borderRadius = femnss_round;
            }
        });

        //Blue Marble (New) - Icon
        document.querySelectorAll("img").forEach((img) => {
            if (img.src.startsWith('data:image/png;base64,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')) {
                img.src = femnss_icon;
                img.style.borderRadius = femnss_round;
            }
        });

        //Skirk Marble - Title
        document.querySelectorAll("h1").forEach((h1) => {
            if (h1.innerHTML.startsWith("Skirk Marble")) {
                h1.innerHTML = femnss_name;
            }
        });

        //Skirk Marble - Icon
        document.querySelectorAll("img").forEach((img) => {
            if (img.src.startsWith("https://raw.githubusercontent.com/Seris0/Wplace-SkirkMarble/main/dist/assets/Favicon.png")) {
                img.src = femnss_icon;
                img.style.borderRadius = femnss_round;
            }
        });

        //Chromora - Title
        document.querySelectorAll("h1").forEach((h1) => {
            if (h1.innerHTML.startsWith("Chromora")) {
                h1.innerHTML = femnss_short;
            }
        });
    }

    replaceImages();
})();
