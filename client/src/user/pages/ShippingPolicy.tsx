import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-8">Shipping Policy</h1>

          <div className="font-body text-sm text-muted-foreground leading-[1.8] space-y-6">
            <section>
              <h2 className="font-display text-xl text-foreground mb-3">Delivery Timeline</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-foreground">Kathmandu Valley:</strong> 2–4 business days</li>
                <li><strong className="text-foreground">Pokhara, Chitwan, Biratnagar:</strong> 4–5 business days</li>
                <li><strong className="text-foreground">Other major cities:</strong> 5–7 business days</li>
                <li><strong className="text-foreground">Remote areas:</strong> 7–10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">Delivery Charges</h2>
              <p>
                Delivery fees are set <strong className="text-foreground">per product</strong> — not as a flat site-wide rate.
                Some items include free delivery; others show a specific charge on the product page and in your cart at checkout.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">Order Tracking</h2>
              <p>Once your order is dispatched, you will receive a tracking number via SMS and email. You can track your order status through your account dashboard or our order tracking page.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">Province-wise Delivery</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-body text-[11px] uppercase tracking-[1px] text-muted-foreground">Province</th>
                      <th className="py-2 px-3 text-left font-body text-[11px] uppercase tracking-[1px] text-muted-foreground">Est. Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm text-muted-foreground">
                    {[
                      ['Bagmati', '2–4 days'],
                      ['Gandaki', '4–6 days'],
                      ['Lumbini', '5–7 days'],
                      ['Koshi', '5–7 days'],
                      ['Madhesh', '4–6 days'],
                      ['Karnali', '7–10 days'],
                      ['Sudurpashchim', '7–10 days'],
                    ].map(([prov, delivery]) => (
                      <tr key={prov} className="border-b border-border">
                        <td className="py-2 px-3">{prov}</td>
                        <td className="py-2 px-3">{delivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


