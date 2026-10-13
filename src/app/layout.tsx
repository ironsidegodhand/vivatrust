"use client";

import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Since we're using "use client", we need to handle metadata differently
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showFdicBadge, setShowFdicBadge] = useState(true);

  // Load badge visibility preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('hideFdicBadge');
    if (savedPreference === 'true') {
      setShowFdicBadge(false);
    }
  }, []);

  // Save preference to localStorage when badge is hidden
  const hideFdicBadge = () => {
    setShowFdicBadge(false);
    localStorage.setItem('hideFdicBadge', 'true');
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>VivaTrust Bank</title>
          <meta name="description" content="Experience the future of banking with our secure innovative, and user-friendly platform designed for modern financial needs." />
          <link rel="icon" href="/viva.jpeg" sizes="any" />
        </head>
        <body>
          {children}
          
          {/* Combined FDIC Image and Text Badge with Cancel Button */}
          {showFdicBadge && (
            <aside className="fdic-badge" aria-label="FDIC insurance information">
              {/* Close button */}
              <button
                onClick={hideFdicBadge}
                className="fdic-close"
                aria-label="Close FDIC badge"
              >
                ×
              </button>
              
              {/* FDIC Logo Image */}
              <div className="fdic-mark-wrap">
                <div className="fdic-mark">
                  FDIC
                </div>
              </div>
              
              {/* FDIC Text Content */}
              <div className="fdic-copy">
                <div className="fdic-title">
                  FDIC INSURED
                </div>
                <div className="fdic-details">
                  <div>Member FDIC</div>
                  <div>Deposits insured up to $250,000</div>
                  <div className="fdic-note">
                    VivaTrust Bank is an FDIC member institution
                  </div>
                </div>
              </div>
            </aside>
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
