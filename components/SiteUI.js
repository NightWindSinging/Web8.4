import Image from "next/image";
import Link from "next/link";
import HeaderScrollBehavior from "./HeaderScrollBehavior";
import MobileNavigation from "./MobileNavigation";
import QuoteFormClient from "./QuoteFormClient";
import WhatsAppButton from "./WhatsAppButton";
import { getNavigationCategories } from "@/lib/cms/public-categories";

const fallbackPackagingTypes = [
  { name: "Rigid Gift Boxes", description: "Magnetic · Drawer · Shoulder", href: "/products/rigid-gift-boxes" },
  { name: "Folding Cartons", description: "Retail · Cosmetic · Electronics", href: "/products#folding-cartons" },
  { name: "Display Packaging", description: "Counter · POP · Presentation", href: "/products#display-packaging" },
  { name: "Paper Bags", description: "Retail · Gift · Promotional", href: "/products#paper-bags" },
];

const fallbackIndustries = ["Beauty & Cosmetics", "Food & Gifting", "Wine & Spirits", "Consumer Electronics", "Luxury Retail"].map((name) => ({ name, href: "/products" }));

function menuSummary(value) {
  if (!value) return "Explore custom packaging solutions";
  const summary = value.replace(/\s+/g, " ").trim();
  return summary.length > 54 ? `${summary.slice(0, 54)}…` : summary;
}

export function Brand({ inverse = false, href = "/concept-b" }) {
  return (
    <Link className="brand" href={href} aria-label="DATANGXING Packaging home">
      <span className="brand-mark"><Image src="/assets/datangxing-logo-2026.jpg" alt="大唐兴包装 DATANGXING Packaging logo" fill loading="eager" sizes="80px" /></span>
    </Link>
  );
}

export async function Header({ dark = false, standalone = false, ctaHref = "", variant = "modern" }) {
  const premiumMenu = true;
  const isModern = variant === "modern";
  const sectionPrefix = standalone ? "/concept-b" : "";
  const resolvedCtaHref = ctaHref || "/inquiry";
  const navigationCategories = await getNavigationCategories();
  const cmsPackagingTypes = navigationCategories.filter((category) => category.navigationGroup === "PACKAGING_TYPE").map((category) => ({
    name: category.name,
    description: menuSummary(category.description),
    href: `/category/products/${category.slug}`,
    image: category.navigationImage,
  }));
  const cmsIndustries = navigationCategories.filter((category) => category.navigationGroup === "INDUSTRY").map((category) => ({
    name: category.name,
    href: `/category/products/${category.slug}`,
    image: category.navigationImage,
  }));
  const packagingTypes = cmsPackagingTypes.length ? cmsPackagingTypes : fallbackPackagingTypes;
  const industries = cmsIndustries.length ? cmsIndustries : fallbackIndustries;
  const featured = [...cmsPackagingTypes, ...cmsIndustries].find((category) => category.image) || cmsPackagingTypes[0] || {
    name: "Premium rigid boxes",
    href: "/products/rigid-gift-boxes",
    image: "/assets/luxury-gift-box-square.jpg",
  };
  return (
    <header className={`site-header ${dark ? "dark" : ""} ${premiumMenu ? "mega-header" : ""} ${isModern ? "modern-header" : ""}`} data-scroll-header>
      <HeaderScrollBehavior />
      <Brand inverse={dark} />
      <nav className={premiumMenu ? "mega-nav" : ""} aria-label="Primary navigation">
        {premiumMenu ? (
          <details className="mega-nav-item">
            <summary className="mega-toggle" aria-haspopup="true">
              Products <span className="nav-chevron" aria-hidden="true" />
            </summary>
            <div className="mega-menu" aria-label="Products mega menu">
              <div className="mega-intro">
                <span>Custom packaging collection</span>
                <strong>Find the right structure for your brand.</strong>
                <p>Explore premium packaging by format, market and finishing requirement.</p>
                <Link href="/products">View all packaging <b>→</b></Link>
              </div>
              <div className="mega-column">
                <span>By packaging type</span>
                {packagingTypes.slice(0, 6).map((category) => <Link key={category.href} href={category.href}><strong>{category.name}</strong><small>{category.description}</small></Link>)}
              </div>
              <div className="mega-column compact-links">
                <span>By industry</span>
                {industries.slice(0, 6).map((category) => <Link key={`${category.href}-${category.name}`} href={category.href}>{category.name}</Link>)}
                <div className="mega-divider" />
                <span>Our expertise</span>
                <a href={`${sectionPrefix}#solutions`}>Structure & sampling</a>
                <a href={`${sectionPrefix}#solutions`}>Print & finishing</a>
              </div>
              <Link className="mega-feature" href={featured.href}>
                <span className="mega-feature-image"><Image src={featured.image || "/assets/luxury-gift-box-square.jpg"} alt={`${featured.name} custom packaging`} fill sizes="280px" /></span>
                <span className="mega-feature-copy"><small>Featured solution</small><strong>{featured.name}</strong><em>Explore this category →</em></span>
              </Link>
            </div>
          </details>
        ) : <a href="#products">Products</a>}
        <a href={isModern ? `${sectionPrefix}#products` : `${sectionPrefix}#solutions`}>{isModern ? "Industries" : "Solutions"}</a>
        {isModern && <a href={`${sectionPrefix}#solutions`}>Capabilities</a>}
        {isModern ? <Link href="/factory">Factory</Link> : <a href={`${sectionPrefix}#factory`}>Factory</a>}
        {isModern ? <><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link></> : <><a href={`${sectionPrefix}#about`}>About</a><Link href="/contact">Contact</Link></>}
      </nav>
      {isModern && <MobileNavigation sectionPrefix={sectionPrefix} products={packagingTypes} ctaHref={resolvedCtaHref} />}
      <a className="header-cta" href={resolvedCtaHref}>Get a Quote <span>↗</span></a>
    </header>
  );
}

export function SectionTitle({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-title ${align}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function Img({ src, alt, className = "" }) {
  return <div className={`image-shell ${className}`}><Image src={src} alt={alt} fill loading="eager" sizes="(max-width: 900px) 100vw, 50vw" /></div>;
}

export function QuoteForm({ compact = false, dark = false }) {
  return <QuoteFormClient compact={compact} dark={dark} />;
}

export const products = [
  { name: "Rigid Gift Boxes", tag: "Premium / Magnetic / Drawer", image: "/assets/luxury-gift-box.jpg" },
  { name: "Folding Cartons", tag: "Retail / Cosmetics / Electronics", image: "/assets/retail-cartons.jpg" },
  { name: "Display Boxes", tag: "Counter / Retail / POP", image: "/assets/display-carton.jpg" },
  { name: "Paper Bags", tag: "Retail / Festival / Corporate", image: "/assets/festival-paper-bag.jpg" },
];

export const steps = [
  ["01", "Share your brief", "Send dimensions, quantity, artwork or a reference sample."],
  ["02", "Engineer & sample", "We optimize structure, material and finishing for approval."],
  ["03", "Produce & inspect", "Printing, finishing, assembly and QC managed in one workflow."],
  ["04", "Pack & deliver", "Export-ready packing and coordinated global shipment."],
];

export function Footer({ dark = false }) {
  return (
    <>
      <footer className={dark ? "dark" : ""}>
        <Brand inverse={dark} />
        <div><strong>Custom Paper Packaging</strong><Link href="/products/rigid-gift-boxes">Rigid Boxes</Link><Link href="/products#folding-cartons">Folding Cartons</Link><Link href="/products#paper-bags">Paper Bags</Link></div>
        <div><strong>Company</strong><a href="/concept-b#about">About Us</a><Link href="/factory">Factory</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact Lynn</Link><Link href="/inquiry">Start an Inquiry</Link></div>
        <div className="footer-contact"><strong>Let’s build better packaging.</strong><a href="mailto:lynn05052002@gmail.com">lynn05052002@gmail.com</a><span>Shenzhen, Guangdong, China</span></div>
        <small>© 2026 Shenzhen Datangxing Printing & Packaging Co., Ltd.</small>
      </footer>
      <WhatsAppButton />
    </>
  );
}
