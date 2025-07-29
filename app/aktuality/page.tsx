import { Metadata } from 'next'
import NewsPage from './NewsPage'

export const metadata: Metadata = {
  title: 'Aktuální novinky | Pavel Fišer - Praha 4',
  description: 'Sledujte nejnovější informace a aktuality z Prahy 4. Zprávy o projektech, investicích a dění v městské části.',
  keywords: 'Praha 4, novinky, aktuality, Pavel Fišer, radní, městská část',
  openGraph: {
    title: 'Aktuální novinky | Pavel Fišer - Praha 4',
    description: 'Sledujte nejnovější informace a aktuality z Prahy 4',
    type: 'website',
  }
}

export default function Page() {
  return <NewsPage />
}
