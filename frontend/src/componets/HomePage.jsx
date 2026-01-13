import { useState } from "react"
import AnimatedBackground from "./landing/AnimatedBackground"
import Header from "./landing/Header"
import Hero from "./landing/Hero"
import Features from "./landing/Features"
import About from "./landing/About"
import FAQ from "./landing/FAQ"
import Footer from "./landing/Footer"

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - White with Blue Streaks */}
      <AnimatedBackground />
      {/* Header */}
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <Features />
      {/* About Section */}
      <About />
      {/* FAQ Section */}
      <FAQ/>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HomePage