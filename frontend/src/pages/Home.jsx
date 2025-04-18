import HeroSection from "../components/HeroSection";
import EventsSection from "../components/EventSection";
import SearchSection from "../components/SearchSection";
import CallToAction from "../components/CallToAction";

function Home() {
  return (
    <div className="relative">
      <HeroSection />
      <SearchSection />
      <EventsSection />
      <CallToAction />
    </div>
  );
}

export default Home;
