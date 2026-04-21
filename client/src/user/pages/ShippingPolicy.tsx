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
              <h2 className="font-display text-xl text-foreground mb-3">Shipping Rates</h2>
              <p>A flat delivery charge of <strong className="text-foreground">रू 150</strong> applies to all orders across Nepal — no thresholds, no surprises at checkout.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-foreground mb-3">Cash on Delivery</h2>
              <p>COD is available across most locations in Nepal. An additional handling charge of <strong className="text-foreground">रू 50</strong> applies to COD orders. COD is not available for orders above रू 25,000.</p>
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
                      <th className="py-2 px-3 text-left font-body text-[11px] uppercase tracking-[1px] text-muted-foreground">COD</th>
                    </tr>
                  </thead>
                  <tbody className="font-body text-sm text-muted-foreground">
                    {[
                      ['Bagmati', '2–4 days', 'Yes'],
                      ['Gandaki', '4–6 days', 'Yes'],
                      ['Lumbini', '5–7 days', 'Yes'],
                      ['Koshi', '5–7 days', 'Yes'],
                      ['Madhesh', '4–6 days', 'Yes'],
                      ['Karnali', '7–10 days', 'Limited'],
                      ['Sudurpashchim', '7–10 days', 'Limited'],
                    ].map(([prov, delivery, cod]) => (
                      <tr key={prov} className="border-b border-border">
                        <td className="py-2 px-3">{prov}</td>
                        <td className="py-2 px-3">{delivery}</td>
                        <td className="py-2 px-3">{cod}</td>
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


