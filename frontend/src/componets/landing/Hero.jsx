import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const HeroSection = () => {
  return (
    <main className="relative z-10 flex flex-col items-start justify-center min-h-[calc(100vh-80px)] px-6 sm:px-12 lg:px-20 max-w-6xl mt-8 sm:mt-0">
      {/* Pulsing Cloud Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large blue cloud blob */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Medium cyan cloud blob */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Small blue cloud blob */}
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        {/* Extra accent blob */}
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 sm:mb-8 text-balance bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
        Prioritize Smarter,
        <br />
        Achieve <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent italic font-light">Faster</span>
      </h1>

      <p className="text-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 max-w-2xl text-pretty leading-relaxed">
        Welcome to Focusphere – your AI-powered task prioritization tool.
        <br className="hidden sm:block" />
        <span className="sm:hidden"> </span>
        Focus on what matters most with smart prioritization made simple.
      </p>

      <Link
        to="/Auth?mode=signup"
        className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-xs lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border border-blue-500/30 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
      >
        Get Started
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </main>
  )
}

export default HeroSection