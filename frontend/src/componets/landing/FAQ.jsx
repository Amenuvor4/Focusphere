import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const FAQSection = () => {
  const faqs = [
    {
      question: "What is Focusphere?",
      answer: "Focusphere is an AI-powered task prioritization tool that helps you focus on what matters most. It uses advanced machine learning to analyze your tasks and deadlines, automatically organizing them by priority so you can achieve more in less time."
    },
    {
      question: "How does the AI prioritization work?",
      answer: "Our AI analyzes multiple factors including deadlines, task importance, your work patterns, and dependencies between tasks. It then creates an optimized schedule that helps you tackle the most critical items first, ensuring nothing falls through the cracks."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption to protect your data both in transit and at rest. Your tasks and information are private and only accessible to you. We never share your data with third parties."
    },
    {
      question: "Can I use Focusphere on mobile?",
      answer: "Yes! Focusphere works seamlessly across all your devices. Whether you're on desktop, tablet, or mobile, your tasks sync automatically so you can stay productive anywhere."
    },
    {
      question: "Can I integrate Focusphere with other tools?",
      answer: "Yes! Focusphere integrates with popular productivity tools and calendar apps to fit seamlessly into your existing workflow. Connect your favorite apps and let Focusphere bring everything together."
    }
  ]

  return (
    <section id="faq" className="relative z-10 py-24 sm:py-32 bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-sm overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
              FAQ
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Got questions? We've got answers. Here are some common questions about Focusphere.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 lg:p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA at bottom of FAQ */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6 text-lg">Still have questions?</p>
          <Link
            to="/Auth?mode=signup"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FAQSection