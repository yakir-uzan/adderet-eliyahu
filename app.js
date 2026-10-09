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
  const bankToggle = $("bank-toggle");
  const bankPanel = $("bank-panel");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollToY = (top) => window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  const section = $("donate");

  const root = document.documentElement;
  const actions = document.querySelector(".actions");

  // While the donations are open, pin the tiles where they are so the panel only grows downward;
  // released after it folds back, when the centered position is the same again (no jump).
  const freeze = () => {
    actions.style.setProperty("--tiles-top", `${parseFloat(getComputedStyle(section).marginBlockStart)}px`);
    actions.classList.add("pinned");
  };
  const unfreeze = () => actions.classList.remove("pinned");
  // Visible height above the fixed footer.
  const viewHeight = () => window.innerHeight - document.querySelector(".footer").offsetHeight;

  const setOpen = (button, region, open) => {
    button.setAttribute("aria-expanded", String(open));
    region.classList.toggle("open", open);
    region.inert = !open;
  };
  const isOpen = (button) => button.getAttribute("aria-expanded") === "true";

  // Every fresh view of the page starts folded at the top, also when the browser restores it
  // from its back/forward cache (e.g. coming back from Bit or PayBox).
  function collapseAll() {
    setOpen(toggle, panel, false);
    setOpen(bankToggle, bankPanel, false);
    unfreeze();
    root.style.paddingBottom = "";
    window.scrollTo(0, 0);
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  collapseAll();
  window.addEventListener("pageshow", (e) => { if (e.persisted) collapseAll(); });

  // When opened: scroll the logo out of view so the donation options sit in the middle of the screen.
  function centerDonations() {
    const rect = section.getBoundingClientRect();
    const spare = Math.max(16, (viewHeight() - rect.height) / 2);
    const heroBottom = window.scrollY + document.querySelector(".hero").getBoundingClientRect().bottom;
    const target = Math.max(window.scrollY + rect.top - spare, heroBottom);
    // Extra room at the bottom so the page can scroll that far; on <html>, outside the centered area.
    const missing = target + window.innerHeight - root.scrollHeight;
    if (missing > 0) root.style.paddingBottom = `${missing}px`;
    scrollToY(target);
  }

  // Closing mirrors opening in reverse: opening grows the panel and then scrolls down,
  // closing scrolls back up first and then folds the panel, so nothing jumps.
  const afterScrollToTop = (done) => {
    if (reduceMotion || window.scrollY < 2) return done();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("scrollend", finish);
      clearInterval(poll);
      done();
    };
    window.addEventListener("scrollend", finish);
    const poll = setInterval(() => { if (window.scrollY < 2) finish(); }, 50);
    setTimeout(finish, 900); // never wait longer than this
    scrollToY(0);
  };

  let foldTimer;
  let step = 0; // a newer click cancels a fold that is still waiting for the scroll
  toggle.addEventListener("click", () => {
    const open = !isOpen(toggle);
    const mine = ++step;
    clearTimeout(foldTimer);
    if (open) {
      freeze();
      setOpen(toggle, panel, true);
      setTimeout(centerDonations, reduceMotion ? 0 : 340);
    } else {
      toggle.setAttribute("aria-expanded", "false"); // the arrow turns right away
      afterScrollToTop(() => {
        if (mine !== step) return;
        setOpen(toggle, panel, false);
        foldTimer = setTimeout(() => {
          setOpen(bankToggle, bankPanel, false);
          unfreeze();
          root.style.paddingBottom = "";
        }, reduceMotion ? 0 : 420);
      });
    }
  });

  bankToggle.addEventListener("click", () => {
    const open = !isOpen(bankToggle);
    setOpen(bankToggle, bankPanel, open);
    if (open) {
      setTimeout(() => {
        const overflow = bankPanel.getBoundingClientRect().bottom - (viewHeight() - 12);
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
      show(copied ? `${btn.dataset.label || "המספר"} הועתק` : btn.dataset.copy);
      return;
    }
    const url = appUrl(app);
    show(copied ? `המספר הועתק, הדביקו ב${app.name}` : `המספר: ${btn.dataset.copy}`, 3500);
    if (url) setTimeout(() => { window.location.href = url; }, 700);
  });
}

setup();
