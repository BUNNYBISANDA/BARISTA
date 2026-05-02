(function () {
  function setupLocatorPage() {
    if (!document.body.classList.contains("page--locations")) {
      return;
    }

    const cafes = Array.isArray(window.BARISTA_CAFES) ? window.BARISTA_CAFES.slice() : [];
    if (!cafes.length) {
      return;
    }

    const heroForm = document.querySelector("[data-locator-hero-form]");
    const heroInput = document.querySelector("[data-locator-query-hero]");
    const stickyInput = document.querySelector("[data-locator-query]");
    const quickPicksNode = document.querySelector("[data-locator-quick-picks]");
    const summaryNode = document.querySelector("[data-locator-summary]");
    const resultsNode = document.querySelector("[data-locator-results]");
    const emptyNode = document.querySelector("[data-locator-empty]");
    const filterButtons = Array.from(document.querySelectorAll("[data-locator-filter]"));
    const districtBrowseNode = document.querySelector("[data-locator-district-browse]");
    const utilityDistrictsNode = document.querySelector("[data-locator-utility-districts]");
    const featuredNode = document.querySelector("[data-locator-featured]");
    const markersNode = document.querySelector("[data-locator-markers]");
    const mapStage = document.querySelector("[data-locator-map-stage]");
    const tooltip = document.querySelector("[data-locator-tooltip]");
    const tooltipName = document.querySelector("[data-locator-tooltip-name]");
    const tooltipMeta = document.querySelector("[data-locator-tooltip-meta]");
    const explorerSection = document.querySelector(".lc-explorer");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const collator = new Intl.Collator("en", { sensitivity: "base" });
    const quickPickValues = ["Colombo", "Dehiwala", "Wattala", "Maharagama", "Kandy", "Galle"];
    const state = {
      activeFilters: new Set(),
      activeId: "",
      filtered: [],
      query: ""
    };

    const normalize = (value) => String(value || "").toLowerCase().trim();
    const uniqueDistricts = Array.from(new Set(cafes.map((cafe) => cafe.district))).sort(collator.compare);
    const cafeById = new Map(cafes.map((cafe) => [cafe.id, cafe]));
    const knownPlaceQueries = new Set(
      cafes.flatMap((cafe) => [normalize(cafe.name), normalize(cafe.district), normalize(cafe.city)]).filter(Boolean)
    );

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const serviceLabel = (value) => {
      const labels = {
        "dine-in": "Dine-in",
        takeaway: "Takeaway",
        delivery: "Delivery"
      };

      return labels[value] || value;
    };

    const formatDirectionsUrl = (cafe) => {
      const query = cafe.lat && cafe.lng ? `${cafe.lat},${cafe.lng}` : cafe.address;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    };

    const getCurrentColomboMinutes = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        hourCycle: "h23",
        minute: "2-digit",
        timeZone: "Asia/Colombo"
      }).formatToParts(new Date());

      const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
      const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
      return hour * 60 + minute;
    };

    const getMinutesFromTime = (value) => {
      const [hours, minutes] = String(value || "0:0").split(":").map(Number);
      return hours * 60 + minutes;
    };

    const isOpenNow = (cafe) => {
      const now = getCurrentColomboMinutes();
      const open = getMinutesFromTime(cafe.hours?.open);
      const close = getMinutesFromTime(cafe.hours?.close);
      return now >= open && now <= close;
    };

    const sortCafes = (list) =>
      list.slice().sort((left, right) => {
        if (left.featured !== right.featured) {
          return left.featured ? -1 : 1;
        }

        const districtCompare = collator.compare(left.district, right.district);
        if (districtCompare !== 0) {
          return districtCompare;
        }

        return collator.compare(left.city, right.city);
      });

    const syncInputs = () => {
      if (heroInput && heroInput.value !== state.query) {
        heroInput.value = state.query;
      }

      if (stickyInput && stickyInput.value !== state.query) {
        stickyInput.value = state.query;
      }
    };

    const syncUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const normalizedQuery = normalize(state.query);

      params.delete("q");
      params.delete("district");

      if (normalizedQuery) {
        const matchedDistrict = uniqueDistricts.find((district) => normalize(district) === normalizedQuery);
        if (matchedDistrict) {
          params.set("district", matchedDistrict);
        } else {
          params.set("q", state.query);
        }
      }

      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    };

    const renderQuickPicks = () => {
      if (!quickPicksNode) {
        return;
      }

      quickPicksNode.innerHTML = quickPickValues
        .filter((value) => cafes.some((cafe) => normalize(`${cafe.city} ${cafe.district}`).includes(normalize(value))))
        .map(
          (value) => `
            <button class="lc-pick-chip" type="button" data-locator-query-pick="${escapeHtml(value)}" aria-pressed="false">
              ${escapeHtml(value)}
            </button>
          `
        )
        .join("");
    };

    const renderDistrictBrowse = () => {
      const markup = uniqueDistricts
        .map(
          (district) => `
            <button class="lc-district-chip" type="button" data-locator-district="${escapeHtml(district)}" aria-pressed="false">
              <span>${escapeHtml(district)}</span>
            </button>
          `
        )
        .join("");

      if (districtBrowseNode) {
        districtBrowseNode.innerHTML = markup;
      }

      if (utilityDistrictsNode) {
        utilityDistrictsNode.innerHTML = markup;
      }
    };

    const renderFeatured = () => {
      if (!featuredNode) {
        return;
      }

      featuredNode.innerHTML = sortCafes(cafes.filter((cafe) => cafe.featured))
        .slice(0, 6)
        .map(
          (cafe) => `
            <article class="lc-feature-card">
              <figure class="lc-feature-card__media">
                <img src="${escapeHtml(cafe.image)}" alt="${escapeHtml(cafe.name)}" loading="lazy" decoding="async">
              </figure>
              <div class="lc-feature-card__body">
                <p class="lc-eyebrow">${escapeHtml(cafe.featuredLabel || "Featured location")}</p>
                <h3>${escapeHtml(cafe.name)}</h3>
                <p>${escapeHtml(cafe.note)}</p>
                <div class="lc-feature-card__actions">
                  <button class="lc-inline-button" type="button" data-locator-focus="${escapeHtml(cafe.id)}">View on map</button>
                  <a class="lc-inline-link" href="${formatDirectionsUrl(cafe)}" target="_blank" rel="noreferrer">Get directions</a>
                </div>
              </div>
            </article>
          `
        )
        .join("");
    };

    const getFilteredCafes = () => {
      const query = normalize(state.query);
      const terms = query ? query.split(/\s+/).filter(Boolean) : [];
      const exactPlaceQuery = knownPlaceQueries.has(query);

      return sortCafes(
        cafes.filter((cafe) => {
          const primaryHaystack = normalize(
            [
              cafe.name,
              cafe.district,
              cafe.city,
              cafe.featuredLabel,
              ...(cafe.tags || []),
              ...(cafe.services || [])
            ].join(" ")
          );
          const secondaryHaystack = normalize([cafe.address, cafe.note].join(" "));

          const matchesPrimary = !terms.length || terms.every((term) => primaryHaystack.includes(term));
          const matchesSecondary = !terms.length || terms.every((term) => secondaryHaystack.includes(term));
          const matchesQuery = !terms.length || matchesPrimary || (!exactPlaceQuery && matchesSecondary);
          if (!matchesQuery) {
            return false;
          }

          for (const filter of state.activeFilters) {
            if (filter === "open-now" && !isOpenNow(cafe)) {
              return false;
            }

            if (filter === "featured" && !cafe.featured) {
              return false;
            }

            if (filter !== "open-now" && filter !== "featured" && !(cafe.services || []).includes(filter)) {
              return false;
            }
          }

          return true;
        })
      );
    };

    const renderSummary = (filtered) => {
      if (!summaryNode) {
        return;
      }

      const districtCount = new Set(filtered.map((cafe) => cafe.district)).size;
      const filterCount = state.activeFilters.size;
      const focusSuffix = state.query ? ` for "${state.query}"` : "";

      if (!filtered.length) {
        summaryNode.textContent = `No cafes in focus${focusSuffix}.`;
        return;
      }

      const summary = `${filtered.length} ${filtered.length === 1 ? "cafe" : "cafes"} in focus${focusSuffix} across ${districtCount} ${
        districtCount === 1 ? "district" : "districts"
      }`;

      summaryNode.textContent = filterCount ? `${summary} with ${filterCount} active ${filterCount === 1 ? "filter" : "filters"}.` : `${summary}.`;
    };

    const renderResults = (filtered) => {
      if (!resultsNode) {
        return;
      }

      resultsNode.innerHTML = filtered
        .map(
          (cafe) => `
            <article class="lc-result-card" data-locator-card data-cafe-id="${escapeHtml(cafe.id)}" tabindex="-1">
              <figure class="lc-result-card__media">
                <img src="${escapeHtml(cafe.image)}" alt="${escapeHtml(cafe.name)}" loading="lazy" decoding="async">
              </figure>
              <div class="lc-result-card__body">
                <div class="lc-result-card__top">
                  <p class="lc-result-card__meta">${escapeHtml(cafe.district)} / ${escapeHtml(cafe.city)}</p>
                  ${cafe.featured ? `<span class="lc-result-card__badge">${escapeHtml(cafe.featuredLabel || "Featured")}</span>` : ""}
                </div>
                <h3>${escapeHtml(cafe.name)}</h3>
                <p class="lc-result-card__address">${escapeHtml(cafe.address)}</p>
                <p class="lc-result-card__hours">${escapeHtml(cafe.hours?.label || "Hours available on request")}</p>
                <p class="lc-result-card__note">${escapeHtml(cafe.note)}</p>
                <ul class="lc-service-list" aria-label="Available services">
                  ${(cafe.services || [])
                    .map((service) => `<li>${escapeHtml(serviceLabel(service))}</li>`)
                    .join("")}
                </ul>
                <div class="lc-result-card__actions">
                  <button class="lc-inline-button" type="button" data-locator-focus="${escapeHtml(cafe.id)}">View details</button>
                  <a class="lc-inline-link" href="${formatDirectionsUrl(cafe)}" target="_blank" rel="noreferrer">Get directions</a>
                </div>
              </div>
            </article>
          `
        )
        .join("");

      if (emptyNode) {
        emptyNode.hidden = filtered.length > 0;
      }
    };

    const renderMarkers = (filtered) => {
      if (!markersNode) {
        return;
      }

      markersNode.innerHTML = filtered
        .map(
          (cafe) => `
            <button
              class="lc-map-marker${cafe.featured ? " is-featured" : ""}"
              type="button"
              style="left:${cafe.mapX}%; top:${cafe.mapY}%"
              data-cafe-id="${escapeHtml(cafe.id)}"
              aria-label="${escapeHtml(`${cafe.name} in ${cafe.city}, ${cafe.district}. View details.`)}"
            >
              <span></span>
            </button>
          `
        )
        .join("");

      if (mapStage) {
        mapStage.classList.toggle("is-empty", filtered.length === 0);
      }
    };

    const updateFilterButtonState = () => {
      filterButtons.forEach((button) => {
        const filter = button.dataset.locatorFilter || "";
        const isActive = state.activeFilters.has(filter);
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    const updateQueryChipState = () => {
      const normalizedQuery = normalize(state.query);

      document.querySelectorAll("[data-locator-query-pick]").forEach((button) => {
        const isActive = normalize(button.dataset.locatorQueryPick || "") === normalizedQuery;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      document.querySelectorAll("[data-locator-district]").forEach((button) => {
        const isActive = normalize(button.dataset.locatorDistrict || "") === normalizedQuery;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    };

    const getActiveCafe = () => state.filtered.find((cafe) => cafe.id === state.activeId) || null;

    const positionTooltip = (cafe) => {
      if (!tooltip || !mapStage) {
        return;
      }

      const left = Math.min(Math.max(cafe.mapX, 16), 84);
      const top = Math.min(Math.max(cafe.mapY, 14), 84);
      tooltip.style.left = `${left}%`;
      tooltip.style.top = `${top}%`;
    };

    const showTooltip = (cafe) => {
      if (!tooltip || !tooltipName || !tooltipMeta) {
        return;
      }

      tooltipName.textContent = cafe.name;
      tooltipMeta.textContent = `${cafe.city}, ${cafe.district}`;
      tooltip.hidden = false;
      positionTooltip(cafe);
    };

    const hideTooltip = () => {
      if (tooltip) {
        tooltip.hidden = true;
      }
    };

    const syncActiveState = () => {
      const activeCafe = getActiveCafe();
      const cards = document.querySelectorAll("[data-locator-card]");
      const markers = document.querySelectorAll(".lc-map-marker");

      cards.forEach((card) => {
        card.classList.toggle("is-active", card.dataset.cafeId === state.activeId);
      });

      markers.forEach((marker) => {
        marker.classList.toggle("is-active", marker.dataset.cafeId === state.activeId);
      });

      if (activeCafe) {
        showTooltip(activeCafe);
      } else {
        hideTooltip();
      }
    };

    const setActiveCafe = (id, options = {}) => {
      const cafe = state.filtered.find((item) => item.id === id);
      if (!cafe) {
        return;
      }

      state.activeId = cafe.id;
      syncActiveState();

      if (options.scrollCard) {
        const card = document.querySelector(`[data-locator-card][data-cafe-id="${cafe.id}"]`);
        card?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
        card?.focus({ preventScroll: true });
      }

      if (options.scrollExplorer && explorerSection) {
        explorerSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    };

    const render = () => {
      state.filtered = getFilteredCafes();
      if (!state.filtered.some((cafe) => cafe.id === state.activeId)) {
        state.activeId = state.filtered[0]?.id || "";
      }

      renderSummary(state.filtered);
      renderResults(state.filtered);
      renderMarkers(state.filtered);
      updateFilterButtonState();
      updateQueryChipState();
      syncActiveState();
      syncUrl();
    };

    const applyQuery = (value, options = {}) => {
      state.query = value.trim();
      syncInputs();
      render();

      if (options.scrollExplorer && explorerSection) {
        explorerSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    };

    heroForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      applyQuery(heroInput?.value || "", { scrollExplorer: true });
    });

    heroInput?.addEventListener("input", (event) => {
      state.query = event.target.value;
      syncInputs();
      render();
    });

    stickyInput?.addEventListener("input", (event) => {
      state.query = event.target.value;
      syncInputs();
      render();
    });

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.locatorFilter || "";
        if (!filter) {
          return;
        }

        if (state.activeFilters.has(filter)) {
          state.activeFilters.delete(filter);
        } else {
          state.activeFilters.add(filter);
        }

        render();
      });
    });

    quickPicksNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-locator-query-pick]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      applyQuery(button.dataset.locatorQueryPick || "", { scrollExplorer: true });
    });

    districtBrowseNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-locator-district]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      applyQuery(button.dataset.locatorDistrict || "", { scrollExplorer: false });
    });

    utilityDistrictsNode?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-locator-district]");
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      applyQuery(button.dataset.locatorDistrict || "", { scrollExplorer: true });
    });

    resultsNode?.addEventListener("click", (event) => {
      const focusButton = event.target.closest("[data-locator-focus]");
      const card = event.target.closest("[data-locator-card]");

      if (focusButton instanceof HTMLElement) {
        setActiveCafe(focusButton.dataset.locatorFocus || "", { scrollCard: false });
        return;
      }

      if (card instanceof HTMLElement) {
        setActiveCafe(card.dataset.cafeId || "", { scrollCard: false });
      }
    });

    resultsNode?.addEventListener("focusin", (event) => {
      const card = event.target.closest("[data-locator-card]");
      if (card instanceof HTMLElement) {
        setActiveCafe(card.dataset.cafeId || "", { scrollCard: false });
      }
    });

    featuredNode?.addEventListener("click", (event) => {
      const focusButton = event.target.closest("[data-locator-focus]");
      if (!(focusButton instanceof HTMLElement)) {
        return;
      }

      setActiveCafe(focusButton.dataset.locatorFocus || "", { scrollCard: true, scrollExplorer: true });
    });

    markersNode?.addEventListener("click", (event) => {
      const marker = event.target.closest(".lc-map-marker");
      if (!(marker instanceof HTMLButtonElement)) {
        return;
      }

      setActiveCafe(marker.dataset.cafeId || "", { scrollCard: true });
    });

    markersNode?.addEventListener("mouseover", (event) => {
      const marker = event.target.closest(".lc-map-marker");
      if (!(marker instanceof HTMLButtonElement)) {
        return;
      }

      const cafe = cafeById.get(marker.dataset.cafeId || "");
      if (cafe) {
        showTooltip(cafe);
      }
    });

    markersNode?.addEventListener("focusin", (event) => {
      const marker = event.target.closest(".lc-map-marker");
      if (!(marker instanceof HTMLButtonElement)) {
        return;
      }

      const cafe = cafeById.get(marker.dataset.cafeId || "");
      if (cafe) {
        showTooltip(cafe);
      }
    });

    markersNode?.addEventListener("mouseout", (event) => {
      const marker = event.target.closest(".lc-map-marker");
      if (!(marker instanceof HTMLButtonElement)) {
        return;
      }

      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && marker.contains(nextTarget)) {
        return;
      }

      const activeCafe = getActiveCafe();
      if (activeCafe) {
        showTooltip(activeCafe);
      } else {
        hideTooltip();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      syncActiveState();
    });

    window.addEventListener("resize", () => {
      const activeCafe = getActiveCafe();
      if (activeCafe && !tooltip?.hidden) {
        positionTooltip(activeCafe);
      }
    });

    renderQuickPicks();
    renderDistrictBrowse();
    renderFeatured();

    const initialParams = new URLSearchParams(window.location.search);
    const initialQuery = initialParams.get("district") || initialParams.get("q") || "";

    state.query = initialQuery;
    syncInputs();
    render();
  }

  document.addEventListener("DOMContentLoaded", setupLocatorPage);
})();
