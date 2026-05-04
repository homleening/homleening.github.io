const USERNAME = "homleening"; // ← 改成你的 GitHub 用户名

/* ===== 主题 ===== */
const themeBtn = document.getElementById("theme-toggle");
themeBtn.onclick = () => {
  document.body.classList.toggle("light-mode");
  themeBtn.textContent = document.body.classList.contains("light-mode")
    ? "☀️"
    : "🌙";
};

/* ===== GitHub API ===== */
async function loadGitHubData() {
  const user = await fetch(`https://api.github.com/users/${USERNAME}`).then(r => r.json());
  const repos = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated`)
    .then(r => r.json());

  document.getElementById("avatar").src = user.avatar_url;
  document.getElementById("username").textContent = user.name || user.login;
  document.getElementById("bio").textContent = user.bio || "";

  const reposEl = document.getElementById("repos");
  reposEl.innerHTML = "";

  repos.slice(0, 6).forEach(repo => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
      <p>${repo.description || "No description"}</p>
      <small>⭐ ${repo.stargazers_count}</small>
    `;
    reposEl.appendChild(card);
  });
}

/* ===== 多语言 ===== */
const langs = {
  en: () => import("../i18n/en.json").then(m => m.default),
  zh: () => import("../i18n/zh.json").then(m => m.default)
};

async function loadLang(lang) {
  const dict = await langs[lang]();
  document.querySelectorAll("[data-key]").forEach(el => {
    el.textContent = dict[el.dataset.key];
  });
}

document.getElementById("lang-switch").onchange = e => loadLang(e.target.value);

/* ===== 初始化 ===== */
loadGitHubData();
loadLang("en");