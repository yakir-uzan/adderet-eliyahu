// הפרטים שמשתנים. ערך ריק = הכרטיס לא מוצג (או, בקבוצה, נשאר קישור לרב).
const LINKS = {
  bitPhone: "",       // לדוגמה "050-000-0000"
  payboxUrl: "",      // קישור לקבוצת הפייבוקס (https://links.payboxapp.com/...)
  whatsappGroup: "",  // קישור הזמנה לקבוצה (https://chat.whatsapp.com/...)
};

const isHttps = (u) => /^https:\/\/[^\s"'<>]+$/.test(u);

function setup() {
  if (LINKS.bitPhone) {
    document.getElementById("bit-phone").textContent = LINKS.bitPhone;
    document.getElementById("bit-copy").dataset.copy = LINKS.bitPhone.replace(/\D/g, "");
    document.getElementById("pay-bit").hidden = false;
  }
  if (isHttps(LINKS.payboxUrl)) {
    const a = document.getElementById("pay-paybox");
    a.href = LINKS.payboxUrl;
    a.hidden = false;
  }
  if (isHttps(LINKS.whatsappGroup)) document.getElementById("wa-join").href = LINKS.whatsappGroup;

  const toast = document.querySelector(".toast");
  let timer;
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn || !btn.dataset.copy) return;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast.textContent = "הועתק ✓";
    } catch {
      toast.textContent = btn.dataset.copy;
    }
    toast.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove("show"), 1800);
  });
}

setup();
