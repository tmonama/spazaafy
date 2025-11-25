// src/pages/PrivacyPolicyPage.tsx

import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white dark:bg-dark-surface shadow-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Spazaafy Privacy Policy
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              POPIA-Compliant • Last updated: November 2025
            </p>
          </div>
          <Link
            to="/register"
            className="text-xs sm:text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
          >
            &larr; Back to Register
          </Link>
        </div>

        <div className="mt-4 space-y-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              1. Introduction
            </h2>
            <p>
              Spazaafy (“the Platform”, “we”, “our”) is a compliance-verification
              and digital trust system designed to digitise informal retailers
              (spaza shops) across South Africa. We are committed to protecting
              personal information in accordance with the Protection of Personal
              Information Act (POPIA).
            </p>
            <p className="mt-1">
              This Privacy Policy explains how we collect, process, share, store,
              and protect personal information belonging to consumers, spaza shop
              owners, municipalities, FMCG suppliers, field agents, and support
              staff.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              2. Information We Collect
            </h2>
            <p className="mb-1 font-medium">2.1 Personal Information</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Encrypted password</li>
              <li>Language and accessibility preferences</li>
              <li>Device and technical information (for example OS, browser, IP)</li>
            </ul>
            <p className="mt-2 mb-1 font-medium">
              2.2 Business &amp; Compliance Information (Shop Owners)
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Shop name, business address, and province</li>
              <li>Trading, health, and safety certificates</li>
              <li>Tax, registration, or licensing documentation</li>
              <li>
                Owner identification details where they appear on uploaded
                documents
              </li>
            </ul>
            <p className="mt-2 mb-1 font-medium">2.3 Geolocation Information</p>
            <p>
              We collect geolocation information to verify shop locations, map
              verified shops, power proximity-based search, and detect fraud.
              This may include GPS coordinates, time stamps, and derived address
              information.
            </p>
            <p className="mt-2 mb-1 font-medium">2.4 Technical &amp; Usage Data</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Login timestamps and session data</li>
              <li>Error logs and diagnostic information</li>
              <li>Cookie identifiers (see section 13)</li>
            </ul>
            <p className="mt-2 mb-1 font-medium">2.5 Support &amp; Ticket Data</p>
            <p>
              When you contact support, we collect issue descriptions,
              attachments, role and app version metadata, and resolution history.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              3. How We Collect Information
            </h2>
            <p>
              We collect information directly from you (for example when you
              register, upload documents, or contact support), automatically when
              you use the Platform (such as device and log data), through field
              agent verification activities, and from partners like municipalities
              or NGOs who assist with onboarding and verification.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              4. Lawful Basis for Processing
            </h2>
            <p>
              We process personal information under several lawful bases in terms
              of POPIA:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                <span className="font-semibold">Consent</span> – for example,
                when you register, upload documents, or enable location services.
              </li>
              <li>
                <span className="font-semibold">Contractual necessity</span> – to
                provide your account, verification, and related services.
              </li>
              <li>
                <span className="font-semibold">Public interest &amp; public health</span>{" "}
                – to support municipalities and communities in addressing food
                safety and compliance risks.
              </li>
              <li>
                <span className="font-semibold">Legal obligation</span> – when we
                are required to comply with laws, by-laws, or lawful requests.
              </li>
              <li>
                <span className="font-semibold">Legitimate interests</span> – such
                as preventing fraud, securing the Platform, and improving our
                services in ways that do not override your rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              5. How We Use Information
            </h2>
            <p>We use information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Register and authenticate users and accounts.</li>
              <li>Verify and track compliance status of spaza shops.</li>
              <li>Display verified shops to consumers by proximity and filters.</li>
              <li>Provide dashboards and reports to municipalities and suppliers.</li>
              <li>
                Send notifications about compliance status, document expiry, and
                important changes.
              </li>
              <li>Respond to queries, support requests, and technical issues.</li>
              <li>
                Generate anonymised analytics and statistics for planning and
                reporting.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              6. Sharing of Information
            </h2>
            <p className="mb-1">
              We do <span className="font-semibold">not</span> sell your personal
              information.
            </p>
            <p className="mb-1 font-medium">Internal recipients</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verification and moderation teams</li>
              <li>Field agents and onboarding staff</li>
              <li>Support and technical staff</li>
              <li>Authorised admin and dashboard users</li>
            </ul>
            <p className="mt-2 mb-1 font-medium">External recipients</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Municipalities and regulators for compliance oversight</li>
              <li>
                FMCG suppliers and distributors for verified outlet lists and
                aggregated analytics
              </li>
              <li>NGOs and community partners assisting with onboarding</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Payment service providers for subscription payments</li>
              <li>Professional advisors such as auditors and legal counsel</li>
            </ul>
            <p className="mt-2">
              We may also disclose information where required by law or where we
              reasonably believe it is necessary to protect our rights, our users,
              or the public.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              7. Automated Decision-Making
            </h2>
            <p>
              We use automated systems to flag missing or expired documents,
              generate compliance statuses, trigger reminders, and detect risk or
              fraud patterns. You may request a manual review if you believe an
              automated outcome is incorrect.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              8. Data Security
            </h2>
            <p>
              We implement technical and organisational measures such as
              encryption in transit, secure hosting, access controls, security
              testing, password hashing, access logging, and incident response
              procedures. While no system is completely secure, we are committed
              to continuous improvement of our safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              9. Data Retention
            </h2>
            <p>
              We retain personal information only for as long as reasonably
              necessary for the purposes described in this Policy or as required
              by law. For example, compliance documents may be kept for at least
              five years; support tickets for around twelve months; and analytics
              data may be retained in anonymised form for longer periods.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              10. Your Rights Under POPIA
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Be informed about how your data is used.</li>
              <li>Request access to the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>
                Request deletion of personal information where there is no lawful
                basis to retain it.
              </li>
              <li>
                Object to processing on reasonable grounds, or withdraw consent
                where processing is based on consent.
              </li>
              <li>
                Lodge a complaint with the Information Regulator if you believe
                your rights have been infringed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              11. Location Data
            </h2>
            <p>
              Our apps may request access to your device&apos;s location to verify
              shop locations, show nearby verified outlets, and support fraud
              detection. You can disable location in your device or browser
              settings, but certain features may not function correctly without
              it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              12. Children&apos;s Data
            </h2>
            <p>
              We do not intentionally collect personal information directly from
              children (under 18). The Platform is aimed at adults and
              organisations. Because our work relates to food safety and public
              health, we apply heightened ethical and security standards where
              our processing may indirectly affect children.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              13. Cookies and Similar Technologies
            </h2>
            <p>
              The web version of Spazaafy uses cookies to maintain login
              sessions, remember preferences, and collect basic usage analytics.
              You can manage or disable cookies in your browser settings, but
              some features may not function correctly without essential cookies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              14. Cross-Border Transfers
            </h2>
            <p>
              Your information may be stored or processed on servers located
              outside South Africa. Where cross-border transfers occur, we ensure
              that appropriate protections are in place and that transfers comply
              with POPIA (for example, adequate laws, binding agreements, or
              your consent).
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              15. Third-Party Links
            </h2>
            <p>
              The Platform may contain links to third-party websites or services.
              We are not responsible for the privacy practices or content of
              those parties and encourage you to read their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              16. Changes to This Policy
            </h2>
            <p>
              We may update this Policy from time to time. The updated version
              will be indicated by the &quot;Last updated&quot; date at the top and may
              be communicated via in-app notices, email, or our website. Your
              continued use of the Platform after changes are made constitutes
              acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
              17. Contact Details
            </h2>
            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact:
            </p>
            <p className="mt-1">
              Email:{" "}
              <a
                href="mailto:legal@spazaafy.co.za"
                className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
              >
                legal@spazaafy.co.za
              </a>
              <br />
              General email:{" "}
              <a
                href="mailto:spazaafy@gmail.com"
                className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
              >
                spazaafy@gmail.com
              </a>
              <br />
            </p>
            <p className="mt-2">
              You also have the right to lodge a complaint with the Information
              Regulator (South Africa):{" "}
              <a
                href="https://inforegulator.org.za"
                className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
              >
                https://inforegulator.org.za
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
