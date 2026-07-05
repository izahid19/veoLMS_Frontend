import { useEffect } from 'react';
import type { SeoMeta } from '../../seo/seo.home.config';

/**
 * SeoHead
 *
 * Imperatively applies SEO metadata to the document <head> for the
 * current page. No external library required.
 *
 * - Sets document.title
 * - Injects/updates <meta> tags (description, keywords, robots, OG, Twitter)
 * - Injects/updates <link rel="canonical">
 * - Injects JSON-LD structured data script
 *
 * All tags created by this component are tagged with data-seo="true" so
 * they can be safely removed on unmount (important for SPA navigation).
 */

interface SeoHeadProps {
  config: SeoMeta;
}

const SEO_ATTR = 'data-seo';

function setMeta(name: string, content: string, property = false): HTMLMetaElement {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    el.setAttribute(SEO_ATTR, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

function setCanonical(href: string): HTMLLinkElement {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    el.setAttribute(SEO_ATTR, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return el;
}

function setStructuredData(data: Record<string, unknown>): HTMLScriptElement {
  let el = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute(SEO_ATTR, 'true');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 2);
  return el;
}

export const SeoHead = ({ config }: SeoHeadProps) => {
  useEffect(() => {
    const { title, description, keywords, canonical, robots, openGraph, twitterCard, structuredData } = config;

    // ── Title ──────────────────────────────────────────────────────────────
    const previousTitle = document.title;
    document.title = title;

    // ── Standard meta ──────────────────────────────────────────────────────
    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));
    setMeta('robots', robots);

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta('og:type', openGraph.type, true);
    setMeta('og:url', openGraph.url, true);
    setMeta('og:title', openGraph.title, true);
    setMeta('og:description', openGraph.description, true);
    setMeta('og:image', openGraph.image, true);
    setMeta('og:site_name', openGraph.siteName, true);
    setMeta('og:locale', openGraph.locale, true);

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta('twitter:card', twitterCard.card);
    setMeta('twitter:site', twitterCard.site);
    setMeta('twitter:creator', twitterCard.creator);
    setMeta('twitter:title', twitterCard.title);
    setMeta('twitter:description', twitterCard.description);
    setMeta('twitter:image', twitterCard.image);

    // ── Canonical ──────────────────────────────────────────────────────────
    setCanonical(canonical);

    // ── JSON-LD ────────────────────────────────────────────────────────────
    setStructuredData(structuredData);

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    return () => {
      document.title = previousTitle;
      document.querySelectorAll(`[${SEO_ATTR}="true"]`).forEach((el) => el.remove());
    };
  }, [config]);

  return null;
};
