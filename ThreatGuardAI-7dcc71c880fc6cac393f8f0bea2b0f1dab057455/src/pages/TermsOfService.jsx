import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-card-lg p-8 sm:p-12 border border-navy-100">
          <h1 className="text-3xl font-extrabold text-navy-900 mb-6 underline decoration-brand-blue/30 underline-offset-8">Terms of Service</h1>
          <p className="text-navy-400 text-sm mb-8 italic">Last Updated: March 25, 2026</p>

          <div className="space-y-8 text-navy-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using ThreatGuardAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">2. Description of Service</h2>
              <p>
                ThreatGuardAI provides AI-powered network security analysis and threat detection tools. We use advanced machine learning models to identify potential security risks in network traffic data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">3. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to use the service only for lawful purposes and in accordance with these terms.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>You must provide accurate registration information.</li>
                <li>You must not attempt to interfere with the proper working of the service.</li>
                <li>You are responsible for the data you upload for analysis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">4. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are and will remain the exclusive property of ThreatGuardAI and its licensors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">5. Limitation of Liability</h2>
              <p>
                ThreatGuardAI is provided "as is" without any warranties. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will provide notice of any significant changes by posting the new terms on this page.
              </p>
            </section>

            <section className="pt-8 border-t border-navy-50">
              <p className="text-sm text-navy-500">
                If you have any questions about these Terms, please contact us at <span className="text-brand-blue font-medium">support@threatguardai.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
