(function () {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.2 });

  document.querySelectorAll("video").forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    videoObserver.observe(video);
    let resuming = false;
    video.addEventListener("pause", () => {
      const box = video.getBoundingClientRect();
      const visible = box.bottom > 0 && box.top < window.innerHeight;
      if (resuming || video.ended || !visible) return;
      resuming = true;
      video.play().catch(() => {}).finally(() => {
        resuming = false;
      });
    });
  });

  const dialog = document.getElementById("konfhub-dialog");
  const TICKET_URL =
    "https://konfhub.com/widget/id/0ce94e7e-10d6-47ca-9904-4c7e2618e244";

  function openTickets(event) {
    if (!dialog) return;
    event.preventDefault();
    const body = dialog.querySelector("div");
    if (body && !body.querySelector("iframe")) {
      const frame = document.createElement("iframe");
      frame.src = TICKET_URL;
      frame.title = "Book your TechSparks pass";
      frame.className = "w-full min-h-[80vh] border-0 bg-white";
      body.appendChild(frame);
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  document.querySelectorAll("a").forEach((link) => {
    const label = link.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    if (label === "book your pass") {
      link.addEventListener("click", openTickets);
    }
  });

  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => {
    dialog?.close();
  });

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const menuButton = document.querySelector('#main-header button[aria-controls="mobile-menu-overlay"]');
  const menu = document.getElementById("mobile-menu-overlay");

  function setMenu(open) {
    if (!menu || !menuButton) return;
    menu.classList.toggle("opacity-0", !open);
    menu.classList.toggle("-translate-y-4", !open);
    menu.classList.toggle("pointer-events-none", !open);
    menu.classList.toggle("opacity-100", open);
    menu.classList.toggle("translate-y-0", open);
    menu.classList.toggle("pointer-events-auto", open);
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  menuButton?.addEventListener("click", () => {
    const open = menu.classList.contains("opacity-0");
    setMenu(open);
  });

  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.querySelectorAll(".mobile-dropdown-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = trigger.parentElement?.querySelector(".mobile-dropdown-menu");
      if (!panel) return;
      const willOpen = panel.classList.contains("grid-rows-[0fr]");
      panel.classList.toggle("grid-rows-[0fr]", !willOpen);
      panel.classList.toggle("opacity-0", !willOpen);
      panel.classList.toggle("grid-rows-[1fr]", willOpen);
      panel.classList.toggle("opacity-100", willOpen);
    });
  });

  let currentDay = "agenda-day1";
  let currentStage = "Main Stage";

  function dayHasStage(dayId, stage) {
    const day = document.getElementById(dayId);
    if (!day) return false;
    return [...day.querySelectorAll(".agenda-card")].some(
      (card) => card.getAttribute("data-stage") === stage
    );
  }

  function paintAgenda() {
    document.querySelectorAll(".agenda-content").forEach((day) => {
      const on = day.id === currentDay;
      day.classList.toggle("hidden", !on);
      day.classList.toggle("flex", on);
    });

    if (!dayHasStage(currentDay, currentStage)) currentStage = "Main Stage";

    document.querySelectorAll(".agenda-tab").forEach((tab) => {
      const on = tab.getAttribute("data-target") === currentDay;
      tab.classList.toggle("bg-[#8B70FF]", on);
      tab.classList.toggle("border-transparent", on);
      tab.classList.toggle("shadow-lg", on);
      tab.classList.toggle("shadow-purple/20", on);
      tab.classList.toggle("border-white/20", !on);
      tab.classList.toggle("hover:bg-white/10", !on);
      tab.classList.toggle("bg-transparent", !on);
    });

    document.querySelectorAll(".stage-tab").forEach((tab) => {
      const stage = tab.getAttribute("data-stage");
      const available = dayHasStage(currentDay, stage);
      tab.classList.toggle("hidden", !available);
      const on = available && stage === currentStage;
      tab.classList.toggle("bg-[#8B70FF]", on);
      tab.classList.toggle("bg-transparent", !on);
      tab.classList.toggle("hover:bg-white/5", !on);
    });

    document.querySelectorAll(".agenda-card").forEach((card) => {
      const day = card.closest(".agenda-content");
      const show =
        day?.id === currentDay && card.getAttribute("data-stage") === currentStage;
      card.classList.toggle("hidden", !show);
    });

    document.querySelectorAll(".agenda-empty").forEach((empty) => {
      const day = empty.closest(".agenda-content");
      const visible = day?.querySelectorAll(".agenda-card:not(.hidden)").length || 0;
      const show = day?.id === currentDay && visible === 0;
      empty.classList.toggle("hidden", !show);
    });
  }

  document.querySelectorAll(".agenda-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentDay = tab.getAttribute("data-target");
      paintAgenda();
    });
  });

  document.querySelectorAll(".stage-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("hidden")) return;
      currentStage = tab.getAttribute("data-stage");
      paintAgenda();
    });
  });

  const speakerButton = document.querySelector("[data-speakers-more]");
  const speakerGrid = document.getElementById("speakers-grid");
  const initialSpeakerCount = speakerGrid
    ? [...speakerGrid.children].filter((card) => !card.classList.contains("hidden")).length
    : 15;

  speakerButton?.addEventListener("click", () => {
    const cards = [...speakerGrid.children];
    const hidden = cards.filter((card) => card.classList.contains("hidden"));
    if (hidden.length) {
      hidden.forEach((card) => card.classList.remove("hidden"));
      speakerButton.textContent = "View Less";
      return;
    }
    cards.slice(initialSpeakerCount).forEach((card) => card.classList.add("hidden"));
    speakerButton.textContent = speakerButton.getAttribute("data-view-more-label") || "View More";
    document.getElementById("speakers")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
