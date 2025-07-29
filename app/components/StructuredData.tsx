'use client'

interface StructuredDataProps {
  type?: 'person' | 'article' | 'website'
  title?: string
  description?: string
  url?: string
  image?: string
  datePublished?: string
  dateModified?: string
}

export default function StructuredData({ 
  type = 'website',
  title,
  description,
  url,
  image,
  datePublished,
  dateModified 
}: StructuredDataProps) {
  
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'person' ? 'Person' : type === 'article' ? 'Article' : 'WebSite',
      "name": title || "Bc. Pavel Fišer",
      "description": description || "Oficiální stránky Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera s vášní pro komunitní rozvoj",
      "url": url || "https://fiserpavel.cz",
      "image": image || "https://fiserpavel.cz/og-image.svg"
    }

    if (type === 'person') {
      return {
        ...baseData,
        "@type": "Person",
        "jobTitle": "Zastupitel MČ Praha 4",
        "affiliation": {
          "@type": "Organization",
          "name": "Městská část Praha 4"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Praha 4",
          "addressCountry": "CZ"
        },
        "sameAs": [
          "https://www.facebook.com/pavel.fiser.official"
        ]
      }
    }

    if (type === 'article') {
      return {
        ...baseData,
        "@type": "Article",
        "author": {
          "@type": "Person",
          "name": "Bc. Pavel Fišer",
          "jobTitle": "Zastupitel MČ Praha 4"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Pavel Fišer - Zastupitel MČ Praha 4",
          "logo": {
            "@type": "ImageObject",
            "url": "https://fiserpavel.cz/og-image.svg"
          }
        },
        "datePublished": datePublished || new Date().toISOString(),
        "dateModified": dateModified || new Date().toISOString()
      }
    }

    return {
      ...baseData,
      "publisher": {
        "@type": "Person",
        "name": "Bc. Pavel Fišer"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://fiserpavel.cz/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
}
