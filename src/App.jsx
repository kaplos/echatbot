import React, { useEffect } from 'react';
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
import DesignQuote from './Pages/DesignQuotes';
import Login from './Pages/Login';
import './App.css';
import SupaBaseProvider, { useSupabase } from './components/SupaBaseProvider';
import { MessageProvider } from './components/Messages/MessageContext';
import MessageBox from './components/Messages/MessageBox';
import { Navigate } from 'react-router-dom';

function AppContent() {
  const { session } = useSupabase(); // Get the current session from Supabase

  // If no session exists, show the login screen
  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/viewQuote" element={<ViewQuote />} />
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    );
  }

  // Extract the user's role from session metadata
  const userRole = session|| 'buyer'; // Default to 'buyer' if no role is set

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Conditionally render Sidebar and Header for agents */}
      {session && <Sidebar />}
      <div className={session ? 'flex-1 ml-64' : 'flex-1'}>
        {session && <Header />}
        <main className={session ? 'p-6 mt-16' : 'p-6'}>
          <Routes>
            {/* Route accessible to both buyers and agents */}
            <Route path="/viewQuote" element={<ViewQuote />} />

            {/* Protected Routes for agents */}
            {session && (
              <>
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/products" element={<Products />} />
                <Route path="/designs" element={<Designs />} />
                <Route path="/samples" element={<Samples />} />
                <Route path="/quotes" element={<Quote />} />
                <Route path="/newQuote" element={<NewQuote />} />
                <Route path="/prices" element={<MetalPrices />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/designQuote" element={<DesignQuote />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SupaBaseProvider>
      <MessageProvider>
        <MessageBox />
        <Router>

          <AppContent />
        </Router>
      </MessageProvider>
    </SupaBaseProvider>
  );
}

export default App;