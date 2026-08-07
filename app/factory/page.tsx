import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "@/components/SiteUI";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Packaging Factory & Production Capabilities | DATANGXING",
  description: "Explore DATANGXING Packaging's Shenzhen production capabilities, Heidelberg printing, rigid-box assembly, automated equipment, quality controls and factory support.",
  alternates: { canonical: "/factory" },
};

const reasons = [
  ["01", "Audited manufacturing", "Company materials include SGS audit documentation and production qualification records."],
  ["02", "Source-factory communication", "Discuss structure, print, finishing and packing requirements directly with the production team."],
  ["03", "10+ years of experience", "Practical printing and packaging knowledge supports sampling, color control and mass production."],
  ["04", "Responsible material options", "FSC-certified paper options can be specified according to the project and target market."],
  ["05", "Design and sampling support", "Our team helps prepare practical artwork, structure and sample recommendations before production."],
  ["06", "Shenzhen delivery support", "Local coordination and export-ready packing help simplify collection and onward shipment."],
];

const productionStages = [
  {
    number: "01",
    eyebrow: "PRINTING",
    title: "Heidelberg press control for sharper details.",
    copy: "Modern offset printing equipment supports stable color, clear typography and repeatable brand presentation. Files, paper and finishing requirements are reviewed before production begins.",
    image: "/assets/factory/heidelberg-press-hd.jpg",
    alt: "Heidelberg offset press inside the DATANGXING packaging factory",
  },
  {
    number: "02",
    eyebrow: "RIGID-BOX ASSEMBLY",
    title: "Consistent forming for premium box structures.",
    copy: "Dedicated box-forming equipment improves alignment, corner accuracy and production consistency for book-style, magnetic and other premium rigid-box formats.",
    image: "/assets/factory/rigid-box-line-hd.jpg",
    alt: "Premium rigid box assembly line in the packaging workshop",
  },
  {
    number: "03",
    eyebrow: "QUALITY WORKFLOW",
    title: "Connected equipment with defined quality checkpoints.",
    copy: "Printing, finishing, assembly and inspection are coordinated in one workflow. Color, structure and packing checkpoints are confirmed before goods are released for shipment.",
    image: "/assets/factory/quality-workflow-hd.jpg",
    alt: "DATANGXING automated packaging production and quality workflow",
  },
];

const equipment = [
  ["Auto Plate Maker", "Prepress", "/assets/factory/auto-plate-maker.jpg"],
  ["Auto Paper Cutter", "Material preparation", "/assets/factory/auto-paper-cutter.jpg"],
  ["Heidelberg Press", "Offset printing", "/assets/factory/heidelberg-equipment.jpg"],
  ["Auto Coater", "Surface finishing", "/assets/factory/auto-coater.jpg"],
  ["Corrugated Laminator", "Board mounting", "/assets/factory/corrugated-laminator.jpg"],
  ["Auto Card Mounting", "Precision mounting", "/assets/factory/card-mounting.jpg"],
  ["Auto Die Cutter", "Shape conversion", "/assets/factory/die-cutter.jpg"],
  ["Premium Box Line", "Rigid-box forming", "/assets/factory/premium-box-equipment.jpg"],
  ["6-Color UV Press", "Labels and effects", "/assets/factory/uv-sticker-press.jpg"],
  ["Auto Foil Stamper", "Foil finishing", "/assets/factory/foil-stamper.jpg"],
  ["Auto UV Machine", "UV finishing", "/assets/factory/uv-machine.jpg"],
  ["Book-Style Assembly", "Box construction", "/assets/factory/book-style-assembly.jpg"],
];

export default function FactoryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DATANGXING Packaging Factory & Production Capabilities",
    url: absoluteUrl("/factory"),
    description: metadata.description,
    about: {
      "@type": "Organization",
      name: "Shenzhen Datangxing Printing & Packaging Co., Ltd.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Shenzhen",
        addressRegion: "Guangdong",
        addressCountry: "CN",
      },
    },
  };

  return (
    <main className="site factory-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="factory-hero">
        <div className="factory-hero-copy">
          <span>ONE-STOP PACKAGING PRODUCTION</span>
          <h1>A factory built for controlled, repeatable packaging.</h1>
          <p>From prepress and offset printing to finishing, rigid-box assembly and shipment inspection, each production stage is coordinated by one accountable team in Shenzhen.</p>
          <div className="factory-hero-actions">
            <Link href="/inquiry">Discuss Your Project</Link>
            <a href="#equipment">View Equipment</a>
          </div>
          <small>Source-factory communication · Quality checkpoints · Export-ready support</small>
        </div>
        <div className="factory-hero-media">
          <Image src="/assets/factory/factory-hero-hd.jpg" alt="Heidelberg printing press at DATANGXING Packaging" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
          <div><span>CORE PRINTING CAPABILITY</span><strong>Heidelberg offset production</strong></div>
        </div>
      </section>

      <section className="factory-proof" aria-label="Factory advantages">
        <div><strong>Source factory</strong><span>Direct project communication</span></div>
        <div><strong>Quality assurance</strong><span>Defined production checkpoints</span></div>
        <div><strong>Fair pricing</strong><span>Structure and finish optimized to brief</span></div>
        <div><strong>Delivery support</strong><span>Shenzhen coordination and export packing</span></div>
      </section>

      <section className="factory-assurance">
        <div className="factory-cert-image"><Image src="/assets/factory/certifications.jpg" alt="DATANGXING packaging manufacturing certificates and audit documents" fill sizes="(max-width: 900px) 100vw, 45vw" /></div>
        <div className="factory-assurance-copy">
          <span>WHY WORK WITH US</span>
          <h2>Production evidence, not vague promises.</h2>
          <p>Buyers need more than a finished sample. They need clear communication, traceable specifications and a production route that can be checked before shipment.</p>
          <div className="factory-reason-grid">
            {reasons.map(([number, title, copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <small>Certification availability and project-specific material claims are confirmed during quotation.</small>
        </div>
      </section>

      <section className="factory-production">
        <div className="factory-section-heading">
          <span>CORE PRODUCTION CAPABILITIES</span>
          <h2>Three connected stages. One quality standard.</h2>
          <p>Printing quality, box-forming accuracy and shipment readiness are managed as one production system.</p>
        </div>
        <div className="factory-stage-list">
          {productionStages.map((stage, index) => <article key={stage.number} className={index % 2 ? "reverse" : ""}>
            <div className="factory-stage-image"><Image src={stage.image} alt={stage.alt} fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
            <div className="factory-stage-copy"><b>{stage.number}</b><span>{stage.eyebrow}</span><h3>{stage.title}</h3><p>{stage.copy}</p></div>
          </article>)}
        </div>
      </section>

      <section className="factory-equipment" id="equipment">
        <div className="factory-section-heading light">
          <span>AUTOMATED PROCESS UPGRADE</span>
          <h2>Equipment aligned to each conversion step.</h2>
          <p>Automated prepress, printing, coating, mounting, die cutting, finishing and box assembly improve repeatability across production runs.</p>
        </div>
        <div className="factory-equipment-grid">
          {equipment.map(([name, process, image]) => <article key={name}>
            <div><Image src={image} alt={`${name} packaging production equipment`} fill sizes="(max-width: 900px) 50vw, 16vw" /></div>
            <span>{process}</span><h3>{name}</h3>
          </article>)}
        </div>
      </section>

      <section className="factory-trust">
        <div className="factory-trust-copy">
          <span>SELECTED CUSTOMER PORTFOLIO</span>
          <h2>Packaging experience across consumer categories.</h2>
          <p>Our supplied company material includes work for food, beverage, stationery, retail and lifestyle brands. Project details and references can be discussed according to confidentiality requirements.</p>
          <ul><li>Food and beverage</li><li>Retail and lifestyle</li><li>Stationery and gifting</li><li>Premium consumer products</li></ul>
        </div>
        <div className="factory-client-image"><Image src="/assets/factory/customer-logos.jpg" alt="Selected customer logos shown in DATANGXING company material" fill sizes="(max-width: 900px) 100vw, 45vw" /></div>
      </section>

      <section className="factory-showroom">
        <div className="factory-showroom-image"><Image src="/assets/factory/showroom.jpg" alt="DATANGXING packaging sample showroom and meeting room" fill sizes="(max-width: 900px) 100vw, 58vw" /></div>
        <div><span>FROM BRIEF TO PHYSICAL SAMPLE</span><h2>Review structures, finishes and real packaging references.</h2><p>Share your product, size, quantity and target market. We can recommend a practical structure and sampling path before mass production.</p><Link href="/inquiry">Send Your Requirements <b>→</b></Link></div>
      </section>

      <section className="factory-cta"><div><span>READY TO START?</span><h2>Bring us the brief. We’ll map the production route.</h2><p>Send dimensions, quantity, artwork and reference images for a production-minded recommendation.</p></div><Link href="/inquiry">Request a Custom Quote <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
