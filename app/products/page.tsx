import Link from "next/link";
import { Footer, Header } from "@/components/SiteUI";
import { getPublishedProducts, productExcerpt, productImages, productSpecifications } from "@/lib/cms/public-products";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;

export const metadata = {
  title: "Custom Paper Packaging Products | DATANGXING",
  description: "Explore custom rigid boxes, folding cartons, display packaging, paper bags and industry packaging solutions from DATANGXING Packaging.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();
  const cards = products.map((product) => {
    const images = productImages(product);
    const specs = productSpecifications(product.specifications);
    return {
      ...product,
      image: images.main,
      summary: productExcerpt(product.description) || "Custom paper packaging engineered for your product and target market.",
      tags: product.keywords.slice(0, 3).length ? product.keywords.slice(0, 3) : specs.slice(0, 3).map((row) => row.name),
      href: `/products/${product.slug}`,
    };
  });
  const [featured] = cards;
  const categories = [...new Map(cards.filter((product) => product.category).map((product) => [product.category!.slug, product.category!.name])).entries()];
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DATANGXING Custom Packaging Products",
    itemListElement: cards.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(product.href),
    })),
  };

  return (
    <main className="site products-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="products-hub-hero">
        <div><span>CUSTOM PAPER PACKAGING</span><h1>Packaging structures<br />for every brand experience.</h1></div>
        <p>Explore premium boxes, retail cartons, displays and bags. Every format can be customized around your product, quantity, market and target cost.</p>
      </section>

      <nav className="product-jump-nav" aria-label="Product categories">
        {categories.map(([slug, name]) => <Link key={slug} href={`/category/products/${slug}`}>{name}</Link>)}
        <Link href="/category">All categories</Link>
      </nav>

      {featured ? <section className="featured-product">
        <Link className="featured-product-image" href={featured.href}><img src={featured.image} alt={featured.name} fetchPriority="high" /></Link>
        <div><span>FEATURED PRODUCT</span><h2>{featured.name}</h2><p>{featured.summary}</p>{featured.tags.length ? <ul>{featured.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul> : null}<Link href={featured.href}>Explore Product <b>→</b></Link></div>
      </section> : null}

      <section className="products-catalog">
        <div className="catalog-head"><div><span>FULL COLLECTION</span><h2>Find the right packaging format.</h2></div><p>Start with a structure, then customize dimensions, material, printing, finish and inserts.</p></div>
        {cards.length ? <div className="catalog-grid">
          {cards.map((product) => <article key={product.id} id={product.slug}>
            <Link className="catalog-image" href={product.href}><img src={product.image} alt={product.name} loading="lazy" /></Link>
            <div className="catalog-card-head"><span>{product.category?.name || "Custom Packaging"}</span><Link href={product.href}>↗</Link></div>
            <h3><Link href={product.href}>{product.name}</Link></h3><p>{product.summary}</p>
            {product.tags.length ? <div className="catalog-tags">{product.tags.map((tag) => <small key={tag}>{tag}</small>)}</div> : null}
          </article>)}
        </div> : <div className="cms-empty-state"><span>PRODUCTS</span><h2>Our product collection is being updated.</h2><p>Published CMS products will appear here automatically.</p></div>}
      </section>

      <section className="products-cta"><div><span>CAN’T FIND THE EXACT STRUCTURE?</span><h2>We engineer packaging around the product.</h2><p>Send dimensions, quantity and a reference image. We’ll recommend a practical structure and sampling route.</p></div><Link href="/inquiry">Discuss Your Project <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
