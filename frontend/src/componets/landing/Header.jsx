import { Link } from "react-router-dom"
import { Menu, X, Sparkles } from "lucide-react"

const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <header className="relative z-50 w-full pt-4 px-4 sm:px-6 lg:px-8">
      {/* Floating pill container */}
      <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-md border border-blue-100/50 rounded-full px-4 sm:px-6 py-3 shadow-lg shadow-blue-500/5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <a href="#home" className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Focusphere
            </a>
          </div>

          {/* Desktop Nav - Centered */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
              About
            </a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
              FAQ
            </a>
          </nav>

          {/* CTA Button */}
          <Link
            to="/Auth?mode=signup"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md shadow-blue-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
          >
            Get Started
          </Link>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white/80 backdrop-blur-md border border-blue-100/50 rounded-2xl shadow-xl shadow-blue-500/10 overflow-hidden">
          <nav className="flex flex-col p-4 gap-1">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              About
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              FAQ
            </a>
            <div className="pt-2 mt-2 border-t border-blue-100">
              <Link
                to="/Auth?mode=signup"
                className="block bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2.5 rounded-xl text-center font-medium"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
