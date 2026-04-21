import AnnouncementBar from '@/user/components/AnnouncementBar';
import Navbar from '@/user/components/Navbar';
import HeroSection from '@/user/components/HeroSection';
import MarqueeTicker from '@/user/components/MarqueeTicker';
import CategorySection from '@/user/components/CategorySection';
import LookbookSection from '@/user/components/LookbookSection';
import FeaturesStrip from '@/user/components/FeaturesStrip';
import TestimonialsSection from '@/user/components/TestimonialsSection';
import NewsletterSection from '@/user/components/NewsletterSection';
import Footer from '@/user/components/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <HeroSection />
      <MarqueeTicker />
      <CategorySection />
      <LookbookSection />
      <FeaturesStrip />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}


