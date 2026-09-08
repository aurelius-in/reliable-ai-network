(function () {
  var site = window.RAIN_SITE;
  if (!site) return;

  function bookUrl(path) {
    return site.abs(path);
  }

  function amazonLink(book, campaign) {
    var url = book.amazonUrl || book.kindleUrl || book.paperbackUrl;
    if (!url) return "";
    return site.withCampaign(url, campaign || "books");
  }

  function cardHtml(book, opts) {
    opts = opts || {};
    var coverSrc = book.coverThumb || book.cover;
    var cover = coverSrc ? '<img class="cover" src="' + bookUrl(coverSrc) + '" alt="' + book.title + (book.coverKind === "title-card" ? " title treatment" : " cover") + '">' : "";
    var read = book.readUrl
      ? '<a class="btn gabb" data-track="read_book_click" href="' + bookUrl(book.readUrl) + '">Read online</a>'
      : "";
    var detail = book.detailPage
      ? '<a class="btn secondary" data-track="book_detail_click" href="' + bookUrl(book.detailPage) + '">Learn More</a>'
      : "";
    var buy = amazonLink(book)
      ? '<a class="btn amazon" data-track="amazon_book_click" href="' + amazonLink(book) + '" target="_blank" rel="noopener">Amazon</a>'
      : "";
    var status = (book.status || "published") + (book.year ? " · " + book.year : "");
    return (
      '<article class="book-card">' +
        cover +
        "<h3>" + book.title + "</h3>" +
        (book.subtitle ? '<p class="muted">' + book.subtitle + "</p>" : "") +
        '<p class="muted">' + (book.description || "") + "</p>" +
        '<p class="muted" style="font-size:13px">' + status + "</p>" +
        '<div class="btn-row">' + read + detail + buy + "</div>" +
      "</article>"
    );
  }

  window.RAIN_BOOKS_API = {
    load: function () {
      return fetch(site.abs("data/books.json")).then(function (r) {
        if (!r.ok) throw new Error("books.json " + r.status);
        return r.json();
      }).then(function (books) {
        return books.filter(function (b) { return b.listOnSite !== false; });
      });
    },
    cardHtml: cardHtml,
    amazonLink: amazonLink
  };

  var grid = document.getElementById("books-grid");
  if (!grid) return;
  window.RAIN_BOOKS_API.load().then(function (books) {
    grid.innerHTML = books.map(function (b) { return cardHtml(b); }).join("");
  }).catch(function (err) {
    grid.innerHTML = '<p class="muted">Books data could not load.</p>';
    console.error(err);
  });
})();
