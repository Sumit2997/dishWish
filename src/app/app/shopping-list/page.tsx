// src/app/app/shopping-list/page.tsx
'use client';

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Printer, Share2, MoreVertical, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger

interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  recipe?: string; // Optional recipe link
  checked: boolean;
}

const ShoppingListPage = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([
    // Sample initial data - replace with data fetching/state management
    { id: '1', name: 'Onions (2 medium)', category: 'Produce', recipe: 'Palak Paneer', checked: false },
    { id: '2', name: 'Spinach (1 bunch)', category: 'Produce', recipe: 'Palak Paneer', checked: false },
    { id: '3', name: 'Paneer (200g)', category: 'Dairy', recipe: 'Palak Paneer', checked: true },
    { id: '4', name: 'Tomatoes (3 large)', category: 'Produce', recipe: 'Butter Chicken', checked: false },
    { id: '5', name: 'Chicken Breasts (500g)', category: 'Meat', recipe: 'Butter Chicken', checked: false },
    { id: '6', name: 'Garam Masala (1 tbsp)', category: 'Spices', checked: false },
    { id: '7', name: 'Milk (1 liter)', category: 'Dairy', checked: false },
    { id: '8', name: 'Basmati Rice (1 kg)', category: 'Pantry', checked: true },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Uncategorized');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'recipe'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterByCategory, setFilterByCategory] = useState<string | null>(null);

  const handleToggleItem = (id: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      const newItem: ShoppingListItem = {
        id: Date.now().toString(), // Simple ID generation
        name: newItemName.trim(),
        category: newItemCategory || 'Uncategorized',
        checked: false,
      };
      setItems(prevItems => [...prevItems, newItem]);
      setNewItemName('');
      // Optionally reset category: setNewItemCategory('Uncategorized');
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleRemoveCheckedItems = () => {
    setItems(prevItems => prevItems.filter(item => !item.checked));
  };

  const handleUncheckAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, checked: true }))); // Intentional: Check all first
    setTimeout(() => { // Then uncheck all after a tiny delay for visual feedback
         setItems(prevItems => prevItems.map(item => ({ ...item, checked: false })));
    }, 50);
  };

  // Filtering and Sorting Logic
  const filteredAndSortedItems = items
    .filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterByCategory || item.category === filterByCategory)
    )
    .sort((a, b) => {
      let compareA: string | undefined;
      let compareB: string | undefined;

      switch (sortBy) {
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'recipe':
          compareA = a.recipe?.toLowerCase() || 'zzzz'; // Push items without recipe to end
          compareB = b.recipe?.toLowerCase() || 'zzzz';
          break;
        case 'category':
        default:
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      // Secondary sort by name if primary sort key is the same
      if (sortBy !== 'name') {
          if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
          if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      }
      return 0;
    });

  // Group items by category for display
  const groupedItems = filteredAndSortedItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const categories = [...new Set(items.map(item => item.category))].sort(); // Get unique categories for filter dropdown

  return (
    <div className="flex flex-col h-full">
       {/* Page Header */}
       <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-muted/30 px-6 sticky top-0 z-30 mb-6 -mx-6 md:-mx-8 lg:-mx-10"> {/* Negative margins to extend */}
          <div className="md:hidden">
             <SidebarTrigger />
          </div>
          <div className="flex-1">
             <h1 className="text-xl font-semibold text-foreground">Shopping List</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             <Button variant="outline" size="sm"><Printer className="mr-1.5 h-4 w-4" /> Print</Button>
             <Button variant="outline" size="sm"><Share2 className="mr-1.5 h-4 w-4" /> Share</Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={handleRemoveCheckedItems} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Checked Items
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={handleUncheckAll}>
                      Uncheck All
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem disabled>Import List</DropdownMenuItem>
                   <DropdownMenuItem disabled>Export List</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
       </header>

       {/* Add Item Form */}
       <form onSubmit={handleAddItem} className="mb-6 flex items-end gap-3 flex-wrap bg-muted/30 p-4 rounded-lg border border-border/30">
          <div className="flex-grow min-w-[150px]">
              <Label htmlFor="new-item-name" className="text-xs font-medium text-muted-foreground">Item Name</Label>
              <Input
                 id="new-item-name"
                 value={newItemName}
                 onChange={(e) => setNewItemName(e.target.value)}
                 placeholder="e.g., Flour (1kg) or Apples"
                 className="mt-1 h-9"
              />
          </div>
          <div className="w-40">
              <Label htmlFor="new-item-category" className="text-xs font-medium text-muted-foreground">Category</Label>
               <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                   <SelectTrigger id="new-item-category" className="mt-1 h-9">
                       <SelectValue placeholder="Select category" />
                   </SelectTrigger>
                   <SelectContent>
                       <SelectItem value="Produce">Produce</SelectItem>
                       <SelectItem value="Dairy">Dairy</SelectItem>
                       <SelectItem value="Meat">Meat</SelectItem>
                       <SelectItem value="Pantry">Pantry</SelectItem>
                       <SelectItem value="Spices">Spices</SelectItem>
                       <SelectItem value="Frozen">Frozen</SelectItem>
                       <SelectItem value="Beverages">Beverages</SelectItem>
                       <SelectItem value="Household">Household</SelectItem>
                       <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                       {/* Add more common categories */}
                   </SelectContent>
               </Select>
          </div>
          <Button type="submit" size="sm" className="h-9 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
       </form>

       {/* Filter and Sort Controls */}
       <div className="flex items-center gap-3 mb-4 flex-wrap">
         <div className="relative flex-grow min-w-[200px]">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search items..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-8 h-9"
           />
         </div>
         <Select value={filterByCategory || 'all'} onValueChange={(value) => setFilterByCategory(value === 'all' ? null : value)}>
           <SelectTrigger className="w-[160px] h-9">
             <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground"/>
             <SelectValue placeholder="Filter by category" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Categories</SelectItem>
             {categories.map(cat => (
               <SelectItem key={cat} value={cat}>{cat}</SelectItem>
             ))}
           </SelectContent>
         </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'category' | 'name' | 'recipe')}>
           <SelectTrigger className="w-[150px] h-9">
              {/* Conditional icon based on sortOrder */}
              {sortOrder === 'asc' ? (
                  <SortAsc className="h-3.5 w-3.5 mr-1.5 text-muted-foreground"/>
              ) : (
                  <SortDesc className="h-3.5 w-3.5 mr-1.5 text-muted-foreground"/>
              )}
             <SelectValue placeholder="Sort by" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="category">Sort by Category</SelectItem>
             <SelectItem value="name">Sort by Name</SelectItem>
             <SelectItem value="recipe">Sort by Recipe</SelectItem>
           </SelectContent>
         </Select>
         {/* Toggle Sort Order Button */}
          <Button
             variant="outline"
             size="icon"
             className="h-9 w-9"
             onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
             title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
           >
             {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
           </Button>
       </div>

       {/* Shopping List Items */}
       <div className="flex-1 overflow-y-auto space-y-5 pr-2 -mr-2">
         {Object.entries(groupedItems).length > 0 ? (
           Object.entries(groupedItems).map(([category, categoryItems]) => (
             <Card key={category} className="bg-card border border-border/40 shadow-sm">
               <CardHeader className="py-3 px-4 border-b border-border/30">
                 <CardTitle className="text-base font-semibold text-primary">{category}</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <ul className="divide-y divide-border/30">
                   {categoryItems.map(item => (
                     <li key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                       <div className="flex items-center gap-3 flex-1 min-w-0">
                         <Checkbox
                           id={`item-${item.id}`}
                           checked={item.checked}
                           onCheckedChange={() => handleToggleItem(item.id)}
                           className="h-5 w-5 rounded-full border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                         />
                         <div className="flex-1 min-w-0">
                           <Label
                              htmlFor={`item-${item.id}`}
                              className={`text-sm cursor-pointer ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                            >
                             {item.name}
                           </Label>
                            {item.recipe && (
                              <span className="ml-2 text-xs text-muted-foreground block truncate italic">
                                for {item.recipe}
                              </span>
                            )}
                          </div>
                       </div>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
                         onClick={() => handleRemoveItem(item.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
           ))
         ) : (
           <div className="text-center py-16 text-muted-foreground">
             {searchTerm ? 'No items match your search.' : 'Your shopping list is empty.'}
           </div>
         )}
       </div>
     </div>
  );
};

export default ShoppingListPage;
