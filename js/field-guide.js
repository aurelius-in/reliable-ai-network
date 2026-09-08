(function () {
  var toc = document.getElementById("fg-toc");
  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
    var ids = links.map(function (a) { return a.getAttribute("href").slice(1); });
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);

    function current() {
      var y = window.scrollY + 96;
      var found = sections[0];
      sections.forEach(function (s) {
        if (s.offsetTop <= y) found = s;
      });
      links.forEach(function (a) {
        var on = found && a.getAttribute("href") === "#" + found.id;
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
    window.addEventListener("scroll", current, { passive: true });
    current();
  }

  var printBtn = document.getElementById("fg-print");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }

  var KEY = "fg-shipped-to-paid-v1";
  var fields = document.querySelectorAll(".write-in, .fg-table td.blank");
  if (!fields.length) return;

  var saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch (e) {
    saved = {};
  }

  function save() {
    var data = {};
    fields.forEach(function (el, i) {
      data[i] = (el.innerText || "").replace(/\s+$/, "");
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {}
  }

  var saveTimer;
  fields.forEach(function (el, i) {
    el.setAttribute("contenteditable", "true");
    el.setAttribute("role", "textbox");
    el.setAttribute("aria-multiline", "true");
    el.setAttribute("spellcheck", "true");
    if (saved[i]) el.innerText = saved[i];
    el.addEventListener("input", function () {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 250);
    });
  });
})();
