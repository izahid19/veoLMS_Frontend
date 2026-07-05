/**
 * SEO Configuration – Home Page
 *
 * Centralized metadata for the VeoLMS home page.
 * Covers: page title, meta description, Open Graph, Twitter Card,
 * canonical URL, keywords, and structured data (JSON-LD).
 *
 * Usage:
 *   import { homeSeoConfig } from '@/seo/seo.home.config';
 */

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  robots: string;
  openGraph: OpenGraphMeta;
  twitterCard: TwitterCardMeta;
  structuredData: Record<string, unknown>;
}

export interface OpenGraphMeta {
  type: string;
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  locale: string;
}

export interface TwitterCardMeta {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator: string;
  title: string;
  description: string;
  image: string;
}

// ---------------------------------------------------------------------------
// Home Page SEO Config
// ---------------------------------------------------------------------------

export const homeSeoConfig: SeoMeta = {
  /** Browser tab & SERP title — keep under 60 characters */
  title: 'VeoLMS – Premium Online Learning Platform',

  /** Meta description — keep between 120–160 characters */
  description:
    'Discover thousands of expert-led courses in programming, web development, design, and more. Join VeoLMS and grow your skills at your own pace — anytime, anywhere.',

  /** Target keywords aligned with VeoLMS SEO strategy */
  keywords: [
    'online learning',
    'learning management system',
    'LMS',
    'online courses',
    'programming courses',
    'web development courses',
    'software development',
    'professional development',
    'skill development',
    'career growth',
    'online education',
    'technical training',
    'certification courses',
    'developer learning',
    'e-learning platform',
    'VeoLMS',
  ],

  /** Canonical URL — prevents duplicate content penalties */
  canonical: 'https://veolms.com/',

  /** Allow indexing and follow all links */
  robots: 'index, follow',

  // -------------------------------------------------------------------------
  // Open Graph (Facebook, LinkedIn, WhatsApp previews)
  // -------------------------------------------------------------------------
  openGraph: {
    type: 'website',
    url: 'https://veolms.com/',
    title: 'VeoLMS – Premium Online Learning Platform',
    description:
      'Explore high-quality courses in programming, design, and more. Accelerate your career with VeoLMS — a premium, intuitive learning experience built for modern learners.',
    /** Replace with actual hosted OG image (1200×630 px recommended) */
    image: 'https://veolms.com/og/home-og-image.png',
    siteName: 'VeoLMS',
    locale: 'en_US',
  },

  // -------------------------------------------------------------------------
  // Twitter / X Card
  // -------------------------------------------------------------------------
  twitterCard: {
    card: 'summary_large_image',
    site: '@VeoLMS',
    creator: '@VeoLMS',
    title: 'VeoLMS – Premium Online Learning Platform',
    description:
      'Explore high-quality courses in programming, design, and more. Accelerate your career with VeoLMS.',
    /** Replace with actual hosted Twitter card image (1200×600 px recommended) */
    image: 'https://veolms.com/og/home-og-image.png',
  },

  // -------------------------------------------------------------------------
  // Structured Data — JSON-LD (WebSite + Organization + EducationalOrganization)
  // Helps search engines understand the site and enables rich results.
  // -------------------------------------------------------------------------
  structuredData: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://veolms.com/#website',
        url: 'https://veolms.com/',
        name: 'VeoLMS',
        description:
          'A premium online learning platform for students, developers, and working professionals.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://veolms.com/courses?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': 'https://veolms.com/#organization',
        name: 'VeoLMS',
        url: 'https://veolms.com/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://veolms.com/logo.png',
          width: 200,
          height: 60,
        },
        sameAs: [
          'https://twitter.com/VeoLMS',
          'https://linkedin.com/company/veolms',
          'https://github.com/veolms',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          availableLanguage: ['English'],
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://veolms.com/#educational-org',
        name: 'VeoLMS',
        url: 'https://veolms.com/',
        description:
          'VeoLMS empowers learners worldwide with premium, expert-led online courses across technology, design, and professional skills.',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'VeoLMS Course Catalog',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: 'Programming Courses' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: 'Web Development Courses' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: 'Software Development Courses' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: 'Design Courses' },
            },
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Course', name: 'Career Growth Courses' },
            },
          ],
        },
      },
    ],
  },
};
