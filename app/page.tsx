import Hero from "./components/Hero"
import WearYourStory from "./components/WearYourStory"
import Services from "./components/Services"
import AboutUs from "./components/AboutUs"
import Timeline from "./components/Timeline"
import Projects from "./components/Projects"
import Testimonials from "./components/Testimonials"
import Marquee from "./components/Marquee"
import FacebookPosts from "./components/FacebookPosts"
import RecentNews from "./components/RecentNews"
import ContactForm from "./components/ContactForm"
import NewsletterSubscribe from "./components/NewsletterSubscribe"

export default function Home() {
  return (
    <>
      <Hero />
      <WearYourStory />
      <Services />
      <AboutUs />
      <Projects />
      <Timeline />
      <Testimonials />
      <FacebookPosts />
      <Marquee />
      <RecentNews />
      <ContactForm />
      <NewsletterSubscribe />
    </>
  )
}
