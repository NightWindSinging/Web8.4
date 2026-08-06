import Link from "next/link";
import { Footer, Header } from "@/components/SiteUI";
import { getPublicCategories } from "@/lib/cms/public-categories";

export const revalidate = 300;

export const metadata = {
  title: "Packaging Product & Article Categories | DATANGXING",
  description: "Browse DATANGXING custom packaging products and practical buyer guides by category.",
  alternates: { canonical: "/category" },
};

export default async function CategoryIndexPage() {
  const categories = await getPublicCategories();
  const articleCategories = categories.filter((category) => category.type === "ARTICLE");
  const productCategories = categories.filter((category) => category.type === "PRODUCT");

  return <main className="site category-page">
    <Header standalone />
    <section className="category-hero"><span>CONTENT DIRECTORY</span><h1>Browse packaging by category.</h1><p>Explore product collections and practical resources organized around how global buyers research custom packaging.</p></section>
    <section className="category-groups">
      <div className="category-group"><div className="category-group-head"><span>PRODUCT CATEGORIES</span><h2>Packaging collections</h2></div>{productCategories.length ? <div className="category-card-grid">{productCategories.map((category) => <Link key={category.id} href={`/category/products/${category.slug}`}><span>{category._count.products} {category._count.products === 1 ? "product" : "products"}</span><h3>{category.name}</h3><p>{category.description || "Explore published custom packaging products in this collection."}</p><b>View collection →</b></Link>)}</div> : <p className="category-empty">No published product categories yet.</p>}</div>
      <div className="category-group"><div className="category-group-head"><span>ARTICLE CATEGORIES</span><h2>Insights and buyer guides</h2></div>{articleCategories.length ? <div className="category-card-grid">{articleCategories.map((category) => <Link key={category.id} href={`/category/articles/${category.slug}`}><span>{category._count.articles} {category._count.articles === 1 ? "article" : "articles"}</span><h3>{category.name}</h3><p>{category.description || "Read practical packaging guidance in this topic."}</p><b>Explore articles →</b></Link>)}</div> : <p className="category-empty">No published article categories yet.</p>}</div>
    </section>
    <Footer />
  </main>;
}
