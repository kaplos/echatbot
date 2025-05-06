import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings,
  MessageSquare,
  Calculator,
  DollarSign,
  Lightbulb,
  Hammer,
  ReceiptText,
  Pen
} from 'lucide-react';

export default function Sidebar  ()  {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Lightbulb, label: 'Ideas', to: '/ideas' },
    {icon: Pen, label: 'Design' , to: '/designs'},
    {icon: Hammer, label: 'Samples' , to: '/samples'},
    {icon: ReceiptText  , label: 'Quotes' , to: '/quotes'},
    { icon: DollarSign, label: 'Metal Prices', to: '/prices' },
    { icon: Users, label: 'Vendors', to: '/vendors' },
    // { icon: MessageSquare, label: 'Communications', to: '/communications' },
    // { icon: FileText, label: 'Documents', to: '/documents' },
    // { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 z-200">
      <div className="p-6">
        <div className="flex flex-col items-center">
          <div className="text-[#C5A572] text-3xl font-serif tracking-wider">
            E CHABOT
          </div>
          <div className="text-[#C5A572] text-sm mt-1">
            EST. 1993
          </div>
        </div>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-gray-50 border-r-4 border-[#C5A572]' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
