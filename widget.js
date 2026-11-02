/* Embeddable chat widget. Add to any page:
   <script src="https://YOUR-SERVER/widget.js" defer></script>
   Optional: data-api="https://YOUR-SERVER" on the script tag. */
(function () {
  var s = document.currentScript;
  var API = (s && s.dataset.api) || (s ? new URL(s.src).origin : "");
  var BRAND = "#0b5d4b";
  var history = [];

  var css = `
  #iul-fab{position:fixed;right:18px;bottom:18px;width:58px;height:58px;border-radius:50%;border:0;background:${BRAND};color:#fff;cursor:pointer;z-index:99998;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center}
  #iul-box{position:fixed;right:18px;bottom:88px;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 110px);background:#fff;color:#17231f;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.3);z-index:99999;display:none;flex-direction:column;overflow:hidden;font:15px/1.45 system-ui,sans-serif}
  #iul-box.open{display:flex}
  #iul-head{background:${BRAND};color:#fff;padding:12px 14px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
  #iul-head button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
  #iul-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f6f7f4}
  .iul-m{max-width:88%;padding:9px 12px;border-radius:12px;word-wrap:break-word}
  .iul-bot{background:#fff;border:1px solid #dfe4de;align-self:flex-start}
  .iul-me{background:${BRAND};color:#fff;align-self:flex-end}
  .iul-m a{color:inherit;font-weight:600}
  #iul-bar{display:flex;gap:8px;padding:10px;border-top:1px solid #dfe4de;background:#fff}
  #iul-in{flex:1;min-width:0;font:inherit;padding:9px 12px;border:1px solid #cfd6cf;border-radius:20px;outline:none}
  #iul-send{width:42px;height:42px;flex:none;border-radius:50%;border:0;background:${BRAND};color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
  @media(max-width:520px){#iul-box{right:0;bottom:0;width:100vw;max-width:100vw;height:100%;max-height:100%;border-radius:0}}`;
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var send = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 21.5 23 12 2.5 2.5 2.5 10l14 2-14 2z"/></svg>';
  var chat = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 1-2z"/></svg>';

  var fab = document.createElement("button");
  fab.id = "iul-fab"; fab.setAttribute("aria-label", "Chat"); fab.innerHTML = chat;
  var box = document.createElement("div");
  box.id = "iul-box";
  box.innerHTML = '<div id="iul-head"><span>Integral University, Lucknow</span><button aria-label="Close">&times;</button></div>' +
    '<div id="iul-log"></div><div id="iul-bar"><input id="iul-in" placeholder="Apna sawaal likhiye..." autocomplete="off">' +
    '<button id="iul-send" aria-label="Send">' + send + "</button></div>";
  document.body.appendChild(fab);
  document.body.appendChild(box);

  var log = box.querySelector("#iul-log"), input = box.querySelector("#iul-in");

  function fmt(t) {
    t = t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    t = t.replace(/^[-*] /gm, "• ");
    t = t.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
    t = t.replace(/\b(93351 ?77775)\b/g, '<a href="tel:+919335177775">$1</a>');
    return t.replace(/\n/g, "<br>");
  }
  function add(cls, text, raw) {
    var d = document.createElement("div");
    d.className = "iul-m " + cls;
    d.innerHTML = raw ? text : fmt(text);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function typeOut(el, text) {
    return new Promise(function (done) {
      var parts = text.split(/(\s+)/), i = 0, shown = "";
      var words = parts.length / 2;
      var delay = Math.max(15, Math.min(45, 4000 / words));
      (function step() {
        if (i >= parts.length) return done();
        shown += parts[i++];
        if (i < parts.length) shown += parts[i++];
        var partial = shown;
        if ((partial.match(/\*\*/g) || []).length % 2) partial += "**";
        el.innerHTML = fmt(partial);
        log.scrollTop = log.scrollHeight;
        setTimeout(step, delay);
      })();
    });
  }
  async function ask() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    add("iul-me", text);
    history.push({ role: "user", content: text });
    var wait = add("iul-bot", "...");
    try {
      var r;
      for (var i = 0; i < 3; i++) {
        try {
          r = await fetch(API + "/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history.slice(-10) }),
          });
          if (r.status < 502) break;
        } catch (err) {
          if (i === 2) throw err;
        }
        wait.textContent = "Server shuru ho raha hai, kripya intezaar karein...";
        await new Promise(function (ok) { setTimeout(ok, 6000); });
      }
      var j = await r.json();
      var reply = r.ok ? j.reply : (j.detail || "Kuch galat ho gaya. Call karein: 93351 77775");
      if (r.ok) { await typeOut(wait, reply); } else { wait.innerHTML = fmt(reply); }
      if (r.ok) history.push({ role: "assistant", content: reply });
      else history.pop();
    } catch (e) {
      wait.innerHTML = fmt("Internet ya server ki dikkat hai. Call karein: 93351 77775");
      history.pop();
    }
    log.scrollTop = log.scrollHeight;
  }
  function toggle() {
    box.classList.toggle("open");
    if (box.classList.contains("open")) {
      if (!log.children.length) add("iul-bot", "Namaste! Main Integral University ke courses, fees, hostel, scholarship aur admission ke baare mein bata sakta hoon. Aap kya jaanna chahte hain?");
      input.focus();
    }
  }
  fab.onclick = toggle;
  box.querySelector("#iul-head button").onclick = toggle;
  box.querySelector("#iul-send").onclick = ask;
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
})();
