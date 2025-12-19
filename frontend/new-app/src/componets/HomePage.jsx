import { Link } from "react-router-dom"
import { Chrome, BarChart3, Calendar, Settings, Github, Mail } from "lucide-react"

const HomePage = () => {
  return (
    <div className="bg-black">
      {/* Hero section with gradient background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 min-h-screen">
        {/* Curved shapes in background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 w-1/2 h-full transform translate-x-1/4 translate-y-1/4 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-1/4 w-1/2 h-full transform -translate-y-1/4 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-10">
          <div className="container mx-auto px-6 py-6 justify-center">
            <div className="flex items-center justify-between 2-full min-w-0 ">
              {/* Logo on the left */}
              <h1 className="text-2xl font-bold text-white whitespace-nowrap">Focusphere</h1>

              {/* Navigation Menu - Centered on large screens */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#home" className="text-white/90 hover:text-white transition-colors">Home</a>
                <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
                <a href="#about" className="text-white/90 hover:text-white transition-colors">About</a>
                <a href="#contact" className="text-white/90 hover:text-white transition-colors">Contact</a>
                <Link to="/Auth" className="text-white/90 hover:text-white transition-colors">Login</Link>
                <Link to="/Auth?mode=signup" className="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors">
                  Sign Up
                </Link>
              </nav>

              {/* Mobile Menu Button - Right-aligned */}
              <button className="md:hidden text-white ml-auto flex justify-end">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-48">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">Prioritize Smarter, Achieve Faster</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Welcome to Focusphere – your AI-powered task prioritization tool. Focus on what matters most with smart
              prioritization made simple.
            </p>
            <Link
              to="/Auth?mode=signup"
              className="inline-flex px-8 py-3 rounded-full border-2 border-white/30 text-white text-lg font-medium hover:bg-white/10 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-xl text-center mb-16 text-gray-600 max-w-2xl mx-auto">
            Discover how Focusphere can transform your productivity with these powerful features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group p-8 rounded-2xl transition-all hover:bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="mb-6 p-4 rounded-2xl bg-blue-500 text-white inline-block group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Prioritization</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your behavior and deadlines to optimize your task list.
              </p>
            </div>
            <div className="group p-8 rounded-2xl transition-all hover:bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="mb-6 p-4 rounded-2xl bg-blue-500 text-white inline-block group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Efficient Planning</h3>
              <p className="text-gray-600">Plan your tasks more effectively with our intuitive calendar integration.</p>
            </div>
            <div className="group p-8 rounded-2xl transition-all hover:bg-gradient-to-br from-blue-50 to-cyan-50">
              <div className="mb-6 p-4 rounded-2xl bg-blue-500 text-white inline-block group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Seamless Integration</h3>
              <p className="text-gray-600">
                Sync effortlessly across all your devices for a unified productivity experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections with updated styling */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img src="/placeholder.svg" alt="AI Technology" className="rounded-2xl shadow-xl" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Powered by Advanced AI</h2>
              <p className="text-xl mb-8 text-gray-600">
                Focusphere uses cutting-edge machine learning to analyze your work patterns and optimize your
                productivity. Stay focused and achieve more with our intelligent task management system.
              </p>
              <ul className="space-y-4">
                {[
                  "Smart task prioritization based on deadlines and importance",
                  "Personalized recommendations that adapt to your work style",
                  "Automated task creation and scheduling suggestions",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar section with gradient background */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-400 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-white">Effortless Scheduling</h2>
              <p className="text-xl mb-8 text-white/90">
                Our intuitive calendar integration ensures you never miss a deadline. Focusphere helps you plan your
                tasks efficiently and reminds you as important dates approach.
              </p>
              <ul className="space-y-4">
                {[
                  "Seamless integration with popular calendar apps",
                  "Smart reminders that adapt to your schedule",
                  "Visual timeline of upcoming tasks and deadlines",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img src="/placeholder.svg" alt="Calendar Integration" className="rounded-2xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Productivity?</h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their work life with Focusphere.
          </p>
          <Link
            to="/Auth?mode=signup"
            className="inline-flex px-8 py-3 rounded-full bg-blue-500 text-white text-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Focusphere</h3>
              <p className="text-gray-600 mb-4">AI-powered task management for enhanced productivity.</p>
              <div className="flex space-x-4">
                <a href="#github" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#gmail" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["Home", "Features", "About", "Contact"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-600 hover:text-blue-500 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <p className="text-gray-600">Email: daarius24@gmail.com</p>
              <p className="text-gray-600">Phone: (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Download</h3>
              <button className="flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors">
                <Chrome className="w-5 h-5 mr-2" /> Chrome Extension
              </button>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">&copy; 2025 Focusphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage


