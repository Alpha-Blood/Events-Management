import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";

// ... other pages

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    {/* Add all routes */}
  </Routes>
);
export default AppRoutes;
