(function () {
  var site = window.RAIN_SITE;
  if (!site) return;

  function assetUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return site.abs(path);
  }

  function projectHref(p) {
    if (p.codeAccess === "proprietary_saas" && p.page) {
      if (/^https?:\/\//i.test(p.page)) {
        if (/makeitrainapp\.com/i.test(p.page)) {
          return site.withCampaign(p.page, "portfolio");
        }
        return p.page;
      }
      return site.abs(p.page);
    }
    if (p.repo) return p.repo;
    if (p.page) return /^https?:\/\//i.test(p.page) ? p.page : site.abs(p.page);
    return "";
  }

  function linkLabel(p) {
    if (p.codeAccess === "proprietary_saas" && p.page) return "View Product";
    if (p.repo) return "View Repository";
    return "View Project";
  }

  window.RAIN_PROJECTS_API = {
    assetUrl: assetUrl,
    projectHref: projectHref,
    linkLabel: linkLabel,
    load: function () {
      return fetch(site.abs("data/projects.json")).then(function (r) {
        if (!r.ok) throw new Error("projects.json " + r.status);
        return r.json();
      });
    }
  };
})();
