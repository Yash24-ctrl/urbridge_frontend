import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | UrBridge.ai";
  }, []);

  return (
    <main className="dashboard-page legal-page-bg">
      <section className="dashboard-shell legal-page-shell">
        <article className="dashboard-panel legal-page-card">
          <Link className="legal-back-link" to="/">
            Back to Home
          </Link>
          <h1>PRIVACY POLICY</h1>
          <p className="legal-meta">
            <strong>Effective Date:</strong> July 1, 2026
          </p>
          <p className="legal-meta">
            <strong>Last Updated:</strong> July 1, 2026
          </p>

          <section id="privacy-commitment">
            <h2>OUR COMMITMENT TO YOUR PRIVACY</h2>
            <p>
              Welcome to UrBridge (&quot;UrBridge,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a service
              operated by Neuronet Systems Private Limited, a company based in Vadodara, Gujarat, India.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, process, disclose, and protect your personal
              information when you access or use our website, mobile applications, and services (collectively, the
              &quot;Services&quot;).
            </p>
            <p>
              By using our Services, you acknowledge that you have read, understood, and agree to the collection and use
              of information in accordance with this Privacy Policy. If you do not agree with this Privacy Policy, please
              discontinue use of the Services immediately.
            </p>
            <p>We recommend that you print or save a copy of this Privacy Policy for your records.</p>
          </section>

          <section id="privacy-summary">
            <h2>SUMMARY OF KEY POINTS</h2>
            <p>
              This summary provides key points from our Privacy Policy, but you can find out more details about any of
              these topics by using the table of contents below.
            </p>
            <p>
              <strong>What information do you collect?</strong> We collect information you provide directly (such as your
              name, contact details, resume, and career information), account and authentication information, payment
              information (handled by third-party processors), and information collected automatically, such as device and
              usage data. See &quot;Information We Collect.&quot;
            </p>
            <p>
              <strong>Do you use AI to process my information?</strong> Yes. We use AI to analyze resumes, generate ATS
              scores, and provide career recommendations. AI outputs are for informational purposes only. See &quot;AI
              Processing.&quot;
            </p>
            <p>
              <strong>Do you sell my personal information?</strong> No. We do not sell your personal information to
              anyone. See &quot;Information Sharing.&quot;
            </p>
            <p>
              <strong>How do you keep my information safe?</strong> We use encryption, password hashing, access controls,
              and other administrative and technical safeguards. See &quot;Data Security.&quot;
            </p>
            <p>
              <strong>What rights do I have regarding my data?</strong> You may access, correct, update, or request
              deletion of your personal information, subject to applicable law. See &quot;Your Rights.&quot;
            </p>
            <p>
              <strong>How can I contact you?</strong> You can reach us using the contact details in &quot;Contact Us&quot;
              below.
            </p>
          </section>

          <nav className="legal-toc legal-toc-vertical" aria-label="Privacy policy table of contents">
            <strong>Table of contents</strong>
            <a href="#privacy-1">1. Information We Collect</a>
            <a href="#privacy-2">2. How We Use Your Information</a>
            <a href="#privacy-3">3. AI Processing</a>
            <a href="#privacy-4">4. Legal Basis for Processing</a>
            <a href="#privacy-5">5. Information Sharing</a>
            <a href="#privacy-6">6. Third-Party Services</a>
            <a href="#privacy-7">7. Data Retention</a>
            <a href="#privacy-8">8. Data Security</a>
            <a href="#privacy-9">9. Your Rights</a>
            <a href="#privacy-10">10. Children’s Privacy</a>
            <a href="#privacy-11">11. International Data Transfers</a>
            <a href="#privacy-12">12. Communications</a>
            <a href="#privacy-13">13. User Responsibilities</a>
            <a href="#privacy-14">14. Data Breach Response</a>
            <a href="#privacy-15">15. Changes to This Privacy Policy</a>
            <a href="#privacy-16">16. Governing Law</a>
            <a href="#privacy-17">17. Consent</a>
            <a href="#privacy-18">18. Contact Us</a>
          </nav>

          <section id="privacy-1">
            <h2>1. INFORMATION WE COLLECT</h2>
            <p>
              <strong>In Short:</strong> We collect information you give us directly, information generated through your
              use of the Services, and information collected automatically.
            </p>
            <h3>A. Personal Information</h3>
            <p>When you create an account or use our Services, we may collect:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Mobile number</li>
              <li>Date of birth (if provided)</li>
              <li>Profile photograph (optional)</li>
              <li>Educational qualifications</li>
              <li>Professional experience</li>
              <li>Skills</li>
              <li>Career interests</li>
              <li>Employment preferences</li>
              <li>Location (if voluntarily provided)</li>
            </ul>
            <h3>B. Resume and Career Information</h3>
            <p>When you upload or create a resume, we may collect:</p>
            <ul>
              <li>Resume files (PDF, DOC, DOCX)</li>
              <li>Employment history</li>
              <li>Academic records</li>
              <li>Certifications</li>
              <li>Skills</li>
              <li>Projects</li>
              <li>Achievements</li>
              <li>Portfolio links</li>
              <li>Professional summaries</li>
            </ul>
            <p>
              This information is used solely to provide resume analysis, ATS scoring, resume building, and personalized
              career recommendations.
            </p>
            <h3>C. Account Information</h3>
            <p>We collect:</p>
            <ul>
              <li>Username</li>
              <li>Password (stored in encrypted or hashed form)</li>
              <li>Authentication tokens</li>
              <li>Login history</li>
              <li>Account preferences</li>
            </ul>
            <h3>D. Google Sign-In Information</h3>
            <p>If you choose to sign in using Google, we may receive:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Profile picture</li>
              <li>Google Account identifier</li>
            </ul>
            <p>We only access the information that you authorize through Google’s authentication services.</p>
            <h3>E. Payment Information</h3>
            <p>
              If you purchase premium services, payments are processed by trusted third-party payment providers. We do not
              store your complete debit card, credit card, UPI PIN, CVV, or banking credentials on our servers.
            </p>
            <h3>F. Automatically Collected Information</h3>
            <p>When you use our Services, we may automatically collect:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Device information</li>
              <li>Language preferences</li>
              <li>Date and time of access</li>
              <li>Pages visited</li>
              <li>Clickstream information</li>
              <li>Session duration</li>
              <li>Referral URLs</li>
            </ul>
            <h3>G. Cookies and Similar Technologies</h3>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain user sessions</li>
              <li>Remember preferences</li>
              <li>Improve website functionality</li>
              <li>Analyze website traffic</li>
              <li>Enhance security</li>
              <li>Personalize user experience</li>
            </ul>
            <p>
              You may disable cookies through your browser settings, although certain features may not function properly.
            </p>
          </section>

          <section id="privacy-2">
            <h2>2. HOW WE USE YOUR INFORMATION</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Authenticate users</li>
              <li>Analyze resumes</li>
              <li>Generate ATS compatibility scores</li>
              <li>Provide AI-powered career recommendations</li>
              <li>Offer resume improvement suggestions</li>
              <li>Deliver interview preparation services</li>
              <li>Improve our AI models and platform features</li>
              <li>Respond to support requests</li>
              <li>Send service-related notifications</li>
              <li>Detect fraud and abuse</li>
              <li>Ensure platform security</li>
              <li>Comply with applicable laws</li>
            </ul>
          </section>

          <section id="privacy-3">
            <h2>3. AI PROCESSING</h2>
            <p>
              <strong>In Short:</strong> UrBridge uses AI to analyze resumes and generate career guidance. AI outputs are
              informational only and are not a substitute for professional advice.
            </p>
            <p>Your uploaded content may be processed using AI technologies to:</p>
            <ul>
              <li>Analyze resumes</li>
              <li>Generate improvement suggestions</li>
              <li>Recommend skills</li>
              <li>Identify missing keywords</li>
              <li>Provide career insights</li>
              <li>Improve resume formatting</li>
              <li>Deliver interview guidance</li>
            </ul>
            <p>
              AI-generated outputs are intended for informational purposes only and should not be considered professional
              legal, employment, or financial advice.
            </p>
          </section>

          <section id="privacy-4">
            <h2>4. LEGAL BASIS FOR PROCESSING</h2>
            <p>Where applicable, we process personal information based on one or more of the following legal grounds:</p>
            <ul>
              <li>Your consent</li>
              <li>Performance of a contract</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate business interests</li>
              <li>Protection of vital interests</li>
              <li>Public interest where applicable</li>
            </ul>
          </section>

          <section id="privacy-5">
            <h2>5. INFORMATION SHARING</h2>
            <p>
              <strong>In Short:</strong> We do not sell your personal information. We share it only with service providers
              who help us operate the Services, or when required by law.
            </p>
            <p>We may share your information with:</p>
            <ul>
              <li>Cloud hosting providers</li>
              <li>Authentication providers</li>
              <li>Payment processors</li>
              <li>Analytics providers</li>
              <li>Email service providers</li>
              <li>AI service providers</li>
              <li>Customer support platforms</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>
              Each service provider is expected to process personal information in accordance with applicable privacy and
              security requirements.
            </p>
          </section>

          <section id="privacy-6">
            <h2>6. THIRD-PARTY SERVICES</h2>
            <p>Our Services may integrate with third-party platforms, including but not limited to:</p>
            <ul>
              <li>Google Authentication</li>
              <li>Payment gateways</li>
              <li>Analytics providers</li>
              <li>Cloud storage services</li>
              <li>AI service providers</li>
              <li>Email delivery services</li>
            </ul>
            <p>
              These third parties have their own privacy policies, and we encourage you to review them before using their
              services.
            </p>
          </section>

          <section id="privacy-7">
            <h2>7. DATA RETENTION</h2>
            <p>
              We retain personal information only for as long as necessary to:
            </p>
            <ul>
              <li>Provide our Services</li>
              <li>Maintain your account</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>
            <p>
              When information is no longer required, it will be securely deleted, anonymized, or archived in accordance
              with applicable law.
            </p>
          </section>

          <section id="privacy-8">
            <h2>8. DATA SECURITY</h2>
            <p>
              <strong>In Short:</strong> We implement reasonable safeguards to protect your information, but no method of
              transmission or storage is completely secure.
            </p>
            <p>
              We implement reasonable administrative, technical, and organizational safeguards to protect your
              information, including:
            </p>
            <ul>
              <li>Encryption of data in transit where applicable</li>
              <li>Password hashing</li>
              <li>Access controls</li>
              <li>Secure cloud infrastructure</li>
              <li>Regular security monitoring</li>
              <li>Vulnerability assessments</li>
              <li>Backup and disaster recovery procedures</li>
            </ul>
            <p>
              While we strive to protect your information, no method of transmission or storage is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section id="privacy-9">
            <h2>9. YOUR RIGHTS</h2>
            <p>Subject to applicable law, you may have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Update your account details</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Object to certain processing activities</li>
              <li>Request a copy of your personal data</li>
              <li>Request restriction of processing where applicable</li>
            </ul>
            <p>Requests may be subject to identity verification.</p>
          </section>

          <section id="privacy-10">
            <h2>10. CHILDREN’S PRIVACY</h2>
            <p>
              Our Services are not intended for children under the age required by applicable law to consent
              independently to data processing.
            </p>
            <p>
              We do not knowingly collect personal information from children without appropriate authorization. If we
              become aware that such information has been collected, we will take reasonable steps to delete it.
            </p>
          </section>

          <section id="privacy-11">
            <h2>11. INTERNATIONAL DATA TRANSFERS</h2>
            <p>
              Your information may be processed or stored on servers located in jurisdictions outside your country of
              residence.
            </p>
            <p>
              Where applicable, we implement appropriate safeguards for international data transfers in accordance with
              applicable data protection laws.
            </p>
          </section>

          <section id="privacy-12">
            <h2>12. COMMUNICATIONS</h2>
            <p>We may send:</p>
            <ul>
              <li>Account notifications</li>
              <li>Security alerts</li>
              <li>Password reset emails</li>
              <li>Service updates</li>
              <li>Product announcements</li>
              <li>Promotional communications (where permitted)</li>
            </ul>
            <p>
              You may opt out of marketing communications at any time using the unsubscribe mechanism provided or by
              contacting us.
            </p>
          </section>

          <section id="privacy-13">
            <h2>13. USER RESPONSIBILITIES</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Providing accurate information</li>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Keeping your account information up to date</li>
              <li>Ensuring that uploaded content does not infringe the rights of others</li>
            </ul>
          </section>

          <section id="privacy-14">
            <h2>14. DATA BREACH RESPONSE</h2>
            <p>
              In the event of a data breach that is likely to pose a risk to your rights or interests, we will take
              reasonable steps to investigate, mitigate, and notify affected users and relevant authorities where required
              by applicable law.
            </p>
          </section>

          <section id="privacy-15">
            <h2>15. CHANGES TO THIS PRIVACY POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes become effective upon posting the updated
              version on our website. Continued use of the Services after such changes constitutes acceptance of the
              revised Privacy Policy.
            </p>
          </section>

          <section id="privacy-16">
            <h2>16. GOVERNING LAW</h2>
            <p>
              This Privacy Policy shall be governed by and construed in accordance with the laws of India, without regard
              to conflict of law principles.
            </p>
          </section>

          <section id="privacy-17">
            <h2>17. CONSENT</h2>
            <p>
              By creating an account, accessing, or using the Services, you acknowledge that you have read, understood,
              and agree to this Privacy Policy.
            </p>
          </section>

          <section id="privacy-18">
            <h2>18. CONTACT US</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices,
              please contact us at:
            </p>
            <p>Neuronet Systems Private Limited</p>
            <p>Email: info@neuronet.in</p>
            <p>Website: https://urbridge.in</p>
            <p>Address: Vadodara, Gujarat, India</p>
            <p>We aim to respond to all inquiries within 5 business days.</p>
            <p>© 2026 Neuronet Systems Private Limited. All rights reserved.</p>
          </section>
        </article>
      </section>
    </main>
  );
}

