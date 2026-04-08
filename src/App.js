import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trabajadores from "./pages/Trabajadores";
import Produccion from "./pages/Produccion";
import Ordenes from "./pages/Ordenes";
import IA from "./pages/IA";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trabajadores" element={<Trabajadores />} />
        <Route path="/produccion" element={<Produccion />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/ia" element={<IA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;