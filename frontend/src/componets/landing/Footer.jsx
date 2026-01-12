import { Github, Mail } from "lucide-react"

const Footer = () => {
  return (
    <footer className="relative z-10 bg-gradient-to-br from-gray-900 to-slate-900 py-16 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Focusphere
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              AI-powered task management for enhanced productivity.
            </p>
            <div className="flex space-x-4">
              <a href="#github" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="#gmail" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {["Features", "About", "FAQ"].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <p className="text-gray-400">Email: daarius24@gmail.com</p>
            <p className="text-gray-400">Phone: (123) 456-7890</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Download</h3>
            <button className="flex items-center px-4 py-2 rounded-lg border-2 border-blue-500/30 text-gray-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Chrome Extension
            </button>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">&copy; 2025 Focusphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer