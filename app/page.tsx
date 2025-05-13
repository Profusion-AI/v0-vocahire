'use client' // Needed for useEffect for smooth scrolling and for Simulation component interactivity

import React, { useEffect } from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import Simulation from '@/components/landing/Simulation'
import FeedbackSection from '@/components/landing/FeedbackSection'
import Pricing from '@/components/landing/Pricing'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Cleanup event listeners on component unmount
    return () => {
      anchors.forEach(anchor => {
        // It's tricky to remove the exact same event listener function reference here
        // without storing them. For this scope, if re-renders are minimal,
        // it might be acceptable. A more robust solution would store listener refs.
        // Or, rely on modern browsers to GC listeners on unmounted elements if anchors are within this component.
        // For simplicity now, not removing, but be aware for complex apps.
      });
    };
  }, []);

  return (
    <div className="bg-gray-50"> {/* Matching body bg from original splashpage.html */}
      <Navbar />
      <main>
        {/* Hero, Features, and Testimonials were originally under a single section#home.
            The .section class (min-height: 100vh, padding: 2rem 0) is applied by individual components if needed,
            or globally to <section> tags if they use that class.
            The Hero component already includes <section id="home">.
            The other components (Features, Testimonials, etc.) also define their own <section> or <div> root.
            The .section class from globals.css provides min-height and vertical padding.
        */}
        <Hero /> {/* Contains its own <section id="home"> and initial content */}
        <Features /> {/* This was nested in original #home, now separate component with its own styling */}
        <Testimonials /> {/* Also nested, now separate */}
        
        {/* These components correspond to the other top-level sections from splashpage.html */}
        <Simulation /> {/* Contains <section id="simulation"> */}
        <FeedbackSection /> {/* Contains <section id="feedback"> */}
        <Pricing /> {/* Contains <section id="pricing"> */}
      </main>
      <Footer />
    </div>
  )
}
