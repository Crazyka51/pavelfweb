import Hero from "./components/Hero"
import Introduction from "./components/WearYourStory"
import Priorities from "./components/Services"
import AboutMe from "./components/AboutUs"
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
      <Introduction />
      <Priorities />
      <AboutMe />
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
