const header = document.querySelector("#site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const calendarPanel = document.querySelector("#availability");
const calendarToggles = document.querySelectorAll("[data-calendar-toggle]");
const lightbox = document.querySelector(".lightbox");

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

calendarToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const opening = calendarPanel.hasAttribute("hidden");
    calendarPanel.toggleAttribute("hidden");

    if (opening) {
      requestAnimationFrame(() => {
        calendarPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      document.querySelector("#stay").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const image = lightbox.querySelector("img");
    image.src = item.dataset.image;
    image.alt = item.querySelector("img").alt;
    lightbox.querySelector("p").textContent = item.dataset.caption;
    lightbox.showModal();
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.querySelector("#year").textContent = new Date().getFullYear();
