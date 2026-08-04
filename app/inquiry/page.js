import InquiryForm from "../../components/InquiryForm";
import { Footer, Header } from "../../components/SiteUI";

export const metadata = {
  title: "Request a Custom Packaging Quote | DATANGXING",
  description: "Send your custom paper packaging requirements to DATANGXING Packaging and receive a response within one business day.",
};

export default function InquiryPage() {
  return (
    <main className="site inquiry-page">
      <Header standalone ctaHref="#inquiry-form" />

      <section className="inquiry-hero">
        <div><span>CUSTOM PACKAGING · B2B INQUIRY</span><h1>Start with your idea.<br />Leave the engineering to us.</h1></div>
        <div className="inquiry-hero-note"><strong>Useful details get faster answers.</strong><p>Share your target quantity, dimensions and reference images when available. We’ll help refine the structure, material and finishing.</p></div>
      </section>

      <section className="inquiry-layout">
        <InquiryForm />

        <aside className="inquiry-aside">
          <span>WHAT HAPPENS NEXT</span>
          <h2>A clear path from brief to sample.</h2>
          <ol>
            <li><b>01</b><div><strong>We review your brief</strong><p>A packaging specialist checks size, quantity, application and delivery market.</p></div></li>
            <li><b>02</b><div><strong>We clarify the details</strong><p>We may suggest materials, structures or finishes that better fit your budget.</p></div></li>
            <li><b>03</b><div><strong>You receive next steps</strong><p>Expect a practical reply covering sampling, quotation requirements and timing.</p></div></li>
          </ol>
          <div className="inquiry-trust">
            <small>DIRECT FACTORY SUPPORT</small>
            <strong>Reply within one business day</strong>
            <p>Your project information is used only to prepare and follow up on your packaging inquiry.</p>
          </div>
          <a href="mailto:lynn05052002@gmail.com">Prefer email? Contact Lynn directly <span>↗</span></a>
        </aside>
      </section>

      <section className="inquiry-proof-strip">
        <div><strong>20+</strong><span>Packaging specialists</span></div>
        <div><strong>1-to-1</strong><span>Project communication</span></div>
        <div><strong>24h</strong><span>First-response target</span></div>
        <div><strong>Global</strong><span>Export coordination</span></div>
      </section>

      <Footer />
    </main>
  );
}
