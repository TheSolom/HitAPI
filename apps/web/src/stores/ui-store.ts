import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Period } from '@hitapi/types';

interface UiState {
    sidebarCollapsed: boolean;
    sidebarMobileOpen: boolean;
    activeTeamId: string | null;
    activeAppId: string | null;
    period: Period;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarMobileOpen: (open: boolean) => void;
    toggleSidebarMobile: () => void;
    setActiveTeamId: (id: string | null) => void;
    setActiveAppId: (id: string | null) => void;
    setPeriod: (period: Period) => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            sidebarMobileOpen: false,
            activeTeamId: null,
            activeAppId: null,
            period: '24h',
            toggleSidebar: () =>
                set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setSidebarCollapsed: (sidebarCollapsed) =>
                set({ sidebarCollapsed }),
            setSidebarMobileOpen: (sidebarMobileOpen) =>
                set({ sidebarMobileOpen }),
            toggleSidebarMobile: () =>
                set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),
            setActiveTeamId: (activeTeamId) => set({ activeTeamId }),
            setActiveAppId: (activeAppId) => set({ activeAppId }),
            setPeriod: (period) => set({ period }),
        }),
        {
            name: 'hitapi.ui',
            partialize: (state) => ({
                sidebarCollapsed: state.sidebarCollapsed,
                activeTeamId: state.activeTeamId,
                activeAppId: state.activeAppId,
                period: state.period,
            }),
        },
    ),
);
