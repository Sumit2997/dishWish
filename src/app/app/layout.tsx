import type { FC, ReactNode } from 'react';
import AppSidebar from '@/components/layout/sidebar';
import { SidebarInset, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <SidebarRail />
      {/* Main content area with SidebarInset */}
      <SidebarInset className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: Add a header within the main content area if needed */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 md:h-16 lg:px-8">
           {/* Mobile Sidebar Trigger */}
           <div className="md:hidden">
              <SidebarTrigger />
           </div>
           {/* You can add Breadcrumbs, Search, User menu here if needed */}
            <div className="flex-1 font-semibold text-lg">My Recipes</div>
             {/* Action buttons */}
             <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm">
                   <Compass className="mr-1.5 h-4 w-4" /> Discover
                </Button>
                 <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-1.5 h-4 w-4" /> Add recipe
                 </Button>
             </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};

export default AppLayout;
