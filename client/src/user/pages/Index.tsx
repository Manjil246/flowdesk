import AnnouncementBar from '@/user/components/AnnouncementBar';
import Navbar from '@/user/components/Navbar';
import HeroSection from '@/user/components/HeroSection';
import MarqueeTicker from '@/user/components/MarqueeTicker';
import LookbookSection from '@/user/components/LookbookSection';
import FeaturesStrip from '@/user/components/FeaturesStrip';
import ThankYouCardSection from '@/user/components/ThankYouCardSection';
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
      <LookbookSection />
      <FeaturesStrip />
      <ThankYouCardSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}


