/* FINLIFE v2.0 — application controller
 * Vanilla JavaScript; no build step or framework required.
 * Storage, audio, translation, game loop, history, and overlays.
 */

/* =========================================================
   LOCAL STORAGE — HISTORY
========================================================= */

const STORAGE_KEY = "finlife_history";
const MAX_HISTORY = 20;

function saveResult(entry) {
  try {
    const history = getHistory();

    history.unshift(entry);

    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn("localStorage error:", error);
  }
}

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function openHistory() {
  renderHistory();
  document.getElementById("historyOverlay").classList.add("show");
}

function closeHistory() {
  document.getElementById("historyOverlay").classList.remove("show");
}

function clearHistory() {
  const message = lang === "id" ? "Hapus semua riwayat?" : "Clear all history?";

  if (confirm(message)) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to clear history:", error);
    }

    renderHistory();
  }
}

function renderHistory() {
  const history = getHistory();
  const list = document.getElementById("historyList");
  const isID = lang === "id";

  document.getElementById("historyTitle").textContent = isID
    ? "RIWAYAT"
    : "HISTORY";

  document.getElementById("historySub").textContent = isID
    ? "Hasil permainan tersimpan"
    : "Saved game results";

  document.getElementById("btnClearHistory").innerHTML =
    `<svg width="12" height="12"><use href="#ic-trash"/></svg>
    ${isID ? " Hapus Semua" : " Clear All"}`;

  document.getElementById("btnCloseHistory").textContent = isID
    ? "Tutup"
    : "Close";

  if (history.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        ${isID ? "Belum ada riwayat permainan." : "No game history yet."}
      </div>
    `;

    return;
  }

  const iconTrophy = `
    <svg width="17" height="17" style="color:#4ade80">
      <use href="#ic-trophy"/>
    </svg>
  `;

  const iconSad = `
    <svg width="17" height="17" style="color:#f87171">
      <use href="#ic-sad"/>
    </svg>
  `;

  const iconMeh = `
    <svg width="17" height="17" style="color:var(--gold)">
      <use href="#ic-meh"/>
    </svg>
  `;

  list.innerHTML = history
    .map((item, index) => {
      const badgeClass =
        item.status === "win"
          ? "badge-win"
          : item.status === "lose"
            ? "badge-lose"
            : "badge-neutral";

      const badgeLabel =
        item.status === "win"
          ? isID
            ? "Menang"
            : "Win"
          : item.status === "lose"
            ? isID
              ? "Kalah"
              : "Lose"
            : isID
              ? "Cukup"
              : "Ok";

      const icon =
        item.status === "win"
          ? iconTrophy
          : item.status === "lose"
            ? iconSad
            : iconMeh;

      const iconClass =
        item.status === "win"
          ? "icon-win"
          : item.status === "lose"
            ? "icon-lose"
            : "icon-neutral";

      return `
      <div class="history-item">

        <div class="history-item-icon-wrap ${iconClass}">
          ${icon}
        </div>

        <div class="history-item-info">

          <div class="history-item-date">
            ${item.date} · #${history.length - index}
          </div>

          <div class="history-item-result">
            ${isID ? item.msgID : item.msgEN}
          </div>

          <div class="history-item-stats">
            ${isID ? "Tabungan" : "Savings"}:
            ${item.saving}
            &nbsp;·&nbsp;
            ${isID ? "Hari" : "Days"}:
            ${item.days}
          </div>

        </div>

        <span class="history-item-badge ${badgeClass}">
          ${badgeLabel}
        </span>

      </div>
    `;
    })
    .join("");
}

/* =========================================================
   AUDIO ENGINE
========================================================= */

let audioCtx = null;
let musicGain = null;

let musicEnabled = true;
let sfxEnabled = true;
let musicPlaying = false;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  return audioCtx;
}

/* BACKGROUND MUSIC */

function startMusic() {
  if (!musicEnabled || musicPlaying) return;

  try {
    const ctx = getAudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    musicGain = ctx.createGain();

    musicGain.gain.setValueAtTime(0, ctx.currentTime);

    musicGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2);

    musicGain.connect(ctx.destination);

    const masterComp = ctx.createDynamicsCompressor();
    masterComp.connect(musicGain);

    function playChord(freq, startTime, duration, gain = 0.12) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);

      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.05);

      gainNode.gain.linearRampToValueAtTime(0, startTime + duration - 0.05);

      oscillator.connect(gainNode);
      gainNode.connect(masterComp);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    }

    function playMelody(
      freq,
      startTime,
      duration,
      type = "triangle",
      gain = 0.18,
    ) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value = 2000;

      oscillator.type = type;
      oscillator.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);

      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);

      gainNode.gain.linearRampToValueAtTime(0, startTime + duration - 0.01);

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterComp);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    }

    const bpm = 110;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 8;

    function scheduleLoop(offset) {
      if (!musicPlaying) return;

      const time = ctx.currentTime + offset;

      // Bass
      [
        [130.81, 0],
        [130.81, 2],
        [174.61, 4],
        [116.54, 6],
      ].forEach(([frequency, beatPosition]) => {
        for (let i = 0; i < 4; i++) {
          playMelody(
            frequency,
            time + beatPosition * beat + i * beat,
            beat * 0.8,
            "sawtooth",
            0.1,
          );
        }
      });

      // Chords
      [
        [
          [261.63, 329.63, 392],
          [0, bar],
        ],
        [
          [349.23, 440, 523.25],
          [bar * 2, bar],
        ],
        [
          [293.66, 369.99, 440],
          [bar * 4, bar],
        ],
        [
          [246.94, 311.13, 392],
          [bar * 6, bar],
        ],
      ].forEach(([frequencies, timing]) => {
        const [start, duration] = timing;

        frequencies.forEach((frequency) => {
          playChord(frequency, time + start, duration, 0.04);
        });
      });

      // Melody
      [
        [523.25, 0 * beat, beat * 0.9],
        [493.88, 1 * beat, beat * 0.9],
        [440, 2 * beat, beat * 0.9],
        [392, 3 * beat, beat * 1.9],

        [523.25, 4 * beat, beat * 0.5],
        [587.33, 5 * beat, beat * 0.5],
        [523.25, 6 * beat, beat * 0.9],
        [493.88, 7 * beat, beat * 0.9],

        [440, 8 * beat, beat * 1.9],
        [392, 10 * beat, beat * 0.5],
        [349.23, 11 * beat, beat * 1.5],
        [392, 13 * beat, beat * 0.5],
        [440, 14 * beat, beat * 0.9],
        [493.88, 15 * beat, beat * 0.9],

        [523.25, 16 * beat, beat * 1.9],
        [587.33, 18 * beat, beat * 0.5],
        [659.25, 19 * beat, beat * 0.5],
        [587.33, 20 * beat, beat * 0.9],
        [523.25, 21 * beat, beat * 0.9],
        [493.88, 22 * beat, beat * 1.9],

        [440, 24 * beat, beat * 0.5],
        [392, 25 * beat, beat * 0.5],
        [349.23, 26 * beat, beat * 1.9],
        [329.63, 28 * beat, beat * 0.5],
        [349.23, 29 * beat, beat * 0.5],
        [392, 30 * beat, beat * 1.9],
      ].forEach(([frequency, start, duration]) => {
        playMelody(frequency, time + start, duration, "triangle", 0.25);
      });

      setTimeout(() => scheduleLoop(loopLen - 0.1), (loopLen - 0.2) * 1000);
    }

    musicPlaying = true;
    scheduleLoop(0);
  } catch (error) {
    console.warn("Music error:", error);
  }
}

function stopMusic() {
  musicPlaying = false;

  if (musicGain) {
    try {
      const ctx = getAudioCtx();

      musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    } catch (error) {
      console.warn("Unable to stop music:", error);
    }
  }
}

function pauseMusic() {
  if (audioCtx && audioCtx.state === "running") {
    audioCtx.suspend();
  }
}

function resumeMusic() {
  if (audioCtx && audioCtx.state === "suspended" && musicEnabled) {
    audioCtx.resume();
  }
}

/* SOUND EFFECTS */

function sfx(type) {
  if (!sfxEnabled) return;

  try {
    const ctx = getAudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const time = ctx.currentTime;

    if (type === "coin") {
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.2, time + index * 0.07);

        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          time + index * 0.07 + 0.2,
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(time + index * 0.07);
        oscillator.stop(time + index * 0.07 + 0.22);
      });
    } else if (type === "lose") {
      [220, 185, 155].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "sawtooth";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.18, time + index * 0.1);

        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          time + index * 0.1 + 0.25,
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(time + index * 0.1);
        oscillator.stop(time + index * 0.1 + 0.28);
      });
    } else if (type === "click") {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = 800;

      gainNode.gain.setValueAtTime(0.08, time);

      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(time);
      oscillator.stop(time + 0.08);
    } else if (type === "save") {
      [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.15, time + index * 0.09);

        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          time + index * 0.09 + 0.35,
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(time + index * 0.09);
        oscillator.stop(time + index * 0.09 + 0.38);
      });
    } else if (type === "win") {
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach(
        (frequency, index) => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.type = "triangle";
          oscillator.frequency.value = frequency;

          gainNode.gain.setValueAtTime(0.15, time + index * 0.1);

          gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            time + index * 0.1 + 0.35,
          );

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.start(time + index * 0.1);
          oscillator.stop(time + index * 0.1 + 0.4);
        },
      );
    } else if (type === "pause") {
      [440, 330].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.12, time + index * 0.12);

        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          time + index * 0.12 + 0.2,
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(time + index * 0.12);
        oscillator.stop(time + index * 0.12 + 0.22);
      });
    }
  } catch (error) {
    console.warn("SFX error:", error);
  }
}

/* =========================================================
   LANGUAGE SYSTEM
========================================================= */

let lang = "id";

const strings = {
  id: {
    startDesc:
      "Kelola uangmu selama 30 hari, ambil keputusan terbaik, dan capai target tabungan Rp1.000.000.",
    startBtn: "MAINKAN",
    startNote: "Aktifkan volume untuk pengalaman terbaik",
    startHistory: "Riwayat Permainan",

    lblDay: "Hari",
    lblMoney: "Uang",
    lblSaving: "Tabungan",
    lblTarget: "Target",
    lblProgress: "Progress Tabungan",

    tip: "Tip: Jangan boros di awal bulan",

    btnYes: "Iya",
    btnNo: "Tidak",

    pauseTitle: "PAUSE",
    pauseSub: "Game dijeda",
    btnResume: "Lanjutkan",
    btnQuit: "Selesai",

    settingsTitle: "Pengaturan",
    settingsSub: "Sesuaikan preferensimu",

    lblLangSection: "Bahasa / Language",
    lblAudioSection: "Audio",
    lblBgMusic: "Musik Latar",
    lblSfx: "Efek Suara",
    btnClose: "Tutup",

    resultTitle: "Hasil Akhir",
    rLblSaving: "Tabungan",
    rLblMoney: "Sisa Uang",
    rLblDays: "Hari Selesai",

    btnRestart: "Ulangi",
    btnToMenu: "Menu Utama",

    winMsg: "Luar biasa! Kamu berhasil mencapai target tabungan!",
    loseMoneyMsg: "Kamu kehabisan uang sebelum mencapai target.",
    neutralMsg: "Cukup baik! Masih ada ruang untuk ditingkatkan.",

    days: "hari",
  },

  en: {
    startDesc:
      "Manage your money for 30 days, make the best decisions, and reach the Rp1,000,000 savings target.",
    startBtn: "PLAY",
    startNote: "Turn up the volume for the best experience",
    startHistory: "Game History",

    lblDay: "Day",
    lblMoney: "Money",
    lblSaving: "Savings",
    lblTarget: "Target",
    lblProgress: "Savings Progress",

    tip: "Tip: Don't overspend in the first days",

    btnYes: "Yes",
    btnNo: "No",

    pauseTitle: "PAUSE",
    pauseSub: "Game paused",
    btnResume: "Resume",
    btnQuit: "Quit",

    settingsTitle: "Settings",
    settingsSub: "Adjust your preferences",

    lblLangSection: "Bahasa / Language",
    lblAudioSection: "Audio",
    lblBgMusic: "Background Music",
    lblSfx: "Sound Effects",
    btnClose: "Close",

    resultTitle: "Final Result",
    rLblSaving: "Savings",
    rLblMoney: "Money Left",
    rLblDays: "Days Played",

    btnRestart: "Retry",
    btnToMenu: "Main Menu",

    winMsg: "Amazing! You reached your savings target!",
    loseMoneyMsg: "You ran out of money before reaching the target.",
    neutralMsg: "Not bad! There's still room to improve.",

    days: "days",
  },
};

function t(key) {
  return strings[lang][key] || key;
}

function applyLang() {
  const s = strings[lang];

  document.getElementById("startDesc").textContent = s.startDesc;

  document.getElementById("startBtn").innerHTML =
    `<svg width="15" height="15"><use href="#ic-play"/></svg>${s.startBtn}`;

  document.getElementById("startMusicNote").innerHTML =
    `<svg width="12" height="12"><use href="#ic-music"/></svg>${s.startNote}`;

  document.getElementById("startHistoryBtn").innerHTML =
    `<svg width="14" height="14"><use href="#ic-history"/></svg>${s.startHistory}`;

  document.getElementById("lblDay").textContent = s.lblDay;
  document.getElementById("lblMoney").textContent = s.lblMoney;
  document.getElementById("lblSaving").textContent = s.lblSaving;
  document.getElementById("lblTarget").textContent = s.lblTarget;
  document.getElementById("lblProgress").textContent = s.lblProgress;

  document.getElementById("gameTip").innerHTML =
    `<svg width="12" height="12" style="color:var(--gold);opacity:.7"><use href="#ic-tip"/></svg>${s.tip}`;

  document.getElementById("btnYes").innerHTML =
    `<svg width="14" height="14"><use href="#ic-check"/></svg>${s.btnYes}`;

  document.getElementById("btnNo").innerHTML =
    `<svg width="14" height="14"><use href="#ic-x"/></svg>${s.btnNo}`;

  document.getElementById("pauseTitle").textContent = s.pauseTitle;
  document.getElementById("pauseSub").textContent = s.pauseSub;

  document.getElementById("btnResume").innerHTML =
    `<svg width="14" height="14"><use href="#ic-play"/></svg>${s.btnResume}`;

  document.getElementById("btnQuit").innerHTML =
    `<svg width="14" height="14"><use href="#ic-x"/></svg>${s.btnQuit}`;

  document.getElementById("settingsTitleEl").textContent = s.settingsTitle;
  document.getElementById("settingsSub").textContent = s.settingsSub;
  document.getElementById("lblLangSection").textContent = s.lblLangSection;
  document.getElementById("lblAudioSection").textContent = s.lblAudioSection;
  document.getElementById("lblBgMusic").textContent = s.lblBgMusic;
  document.getElementById("lblSfx").textContent = s.lblSfx;
  document.getElementById("btnCloseSettings").textContent = s.btnClose;

  document.getElementById("resultTitle").textContent = s.resultTitle;
  document.getElementById("rLblSaving").textContent = s.rLblSaving;
  document.getElementById("rLblMoney").textContent = s.rLblMoney;
  document.getElementById("rLblDays").textContent = s.rLblDays;

  document.getElementById("btnRestart").innerHTML =
    `<svg width="14" height="14"><use href="#ic-refresh"/></svg>${s.btnRestart}`;

  document.getElementById("btnToMenu").innerHTML =
    `<svg width="14" height="14"><use href="#ic-home"/></svg>${s.btnToMenu}`;

  if (window.currentEvent) {
    showEvent(window.currentEvent);
  }

  if (document.getElementById("historyOverlay").classList.contains("show")) {
    renderHistory();
  }
}

function setLang(language) {
  sfx("click");

  lang = language;

  document
    .getElementById("btnLangID")
    .classList.toggle("selected", language === "id");

  document
    .getElementById("btnLangEN")
    .classList.toggle("selected", language === "en");

  applyLang();
}

/* =========================================================
   GAME STATE
========================================================= */

let hari = 1;
let uang = 1000000;
let tabungan = 0;

const target = 1000000;

let paused = false;
let currentEvent = null;
let processing = false;

function formatRp(number) {
  return "Rp " + number.toLocaleString("id-ID");
}

function updateUI() {
  document.getElementById("day").textContent = hari;

  document.getElementById("money").textContent = formatRp(uang);

  document.getElementById("saving").textContent = formatRp(tabungan);

  const percentage = Math.min(100, Math.round((tabungan / target) * 100));

  document.getElementById("bar").style.width = percentage + "%";

  document.getElementById("pct").textContent = percentage + "%";
}

function showEvent(event) {
  const data = event[lang] || event.id;

  document.getElementById("eventText").textContent = data.text;

  document.getElementById("btnYes").innerHTML =
    `<svg width="14" height="14"><use href="#ic-check"/></svg>${data.a || t("btnYes")}`;

  document.getElementById("btnNo").innerHTML =
    `<svg width="14" height="14"><use href="#ic-x"/></svg>${data.b || t("btnNo")}`;
}

/* =========================================================
   EVENT SYSTEM
========================================================= */

function nextEvent() {
  if (hari > 30 || uang <= 0) {
    selesai();
    return;
  }

  currentEvent =
    window.FINLIFE_EVENTS[
      Math.floor(Math.random() * window.FINLIFE_EVENTS.length)
    ];

  window.currentEvent = currentEvent;

  showEvent(currentEvent);

  const card = document.getElementById("eventCard");

  card.style.opacity = "0";
  card.style.transform = "translateY(8px)";

  setTimeout(() => {
    card.style.transition = "all 0.3s cubic-bezier(.16,1,.3,1)";
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  }, 40);
}

function pilih(choice) {
  if (paused || processing) return;

  processing = true;

  sfx("click");

  document.getElementById("btnYes").disabled = true;
  document.getElementById("btnNo").disabled = true;

  setTimeout(() => {
    const result = choice === 1 ? currentEvent.a() : currentEvent.b();

    if (result === "coin") {
      sfx("coin");
    } else if (result === "lose") {
      sfx("lose");
    } else if (result === "save") {
      sfx("save");
    }

    const card = document.getElementById("eventCard");

    if (result === "lose") {
      card.classList.add("shake");

      setTimeout(() => {
        card.classList.remove("shake");
      }, 350);
    } else if (result === "save" || result === "coin") {
      const savingElement = document.getElementById("saving");

      savingElement.classList.add("pulse");

      setTimeout(() => {
        savingElement.classList.remove("pulse");
      }, 300);
    }

    hari++;

    updateUI();

    document.getElementById("btnYes").disabled = false;
    document.getElementById("btnNo").disabled = false;

    processing = false;

    nextEvent();
  }, 240);
}

/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function mulaiGame() {
  sfx("click");

  if (window.stopParticles) {
    stopParticles();
  }

  document.getElementById("startScreen").style.display = "none";

  document.getElementById("gameScreen").classList.add("active");

  hari = 1;
  uang = 1000000;
  tabungan = 0;

  paused = false;
  processing = false;

  updateUI();
  applyLang();
  nextEvent();

  setTimeout(() => {
    startMusic();
  }, 400);
}

function setResultIcon(status) {
  const wrap = document.getElementById("resultIconWrap");

  const iconId =
    status === "win" ? "ic-trophy" : status === "lose" ? "ic-sad" : "ic-meh";

  const color =
    status === "win"
      ? "var(--gold)"
      : status === "lose"
        ? "#f87171"
        : "var(--gold)";

  wrap.innerHTML = `
    <svg width="48" height="48" style="color:${color}">
      <use href="#${iconId}"/>
    </svg>
  `;
}

/* =========================================================
   FINISH GAME
========================================================= */

function selesai() {
  stopMusic();

  let messageID;
  let messageEN;
  let status;

  if (uang <= 0) {
    messageID = strings.id.loseMoneyMsg;
    messageEN = strings.en.loseMoneyMsg;
    status = "lose";

    sfx("lose");
  } else if (tabungan >= target) {
    messageID = strings.id.winMsg;
    messageEN = strings.en.winMsg;
    status = "win";

    sfx("win");
  } else {
    messageID = strings.id.neutralMsg;
    messageEN = strings.en.neutralMsg;
    status = "neutral";

    sfx("coin");
  }

  const now = new Date();

  const dateString =
    now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  saveResult({
    status,
    msgID: messageID,
    msgEN: messageEN,
    saving: formatRp(tabungan),
    money: formatRp(Math.max(0, uang)),
    days: Math.min(30, hari - 1),
    date: dateString,
    timestamp: now.getTime(),
  });

  setResultIcon(status);

  document.getElementById("resultMsg").textContent =
    lang === "id" ? messageID : messageEN;

  document.getElementById("rSaving").textContent = formatRp(tabungan);

  document.getElementById("rMoney").textContent = formatRp(Math.max(0, uang));

  document.getElementById("rDays").textContent =
    Math.min(30, hari - 1) + " " + t("days");

  document.getElementById("resultTitle").textContent = t("resultTitle");

  document.getElementById("rLblSaving").textContent = t("rLblSaving");

  document.getElementById("rLblMoney").textContent = t("rLblMoney");

  document.getElementById("rLblDays").textContent = t("rLblDays");

  document.getElementById("btnRestart").innerHTML =
    `<svg width="14" height="14"><use href="#ic-refresh"/></svg>${t("btnRestart")}`;

  document.getElementById("btnToMenu").innerHTML =
    `<svg width="14" height="14"><use href="#ic-home"/></svg>${t("btnToMenu")}`;

  document.getElementById("resultOverlay").classList.add("show");
}

function ulangGame() {
  sfx("click");

  document.getElementById("resultOverlay").classList.remove("show");

  hari = 1;
  uang = 1000000;
  tabungan = 0;

  paused = false;
  processing = false;

  updateUI();
  nextEvent();
  startMusic();
}

function kembaliKeStart() {
  sfx("click");

  stopMusic();

  document.getElementById("resultOverlay").classList.remove("show");

  document.getElementById("pauseOverlay").classList.remove("show");

  document.getElementById("gameScreen").classList.remove("active");

  document.getElementById("startScreen").style.display = "flex";

  if (window.startParticles) {
    startParticles();
  }

  hari = 1;
  uang = 1000000;
  tabungan = 0;

  paused = false;
  processing = false;
}

/* =========================================================
   PAUSE SYSTEM
========================================================= */

function togglePause() {
  sfx("pause");

  paused = !paused;

  const overlay = document.getElementById("pauseOverlay");
  const button = document.getElementById("pauseBtn");

  if (paused) {
    overlay.classList.add("show");

    pauseMusic();

    button.classList.add("active-btn");

    button.innerHTML = `
      <svg width="15" height="15">
        <use href="#ic-play"/>
      </svg>
    `;
  } else {
    overlay.classList.remove("show");

    resumeMusic();

    button.classList.remove("active-btn");

    button.innerHTML = `
      <svg width="15" height="15">
        <use href="#ic-pause"/>
      </svg>
    `;
  }
}

function quitToMenu() {
  sfx("click");
  paused = false;
  kembaliKeStart();
}

/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {
  sfx("click");

  document.getElementById("settingsOverlay").classList.add("show");
}

function closeSettings() {
  sfx("click");

  document.getElementById("settingsOverlay").classList.remove("show");
}

function toggleMusicSetting() {
  musicEnabled = document.getElementById("toggleMusic").checked;

  if (musicEnabled) {
    startMusic();
  } else {
    stopMusic();
  }
}

function toggleSfxSetting() {
  sfxEnabled = document.getElementById("toggleSfx").checked;
}

/* =========================================================
   PARTICLE CANVAS
========================================================= */

(function () {
  const canvas = document.getElementById("startCanvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let width;
  let height;

  let particles = [];
  let animationFrame;

  function resize() {
    const element = document.getElementById("startScreen");

    width = canvas.width = element.offsetWidth;
    height = canvas.height = element.offsetHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * width,
      y: height + Math.random() * 60,

      r: Math.random() * 2.2 + 0.6,

      speed: Math.random() * 0.5 + 0.2,

      drift: (Math.random() - 0.5) * 0.4,

      opacity: Math.random() * 0.55 + 0.15,

      twinkle: Math.random() * Math.PI * 2,

      twinkleSpeed: Math.random() * 0.03 + 0.01,
    };
  }

  function init() {
    resize();

    particles = [];

    for (let i = 0; i < 55; i++) {
      const particle = randomParticle();

      particle.y = Math.random() * height;

      particles.push(particle);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.twinkle += particle.twinkleSpeed;

      const alpha = particle.opacity * (0.6 + 0.4 * Math.sin(particle.twinkle));

      ctx.beginPath();

      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(245,200,66,${alpha})`;

      ctx.fill();

      // Small sparkle on larger particles
      if (particle.r > 1.8) {
        ctx.strokeStyle = `rgba(255,230,100,${alpha * 0.5})`;

        ctx.lineWidth = 0.5;

        ctx.beginPath();

        ctx.moveTo(particle.x - particle.r * 2, particle.y);

        ctx.lineTo(particle.x + particle.r * 2, particle.y);

        ctx.moveTo(particle.x, particle.y - particle.r * 2);

        ctx.lineTo(particle.x, particle.y + particle.r * 2);

        ctx.stroke();
      }

      particle.y -= particle.speed;
      particle.x += particle.drift;

      if (particle.y < -10) {
        Object.assign(particle, randomParticle());
        particle.x = Math.random() * width;
      }
    });

    animationFrame = requestAnimationFrame(draw);
  }

  function start() {
    init();
    draw();
  }

  function stop() {
    cancelAnimationFrame(animationFrame);
  }

  window.startParticles = start;
  window.stopParticles = stop;

  // Start animation on page load
  start();

  // Resize canvas when viewport changes
  window.addEventListener("resize", () => {
    resize();
  });
})();

/* =========================================================
   INITIALIZATION
========================================================= */

applyLang();
