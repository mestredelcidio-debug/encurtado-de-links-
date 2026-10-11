import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UrlShortener } from './components/UrlShortener';
import { LinkStats } from './components/LinkStats';
import { MyLinks } from './components/MyLinks';
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';
import { Report } from './components/Report';
import { ActiveTab, LinkItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shortener');
  const [myLinks, setMyLinks] = useState<LinkItem[]>([]);
  const [selectedLinkForStats, setSelectedLinkForStats] = useState<LinkItem | null>(null);

  // Initialize or retrieve visitor session token for anonymous link ownership
  useEffect(() => {
    let token = localStorage.getItem('decix_visitor_token');
    if (!token) {
      token = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('decix_visitor_token', token);
    }
    fetchMyLinks(token);
  }, []);

  const fetchMyLinks = async (token: string) => {
    try {
      const res = await fetch('/api/links', {
        headers: {
          'x-visitor-token': token
        }
      });
      const data = await res.json();
      if (res.ok && data.links) {
        setMyLinks(data.links);
      }
    } catch (err) {
      console.error('Error fetching visitor links from server:', err);
      // Fallback to localStorage if offline
      try {
        const saved = localStorage.getItem('decix_mylinks');
        if (saved) {
          setMyLinks(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading fallback local links:', e);
      }
    }
  };

  const handleLinkCreated = (newLink: LinkItem) => {
    setMyLinks((prev) => {
      const updated = [newLink, ...prev.filter(l => l.code !== newLink.code)];
      try {
        localStorage.setItem('decix_mylinks', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving local backup:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (confirm('Deseja realmente limpar o histórico de links salvos neste navegador?')) {
      setMyLinks([]);
      localStorage.removeItem('decix_mylinks');
    }
  };

  const handleViewStats = (link: LinkItem) => {
    setSelectedLinkForStats(link);
    setActiveTab('stats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        myLinksCount={myLinks.length}
      />

      <main className="flex-1">
        {activeTab === 'shortener' && (
          <UrlShortener
            onLinkCreated={handleLinkCreated}
            onViewStats={handleViewStats}
          />
        )}

        {activeTab === 'mylinks' && (
          <MyLinks
            links={myLinks}
            onViewStats={handleViewStats}
            onClearHistory={handleClearHistory}
            onGoHome={() => setActiveTab('shortener')}
          />
        )}

        {activeTab === 'stats' && selectedLinkForStats && (
          <LinkStats
            link={selectedLinkForStats}
            onBack={() => setActiveTab('mylinks')}
          />
        )}

        {activeTab === 'terms' && <Terms />}

        {activeTab === 'privacy' && <Privacy />}

        {activeTab === 'report' && <Report />}
      </main>

      <Footer
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
