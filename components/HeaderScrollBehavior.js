"use client";

import { useEffect } from "react";

const TOP_THRESHOLD = 16;
const DIRECTION_THRESHOLD = 4;

export default function HeaderScrollBehavior() {
  useEffect(() => {
    const header = document.querySelector("[data-scroll-header]");
    if (!header) return undefined;

    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let lastDirection = 0;
    let frameId = 0;

    const closeOpenMenus = () => {
      header.querySelectorAll("details[open]").forEach((menu) => {
        menu.removeAttribute("open");
      });
    };

    const updateHeader = () => {
      frameId = 0;
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY;
      const direction = Math.sign(delta);
      const isAtTop = currentScrollY <= TOP_THRESHOLD;

      if (direction && direction !== lastDirection) accumulatedDelta = 0;
      if (direction) {
        accumulatedDelta += delta;
        lastDirection = direction;
      }

      header.classList.toggle("is-scrolled", !isAtTop);

      if (isAtTop) {
        header.classList.remove("is-hidden", "is-revealed");
        accumulatedDelta = 0;
      } else if (accumulatedDelta > DIRECTION_THRESHOLD) {
        header.classList.add("is-hidden");
        header.classList.remove("is-revealed");
        closeOpenMenus();
      } else if (accumulatedDelta < -DIRECTION_THRESHOLD) {
        header.classList.remove("is-hidden");
        header.classList.add("is-revealed");
      }

      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateHeader);
    };

    updateHeader();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
      header.classList.remove("is-scrolled", "is-hidden", "is-revealed");
    };
  }, []);

  return null;
}
