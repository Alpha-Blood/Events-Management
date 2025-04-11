import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";

// ... other pages

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events" element={<Events />} />
    <Route path="/events/:id" element={<EventDetails />} />

    {/* Add all routes */}
  </Routes>
);
export default AppRoutes;
