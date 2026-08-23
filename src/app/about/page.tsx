import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY } from "@/lib/policies";

const HERO_IMG = "/images/about/hero.jpg";
const WHO_IMG = "/images/about/who.jpg";

const offers = [
  {
    title: "Handbags & Purses",
    text: "Elegant everyday styles designed for comfort, functionality and confidence — from city errands to evening plans.",
    icon: "👜",
  },
  {
    title: "Backpacks",
    text: "Practical designs for work, study, travel and everyday movement, with room for laptops and daily essentials.",
    icon: "🎒",
  },
  {
    title: "Travel & Luggage",
    text: "Reliable companions designed to make your journeys easier and more organised, from cabin trips to longer travel.",
    icon: "🧳",
  },
  {
    title: "Wallets & Accessories",
    text: "Simple details that add convenience and complete your everyday style — wallets, covers and carry essentials.",
    icon: "👛",
  },
];

const reasons = [
  {
    num: "01",
    title: "Quality First",
    text: "Carefully selected products with quality in mind — real product photography and honest descriptions.",
  },
  {
    num: "02",
    title: "Modern Style",
    text: "Contemporary designs made for today’s lifestyle across office, campus, travel and weekend use.",
  },
  {
    num: "03",
    title: "Great Value",
    text: "Style and practicality with transparent INR pricing — no hidden surprises at checkout.",
  },
  {
    num: "04",
    title: "Customer Focused",
    text: "Your shopping experience is at the heart of what we do — COD, easy support, and clear policies.",
  },
];

export default function AboutPage() {
  return (
    <StoreShell>
      <SiteHeader />

      {/* Hero */}
      <section className="about-hero">
        <div className="container about-split">
          <div className="about-copy">
            <p className="about-eyebrow gold">About My SkyBuy</p>
            <h1>More than just a bag.</h1>
            <p className="about-lead">
              MySkyBuy is an India-first carry catalogue by {COMPANY.name}. We bring together stylish,
              practical bags — backpacks, handbags, travel luggage, slings, wallets and work gear — so
              you can find everyday essentials with transparent pricing, real product imagery, and a
              checkout experience built for Indian shoppers, including Cash on Delivery.
            </p>
            <Link href="/shop" className="btn btn-accent about-cta">
              Explore Our Collection →
            </Link>
          </div>
          <div className="about-media">
            <SafeImage src={HERO_IMG} alt="MySkyBuy handbag" />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="about-who">
        <div className="container about-split reverse">
          <div className="about-media">
            <SafeImage src={WHO_IMG} alt="MySkyBuy backpack" />
          </div>
          <div className="about-copy">
            <p className="about-eyebrow teal">Who We Are</p>
            <h2>Made For Your Everyday Journey.</h2>
            <p>
              At MySkyBuy, we believe a good bag does more than carry things — it supports how you move
              through the day. Whether you are commuting to work, heading to campus, packing for a short
              trip, or organising weekend errands, the right carry piece should feel reliable, look
              considered, and fit real Indian routines.
            </p>
            <p>
              We curate products with a focus on practical design, clear pricing in ₹, and a shopping
              experience that feels simple and trustworthy. From first visit to delivery, our goal is
              to help you choose with confidence — with honest product details, responsive support, and
              policies designed around how customers actually shop online.
            </p>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="about-offer">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">What We Offer</p>
            <h2>Designed For Every Journey</h2>
            <p className="about-sub">
              A curated selection of everyday carry essentials — bags, travel pieces and accessories —
              chosen for style, utility and lasting everyday use.
            </p>
          </div>
          <div className="about-offer-grid">
            {offers.map((item) => (
              <article key={item.title} className="about-offer-card">
                <div className="about-offer-icon" aria-hidden>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="about-why">
        <div className="container">
          <div className="about-center-head">
            <p className="about-eyebrow teal">Why My SkyBuy</p>
            <h2>Why Choose Us?</h2>
          </div>
          <div className="about-why-grid">
            {reasons.map((r) => (
              <article key={r.num} className="about-why-item">
                <span className="about-why-num">{r.num}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="container about-mission-inner">
          <p className="about-eyebrow gold">Our Mission</p>
          <h2>Making Everyday Carry Better, One Product At A Time.</h2>
          <p>
            Our mission is to make stylish and practical bags accessible to everyone while creating a
            shopping experience built around quality, trust and customer satisfaction — from discovery
            on MySkyBuy to delivery at your doorstep across India.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="about-bottom-cta">
        <div className="container">
          <div className="about-cta-banner">
            <h2>Find Your Everyday Essential</h2>
            <p>
              Explore our collection and discover a bag that fits your style, your journey and your
              everyday life.
            </p>
            <Link href="/shop" className="btn about-cta-btn">
              Shop Now →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </StoreShell>
  );
}
