import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Checkout from "../pages/Checkout";
import Contact from "../pages/Contact";
import HelpCenter from "../pages/HelpCenter";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";


// ... other pages

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/events" element={<Events />} />
    <Route path="/events/:id" element={<EventDetails />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/help" element={<HelpCenter />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />

    {/* Add all routes */}
  </Routes>
);
export default AppRoutes;
