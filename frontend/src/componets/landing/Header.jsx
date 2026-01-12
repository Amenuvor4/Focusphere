import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"

const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <>
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12">
        <div className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            <a href="#home">Focusphere</a>
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#features" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">
            Features
          </a>
          <a href="#about" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">
            About
          </a>
          <a href="#faq" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">
            FAQ
          </a>
          <Link to="/Auth" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">
            Login
          </Link>
        </nav>

        <button 
          className="md:hidden text-blue-700 p-2" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link
          to="/Auth?mode=signup"
          className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 lg:px-6 py-2 rounded-xl text-sm lg:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
        >
          Sign Up
        </Link>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-blue-200 z-20 shadow-lg">
          <nav className="flex flex-col space-y-4 px-6 py-6">
            <a href="#home" className="text-blue-700 hover:text-blue-900 transition-colors">
              Home
            </a>
            <a href="#features" className="text-blue-700 hover:text-blue-900 transition-colors">
              Features
            </a>
            <a href="#about" className="text-blue-700 hover:text-blue-900 transition-colors">
              About
            </a>
            <a href="#faq" className="text-blue-700 hover:text-blue-900 transition-colors">
              FAQ
            </a>
            <Link to="/Auth" className="text-blue-700 hover:text-blue-900 transition-colors">
              Login
            </Link>
            <Link
              to="/Auth?mode=signup"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg w-fit"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}

export default Header