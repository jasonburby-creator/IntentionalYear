import Link from 'next/link';

export const metadata = {
  title: 'About — Intentional Year',
  description: 'A year-at-a-glance planner for the trips, challenges, habits, and adventures that actually matter.',
};

export default function AboutPage() {
  return (
    <div className="about-root">
      <style>{styles}</style>

      <nav className="about-nav">
        <Link href="/login" className="nav-back">← Back</Link>
        <div className="nav-brand">Intentional Year</div>
        <Link href="/login" className="nav-cta">Sign in</Link>
      </nav>

      <article className="about-article">
        <header className="about-header">
          <div className="overline">ABOUT THIS TOOL</div>
          <h1 className="hero-title">The years are slipping.<br />Make this one count.</h1>
          <div className="rule" />
        </header>

        <section className="about-section">
          <h2>Time is the only thing you can&apos;t make more of</h2>
          <p>You have a finite number of years. Nobody knows the exact number, but it&apos;s smaller than you think. And the strange thing about years is they don&apos;t slow down — they speed up. The years in your forties go faster than the years in your twenties. The years in your sixties go faster still.</p>
          <p>Most of those years will pass while you&apos;re busy. Heads-down. Calendars full of meetings, errands, obligations, and other people&apos;s priorities. Good things, often. But not necessarily <em>your</em> things.</p>
          <p>Intentional Year is built on a simple premise: <strong>if you don&apos;t decide what a year is for, it gets decided for you.</strong> Spend a few hours at the start of the year — or right now, wherever you are — putting the meaningful things on the page first. The trip. The challenge. The habit. The reunion. The thing you&apos;ve been postponing for three years. Block them in before the year fills up with everything else.</p>
          <p>Then live the year you designed.</p>
        </section>

        <section className="about-section pullout">
          <h2>The compound effect</h2>
          <p>This is the part most people miss.</p>
          <p>One intentional year is a great year. But the real magic happens when you do it again. And again.</p>
          <p>After five years of using this planner, you will have:</p>
          <ul className="compound-list">
            <li><strong>Five year-defining challenges</strong> behind you (one Misogi per year)</li>
            <li><strong>Thirty new experiences</strong> you wouldn&apos;t otherwise have tried (six per year)</li>
            <li><strong>Twenty habits</strong> built and integrated (one per quarter)</li>
            <li><strong>Hundreds of intentional moments</strong> you actually showed up for</li>
          </ul>
          <p>That&apos;s not a productivity gain. That&apos;s a different life.</p>
          <p>Most people don&apos;t live one life over fifty years. They live the same year fifty times, with small variations. Intentional planning is how you break that loop.</p>
        </section>

        <section className="about-section">
          <h2>The framework</h2>
          <p>The planner is organized around six categories. Three are <strong>core</strong> — the load-bearing pillars of the framework that shouldn&apos;t change. Three are <strong>flexible</strong> — meant to adapt to your life stage.</p>

          <div className="framework">
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#7c5cb0' }} />
              <div>
                <div className="fw-name">Misogi <span className="fw-tag fw-tag-core">core</span></div>
                <div className="fw-desc">One year-defining challenge. Hard enough that you&apos;re not sure you can do it. The thing the year is built around.</div>
              </div>
            </div>
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#c2553c' }} />
              <div>
                <div className="fw-name">Explore 6x <span className="fw-tag fw-tag-core">core</span></div>
                <div className="fw-desc">Six times this year, do something you wouldn&apos;t normally do. Roughly one every other month. Single days, weekends, experiments. Most won&apos;t be dramatic. All will be memorable.</div>
              </div>
            </div>
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#3d6b87' }} />
              <div>
                <div className="fw-name">Mini Adventures <span className="fw-tag">flexible</span></div>
                <div className="fw-desc">Trips, getaways, weekend pilgrimages. Block them in early so they actually happen, instead of becoming the conversation you keep having about how you should really do that one of these days.</div>
              </div>
            </div>
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#b88a3f' }} />
              <div>
                <div className="fw-name">Habits <span className="fw-tag fw-tag-core">core</span></div>
                <div className="fw-desc">One new habit per quarter. Not twelve at once. Stack them slowly, let each one become automatic before adding the next.</div>
              </div>
            </div>
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#5b7a3a' }} />
              <div>
                <div className="fw-name">Biz Trips <span className="fw-tag">flexible</span></div>
                <div className="fw-desc">Work travel laid out across the year so you can see the load. When the year fills with obligation, this is where you&apos;ll see it first — and where you can push back.</div>
              </div>
            </div>
            <div className="framework-item">
              <div className="fw-mark" style={{ background: '#6b6258' }} />
              <div>
                <div className="fw-name">Daily Vitamins <span className="fw-tag">flexible</span></div>
                <div className="fw-desc">The small daily practices that compound. Weight training, time outdoors, journaling, breathing. The unglamorous stuff that builds the foundation everything else sits on.</div>
              </div>
            </div>
          </div>

          <p className="framework-note"><strong>Misogi, Explore 6x, and Habits</strong> are locked — their names and descriptions can&apos;t be changed (though you can still pick your own colors and fill in your own items). The other three you can rename, recolor, replace, or remove entirely to match your life stage.</p>
        </section>

        <section className="about-section">
          <h2>On Misogi</h2>
          <p>Misogi (禊) is a Shinto purification ritual that dates back over a thousand years in Japan. Practitioners stand under sacred waterfalls — at Mount Ontake, in the Kii mountains, at Kiyomizu in Kyoto — chanting <em>harae tamae kiyome tamae</em> (&ldquo;purify me, cleanse me&rdquo;) as cold mountain water cascades over them. The mythology traces it to Izanagi, one of the creator deities, who washed himself in a river after escaping the underworld.</p>
          <p>In its modern interpretation, entrepreneur Jesse Itzler adapted Misogi into a framework for personal challenge: do one thing so hard, once a year, that it impacts the other 364 days. The challenge should sit at the edge of what&apos;s possible — a real chance of failure, demanding real preparation, creating real anxiety. You&apos;re not doing it for an audience. You&apos;re doing it because the <em>preparing</em> and the <em>doing</em> change who you are for the rest of the year.</p>
        </section>

        <section className="about-section">
          <h2>How to use it</h2>
          <p><strong>Block the big rocks first.</strong> Before anything else: your Misogi, your major trips, your essential work travel.</p>
          <p><strong>Then the medium ones.</strong> The 6x adventures. The quarterly habit shifts. Anniversaries. Family stuff.</p>
          <p><strong>Print it.</strong> Seriously. The screen is for editing. The print is for living with. Hang it where you&apos;ll see it every day.</p>
          <p><strong>Revisit it monthly.</strong> Five minutes on the first of each month. What&apos;s coming? What got skipped? What needs to move? This is a living document, not a contract.</p>
        </section>

        <section className="about-section">
          <h2>Intention vs. resolution</h2>
          <p><em>Intention is not the same as resolution.</em></p>
          <p>Resolutions are wishes — vague, abandoned by February. Intention is concrete: it has a date, a category, a place on the page. It&apos;s the difference between &ldquo;I want to travel more&rdquo; and &ldquo;BVI Sailing, January 23rd.&rdquo;</p>
          <p>The act of writing it down — and seeing it sit there for months before it happens — changes the relationship you have with it. By the time the date arrives, you&apos;ve been thinking about it, preparing for it, building toward it. You&apos;re not surprised by your own year. You designed it.</p>
        </section>

        <section className="about-section credits">
          <h2>Inspired by</h2>
          <ul className="credits-list">
            <li>
              <a href="https://jesseitzler.com" target="_blank" rel="noopener noreferrer"><strong>Jesse Itzler</strong></a> — entrepreneur and creator of the <em>Big Ass Calendar</em>. The structural backbone of this tool — one Misogi, six adventures, quarterly habits — is his framework. Live on offense, not defense.
            </li>
            <li>
              <a href="https://eastermichael.com" target="_blank" rel="noopener noreferrer"><strong>Michael Easter</strong></a> — author of <a href="https://www.thecomfortcrisisbook.com" target="_blank" rel="noopener noreferrer"><em>The Comfort Crisis</em></a>. Easter&apos;s work on voluntary discomfort and reconnecting with the wild popularized the modern Western interpretation of Misogi.
            </li>
            <li>
              <a href="https://jamesclear.com" target="_blank" rel="noopener noreferrer"><strong>James Clear</strong></a> — author of <a href="https://jamesclear.com/atomic-habits" target="_blank" rel="noopener noreferrer"><em>Atomic Habits</em></a>. The &ldquo;one habit per quarter&rdquo; rhythm is a direct application of Clear&apos;s compounding-change principle. Small things, done consistently, win.
            </li>
            <li>
              <strong>Shinto tradition</strong> — the thousand-year practice of Misogi reminds us that marking time with intentional difficulty is not a modern productivity hack. It&apos;s ancient. It&apos;s deeply human.
            </li>
          </ul>
        </section>

        <footer className="about-footer">
          <div className="closing-rule" />
          <p className="closing">Plan less. Plan deeper. Live what you planned.</p>
          <Link href="/login" className="footer-cta">Begin your year →</Link>
        </footer>
      </article>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.about-root {
  font-family: 'Inter', -apple-system, sans-serif;
  color: #2a2620;
  background:
    radial-gradient(at 20% 10%, rgba(255,250,235,0.6), transparent 50%),
    radial-gradient(at 85% 90%, rgba(220,205,170,0.3), transparent 60%),
    #f5efe1;
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
}

.about-root::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.about-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(245, 239, 225, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #c9bfa8;
  padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
}

.nav-back, .nav-cta {
  font-size: 12px; font-weight: 600;
  color: #4a4238; text-decoration: none;
  letter-spacing: 0.04em;
  padding: 6px 10px; border-radius: 3px;
  transition: all 0.15s;
}
.nav-back:hover { background: #2a2620; color: #f5efe1; }

.nav-cta {
  background: #2a2620; color: #f5efe1;
  padding: 8px 14px;
}
.nav-cta:hover { background: #4a4238; }

.nav-brand {
  font-family: 'Fraunces', serif;
  font-weight: 700; font-size: 14px;
  letter-spacing: -0.005em; color: #2a2620;
}

.about-article {
  position: relative; z-index: 1;
  max-width: 680px; margin: 0 auto;
  padding: 60px 32px 80px;
}

.about-header { text-align: center; margin-bottom: 56px; }

.overline {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #7a7064; margin-bottom: 20px;
}

.hero-title {
  font-family: 'Fraunces', serif; font-weight: 800;
  font-size: clamp(40px, 6vw, 60px);
  line-height: 1.05; letter-spacing: -0.025em;
  margin: 0 0 32px; color: #2a2620;
  font-variation-settings: 'opsz' 144;
}

.rule { width: 60px; height: 1px; background: #2a2620; margin: 0 auto; }

.about-section { margin-bottom: 56px; }

.about-section h2 {
  font-family: 'Fraunces', serif; font-weight: 700;
  font-size: clamp(24px, 3vw, 30px);
  line-height: 1.15; letter-spacing: -0.015em;
  margin: 0 0 20px; color: #2a2620;
}

.about-section p {
  font-size: 16px; line-height: 1.7;
  color: #3a3228; margin: 0 0 16px;
}
.about-section p:last-child { margin-bottom: 0; }

.about-section em { font-family: 'Fraunces', serif; font-style: italic; color: #2a2620; }
.about-section strong { font-weight: 700; color: #2a2620; }

.about-section a {
  color: #8a3a2a; text-decoration: none;
  border-bottom: 1px solid rgba(138, 58, 42, 0.25);
  transition: border-color 0.15s;
}
.about-section a:hover { border-bottom-color: #8a3a2a; }

.pullout {
  background: rgba(255, 255, 255, 0.4);
  border-left: 3px solid #8a3a2a;
  padding: 32px 32px 32px 28px;
  border-radius: 0 4px 4px 0;
}

.compound-list {
  margin: 8px 0 20px;
  padding-left: 24px;
  font-size: 16px; line-height: 1.8;
  color: #3a3228;
}
.compound-list li { margin-bottom: 4px; }

.framework {
  margin: 28px 0;
  display: flex; flex-direction: column;
  gap: 18px;
  background: rgba(255, 255, 255, 0.4);
  padding: 24px;
  border-radius: 4px;
  border: 1px solid #c9bfa8;
}

.framework-item {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 14px; align-items: start;
}

.fw-mark {
  width: 14px; height: 14px;
  border-radius: 2px;
  margin-top: 5px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
}

.fw-name {
  font-family: 'Fraunces', serif;
  font-weight: 700; font-size: 17px;
  color: #2a2620; margin-bottom: 3px;
  letter-spacing: -0.005em;
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap;
}

.fw-tag {
  font-family: 'Inter', sans-serif;
  font-size: 9px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #7a7064;
  background: rgba(122, 112, 100, 0.12);
  padding: 2px 7px;
  border-radius: 10px;
}

.fw-tag-core {
  color: #8a3a2a;
  background: rgba(138, 58, 42, 0.1);
}

.fw-desc {
  font-size: 14px; line-height: 1.55; color: #4a4238;
}

.framework-note {
  font-size: 14px !important;
  font-style: italic;
  color: #5e5446 !important;
  margin-top: 24px !important;
}

.credits-list {
  margin: 0; padding: 0;
  list-style: none;
}

.credits-list li {
  font-size: 15px; line-height: 1.7;
  color: #3a3228;
  margin-bottom: 18px;
  padding-left: 18px;
  position: relative;
}

.credits-list li::before {
  content: '◆';
  position: absolute; left: 0; top: 2px;
  color: #8a3a2a; font-size: 9px;
}

.about-footer {
  margin-top: 64px;
  text-align: center;
}

.closing-rule {
  width: 60px; height: 1px;
  background: #2a2620;
  margin: 0 auto 32px;
}

.closing {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: clamp(18px, 2.2vw, 24px) !important;
  line-height: 1.4;
  color: #2a2620 !important;
  margin: 0 0 32px !important;
}

.footer-cta {
  display: inline-block;
  padding: 14px 28px;
  background: #2a2620;
  color: #f5efe1;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  transition: background 0.15s;
}
.footer-cta:hover { background: #4a4238; }

@media (max-width: 600px) {
  .about-article { padding: 40px 20px 60px; }
  .pullout { padding: 24px 20px 24px 18px; }
  .framework { padding: 18px; }
}
`;
