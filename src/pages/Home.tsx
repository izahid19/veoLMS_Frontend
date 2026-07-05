
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedPathways } from '../components/home/FeaturedPathways';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { CtaSection } from '../components/home/CtaSection';
import { SeoHead } from '../components/layout/SeoHead';
import { homeSeoConfig } from '../seo/seo.home.config';

const Home = () => {
  return (
    <>
      <SeoHead config={homeSeoConfig} />
      <HeroSection />
      <FeaturedPathways />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
};

export default Home;
