(function () {
  var site = window.RAIN_SITE;
  var api = window.RAIN_PROJECTS_API;
  if (!site || !api) return;

  var grid = document.getElementById("home-systems");
  if (!grid) return;

  fetch(site.abs("data/books.json")).then(function (r) { return r.json(); }).then(function (books) {
    var homeBooks = document.getElementById("home-books");
    if (!homeBooks) return;
    var live = books.filter(function (b) { return b.listOnSite !== false; });
    var featured = live.filter(function (b) { return b.slug === "great-app-bad-business"; })[0];
    var others = live.filter(function (b) { return b.slug !== "great-app-bad-business"; }).slice(0, 2);
    function mini(b) {
      var src = b.coverThumb || b.cover;
      var cover = src ? '<img class="cover" src="' + site.abs(src) + '" alt="' + b.title + ' cover">' : "";
      var more = b.detailPage
        ? site.abs(b.detailPage)
        : (b.amazonUrl ? site.withCampaign(b.amazonUrl, "home-books") : site.abs("books.html"));
      var track = b.detailPage ? "book_detail_click" : "amazon_book_click";
      return '<a class="book-card" data-track="' + track + '" href="' + more + '" style="text-decoration:none;color:inherit">' +
        cover + "<h3>" + b.title + "</h3><p class=\"muted\">" + (b.subtitle || "") + "</p></a>";
    }
    var html = "";
    if (featured) {
      var buy = featured.amazonUrl ? site.withCampaign(featured.amazonUrl, "home-books") : "";
      html += '<article class="book-feature panel-card" style="grid-column:1/-1">' +
        (featured.cover ? '<img src="' + site.abs(featured.cover) + '" alt="Great App. Bad Business. title treatment">' : "") +
        "<div><p class=\"kicker\">Newest</p><h3>" + featured.title + "</h3>" +
        "<p class=\"muted\">" + featured.subtitle + "</p>" +
        "<p class=\"muted\">" + featured.description + "</p>" +
        '<div class="btn-row">' +
          '<a class="btn secondary" data-track="book_detail_click" href="' + site.abs(featured.detailPage) + '">View Book</a>' +
          (buy ? '<a class="btn amazon" data-track="amazon_book_click" href="' + buy + '" target="_blank" rel="noopener">Buy on Amazon</a>' : "") +
        "</div></div></article>";
    }
    html += others.map(mini).join("");
    homeBooks.innerHTML = html;
  }).catch(function () { /* books are secondary on the homepage */ });

  api.load().then(function (projects) {
    var featured = projects.filter(function (p) { return p.featuredOnHome; })
      .sort(function (a, b) { return (a.homeOrder || 99) - (b.homeOrder || 99); })
      .slice(0, 6);

    grid.innerHTML = featured.map(function (p) {
      var href = api.projectHref(p);
      var caps = (p.caps || []).slice(0, 4).map(function (c) {
        return "<span>" + c + "</span>";
      }).join("");
      var poster = api.assetUrl(p.poster);
      var cta = href
        ? '<a class="btn secondary" data-track="project_demo_click" href="' + href + '" target="_blank" rel="noopener">' +
            (p.codeAccess === "proprietary_saas" ? "View Demo" : "View Project") +
          "</a>"
        : "";
      return (
        '<article class="sys-card">' +
          (poster ? '<img class="thumb" src="' + poster + '" alt="' + p.title + ' screenshot" loading="lazy">' : "") +
          "<h3>" + p.title + "</h3>" +
          '<p class="muted">' + (p.blurb || p.summary) + "</p>" +
          '<div class="cap-list">' + caps + "</div>" +
          cta +
        "</article>"
      );
    }).join("");
  }).catch(function (err) {
    grid.innerHTML = '<p class="muted">Selected systems could not load from the project catalog.</p>';
    console.error(err);
  });
})();
