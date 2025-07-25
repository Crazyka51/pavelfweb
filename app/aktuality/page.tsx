import { NewsPage } from "../aktuality/NewsPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aktuality - Pavel Fišer",
  description: "Nejnovější zprávy a články od Pavla Fišera, zastupitele MČ Praha 4.",
  openGraph: {
    title: "Aktuality - Pavel Fišer",
    description: "Nejnovější zprávy a články od Pavla Fišera, zastupitele MČ Praha 4.",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Aktuality" }],
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/aktuality`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Aktuality - Pavel Fišer",
    description: "Nejnovější zprávy a články od Pavla Fišera, zastupitele MČ Praha 4.",
    images: ["/og-image.svg"],
  },
}

export default function AktualityPage() {
  return <NewsPage />
}
