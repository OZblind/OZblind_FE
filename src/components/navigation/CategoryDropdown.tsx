import React from "react";
import { IoChevronDown } from "react-icons/io5";
import type { Category } from "@src/types/search";
import { categories } from "@src/types/search";

interface CategoryDropdownProps {
  selectedCategory: Category;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (category: Category) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  isOpen,
  onToggle,
  onSelect,
  dropdownRef,
}) => {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center justify-center px-4 py-1.5 text-sm min-w-[100px] rounded-full m-2 transition-all duration-200 ${
          isOpen
            ? "bg-primary text-white shadow-md"
            : "text-base-content/70 hover:text-base-content hover:bg-primary/20"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`카테고리 선택: ${selectedCategory}`}
      >
        <span className="font-medium">{selectedCategory}</span>
        <IoChevronDown
          className={`w-3 h-3 transition-transform duration-200 ml-1 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* 카테고리 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl shadow-xl z-[70] w-full min-w-[100px] overflow-hidden animate-fadeIn bg-base-100 border border-base-300"
          role="listbox"
          aria-label="카테고리 목록"
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-base-300"></div>
          {categories
            .filter((category) => category !== selectedCategory)
            .map((category, index, filteredArray) => (
              <button
                key={category}
                onClick={() => onSelect(category)}
                className={`w-full px-3 py-2.5 text-center text-sm transition-all duration-150 text-base-content hover:bg-primary/10 hover:text-primary ${
                  index === 0 ? "rounded-t-xl" : ""
                } ${index === filteredArray.length - 1 ? "rounded-b-xl" : ""}`}
                role="option"
                aria-selected={false}
              >
                {category}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
