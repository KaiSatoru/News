'use client'

import { Category, CATEGORIES } from '@/types/news'

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
  counts?: Record<string, number>
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {(Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]).map(
        ([key, config]) => {
          const isActive = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium
                border transition-all duration-150
                ${
                  isActive
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] hover:bg-[#222]'
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {counts && counts[key] !== undefined && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-[#2a2a2a] text-gray-500'}
                  `}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          )
        }
      )}
    </div>
  )
}
