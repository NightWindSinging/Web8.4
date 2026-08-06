import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/SiteUI";
import { getPublicCategories, getPublicProductCategory } from "@/lib/cms/public-categories";
import { productExcerpt, productImages, productSpecifications } from "@/lib/cms/public-products";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getPublicCategories();
  return categories.filter((category) => category.type === "PRODUCT").map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicProductCategory(slug);
  if (!category) return { title: "Category not found | DATANGXING", robots: { index: false } };
  const description = category.description || `Explore DATANGXING custom packaging products in the ${category.name} collection.`;
  return { title: `${category.name} Custom Packaging | DATANGXING`, description, alternates: { canonical: `/category/products/${category.slug}` } };
}

export default async function ProductCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getPublicProductCategory(slug);
  if (!category) notFound();
  const products = category.products.map((product) => ({ ...product, image: productImages(product).main, summary: productExcerpt(product.description), tags: product.keywords.slice(0, 3).length ? product.keywords.slice(0, 3) : productSpecifications(product.specifications).slice(0, 3).map((row) => row.name) }));
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: category.name, description: category.description, url: absoluteUrl(`/category/products/${category.slug}`), mainEntity: { "@type": "ItemList", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: absoluteUrl(`/products/${product.slug}`) })) } };

  return <main className="site products-page category-archive-page">
    <Header standalone />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="category-hero"><div className="archive-breadcrumb"><Link href="/category">Categories</Link><span>/</span><Link href="/products">Products</Link></div><span>PRODUCT CATEGORY</span><h1>{category.name}</h1><p>{category.description || "Custom paper packaging solutions engineered around your product and target market."}</p></section>
    <section className="products-catalog"><div className="catalog-head"><div><span>PUBLISHED PRODUCTS</span><h2>{products.length} {products.length === 1 ? "product" : "products"} in this collection.</h2></div></div>{products.length ? <div className="catalog-grid">{products.map((product) => <article key={product.id}><Link className="catalog-image" href={`/products/${product.slug}`}><img src={product.image} alt={product.name} loading="lazy" /></Link><div className="catalog-card-head"><span>{category.name}</span><Link href={`/products/${product.slug}`}>↗</Link></div><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3><p>{product.summary || "Custom packaging configured for your product and market."}</p>{product.tags.length ? <div className="catalog-tags">{product.tags.map((tag) => <small key={tag}>{tag}</small>)}</div> : null}</article>)}</div> : <div className="cms-empty-state"><h2>No published products yet.</h2><p>New CMS products in this category will appear automatically.</p></div>}</section>
    <Footer />
  </main>;
}
