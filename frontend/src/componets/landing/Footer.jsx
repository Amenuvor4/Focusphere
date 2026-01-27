import { Link } from "react-router-dom"
import { Github, Mail, Sparkles } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 bg-gradient-to-br from-gray-900 to-slate-900 py-16 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Focusphere
              </h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
              Your AI-powered productivity companion. Let automation handle the busy work while you focus on what matters.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:daarius24@gmail.com"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "#features" },
                { label: "About", href: "#about" },
                { label: "FAQ", href: "#faq" }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="text-white font-semibold mb-6">Get Started</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/Auth" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/Auth?mode=signup" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to="/Auth?mode=signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all hover:scale-105"
              >
                Try Focusphere Free
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Focusphere. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#privacy" className="text-gray-500 hover:text-gray-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-500 hover:text-gray-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
