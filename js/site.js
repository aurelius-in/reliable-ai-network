(function () {
  var script = document.currentScript || document.querySelector('script[src*="js/site.js"]');
  var root = new URL("../", script.src);
  var CANONICAL_ORIGIN = "https://reliableainetwork.com/";

  function abs(path) {
    return new URL(path.replace(/^\//, ""), root).href;
  }

  function withCampaign(url, campaign) {
    try {
      var u = new URL(url, root);
      if (!u.searchParams.has("utm_source")) {
        u.searchParams.set("utm_source", "reliableainetwork");
        u.searchParams.set("utm_medium", "referral");
        u.searchParams.set("utm_campaign", campaign || "site");
      }
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function track(name, props) {
    var payload = Object.assign({ event: name }, props || {});
    window.dispatchEvent(new CustomEvent("rain:event", { detail: payload }));
    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push(payload);
    }
  }

  window.RAIN_SITE = {
    root: root.href,
    abs: abs,
    withCampaign: withCampaign,
    track: track,
    canonicalOrigin: CANONICAL_ORIGIN
  };

  var page = (document.body && document.body.getAttribute("data-page")) || "";

  var links = [
    { href: "portfolio.html", label: "Portfolio", page: "portfolio" },
    { href: "products.html", label: "Products", page: "products" },
    { href: "books.html", label: "Books", page: "books" },
    { href: "oliver-ellison.html", label: "About", page: "about" },
    { href: "consultation.html", label: "Contact", page: "contact", cta: true }
  ];

  function navHtml() {
    return links.map(function (l) {
      var current = page === l.page ? ' aria-current="page"' : "";
      var cls = l.cta ? ' class="nav-cta"' : "";
      return '<a href="' + abs(l.href) + '"' + cls + current + ">" + l.label + "</a>";
    }).join("");
  }

  function inject() {
    var header = document.getElementById("site-header");
    if (header) {
      header.innerHTML =
        '<header class="site-header">' +
          '<div class="nav-inner">' +
            '<a class="site-brand" href="' + root.href + '" aria-label="Reliable AI Network home">' +
              '<img src="' + abs("assets/brand/rain-mark.png") + '" alt="" width="72" height="56">' +
              '<span class="name">Reliable AI Network</span>' +
            "</a>" +
            '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">' +
              "<span></span><span></span><span></span>" +
            "</button>" +
            '<nav class="site-nav" id="site-nav">' + navHtml() + "</nav>" +
          "</div>" +
        "</header>";
    }

    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.innerHTML =
        '<footer class="site-footer">' +
          "<p>&copy; 2026 Reliable AI Network, Inc.</p>" +
          '<p class="links">' +
            '<a href="' + abs("portfolio.html") + '">Portfolio</a>' +
            '<a href="' + abs("products.html") + '">Products</a>' +
            '<a href="' + abs("books.html") + '">Books</a>' +
            '<a href="' + abs("oliver-ellison.html") + '">About</a>' +
            '<a href="' + abs("consultation.html") + '">Contact</a>' +
            '<a href="https://github.com/aurelius-in/reliable-ai-network" rel="noopener">GitHub</a>' +
            '<a href="https://www.linkedin.com/in/oellison/" rel="noopener">LinkedIn</a>' +
          "</p>" +
        "</footer>";
    }

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
    }

    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-track]");
      if (!a) return;
      track(a.getAttribute("data-track"), {
        href: a.getAttribute("href"),
        label: (a.textContent || "").trim()
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
