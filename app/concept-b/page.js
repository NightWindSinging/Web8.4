import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "../../components/SiteUI";
import WhatsAppButton from "../../components/WhatsAppButton";

const capabilities = [
  { title: "Display Packaging", copy: "Retail-ready structures", image: "/assets/display-carton.jpg", href: "/products#display-packaging" },
  { title: "Rigid Gift Boxes", copy: "Magnetic · drawer · custom", image: "/assets/tech-rigid-box.jpg", href: "/products/rigid-gift-boxes" },
  { title: "Wine & Spirits", copy: "Premium protection + finish", image: "/assets/wine-spirits-red-beige.jpg", href: "/products" },
  { title: "Branded Gift Sets", copy: "Presentation-led unboxing", image: "/assets/luxury-gift-box-square.jpg", href: "/products" },
];

const steps = [
  ["01", "Share your brief", "Product, size, quantity and target market."],
  ["02", "Engineer & sample", "Structure, materials and finish validation."],
  ["03", "Approve & produce", "Color control, inspection and documentation."],
  ["04", "Pack & deliver", "Export-ready packing and shipment support."],
];

export default function ConceptB() {
  return (
    <main className="site concept-b wb2b-home">
      <Header variant="modern" />

      <section className="wb2b-hero">
        <div className="wb2b-hero-copy">
          <span>Custom paper packaging manufacturer</span>
          <h1>Built to spec.<br />Ready for market.</h1>
          <p>From structural engineering and sampling to mass production and global shipment — one accountable packaging partner.</p>
          <div className="wb2b-actions">
            <Link className="primary" href="/inquiry">Request a fast quote</Link>
            <a href="#solutions">Explore capabilities</a>
          </div>
          <small>Replies within 1 business day · Files kept confidential</small>
        </div>
        <Link className="wb2b-featured" href="/products/rigid-gift-boxes">
          <span className="wb2b-featured-image"><Image src="/assets/tech-rigid-box.jpg" alt="Custom technology rigid gift box with branded paper bag" fill loading="eager" sizes="(max-width: 900px) 100vw, 48vw" /></span>
          <span className="wb2b-featured-copy"><small>Featured build</small><strong>Custom rigid box + branded paper bag</strong></span>
        </Link>
        <div className="wb2b-proof" aria-label="Company capabilities">
          <div><strong>20+</strong><span>Specialists</span></div>
          <div><strong>OEM / ODM</strong><span>Custom engineering</span></div>
          <div><strong>4 steps</strong><span>Brief to delivery</span></div>
          <div><strong>Global</strong><span>Export support</span></div>
        </div>
      </section>

      <section className="wb2b-products" id="products">
        <div className="wb2b-section-heading">
          <span>Product capabilities</span>
          <h2>Choose a structure. We’ll engineer the details.</h2>
          <p>Rigid boxes, folding cartons, displays and paper bags configured for your brand, channel and target cost.</p>
        </div>
        <div className="wb2b-product-grid">
          {capabilities.map((item) => (
            <Link href={item.href} key={item.title}>
              <span className="wb2b-product-image"><Image src={item.image} alt={`${item.title} custom paper packaging`} fill sizes="(max-width: 700px) 100vw, 25vw" /></span>
              <strong>{item.title}</strong><small>{item.copy}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="wb2b-process" id="solutions">
        <div className="wb2b-section-heading">
          <span>A clearer sourcing process</span>
          <h2>Four checkpoints. No guesswork.</h2>
        </div>
        <div className="wb2b-process-grid">
          {steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="wb2b-quote" id="factory">
        <div><span>Start with the essentials</span><h2>A production-minded quote.</h2><p>Send packaging type, dimensions and quantity. Our team will reply within one business day.</p></div>
        <form action="/inquiry" method="get">
          <label><span>Packaging type</span><input name="product" placeholder="Packaging type" aria-label="Packaging type" /></label>
          <label><span>Estimated quantity</span><input name="quantity" placeholder="Estimated quantity" inputMode="numeric" aria-label="Estimated quantity" /></label>
          <label className="wide"><span>Work email</span><input name="email" type="email" placeholder="Work email" aria-label="Work email" required /></label>
          <button type="submit">Request custom quote <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
      </section>

      <footer className="wb2b-footer">
        <Link href="/concept-b" className="wb2b-footer-logo"><Image src="/assets/datangxing-logo-2026.jpg" alt="大唐兴包装 DATANGXING Packaging" fill sizes="110px" /></Link>
        <nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link><span>© 2026 Datangxing Packaging</span></nav>
      </footer>
      <WhatsAppButton />
    </main>
  );
}
