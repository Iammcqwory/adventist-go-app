import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navigation } from './components/Navigation';
import { NotificationCenter } from './components/NotificationCenter';
import { SabbathCountdown } from './components/SabbathCountdown';
import { PrepChecklist } from './components/PrepChecklist';
import { Devotionals } from './components/Devotionals';
import { SabbathSchool } from './components/SabbathSchool';
import { BibleLookup } from './components/BibleLookup';
import { Hymns } from './components/Hymns';
import { FamilyWorship } from './components/FamilyWorship';
import { ReelsFeed } from './components/ReelsFeed';
import { VerseMaster } from './components/VerseMaster';
import { DigitalDetox } from './components/DigitalDetox';
import { ChurchFinder } from './components/ChurchFinder';
import { Journal } from './components/Journal';
import { Settings } from './components/Settings';
import { NotificationSettings } from './components/NotificationSettings';
import { useLocationPermission } from './hooks/useLocationPermission';
import { generateUserId } from './utils/userId';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const [userId] = useState(() => generateUserId());
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { location, requestLocation, setManualLocation } = useLocationPermission();

  useEffect(() => {
    // Only auto-request if no location is stored
    if (!location) {
      requestLocation();
    }
  }, [location, requestLocation]);

  const handleOpenNotificationSettings = () => {
    setShowNotificationSettings(true);
  };

  const handleCloseNotificationSettings = () => {
    setShowNotificationSettings(false);
  };

  if (showNotificationSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-gray-900 transition-colors overflow-x-hidden">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl pb-20 lg:pb-8">
            <div className="mb-6">
              <button
                onClick={handleCloseNotificationSettings}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                ← Back to App
              </button>
            </div>
            <ErrorBoundary>
              <NotificationSettings userId={userId} />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-gray-900 transition-colors overflow-x-hidden">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl pb-20 lg:pb-8">
            <ErrorBoundary>
              <NotificationCenter 
                userId={userId} 
                location={location} 
                onOpenSettings={handleOpenNotificationSettings}
              />
            </ErrorBoundary>
            <div className="mt-6">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <SabbathCountdown 
                      userId={userId} 
                      location={location}
                      onRequestLocation={requestLocation}
                      onSelectCity={setManualLocation}
                    />
                  </ErrorBoundary>
                } />
                <Route path="/reels" element={
                  <ErrorBoundary>
                    <ReelsFeed />
                  </ErrorBoundary>
                } />
                <Route path="/verse-master" element={
                  <ErrorBoundary>
                    <VerseMaster />
                  </ErrorBoundary>
                } />
                <Route path="/prep" element={
                  <ErrorBoundary>
                    <PrepChecklist userId={userId} />
                  </ErrorBoundary>
                } />
                <Route path="/devotionals" element={
                  <ErrorBoundary>
                    <Devotionals />
                  </ErrorBoundary>
                } />
                <Route path="/sabbath-school" element={
                  <ErrorBoundary>
                    <SabbathSchool />
                  </ErrorBoundary>
                } />
                <Route path="/bible" element={
                  <ErrorBoundary>
                    <BibleLookup userId={userId} />
                  </ErrorBoundary>
                } />
                <Route path="/hymns" element={
                  <ErrorBoundary>
                    <Hymns />
                  </ErrorBoundary>
                } />
                <Route path="/family" element={
                  <ErrorBoundary>
                    <FamilyWorship />
                  </ErrorBoundary>
                } />
                <Route path="/detox" element={
                  <ErrorBoundary>
                    <DigitalDetox userId={userId} />
                  </ErrorBoundary>
                } />
                <Route path="/churches" element={
                  <ErrorBoundary>
                    <ChurchFinder location={location} />
                  </ErrorBoundary>
                } />
                <Route path="/journal" element={
                  <ErrorBoundary>
                    <Journal userId={userId} />
                  </ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary>
                    <Settings userId={userId} location={location} />
                  </ErrorBoundary>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
