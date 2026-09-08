(function () {
  var body = document.body;
  if (!body || !body.classList.contains("gabb-reader")) return;

  var drawer = document.getElementById("toc-drawer");
  var toggle = document.querySelector(".toc-toggle");
  var backdrop = document.querySelector(".toc-backdrop");
  var bar = document.querySelector(".read-progress span");
  var sizes = ["size-s", "size-m", "size-l", "size-xl"];
  var sizeIdx = 1;
  var stored = window.localStorage.getItem("gabb-font");
  if (stored && sizes.indexOf(stored) !== -1) {
    sizeIdx = sizes.indexOf(stored);
  }
  applySize();

  function applySize() {
    sizes.forEach(function (c) { body.classList.remove(c); });
    body.classList.add(sizes[sizeIdx]);
    try { window.localStorage.setItem("gabb-font", sizes[sizeIdx]); } catch (e) {}
  }

  function setToc(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    if (backdrop) backdrop.hidden = !open;
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setToc(drawer && drawer.hidden);
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", function () { setToc(false); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setToc(false);
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === "ArrowLeft") {
      var prev = document.querySelector('a[rel="prev"]');
      if (prev) window.location.href = prev.getAttribute("href");
    }
    if (e.key === "ArrowRight") {
      var next = document.querySelector('a[rel="next"]');
      if (next) window.location.href = next.getAttribute("href");
    }
  });

  var dec = document.querySelector(".font-dec");
  var inc = document.querySelector(".font-inc");
  if (dec) {
    dec.addEventListener("click", function () {
      sizeIdx = Math.max(0, sizeIdx - 1);
      applySize();
    });
  }
  if (inc) {
    inc.addEventListener("click", function () {
      sizeIdx = Math.min(sizes.length - 1, sizeIdx + 1);
      applySize();
    });
  }

  function updateProgress() {
    if (!bar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
})();
