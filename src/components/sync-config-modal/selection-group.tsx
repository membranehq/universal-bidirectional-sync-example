import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronsUpDown,
  ChevronDown
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

export interface SelectionItem {
  id: string;
  key: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  logoUri?: string;
  disabled?: boolean;
  category?: string;
}

export interface CategoryIcon {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export interface SelectionGroupProps {
  items: SelectionItem[];
  selectedKey: string | null;
  onItemSelect: (key: string) => void;
  loading?: boolean;
  visibleCount?: number;
  categoryIcons?: Record<string, CategoryIcon>;
  onCategorySelect?: () => void;
}

const ItemIcon = ({
  item,
  className = "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5",
}: {
  item: SelectionItem;
  className?: string;
}) => {
  if (item.logoUri) {
    return (
      <Image
        src={item.logoUri}
        alt={`${item.name} logo`}
        className={`${className} object-contain`}
        width={16}
        height={16}
      />
    );
  }
  return item.icon ? <item.icon className={className} /> : null;
};



const SelectionButton = ({
  item,
  isSelected,
  onItemSelect,
}: {
  item: SelectionItem;
  isSelected: boolean;
  onItemSelect: (key: string) => void;
}) => {
  const baseStyles = "h-8 sm:h-9 px-2 sm:px-3 relative text-xs sm:text-sm";
  const styles = item.disabled
    ? `${baseStyles} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`
    : `${baseStyles} ${isSelected
      ? "bg-blue-50 text-blue-700 border-blue-500 hover:bg-blue-100"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
    }`;

  return (
    <Button
      variant="outline"
      size="sm"
      className={styles}
      onClick={() => !item.disabled && onItemSelect(item.key)}
      disabled={item.disabled}
    >
      <ItemIcon item={item} />
      <span className="truncate max-w-[80px] sm:max-w-[120px]">
        {item.name}
      </span>
      {isSelected && !item.disabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
        </div>
      )}
    </Button>
  );
};

const ItemsDropdown = ({
  items,
  title,
  onItemSelect,
  onClose,
}: {
  items: SelectionItem[];
  title: string;
  onItemSelect: (key: string) => void;
  onClose?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 sm:h-9 px-2 sm:px-3 w-auto min-w-[100px] sm:min-w-[140px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
        >
          {`${items.length} more`}
          <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${title.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    if (!item.disabled) {
                      onItemSelect(item.key);
                      setOpen(false);
                      onClose?.();
                    }
                  }}
                  className={
                    item.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }
                  disabled={item.disabled}
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon item={item} className="w-4 h-4" />
                    {item.name}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CategoryPicker = ({
  categories,
  selectedCategory,
  onCategorySelect,
  categorizedItems,
  categoryIcons,
  allItems,
}: {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categorizedItems: Record<string, SelectionItem[]>;
  categoryIcons?: Record<string, CategoryIcon>;
  allItems: SelectionItem[];
}) => {
  const [open, setOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    if (!categoryIcons) return null;
    const categoryInfo = categoryIcons[category];
    return categoryInfo?.icon;
  };

  const getCategoryCount = (category: string) => {
    if (category === "All") {
      return allItems.length;
    }
    return categorizedItems[category]?.length || 0;
  };

  const displayCategory = (category: string) =>
    category === "All" ? "All categories" : category;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 sm:h-9 px-2 sm:px-3 min-w-[120px] sm:min-w-[160px] text-xs sm:text-sm font-bold bg-blue-50 text-blue-700 border-blue-500 hover:bg-blue-100 ring-2 ring-blue-200 shadow-sm"
        >
          {getCategoryIcon(selectedCategory) && React.createElement(getCategoryIcon(selectedCategory)!, {
            className: "w-3 h-3 sm:w-4 sm:h-4 mr-1",
          })}
          {displayCategory(selectedCategory)}
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." className="h-9" />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category}
                  value={category}
                  onSelect={() => {
                    onCategorySelect(category);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category) && React.createElement(getCategoryIcon(category)!, {
                        className: "w-4 h-4",
                      })}
                      {displayCategory(category)}
                    </div>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {getCategoryCount(category)}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const CompactCategoryLayout = ({
  items,
  selectedKey,
  onItemSelect,
  visibleCount = 4,
  categoryIcons,
  onCategorySelect,
}: {
  items: SelectionItem[];
  selectedKey: string | null;
  onItemSelect: (key: string) => void;
  visibleCount?: number;
  categoryIcons?: Record<string, CategoryIcon>;
  onCategorySelect?: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Group items by category
  const categorizedItems = items.reduce((acc, item) => {
    const category = item.category;
    if (category) {
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
    }
    return acc;
  }, {} as Record<string, SelectionItem[]>);

  const categories = Object.keys(categorizedItems).sort((a, b) => {
    return a.localeCompare(b);
  });

  // Get items for selected category
  const currentItems =
    selectedCategory === "All"
      ? items
      : categorizedItems[selectedCategory] || [];

  // Calculate visible items with truncation
  const selectedItem = currentItems.find((item) => item.key === selectedKey);
  const initialVisible = currentItems.slice(0, visibleCount);
  const visibleItems =
    selectedItem &&
      !initialVisible.find((item) => item.key === selectedItem.key)
      ? [...initialVisible, selectedItem].filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.key === item.key)
      )
      : initialVisible;

  const remainingItems = currentItems.filter(
    (item) => !visibleItems.find((visibleItem) => visibleItem.key === item.key)
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <CategoryPicker
        categories={[...categories, "All"]}
        selectedCategory={selectedCategory}
        onCategorySelect={(category) => {
          setSelectedCategory(category);
          onCategorySelect?.();
        }}
        categorizedItems={categorizedItems}
        categoryIcons={categoryIcons}
        allItems={items}
      />
      <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {visibleItems.map((item) => (
          <SelectionButton
            key={item.id}
            item={item}
            isSelected={item.key === selectedKey}
            onItemSelect={onItemSelect}
          />
        ))}
        {remainingItems.length > 0 && (
          <ItemsDropdown
            items={remainingItems}
            title={selectedCategory}
            onItemSelect={onItemSelect}
          />
        )}
      </div>
    </div>
  );
};

export function SelectionGroup({
  items,
  selectedKey,
  onItemSelect,
  loading = false,
  visibleCount = 3,
  categoryIcons,
  onCategorySelect,
}: SelectionGroupProps) {

  // Group items by category (only if categoryIcons is provided)
  const categorizedItems = categoryIcons
    ? items.reduce((acc, item) => {
      const category = item.category;
      if (category) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
      }
      return acc;
    }, {} as Record<string, SelectionItem[]>)
    : null;

  // Calculate visible items for "all" mode
  const selectedItem = items.find((item) => item.key === selectedKey);
  const initialVisible = items.slice(0, visibleCount);
  const visibleItems =
    selectedItem &&
      !initialVisible.find((item) => item.key === selectedItem.key)
      ? [...initialVisible, selectedItem].filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.key === item.key)
      )
      : initialVisible;

  const remainingItems = items.filter(
    (item) => !visibleItems.find((visibleItem) => visibleItem.key === item.key)
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Skeleton className="h-8 sm:h-9 w-20 sm:w-24" />
        <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
        <Skeleton className="h-8 sm:h-9 w-28 sm:w-32" />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      {categorizedItems && categoryIcons ? (
        <CompactCategoryLayout
          items={items}
          selectedKey={selectedKey}
          onItemSelect={onItemSelect}
          visibleCount={visibleCount}
          categoryIcons={categoryIcons}
          onCategorySelect={onCategorySelect}
        />
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {visibleItems.map((item) => (
            <SelectionButton
              key={item.id}
              item={item}
              isSelected={item.key === selectedKey}
              onItemSelect={onItemSelect}
            />
          ))}
          {remainingItems.length > 0 && (
            <ItemsDropdown
              items={remainingItems}
              title="Items"
              onItemSelect={onItemSelect}
              onClose={() => { }}
            />
          )}
        </div>
      )}
    </div>
  );
}
