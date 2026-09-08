/* Commercial Frontier Report. Client-side diagnosis from Great App. Bad Business.
   FormSubmit first-use: the inbox owner must confirm info@reliableainetwork.com once. */
(function (root) {
  var DRAFT_KEY = "cfr-draft-v1";
  var STEPS = [
    { key: "buyers", state: "cannot find buyer", label: "1. Plausible buyers" },
    { key: "replies", state: "no reply", label: "2. Buyers reply" },
    { key: "evaluate", state: "will not try", label: "3. Real evaluation" },
    { key: "value", state: "tries but does not value", label: "4. Meaningful value" },
    { key: "pay", state: "values but will not pay", label: "5. Pays under real terms" },
    { key: "stay", state: "pays but does not stay", label: "6. Stays after paying" }
  ];
  var PATH = STEPS.map(function (s) { return s.state; });
  var LADDER = [
    "expressed pain",
    "agrees to evaluate",
    "accepts a price",
    "dated or conditional commitment",
    "pays",
    "renews"
  ];

  function trim(v) {
    return String(v == null ? "" : v).replace(/^\s+|\s+$/g, "");
  }
  function num(v) {
    var n = parseInt(String(v || "").replace(/[^\d-]/g, ""), 10);
    return isFinite(n) ? n : 0;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function slug(s) {
    var out = trim(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return out.slice(0, 40) || "report";
  }
  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function validEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim(s));
  }

  function readForm(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "radio") {
        if (el.checked) data[el.name] = el.value;
        return;
      }
      data[el.name] = el.value;
    });
    return data;
  }

  function evidenceOf(data, key) {
    return trim(data["d_" + key + "_ev"]);
  }
  function statusOf(data, key) {
    return trim(data["d_" + key]) || "unknown";
  }

  function paidUnderRealTerms(data) {
    return data.paidReal === "yes" || num(data.payments30) > 0;
  }
  function askedToPay(data) {
    return data.askedToPay === "yes" || paidUnderRealTerms(data);
  }

  function stepSupported(data, key) {
    var status = statusOf(data, key);
    var ev = evidenceOf(data, key);
    if (status === "observed" && ev) return true;
    if (key === "replies" && num(data.replies30) > 0) return true;
    if (key === "evaluate" && num(data.evals30) > 0) return true;
    if (key === "pay" && paidUnderRealTerms(data)) return true;
    return false;
  }

  function diagnose(data) {
    var supported = [];
    var frontier = STEPS[0];
    var held = false;
    var i;
    var canPassPay = askedToPay(data) && paidUnderRealTerms(data);

    for (i = 0; i < STEPS.length; i++) {
      var step = STEPS[i];
      var ok = stepSupported(data, step.key);
      if (step.key === "pay" || step.key === "stay") {
        if (!askedToPay(data)) ok = false;
        if (step.key === "pay" && !paidUnderRealTerms(data)) ok = false;
        if (step.key === "stay" && !canPassPay) ok = false;
      }
      if (!ok) {
        frontier = step;
        break;
      }
      supported.push(step);
      if (i === STEPS.length - 1) {
        frontier = step;
        held = true;
      }
    }

    return {
      frontier: frontier.state,
      frontierKey: frontier.key,
      supported: supported.map(function (s) { return s.state; }),
      neverAsked: !askedToPay(data),
      paid: paidUnderRealTerms(data),
      held: held
    };
  }

  function ladderRung(data, dx) {
    if (dx.paid && statusOf(data, "stay") === "observed" && evidenceOf(data, "stay")) return "renews";
    if (dx.paid) return "pays";
    if (data.heardPrice === "yes" && trim(data.price)) return "accepts a price";
    if (stepSupported(data, "evaluate") || num(data.evals30) > 0) return "agrees to evaluate";
    if (trim(data.workaround) || trim(data.buyer) || statusOf(data, "buyers") !== "unknown") {
      return "expressed pain";
    }
    return "below expressed pain";
  }

  function constraintSentence(data, dx) {
    var product = trim(data.productName) || "this product";
    var buyer = trim(data.buyer);
    if (dx.frontier === "cannot find buyer") {
      return product + " does not yet have a buyer you can name by observable conditions, who owns the consequence of the problem. " +
        (buyer ? "“" + buyer + "” is still a description, not observed reach plus ownership." : "A persona is not a buyer.");
    }
    if (dx.frontier === "no reply") {
      return "You can point at a buyer" + (buyer ? " (" + buyer + ")" : "") +
        ", and they are not responding when you reach them. Replies, not opens, are the evidence.";
    }
    if (dx.frontier === "will not try") {
      return "Buyers will talk, and they will not run a real evaluation against their own data or workflow.";
    }
    if (dx.frontier === "tries but does not value") {
      return "Someone tried " + product + ", and you do not have observed evidence that the promised outcome occurred in their terms.";
    }
    if (dx.frontier === "values but will not pay") {
      if (dx.neverAsked) {
        return "You have not asked anyone to pay under real terms. Usage and compliments cannot move you past this line.";
      }
      return "Someone saw value in " + product + " and has not paid the standard offer at the standard price.";
    }
    if (dx.held) {
      return "Observed evidence currently supports the path through payment and continued use for " + product +
        ". The job is to keep that evidence honest, not to invent an earlier break.";
    }
    return "Someone paid for " + product + ", and you do not have observed evidence they continue to judge the exchange worthwhile.";
  }

  function wrongMove(data, dx) {
    var planned = trim(data.plannedNext);
    var map = {
      "cannot find buyer": "more traffic, more posting, or another feature before you can name a buyer who owns the consequence",
      "no reply": "more volume on the same message, or building while the path and the trust are untested",
      "will not try": "more acquisition, or more product, before a buyer will evaluate a bounded offer",
      "tries but does not value": "more acquisition. Scaling a use case that did not produce the outcome makes the hole more expensive",
      "values but will not pay": "another feature, a longer free runway, or more users before a real price and a clear ask",
      "pays but does not stay": "more acquisition before you know why the people who paid did not stay"
    };
    var tempting = map[dx.frontier];
    var line = "The tempting remedy at this frontier is " + tempting + ".";
    if (planned) {
      line = "You were about to: " + planned + ". That is the tempting move, and it is the fix for a different break. " + line;
    }
    return line;
  }

  function nextTest(data, dx) {
    var buyer = trim(data.buyer) || "people who own the consequence of the problem";
    var tests = {
      "cannot find buyer": {
        tool: "Appendix B and Days 4 to 8",
        who: "Ten to fifteen reachable people who plausibly own the cost, named by observable conditions, not a persona.",
        ask: "What they already do because the problem exists, what that consumes, and who absorbs it.",
        window: "Next 7 days",
        yes: "At least three named people with a costly workaround and a consequence owner.",
        no: "You still have a category label and no one you can reach.",
        unknown: "Conversations happened and cost or ownership stayed vague."
      },
      "no reply": {
        tool: "Appendix H",
        who: "The highest-scoring reachable people from " + buyer + ".",
        ask: "A reply to a specific problem-cost question. Not a pitch, not a waitlist.",
        window: "Next 7 days",
        yes: "Replies from people who own the consequence.",
        no: "Silence, or “interesting” with no substance.",
        unknown: "Opens, likes, or forwards without a reply."
      },
      "will not try": {
        tool: "Appendix F (smallest offer) and Appendix E",
        who: "People who already replied.",
        ask: "Evaluate one bounded outcome against their own case by an agreed date.",
        window: "7 to 10 days",
        yes: "They schedule time or supply a real case.",
        no: "They will talk and will not evaluate.",
        unknown: "They deferred without a date."
      },
      "tries but does not value": {
        tool: "Appendix A (value) and Appendix F",
        who: "People who already tried the product.",
        ask: "Whether the promised outcome occurred in their terms, and what they did instead.",
        window: "One evaluation cycle",
        yes: "They can name the outcome that happened in their work.",
        no: "They completed a tour and nothing changed.",
        unknown: "They are still in onboarding."
      },
      "values but will not pay": {
        tool: "Appendix F, Days 21 to 27",
        who: "The three to five closest buyers" + (buyer ? " in " + buyer : "") + ".",
        ask: "The standard offer, a real price" + (trim(data.price) ? " (" + trim(data.price) + ")" : "") + ", a start date, and a decision.",
        window: "Next 7 days",
        yes: "They pay, or they make a dated conditional commitment.",
        no: "They refuse the number or the terms.",
        unknown: "They ask for time with no date."
      },
      "pays but does not stay": {
        tool: "Appendix G, retention version",
        who: "Payers compared with people who paid and left.",
        ask: "What produced realized value, and what would have needed to be different.",
        window: "Next 14 days",
        yes: "A retention delta you can test on the next payer.",
        no: "Usage never started, or the outcome never recurred.",
        unknown: "Too early to see renewal."
      }
    };
    return tests[dx.frontier];
  }

  function planSteps(dx) {
    var all = [
      { id: "1-3", title: "Days 1 to 3: Diagnose", body: "Done. This report is the diagnostic. Keep the two lists: evidence the product works, and evidence the business works." },
      { id: "4-8", title: "Days 4 to 8: Buyer and paid problem", body: "Rewrite the buyer as observable buying conditions. Complete the Paid Problem Test for one problem. Name ten to fifteen reachable people who own the consequence. Do not build anything." },
      { id: "9-15", title: "Days 9 to 15: Conversations that can change a belief", body: "Rank the list. Hold six to ten conversations about current behavior and cost, not opinion. Stop and revise the buyer if fewer than three produce an observable paid problem." },
      { id: "16-20", title: "Days 16 to 20: Offer, price, and the skeptical case", body: "Write the smallest bounded outcome a buyer could evaluate and purchase. Attach a price and a commitment ask. Argue the no. Build only what has Build Permission." },
      { id: "21-27", title: "Days 21 to 27: Create the purchase moment", body: "Return to the three to five highest-scoring buyers with the offer, the price, a start date, and a clear ask. Record every yes, no, and deferral." },
      { id: "28-30", title: "Days 28 to 30: Compare and decide", body: "If anyone paid, compare the payer with near-misses and write the delta as a hypothesis. If nobody paid, change one variable. Do not automate anything yet." }
    ];
    var start = {
      "cannot find buyer": "4-8",
      "no reply": "9-15",
      "will not try": "16-20",
      "tries but does not value": "16-20",
      "values but will not pay": "21-27",
      "pays but does not stay": "28-30"
    }[dx.frontier];
    var out = [all[0]];
    var i;
    var started = false;
    for (i = 1; i < all.length; i++) {
      if (all[i].id === start) started = true;
      if (started) out.push(all[i]);
    }
    return out;
  }

  function observedItems(data, dx) {
    var items = [];
    function add(s) { if (trim(s)) items.push(trim(s)); }
    STEPS.forEach(function (step) {
      if (dx.supported.indexOf(step.state) !== -1) {
        var ev = evidenceOf(data, step.key);
        add(ev || (step.label + " has supporting behavior."));
      }
    });
    if (num(data.outreach30) || num(data.replies30) || num(data.evals30) || num(data.nos30) || num(data.payments30)) {
      add(
        "Last 30 days: " +
        num(data.outreach30) + " outreach, " +
        num(data.replies30) + " replies, " +
        num(data.evals30) + " evaluations, " +
        num(data.nos30) + " explicit nos, " +
        num(data.payments30) + " payments."
      );
    }
    if (paidUnderRealTerms(data)) add("Someone paid under real terms.");
    if (trim(data.workaround)) add("Current workaround: " + trim(data.workaround));
    if (trim(data.owner)) add("Consequence owner: " + trim(data.owner));
    if (data.heardPrice === "yes" && trim(data.price)) add("A buyer has heard the number: " + trim(data.price));
    if (trim(data.payer)) add("Payer: " + trim(data.payer));
    if (!items.length) add("No observed commercial behavior was entered. Unknown is recorded as unknown.");
    return items;
  }

  function storyItems(data, dx) {
    var items = [];
    function add(s) { if (trim(s)) items.push(trim(s)); }
    if (trim(data.buyer)) add("Believed buyer: " + trim(data.buyer));
    if (trim(data.oneLiner)) add("Product story: " + trim(data.oneLiner));
    if (trim(data.whyNow)) add("Why now (stated): " + trim(data.whyNow));
    if (trim(data.strongestNo)) add("Guessed reason they would say no: " + trim(data.strongestNo));
    if (trim(data.plannedNext)) add("Intended next move: " + trim(data.plannedNext));
    if (data.revenue === "none") add("Revenue now: none.");
    if (data.revenue === "some") add("Revenue now: some, not clearly recurring.");
    if (data.revenue === "recurring") add("Revenue now: described as recurring.");
    if (trim(data.usageNote)) add("Usage vs payment: " + trim(data.usageNote));
    STEPS.forEach(function (step) {
      var st = statusOf(data, step.key);
      if (st === "plausible") add("Plausible, not observed: " + step.label);
    });
    if (dx.neverAsked) add("No one has been asked to pay under real terms.");
    if (!items.length) add("No separate story was entered beyond the diagnostic answers.");
    return items;
  }

  function buildModel(data) {
    var dx = diagnose(data);
    var test = nextTest(data, dx);
    var payer = trim(data.payer);
    var miss1 = trim(data.nearMiss1);
    var miss2 = trim(data.nearMiss2);
    var delta = null;
    if (payer && (miss1 || miss2)) {
      delta = { payer: payer, nearMisses: [miss1, miss2].filter(Boolean) };
    }
    return {
      product: trim(data.productName) || "Untitled product",
      oneLiner: trim(data.oneLiner),
      url: trim(data.productUrl),
      name: trim(data.name),
      email: trim(data.email),
      phone: trim(data.phone),
      role: trim(data.role),
      date: today(),
      dx: dx,
      sentence: constraintSentence(data, dx),
      observed: observedItems(data, dx),
      story: storyItems(data, dx),
      rung: ladderRung(data, dx),
      wrong: wrongMove(data, dx),
      test: test,
      plan: planSteps(dx),
      delta: delta
    };
  }

  function pathHtml(frontier) {
    return PATH.map(function (s, i) {
      var cls = s === frontier ? ' class="is-frontier"' : "";
      var arrow = i < PATH.length - 1 ? '<span class="arrow">→</span>' : "";
      return "<span" + cls + ">" + esc(s) + "</span>" + arrow;
    }).join("");
  }

  function listHtml(items) {
    return "<ul>" + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  function reportInner(model) {
    var who = [];
    if (model.name) who.push(model.name);
    if (model.email) who.push(model.email);
    if (model.phone) who.push(model.phone);
    if (model.role) who.push(model.role);
    var url = model.url
      ? ' · <a href="' + esc(model.url) + '">' + esc(model.url) + "</a>"
      : "";
    var delta = "";
    if (model.delta) {
      delta =
        '<section class="cfr-block">' +
          "<h2>Payer Delta snapshot</h2>" +
          "<p>One payer does not prove the thesis. The near-misses are the control group.</p>" +
          "<p><strong>Payer.</strong> " + esc(model.delta.payer) + "</p>" +
          "<p><strong>Near-misses.</strong> " + esc(model.delta.nearMisses.join(" / ")) + "</p>" +
          "<p>Write the rows where the payer differs. Test that hypothesis on the next three matching prospects before changing the pricing page or the roadmap.</p>" +
        "</section>";
    }
    var plan = model.plan.map(function (p) {
      return "<li><strong>" + esc(p.title) + "</strong> " + esc(p.body) + "</li>";
    }).join("");
    var t = model.test;
    return (
      '<header class="cfr-head">' +
        '<p class="cfr-kicker">Commercial Frontier Report</p>' +
        "<h1>" + esc(model.product) + "</h1>" +
        (model.oneLiner ? '<p class="cfr-liner">' + esc(model.oneLiner) + "</p>" : "") +
        '<p class="cfr-byline">' + esc(who.join(" · ")) + " · " + esc(model.date) + url + "</p>" +
      "</header>" +
      '<section class="cfr-block cfr-hero">' +
        "<h2>1. Frontier</h2>" +
        '<div class="fail-path cfr-path">' + pathHtml(model.dx.frontier) + "</div>" +
        '<p class="cfr-state">' + esc(model.dx.frontier) + "</p>" +
        "<p>" + esc(model.sentence) + "</p>" +
      "</section>" +
      '<section class="cfr-block">' +
        "<h2>2. Evidence vs story</h2>" +
        '<p class="cfr-rung">Highest Commitment Evidence Ladder rung supported: <strong>' + esc(model.rung) + "</strong>. Weak evidence was not promoted.</p>" +
        '<div class="cfr-split">' +
          "<div><h3>Observed behavior</h3>" + listHtml(model.observed) + "</div>" +
          "<div><h3>Assumptions</h3>" + listHtml(model.story) + "</div>" +
        "</div>" +
      "</section>" +
      '<section class="cfr-block">' +
        "<h2>3. Wrong next move</h2>" +
        "<p>" + esc(model.wrong) + "</p>" +
      "</section>" +
      '<section class="cfr-block">' +
        "<h2>4. The next test</h2>" +
        '<p class="cfr-tool">' + esc(t.tool) + "</p>" +
        "<dl class=" + '"cfr-dl">' +
          "<div><dt>Who</dt><dd>" + esc(t.who) + "</dd></div>" +
          "<div><dt>The ask</dt><dd>" + esc(t.ask) + "</dd></div>" +
          "<div><dt>Date window</dt><dd>" + esc(t.window) + "</dd></div>" +
          "<div><dt>Yes</dt><dd>" + esc(t.yes) + "</dd></div>" +
          "<div><dt>No</dt><dd>" + esc(t.no) + "</dd></div>" +
          "<div><dt>Unknown</dt><dd>" + esc(t.unknown) + "</dd></div>" +
        "</dl>" +
      "</section>" +
      '<section class="cfr-block">' +
        "<h2>5. Entered 30-day plan</h2>" +
        "<p>Appendix I, starting at the first step you do not already have evidence for.</p>" +
        "<ol class=\"cfr-plan\">" + plan + "</ol>" +
      "</section>" +
      delta +
      '<footer class="cfr-foot">' +
        "<p>Companion to Great App. Bad Business. by Oliver A. Ellison. Tools © 2026 Oliver A. Ellison. Presented by Reliable AI Network, Inc.</p>" +
        '<p>Optional guided software: <a href="https://MakeItRainApp.com/?utm_source=reliableainetwork&amp;utm_medium=referral&amp;utm_campaign=frontier-report">MakeItRainApp.com</a>. No software can manufacture demand.</p>' +
      "</footer>"
    );
  }

  var REPORT_CSS = [
    "body{margin:0;background:#070b14;color:#e8eef7;font:16px/1.55 Georgia,Times New Roman,serif}",
    ".cfr{max-width:40rem;margin:0 auto;padding:36px 20px 64px}",
    ".cfr-kicker{margin:0 0 8px;letter-spacing:.14em;text-transform:uppercase;font:700 11px/1.2 system-ui,sans-serif;color:#c41e3a}",
    ".cfr h1{margin:0 0 8px;font:700 2rem/1.15 system-ui,sans-serif}",
    ".cfr-liner,.cfr-byline{color:#9fb3ca;margin:0 0 8px}",
    ".cfr-byline{font:14px/1.4 system-ui,sans-serif}",
    ".cfr-block{border-top:1px solid rgba(148,163,184,.18);padding:22px 0;margin:0}",
    ".cfr h2{margin:0 0 10px;font:700 1.05rem/1.3 system-ui,sans-serif}",
    ".cfr h3{margin:0 0 8px;font:650 0.95rem/1.3 system-ui,sans-serif}",
    ".cfr p,.cfr li,.cfr dd{color:#c5d0de}",
    ".cfr-state{font:700 1.35rem/1.25 system-ui,sans-serif;color:#fff;margin:12px 0}",
    ".fail-path{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}",
    ".fail-path span{border:1px solid #3f3f46;border-radius:999px;padding:6px 10px;font:13px/1.2 system-ui,sans-serif;color:#d4d4d4}",
    ".fail-path .arrow{border:0;color:#c41e3a}",
    ".fail-path .is-frontier{border-color:#c41e3a;color:#fff;background:rgba(196,30,58,.18)}",
    ".cfr-split{display:grid;grid-template-columns:1fr 1fr;gap:18px}",
    "@media(max-width:720px){.cfr-split{grid-template-columns:1fr}}",
    ".cfr-split ul{margin:0;padding-left:1.1em}",
    ".cfr-rung,.cfr-tool{font:14px/1.4 system-ui,sans-serif;color:#9fb3ca}",
    ".cfr-dl{margin:0}",
    ".cfr-dl div{margin:0 0 10px}",
    ".cfr-dl dt{font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#22d3ee}",
    ".cfr-dl dd{margin:4px 0 0}",
    ".cfr-plan{margin:0;padding-left:1.2em}",
    ".cfr-plan li{margin:0 0 10px}",
    ".cfr-foot{border-top:1px solid rgba(148,163,184,.18);padding-top:18px;font:13px/1.45 system-ui,sans-serif;color:#9fb3ca}",
    ".cfr a{color:#93c5fd}",
    "@media print{body{background:#fff;color:#111}.cfr p,.cfr li,.cfr dd,.cfr-liner,.cfr-byline,.cfr-foot{color:#222}}"
  ].join("");

  function standaloneHtml(model) {
    return (
      "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
      "<title>Commercial Frontier Report · " + esc(model.product) + "</title>" +
      "<style>" + REPORT_CSS + "</style></head><body>" +
      '<article class="cfr">' + reportInner(model) + "</article>" +
      "</body></html>"
    );
  }

  function downloadHtml(filename, html) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function notifyOliver(model) {
    var payload = {
      _subject: "Commercial Frontier Report: " + model.product,
      _captcha: "false",
      name: model.name || "(not given)",
      email: model.email,
      phone: model.phone || "(not given)",
      product: model.product,
      frontier: model.dx.frontier,
      next_test: model.test.ask
    };
    return fetch("https://formsubmit.co/ajax/info@reliableainetwork.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, json: j }; }); });
  }

  function bindForm() {
    var form = document.getElementById("frontier-form");
    if (!form) return;
    var mount = document.getElementById("cfr-mount");
    var actions = document.getElementById("cfr-actions");
    var note = document.getElementById("cfr-note");
    var err = document.getElementById("cfr-error");
    var lastModel = null;

    function persist() {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(readForm(form))); } catch (e) {}
    }
    try {
      var draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (draft) {
        Object.keys(draft).forEach(function (k) {
          var els = form.elements[k];
          if (!els) return;
          if (els.length && els[0] && els[0].type === "radio") {
            Array.prototype.forEach.call(els, function (r) { r.checked = r.value === draft[k]; });
          } else {
            els.value = draft[k];
          }
        });
      }
    } catch (e) {}

    form.addEventListener("input", function () {
      persist();
      enforceLadder(form);
    });
    form.addEventListener("change", function () {
      persist();
      enforceLadder(form);
    });
    enforceLadder(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) { err.hidden = true; err.textContent = ""; }
      var data = readForm(form);
      if (!validEmail(data.email)) {
        if (err) {
          err.hidden = false;
          err.textContent = "Email is required so the report can be attributed to you.";
        }
        form.elements.email.focus();
        return;
      }
      if (!trim(data.productName)) {
        if (err) {
          err.hidden = false;
          err.textContent = "Add a company or product name. The report is about a specific shipped thing.";
        }
        form.elements.productName.focus();
        return;
      }
      lastModel = buildModel(data);
      mount.innerHTML = reportInner(lastModel);
      mount.hidden = false;
      actions.hidden = false;
      if (note) {
        note.hidden = false;
        note.textContent = "Your report is ready. Save or print it. It lives in this browser until you download it.";
      }
      mount.scrollIntoView({ behavior: "smooth", block: "start" });
      notifyOliver(lastModel).then(function (res) {
        var ok = res && res.ok && res.json && String(res.json.success) === "true";
        if (ok && note) {
          note.textContent = "Your report is ready. A short contact note was sent to Reliable AI Network.";
        }
      }).catch(function () {});
    });

    var saveBtn = document.getElementById("cfr-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!lastModel) return;
        var name = "commercial-frontier-" + slug(lastModel.product) + "-" + lastModel.date + ".html";
        downloadHtml(name, standaloneHtml(lastModel));
      });
    }
    var printBtn = document.getElementById("cfr-print");
    if (printBtn) {
      printBtn.addEventListener("click", function () { window.print(); });
    }
  }

  function enforceLadder(form) {
    var data = readForm(form);
    var blocked = false;
    var demoted = false;
    var canPay = askedToPay(data) && paidUnderRealTerms(data);
    STEPS.forEach(function (step) {
      var radios = form.elements["d_" + step.key];
      if (!radios) return;
      var observed = form.querySelector('input[name="d_' + step.key + '"][value="observed"]');
      var lockPay = (step.key === "pay" || step.key === "stay") && !canPay;
      if (step.key === "stay" && !stepSupported(data, "pay") && !canPay) lockPay = true;
      if (blocked || lockPay) {
        if (observed) observed.disabled = true;
        if (statusOf(data, step.key) === "observed") {
          var unk = form.querySelector('input[name="d_' + step.key + '"][value="unknown"]');
          if (unk) unk.checked = true;
          demoted = true;
        }
      } else if (observed) {
        observed.disabled = false;
      }
      if (!stepSupported(readForm(form), step.key)) blocked = true;
    });
    var hint = document.getElementById("cfr-guard");
    if (hint) hint.hidden = !demoted;
  }

  var api = {
    diagnose: diagnose,
    buildModel: buildModel,
    reportInner: reportInner,
    standaloneHtml: standaloneHtml,
    validEmail: validEmail,
    STEPS: STEPS
  };
  root.FRONTIER_REPORT = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindForm);
    } else {
      bindForm();
    }
  }

  if (typeof document === "undefined" && typeof console !== "undefined") {
    var sample = {
      email: "a@b.co",
      productName: "LedgerLite",
      buyer: "agency ops leads",
      paidReal: "no",
      askedToPay: "no",
      d_buyers: "unknown",
      d_replies: "observed",
      d_replies_ev: "should not count"
    };
    var d = diagnose(sample);
    if (d.frontier !== "cannot find buyer") {
      throw new Error("expected stop at cannot find buyer, got " + d.frontier);
    }
    sample.d_buyers = "observed";
    sample.d_buyers_ev = "Named three agency ops leads at firms that bill retainers.";
    sample.d_replies = "unknown";
    sample.d_replies_ev = "";
    d = diagnose(sample);
    if (d.frontier !== "no reply") {
      throw new Error("expected no reply, got " + d.frontier);
    }
    sample.askedToPay = "no";
    sample.d_replies = "observed";
    sample.d_replies_ev = "Four replies last month.";
    sample.d_evaluate = "observed";
    sample.d_evaluate_ev = "Two ran a real client report.";
    sample.d_value = "observed";
    sample.d_value_ev = "They said the report took an hour instead of a day.";
    sample.d_pay = "observed";
    sample.d_pay_ev = "wishful";
    d = diagnose(sample);
    if (d.frontier !== "values but will not pay") {
      throw new Error("never asked cannot pass pay, got " + d.frontier);
    }
    console.log("frontier-report self-check ok");
  }
})(typeof window !== "undefined" ? window : globalThis);
