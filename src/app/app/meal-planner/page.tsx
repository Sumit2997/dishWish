'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  StickyNote,
  Shuffle,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { useAuth } from '@/context/auth-context'; // Import useAuth hook
import { useToast } from '@/hooks/use-toast'; // Import useToast hook

interface MealSlot {
  name: string;
  plannedRecipe?: string | null;
}

interface DailyPlan {
  date: Date;
  meals: MealSlot[];
}

const MealPlannerPage = () => {
  const { user } = useAuth(); // Get user information
  const { toast } = useToast(); // Get toast function
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate the start of the current week (assuming Sunday is the start)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Placeholder data generation for the week
  const generateWeeklyPlan = (startDate: Date): DailyPlan[] => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = addDays(startDate, i);
      return {
        date: dayDate,
        meals: [
          { name: 'Breakfast' },
          { name: 'Lunch' },
          { name: 'Dinner' },
          { name: 'Snack' },
        ],
      };
    });
  };

  const [weeklyPlan, setWeeklyPlan] = useState<DailyPlan[]>(generateWeeklyPlan(weekStart));

  const handlePreviousWeek = () => {
    const previousWeekStart = subWeeks(weekStart, 1);
    setCurrentDate(previousWeekStart);
    setWeeklyPlan(generateWeeklyPlan(previousWeekStart));
  };

  const handleNextWeek = () => {
    const nextWeekStart = addWeeks(weekStart, 1);
    setCurrentDate(nextWeekStart);
    setWeeklyPlan(generateWeeklyPlan(nextWeekStart));
  };

  // Placeholder functions for dropdown actions
  const handleAddNote = (dayIndex: number) => {
    toast({
      title: 'Add Note Clicked',
      description: `Adding note for ${format(weeklyPlan[dayIndex].date, 'eeee, MMM d')}. Feature coming soon!`,
    });
  };

  const handlePlanRandomRecipe = (dayIndex: number) => {
    toast({
      title: 'Plan Random Recipe Clicked',
      description: `Planning random recipe for ${format(weeklyPlan[dayIndex].date, 'eeee, MMM d')}. Feature coming soon!`,
    });
  };

  // Placeholder function for adding meal
  const handleAddMeal = (dayIndex: number, mealName: string) => {
     toast({
       title: `Add ${mealName} Clicked`,
       description: `Planning ${mealName} for ${format(weeklyPlan[dayIndex].date, 'eeee, MMM d')}. Feature coming soon!`,
     });
   };

  const plannerName = user?.displayName ? `${user.displayName}'s planner` : 'Meal Planner';

  return (
    <div className="flex flex-col h-full p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" className="text-xl font-semibold text-foreground p-0 h-auto hover:bg-transparent">
               {plannerName}
               <ChevronDown className="ml-2 h-4 w-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="start">
             <DropdownMenuItem disabled>Switch Planner</DropdownMenuItem>
             <DropdownMenuItem disabled>Create New Planner</DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className='sr-only'>Share Planner</span>
          </Button>
          {/* Add other header actions if needed */}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={handlePreviousWeek} className="h-8 w-8">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium text-foreground">
          Week of {format(weekStart, 'MMMM d, yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekly Plan Grid */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        {weeklyPlan.map((dayPlan, dayIndex) => (
          <Card key={format(dayPlan.date, 'yyyy-MM-dd')} className="bg-card border border-border/40 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                {format(dayPlan.date, 'eeee')} <span className="text-muted-foreground font-normal">{format(dayPlan.date, 'MMM d')}</span>
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-7 px-2 py-1">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Plan <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAddNote(dayIndex)} className="cursor-pointer">
                    <StickyNote className="mr-2 h-4 w-4" /> Add note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handlePlanRandomRecipe(dayIndex)} className="cursor-pointer">
                    <Shuffle className="mr-2 h-4 w-4" /> Plan random recipe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
               {/* Placeholder for planned meals */}
               <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground flex-grow">
                   {dayPlan.meals.map((meal) => (
                       <Button
                          key={meal.name}
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                           onClick={() => handleAddMeal(dayIndex, meal.name)}
                        >
                           <Plus className="h-3 w-3 mr-1 opacity-70" /> {meal.name}
                       </Button>
                   ))}
               </div>
               {/* Add display area for planned recipes/notes here if needed */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlannerPage;
