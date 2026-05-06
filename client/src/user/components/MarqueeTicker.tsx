export default function MarqueeTicker() {
  const items = [
    "WOMEN'S COLLECTION", "MEN'S WEAR", "ACCESSORIES",
    "NEW ARRIVALS", "PASHMINA", "DHAKA PRINTS",
  ];
  const content = items.map((item) => `${item} · ✦ · `).join('');

  return (
    <div className="bg-foreground overflow-hidden py-4">
      <div className="animate-marquee whitespace-nowrap flex">
        {[0, 1].map((i) => (
          <span key={i} className="font-display italic text-base tracking-[2px] text-primary-foreground/80">
            {content}
          </span>
        ))}
      </div>
    </div>
  );
}


