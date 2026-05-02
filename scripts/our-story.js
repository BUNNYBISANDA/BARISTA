function setupStorySettle(prefersReducedMotion) {
  const nodes = document.querySelectorAll("[data-story-settle]");
  if (!nodes.length) {
    return;
  }

  nodes.forEach((node) => {
    node.querySelectorAll(".os-settle-line > span").forEach((line, index) => {
      line.style.transitionDelay = `${index * 90}ms`;
    });
  });

  if (prefersReducedMotion) {
    nodes.forEach((node) => node.classList.add("is-visible"));
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
    { threshold: 0.24, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupStoryChapterState(prefersReducedMotion) {
  const chapters = document.querySelectorAll("[data-story-chapter]");
  if (!chapters.length) {
    return;
  }

  if (prefersReducedMotion) {
    chapters.forEach((chapter) => chapter.classList.add("is-current"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-current", entry.isIntersecting);
      });
    },
    { threshold: 0.35, rootMargin: "-10% 0px -45% 0px" }
  );

  chapters.forEach((chapter) => observer.observe(chapter));
}

function setupStoryCounters(prefersReducedMotion) {
  const counters = Array.from(document.querySelectorAll("[data-story-counter]"));
  if (!counters.length) {
    return;
  }

  const formatter = new Intl.NumberFormat("en-US");
  const renderValue = (node, value) => {
    const suffix = node.dataset.storySuffix || "";
    node.textContent = `${formatter.format(Math.round(value))}${suffix}`;
  };

  const animateCounter = (node) => {
    const target = Number(node.dataset.storyCounter || 0);
    const duration = 1500;
    const startTime = performance.now();
    const easeOutQuart = (value) => 1 - (1 - value) ** 4;

    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      renderValue(node, target * easeOutQuart(progress));

      if (progress < 1) {
        window.requestAnimationFrame(frame);
        return;
      }

      node.dataset.storyCounted = "true";
      renderValue(node, target);
    };

    window.requestAnimationFrame(frame);
  };

  if (prefersReducedMotion) {
    counters.forEach((node) => {
      renderValue(node, Number(node.dataset.storyCounter || 0));
      node.dataset.storyCounted = "true";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.storyCounted === "true") {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -30px 0px" }
  );

  counters.forEach((node) => observer.observe(node));
}

function setupStoryParallax(prefersReducedMotion) {
  const layers = Array.from(document.querySelectorAll("[data-story-parallax]"));
  if (!layers.length || prefersReducedMotion) {
    return;
  }

  let ticking = false;

  const update = () => {
    const viewportHeight = window.innerHeight || 1;

    layers.forEach((layer) => {
      const rect = layer.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const offset = (clamped - 0.5) * 22;
      layer.style.setProperty("--story-parallax", `${offset.toFixed(2)}px`);
    });

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("page--story")) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupStorySettle(prefersReducedMotion);
  setupStoryChapterState(prefersReducedMotion);
  setupStoryCounters(prefersReducedMotion);
  setupStoryParallax(prefersReducedMotion);
});
