import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronsUpDown } from "lucide-react";
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
}

export interface SelectionGroupProps {
  title: string;
  items: SelectionItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  loading?: boolean;
  visibleCount?: number;
  titleIcon?: React.ComponentType<{ className?: string }>;
  titleIconColor?: string;
}

export function SelectionGroup({
  title,
  items,
  selectedKey,
  onSelect,
  loading = false,
  visibleCount = 3,
  titleIcon,
  titleIconColor = "text-gray-600",
}: SelectionGroupProps) {
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          {titleIcon &&
            React.createElement(titleIcon, {
              className: `w-5 h-5 ${titleIconColor}`,
            })}
          {title}
        </h2>
        <div className="text-sm text-gray-500 italic ml-7">
          No items available.
        </div>
      </div>
    );
  }

  // Calculate items to display
  const selectedItem = items.find((item) => item.key === selectedKey);
  const initialVisibleItems = items.slice(0, visibleCount);
  const buttonItems =
    selectedItem &&
      !initialVisibleItems.find((item) => item.key === selectedItem.key)
      ? [...initialVisibleItems, selectedItem]
      : initialVisibleItems;

  // Remove duplicates while preserving order
  const uniqueButtonItems = buttonItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.key === item.key)
  );

  // Get remaining items for dropdown
  const remainingItems = items.filter(
    (item) =>
      !uniqueButtonItems.find((buttonItem) => buttonItem.key === item.key)
  );

  const renderItemIcon = (item: SelectionItem) => {
    if (item.logoUri) {
      return (
        <Image
          src={item.logoUri}
          alt={`${item.name} logo`}
          className="w-4 h-4 mr-1.5 object-contain"
          width={16}
          height={16}
        />
      );
    }

    if (item.icon) {
      return <item.icon className="w-4 h-4 mr-1.5" />;
    }

    return null;
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        {titleIcon &&
          React.createElement(titleIcon, {
            className: `w-5 h-5 ${titleIconColor}`,
          })}
        Select {title}
      </p>
      <div className="flex items-center gap-3 flex-wrap ml-8">
        {/* Button items */}
        {uniqueButtonItems.map((item) => {
          const isSelected = item.key === selectedKey;
          return (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              className={`h-9 px-3 relative ${isSelected
                ? "bg-blue-50 text-blue-700 border-blue-500 hover:bg-blue-100"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              onClick={() => onSelect(item.key)}
            >
              {renderItemIcon(item)}
              {item.name}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </Button>
          );
        })}

        {/* Dropdown for remaining items */}
        {remainingItems.length > 0 && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                role="combobox"
                aria-expanded={open}
                className="h-9 px-3 w-auto min-w-[140px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {`${remainingItems.length} more`}
                <ChevronsUpDown className="w-4 h-4 ml-1 opacity-50" />
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
                    {remainingItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => {
                          onSelect(item.key);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {item.logoUri ? (
                            <Image
                              src={item.logoUri}
                              alt={`${item.name} logo`}
                              className="w-4 h-4 object-contain"
                              width={16}
                              height={16}
                            />
                          ) : (
                            item.icon && <item.icon className="w-4 h-4" />
                          )}
                          {item.name}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
