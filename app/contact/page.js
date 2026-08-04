import { Footer, Header, QuoteForm } from "../../components/SiteUI";

const osmEmbed = "https://www.openstreetmap.org/export/embed.html?bbox=114.1200%2C22.6200%2C114.3600%2C22.8200&layer=mapnik&marker=22.7230369%2C114.2426561";
const osmLink = "https://www.openstreetmap.org/?mlat=22.7230369&mlon=114.2426561#map=12/22.7230369/114.2426561";

export const metadata = {
  title: "Contact DATANGXING Packaging | Shenzhen, China",
  description: "Contact DATANGXING Packaging in Longgang, Shenzhen for custom paper packaging, samples and export quotations.",
};

export default function ContactPage() {
  return (
    <main className="site contact-page">
      <Header standalone />

      <section className="contact-hero">
        <div>
          <span>CONTACT · SHENZHEN</span>
          <h1>Let’s create packaging<br />worth remembering.</h1>
        </div>
        <p>Tell us what you are building, your quantity and launch timeline. Our packaging team will respond with practical next steps within one business day.</p>
      </section>

      <section className="contact-map-section">
        <div className="contact-map-frame">
          <iframe
            src={osmEmbed}
            title="DATANGXING Packaging location on OpenStreetMap"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-location-chip"><span>REGIONAL LOCATION</span><strong>Longgang District · Shenzhen</strong></div>
          <div className="map-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></div>
        </div>

        <aside className="contact-address-card">
          <span>VISIT OUR TEAM</span>
          <h2>Shenzhen<br />DATANGXING Packaging</h2>
          <div className="address-block">
            <small>公司地址</small>
            <strong>中国广东省深圳市龙岗区宝龙街道<br />同德社区浪背村50号</strong>
          </div>
          <div className="address-block english">
            <small>Address</small>
            <p>No. 50, Langbei Village, Tongde Community,<br />Baolong Subdistrict, Longgang District,<br />Shenzhen, Guangdong, China</p>
          </div>
          <p className="map-scope-note">Map marker indicates Longgang District center. The written address above is the company’s full visiting address.</p>
          <a className="map-open-link" href={osmLink} target="_blank" rel="noreferrer">Open in OpenStreetMap <b>↗</b></a>
        </aside>
      </section>

      <section className="contact-details">
        <article><span>01</span><small>EMAIL</small><a href="mailto:lynn05052002@gmail.com">lynn05052002@gmail.com</a><p>Send references, dielines or product dimensions.</p></article>
        <article><span>02</span><small>RESPONSE TIME</small><strong>Within 24 hours</strong><p>Monday to Saturday · China Standard Time.</p></article>
        <article><span>03</span><small>WHAT TO INCLUDE</small><strong>Size · Quantity · Finish</strong><p>These details help us prepare a useful first reply.</p></article>
      </section>

      <section className="contact-quote" id="quote">
        <div className="contact-quote-copy"><span>START A PROJECT</span><h2>Bring us your idea.<br />We’ll help make it manufacturable.</h2><p>Share your packaging type, dimensions, target quantity and reference images. Our team will follow up with structure, material and sampling suggestions.</p></div>
        <QuoteForm />
      </section>

      <Footer />
    </main>
  );
}
