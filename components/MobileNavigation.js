"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MobileNavigation({ sectionPrefix = "", products = [], ctaHref = "/inquiry" }) {
  const [open, setOpen] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOutside = (event) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    document.body.classList.toggle("mobile-menu-open", open);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      document.body.classList.remove("mobile-menu-open");
    };
  }, [open]);

  return (
    <div ref={navigationRef} className={`mobile-navigation ${open ? "is-open" : ""}`}>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-primary-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <div id="mobile-primary-navigation" className="mobile-nav-panel" role="navigation" aria-label="Mobile navigation">
        <div className="mobile-nav-primary">
          <Link href="/products" onClick={() => setOpen(false)}>Products <span>01</span></Link>
          <a href={`${sectionPrefix}#products`} onClick={() => setOpen(false)}>Industries <span>02</span></a>
          <a href={`${sectionPrefix}#solutions`} onClick={() => setOpen(false)}>Capabilities <span>03</span></a>
          <Link href="/factory" onClick={() => setOpen(false)}>Factory <span>04</span></Link>
          <Link href="/blog" onClick={() => setOpen(false)}>Blog <span>05</span></Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact <span>06</span></Link>
        </div>

        {products.length ? (
          <div className="mobile-nav-products">
            <small>Popular packaging</small>
            <div>{products.slice(0, 4).map((product) => (
              <Link key={product.href} href={product.href} onClick={() => setOpen(false)}>{product.name}</Link>
            ))}</div>
          </div>
        ) : null}

        <a className="mobile-nav-cta" href={ctaHref} onClick={() => setOpen(false)}>
          Get a Quote <span>↗</span>
        </a>
      </div>
    </div>
  );
}
