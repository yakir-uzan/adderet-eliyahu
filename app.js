// הפרטים שמשתנים. ערך ריק = מוצג "יעודכן בקרוב" (או, בקבוצה, נשאר קישור לרב).
const LINKS = {
  bitPhone: "",       // לדוגמה "050-000-0000"
  payboxUrl: "",      // קישור לקבוצת הפייבוקס (https://links.payboxapp.com/...)
  whatsappGroup: "",  // קישור הזמנה לקבוצה (https://chat.whatsapp.com/...)
};

const isHttps = (u) => /^https:\/\/[^\s"'<>]+$/.test(u);
const $ = (id) => document.getElementById(id);

function setup() {
  if (LINKS.bitPhone) {
    const detail = $("bit-detail");
    detail.textContent = LINKS.bitPhone;
    detail.classList.add("num", "is-set");
    const copy = $("bit-copy");
    copy.dataset.copy = LINKS.bitPhone.replace(/\D/g, "");
    copy.disabled = false;
  }
  if (isHttps(LINKS.payboxUrl)) {
    const link = $("paybox-link");
    link.href = LINKS.payboxUrl;
    link.removeAttribute("aria-disabled");
    const detail = $("paybox-detail");
    detail.textContent = "תרומה בלחיצה";
    detail.classList.add("is-set");
  }
  if (isHttps(LINKS.whatsappGroup)) $("wa-join").href = LINKS.whatsappGroup;

  const toast = document.querySelector(".toast");
  let timer;
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn || !btn.dataset.copy) return;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast.textContent = "הועתק";
    } catch {
      toast.textContent = btn.dataset.copy;
    }
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 1800);
  });
}

setup();
