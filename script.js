const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canUseHoverMotion =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReducedMotion.matches;

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const siteHeader = document.querySelector(".site-header");
const siteNav = siteHeader ? siteHeader.querySelector(".site-nav") : null;

if (siteHeader && siteNav) {
  document.documentElement.classList.add("nav-enhanced");
  siteNav.id = siteNav.id || "siteNav";

  let navToggle = document.getElementById("navToggle");

  if (!navToggle) {
    navToggle = document.createElement("button");
    navToggle.className = "nav-toggle";
    navToggle.id = "navToggle";
    navToggle.type = "button";
    navToggle.setAttribute("aria-controls", siteNav.id);
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
    navToggle.innerHTML = "<span></span><span></span><span></span>";
    siteHeader.insertBefore(navToggle, siteNav);
  }

  let navBackdrop = document.getElementById("siteNavBackdrop");

  if (!navBackdrop) {
    navBackdrop = document.createElement("button");
    navBackdrop.className = "site-nav-backdrop";
    navBackdrop.id = "siteNavBackdrop";
    navBackdrop.type = "button";
    navBackdrop.tabIndex = -1;
    navBackdrop.setAttribute("aria-hidden", "true");
    siteHeader.insertAdjacentElement("afterend", navBackdrop);
  }

  const mobileNavQuery = window.matchMedia("(max-width: 720px)");
  const siteNavLinks = siteNav.querySelectorAll("a");

  const setNavState = (isOpen) => {
    const shouldOpen = Boolean(isOpen && mobileNavQuery.matches);

    document.body.classList.toggle("is-nav-open", shouldOpen);
    siteHeader.classList.toggle("is-nav-open", shouldOpen);
    navToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    navToggle.setAttribute("aria-label", shouldOpen ? "Закрыть меню" : "Открыть меню");
  };

  navToggle.addEventListener("click", () => {
    setNavState(!document.body.classList.contains("is-nav-open"));
  });

  navBackdrop.addEventListener("click", () => {
    setNavState(false);
  });

  siteNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setNavState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavState(false);
    }
  });

  const handleViewportChange = (event) => {
    if (!event.matches) {
      setNavState(false);
    }
  };

  if (typeof mobileNavQuery.addEventListener === "function") {
    mobileNavQuery.addEventListener("change", handleViewportChange);
  } else {
    mobileNavQuery.addListener(handleViewportChange);
  }
}

const copyButtons = document.querySelectorAll("[data-copy-target]");

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-copy-target");
    const target = targetId ? document.getElementById(targetId) : null;

    if (!target) {
      return;
    }

    const text = target.textContent.trim();
    const defaultLabel = "Скопировать путь";

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Путь скопирован";
      button.classList.add("is-copied");

      window.setTimeout(() => {
        button.textContent = defaultLabel;
        button.classList.remove("is-copied");
      }, 1800);
    } catch (error) {
      button.textContent = "Скопируй вручную";

      window.setTimeout(() => {
        button.textContent = defaultLabel;
      }, 1800);
    }
  });
});

if (canUseHoverMotion) {
  const spotlightTargets = document.querySelectorAll(
    ".feature-row, .usage-step, .gallery-item, .install-steps, .path-panel, .recommendation-box, .final-cta-box"
  );

  const resetSpotlight = (element) => {
    element.style.setProperty("--pointer-x", "50%");
    element.style.setProperty("--pointer-y", "50%");
  };

  spotlightTargets.forEach((element) => {
    resetSpotlight(element);

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      element.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });

    element.addEventListener("pointerleave", () => {
      resetSpotlight(element);
    });
  });

  const heroVisual = document.querySelector(".hero-visual");
  const heroShots = heroVisual ? heroVisual.querySelectorAll(".shot") : [];
  const shotDepth = [-1.05, 0.35, 1];

  if (heroVisual && heroShots.length > 0) {
    const resetShots = () => {
      heroShots.forEach((shot) => {
        shot.style.setProperty("--shot-translate-x", "0px");
        shot.style.setProperty("--shot-translate-y", "0px");
        shot.style.setProperty("--shot-rotate-offset", "0deg");
      });
    };

    resetShots();

    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

      heroShots.forEach((shot, index) => {
        const depth = shotDepth[index] ?? 0.6;
        shot.style.setProperty("--shot-translate-x", `${offsetX * 24 * depth}px`);
        shot.style.setProperty("--shot-translate-y", `${offsetY * 18 * depth}px`);
        shot.style.setProperty("--shot-rotate-offset", `${offsetX * 5 * depth}deg`);
      });
    });

    heroVisual.addEventListener("pointerleave", resetShots);
  }
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const galleryButtons = document.querySelectorAll(".gallery-item");

if (lightbox && lightboxImage && lightboxTitle && galleryButtons.length > 0) {
  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.image || "";
      lightboxImage.alt = button.dataset.title || "";
      lightboxTitle.textContent = button.dataset.title || "";
      lightbox.showModal();
    });
  });

  lightbox.addEventListener("click", (event) => {
    const dialogDimensions = lightbox.getBoundingClientRect();
    const isOutside =
      event.clientX < dialogDimensions.left ||
      event.clientX > dialogDimensions.right ||
      event.clientY < dialogDimensions.top ||
      event.clientY > dialogDimensions.bottom;

    if (isOutside) {
      lightbox.close();
    }
  });
}
