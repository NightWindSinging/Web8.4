import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/SiteUI";
import { getPublishedProduct, getPublishedProducts, productExcerpt, productImages, productSpecifications } from "@/lib/cms/public-products";
import { resolveCanonicalUrl } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) return { title: "Product not found | DATANGXING Packaging", robots: { index: false } };
  const description = product.seoDescription || productExcerpt(product.description);
  const image = productImages(product).main;
  const canonical = resolveCanonicalUrl(product.canonicalUrl, `/products/${product.slug}`);
  return {
    title: product.seoTitle || `${product.name} | DATANGXING Packaging`,
    description,
    keywords: product.keywords,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title: product.seoTitle || product.name, description, images: image ? [image] : [] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);
  if (!product) notFound();
  const images = productImages(product);
  const specs = productSpecifications(product.specifications);
  const summary = productExcerpt(product.description) || "Custom packaging engineered around your product, brand and production requirements.";
  const canonical = resolveCanonicalUrl(product.canonicalUrl, `/products/${product.slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || summary,
    image: [images.main, ...images.gallery.map((image) => image.url)].map(absoluteUrl),
    url: canonical,
    category: product.category?.name,
    brand: { "@type": "Brand", name: "DATANGXING Packaging" },
    manufacturer: { "@type": "Organization", name: "DATANGXING Packaging" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Products", item: absoluteUrl("/products") },
      ...(product.category ? [{ "@type": "ListItem", position: 2, name: product.category.name, item: absoluteUrl(`/category/products/${product.category.slug}`) }] : []),
      { "@type": "ListItem", position: product.category ? 3 : 2, name: product.name, item: canonical },
    ],
  };

  return (
    <main className="site product-detail-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <section className="product-detail-hero">
        <div className="product-gallery">
          <div className="product-main-image"><img src={images.main} alt={product.mainImageMedia?.alt || product.name} fetchPriority="high" /></div>
          {images.gallery.length ? <div className="product-thumbnails">{images.gallery.slice(0, 2).map((image) => <div key={image.url}><img src={image.url} alt={image.alt} loading="lazy" /></div>)}</div> : null}
        </div>
        <div className="product-detail-copy">
          <div className="detail-breadcrumb"><Link href="/products">Products</Link>{product.category ? <><span>/</span><Link href={`/category/products/${product.category.slug}`}>{product.category.name}</Link></> : null}</div>
          <span className="detail-eyebrow">CUSTOM PAPER PACKAGING</span><h1>{product.name}</h1><p>{summary}</p>
          {product.keywords.length ? <div className="detail-tags">{product.keywords.slice(0, 4).map((keyword) => <span key={keyword}>{keyword}</span>)}</div> : null}
          <Link className="detail-primary-cta" href={`/inquiry?product=${encodeURIComponent(product.name)}`}>Request a Custom Quote <b>→</b></Link><small>Typical response within one business day.</small>
          {specs.length ? <dl>{specs.slice(0, 3).map((row) => <div key={row.name}><dt>{row.name}</dt><dd>{row.value}</dd></div>)}</dl> : null}
        </div>
      </section>

      {product.description ? <section className="detail-intro cms-product-description"><span>01 / PRODUCT OVERVIEW</span><h2>Product details and customization.</h2><div className="cms-rich-content" dangerouslySetInnerHTML={{ __html: product.description }} /></section> : null}
      {specs.length ? <section className="detail-specs"><div><span>02 / SPECIFICATIONS</span><h2>Product parameters.</h2><p>Final specifications can be adjusted around your product, order quantity and target market.</p><Link href="/inquiry">Send Your Requirements <b>↗</b></Link></div><dl>{specs.map((row) => <div key={row.name}><dt>{row.name}</dt><dd>{row.value}</dd></div>)}</dl></section> : null}
      {images.gallery.length > 2 ? <section className="cms-product-gallery"><div className="detail-section-head"><span>PRODUCT GALLERY</span><h2>More product views.</h2></div><div>{images.gallery.slice(2).map((image) => <figure key={image.url}><img src={image.url} alt={image.alt} loading="lazy" /></figure>)}</div></section> : null}
      <section className="products-cta"><div><span>START A CUSTOM PROJECT</span><h2>Need this packaging adapted to your product?</h2><p>Send dimensions, quantity, artwork and target market for a practical recommendation.</p></div><Link href={`/inquiry?product=${encodeURIComponent(product.name)}`}>Discuss Your Project <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
