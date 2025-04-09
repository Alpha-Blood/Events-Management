import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import Navbar from "./components/Navbar.jsx";
import { FooterWithSocialLinks } from "./components/Footer.jsx";


const App = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <FooterWithSocialLinks />
    </div>
  );
};

export default App;

