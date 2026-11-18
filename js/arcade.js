(function () {
  var toggle = document.getElementById("sound");
  var status = document.getElementById("status");
  var picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
  var ctx = null;
  var enabled = false;

  try {
    enabled = localStorage.getItem("ae-sound") === "on";
  } catch (err) {
    enabled = false;
  }

  function paint() {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggle.textContent = enabled ? "Sound on" : "Sound off";
  }

  function blip(freq) {
    if (!enabled) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = ctx || new AC();
      if (ctx.state === "suspended") {
        ctx.resume().catch(function () {});
      }
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      var now = ctx.currentTime;
      gain.gain.setValueAtTime(0.028, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (err) {}
  }

  function sync(announce) {
    var chosen = null;
    picks.forEach(function (pick) {
      var slot = pick.closest(".slot");
      if (slot) slot.classList.toggle("is-on", pick.checked);
      if (pick.checked) chosen = pick;
    });
    if (!announce || !status) return;
    if (!chosen) {
      status.textContent = "Selection cleared.";
      return;
    }
    var marquee = document.querySelector('label[for="' + chosen.id + '"] .marquee');
    var name = marquee ? marquee.textContent.replace(/\s+/g, " ").trim() : "Cabinet";
    status.textContent = name + " selected. The description and links are under that cabinet.";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      enabled = !enabled;
      try {
        localStorage.setItem("ae-sound", enabled ? "on" : "off");
      } catch (err) {}
      paint();
      if (enabled) blip(680);
    });
  }

  picks.forEach(function (pick) {
    pick.addEventListener("change", function () {
      sync(true);
      if (!pick.checked) return;
      blip(480);
      var sheet = document.getElementById(pick.getAttribute("aria-controls"));
      var target = sheet ? sheet.querySelector(".btn-play") : null;
      if (target) target.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });

  document.querySelectorAll(".close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var backId = btn.getAttribute("data-return");
      picks.forEach(function (pick) {
        pick.checked = false;
      });
      sync(true);
      var back = backId ? document.getElementById(backId) : null;
      if (back) back.focus();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var any = picks.some(function (pick) {
      return pick.checked;
    });
    if (!any) return;
    var current = picks.filter(function (pick) {
      return pick.checked;
    })[0];
    picks.forEach(function (pick) {
      pick.checked = false;
    });
    sync(true);
    if (current) current.focus();
  });

  paint();
  sync(false);
})();
