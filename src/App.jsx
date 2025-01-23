import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/SideBar';
import Header from './components/Header';
import Ideas from './Pages/Ideas';
import './App.css';
import SupaBaseProvider  from './components/SupaBaseProvider';

function App() {
  return (
    <SupaBaseProvider>
    <Router>
      <div className="flex min-h-screen bg-gray-100  ">
        <Sidebar />
        <div className="flex-1 ml-64  ">
          <Header />
          <main className=" p-6 mt-16">
            <Routes>
              <Route path="/ideas" element={<Ideas />} />
              {/* <Route path="/products" element={<Products />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/prices" element={<MetalPrices />} />
              <Route path="/vendors" element={<Vendors />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
    </SupaBaseProvider>
  );
}

export default App;