import React from 'react';
import CategoryQuickStrip from '../components/home/CategoryQuickStrip';
import HeroSection from '../components/home/HeroSection';
import CuratedTabs from '../components/home/CuratedTabs';
import CategoryGrid from '../components/home/CategoryGrid';
import SpotlightSection from '../components/home/SpotlightSection';
import OccasionsSection from '../components/home/OccasionsSection';
import BudgetBar from '../components/home/BudgetBar';
import GiftFinderWidget from '../components/home/GiftFinderWidget';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialsSection from '../components/home/TestimonialsSection';
import InstagramFeed from '../components/home/InstagramFeed';

export default function HomePage() {
  return (
    <div className="home-page animate-fade-in">
      <CategoryQuickStrip />
      <HeroSection />
      <CuratedTabs />
      <CategoryGrid />
      <SpotlightSection />
      <OccasionsSection />
      <BudgetBar />
      <GiftFinderWidget />
      <WhyChooseUs />
      <TestimonialsSection />
      <InstagramFeed />
    </div>
  );
}
