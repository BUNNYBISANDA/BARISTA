const navigationLinks = [
  { id: "our-story", label: "Our Story", href: "our-story.html" },
  { id: "menu", label: "Menu", href: "menu.html" },
  { id: "franchising", label: "Franchising", href: "franchising.html" },
  { id: "careers", label: "Careers", href: "careers.html" },
  { id: "sustainability", label: "Sustainability", href: "sustainability.html" },
  { id: "gallery", label: "Gallery", href: "gallery.html" },
  { id: "news", label: "News", href: "news.html" },
  { id: "contact", label: "Contact", href: "contact.html" }
];

const footerQuickLinks = [
  { label: "Our Story", href: "our-story.html" },
  { label: "Menu", href: "menu.html" },
  { label: "Find a Cafe", href: "find-a-cafe.html" },
  { label: "Franchising", href: "franchising.html" },
  { label: "Careers", href: "careers.html" }
];

const footerBrandLinks = [
  { label: "Sustainability", href: "sustainability.html" },
  { label: "Gallery", href: "gallery.html" },
  { label: "News", href: "news.html" },
  { label: "Contact", href: "contact.html" }
];

const socialLinks = [
  { label: "Facebook", href: "https://web.facebook.com/BaristaSL" },
  { label: "Instagram", href: "https://www.instagram.com/baristasl" },
  { label: "TikTok", href: "https://www.tiktok.com/@barista.srilanka" }
];

function buildNavLinks(currentPage, mobile = false) {
  return navigationLinks
    .map((link) => {
      const active = link.id === currentPage ? ' aria-current="page"' : "";
      if (mobile) {
        return `
          <li>
            <a class="mobile-link" href="${link.href}"${active}>
              <span>${link.label}</span>
              <span>-></span>
            </a>
          </li>
        `;
      }

      return `
        <li>
          <a class="nav-link" href="${link.href}"${active}>${link.label}</a>
        </li>
      `;
    })
    .join("");
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") {
      return;
    }

    this.dataset.ready = "true";
    const currentPage = this.dataset.page || "";

    this.innerHTML = `
      <header class="header-shell">
        <div class="header-inner">
          <a class="brand-link" href="index.html" aria-label="Barista Sri Lanka home">
            <img src="assets/img/logo-3-2.png" alt="Barista Sri Lanka">
          </a>

          <nav class="nav-desktop" aria-label="Primary">
            <ul>${buildNavLinks(currentPage)}</ul>
          </nav>

          <div class="header-actions">
            <a class="button button--primary button--header-cta" href="find-a-cafe.html">Find a Cafe</a>
          </div>

          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
            <span></span>
          </button>
        </div>
      </header>

      <div class="mobile-menu" id="mobile-menu" aria-hidden="true" data-mobile-menu>
        <div class="mobile-menu__backdrop" data-menu-close></div>
        <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div class="mobile-menu__top">
            <a class="brand-link" href="index.html" aria-label="Barista Sri Lanka home">
              <img src="assets/img/logo-3-2.png" alt="Barista Sri Lanka">
            </a>
            <button class="mobile-menu__close" type="button" aria-label="Close menu" data-menu-close>&times;</button>
          </div>

          <ul class="mobile-link-list">${buildNavLinks(currentPage, true)}</ul>

          <div class="mobile-menu__footer">
            <strong>Sri Lanka's largest and most preferred cafe chain</strong>
            <span class="small">Warm hospitality, trusted scale, and island-wide presence.</span>
            <div class="button-row">
              <a class="button button--primary" href="find-a-cafe.html">Find a Cafe</a>
              <a class="button button--ghost-light" href="franchising.html#enquire">Franchise with Us</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const toggle = this.querySelector("[data-menu-toggle]");
    const menu = this.querySelector("[data-mobile-menu]");
    const closeTriggers = this.querySelectorAll("[data-menu-close]");
    const firstLink = this.querySelector(".mobile-link");

    const setMenuState = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);

      if (open && firstLink) {
        window.setTimeout(() => firstLink.focus(), 100);
      }
    };

    toggle?.addEventListener("click", () => {
      const open = menu.getAttribute("aria-hidden") === "true";
      setMenuState(open);
    });

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        setMenuState(false);
      }
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") {
      return;
    }

    this.dataset.ready = "true";

    this.innerHTML = `
      <footer class="footer-shell">
        <div class="container-wide">
          <div class="footer-cta">
            <span class="eyebrow">Island-wide brand experience</span>
            <h2 class="section-title">The largest and most preferred cafe chain in Sri Lanka.</h2>
            <p class="lead footer-cta__lead">
              Built for everyday guests, franchise growth, and a stronger national hospitality footprint.
            </p>
            <div class="button-row">
              <a class="button button--primary" href="find-a-cafe.html">Find a Cafe</a>
              <a class="button button--ghost-light" href="contact.html">Connect with Barista</a>
            </div>
          </div>

          <div class="footer-main">
            <div class="footer-brand stack">
              <img src="assets/img/logo-3-2.png" alt="Barista Sri Lanka">
              <p class="muted footer-copy">
                Warm, modern, and trusted hospitality across 87 outlets and growing.
              </p>
            </div>

            <div>
              <h3 class="footer-heading">Explore</h3>
              <ul class="footer-link-list">
                ${footerQuickLinks.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Brand</h3>
              <ul class="footer-link-list">
                ${footerBrandLinks.map((item) => `<li><a href="${item.href}">${item.label}</a></li>`).join("")}
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Contact</h3>
              <ul class="contact-list">
                <li>Barista Coffee Lanka Pvt Ltd</li>
                <li>5th Floor, IBM Building, No. 48 Nawam Mawatha, Colombo 02</li>
                <li><a href="mailto:info@barista.lk">info@barista.lk</a></li>
                <li><a href="tel:+94112552180">+94 11 255 2180</a></li>
                <li><a href="tel:+94112552181">+94 11 255 2181</a></li>
                <li><a href="tel:+94112552182">+94 11 255 2182</a></li>
              </ul>

              <div class="footer-social-block">
                <h3 class="footer-heading">Follow</h3>
                <ul class="social-list">
                  ${socialLinks.map((item) => `<li><a href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a></li>`).join("")}
                </ul>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; <span data-current-year></span> Barista Sri Lanka. All rights reserved.</span>
            <span>Frontend rebuild focused on premium brand presentation and responsive clarity.</span>
          </div>
        </div>
      </footer>
    `;

    const yearNode = this.querySelector("[data-current-year]");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }
}

customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);

function setupRevealAnimations() {
  const revealNodes = document.querySelectorAll("[data-reveal]");
  if (!revealNodes.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function setupTabs() {
  document.querySelectorAll("[data-tabs]").forEach((tabsElement) => {
    const buttons = tabsElement.querySelectorAll("[data-tab-target]");
    const panels = tabsElement.querySelectorAll("[data-tab-panel]");
    if (!buttons.length || !panels.length) {
      return;
    }

    const activate = (tabName) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.tabTarget === tabName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === tabName);
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.tabTarget));
    });

    const initial = tabsElement.querySelector("[data-tab-target].is-active") || buttons[0];
    activate(initial.dataset.tabTarget);
  });
}

function setupDialogs() {
  document.querySelectorAll("[data-open-dialog]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const target = document.getElementById(trigger.dataset.openDialog);
      if (target && typeof target.showModal === "function") {
        target.showModal();
      }
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!inside) {
        dialog.close();
      }
    });

    dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });

    dialog.addEventListener("close", () => {
      dialog.querySelectorAll("video").forEach((video) => {
        video.pause();
      });
    });
  });
}

function setupLocationDirectory() {
  document.querySelectorAll("[data-location-directory]").forEach((directory) => {
    const searchInput = directory.querySelector("[data-location-search]");
    const filterButtons = directory.querySelectorAll("[data-location-filter]");
    const cards = directory.querySelectorAll("[data-location-card]");
    const emptyState = directory.querySelector("[data-location-empty]");
    let activeFilter = "all";

    const render = () => {
      const query = (searchInput?.value || "").trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const name = (card.dataset.locationName || "").toLowerCase();
        const category = card.dataset.locationRegion || "";
        const matchesQuery = !query || name.includes(query);
        const matchesFilter = activeFilter === "all" || category === activeFilter;
        const visible = matchesQuery && matchesFilter;

        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    };

    searchInput?.addEventListener("input", render);
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.locationFilter || "all";
        filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        render();
      });
    });

    render();
  });
}

function setupGalleryLightbox() {
  const triggers = document.querySelectorAll("[data-lightbox-src]");
  if (!triggers.length) {
    return;
  }

  const lightbox = document.createElement("dialog");
  lightbox.className = "dialog lightbox-dialog";
  lightbox.innerHTML = `
    <div class="dialog__content">
      <button class="dialog-close" type="button" aria-label="Close image" data-close-dialog>&times;</button>
      <img src="" alt="" data-lightbox-image>
      <p class="lightbox-caption" data-lightbox-caption></p>
    </div>
  `;

  document.body.append(lightbox);

  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const close = lightbox.querySelector("[data-close-dialog]");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.lightboxSrc || "";
      image.alt = trigger.dataset.lightboxAlt || "";
      caption.textContent = trigger.dataset.lightboxCaption || "";
      lightbox.showModal();
    });
  });

  close?.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    const rect = lightbox.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!inside) {
      lightbox.close();
    }
  });
}

function setupDemoForms() {
  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      if (status) {
        status.hidden = false;
        status.textContent =
          form.dataset.successMessage ||
          "Thanks. Your details have been captured in this frontend prototype.";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupRevealAnimations();
  setupTabs();
  setupDialogs();
  setupLocationDirectory();
  setupGalleryLightbox();
  setupDemoForms();
});

function setupLocationQueryPrefill() {
  if (!document.body.classList.contains("page--locations")) {
    return;
  }

  const district = new URLSearchParams(window.location.search).get("district");
  if (!district) {
    return;
  }

  const directory = document.querySelector("[data-location-directory]");
  const legacyInput = directory?.querySelector("[data-location-search]");
  const stickyInput = document.querySelector("[data-locator-query]");
  const heroInput = document.querySelector("[data-locator-query-hero]");
  const searchInput = legacyInput || stickyInput || heroInput;
  if (!searchInput) {
    return;
  }

  searchInput.value = district;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));

  if (heroInput && heroInput !== searchInput) {
    heroInput.value = district;
  }

  if (stickyInput && stickyInput !== searchInput) {
    stickyInput.value = district;
  }
}

function setupHomeHeaderState() {
  const hero = document.querySelector(".hm-hero");
  if (!hero) {
    return;
  }

  const syncHeaderState = () => {
    const threshold = Math.max(120, hero.offsetHeight - window.innerHeight * 0.25);
    document.body.classList.toggle("home-header-scrolled", window.scrollY > threshold);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
  window.addEventListener("resize", syncHeaderState);
}

function setupHomeClock() {
  const clock = document.getElementById("home-hero-clock");
  if (!clock) {
    return;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const render = () => {
    clock.textContent = `COLOMBO / ${formatter.format(new Date())}`;
  };

  render();
  window.setInterval(render, 1000);
}

function setupHomeSettleReveal(prefersReducedMotion) {
  const settleNodes = document.querySelectorAll("[data-settle]");
  if (!settleNodes.length) {
    return;
  }

  settleNodes.forEach((node) => {
    node.querySelectorAll(".hm-settle__line > span").forEach((line, index) => {
      line.style.transitionDelay = `${index * 60}ms`;
    });
  });

  if (prefersReducedMotion) {
    settleNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
  );

  settleNodes.forEach((node) => observer.observe(node));
}

function setupHomeCounters(prefersReducedMotion) {
  const counters = Array.from(document.querySelectorAll("[data-home-count]"));
  if (!counters.length) {
    return;
  }

  const formatter = new Intl.NumberFormat("en-US");
  const renderValue = (node, value) => {
    const roundedValue = Math.round(value);
    node.textContent = formatter.format(roundedValue);

    const key = node.dataset.homeCountKey;
    if (!key) {
      return;
    }

    document.querySelectorAll(`[data-home-count-mirror="${key}"]`).forEach((mirror) => {
      mirror.textContent = formatter.format(roundedValue);
    });
  };

  const animateCounter = (node) => {
    const target = Number(node.dataset.homeCount || 0);
    const startTime = performance.now();
    const duration = 1600;
    const easeOutQuart = (value) => 1 - (1 - value) ** 4;

    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      renderValue(node, target * easeOutQuart(progress));

      if (progress < 1) {
        window.requestAnimationFrame(frame);
        return;
      }

      node.dataset.homeCounted = "true";
      renderValue(node, target);
    };

    window.requestAnimationFrame(frame);
  };

  if (prefersReducedMotion) {
    counters.forEach((node) => {
      renderValue(node, Number(node.dataset.homeCount || 0));
      node.dataset.homeCounted = "true";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.homeCounted === "true") {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -40px 0px" }
  );

  counters.forEach((node) => observer.observe(node));
}

function setupHomeTicker(prefersReducedMotion) {
  const ticker = document.querySelector("[data-home-today-count]");
  if (!ticker) {
    return;
  }

  const formatter = new Intl.NumberFormat("en-US");
  let totalToday = Number((ticker.textContent || "0").replace(/,/g, ""));

  ticker.addEventListener("animationend", () => {
    ticker.classList.remove("is-pulse");
  });

  window.setInterval(() => {
    totalToday += 1;
    ticker.textContent = formatter.format(totalToday);

    if (prefersReducedMotion) {
      return;
    }

    ticker.classList.remove("is-pulse");
    void ticker.offsetWidth;
    ticker.classList.add("is-pulse");
  }, 30000);
}

function setupHomeMap() {
  const map = document.querySelector("[data-home-map]");
  if (!map) {
    return;
  }
}

function setupHomeCardTilt(prefersReducedMotion) {
  const card = document.querySelector("[data-home-card]");
  if (!card || prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const resetCard = () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--shine-x", "50%");
    card.style.setProperty("--shine-y", "50%");
  };

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 20;
    const rotateX = (0.5 - py) * 20;

    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
    card.style.setProperty("--shine-x", `${px * 100}%`);
    card.style.setProperty("--shine-y", `${py * 100}%`);
  });

  card.addEventListener("pointerleave", resetCard);
  resetCard();
}

function setupHomeMomentLightbox() {
  const dialog = document.getElementById("moment-lightbox");
  const triggers = Array.from(document.querySelectorAll("[data-moment-open]"));
  const track = document.querySelector("[data-day-track]");
  if (!dialog || !triggers.length) {
    return;
  }

  const image = dialog.querySelector(".hm-moment-modal__image");
  const eyebrow = dialog.querySelector("[data-moment-modal-eyebrow]");
  const line = dialog.querySelector("[data-moment-modal-line]");
  let previousBodyOverflow = "";

  const setTrackPaused = (paused) => {
    if (!track) {
      return;
    }

    if (paused) {
      track.dataset.dayPaused = "true";
      return;
    }

    delete track.dataset.dayPaused;
  };

  const populateDialog = (trigger) => {
    if (!image || !eyebrow || !line) {
      return;
    }

    image.src = trigger.dataset.momentImage || "";
    image.alt = trigger.dataset.momentAlt || "";
    eyebrow.textContent = trigger.dataset.momentTime || "";
    line.textContent = trigger.dataset.momentLine || "";
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      populateDialog(trigger);
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTrackPaused(true);

      if (!dialog.open) {
        dialog.showModal();
      }
    });
  });

  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousBodyOverflow;
    setTrackPaused(false);

    if (image) {
      image.src = "";
      image.alt = "";
    }

    if (eyebrow) {
      eyebrow.textContent = "";
    }

    if (line) {
      line.textContent = "";
    }
  });
}

function setupFranchisingSettleReveal(prefersReducedMotion) {
  const settleNodes = document.querySelectorAll(".page--franchising [data-settle]");
  if (!settleNodes.length) {
    return;
  }

  settleNodes.forEach((node) => {
    node.querySelectorAll(".fr-settle-line > span").forEach((line, index) => {
      line.style.transitionDelay = `${index * 60}ms`;
    });
  });

  if (prefersReducedMotion) {
    settleNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
  );

  settleNodes.forEach((node) => observer.observe(node));
}

function setupFranchisingCounters(prefersReducedMotion) {
  const counters = Array.from(document.querySelectorAll(".page--franchising [data-counter]"));
  if (!counters.length) {
    return;
  }

  const renderValue = (node, value) => {
    const decimals = Number(node.dataset.counterDecimals || 0);
    const suffix = node.dataset.counterSuffix || "";
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    const renderedValue = decimals > 0 ? value : Math.round(value);
    node.textContent = `${formatter.format(renderedValue)}${suffix}`;
  };

  const animateCounter = (node) => {
    const target = Number(node.dataset.counter || 0);
    const decimals = Number(node.dataset.counterDecimals || 0);
    const startTime = performance.now();
    const duration = 1600;
    const easeOutQuart = (value) => 1 - (1 - value) ** 4;

    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = target * easeOutQuart(progress);
      const renderedValue = decimals > 0 ? Number(currentValue.toFixed(decimals)) : currentValue;

      renderValue(node, renderedValue);

      if (progress < 1) {
        window.requestAnimationFrame(frame);
        return;
      }

      node.dataset.counterCounted = "true";
      renderValue(node, target);
    };

    window.requestAnimationFrame(frame);
  };

  if (prefersReducedMotion) {
    counters.forEach((node) => {
      renderValue(node, Number(node.dataset.counter || 0));
      node.dataset.counterCounted = "true";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.counterCounted === "true") {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -40px 0px" }
  );

  counters.forEach((node) => observer.observe(node));
}

function setupFranchisingVoiceLightbox() {
  const dialog = document.getElementById("fr-voice-lightbox");
  const triggers = Array.from(document.querySelectorAll(".page--franchising [data-voice-open]"));
  const track = document.querySelector("[data-fr-voices-track]");
  if (!dialog || !triggers.length) {
    return;
  }

  const portraitShell = dialog.querySelector("[data-voice-modal-initials]");
  const portrait = dialog.querySelector(".fr-voice-modal__portrait");
  const name = dialog.querySelector("[data-voice-modal-name]");
  const quote = dialog.querySelector("[data-voice-modal-quote]");
  let previousBodyOverflow = "";

  const setTrackPaused = (paused) => {
    if (!track) {
      return;
    }

    if (paused) {
      track.dataset.frVoicesPaused = "true";
      return;
    }

    delete track.dataset.frVoicesPaused;
  };

  const resetPortraitFallback = () => {
    if (!portraitShell || !portrait) {
      return;
    }

    portraitShell.classList.remove("is-fallback");
    portrait.style.display = "";
  };

  if (portraitShell && portrait) {
    portrait.addEventListener("error", () => {
      portraitShell.classList.add("is-fallback");
      portrait.style.display = "none";
    });
  }

  const populateDialog = (trigger) => {
    if (!name || !quote || !portraitShell || !portrait) {
      return;
    }

    const initials = trigger.dataset.voiceInitials || "";
    portraitShell.dataset.initials = initials;
    resetPortraitFallback();
    portrait.src = trigger.dataset.voicePortrait || "";
    portrait.alt = `Portrait of ${trigger.dataset.voiceName || "Barista franchisee"}`;
    name.textContent = trigger.dataset.voiceName || "";
    quote.textContent = trigger.dataset.voiceQuote || "";
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      populateDialog(trigger);
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTrackPaused(true);

      if (!dialog.open) {
        dialog.showModal();
      }
    });
  });

  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousBodyOverflow;
    setTrackPaused(false);

    if (portrait) {
      portrait.removeAttribute("src");
      portrait.alt = "";
      portrait.style.display = "";
    }

    if (portraitShell) {
      portraitShell.classList.remove("is-fallback");
      portraitShell.dataset.initials = "";
    }

    if (name) {
      name.textContent = "";
    }

    if (quote) {
      quote.textContent = "";
    }
  });
}

function setupHomeManifesto() {
  if (!document.body.classList.contains("page--home")) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupHomeHeaderState();
  setupHomeClock();
  setupHomeSettleReveal(prefersReducedMotion);
  setupHomeCounters(prefersReducedMotion);
  setupHomeTicker(prefersReducedMotion);
  setupHomeMap();
  setupHomeMomentLightbox();
  setupHomeCardTilt(prefersReducedMotion);
}

function setupFranchisingPage() {
  if (!document.body.classList.contains("page--franchising")) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupFranchisingSettleReveal(prefersReducedMotion);
  setupFranchisingCounters(prefersReducedMotion);
  setupFranchisingVoiceLightbox();
}

document.addEventListener("DOMContentLoaded", () => {
  setupLocationQueryPrefill();
  setupHomeManifesto();
  setupFranchisingPage();
});
