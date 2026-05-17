'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="login-root">
      <style>{styles}</style>

      <main className="login-shell">
        <div className="login-content">
          <div className="overline">DON&apos;T LET ANOTHER YEAR JUST HAPPEN.</div>
          <h1 className="hero-title">Intentional<br />Year</h1>
          <p className="subhead">Most years pass while you&apos;re busy. This is for the ones you choose.</p>

          <div className="body-text">
            <p>We get about 80 of these. Maybe 90 if we&apos;re lucky. And most of them pass the same way: head down, calendar full of other people&apos;s priorities, looking up in December wondering where the year went.</p>
            <p>Intentional Year is the antidote. Spend an afternoon at the start of the year deciding what it&apos;s <em>for</em> — the trips you&apos;ll take, the challenge that defines it, the habit you&apos;re finally building, the people you&apos;ll see — and then live the year you designed instead of the one that happened to you.</p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-mark">◆</div>
              <div>
                <div className="feature-title">One page, one year.</div>
                <div className="feature-desc">See all 365 days at once. Print it. Hang it on the wall. Look at it every morning.</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-mark">◆</div>
              <div>
                <div className="feature-title">Six categories, your colors.</div>
                <div className="feature-desc">Adventures, challenges, habits, work travel, daily practices — color-coded so you can read your year at a glance.</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-mark">◆</div>
              <div>
                <div className="feature-title">The compound effect.</div>
                <div className="feature-desc">Do this five years in a row and you&apos;ll have lived five year-defining challenges and tried thirty new things. That&apos;s a life that looks different.</div>
              </div>
            </div>
          </div>
        </div>

        <aside className="login-card">
          <div className="card-inner">
            <div className="card-mark">◆</div>
            <h2 className="card-title">Begin.</h2>
            <p className="card-desc">Sign in with Google to plan your year.</p>
            <button onClick={signInWithGoogle} className="google-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            <Link href="/about" className="learn-more">Learn more →</Link>
          </div>
        </aside>
      </main>

      <footer className="login-footer">
        <blockquote>
          &ldquo;Don&apos;t ask what the world needs. Ask what makes you come alive, and go do it. Because what the world needs is people who have come alive.&rdquo;
        </blockquote>
        <cite>— Howard Thurman</cite>
      </footer>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.login-root {
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh;
  color: #2a2620;
  background:
    radial-gradient(at 20% 10%, rgba(255,250,235,0.6), transparent 50%),
    radial-gradient(at 85% 90%, rgba(220,205,170,0.3), transparent 60%),
    #f5efe1;
  background-attachment: fixed;
  position: relative;
  overflow-x: hidden;
}

.login-root::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0; opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.login-shell {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  padding: 80px 32px 40px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 80px;
  align-items: start;
}

.login-content { max-width: 600px; }

.overline {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #7a7064; margin-bottom: 24px;
}

.hero-title {
  font-family: 'Fraunces', serif; font-weight: 800;
  font-size: clamp(56px, 8vw, 96px);
  line-height: 0.92; letter-spacing: -0.035em;
  margin: 0 0 24px; color: #2a2620;
  font-variation-settings: 'opsz' 144;
}

.subhead {
  font-family: 'Fraunces', serif; font-style: italic;
  font-weight: 400; font-size: clamp(18px, 2vw, 22px);
  line-height: 1.4; color: #4a4238;
  margin: 0 0 36px; max-width: 540px;
}

.body-text { margin-bottom: 40px; }
.body-text p {
  font-size: 15px; line-height: 1.7;
  color: #4a4238; margin: 0 0 16px;
  max-width: 560px;
}
.body-text p:last-child { margin-bottom: 0; }
.body-text em { font-family: 'Fraunces', serif; font-style: italic; color: #2a2620; }

.features {
  display: flex; flex-direction: column; gap: 20px;
  padding-top: 24px; border-top: 1px solid #c9bfa8;
}

.feature {
  display: grid; grid-template-columns: 20px 1fr;
  gap: 14px; align-items: start;
}

.feature-mark {
  font-size: 12px; color: #8a3a2a;
  line-height: 1.5; padding-top: 2px;
}

.feature-title {
  font-family: 'Fraunces', serif; font-weight: 700;
  font-size: 16px; color: #2a2620; margin-bottom: 3px;
  letter-spacing: -0.005em;
}

.feature-desc {
  font-size: 13px; line-height: 1.55; color: #4a4238;
}

.login-card { position: sticky; top: 40px; }

.card-inner {
  background: #fbf7ec;
  border: 1px solid #c9bfa8;
  border-radius: 6px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -24px rgba(60,40,20,0.2);
}

.card-mark { font-size: 14px; color: #8a3a2a; letter-spacing: 0.3em; margin-bottom: 16px; }

.card-title {
  font-family: 'Fraunces', serif; font-weight: 800;
  font-size: 36px; margin: 0 0 10px;
  color: #2a2620; letter-spacing: -0.02em;
}

.card-desc { font-size: 13px; color: #4a4238; margin: 0 0 24px; line-height: 1.5; }

.google-btn {
  width: 100%; padding: 12px 16px;
  background: #2a2620; color: #f5efe1;
  border: none; border-radius: 4px;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  font-family: inherit; transition: background 0.15s;
}
.google-btn:hover { background: #4a4238; }

.learn-more {
  display: inline-block; margin-top: 18px;
  font-size: 12px; color: #7a7064;
  text-decoration: none; letter-spacing: 0.04em;
  border-bottom: 1px dashed transparent;
  padding-bottom: 1px; transition: all 0.15s;
}
.learn-more:hover { color: #2a2620; border-bottom-color: #c9bfa8; }

.login-footer {
  position: relative; z-index: 1;
  max-width: 720px; margin: 40px auto 0;
  padding: 40px 32px 60px;
  text-align: center;
  border-top: 1px solid #c9bfa8;
}

.login-footer blockquote {
  font-family: 'Fraunces', serif; font-style: italic;
  font-weight: 400; font-size: clamp(15px, 1.6vw, 18px);
  line-height: 1.55; color: #4a4238;
  margin: 0 auto 12px; max-width: 600px;
}

.login-footer cite {
  font-style: normal; font-size: 11px; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: #7a7064;
}

@media (max-width: 900px) {
  .login-shell { grid-template-columns: 1fr; gap: 40px; padding: 48px 24px 32px; }
  .login-card { position: static; }
  .login-content { max-width: none; }
}

@media (max-width: 500px) {
  .login-shell { padding: 32px 20px; }
  .card-inner { padding: 28px 24px; }
  .login-footer { padding: 32px 20px 40px; }
}
`;
