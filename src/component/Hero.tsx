"use client"
import Link from "next/link";
const Hero = () => {
  return (
    <section className="home">
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/" className="brand"><span>V</span> VivaTrust Bank</Link>
        <div className="site-nav-links"><a href="#services">Services</a><a href="#why-vivatrust">Why VivaTrust</a><a href="#contact">Contact</a></div>
        <Link href="/login" className="nav-signin">Sign in</Link>
      </nav>
      <div className="hero modern-hero">
        <div className="hero-copy">
          <p className="eyebrow">BANKING, MADE PERSONAL</p>
          <h1>Confidence for every <em>financial move.</em></h1>
          <p className="hero-description">A clearer, more secure way to manage your money, build your future, and stay in control from anywhere.</p>
          <div className="hero-actions"><Link className="hero_link" href="/signup">Open an account <span>→</span></Link><Link className="secondary-link" href="/login">Sign in to banking</Link></div>
          <div className="hero-trust"><span className="trust-mark">✓</span><p>Your security is our standard <small>Protected with bank-grade safeguards</small></p></div>
        </div>
        <div className="hero-visual" aria-label="VivaTrust account overview">
          <div className="visual-glow" />
          <div className="account-preview">
            <div className="preview-header"><span className="brand mini"><b>V</b> VivaTrust</span><span className="status-dot">Protected</span></div>
            <p className="preview-label">Available balance</p><strong>$24,850<span>.00</span></strong>
            <div className="balance-chart"><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="preview-footer"><span>•••• 4829</span><span>VISA</span></div>
          </div>
          <div className="floating-card transfer-card"><span>↗</span><div><small>Transfer complete</small><b>$2,400.00</b></div></div>
          <div className="floating-card growth-card"><span>↗</span><div><small>Monthly progress</small><b>+12.8%</b></div></div>
        </div>
      </div>
      <div className="hero-proof"><p>Trusted tools for modern financial lives</p><div><span>Secure access</span><span>Smart transfers</span><span>Clear insights</span><span>Human support</span></div></div>
    </section>
  )
}

export default Hero
