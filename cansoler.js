const header = document.querySelector("#site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const lightbox = document.querySelector(".lightbox");
const calendar = document.querySelector("[data-calendar]");
const calendarLoading = document.querySelector("[data-calendar-loading]");
const calendarError = document.querySelector("[data-calendar-error]");
const calendarWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let unavailableDates = new Set();

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

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (first, second) => dateKey(first) === dateKey(second);

const renderMonth = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -mondayOffset);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthElement = document.createElement("section");
  monthElement.className = "calendar-month";

  const heading = document.createElement("h3");
  heading.textContent = monthDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  monthElement.appendChild(heading);

  const weekdays = document.createElement("div");
  weekdays.className = "calendar-weekdays";
  calendarWeekdays.forEach((weekday) => {
    const label = document.createElement("span");
    label.textContent = weekday;
    weekdays.appendChild(label);
  });
  monthElement.appendChild(weekdays);

  const days = document.createElement("div");
  days.className = "calendar-days";

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const key = dateKey(date);
    const previousBooked = unavailableDates.has(dateKey(addDays(date, -1)));
    const nextBooked = unavailableDates.has(dateKey(addDays(date, 1)));
    const booked = unavailableDates.has(key);
    const day = document.createElement("div");
    const classes = ["calendar-day"];

    if (date.getMonth() !== month) classes.push("is-outside");
    if (date < today) classes.push("is-past");
    if (isSameDay(date, today)) classes.push("is-today");
    if (booked) classes.push("is-booked");
    if (booked && !previousBooked) classes.push("is-booking-start");
    if (booked && !nextBooked) classes.push("is-booking-end");
    if (index % 7 === 0) classes.push("is-week-start");
    if (index % 7 === 6) classes.push("is-week-end");

    day.className = classes.join(" ");
    day.setAttribute("aria-label", `${date.toLocaleDateString("en-GB")}: ${booked ? "booked" : "available"}`);

    const number = document.createElement("span");
    number.textContent = String(date.getDate());
    day.appendChild(number);
    days.appendChild(day);
  }

  monthElement.appendChild(days);
  return monthElement;
};

const renderCalendar = () => {
  calendar.replaceChildren(
    renderMonth(calendarCursor),
    renderMonth(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1)),
  );
};

document.querySelector("[data-calendar-prev]").addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector("[data-calendar-next]").addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  renderCalendar();
});

document.querySelector("[data-calendar-today]").addEventListener("click", () => {
  const today = new Date();
  calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
});

const loadAvailability = async () => {
  try {
    const response = await fetch("/.netlify/functions/calendar");
    if (!response.ok) throw new Error(`Calendar request failed: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data.unavailableDates)) throw new Error("Malformed calendar response");

    unavailableDates = new Set(data.unavailableDates);
    renderCalendar();
    calendarLoading.hidden = true;
  } catch (error) {
    console.error("Unable to load availability", error);
    calendarLoading.hidden = true;
    calendarError.hidden = false;
  }
};

loadAvailability();
