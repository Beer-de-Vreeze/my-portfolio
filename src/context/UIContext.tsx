'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// UI State types
interface UIState {
  // Navigation state
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Modal/Dialog state
  activeModal: string | null;
  modalStack: string[];
  
  // Loading states
  globalLoading: boolean;
  componentLoadingStates: Record<string, boolean>;
  
  // Focus management
  focusedElement: string | null;
  focusTrap: boolean;
  
  // Search/Filter state
  searchQuery: string;
  activeFilters: Record<string, unknown>;
  
  // View preferences
  viewMode: 'grid' | 'list' | 'card';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Interaction states
  hoveredElement: string | null;
  selectedItems: string[];
  
  // Page-specific states
  pageStates: Record<string, Record<string, unknown>>;
}

interface UIContextType extends UIState {
  // Navigation actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setComponentLoading: (componentId: string, loading: boolean) => void;
  isComponentLoading: (componentId: string) => boolean;
  
  // Focus actions
  setFocusedElement: (elementId: string | null) => void;
  setFocusTrap: (enabled: boolean) => void;
  
  // Search/Filter actions
  setSearchQuery: (query: string) => void;
  updateFilter: (key: string, value: unknown) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  
  // View actions
  setViewMode: (mode: 'grid' | 'list' | 'card') => void;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  
  // Interaction actions
  setHoveredElement: (elementId: string | null) => void;
  toggleSelection: (itemId: string) => void;
  setSelectedItems: (items: string[]) => void;
  clearSelection: () => void;
  
  // Page state actions
  setPageState: (pageId: string, key: string, value: unknown) => void;
  getPageState: <T = unknown>(pageId: string, key: string, defaultValue?: T) => T;
  clearPageState: (pageId: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

// Default UI state
const defaultUIState: UIState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  activeModal: null,
  modalStack: [],
  globalLoading: false,
  componentLoadingStates: {},
  focusedElement: null,
  focusTrap: false,
  searchQuery: '',
  activeFilters: {},
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
  hoveredElement: null,
  selectedItems: [],
  pageStates: {},
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [uiState, setUIState] = useState<UIState>(defaultUIState);

  // Navigation actions
  const toggleSidebar = useCallback(() => {
    setUIState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setUIState(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setUIState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  const setMobileMenuOpen = useCallback((open: boolean) => {
    setUIState(prev => ({ ...prev, mobileMenuOpen: open }));
  }, []);

  // Modal actions
  const openModal = useCallback((modalId: string) => {
    setUIState(prev => ({
      ...prev,
      activeModal: modalId,
      modalStack: prev.modalStack.includes(modalId) 
        ? prev.modalStack 
        : [...prev.modalStack, modalId],
    }));
  }, []);

  const closeModal = useCallback((modalId?: string) => {
    setUIState(prev => {
      const targetModal = modalId || prev.activeModal;
      if (!targetModal) return prev;

      const newStack = prev.modalStack.filter(id => id !== targetModal);
      return {
        ...prev,
        activeModal: newStack[newStack.length - 1] || null,
        modalStack: newStack,
      };
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      activeModal: null,
      modalStack: [],
    }));
  }, []);

  const isModalOpen = useCallback((modalId: string) => {
    return uiState.modalStack.includes(modalId);
  }, [uiState.modalStack]);

  // Loading actions
  const setGlobalLoading = useCallback((loading: boolean) => {
    setUIState(prev => ({ ...prev, globalLoading: loading }));
  }, []);

  const setComponentLoading = useCallback((componentId: string, loading: boolean) => {
    setUIState(prev => ({
      ...prev,
      componentLoadingStates: {
        ...prev.componentLoadingStates,
        [componentId]: loading,
      },
    }));
  }, []);

  const isComponentLoading = useCallback((componentId: string) => {
    return uiState.componentLoadingStates[componentId] || false;
  }, [uiState.componentLoadingStates]);

  // Focus actions
  const setFocusedElement = useCallback((elementId: string | null) => {
    setUIState(prev => ({ ...prev, focusedElement: elementId }));
  }, []);

  const setFocusTrap = useCallback((enabled: boolean) => {
    setUIState(prev => ({ ...prev, focusTrap: enabled }));
  }, []);

  // Search/Filter actions
  const setSearchQuery = useCallback((query: string) => {
    setUIState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const updateFilter = useCallback((key: string, value: unknown) => {
    setUIState(prev => ({
      ...prev,
      activeFilters: { ...prev.activeFilters, [key]: value },
    }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setUIState(prev => {
      const { [key]: _removed, ...remainingFilters } = prev.activeFilters;
      return { ...prev, activeFilters: remainingFilters };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setUIState(prev => ({ ...prev, activeFilters: {} }));
  }, []);

  // View actions
  const setViewMode = useCallback((mode: 'grid' | 'list' | 'card') => {
    setUIState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSortBy = useCallback((field: string) => {
    setUIState(prev => ({ ...prev, sortBy: field }));
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setUIState(prev => ({ ...prev, sortOrder: order }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setUIState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Interaction actions
  const setHoveredElement = useCallback((elementId: string | null) => {
    setUIState(prev => ({ ...prev, hoveredElement: elementId }));
  }, []);

  const toggleSelection = useCallback((itemId: string) => {
    setUIState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter(id => id !== itemId)
        : [...prev.selectedItems, itemId],
    }));
  }, []);

  const setSelectedItems = useCallback((items: string[]) => {
    setUIState(prev => ({ ...prev, selectedItems: items }));
  }, []);

  const clearSelection = useCallback(() => {
    setUIState(prev => ({ ...prev, selectedItems: [] }));
  }, []);

  // Page state actions
  const setPageState = useCallback((pageId: string, key: string, value: unknown) => {
    setUIState(prev => ({
      ...prev,
      pageStates: {
        ...prev.pageStates,
        [pageId]: {
          ...prev.pageStates[pageId],
          [key]: value,
        },
      },
    }));
  }, []);

  const getPageState = useCallback(<T = unknown>(pageId: string, key: string, defaultValue?: T): T => {
    return uiState.pageStates[pageId]?.[key] as T ?? defaultValue as T;
  }, [uiState.pageStates]);

  const clearPageState = useCallback((pageId: string) => {
    setUIState(prev => {
      const { [pageId]: _removed, ...remainingPageStates } = prev.pageStates;
      return { ...prev, pageStates: remainingPageStates };
    });
  }, []);

  const value: UIContextType = {
    ...uiState,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    setGlobalLoading,
    setComponentLoading,
    isComponentLoading,
    setFocusedElement,
    setFocusTrap,
    setSearchQuery,
    updateFilter,
    clearFilter,
    clearAllFilters,
    setViewMode,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    setHoveredElement,
    toggleSelection,
    setSelectedItems,
    clearSelection,
    setPageState,
    getPageState,
    clearPageState,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Convenience hooks for specific UI areas
export const useModalState = () => {
  const { activeModal, modalStack, openModal, closeModal, closeAllModals, isModalOpen } = useUI();
  return { activeModal, modalStack, openModal, closeModal, closeAllModals, isModalOpen };
};

export const useLoadingState = () => {
  const { globalLoading, componentLoadingStates, setGlobalLoading, setComponentLoading, isComponentLoading } = useUI();
  return { globalLoading, componentLoadingStates, setGlobalLoading, setComponentLoading, isComponentLoading };
};

export const useFocusState = () => {
  const { focusedElement, focusTrap, setFocusedElement, setFocusTrap } = useUI();
  return { focusedElement, focusTrap, setFocusedElement, setFocusTrap };
};

export const useSearchState = () => {
  const { searchQuery, activeFilters, setSearchQuery, updateFilter, clearFilter, clearAllFilters } = useUI();
  return { searchQuery, activeFilters, setSearchQuery, updateFilter, clearFilter, clearAllFilters };
};