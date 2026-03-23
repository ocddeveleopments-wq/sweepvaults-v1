"use client"

export default function SecurityBadges({ accentColor, textColor }: { accentColor: string; textColor: string }) {
  const badges = [
    { icon: "🔒", label: "SSL Secured" },
    { icon: "✅", label: "Official Sweepstakes" },
    { icon: "🛡️", label: "No Purchase Needed" },
    { icon: "🏆", label: "Verified Prizes" },
  ]

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      flexWrap: "wrap",
      marginTop: "16px",
    }}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(0,0,0,0.2)",
            border: `1px solid ${accentColor}20`,
            borderRadius: "50px",
            padding: "4px 10px",
            fontSize: "10px",
            color: textColor,
            opacity: 0.7,
          }}
        >
          <span style={{ fontSize: "11px" }}>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}