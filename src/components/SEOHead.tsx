import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
}

const SEOHead = ({
  title = "墨韵文轩 | 技术博客与生活感悟",
  description = "一个关于技术探索、编程心得与生活感悟的个人博客。分享前端开发、系统设计、效率提升等实用内容。",
  keywords = "技术博客, 前端开发, React, TypeScript, 编程, 生活随笔",
  ogImage = "/og-image.jpg",
  ogType = "website",
  canonicalUrl,
  article,
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:locale', 'zh_CN', true);
    updateMeta('og:site_name', '墨韵文轩', true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Article specific meta tags
    if (article && ogType === 'article') {
      if (article.publishedTime) {
        updateMeta('article:published_time', article.publishedTime, true);
      }
      if (article.modifiedTime) {
        updateMeta('article:modified_time', article.modifiedTime, true);
      }
      if (article.author) {
        updateMeta('article:author', article.author, true);
      }
      if (article.section) {
        updateMeta('article:section', article.section, true);
      }
      article.tags?.forEach((tag, index) => {
        updateMeta(`article:tag:${index}`, tag, true);
      });
    }

    // JSON-LD structured data
    const existingScript = document.querySelector('script[data-seo="structured-data"]');
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = ogType === 'article' && article
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': title,
          'description': description,
          'image': ogImage,
          'datePublished': article.publishedTime,
          'dateModified': article.modifiedTime || article.publishedTime,
          'author': {
            '@type': 'Person',
            'name': article.author || '墨韵文轩'
          },
          'publisher': {
            '@type': 'Organization',
            'name': '墨韵文轩',
            'logo': {
              '@type': 'ImageObject',
              'url': '/favicon.ico'
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl || window.location.href
          },
          'keywords': article.tags?.join(', ') || keywords
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': '墨韵文轩',
          'description': description,
          'url': window.location.origin,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${window.location.origin}/blog?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        };

    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', 'structured-data');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-seo="structured-data"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, article, noIndex]);

  return null;
};

export default SEOHead;
