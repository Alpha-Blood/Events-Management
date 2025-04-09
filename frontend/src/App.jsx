import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;

