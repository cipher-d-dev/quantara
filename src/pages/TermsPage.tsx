import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EFFECTIVE_DATE = 'June 20, 2026';
const COMPANY_NAME = 'Quantara';
const CONTACT_EMAIL = 'support@quantara.ng';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-0 dark:bg-surface-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-surface-700 dark:text-surface-300 space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">1. Acceptance of Terms</h2>
            <p>
              By registering for any service on {COMPANY_NAME} and completing payment, you confirm that you have read, understood, and agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, you must not proceed with any purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">2. Service Description</h2>
            <p>
              {COMPANY_NAME} provides academic lab report writing and formatting services for registered students. Upon successful payment and submission of your lab guidelines, our team will produce a formatted lab report in accordance with your course requirements. The service does not guarantee any particular academic outcome or grade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">3. Registration &amp; Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide accurate and complete registration information.</li>
              <li>Each registration is for a single course slot per transaction.</li>
              <li>Slots are limited and allocated on a first-come, first-served basis.</li>
              <li>You must be the legitimate holder of the payment method used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">4. Payment</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All payments are processed securely via Paystack. {COMPANY_NAME} does not store card details.</li>
              <li>Prices are listed in Nigerian Naira (NGN) and are inclusive of all applicable fees.</li>
              <li>Payment must be completed in full before your registration is confirmed.</li>
              <li>A payment receipt will be sent to your registered email address upon successful transaction.</li>
              <li>In the event of a failed transaction, no funds will be deducted. If funds are deducted for a failed transaction, contact your bank or reach us at {CONTACT_EMAIL}.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">5. Refund Policy</h2>
            <p className="mb-2">
              Due to the nature of academic services, refunds are subject to the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-surface-900 dark:text-surface-100">Full refund:</strong> Available if you cancel before work on your report has commenced (within 24 hours of registration).</li>
              <li><strong className="text-surface-900 dark:text-surface-100">Partial refund:</strong> If work has commenced but the report has not been delivered, a 50% refund may be considered at our discretion.</li>
              <li><strong className="text-surface-900 dark:text-surface-100">No refund:</strong> Once a completed report has been delivered, no refund will be issued.</li>
              <li>Refund requests must be submitted to {CONTACT_EMAIL} with your payment reference.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">6. Delivery</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Delivery timelines are estimates and may vary based on workload and complexity.</li>
              <li>Pro package students who specify a preferred delivery date will be prioritised accordingly, subject to feasibility.</li>
              <li>Basic package delivery logistics will be coordinated by our team via your registered contact details.</li>
              <li>{COMPANY_NAME} is not liable for delays caused by incomplete or inaccurate lab guidelines submitted by the student.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">7. Lab Guidelines &amp; Submitted Materials</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are responsible for providing accurate and complete lab guidelines at the time of registration.</li>
              <li>Submitted files are used solely for the purpose of producing your report and will not be shared with third parties.</li>
              <li>You represent that you have the right to submit any materials provided and that doing so does not infringe any third-party rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">8. Academic Integrity</h2>
            <p>
              {COMPANY_NAME} provides a formatting and writing assistance service. Students are responsible for understanding and complying with their institution's academic integrity policies. {COMPANY_NAME} accepts no liability for any academic misconduct findings or disciplinary action taken against a student by their institution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">9. Intellectual Property</h2>
            <p>
              Upon full payment and delivery, ownership of the produced report transfers to the student. {COMPANY_NAME} retains no rights to use, reproduce, or distribute your report. The {COMPANY_NAME} platform, branding, and codebase remain the exclusive property of {COMPANY_NAME}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {COMPANY_NAME} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability to you for any claim arising from these terms shall not exceed the amount paid by you for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">11. Privacy</h2>
            <p>
              By using {COMPANY_NAME}, you consent to the collection and use of your personal data (name, email, phone, department) for the purpose of delivering our services and communicating with you. We do not sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">12. Modifications</h2>
            <p>
              {COMPANY_NAME} reserves the right to update these Terms &amp; Conditions at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">14. Contact</h2>
            <p>
              For questions, disputes, or refund requests, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-600 dark:text-brand-400 hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
