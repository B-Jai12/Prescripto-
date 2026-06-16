'use client';

import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import LipiChat from '@/components/LipiChat';

export default function LandingPage() {
  return (
    <div style={{ background: '#000', color: '#fff', overflow: 'hidden', height: '100vh' }}>
      <HeroSection />
    </div>
  );
}
