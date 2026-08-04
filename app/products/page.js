import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "../../components/SiteUI";
import { productCatalog } from "../../data/siteContent";

export const metadata = {
  title: "Custom Paper Packaging Products | DATANGXING",
  description: "Explore custom rigid boxes, folding cartons, display packaging, paper bags and industry packaging solutions from DATANGXING Packaging.",
};

export default function ProductsPage() {
  const schema = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: productCatalog.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: product.href })) };
  return (
    <main className="site products-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="products-hub-hero">
        <div><span>CUSTOM PAPER PACKAGING</span><h1>Packaging structures<br />for every brand experience.</h1></div>
        <p>Explore premium boxes, retail cartons, displays and bags. Every format can be customized around your product, quantity, market and target cost.</p>
      </section>

      <nav className="product-jump-nav" aria-label="Product categories">
        <a href="#rigid-gift-boxes">Rigid boxes</a><a href="#folding-cartons">Folding cartons</a><a href="#display-packaging">Displays</a><a href="#paper-bags">Paper bags</a><a href="#industry-solutions">Industry solutions</a>
      </nav>

      <section className="featured-product">
        <div className="featured-product-image"><Image src="/assets/luxury-gift-box-square.jpg" alt="Featured premium custom rigid gift box" fill priority sizes="700px" /></div>
        <div><span>FEATURED STRUCTURE</span><h2>Custom Rigid Gift Boxes</h2><p>Create a premium opening experience with magnetic, drawer, shoulder-neck or book-style structures. Add custom inserts, specialty paper and focused finishing.</p><ul><li>Structure and insert engineering</li><li>Low-volume sampling support</li><li>Export-ready production and packing</li></ul><Link href="/products/rigid-gift-boxes">Explore Rigid Boxes <b>→</b></Link></div>
      </section>

      <section className="products-catalog" id="industry-solutions">
        <div className="catalog-head"><div><span>FULL COLLECTION</span><h2>Find the right packaging format.</h2></div><p>Start with a structure, then customize dimensions, material, printing, finish and inserts.</p></div>
        <div className="catalog-grid">
          {productCatalog.map((product) => <article key={product.slug} id={product.slug}>
            <Link className="catalog-image" href={product.href}><Image src={product.image} alt={product.alt} fill sizes="320px" /></Link>
            <div className="catalog-card-head"><span>{product.category}</span><Link href={product.href}>↗</Link></div>
            <h3><Link href={product.href}>{product.name}</Link></h3><p>{product.summary}</p>
            <div className="catalog-tags">{product.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
          </article>)}
        </div>
      </section>

      <section className="products-cta"><div><span>CAN’T FIND THE EXACT STRUCTURE?</span><h2>We engineer packaging around the product.</h2><p>Send dimensions, quantity and a reference image. We’ll recommend a practical structure and sampling route.</p></div><Link href="/inquiry">Discuss Your Project <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
