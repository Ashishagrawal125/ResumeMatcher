// Adjust this if your backend URL changes
// const API_BASE = "http://127.0.0.1:8000";
const API_BASE = "https://resumematcher-3-8mfr.onrender.com";

/* ========== AUTH: SIGNUP ========== */
const signupBtn = document.getElementById("btn-signup");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const msg = document.getElementById("signup-msg");

    msg.textContent = "Creating account...";

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        msg.textContent = "Signup successful!";
      } else {
        msg.textContent = data.detail || "Signup failed.";
      }
    } catch (err) {
      msg.textContent = "Server not reachable.";
      console.error(err);
    }
  });
}

/* ========== AUTH: LOGIN ========== */
const loginBtn = document.getElementById("btn-login");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const msg = document.getElementById("login-msg");
    const tokenBox = document.getElementById("auth-token");

    msg.textContent = "Logging in...";

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        msg.textContent = "Login successful!";
        tokenBox.value = data.access_token || "";
        localStorage.setItem("jwt_token", data.access_token || "");
      } else {
        msg.textContent = data.detail || "Login failed.";
      }
    } catch (err) {
      msg.textContent = "Server not reachable.";
      console.error(err);
    }
  });
}

/* ========== DASHBOARD: WORD COUNT + CLEAR ========== */
const jdTextArea = document.getElementById("job-description");
const jdWordCount = document.getElementById("jd-word-count");
if (jdTextArea && jdWordCount) {
  const updateWordCount = () => {
    const text = jdTextArea.value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    jdWordCount.textContent = `${count} word${count === 1 ? "" : "s"}`;
  };
  jdTextArea.addEventListener("input", updateWordCount);
  updateWordCount();
}

const clearJdBtn = document.getElementById("btn-clear-jd");
if (clearJdBtn && jdTextArea) {
  clearJdBtn.addEventListener("click", () => {
    jdTextArea.value = "";
    if (jdWordCount) jdWordCount.textContent = "0 words";
  });
}

const analyzeBtn = document.getElementById("btn-analyze");
if (analyzeBtn && jdTextArea) {
  analyzeBtn.addEventListener("click", () => {
    // For now it's just a visual button; backend parsing is done at upload time.
    analyzeBtn.textContent = "Analyzed ✓";
    setTimeout(() => (analyzeBtn.textContent = "Analyze"), 1200);
  });
}

/* ========== DASHBOARD: PARSE & MATCH ========== */
const parseBtn = document.getElementById("btn-parse");
if (parseBtn) {
  parseBtn.addEventListener("click", async () => {
    const jd = document.getElementById("job-description").value.trim();
    const filesInput = document.getElementById("resumes");
    const parseMsg = document.getElementById("parse-msg");

    if (!jd) {
      parseMsg.textContent = "Please paste a job description.";
      return;
    }
    if (!filesInput.files.length) {
      parseMsg.textContent = "Please select at least one resume file.";
      return;
    }

    parseMsg.textContent = "Uploading & matching…";

    const form = new FormData();
    form.append("job_description", jd);
    for (const file of filesInput.files) {
      form.append("resumes", file);
    }

    try {
      const res = await fetch(`${API_BASE}/resumes/upload`, {
        method: "POST",
        body: form
      });

      const data = await res.json();
      if (!res.ok) {
        parseMsg.textContent = `Error: ${res.status}`;
        console.error("Error response:", data);
        return;
      }

      parseMsg.textContent = "Success!";
      renderResults(data);
    } catch (err) {
      parseMsg.textContent = "Server error. Check console.";
      console.error(err);
    }
  });
}

/* ========== DASHBOARD: FILE LIST + DRAG DROP ========== */
const resumesInput = document.getElementById("resumes");
const fileList = document.getElementById("file-list");
if (resumesInput && fileList) {
  const renderFileList = () => {
    fileList.innerHTML = "";
    for (const file of resumesInput.files) {
      const line = document.createElement("div");
      line.textContent = `• ${file.name}`;
      fileList.appendChild(line);
    }
  };
  resumesInput.addEventListener("change", renderFileList);

  const uploadBox = document.getElementById("upload-box");
  if (uploadBox) {
    uploadBox.addEventListener("click", () => resumesInput.click());

    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach(evt =>
      uploadBox.addEventListener(evt, prevent)
    );
    ["dragenter", "dragover"].forEach(evt =>
      uploadBox.addEventListener(evt, () => uploadBox.classList.add("upload-active"))
    );
    ["dragleave", "drop"].forEach(evt =>
      uploadBox.addEventListener(evt, () => uploadBox.classList.remove("upload-active"))
    );

    uploadBox.addEventListener("drop", (e) => {
      resumesInput.files = e.dataTransfer.files;
      renderFileList();
    });
  }
}

/* ========== DASHBOARD: RENDER RESULTS / LEADERBOARD ========== */
function renderResults(data) {
  const container = document.getElementById("results-container");
  const empty = document.getElementById("results-empty");
  const rankingSummary = document.getElementById("ranking-summary");
  const candidateCountLabel = document.getElementById("dash-candidate-count");

  if (!container) return;

  container.innerHTML = "";
  if (empty) empty.style.display = "none";

  let results = data.results || [];
  // store for sorting / export
  window.__lastResults = results;

  // sort by score descending
  results = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));

  if (candidateCountLabel) {
    candidateCountLabel.textContent = `${results.length} candidate${results.length === 1 ? "" : "s"} loaded`;
  }

  if (rankingSummary) {
    if (!results.length) {
      rankingSummary.textContent = "No candidates yet. Run a match to see leaderboard.";
    } else {
      const top = results[0];
      rankingSummary.textContent = `Top candidate: ${(top.name || top.email || top.filename || "Unknown")} • Score: ${(top.score * 100).toFixed(0)}%`;
    }
  }

  results.forEach((cand, index) => {
    const row = document.createElement("div");
    row.className = "leader-row";

    const info = document.createElement("div");
    info.className = "leader-info";
    const name = document.createElement("div");
    name.className = "leader-name";
    name.textContent = `${index + 1}. ${cand.name || cand.email || cand.filename || "Candidate"}`;

    const meta = document.createElement("div");
    meta.className = "leader-meta";
    meta.textContent = `${cand.email || "No email"} • ${cand.filename || ""}`;

    info.appendChild(name);
    info.appendChild(meta);

    const scoreBox = document.createElement("div");
    scoreBox.className = "leader-score";

    const scoreValue = document.createElement("div");
    scoreValue.className = "score-label";
    const pct = Math.round((cand.score || 0) * 100);
    scoreValue.textContent = `${pct}% match`;

    const bar = document.createElement("div");
    bar.className = "score-bar";
    const barInner = document.createElement("div");
    barInner.className = "score-bar-inner";
    barInner.style.width = `${pct}%`;
    bar.appendChild(barInner);

    const selectedLabel = document.createElement("div");
    selectedLabel.className = "score-label";
    selectedLabel.textContent = cand.selected ? "✅ Selected" : "⬜ Not selected";

    scoreBox.appendChild(scoreValue);
    scoreBox.appendChild(bar);
    scoreBox.appendChild(selectedLabel);

    row.appendChild(info);
    row.appendChild(scoreBox);
    container.appendChild(row);
  });
}

/* ========== DASHBOARD: SORT BUTTON ========== */
const sortBtn = document.getElementById("btn-sort-score");
if (sortBtn) {
  sortBtn.addEventListener("click", () => {
    if (window.__lastResults) {
      renderResults({ results: window.__lastResults });
    }
  });
}

/* ========== EXPORT: JSON + SUMMARY ========== */
const downloadBtn = document.getElementById("btn-download-json");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    if (!window.__lastResults) return;
    const blob = new Blob([JSON.stringify(window.__lastResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume_match_results.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

const copySummaryBtn = document.getElementById("btn-copy-summary");
if (copySummaryBtn) {
  copySummaryBtn.addEventListener("click", async () => {
    const exportMsg = document.getElementById("export-msg");
    if (!window.__lastResults || !window.__lastResults.length) {
      if (exportMsg) exportMsg.textContent = "No results to summarise.";
      return;
    }
    const lines = window.__lastResults
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((c, i) => `${i + 1}. ${(c.name || c.email || c.filename)} – ${(c.score * 100).toFixed(0)}% match`);
    const summary = "ResumeMatch Results:\n" + lines.join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      if (exportMsg) exportMsg.textContent = "Summary copied to clipboard!";
    } catch (err) {
      if (exportMsg) exportMsg.textContent = "Could not copy summary.";
      console.error(err);
    }
  });
}
// reveal sections when scroll into view
const revealOnScroll = () => {
  document.querySelectorAll('.fade-in-on-scroll, .zoom-on-scroll').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
