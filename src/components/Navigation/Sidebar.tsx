import { useState } from 'react';
import { Paintbrush as PaintBrush, Images, Menu, X, Edit } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export function Sidebar({ currentPage, onNavigate, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const menuItems = [
    { id: 'designer', label: 'MyDesigner', icon: PaintBrush },
    { id: 'inpaint', label: 'Inpainting', icon: Edit },
    { id: 'gallery', label: 'MyProjects', icon: Images },
  ];

  const MenuContent = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4 transform transition-transform z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <MenuContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 p-4">
        <MenuContent />
      </div>
    </>
  );
}