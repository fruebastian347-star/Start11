/* =========================================================
   START11 – COACHING HUB CLEANUP
   Removes the unused planner/exercise-bank/video/live/match-data
   entry points from Coaching Hub only. Other standalone app areas
   are intentionally left untouched. Stored data is not deleted.
========================================================= */
(() => {
  const blockedHubTabs = new Set(["training", "exercises", "videos", "live", "data"]);

  function redirectBlockedHubTab() {
    if (typeof s13Tab !== "undefined" && blockedHubTabs.has(s13Tab)) {
      s13Tab = "dashboard";
    }
  }

  function cleanHubNavigation() {
    const modal = document.getElementById("s13modal");
    if (!modal) return;

    modal.querySelectorAll("#s13tabs [data-t]").forEach((button) => {
      if (blockedHubTabs.has(button.dataset.t)) button.remove();
    });

    // Remove legacy quick-entry buttons even if an older module re-adds them.
    modal.querySelectorAll("#s20quicklive, [data-t='live'], [data-t='videos'], [data-t='data']").forEach((node) => node.remove());
  }

  // Prevent the Match Data module from restoring its old Coaching Hub tab.
  if (typeof s22EnsureDataTab === "function") {
    s22EnsureDataTab = cleanHubNavigation;
  }

  if (typeof s13RenderContent === "function") {
    const previousRenderContent = s13RenderContent;
    s13RenderContent = function (...args) {
      redirectBlockedHubTab();
      return previousRenderContent.apply(this, args);
    };
  }

  if (typeof s13Render === "function") {
    const previousRender = s13Render;
    s13Render = function (...args) {
      redirectBlockedHubTab();
      const result = previousRender.apply(this, args);
      cleanHubNavigation();
      // Older Hub modules schedule a tab refresh asynchronously.
      setTimeout(cleanHubNavigation, 0);
      setTimeout(cleanHubNavigation, 100);
      return result;
    };
  }

  // Remove dashboard copy that advertises the features removed from this Hub.
  if (typeof s20Dashboard === "function") {
    const previousDashboard = s20Dashboard;
    s20Dashboard = function (target, ...args) {
      const result = previousDashboard.call(this, target, ...args);
      if (target) {
        target.querySelectorAll(".s20card").forEach((card) => {
          const label = card.querySelector(".s20label")?.textContent?.trim()?.toUpperCase();
          if (label === "VIDEOCLIPS") card.remove();
        });
        target.querySelectorAll(".s20step").forEach((step) => {
          const label = step.querySelector(".s13title")?.textContent?.trim()?.toUpperCase();
          if (["LIVE", "VIDEO", "TRÆNING"].includes(label)) {
            const next = step.nextElementSibling;
            const previous = step.previousElementSibling;
            if (next?.classList.contains("s20arrow")) next.remove();
            else if (previous?.classList.contains("s20arrow")) previous.remove();
            step.remove();
          }
        });
        target.querySelectorAll(".s13mut").forEach((node) => {
          if (/video samlet|live-data|videoklip/i.test(node.textContent || "")) {
            node.textContent = (node.textContent || "")
              .replace(/START11, scouting og video samlet\./gi, "START11 og scouting samlet.")
              .replace(/Live-data, video og næste træning\./gi, "Opsamling fra kampanalysen og næste udviklingsfokus.");
          }
        });
      }
      return result;
    };
  }

  // Apply cleanup after page load too, in case a delayed legacy initializer runs.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanHubNavigation, { once: true });
  } else {
    cleanHubNavigation();
  }
})();
