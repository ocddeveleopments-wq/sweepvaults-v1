export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ marginBottom: "40px" }}>
          <a href="/" style={{ color: "#FFD700", textDecoration: "none", fontSize: "14px" }}>← SweepVaults</a>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#FFD700", marginBottom: "8px" }}>Terms & Conditions</h1>
        <p style={{ color: "#555", fontSize: "14px", marginBottom: "40px" }}>Last updated: March 2026</p>

        {[
          {
            title: "Eligibility",
            content: "Sweepstakes are open to legal residents of the United States who are 18 years of age or older at the time of entry. Employees of SweepVaults and their immediate family members are not eligible to participate."
          },
          {
            title: "No Purchase Necessary",
            content: "No purchase or payment of any kind is necessary to enter or win. A purchase will not increase your chances of winning."
          },
          {
            title: "How to Enter",
            content: "To enter, visit our website and complete the registration form with your valid email address. Limit one entry per person per sweepstakes unless otherwise stated. Multiple entries from the same person will be disqualified."
          },
          {
            title: "Prize Information",
            content: "Prizes are as described on the sweepstakes entry page. Prizes are non-transferable and no substitution or cash equivalent is permitted except at the sole discretion of SweepVaults. All federal, state, and local taxes on prizes are the sole responsibility of the winner."
          },
          {
            title: "Winner Selection",
            content: "Winners will be selected by random drawing from all eligible entries received. Odds of winning depend on the number of eligible entries received. Winners will be notified by email within 30 days of the drawing date."
          },
          {
            title: "Publicity",
            content: "By entering, you grant SweepVaults permission to use your name and likeness for promotional purposes without additional compensation, except where prohibited by law."
          },
          {
            title: "Limitation of Liability",
            content: "SweepVaults is not responsible for lost, late, misdirected, or incomplete entries. SweepVaults reserves the right to cancel, suspend, or modify the sweepstakes if fraud or technical failures compromise the integrity of the promotion."
          },
          {
            title: "Governing Law",
            content: "These terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration."
          },
          {
            title: "Contact",
            content: "For questions about these terms, contact us at contact@sweepvaults.com."
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