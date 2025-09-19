import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from "lucide-react";
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

export interface SelectionGroupProps {
  items: SelectionItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  loading?: boolean;
  visibleCount?: number;
  viewMode?: "all" | "categories";
  // viewMode is controlled by the parent; this component only renders the lists
}

const ItemIcon = ({ item, className = "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" }: { item: SelectionItem; className?: string }) => {
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

// Title removed; parent is responsible for rendering headings/labels

const SelectionButton = ({ item, isSelected, onSelect }: {
  item: SelectionItem;
  isSelected: boolean;
  onSelect: (key: string) => void;
}) => {
  const baseStyles = "h-8 sm:h-9 px-2 sm:px-3 relative text-xs sm:text-sm";
  const styles = item.disabled
    ? `${baseStyles} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`
    : `${baseStyles} ${isSelected
      ? "bg-blue-50 text-blue-700 border-blue-500 hover:bg-blue-100"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"}`;

  return (
    <Button
      variant="outline"
      size="sm"
      className={styles}
      onClick={() => !item.disabled && onSelect(item.key)}
      disabled={item.disabled}
    >
      <ItemIcon item={item} />
      <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.name}</span>
      {isSelected && !item.disabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
        </div>
      )}
    </Button>
  );
};

const ItemsDropdown = ({ items, title, onSelect, onClose }: {
  items: SelectionItem[];
  title: string;
  onSelect: (key: string) => void;
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
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    if (!item.disabled) {
                      onSelect(item.key);
                      setOpen(false);
                      onClose?.();
                    }
                  }}
                  className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
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

const CategorySection = ({ category, items, selectedKey, onSelect, visibleCount }: {
  category: string;
  items: SelectionItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  visibleCount: number;
}) => {
  // const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedItem = items.find(item => item.key === selectedKey);
  const initialVisible = items.slice(0, visibleCount);
  const visibleItems = selectedItem && !initialVisible.find(item => item.key === selectedItem.key)
    ? [...initialVisible, selectedItem].filter((item, index, self) =>
      index === self.findIndex(t => t.key === item.key))
    : initialVisible;

  const remainingItems = items.filter(item =>
    !visibleItems.find(visibleItem => visibleItem.key === item.key)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs font-medium">{category}</Badge>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {visibleItems.map((item) => (
          <SelectionButton
            key={item.id}
            item={item}
            isSelected={item.key === selectedKey}
            onSelect={onSelect}
          />
        ))}
        {remainingItems.length > 0 && (
          <ItemsDropdown
            items={remainingItems}
            title={category}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  );
};

export function SelectionGroup({
  items,
  selectedKey,
  onSelect,
  loading = false,
  visibleCount = 3,
  viewMode = "all",
}: SelectionGroupProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Group items by category
  const categorizedItems = viewMode === "categories"
    ? items.reduce((acc, item) => {
      const category = item.category || "Others";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, SelectionItem[]>)
    : null;

  const sortedCategories = categorizedItems
    ? Object.keys(categorizedItems).sort((a, b) => {
      if (a === "Others") return 1;
      if (b === "Others") return -1;
      return a.localeCompare(b);
    })
    : [];

  // Calculate visible items for "all" mode
  const selectedItem = items.find(item => item.key === selectedKey);
  const initialVisible = items.slice(0, visibleCount);
  const visibleItems = selectedItem && !initialVisible.find(item => item.key === selectedItem.key)
    ? [...initialVisible, selectedItem].filter((item, index, self) =>
      index === self.findIndex(t => t.key === item.key))
    : initialVisible;

  const remainingItems = items.filter(item =>
    !visibleItems.find(visibleItem => visibleItem.key === item.key)
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
      {viewMode === "categories" && categorizedItems ? (
        <div className="space-y-4">
          {(showAllCategories ? sortedCategories : sortedCategories.slice(0, 2)).map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={categorizedItems[category]}
              selectedKey={selectedKey}
              onSelect={onSelect}
              visibleCount={visibleCount}
            />
          ))}

          {!showAllCategories && sortedCategories.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(true)}
              className="text-xs text-gray-600 hover:text-gray-900 h-8 px-3"
            >
              See {sortedCategories.length - 2} more categories
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          )}

          {showAllCategories && sortedCategories.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(false)}
              className="text-xs text-gray-600 hover:text-gray-900 h-8 px-3"
            >
              Show less
              <ChevronUp className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {visibleItems.map((item) => (
            <SelectionButton
              key={item.id}
              item={item}
              isSelected={item.key === selectedKey}
              onSelect={onSelect}
            />
          ))}
          {remainingItems.length > 0 && (
            <ItemsDropdown
              items={remainingItems}
              title="Items"
              onSelect={onSelect}
              onClose={() => { }}
            />
          )}
        </div>
      )}
    </div>
  );
}
