import { Footer, Header, Img, products, QuoteForm, SectionTitle } from "../../components/SiteUI";

const finishes = ["Hot Foil", "Embossing", "Spot UV", "Textured Paper", "Custom Inserts", "Magnetic Closure"];

export default function ConceptB() {
  return (
    <main className="site concept-b">
      <Header />
      <section className="b-hero">
        <div className="b-hero-copy"><span>SHENZHEN · CUSTOM MADE · GLOBAL DELIVERY</span><h1>We turn packaging<br />into a brand experience.</h1><p>Thoughtful structure, refined materials and precise finishing for premium gift, cosmetic, retail and seasonal packaging.</p><div><a href="#quote">Create Your Packaging</a><a href="#collection">View Collection →</a></div></div>
        <div className="b-hero-image"><Img src="/assets/white-rigid-boxes.jpg" alt="Minimal white premium rigid boxes" /><span>Custom rigid packaging / 2026 collection</span></div>
      </section>

      <section className="b-intro"><span>01 / OUR APPROACH</span><h2>Not just a box.<br />A tactile expression of your brand.</h2><p>DATANGXING brings structure, printing, finishing and production together so every packaging detail feels deliberate—and every order remains practical to manufacture.</p></section>

      <section className="b-collection" id="collection">
        <div className="b-collection-head"><SectionTitle eyebrow="SELECTED WORK" title="Packaging with presence." /><a href="#quote">Discuss a similar project ↗</a></div>
        <div className="editorial-grid">
          <article><Img src="/assets/heart-gift-boxes-square.jpg" alt="Colorful custom gift packaging collection" /><h3>Retail & Gift Collections</h3><span>Rigid box · Printed paper · Seasonal editions</span></article>
          <article><Img src="/assets/liquor-box-square.jpg" alt="Luxury liquor presentation box" /><h3>Wine & Spirits</h3><span>Premium board · Foil · Textured finish</span></article>
          <article><Img src="/assets/moon-cake-box-square.jpg" alt="Layered moon cake gift box" /><h3>Food Gifting</h3><span>Drawer structure · Inserts · Carry bag</span></article>
        </div>
      </section>

      <section className="b-craft" id="solutions">
        <div><span>02 / MATERIAL & CRAFT</span><h2>Details customers can see—and feel.</h2><p>Choose a finish that strengthens your story, then let our team engineer it for repeatable production.</p><div className="finish-list">{finishes.map((f,i)=><span key={f}><b>0{i+1}</b>{f}</span>)}</div></div>
        <Img src="/assets/premium-wine-box.jpg" alt="Premium fabric wrapped wine packaging" />
      </section>

      <section className="b-service" id="factory">
        <SectionTitle eyebrow="FROM CONCEPT TO DELIVERY" title="One attentive team. Every production stage." align="center" />
        <div className="service-row"><article><span>01</span><h3>Consult</h3><p>Align product, target price, quantity and launch timing.</p></article><article><span>02</span><h3>Design & sample</h3><p>Refine structure, material and finish before production.</p></article><article><span>03</span><h3>Produce & inspect</h3><p>Coordinate printing, finishing, assembly and quality control.</p></article><article><span>04</span><h3>Deliver</h3><p>Prepare export packing and shipment documentation.</p></article></div>
      </section>

      <section className="b-founder" id="about"><Img src="/assets/founder.jpg" alt="Datangxing Packaging founder" /><div><span>FOUNDER-LED SERVICE</span><blockquote>“Good packaging should protect the product, express the brand and remain realistic to produce.”</blockquote><p>Our 20+ person specialist team works closely with importers, distributors and brand owners from first brief to final shipment.</p><strong>DATANGXING PACKAGING · SHENZHEN</strong></div></section>

      <section className="b-quote"><div><span>LET’S MAKE SOMETHING MEMORABLE</span><h2>Your next packaging project starts with a conversation.</h2><p>Share your idea, reference image or dieline. We’ll reply within one business day.</p></div><QuoteForm compact /></section>
      <Footer />
    </main>
  );
}
