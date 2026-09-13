"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Is ClinicPro HIPAA compliant?",
    answer: "Yes, absolutely. ClinicPro is fully HIPAA compliant. We encrypt all Patient Health Information (PHI) both in transit and at rest using AES-256 encryption, maintain comprehensive audit logs, and sign Business Associate Agreements (BAAs)."
  },
  {
    question: "Can we migrate our existing patient records into ClinicPro?",
    answer: "Yes. We offer built-in import utilities supporting standard CSV, HL7, and CCDA formats. Our dedicated onboarding team is also available to handle custom database migrations from your legacy EHR software."
  },
  {
    question: "How long does the setup process take?",
    answer: "Most clinics start booking appointments on their first day! Customizing workflows, importing patient records, and setting up staff accounts typically takes between 3 to 7 business days, depending on clinic size."
  },
  {
    question: "Do you offer customer support and training?",
    answer: "Yes, we provide 24/7 priority email and chat support. Higher-tier plans also include a dedicated account manager, telephone support, and personalized training sessions for your entire staff."
  }
]

export function LandingFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openFaq === idx
        return (
          <div
            key={idx}
            className="border border-border/40 bg-background rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <button
              onClick={() => toggleFaq(idx)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base hover:bg-muted/30 transition-colors"
            >
              <span>{faq.question}</span>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-[200px] border-t border-border/30 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <p className="p-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
