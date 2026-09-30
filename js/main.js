/* ==========================================================
   Aberno — umumiy skriptlar
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Yorug' / qorong'u rejim ---------- */
  const THEME_KEY = "aberno-theme";
  const root = document.documentElement;
  const themeBtn = document.querySelector(".theme-toggle");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const savedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  };

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      const label = theme === "dark" ? "Yorug‘ rejimga o‘tish" : "Qorong‘u rejimga o‘tish";
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
  };

  setTheme(root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light"));

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  }

  // Foydalanuvchi o'zi tanlamagan bo'lsa, tizim sozlamasiga ergashamiz
  systemDark.addEventListener("change", (e) => {
    if (!savedTheme()) setTheme(e.matches ? "dark" : "light");
  });

  const header = document.querySelector(".header");
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");

  /* ---------- Header soyasi ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 10);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  };

  /* ---------- Mobil menyu ---------- */
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-active", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
  }

  /* ---------- Dropdown (Brendlar) ---------- */
  document.querySelectorAll(".nav__item").forEach((item) => {
    const toggle = item.querySelector(".drop-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = item.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Desktopda sichqoncha bilan ochish
    item.addEventListener("mouseenter", () => {
      if (window.innerWidth > 920) item.classList.add("is-open");
    });
    item.addEventListener("mouseleave", () => {
      if (window.innerWidth > 920) item.classList.remove("is-open");
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".nav__item.is-open").forEach((item) => {
      if (!item.contains(e.target)) item.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".nav__item.is-open").forEach((i) => i.classList.remove("is-open"));
    if (nav && nav.classList.contains("is-open")) burger.click();
  });

  /* ---------- Faol menyu bandi ---------- */
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a[href]").forEach((a) => {
    if (a.getAttribute("href") === page) {
      a.classList.add("is-active");
      const parent = a.closest(".nav__item");
      if (parent) parent.querySelector(".drop-toggle").classList.add("is-active");
    }
  });

  /* ---------- Scroll animatsiya ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Yuqoriga tugmasi ---------- */
  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Yuqoriga qaytish");
  toTop.innerHTML = "↑";
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(toTop);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mahsulotlar filtri ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const products = document.querySelectorAll(".product[data-brand]");

  const applyFilter = (value) => {
    filterBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === value));
    products.forEach((p) => {
      const match =
        value === "all" || p.dataset.brand === value || p.dataset.category === value;
      p.classList.toggle("is-hidden", !match);
    });
  };

  if (filterBtns.length) {
    filterBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        applyFilter(btn.dataset.filter);
        history.replaceState(null, "", btn.dataset.filter === "all" ? location.pathname : "#" + btn.dataset.filter);
      })
    );
    const hash = location.hash.slice(1);
    if (hash && document.querySelector(`.filter-btn[data-filter="${hash}"]`)) applyFilter(hash);
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
    });
  });

  /* ---------- Aloqa formasi ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    const success = form.querySelector(".form__success");

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Ismingizni kiriting"),
      phone: (v) =>
        v.replace(/\D/g, "").length >= 9 ? "" : "Telefon raqamini to‘liq kiriting",
      topic: (v) => (v ? "" : "Mavzuni tanlang"),
      message: (v) => (v.trim().length >= 10 ? "" : "Xabar kamida 10 ta belgidan iborat bo‘lsin"),
    };

    const validateField = (input) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const error = rule(input.value);
      const field = input.closest(".field");
      field.classList.toggle("has-error", !!error);
      field.querySelector(".field__error").textContent = error;
      return !error;
    };

    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => {
        if (el.closest(".field").classList.contains("has-error")) validateField(el);
      });
    });

    // Telefon raqamini +998 formatida yozish
    const phone = form.querySelector('[name="phone"]');
    if (phone) {
      phone.addEventListener("focus", () => {
        if (!phone.value) phone.value = "+998 ";
      });
      phone.addEventListener("input", () => {
        let d = phone.value.replace(/\D/g, "");
        if (!d.startsWith("998")) d = "998" + d;
        d = d.slice(0, 12);
        const p = d.slice(3);
        let out = "+998";
        if (p.length) out += " " + p.slice(0, 2);
        if (p.length > 2) out += " " + p.slice(2, 5);
        if (p.length > 5) out += " " + p.slice(5, 7);
        if (p.length > 7) out += " " + p.slice(7, 9);
        phone.value = out;
      });
    }

    // Brend sahifasidan kelganda mavzuni avtomatik tanlash (?mavzu=bulut)
    const params = new URLSearchParams(location.search);
    const topic = form.querySelector('[name="topic"]');
    if (topic && params.get("mavzu")) {
      const opt = topic.querySelector(`option[value="${params.get("mavzu")}"]`);
      if (opt) topic.value = opt.value;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("input, select, textarea").forEach((el) => {
        if (!validateField(el)) ok = false;
      });
      if (!ok) {
        const firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      // TODO: server tayyor bo'lgach, ma'lumotni shu yerda yuborish kerak (fetch).
      success.classList.add("is-visible");
      form.reset();
      success.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => success.classList.remove("is-visible"), 7000);
    });
  }

  /* ---------- Footer yili ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
