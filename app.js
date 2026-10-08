// קישור ההזמנה לקבוצת הווצאפ (https://chat.whatsapp.com/...). ריק = הכפתור פותח שיחה עם הרב.
const WHATSAPP_GROUP = "";

// ביט ופייבוקס לא מאפשרים קישור עם מספר ממולא, אז מעתיקים את המספר ופותחים את האפליקציה.
const APPS = {
  bit: {
    name: "ביט",
    android: "com.bnhp.payments.paymentsapp",
    ios: "https://apps.apple.com/il/app/id1182007739",
  },
  paybox: {
    name: "פייבוקס",
    android: "com.payboxapp",
    ios: "https://apps.apple.com/il/app/id895491053",
  },
};

const $ = (id) => document.getElementById(id);
const ua = navigator.userAgent;
const isAndroid = /Android/i.test(ua);
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function appUrl(app) {
  if (isAndroid) {
    const store = encodeURIComponent(`https://play.google.com/store/apps/details?id=${app.android}`);
    return `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${app.android};S.browser_fallback_url=${store};end`;
  }
  if (isIOS) return app.ios;
  return "";
}

function setup() {
  if (/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(WHATSAPP_GROUP)) $("wa-join").href = WHATSAPP_GROUP;

  const toggle = $("donate-toggle");
  const panel = $("donate-panel");
  panel.inert = true;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollToY = (top) => window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  const section = $("donate");

  // When opened: scroll the logo out of view so the donation options sit in the middle of the screen.
  function centerDonations() {
    const rect = section.getBoundingClientRect();
    const spare = Math.max(16, (window.innerHeight - rect.height) / 2);
    const heroBottom = window.scrollY + document.querySelector(".hero").getBoundingClientRect().bottom;
    const target = Math.max(window.scrollY + rect.top - spare, heroBottom);
    const needed = target + window.innerHeight;
    if (document.documentElement.scrollHeight < needed) document.body.style.minHeight = `${needed}px`;
    scrollToY(target);
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("open", open);
    panel.inert = !open;
    if (open) {
      setTimeout(centerDonations, reduceMotion ? 0 : 340);
    } else {
      scrollToY(0);
      setTimeout(() => { document.body.style.minHeight = ""; }, 400);
    }
  });

  const bankToggle = $("bank-toggle");
  const bankPanel = $("bank-panel");
  bankPanel.inert = true;
  bankToggle.addEventListener("click", () => {
    const open = bankToggle.getAttribute("aria-expanded") !== "true";
    bankToggle.setAttribute("aria-expanded", String(open));
    bankPanel.classList.toggle("open", open);
    bankPanel.inert = !open;
    if (open) {
      setTimeout(() => {
        const overflow = bankPanel.getBoundingClientRect().bottom - (window.innerHeight - 16);
        if (overflow > 0) window.scrollBy({ top: overflow, behavior: reduceMotion ? "auto" : "smooth" });
      }, reduceMotion ? 0 : 340);
    }
  });

  const toast = document.querySelector(".toast");
  let timer;
  const show = (text, ms = 1800) => {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), ms);
  };

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    let copied = true;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
    } catch {
      copied = false;
    }
    const app = APPS[btn.dataset.app];
    if (!app) {
      show(copied ? "הועתק" : btn.dataset.copy);
      return;
    }
    const url = appUrl(app);
    show(copied ? `המספר הועתק, הדביקו ב${app.name}` : `המספר: ${btn.dataset.copy}`, 3500);
    if (url) setTimeout(() => { window.location.href = url; }, 700);
  });
}

setup();
