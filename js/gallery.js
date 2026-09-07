(function () {
  var api = window.RAIN_PROJECTS_API;
  if (!api) return;

  var INDUSTRY_BASE = [
    "DevOps / SRE", "Edge AI & Computer Vision", "Finance & Legal", "Healthcare",
    "HR & Recruiting", "Industrial & Field Ops", "Insurance", "Marketing / AdOps",
    "Media & Entertainment", "Platform / IT"
  ];
  var CAPS_BASE = [
    "AdOps", "Agentic", "Anomaly / Forecast", "Compliance", "CV (Computer Vision)", "Document AI",
    "Edge", "Evals", "Experimentation", "Generative AI", "Governance", "Image Editing", "Image Generation",
    "Music Intelligence", "Recruiting / ATS", "Retrieval (RAG)", "UI & Traces", "Video Enhancement", "Video Generation", "Policy / OPA"
  ];

  api.load().then(function (PROJS) {
    PROJS.forEach(function (p) {
      if (!p.caps.includes("Agentic")) p.caps.push("Agentic");
      if (!p.codeAccess) p.codeAccess = "open_source";
    });

    var grid = document.getElementById("grid");
    var fIndustry = document.getElementById("fIndustry");
    var fCap = document.getElementById("fCap");
    var fCode = document.getElementById("fCode");
    if (!grid) return;

    function fillSelect(selectEl, allLabel, values) {
      selectEl.innerHTML = "";
      var first = document.createElement("option");
      first.value = "all";
      first.textContent = allLabel;
      selectEl.appendChild(first);
      values.forEach(function (v) {
        var opt = document.createElement("option");
        opt.textContent = v;
        selectEl.appendChild(opt);
      });
      selectEl.value = "all";
    }

    function populateSelectsFromData() {
      var inds = new Set(INDUSTRY_BASE);
      var caps = new Set(CAPS_BASE);
      PROJS.forEach(function (p) {
        (p.industries || []).forEach(function (i) { inds.add(i); });
        (p.caps || []).forEach(function (c) { caps.add(c); });
      });
      fillSelect(fIndustry, "All industries", Array.from(inds).sort(function (a, b) {
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      }));
      fillSelect(fCap, "All capabilities", Array.from(caps).sort(function (a, b) {
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      }));
    }

    function match(p) {
      var ind = fIndustry.value;
      var cap = fCap.value;
      var code = fCode.value;
      var okInd = (ind === "all") || p.industries.includes(ind);
      var okCap = (cap === "all") || p.caps.includes(cap);
      var okCode = (code === "all") || p.codeAccess === code;
      return okInd && okCap && okCode;
    }

    function render() {
      var items = PROJS.filter(match).slice().sort(function (a, b) {
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      });

      grid.innerHTML = items.map(function (p) {
        var caps = p.caps.slice().sort(function (a, b) {
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        }).map(function (t) { return '<span class="badge">' + t + "</span>"; }).join("");
        var inds = p.industries.slice().sort(function (a, b) {
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        }).map(function (t) { return '<span class="badge">' + t + "</span>"; }).join("");

        var href = api.projectHref(p);
        var track = p.id === "make-it-rain" ? "make_it_rain_click" : "project_demo_click";
        var link = href
          ? '<a class="repo" data-track="' + track + '" href="' + href + '" target="_blank" rel="noopener">' + api.linkLabel(p) + "</a>"
          : "";
        var accessLabel = p.codeAccess === "proprietary_saas" ? "Proprietary SaaS" : "Open Source";
        var accessPill = '<span class="pill small">' + accessLabel + "</span>";
        var poster = api.assetUrl(p.poster);
        var gif = p.gif ? api.assetUrl(p.gif) : "";
        var media = (p.poster || p.gif) ? (
          '<div class="proj-media">' +
            '<img class="thumb" src="' + poster + '" loading="lazy"' +
              (gif ? ' data-gif="' + gif + '"' : "") +
              (poster ? ' data-poster="' + poster + '"' : "") +
              ' alt="' + p.title + ' preview">' +
          "</div>"
        ) : "";

        return (
          '<article class="card panel proj-card">' +
            media +
            '<h3 class="title">' + p.title + "</h3>" +
            '<div class="muted">' + p.summary + "</div>" +
            '<div style="margin-top:10px">' + inds + "</div>" +
            '<div style="margin-top:6px">' + caps + "</div>" +
            '<div class="foot">' + link + accessPill + "</div>" +
          "</article>"
        );
      }).join("");

      wireMediaSwaps();
    }

    function wireMediaSwaps() {
      var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var thumbs = document.querySelectorAll(".proj-card .thumb");
      thumbs.forEach(function (img) {
        var gif = img.dataset.gif;
        var poster = img.dataset.poster;
        if (!gif || prefersReduced) return;
        var loadedGif = false;
        var isPlaying = false;
        var play = function () {
          if (isPlaying) return;
          img.src = gif;
          loadedGif = true;
          isPlaying = true;
        };
        var stop = function () {
          if (!isPlaying) return;
          if (poster) img.src = poster;
          isPlaying = false;
        };
        img.addEventListener("mouseenter", play);
        img.addEventListener("mouseleave", stop);
        img.addEventListener("click", function (e) {
          if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
            isPlaying ? stop() : play();
            e.preventDefault();
          }
        });
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (!en.isIntersecting) stop(); });
        }, { threshold: 0 });
        io.observe(img);
      });
    }

    populateSelectsFromData();
    [fIndustry, fCap, fCode].forEach(function (sel) {
      if (!sel) return;
      sel.value = "all";
      sel.addEventListener("change", render);
    });
    render();
    if (window.RAIN_SITE) window.RAIN_SITE.track("portfolio_view");
  }).catch(function (err) {
    var grid = document.getElementById("grid");
    if (grid) grid.innerHTML = '<p class="muted">The project gallery could not load. Refresh, or open this page over https.</p>';
    console.error(err);
  });
})();
