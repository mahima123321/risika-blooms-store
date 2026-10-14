import React from 'react';
import GiftFinderWidget from '../components/home/GiftFinderWidget';
import WhyChooseUs from '../components/home/WhyChooseUs';

export default function SurpriseFinderPage() {
  return (
    <div className="surprise-finder-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <GiftFinderWidget />
      <WhyChooseUs />
    </div>
  );
}
