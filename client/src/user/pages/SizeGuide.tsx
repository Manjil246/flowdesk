import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { Link } from 'react-router-dom';

const womenSizes = [
  { size: 'XS', chest: '78–82', waist: '60–64', hip: '86–90', length: '96' },
  { size: 'S', chest: '82–86', waist: '64–68', hip: '90–94', length: '98' },
  { size: 'M', chest: '86–90', waist: '68–72', hip: '94–98', length: '100' },
  { size: 'L', chest: '90–94', waist: '72–76', hip: '98–102', length: '102' },
  { size: 'XL', chest: '94–98', waist: '76–80', hip: '102–106', length: '104' },
  { size: 'XXL', chest: '98–102', waist: '80–84', hip: '106–110', length: '106' },
];

const menSizes = [
  { size: 'S', chest: '92–96', waist: '76–80', hip: '92–96', length: '70' },
  { size: 'M', chest: '96–100', waist: '80–84', hip: '96–100', length: '72' },
  { size: 'L', chest: '100–104', waist: '84–88', hip: '100–104', length: '74' },
  { size: 'XL', chest: '104–108', waist: '88–92', hip: '104–108', length: '76' },
  { size: 'XXL', chest: '108–112', waist: '92–96', hip: '108–112', length: '78' },
];

function SizeTable({ title, data }: { title: string; data: typeof womenSizes }) {
  return (
    <div className="mb-12">
      <h2 className="font-display text-2xl text-foreground mb-6">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {['Size', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)', 'Length (cm)'].map(h => (
                <th key={h} className="py-3 px-4 text-left font-body text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.size} className="border-b border-border hover:bg-surface transition-colors">
                <td className="py-3 px-4 font-body text-sm font-medium text-foreground">{row.size}</td>
                <td className="py-3 px-4 font-body text-sm text-muted-foreground">{row.chest}</td>
                <td className="py-3 px-4 font-body text-sm text-muted-foreground">{row.waist}</td>
                <td className="py-3 px-4 font-body text-sm text-muted-foreground">{row.hip}</td>
                <td className="py-3 px-4 font-body text-sm text-muted-foreground">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeGuide() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">Size Guide</h1>
          <p className="font-body text-sm text-muted-foreground">Find your perfect fit</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <SizeTable title="Women's Sizes" data={womenSizes} />
          <SizeTable title="Men's Sizes" data={menSizes} />

          <div className="bg-surface rounded-sm p-8 mb-8">
            <h3 className="font-display text-xl text-foreground mb-4">How to Measure</h3>
            <ul className="font-body text-sm text-muted-foreground leading-[1.8] space-y-2">
              <li><strong className="text-foreground">Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
              <li><strong className="text-foreground">Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</li>
              <li><strong className="text-foreground">Hip:</strong> Measure around the fullest part of your hips.</li>
              <li><strong className="text-foreground">Length:</strong> Measure from the highest point of the shoulder to the desired length.</li>
            </ul>
          </div>

          <div className="text-center py-8 border-t border-border">
            <p className="font-body text-sm text-muted-foreground mb-4">Still unsure about your size?</p>
            <Link to="/contact" className="inline-flex bg-foreground text-primary-foreground px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm hover:bg-foreground/85 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


