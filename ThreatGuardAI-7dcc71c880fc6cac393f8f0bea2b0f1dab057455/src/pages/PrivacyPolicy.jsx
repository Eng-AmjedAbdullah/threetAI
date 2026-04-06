import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-card-lg p-8 sm:p-12 border border-navy-100">
          <h1 className="text-3xl font-extrabold text-navy-900 mb-6 underline decoration-brand-blue/30 underline-offset-8">Privacy Policy</h1>
          <p className="text-navy-400 text-sm mb-8 italic">Last Updated: March 25, 2026</p>

          <div className="space-y-8 text-navy-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us when you create an account, use our services, or communicate with us.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Account information: name, email, password.</li>
                <li>Usage data: network traffic logs and data you upload for analysis.</li>
                <li>Device information: IP address, browser type, operating system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Analyzing network traffic for threat detection.</li>
                <li>Personalizing your experience and providing customer support.</li>
                <li>Sending you technical notices, updates, and security alerts.</li>
                <li>Monitoring and analyzing trends, usage, and activities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
              </p>
              <p className="mt-2">
                Your data is stored securely and access is strictly controlled. We use encryption for sensitive data both in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">4. Data Retention</h2>
              <p>
                We retain account information for as long as your account is active. You can request deletion of your account and associated data at any time through your profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">5. Your Choices</h2>
              <p>
                You may update or correct your account information at any time by logging into your account. You may also opt out of receiving promotional communications from us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy-900 mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <span className="text-brand-blue font-medium">privacy@threatguardai.com</span>
              </p>
            </section>

            <section className="pt-8 border-t border-navy-50">
              <p className="text-sm text-navy-500">
                Your privacy is important to us. We are committed to protecting your personal data and being transparent about how we use it.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
