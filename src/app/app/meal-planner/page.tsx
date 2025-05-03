// src/app/app/meal-planner/page.tsx
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
  Users,
  CalendarPlus, // Added icon for modal
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useAppContext, type DailyPlan, type PlannedMeal, type Recipe } from '@/app/app/layout'; // Import context and types
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'; // Import Dialog components
import AddToMealPlanModal from '@/components/meal-planner/add-to-meal-plan-modal'; // Import the new modal component

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

const MealPlannerPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { recipes: availableRecipes, weeklyPlan, setWeeklyPlan } = useAppContext(); // Get recipes and plan from context

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddToMealPlanModalOpen, setIsAddToMealPlanModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });

  // Initialize weekly plan if it's empty in context
  React.useEffect(() => {
    if (weeklyPlan.length === 0) {
      const initialPlan = generateInitialWeeklyPlan(weekStart);
      setWeeklyPlan(initialPlan);
    }
  }, [weeklyPlan, setWeeklyPlan, weekStart]);

  const generateInitialWeeklyPlan = (startDate: Date): DailyPlan[] => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dayDate = addDays(startDate, i);
      return {
        date: dayDate,
        meals: { // Initialize all meals as null/undefined
          Breakfast: null,
          Lunch: null,
          Dinner: null,
          Snack: null,
        },
      };
    });
  };

  const handlePreviousWeek = () => {
    const previousWeekStart = subWeeks(weekStart, 1);
    setCurrentDate(previousWeekStart);
    // Update plan in context if needed, or maybe just navigate the view
    // If plan is persistent, fetch/update based on new weekStart
    // For now, assuming plan is only for the viewed week
    setWeeklyPlan(generateInitialWeeklyPlan(previousWeekStart));
  };

  const handleNextWeek = () => {
    const nextWeekStart = addWeeks(weekStart, 1);
    setCurrentDate(nextWeekStart);
    setWeeklyPlan(generateInitialWeeklyPlan(nextWeekStart));
  };

  const handleOpenAddToMealPlanModal = (day: Date, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setIsAddToMealPlanModalOpen(true);
  };

  const handleAddRecipeToPlan = (recipe: Recipe) => {
    if (!selectedDay || !selectedMealType) return;

    setWeeklyPlan(prevPlan => {
      return prevPlan.map(dayPlan => {
        if (isSameDay(dayPlan.date, selectedDay)) {
          return {
            ...dayPlan,
            meals: {
              ...dayPlan.meals,
              [selectedMealType]: { recipeName: recipe.name, recipeId: recipe.name }, // Use name as ID for now
            },
          };
        }
        return dayPlan;
      });
    });

    toast({
      title: `Added ${recipe.name}`,
      description: `Planned for ${selectedMealType} on ${format(selectedDay, 'eeee, MMM d')}.`,
    });
    setIsAddToMealPlanModalOpen(false); // Close modal after adding
  };


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

  const plannerName = user?.displayName ? `${user.displayName}'s planner` : 'Meal Planner';

  // Find the plan for the current week view
  const currentWeekPlan = weeklyPlan.filter(dayPlan =>
      dayPlan.date >= weekStart && dayPlan.date < addDays(weekStart, 7)
  );
  // Generate days if currentWeekPlan is empty (e.g., after navigation)
   const displayDays = currentWeekPlan.length === 7 ? currentWeekPlan : generateInitialWeeklyPlan(weekStart);


  return (
    <>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30 mb-6 -mx-6 md:-mx-8 lg:-mx-10"> {/* Negative margins */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-xl font-semibold text-foreground p-0 h-auto hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  {plannerName}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem disabled>Switch Planner</DropdownMenuItem>
                <DropdownMenuItem disabled>Create New Planner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className='sr-only'>Share Planner</span>
            </Button>
            {/* Add other header actions if needed */}
          </div>
        </header>

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
          {displayDays.map((dayPlan, dayIndex) => (
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
                     {/* Add Meal Type options */}
                     <DropdownMenuItem onClick={() => handleOpenAddToMealPlanModal(dayPlan.date, 'Breakfast')} className="cursor-pointer">
                       <CalendarPlus className="mr-2 h-4 w-4" /> Plan Breakfast
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleOpenAddToMealPlanModal(dayPlan.date, 'Lunch')} className="cursor-pointer">
                       <CalendarPlus className="mr-2 h-4 w-4" /> Plan Lunch
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleOpenAddToMealPlanModal(dayPlan.date, 'Dinner')} className="cursor-pointer">
                       <CalendarPlus className="mr-2 h-4 w-4" /> Plan Dinner
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleOpenAddToMealPlanModal(dayPlan.date, 'Snack')} className="cursor-pointer">
                       <CalendarPlus className="mr-2 h-4 w-4" /> Plan Snack
                     </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddNote(dayIndex)} className="cursor-pointer">
                      <StickyNote className="mr-2 h-4 w-4" /> Add note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePlanRandomRecipe(dayIndex)} className="cursor-pointer">
                      <Shuffle className="mr-2 h-4 w-4" /> Plan random recipe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                {/* Planned meals display */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm flex-grow">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((mealType) => {
                    const plannedMeal = dayPlan.meals[mealType];
                    return (
                      <div key={mealType} className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          onClick={() => handleOpenAddToMealPlanModal(dayPlan.date, mealType)}
                        >
                           <Plus className="h-3 w-3 mr-1 opacity-70" /> {mealType}
                        </Button>
                        {plannedMeal && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/30">
                            {plannedMeal.recipeName}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

       {/* Add to Meal Plan Modal */}
       <AddToMealPlanModal
          isOpen={isAddToMealPlanModalOpen}
          setIsOpen={setIsAddToMealPlanModalOpen}
          recipes={availableRecipes} // Pass available recipes
          onSelectRecipe={handleAddRecipeToPlan} // Pass the handler function
          selectedDate={selectedDay}
          selectedMealType={selectedMealType}
       />
    </>
  );
};

export default MealPlannerPage;
