import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/SideBar';
import Header from './components/Header';
import Ideas from './Pages/Ideas';
import Vendors from './Pages/Vendor';
import Products from './Pages/Products';
import Designs from './Pages/Designs';
import Samples from './Pages/Samples'; 
import Quote from './Pages/Quote'; 
import NewQuote from './Pages/NewQuote';                   
import ViewQuote from './Pages/ViewQuote';                   
import MetalPrices from './Pages/MetalPrices';
import './App.css';
import SupaBaseProvider  from './components/SupaBaseProvider';
import { MessageProvider } from './components/Messages/MessageContext';
import MessageBox from './components/Messages/MessageBox';
function App() {
  return (
    <SupaBaseProvider>
    <MessageProvider>
    <MessageBox />
    <Router>
      <div className="flex min-h-screen bg-gray-100  ">
        <Sidebar />
        <div className="flex-1 ml-64  ">
          <Header />
          <main className=" p-6 mt-16">
            <Routes>
              <Route path="/ideas" element={<Ideas />} />
              <Route path="/products" element={<Products />} />
              <Route path="/designs" element={<Designs />} />
              <Route path="/samples" element={<Samples />} />
              <Route path="/quotes" element={<Quote />} />
              <Route path="/newQuote" element={<NewQuote />} />
              <Route path="/viewQuote" element={<ViewQuote/>} />
              {/* <Route path="/calculator" element={<Calculator />} />
              */}
              <Route path="/prices" element={<MetalPrices />} />
              <Route path="/vendors" element={<Vendors />} /> 
            </Routes>
          </main>
        </div>
      </div>
    </Router>
    </MessageProvider>
    </SupaBaseProvider>
  );
}

export default App;