import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthInitializer } from '@/features/auth';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
    },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <AuthInitializer>
                        <RouterProvider router={router} />
                    </AuthInitializer>
                    <Toaster richColors position="top-right" />
                </TooltipProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>,
);
