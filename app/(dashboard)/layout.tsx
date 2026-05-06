import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { PageTransition } from '@/components/ui/animations';
import { RealtimeProvider } from '@/components/providers/RealtimeProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <div className="flex h-screen bg-slate-50/50 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/50 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
          
          <Navbar />
          <main className="flex-1 overflow-y-auto p-8">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </RealtimeProvider>
  );
}
