import { Sparkles, FolderKanban, CheckSquare } from "lucide-react"

const FeaturesSection = () => {
  const features = [
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: "AI Chat Assistant",
      description: "Chat naturally to create tasks, update goals, and get intelligent planning suggestions in real-time.",
      gradient: "from-blue-500 to-blue-600",
      glowColor: "blue"
    },
    {
      icon: <FolderKanban className="w-10 h-10" />,
      title: "Agentic Goal Management",
      description: "Define high-level goals and let the AI propose the sub-tasks needed to achieve them.",
      gradient: "from-cyan-500 to-blue-500",
      glowColor: "cyan"
    },
    {
      icon: <CheckSquare className="w-10 h-10" />,
      title: "Human-in-the-loop",
      description: "The AI proposes actions, but you stay in control. Approve, decline, or edit suggestions with one click.",
      gradient: "from-blue-600 to-cyan-500",
      glowColor: "blue"
    }
  ]

  return (
    <section id="features" className="relative z-10 py-24 sm:py-32 bg-white/95 backdrop-blur-sm overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-block mb-4">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-blue-100/80 rounded-full">
              Features
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
            Why Choose Focusphere?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover powerful features designed to transform your productivity and help you focus on what truly matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 lg:p-10 rounded-3xl bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon container with glow effect */}
                <div className="relative mb-6 inline-block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                  <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    {feature.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
