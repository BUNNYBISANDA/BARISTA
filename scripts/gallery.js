(function () {
  function setupGalleryPage() {
    if (!document.body.classList.contains("page--gallery")) {
      return;
    }

    const locations = Array.isArray(window.BARISTA_GALLERY_LOCATIONS)
      ? window.BARISTA_GALLERY_LOCATIONS.slice()
      : [];

    if (!locations.length) {
      return;
    }

    const heroMedia = document.querySelector("[data-gallery-hero-media]");
    const jumpRail = document.querySelector("[data-gallery-jumps]");
    const featuredGrid = document.querySelector("[data-gallery-featured]");
    const locationsStack = document.querySelector("[data-gallery-locations]");
    const locationTotalNode = document.querySelector("[data-gallery-location-total]");
    const imageTotalNode = document.querySelector("[data-gallery-image-total]");
    const dialog = document.getElementById("gallery-viewer");
    const image = dialog?.querySelector("[data-gallery-viewer-image]");
    const meta = dialog?.querySelector("[data-gallery-viewer-meta]");
    const title = dialog?.querySelector("[data-gallery-viewer-title]");
    const caption = dialog?.querySelector("[data-gallery-viewer-caption]");
    const counter = dialog?.querySelector("[data-gallery-viewer-counter]");
    const previousButton = dialog?.querySelector("[data-gallery-prev]");
    const nextButton = dialog?.querySelector("[data-gallery-next]");
    const closeButton = dialog?.querySelector("[data-gallery-close]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!heroMedia || !jumpRail || !featuredGrid || !locationsStack || !dialog || !image || !meta || !title || !caption || !counter) {
      return;
    }

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const flattenImages = (items) =>
      items.flatMap((location) =>
        location.images.map((item, index) => ({
          ...item,
          locationId: location.id,
          locationName: location.locationName,
          region: location.region,
          descriptor: location.descriptor,
          highlight: location.highlight,
          index
        }))
      );

    const allImages = flattenImages(locations);
    const heroLocation = locations.find((location) => location.hero) || locations[0];
    const featuredLocations = locations
      .filter((location) => Number.isFinite(location.featuredRank))
      .sort((left, right) => left.featuredRank - right.featuredRank)
      .slice(0, 4);

    const cardLabel = (location) => `Barista Location / ${location.region}`;
    const sectionIdFor = (location) => `location-${location.slug}`;

    const renderCard = (location, item, options = {}) => {
      const classes = ["gl-card"];
      if (options.className) {
        classes.push(options.className);
      }

      const loading = options.loading || "lazy";
      const decoding = options.decoding || "async";
      const fetchPriority = options.fetchPriority ? ` fetchpriority="${options.fetchPriority}"` : "";
      const note = options.showNote === false ? "" : `<span class="gl-card__note">${escapeHtml(location.highlight)}</span>`;
      const reveal = options.reveal === false ? "" : " data-reveal";

      return `
        <button
          class="${classes.join(" ")}"
          type="button"
          data-gallery-item
          data-gallery-location="${escapeHtml(location.locationName)}"
          data-gallery-meta="${escapeHtml(cardLabel(location))}"
          data-gallery-title="${escapeHtml(location.locationName)}"
          data-gallery-caption="${escapeHtml(item.caption || location.descriptor)}"
          data-gallery-src="${escapeHtml(item.src)}"
          data-gallery-alt="${escapeHtml(item.alt)}"
          aria-label="${escapeHtml(`Open ${location.locationName} image`)}"${reveal}
        >
          <span class="gl-card__media gl-unmask">
            <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="${loading}" decoding="${decoding}"${fetchPriority}>
          </span>
          <span class="gl-card__overlay">
            <span class="gl-card__meta">${escapeHtml(cardLabel(location))}</span>
            <span class="gl-card__title">${escapeHtml(location.locationName)}</span>
            ${note}
          </span>
        </button>
      `;
    };

    const renderHero = () => {
      const mainImage = heroLocation.images[0];
      const insetImage = heroLocation.images[2] || heroLocation.images[1] || heroLocation.images[0];

      heroMedia.innerHTML = `
        <div class="gl-hero-visual">
          ${renderCard(heroLocation, mainImage, {
            className: "gl-card--hero",
            loading: "eager",
            decoding: "sync",
            fetchPriority: "high",
            showNote: true,
            reveal: true
          })}
          ${renderCard(heroLocation, insetImage, {
            className: "gl-card--hero-inset",
            loading: "eager",
            decoding: "async",
            showNote: false,
            reveal: true
          })}
        </div>
      `;
    };

    const renderJumpRail = () => {
      jumpRail.innerHTML = locations
        .map(
          (location) => `
            <a
              class="gl-jump-chip"
              href="#${sectionIdFor(location)}"
              data-gallery-jump="${escapeHtml(location.id)}"
            >${escapeHtml(location.locationName)}</a>
          `
        )
        .join("");
    };

    const renderFeatured = () => {
      const [lead, second, third, fourth] = featuredLocations;
      if (!lead || !second || !third || !fourth) {
        featuredGrid.innerHTML = "";
        return;
      }

      featuredGrid.innerHTML = `
        ${renderCard(lead, lead.images[0], { className: "gl-card--feature-lead", loading: "eager" })}
        <div class="gl-featured__stack">
          ${renderCard(second, second.images[0], { className: "gl-card--feature-top", loading: "eager" })}
          ${renderCard(third, third.images[0], { className: "gl-card--feature-bottom", loading: "eager" })}
        </div>
        ${renderCard(fourth, fourth.images[0], { className: "gl-card--feature-tall", loading: "eager" })}
      `;
    };

    const renderLocationGallery = (location) => {
      const [first, second, third] = location.images;

      if (location.layout === "duo") {
        return `
          <div class="gl-location__gallery gl-location__gallery--duo">
            ${first ? renderCard(location, first, { className: "gl-card--duo", loading: "eager" }) : ""}
            ${second ? renderCard(location, second, { className: "gl-card--duo" }) : ""}
          </div>
        `;
      }

      if (location.layout === "panorama") {
        return `
          <div class="gl-location__gallery gl-location__gallery--panorama">
            ${first ? renderCard(location, first, { className: "gl-card--panorama", loading: "eager" }) : ""}
            <div class="gl-location__gallery-secondary">
              ${second ? renderCard(location, second, { className: "gl-card--secondary" }) : ""}
              ${third ? renderCard(location, third, { className: "gl-card--secondary gl-card--secondary-portrait" }) : ""}
            </div>
          </div>
        `;
      }

      return `
        <div class="gl-location__gallery gl-location__gallery--cluster${location.reverse ? " is-reverse" : ""}">
          ${first ? renderCard(location, first, { className: "gl-card--lead", loading: "eager" }) : ""}
          <div class="gl-location__gallery-stack">
            ${second ? renderCard(location, second, { className: "gl-card--stack" }) : ""}
            ${third ? renderCard(location, third, { className: "gl-card--stack gl-card--stack-alt" }) : ""}
          </div>
        </div>
      `;
    };

    const renderLocations = () => {
      locationsStack.innerHTML = locations
        .map(
          (location) => `
            <section
              class="gl-location${location.spotlight ? " gl-location--spotlight" : ""}"
              id="${sectionIdFor(location)}"
              data-gallery-section="${escapeHtml(location.id)}"
            >
              <div class="gl-location__intro" data-reveal>
                <p class="gl-location__meta">${escapeHtml(cardLabel(location))}</p>
                <h2 class="gl-location__name">${escapeHtml(location.locationName)}</h2>
                <p class="gl-location__descriptor">${escapeHtml(location.descriptor)}</p>
              </div>
              ${renderLocationGallery(location)}
            </section>
          `
        )
        .join("");
    };

    const updateCounts = () => {
      if (locationTotalNode) {
        locationTotalNode.textContent = `${locations.length} locations`;
      }

      if (imageTotalNode) {
        imageTotalNode.textContent = `${allImages.length} views`;
      }
    };

    renderHero();
    renderJumpRail();
    renderFeatured();
    renderLocations();
    updateCounts();

    const jumpLinks = Array.from(document.querySelectorAll("[data-gallery-jump]"));
    const sections = Array.from(document.querySelectorAll("[data-gallery-section]"));
    const galleryItems = Array.from(document.querySelectorAll("[data-gallery-item]"));
    let activeIndex = 0;
    let lastTrigger = null;

    const setActiveJump = (id) => {
      jumpLinks.forEach((link) => {
        const isActive = link.dataset.galleryJump === id;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const updateLightbox = () => {
      const item = galleryItems[activeIndex];
      if (!item) {
        dialog.close();
        return;
      }

      image.src = item.dataset.gallerySrc || "";
      image.alt = item.dataset.galleryAlt || "";
      meta.textContent = item.dataset.galleryMeta || "";
      title.textContent = item.dataset.galleryTitle || "";
      caption.textContent = item.dataset.galleryCaption || "";
      counter.textContent = `${activeIndex + 1} / ${galleryItems.length}`;
    };

    const openLightbox = (item) => {
      const nextIndex = galleryItems.indexOf(item);
      if (nextIndex === -1 || typeof dialog.showModal !== "function") {
        return;
      }

      activeIndex = nextIndex;
      lastTrigger = item;
      updateLightbox();
      dialog.showModal();
      closeButton?.focus();
    };

    const cycleLightbox = (direction) => {
      if (!galleryItems.length) {
        return;
      }

      activeIndex = (activeIndex + direction + galleryItems.length) % galleryItems.length;
      updateLightbox();
    };

    jumpLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href") || "";
        const target = targetId ? document.querySelector(targetId) : null;
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
        setActiveJump(link.dataset.galleryJump || "");
        window.history.replaceState({}, "", targetId);
      });
    });

    if (sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          const activeEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

          if (activeEntry) {
            setActiveJump(activeEntry.target.dataset.gallerySection || "");
          }
        },
        { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -52% 0px" }
      );

      sections.forEach((section) => observer.observe(section));
      setActiveJump(sections[0].dataset.gallerySection || "");
    }

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => openLightbox(item));
    });

    previousButton?.addEventListener("click", () => cycleLightbox(-1));
    nextButton?.addEventListener("click", () => cycleLightbox(1));
    closeButton?.addEventListener("click", () => dialog.close());

    dialog.addEventListener("close", () => {
      if (lastTrigger instanceof HTMLElement) {
        lastTrigger.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!dialog.open) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        cycleLightbox(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        cycleLightbox(1);
      }
    });
  }

  setupGalleryPage();
})();
