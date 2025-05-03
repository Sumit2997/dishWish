'use client';

import type { FC } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  BookMarked,
  ShoppingCart,
  CalendarDays,
  Library,
  Tags,
  Plus,
  Compass,
  Search,
  Rocket,
  HelpCircle,
  Bell,
  LogOut,
  MoreVertical,
  Settings, // Removed Filter and LayoutGrid as they are in the header now
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { signOutUser } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AppSidebar: FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed Out', description: 'Successfully signed out.' });
      // Optionally redirect or handle UI changes
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: 'Could not sign you out. Please try again.',
      });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  };

  // Close mobile sidebar on link click
  const handleLinkClick = () => setOpenMobile(false);

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Updated Logo */}
        <Link href="/" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-1.5 rounded-md flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground">DishWish</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>My section</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/app" passHref legacyBehavior>
                 <SidebarMenuButton onClick={handleLinkClick} > {/* Removed isActive here, handled by path */}
                  <BookMarked />
                  Recipes
                 </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Link href="/app/shopping-list" passHref legacyBehavior>
                 <SidebarMenuButton onClick={handleLinkClick}> {/* Enabled */}
                   <ShoppingCart />
                   Shopping list
                 </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <CalendarDays />
                 Meal planner
               </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Library />
                 Cookbooks
               </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Tags />
                 Tags
               </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Disabled Add Recipe button in sidebar */}
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Plus />
                 Add recipe
               </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Compass />
                 Discover
               </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Search />
                 Search users
               </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Rocket />
                 Onboarding
               </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <HelpCircle />
                 Help
               </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton onClick={handleLinkClick} disabled>
                 <Bell />
                 Updates
               </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-2">
         {/* Get DishWish Plus - Removed */}
         {/*
         <div className="p-2">
            <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              Get DishWish Plus
            </Button>
            <Button variant="default" className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
               7 days for FREE →
            </Button>
         </div>
         */}

        {/* User Info */}
         {user && !loading && (
            <div className="flex items-center justify-between p-2 border-t border-sidebar-border mt-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.displayName)}
                    </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-xs truncate">
                        <span className="font-semibold text-sidebar-foreground">{user.displayName || 'User'}</span>
                        <span className="text-sidebar-foreground/70">{user.email}</span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/70 hover:bg-sidebar-accent">
                           <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end" side="top">
                         <DropdownMenuItem disabled>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
         )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
