import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"

const FAQSection = () => {
  const faqs = [
    {
      question: "How does the AI Assistant work?",
      answer: "Focusphere uses an advanced AI Agent that understands natural language. You can chat with it to create multiple tasks, set complex goals, or ask for an optimized plan for your day based on your current workload."
    },
    {
      question: "What is 'Human-in-the-loop' task management?",
      answer: "It means you stay in control. While the AI suggests actions—like creating tasks or updating priorities—nothing is finalized until you click 'Approve'. You can also edit or decline any suggestion before it hits your dashboard."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. We use industry-standard encryption to ensure your personal tasks, goals, and conversations remain private and accessible only to you."
    },
    {
      question: "Can I sync Focusphere with other devices?",
      answer: "Yes. Focusphere is a cloud-based platform that works seamlessly across desktop and mobile browsers, ensuring your productivity is never interrupted."
    }
  ]

  return (
    <section id="faq" className="relative z-10 py-24 bg-white/40 backdrop-blur-sm border-t border-blue-50">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Support</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">Everything you need to know about the Focusphere AI workflow.</p>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="group bg-white/80 rounded-2xl p-6 border border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-16 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-center text-white shadow-2xl shadow-blue-500/20">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-blue-200" />
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-blue-100 mb-8">Our AI is ready to help you organize your life today.</p>
          <Link to="/Auth?mode=signup" className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all inline-flex items-center gap-2 shadow-lg">
            Start Your Journey <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
