const AboutSection = () => {
  const benefits = [
    {
      text: "Smart task prioritization based on deadlines and importance",
      icon: "✓"
    },
    {
      text: "Personalized recommendations that adapt to your work style",
      icon: "✓"
    },
    {
      text: "Automated task creation and scheduling suggestions",
      icon: "✓"
    }
  ]

  return (
    <section id="about" className="relative z-10 py-24 sm:py-32 bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-sm overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex justify-center lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content Side */}
          <div className="lg:w-1/2 w-full">
            <div className="inline-block mb-4">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                About Us
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent leading-tight">
              Powered by Advanced AI
            </h2>
            
            <p className="text-xl mb-8 text-gray-700 leading-relaxed">
              Focusphere uses cutting-edge machine learning to analyze your work patterns and optimize your
              productivity. Stay focused and achieve more with our intelligent task management system.
            </p>
            
            <ul className="space-y-5 mb-8">
              {benefits.map((item, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed flex-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection