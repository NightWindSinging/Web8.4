import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "../../../components/SiteUI";
import { productCatalog } from "../../../data/siteContent";

const related = productCatalog.slice(1, 4);

export const metadata = {
  title: "Custom Rigid Gift Boxes Manufacturer | DATANGXING",
  description: "Custom magnetic, drawer and shoulder-neck rigid gift boxes with inserts, premium paper and finishing for global B2B buyers.",
};

export default function RigidGiftBoxesPage() {
  const schema = { "@context": "https://schema.org", "@type": "Product", name: "Custom Rigid Gift Boxes", description: "Custom magnetic, drawer and shoulder-neck rigid gift boxes for premium products.", brand: { "@type": "Brand", name: "DATANGXING Packaging" }, manufacturer: { "@type": "Organization", name: "DATANGXING Packaging" } };
  return (
    <main className="site product-detail-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="product-detail-hero">
        <div className="product-gallery"><div className="product-main-image"><Image src="/assets/luxury-gift-box-square.jpg" alt="Premium custom rigid gift box with illuminated insert" fill priority sizes="620px" /></div><div className="product-thumbnails"><div><Image src="/assets/white-rigid-boxes.jpg" alt="White rigid box structure examples" fill sizes="280px" /></div><div><Image src="/assets/tech-rigid-box.jpg" alt="Creative rigid gift box for electronics" fill sizes="280px" /></div></div></div>
        <div className="product-detail-copy"><div className="detail-breadcrumb"><Link href="/products">Products</Link><span>/</span><b>Rigid Gift Boxes</b></div><span className="detail-eyebrow">PREMIUM CUSTOM PACKAGING</span><h1>Custom Rigid<br />Gift Boxes</h1><p>High-impact presentation boxes engineered for your product, opening experience and production quantity.</p><div className="detail-tags"><span>Magnetic closure</span><span>Drawer box</span><span>Shoulder-neck</span><span>Custom inserts</span></div><Link className="detail-primary-cta" href="/inquiry">Request a Custom Quote <b>→</b></Link><small>Typical response within one business day.</small>
          <dl><div><dt>Customization</dt><dd>Size, structure, material, print and finish</dd></div><div><dt>Sampling</dt><dd>Blank prototype and printed sample options</dd></div><div><dt>Delivery</dt><dd>Export packing and global shipment coordination</dd></div></dl>
        </div>
      </section>

      <section className="detail-intro"><span>01 / PRODUCT OVERVIEW</span><h2>A premium structure built around the product.</h2><p>Rigid boxes combine strong board with printed or specialty paper wraps. We engineer the opening, insert and assembly method together so the final package feels considered and remains practical to produce.</p></section>

      <section className="structure-options"><div className="detail-section-head"><span>POPULAR STRUCTURES</span><h2>Choose the opening experience.</h2></div><div className="structure-grid"><article><b>01</b><h3>Magnetic Book Box</h3><p>Clean presentation with a hinged lid and concealed magnetic closure.</p></article><article><b>02</b><h3>Drawer Box</h3><p>A sleeve-and-tray structure that creates a deliberate reveal.</p></article><article><b>03</b><h3>Shoulder-Neck Box</h3><p>Premium lift-off construction with a visible or concealed inner shoulder.</p></article></div></section>

      <section className="detail-specs"><div><span>02 / CUSTOMIZATION</span><h2>Materials and finishes that support the brand.</h2><p>Our team helps balance visual impact, durability, production complexity and target cost.</p><Link href="/inquiry">Send Your Requirements <b>↗</b></Link></div><dl><div><dt>Board</dt><dd>Greyboard in multiple thicknesses</dd></div><div><dt>Wrap</dt><dd>Printed paper, kraft, textured and specialty paper</dd></div><div><dt>Printing</dt><dd>CMYK, Pantone and metallic ink</dd></div><div><dt>Finishing</dt><dd>Foil, embossing, debossing, spot UV and lamination</dd></div><div><dt>Insert</dt><dd>Paperboard, EVA, foam, pulp and fabric-wrapped options</dd></div><div><dt>Accessories</dt><dd>Ribbon, handles, magnets, sleeves and bags</dd></div></dl></section>

      <section className="detail-process"><div className="detail-section-head"><span>FROM BRIEF TO DELIVERY</span><h2>A controlled custom process.</h2></div><ol><li><b>01</b><strong>Brief</strong><span>Product, quantity, budget and timing</span></li><li><b>02</b><strong>Engineer</strong><span>Structure, material and insert plan</span></li><li><b>03</b><strong>Sample</strong><span>Fit, artwork and finish approval</span></li><li><b>04</b><strong>Produce</strong><span>Printing, assembly and inspection</span></li></ol></section>

      <section className="detail-faq"><div><span>COMMON QUESTIONS</span><h2>Rigid box FAQ</h2></div><div><details><summary>What information is needed for a quote?</summary><p>Send the product dimensions, target quantity, box style, printing, finishing, insert requirements and destination market.</p></details><details><summary>Can you make a custom insert?</summary><p>Yes. Inserts can be engineered around the product using paperboard, EVA, foam, molded pulp or fabric-wrapped materials.</p></details><details><summary>Can I approve a sample before production?</summary><p>Yes. We can prepare structural prototypes and printed samples depending on the project stage and required validation.</p></details></div></section>

      <section className="related-products"><div className="detail-section-head"><span>EXPLORE MORE</span><h2>Related packaging formats.</h2></div><div>{related.map((product) => <article key={product.slug}><Link href={product.href}><span><Image src={product.image} alt={product.alt} fill sizes="360px" /></span><h3>{product.name}</h3><p>{product.summary}</p></Link></article>)}</div></section>
      <Footer />
    </main>
  );
}
