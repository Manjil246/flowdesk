import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const messages = [
  "Women's ready-to-wear · Est. 2025 · Chitwan",
  'New arrivals every week',
  'Pay with eSewa · Khalti · FonePay',
  'Nationwide delivery across Nepal',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!visible || !barRef.current) {
      root.style.setProperty('--announcement-height', '0px');
      return;
    }

    const updateHeight = () => {
      const height = barRef.current?.offsetHeight ?? 0;
      root.style.setProperty('--announcement-height', `${height}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      root.style.setProperty('--announcement-height', '0px');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={barRef} className="sticky top-0 z-50 bg-foreground text-primary-foreground py-2">
      <p className="text-center font-body text-[10px] sm:text-[11px] uppercase tracking-[1.5px] sm:tracking-[2px] font-medium transition-opacity duration-300 px-10">
        {messages[index]}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}


