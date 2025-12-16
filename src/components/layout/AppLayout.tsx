import React, { useState, createContext, useContext } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

// Create context for search query
export const SearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    return { searchQuery: '', setSearchQuery: () => {} };
  }
  return context;
};

export function AppLayout({ children, currentPath }: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getActiveSidebarItem = () => {
    if (currentPath.startsWith('/students')) return 'students';
    if (currentPath.startsWith('/ops')) return 'operations';
    return 'dashboard'; // default to dashboard
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="flex h-screen bg-background">
        <Sidebar activeTab={getActiveSidebarItem()} currentPath={currentPath} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} currentPath={currentPath} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
