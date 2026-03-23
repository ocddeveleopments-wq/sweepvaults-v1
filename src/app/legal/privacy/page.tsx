export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ marginBottom: "40px" }}>
          <a href="/" style={{ color: "#FFD700", textDecoration: "none", fontSize: "14px" }}>← SweepVaults</a>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#FFD700", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ color: "#555", fontSize: "14px", marginBottom: "40px" }}>Last updated: March 2026</p>

        {[
          {
            title: "Information We Collect",
            content: "We collect information you provide directly to us, including your name, email address, and phone number when you enter our sweepstakes. We also collect usage data such as pages visited, time spent on pages, and device information."
          },
          {
            title: "How We Use Your Information",
            content: "We use the information we collect to administer sweepstakes entries, contact winners, send promotional communications with your consent, improve our services, and comply with legal obligations."
          },
          {
            title: "Information Sharing",
            content: "We do not sell your personal information. We may share your information with sweepstakes sponsors and partners to fulfill prize delivery, with service providers who assist in our operations, and when required by law."
          },
          {
            title: "Cookies and Tracking",
            content: "We use cookies and similar tracking technologies to analyze usage patterns and improve our service. We use PostHog for analytics. You can control cookies through your browser settings."
          },
          {
            title: "Data Retention",
            content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, typically no longer than 24 months after your last interaction with our services."
          },
          {
            title: "Your Rights",
            content: "You have the right to access, correct, or delete your personal information. To exercise these rights, contact us at privacy@sweepvaults.com."
          },
          {
            title: "Children's Privacy",
            content: "Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors."
          },
          {
            title: "Contact Us",
            content: "If you have questions about this Privacy Policy, please contact us at privacy@sweepvaults.com."
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>{section.title}</h2>
            <p style={{ fontSize: "15px", color: "#888", lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}