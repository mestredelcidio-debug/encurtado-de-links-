export interface LinkItem {
  code: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clickCount: number;
  status: 'active' | 'disabled' | 'expired';
  abuseStatus?: 'clean' | 'reported' | 'blocked';
  clicks?: Array<{
    timestamp: string;
    referrer: string;
    userAgent: string;
  }>;
}

export type ActiveTab = 'shortener' | 'mylinks' | 'stats' | 'terms' | 'privacy' | 'report';
