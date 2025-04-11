import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import Layout from "./components/Layout.jsx";

const App = () => {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
};

export default App;

