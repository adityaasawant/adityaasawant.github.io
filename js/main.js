/* ==========================================================
   Aditya Sawant | Portfolio
   No dependencies. Edit CONFIG to personalise the site.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Configuration ---------- */
  var CONFIG = {
    email: "adityasawant759@gmail.com",
    careerStart: "2022-08-01",        // used for "N years of experience" in the intro
    githubUser: "adityaasawant",
    maxProjects:7,                  // tiles shown in the Projects grid (the "See all" tile is extra)
    excludeRepos: []                  // repo names to never show, e.g. ["old-test-repo"]
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("#menu-toggle");
  var nav = $("#nav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  /* ---------- Header border on scroll ---------- */
  var header = $("#site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scrollspy ---------- */
  var navLinks = $$(".nav__list a");
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); }).filter(Boolean);

  function setCurrent(id) {
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Years of experience (stays current automatically) ---------- */
  var yearsEl = $("[data-years]");
  if (yearsEl) {
    var began = new Date(CONFIG.careerStart);
    var now = new Date();
    var years = now.getFullYear() - began.getFullYear();
    var beforeAnniversary = now.getMonth() < began.getMonth() ||
      (now.getMonth() === began.getMonth() && now.getDate() < began.getDate());
    if (beforeAnniversary) years -= 1;
    if (years >= 1) {
      yearsEl.textContent = years + (years === 1 ? " year" : " years");
    } else {
      var months = Math.max(1, (now.getFullYear() - began.getFullYear()) * 12 + now.getMonth() - began.getMonth());
      yearsEl.textContent = months + (months === 1 ? " month" : " months");
    }
  }

  var yearNode = $("#year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ---------- Projects: top up the grid from GitHub ----------
     The hand-written tiles in index.html always show. If fewer than
     CONFIG.maxProjects are there, the rest are filled from your public
     GitHub repositories (original repos with a description, most starred
     first). If GitHub can't be reached, the page just keeps what it has. */
  var tiles = $("#tiles");
  var allTile = $("#tile-all");

  function repoTitle(name) {
    return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function makeIcon(name, cls) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", "#i-" + name);
    svg.appendChild(use);
    return svg;
  }

  function makeTile(repo) {
    var art = document.createElement("article");
    art.className = "tile";
    art.setAttribute("data-repo-name", repo.name);
    art.appendChild(makeIcon("github", "ico ico--fill tile__icon"));

    var lang = document.createElement("p");
    lang.className = "tile__lang";
    lang.textContent = repo.language || "Code";

    var h3 = document.createElement("h3");
    var a = document.createElement("a");
    a.href = repo.html_url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = repoTitle(repo.name);
    h3.appendChild(a);

    var desc = document.createElement("p");
    desc.className = "tile__desc";
    desc.textContent = repo.description || "";

    art.appendChild(lang);
    art.appendChild(h3);
    art.appendChild(desc);

    var topics = (repo.topics || []).slice(0, 3);
    if (topics.length) {
      var ul = document.createElement("ul");
      ul.className = "tile__tags";
      ul.setAttribute("aria-label", "Topics");
      topics.forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      });
      art.appendChild(ul);
    }
    return art;
  }

  function fillProjects(repos) {
    var shown = {};
    $$("[data-repo-name]", tiles).forEach(function (t) {
      shown[t.getAttribute("data-repo-name").toLowerCase()] = true;
    });

    var need = CONFIG.maxProjects - Object.keys(shown).length;
    if (need <= 0) return;

    var skip = CONFIG.excludeRepos.map(function (n) { return n.toLowerCase(); });
    var candidates = repos.filter(function (r) {
      var n = r.name.toLowerCase();
      return !r.fork && !r.archived && r.description &&
        !shown[n] && skip.indexOf(n) === -1 &&
        n !== CONFIG.githubUser.toLowerCase() &&
        !/\.github\.io$/.test(n);
    });

    candidates.sort(function (a, b) {
      return (b.stargazers_count - a.stargazers_count) ||
        (new Date(b.pushed_at) - new Date(a.pushed_at));
    });

    candidates.slice(0, need).forEach(function (r) {
      tiles.insertBefore(makeTile(r), allTile);
    });
  }

  function loadRepos(done) {
    var key = "gh-repos:" + CONFIG.githubUser;
    try {
      var cached = JSON.parse(sessionStorage.getItem(key));
      if (cached && Date.now() - cached.t < 3600000) { done(cached.d); return; }
    } catch (e) { /* ignore */ }

    if (!window.fetch) return;
    fetch("https://api.github.com/users/" + encodeURIComponent(CONFIG.githubUser) + "/repos?per_page=100&sort=pushed")
      .then(function (res) { if (!res.ok) throw new Error("GitHub " + res.status); return res.json(); })
      .then(function (data) {
        var slim = data.map(function (r) {
          return {
            name: r.name, description: r.description, language: r.language,
            html_url: r.html_url, fork: r.fork, archived: r.archived,
            stargazers_count: r.stargazers_count, pushed_at: r.pushed_at, topics: r.topics
          };
        });
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: slim })); } catch (e) { /* ignore */ }
        done(slim);
      })
      .catch(function () { /* offline or rate-limited: keep the tiles already on the page */ });
  }

  if (tiles && allTile) loadRepos(fillProjects);

  /* ---------- Copy email ---------- */
  var copyBtn = $("#copy-email");
  var copyStatus = $("#copy-status");

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function announceCopy(ok) {
    var labelEl = $(".text-btn__label", copyBtn) || copyBtn;   // keeps the icon in place
    var label = labelEl.getAttribute("data-label") || labelEl.textContent;
    labelEl.setAttribute("data-label", label);
    labelEl.textContent = ok ? "Copied" : "Copy failed, select the address above";
    if (copyStatus) copyStatus.textContent = ok ? "Email address copied." : "Could not copy the email address.";
    window.setTimeout(function () {
      labelEl.textContent = label;
      if (copyStatus) copyStatus.textContent = "";
    }, 2200);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(CONFIG.email).then(
          function () { announceCopy(true); },
          function () { announceCopy(fallbackCopy(CONFIG.email)); }
        );
      } else {
        announceCopy(fallbackCopy(CONFIG.email));
      }
    });
  }
})();
