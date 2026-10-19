import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Overview from "./pages/Overview.jsx";
import Regression from "./pages/Regression.jsx";
import Classification from "./pages/Classification.jsx";
import Clustering from "./pages/Clustering.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main className="max-w-7xl mx-auto px-6 pt-6">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/regression" element={<Regression />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/clustering" element={<Clustering />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-700/30 mt-12">
        <p className="text-xs text-slate-500">
          23CSE301 Machine Learning Capstone &bull; Team Novacore &bull; Data: smart_manufacturing_ml_dataset.csv (22,260 records)
        </p>
      </footer>
    </>
  );
}

function PredictPage() {
  // Lazy import to keep initial bundle small
  const [Comp, setComp] = React.useState(null);
  React.useEffect(() => {
    import("./pages/Predict.jsx").then(m => setComp(() => m.default));
  }, []);
  return Comp ? <Comp /> : <div className="text-center py-12 text-slate-400">Loading predictor...</div>;
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-white mb-2">404</h2>
      <p className="text-slate-300">Page not found. Use the navigation above.</p>
    </div>
  );
}
