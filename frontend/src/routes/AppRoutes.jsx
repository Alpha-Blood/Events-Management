import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Events from "../pages/Events";

// ... other pages

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/events" element={<Events />} />
    {/* Add all routes */}
  </Routes>
);
export default AppRoutes;
