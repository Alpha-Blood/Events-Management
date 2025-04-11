import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";


// ... other pages

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/events" element={<Events />} />
    <Route path="/events/:id" element={<EventDetails />} />

    {/* Add all routes */}
  </Routes>
);
export default AppRoutes;
