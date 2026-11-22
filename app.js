/* =========================================================
   ML Rank Leaderboard — logika & render
   ========================================================= */

(() => {
  "use strict";

  /* ---------- Konfigurasi rank ---------- */
  const RANKS = [
    { name: "Mythical Immortal", min: 98, max: 100, a: "#ffd76a", b: "#f59e0b", logo: "rank-10.png" },
    { name: "Mythical Glory", min: 95, max: 97, a: "#ff9ec7", b: "#a855f7", logo: "rank-9.png" },
    { name: "Mythical Honor", min: 90, max: 94, a: "#93c5fd", b: "#4f46e5", logo: "rank-8.png" },
    { name: "Mythic", min: 85, max: 89, a: "#d8b4fe", b: "#7c3aed", logo: "rank-7.png" },
    { name: "Legend", min: 75, max: 84, a: "#fdba74", b: "#ea580c", logo: "rank-6.png" },
    { name: "Epic", min: 65, max: 74, a: "#fda4af", b: "#be123c", logo: "rank-5.png" },
    { name: "Grandmaster", min: 50, max: 64, a: "#7dd3fc", b: "#2563eb", logo: "rank-4.png" },
    { name: "Master", min: 35, max: 49, a: "#5eead4", b: "#0f766e", logo: "rank-3.png" },
    { name: "Elite", min: 15, max: 34, a: "#bef264", b: "#16a34a", logo: "rank-2.png" },
    { name: "Warrior", min: 0, max: 14, a: "#cbd5e1", b: "#64748b", logo: "rank-1.png" },
  ];

  const PAGE_SIZE = 30;
  const TASK_LABELS = [
    { label: "Tugas 1", title: "Presentasi Mading", icon: "▤" },
    { label: "Tugas 2", title: "Analisa Berita", icon: "▧" },
    { label: "Tugas 3", title: "Poster", icon: "▩" },
  ];

  let students = [];
  let maxScore = 1;
  let visibleCount = PAGE_SIZE;
  let lastFocused = null;

  const state = { search: "", kelas: "", rank: "", sort: "score-desc" };

  /* ---------- Util ---------- */
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[ch]);

  const fmt = (value) => new Intl.NumberFormat("id-ID").format(value);
  const pct = (value) => `${value.toFixed(1).replace(".", ",")}%`;

  const normalize = (text) =>
    String(text ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const initials = (name) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  function rankOf(percentage) {
    return RANKS.find((rank) => percentage >= rank.min) || RANKS[RANKS.length - 1];
  }

  function rankIndexOf(name) {
    return RANKS.findIndex((rank) => rank.name === name);
  }

  /* ---------- Logo rank dari file atlas (PNG) ---------- */
  function rankLogo(tier, size = 44) {
    return `<img class="mlbb-logo" src="assets/mlbb/${tier.logo}" width="${size}" height="${size}" alt="Logo rank ${esc(tier.name)}" />`;
  }


  /* ---------- Data ---------- */
  function prepareData() {
    if (typeof RANKING_DATA === "undefined" || !RANKING_DATA.students?.length) {
      throw new Error("Data nilai tidak ditemukan. Pastikan data.js termuat dengan benar.");
    }

    maxScore = RANKING_DATA.meta?.maxScore || 300; // 100 x 3 tugas

    students = RANKING_DATA.students
      .map((student, index) => {
        const percentage = (student.score / maxScore) * 100;
        return { ...student, sid: index, percentage, tier: rankOf(percentage) };
      })
      .sort((a, b) => b.score - a.score || a.nama.localeCompare(b.nama, "id"));

    let currentScore = null;
    let currentRank = 0;
    students.forEach((student, index) => {
      if (student.score !== currentScore) {
        currentScore = student.score;
        currentRank = index + 1;
      }
      student.position = currentRank;
    });
  }

  /* ---------- Render: ringkasan ---------- */
  function renderSummary() {
    const top = students[0];
    const avg = students.reduce((sum, s) => sum + s.score, 0) / students.length;
    const classes = new Set(students.map((s) => s.kelas)).size;

    $("#statStudents").textContent = fmt(students.length);
    $("#statMax").textContent = fmt(maxScore);
    $("#statAvg").textContent = avg.toFixed(1).replace(".", ",");
    $("#statClasses").textContent = fmt(classes);

    $("#heroEmblem").innerHTML = rankLogo(top.tier, 40);
    $("#heroEmblemLarge").innerHTML = rankLogo(top.tier, 300);
    $("#heroTopName").textContent = top.nama;
    $("#heroTopScore").textContent = `${fmt(top.score)} poin · ${pct(top.percentage)}`;
    $("#heroNoteText").textContent =
      `${top.nama} (${top.kelas}) memimpin dengan skor ${fmt(top.score)} dari ${fmt(students.length)} siswa.`;
    $("#footerMeta").textContent =
      `Sumber: ${RANKING_DATA.meta.source} · ${fmt(students.length)} siswa · kelas 9 · ${RANKING_DATA.meta.generatedAt}`;
  }

  function renderPodium() {
    const medals = ["TOP 1", "TOP 2", "TOP 3"];
    $("#podium").innerHTML = students.slice(0, 3).map((student, index) => `
      <article class="podium-card ${index === 0 ? "first" : ""}" style="--tier-a:${student.tier.a};--tier-b:${student.tier.b}">
        <span class="podium-medal">${medals[index]}</span>
        <div class="podium-emblem">${rankLogo(student.tier, 92)}</div>
        <span class="podium-tier">${esc(student.tier.name)}</span>
        <h3>${esc(student.nama)}</h3>
        <div class="podium-kelas">Kelas ${esc(student.kelas)} · ${student.jk === "L" ? "Laki-laki" : "Perempuan"}</div>
        <div class="podium-score">${fmt(student.score)} <small>score</small></div>
        <div class="podium-bar"><i style="width:${Math.min(100, student.percentage)}%"></i></div>
      </article>
    `).join("");
  }

  function renderRankGrid() {
    const counts = Object.fromEntries(RANKS.map((rank) => [rank.name, 0]));
    students.forEach((student) => { counts[student.tier.name] += 1; });

    $("#rankGrid").innerHTML = RANKS.map((rank) => `
      <article class="rank-card" style="--tier-a:${rank.a};--tier-b:${rank.b}">
        <div class="rank-card-emblem">${rankLogo(rank, 66)}</div>
        <h3>${esc(rank.name)}</h3>
        <span class="range">${rank.min}% – ${rank.max}%</span>
        <div class="count"><strong>${counts[rank.name]}</strong> siswa</div>
      </article>
    `).join("");

    $("#rankFilter").innerHTML = '<option value="">Semua rank</option>' +
      RANKS.map((rank) => `<option value="${esc(rank.name)}">${esc(rank.name)} · ${rank.min}–${rank.max}%</option>`).join("");
  }

  function renderClassFilter() {
    const classes = [...new Set(students.map((s) => s.kelas))].sort((a, b) => a.localeCompare(b, "id", { numeric: true }));
    $("#classFilter").innerHTML = '<option value="">Semua kelas</option>' +
      classes.map((kelas) => `<option value="${esc(kelas)}">Kelas ${esc(kelas)}</option>`).join("");
  }

  /* ---------- Render: leaderboard ---------- */
  function filteredStudents() {
    const result = students.filter((student) => {
      const haystack = normalize(`${student.nama} ${student.nisn} ${student.nis} ${student.kelas}`);
      if (state.search && !haystack.includes(normalize(state.search))) return false;
      if (state.kelas && student.kelas !== state.kelas) return false;
      if (state.rank && student.tier.name !== state.rank) return false;
      return true;
    });

    const sorters = {
      "score-desc": (a, b) => b.score - a.score || a.nama.localeCompare(b.nama, "id"),
      "score-asc": (a, b) => a.score - b.score || a.nama.localeCompare(b.nama, "id"),
      "name-asc": (a, b) => a.nama.localeCompare(b.nama, "id"),
      "rank-desc": (a, b) => rankIndexOf(b.tier.name) - rankIndexOf(a.tier.name) || b.score - a.score,
    };
    return result.sort(sorters[state.sort] || sorters["score-desc"]);
  }

  function renderTable() {
    const list = filteredStudents();
    const shown = list.slice(0, visibleCount);
    const body = $("#leaderboardBody");

    body.innerHTML = shown.map((student) => {
      const medal = student.position <= 3 ? ` top-${student.position}` : "";
      const detailValues = student.tugas.slice(0, 3).map((value) => value ?? 0);
      return `
        <tr data-id="${student.sid}" style="--tier-a:${student.tier.a};--tier-b:${student.tier.b}">
          <td><span class="rank-number${medal}">${student.position}</span></td>
          <td>
            <button class="row-button" type="button" data-detail="${student.sid}" aria-label="Lihat detail ${esc(student.nama)}">
              <span class="student-avatar">${esc(initials(student.nama))}</span>
              <span class="student-meta">
                <strong>${esc(student.nama)}</strong>
                <small>Kelas ${esc(student.kelas)} · NISN ${esc(student.nisn || "-")} · Tugas ${detailValues.join(" / ")}</small>
              </span>
            </button>
          </td>
          <td>
            <div class="tier-cell">
              <span class="tier-emblem">${rankLogo(student.tier, 40)}</span>
              <span class="tier-label"><strong>${esc(student.tier.name)}</strong><small>${student.tier.min}–${student.tier.max}%</small></span>
            </div>
          </td>
          <td><span class="score-value">${fmt(student.score)}<small>pts</small></span></td>
          <td>
            <div class="progress-cell">
              <div class="progress-meta"><span>${pct(student.percentage)}</span><strong>${esc(student.tier.name)}</strong></div>
              <div class="progress-track"><i style="width:${Math.min(100, student.percentage)}%"></i></div>
            </div>
          </td>
          <td><button class="btn-detail" type="button" data-detail="${student.sid}" aria-label="Detail ${esc(student.nama)}">›</button></td>
        </tr>`;
    }).join("");

    $("#emptyState").hidden = list.length !== 0;
    $("#resultCount").innerHTML = `Menampilkan <strong>${fmt(shown.length)}</strong> dari <strong>${fmt(list.length)}</strong> siswa`;
    $("#loadMore").hidden = shown.length >= list.length;
    if (shown.length < list.length) {
      $("#loadMore").textContent = `Muat lebih banyak (${fmt(list.length - shown.length)} tersisa)`;
    }
  }

  /* ---------- Detail modal ---------- */
  function openDetail(sid) {
    const student = students.find((s) => s.sid === Number(sid));
    if (!student) return;

    lastFocused = document.activeElement;
    const tierIndex = rankIndexOf(student.tier.name);
    const nextTier = RANKS[tierIndex - 1];
    const needed = nextTier ? Math.ceil((nextTier.min / 100) * maxScore) - student.score : 0;
    const values = student.tugas.map((value) => (typeof value === "number" ? value : null));
    const componentSum = values.reduce((sum, value) => sum + (value ?? 0), 0);
    const extra = values.slice(3).filter((value) => value !== null);

    const assignments = TASK_LABELS.map((task, index) => {
      const value = values[index];
      return `
        <div class="assignment-card">
          <span class="assignment-icon" aria-hidden="true">${task.icon}</span>
          <div class="assignment-info">
            <span>${task.label}</span>
            <strong>${task.title}</strong>
            <div class="mini-track"><i style="width:${value ?? 0}%"></i></div>
          </div>
          <div class="assignment-value">${value ?? "—"}<small>${value === null ? "Belum ada nilai" : "dari 100"}</small></div>
        </div>`;
    }).join("");

    const tip = nextTier
      ? `Butuh <strong>${fmt(Math.max(0, needed))} poin</strong> lagi untuk naik ke <strong>${esc(nextTier.name)}</strong> (${nextTier.min}%).`
      : `Tertinggi! Siswa ini sudah mencapai <strong>${esc(student.tier.name)}</strong>.`;

    $("#modalContent").innerHTML = `
      <div class="modal-header" style="--tier-a:${student.tier.a};--tier-b:${student.tier.b}">
        <div class="modal-identity">
          <div class="modal-emblem">${rankLogo(student.tier, 76)}</div>
          <div>
            <h2 id="modalName">${esc(student.nama)}</h2>
            <p>Kelas ${esc(student.kelas)} · NISN ${esc(student.nisn || "-")} · NIS ${esc(student.nis || "-")} · No. ${esc(student.no ?? "-")}</p>
            <span class="modal-tier">★ ${esc(student.tier.name)} · Peringkat #${student.position}</span>
          </div>
        </div>
      </div>
      <div class="modal-score-row" style="--tier-a:${student.tier.a};--tier-b:${student.tier.b}">
        <div class="modal-score-box"><span>Score</span><strong>${fmt(student.score)}<small> pts</small></strong></div>
        <div class="modal-score-box"><span>Persentase</span><strong>${pct(student.percentage)}</strong></div>
        <div class="modal-score-box"><span>Skor maks.</span><strong>${fmt(maxScore)}<small> pts</small></strong></div>
      </div>
      <div class="modal-body">
        <p class="modal-subtitle">Detail Nilai Tugas (tabel Total)</p>
        <div class="assignment-grid">${assignments}</div>
        ${extra.length ? `<div class="extra-totals">${extra.map((value, i) => `<span>Total ${i + 4}: <strong>${value}</strong></span>`).join("")}</div>` : ""}
        <p class="modal-footnote">
          ${tip}<br />
          Skor = ${values.map((v) => v ?? 0).join(" + ")} = <strong>${fmt(componentSum)}</strong> ·
          ${fmt(student.score)} ÷ ${fmt(maxScore)} × 100% = <strong>${pct(student.percentage)}</strong>.
        </p>
      </div>`;

    $("#detailModal").hidden = false;
    document.body.classList.add("modal-open");
    $(".modal-close").focus();
  }

  function closeDetail() {
    $("#detailModal").hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    $("#searchInput").addEventListener("input", (event) => {
      state.search = event.target.value;
      visibleCount = PAGE_SIZE;
      renderTable();
    });
    $("#classFilter").addEventListener("change", (event) => {
      state.kelas = event.target.value;
      visibleCount = PAGE_SIZE;
      renderTable();
    });
    $("#rankFilter").addEventListener("change", (event) => {
      state.rank = event.target.value;
      visibleCount = PAGE_SIZE;
      renderTable();
    });
    $("#sortSelect").addEventListener("change", (event) => {
      state.sort = event.target.value;
      visibleCount = PAGE_SIZE;
      renderTable();
    });
    $("#resetFilter").addEventListener("click", () => {
      state.search = "";
      state.kelas = "";
      state.rank = "";
      state.sort = "score-desc";
      $("#searchInput").value = "";
      $("#classFilter").value = "";
      $("#rankFilter").value = "";
      $("#sortSelect").value = "score-desc";
      visibleCount = PAGE_SIZE;
      renderTable();
    });
    $("#loadMore").addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderTable();
    });

    $("#leaderboardBody").addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-detail]");
      if (trigger) openDetail(trigger.dataset.detail);
    });

    document.querySelectorAll("[data-close-modal]").forEach((element) => {
      element.addEventListener("click", closeDetail);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !$("#detailModal").hidden) closeDetail();
    });
  }

  /* ---------- Init ---------- */
  try {
    prepareData();
    renderSummary();
    renderPodium();
    renderClassFilter();
    renderRankGrid();
    bindEvents();
    renderTable();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div style="padding:18px;margin:18px;border-radius:12px;background:#4c1020;color:#fff;font-family:sans-serif">
        <strong>Gagal memuat leaderboard:</strong> ${esc(error.message)}
      </div>`
    );
  }
})();
