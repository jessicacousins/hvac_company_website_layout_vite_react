import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  // ! nav
  const [menuOpen, setMenuOpen] = useState(false);

  // ! animation - reveal on scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("in")
        ),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ! animation - stats count-up

  useEffect(() => {
    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const duration = 1400;
          const start = performance.now();
          const startVal = 0;
          function tick(ts) {
            const p = Math.min(1, (ts - start) / duration);
            const eased = 0.5 - Math.cos(Math.PI * p) / 2;
            const val = startVal + (target - startVal) * eased;
            el.textContent =
              target % 1 === 0
                ? Math.round(val).toLocaleString()
                : val.toFixed(1);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          statIO.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll(".stat-num").forEach((el) => statIO.observe(el));
    return () => statIO.disconnect();
  }, []);

  // ! reviews carousel
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const slides = 4;
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides), 6000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  }, [idx]);

  // !estimate model
  const [est, setEst] = useState(null);
  const [estInputs, setEstInputs] = useState({
    type: "install",
    size: 2000,
    urgency: "standard",
    age: "na",
    season: getCurrentNESeason(),
  });

  const serviceBase = useMemo(
    () => ({
      install: { base: 6800, perSq: 2.4 },
      "ac-repair": { base: 290, perSq: 0.07 },
      "furnace-repair": { base: 320, perSq: 0.06 },
      duct: { base: 900, perSq: 0.38 },
    }),
    []
  );
  const urgencyMult = { standard: 1.0, expedited: 1.22, emergency: 1.5 };
  const ageAdj = { na: 1.0, "0-8": 1.0, "9-14": 1.08, "15+": 1.18 };

  function seasonAdj(season) {
    switch (season) {
      case "winter":
        return 1.07;
      case "summer":
        return 1.05;
      default:
        return 1.02;
    }
  }

  function formatUSD(n) {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function estimateCost({ type, size, urgency, age, season }) {
    const sv = serviceBase[type];
    const raw = sv.base + size * sv.perSq;
    const adjusted =
      raw * urgencyMult[urgency] * ageAdj[age] * seasonAdj(season);
    const low = Math.max(200, adjusted * 0.9);
    const high = adjusted * 1.15;
    return { low, high };
  }

  function runEstimate() {
    const size = Math.max(400, Number(estInputs.size || 0));
    const out = estimateCost({ ...estInputs, size });
    setEst({ ...out, meta: { ...estInputs, size } });
  }

  useEffect(() => {
    document.getElementById("year").textContent = new Date().getFullYear();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="container nav-wrap">
          <a href="#" className="brand" aria-label="RadiantAir HVAC home">
            <span className="brand-icon" aria-hidden="true"></span>
            RadiantAir — Boston
          </a>

          <nav className="nav" aria-label="Primary">
            <button
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="nav-toggle-line"></span>
              <span className="nav-toggle-line"></span>
              <span className="nav-toggle-line"></span>
            </button>
            <ul id="nav-menu" className={`nav-list ${menuOpen ? "show" : ""}`}>
              <li>
                <a href="#services" onClick={() => setMenuOpen(false)}>
                  Services
                </a>
              </li>
              <li>
                <a href="#plans" onClick={() => setMenuOpen(false)}>
                  Contracts
                </a>
              </li>
              <li>
                <a href="#estimate" onClick={() => setMenuOpen(false)}>
                  Estimates
                </a>
              </li>
              <li>
                <a href="#reviews" onClick={() => setMenuOpen(false)}>
                  Reviews
                </a>
              </li>
              <li>
                <a href="#about" onClick={() => setMenuOpen(false)}>
                  Standards
                </a>
              </li>
              <li>
                <a
                  className="cta-link"
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
          <div className="glow glow-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-grid">
            <div className="hero-copy reveal">
              <h1>
                Air you can trust.
                <br />
                <span className="grad">Comfort for New England.</span>
              </h1>
              <p>
                Serving Greater Boston, North Shore, South Shore & MetroWest
                with high-efficiency installs, rapid repairs, and proactive
                maintenance. Licensed. Insured. 24/7 winter emergency support.
              </p>
              <div className="hero-actions">
                <a className="btn primary" href="#estimate">
                  Get a quick estimate
                </a>
                <a className="btn ghost" href="#services">
                  Explore services
                </a>
              </div>
              <ul className="hero-bullets" role="list">
                <li>
                  <span className="dot" aria-hidden="true"></span>{" "}
                  NATE-certified technicians
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span> Smart
                  thermostat & heat pump specialists
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span> Energy-first
                  recommendations
                </li>
              </ul>
            </div>

            <aside className="stats-card reveal" aria-label="Company stats">
              <div className="stat">
                <span className="stat-num" data-count="25000">
                  0
                </span>
                <span className="stat-label">Units serviced</span>
              </div>
              <div className="stat">
                <span className="stat-num" data-count="98.8">
                  0
                </span>
                <span className="stat-label">Satisfaction score</span>
              </div>
              <div className="stat">
                <span className="stat-num" data-count="24">
                  0
                </span>
                <span className="stat-label">Emergency support</span>
              </div>
              <p className="small">
                Across residential & commercial clients from Boston to
                Portsmouth since 2011.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section">
        <div className="container">
          <header className="section-head reveal">
            <h2>Services</h2>
            <p>
              Sized for New England homes & businesses—built for efficiency and
              reliability.
            </p>
          </header>
          <div className="cards-grid">
            <article className="card reveal">
              <div className="icon i-install" aria-hidden="true"></div>
              <h3>New System Installation</h3>
              <p>
                High-SEER heat pumps, furnaces, boilers & rooftop units.
                Load-calculated sizing; code-compliant installs.
              </p>
              <ul role="list" className="list">
                <li>Cold-climate heat pumps & mini-splits</li>
                <li>Gas & oil furnaces, boilers</li>
                <li>Commercial RTUs</li>
              </ul>
            </article>
            <article className="card reveal">
              <div className="icon i-repair" aria-hidden="true"></div>
              <h3>Repairs & Diagnostics</h3>
              <p>
                Fast fault isolation with digital gauges & ECM analysis. We
                solve root causes—no band-aids.
              </p>
              <ul role="list" className="list">
                <li>AC not cooling / short-cycling</li>
                <li>No-heat / ignition issues</li>
                <li>Sensor & control faults</li>
              </ul>
            </article>
            <article className="card reveal">
              <div className="icon i-maint" aria-hidden="true"></div>
              <h3>Maintenance</h3>
              <p>
                Seasonal tune-ups extend life, protect warranties, and reduce
                energy bills.
              </p>
              <ul role="list" className="list">
                <li>Coil cleaning & airflow checks</li>
                <li>Combustion analysis</li>
                <li>Filter & belt service</li>
              </ul>
            </article>
            <article className="card reveal">
              <div className="icon i-iaq" aria-hidden="true"></div>
              <h3>Indoor Air Quality</h3>
              <p>
                Cleaner air, fewer allergens. Duct upgrades, sealing, UV, and
                filtration tuned for NE homes.
              </p>
              <ul role="list" className="list">
                <li>Duct design & sealing</li>
                <li>Smart thermostats</li>
                <li>UV & MERV filtration</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Contracts */}
      <section id="plans" className="section tinted">
        <div className="container">
          <header className="section-head reveal">
            <h2>Maintenance Contracts</h2>
            <p>
              Predictable costs. Peak performance. Priority response
              times—especially in winter.
            </p>
          </header>
          <div className="plans-grid">
            <article className="plan reveal">
              <h3>Essential</h3>
              <p className="price">
                <span>$18</span>/mo
              </p>
              <ul role="list" className="list">
                <li>1 tune-up / year</li>
                <li>10% parts discount</li>
                <li>Standard scheduling</li>
              </ul>
              <a className="btn outline" href="#contact">
                Choose Essential
              </a>
            </article>

            <article
              className="plan featured reveal"
              aria-label="Most popular plan"
            >
              <div className="badge">Most Popular</div>
              <h3>Comfort</h3>
              <p className="price">
                <span>$32</span>/mo
              </p>
              <ul role="list" className="list">
                <li>2 tune-ups / year</li>
                <li>15% parts discount</li>
                <li>48-hr priority</li>
                <li>Filter program</li>
              </ul>
              <a className="btn primary" href="#contact">
                Choose Comfort
              </a>
            </article>

            <article className="plan reveal">
              <h3>ProCare</h3>
              <p className="price">
                <span>$64</span>/mo
              </p>
              <ul role="list" className="list">
                <li>Quarterly visits</li>
                <li>20% parts discount</li>
                <li>24-hr priority</li>
                <li>Extended diagnostics</li>
              </ul>
              <a className="btn outline" href="#contact">
                Choose ProCare
              </a>
            </article>
          </div>
          <p className="small center">
            Ask about utility rebates (e.g., Mass Save®) for qualifying
            high-efficiency equipment.
          </p>
        </div>
      </section>

      {/* Estimates */}
      <section id="estimate" className="section">
        <div className="container">
          <header className="section-head reveal">
            <h2>Instant Estimate — Boston & New England</h2>
            <p>
              Get a ballpark range now. We’ll confirm with a free on-site visit.
            </p>
          </header>

          <form
            className="estimate-form reveal"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="field">
              <label htmlFor="est-service">Service Type</label>
              <select
                id="est-service"
                value={estInputs.type}
                onChange={(e) =>
                  setEstInputs((v) => ({ ...v, type: e.target.value }))
                }
                required
              >
                <option value="install">New System Install</option>
                <option value="ac-repair">AC Repair</option>
                <option value="furnace-repair">Furnace/Boiler Repair</option>
                <option value="duct">Ductwork & IAQ</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="est-size">Property Size (sq ft)</label>
              <input
                id="est-size"
                type="number"
                min="400"
                step="50"
                value={estInputs.size}
                onChange={(e) =>
                  setEstInputs((v) => ({ ...v, size: e.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="est-urgency">Urgency</label>
              <select
                id="est-urgency"
                value={estInputs.urgency}
                onChange={(e) =>
                  setEstInputs((v) => ({ ...v, urgency: e.target.value }))
                }
              >
                <option value="standard">Standard (3–7 days)</option>
                <option value="expedited">Expedited (24–48 hrs)</option>
                <option value="emergency">Emergency (Same-day)</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="est-age">Existing System Age</label>
              <select
                id="est-age"
                value={estInputs.age}
                onChange={(e) =>
                  setEstInputs((v) => ({ ...v, age: e.target.value }))
                }
              >
                <option value="na">Not applicable / none</option>
                <option value="0-8">0–8 yrs</option>
                <option value="9-14">9–14 yrs</option>
                <option value="15+">15+ yrs</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="est-season">Season</label>
              <select
                id="est-season"
                value={estInputs.season}
                onChange={(e) =>
                  setEstInputs((v) => ({ ...v, season: e.target.value }))
                }
              >
                <option value="winter">Winter</option>
                <option value="summer">Summer</option>
                <option value="spring">Spring</option>
                <option value="fall">Fall</option>
              </select>
            </div>

            <button className="btn primary" type="button" onClick={runEstimate}>
              Calculate
            </button>
          </form>

          <div
            id="estimate-result"
            className={`estimate-result reveal ${est ? "in" : ""}`}
            aria-live="polite"
            style={{ display: est ? "block" : "none" }}
          >
            {est && (
              <div className="est-wrap">
                <h3 style={{ margin: "0 0 6px" }}>Your estimate</h3>
                <p className="small" style={{ margin: "0 0 10px" }}>
                  Non-binding range for Greater Boston & New England. We’ll
                  confirm after a free on-site assessment.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "baseline",
                  }}
                >
                  <div>
                    <strong>{formatUSD(est.low)}</strong> –{" "}
                    <strong>{formatUSD(est.high)}</strong>
                  </div>
                  <span className="small" style={{ color: "#bdbfc7" }}>
                    ({est.meta.type.replace("-", " ")},{" "}
                    {Number(est.meta.size).toLocaleString()} sq ft,{" "}
                    {est.meta.urgency}, {est.meta.season})
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <a className="btn primary" href="#contact">
                    Book on-site visit
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section tinted">
        <div className="container">
          <header className="section-head reveal">
            <h2>What customers say</h2>
            <p>
              Real feedback from homeowners and facilities managers around New
              England.
            </p>
          </header>

          <div
            className="reviews-carousel reveal"
            role="region"
            aria-label="Customer reviews"
          >
            <button
              className="carousel-btn prev"
              aria-label="Previous review"
              onClick={() => setIdx((i) => (i - 1 + slides) % slides)}
            >
              ‹
            </button>
            <ul className="reviews-track" ref={trackRef}>
              <li className="review">
                <blockquote>
                  “Install crew was spotless and fast. Our summer bill dropped
                  by 22%.”
                </blockquote>
                <div className="review-meta">— Jordan P., Somerville</div>
              </li>
              <li className="review">
                <blockquote>
                  “They found a duct leak 3 companies missed. Night-and-day
                  airflow now.”
                </blockquote>
                <div className="review-meta">— Morgan L., Quincy</div>
              </li>
              <li className="review">
                <blockquote>
                  “Comfort plan is worth it—proactive visits before winter cold
                  snaps.”
                </blockquote>
                <div className="review-meta">— Ravi D., Waltham</div>
              </li>
              <li className="review">
                <blockquote>
                  “Emergency heat restored at 1am during a nor’easter. Clear
                  pricing.”
                </blockquote>
                <div className="review-meta">— Alicia K., Danvers</div>
              </li>
            </ul>
            <button
              className="carousel-btn next"
              aria-label="Next review"
              onClick={() => setIdx((i) => (i + 1) % slides)}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section id="about" className="section">
        <div className="container">
          <header className="section-head reveal">
            <h2>Our Standards</h2>
            <p>
              Principles that guide every visit in Boston & across New England.
            </p>
          </header>
          <div className="about-grid">
            <article className="about-card reveal">
              <h3>Efficiency first</h3>
              <p>
                Load calculations, duct design, and right-sized equipment to
                reduce total cost of ownership.
              </p>
            </article>
            <article className="about-card reveal">
              <h3>Transparent pricing</h3>
              <p>
                Flat-rate menus with written scopes. You approve work before we
                turn a screw.
              </p>
            </article>
            <article className="about-card reveal">
              <h3>Respect for your space</h3>
              <p>
                Shoe covers, drop cloths, and post-job walkthroughs. We leave it
                cleaner than we found it.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section contact">
        <div className="container">
          <header className="section-head reveal">
            <h2>Contact us</h2>
            <p>
              Tell us about your project. We’ll reply within one business day.
            </p>
          </header>

          <ContactForm />

          <div className="contact-notes reveal">
            <p className="small">
              Serving Boston, Cambridge, Somerville, Brookline, Newton, North
              Shore, South Shore & beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-wrap">
          <div className="foot-brand">
            © <span id="year"></span> RadiantAir HVAC — Boston
          </div>
          <ul className="foot-links" role="list">
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#plans">Contracts</a>
            </li>
            <li>
              <a href="#estimate">Estimates</a>
            </li>
            <li>
              <a href="#reviews">Reviews</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
          <div className="foot-social" aria-label="Social">
            <a href="#" aria-label="Instagram" className="social-dot"></a>
            <a href="#" aria-label="Facebook" className="social-dot"></a>
            <a href="#" aria-label="X" className="social-dot"></a>
          </div>
        </div>
      </footer>
    </>
  );
}

function ContactForm() {
  const [status, setStatus] = useState({ text: "", color: "" });
  const ref = useRef(null);
  function submit(e) {
    e.preventDefault();
    const fd = new FormData(ref.current);
    const data = Object.fromEntries(fd.entries());
    if (!data.name || !data.email || !data.interest || !data.message) {
      setStatus({
        text: "Please complete all required fields.",
        color: "var(--err)",
      });
      return;
    }
    setStatus({ text: "Sending…", color: "#bdbfc7" });
    setTimeout(() => {
      setStatus({
        text: "Thanks! We’ll be in touch within one business day.",
        color: "var(--ok)",
      });
      ref.current.reset();
    }, 900);
  }
  return (
    <form
      ref={ref}
      className="contact-form reveal"
      aria-label="Contact form"
      onSubmit={submit}
      noValidate
    >
      <div className="field">
        <label htmlFor="c-name">Full name</label>
        <input
          id="c-name"
          type="text"
          name="name"
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="c-email">Email</label>
        <input
          id="c-email"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="c-phone">Phone</label>
        <input
          id="c-phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="(617) 555-0123"
        />
      </div>
      <div className="field">
        <label htmlFor="c-interest">I’m interested in</label>
        <select id="c-interest" name="interest" required>
          <option value="" disabled>
            Choose an option
          </option>
          <option>New system install</option>
          <option>Repair</option>
          <option>Maintenance contract</option>
          <option>Indoor air quality</option>
          <option>Commercial services</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="c-msg">Message</label>
        <textarea
          id="c-msg"
          name="message"
          rows="5"
          placeholder="Tell us about your space, timeline, and goals…"
          required
        ></textarea>
      </div>
      <div className="actions">
        <button className="btn primary" type="submit">
          Send message
        </button>
        <p
          className="form-status"
          role="status"
          aria-live="polite"
          style={{ color: status.color }}
        >
          {status.text}
        </p>
      </div>
    </form>
  );
}

function getCurrentNESeason() {
  const m = new Date().getMonth() + 1;
  if (m === 12 || m <= 2) return "winter";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 3 && m <= 5) return "spring";
  return "fall";
}
