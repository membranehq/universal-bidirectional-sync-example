import { ReactNode } from 'react';
import { Header } from '@/components/header';
import { IntegrationAppProvider } from '../integration-app-provider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <IntegrationAppProvider>
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </IntegrationAppProvider>
  );
} 