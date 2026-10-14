import React from 'react';
import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import CuratedTabs from '../components/home/CuratedTabs';
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
      <HeroSection />
      <CategoryGrid />
      <CuratedTabs />
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
