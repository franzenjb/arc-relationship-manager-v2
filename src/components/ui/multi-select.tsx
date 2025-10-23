'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { X, ChevronDown } from 'lucide-react'

interface Option {
  id: string
  name: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className = "",
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId))
    } else {
      onChange([...selected, optionId])
    }
  }

  const removeOption = (optionId: string) => {
    onChange(selected.filter(id => id !== optionId))
  }

  const selectedOptions = options.filter(option => selected.includes(option.id))

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          flex min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
          focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
              >
                {option.name}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(option.id)
                    }}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        {!disabled && (
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.id}
                className={`
                  p-3 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0
                  ${selected.includes(option.id) ? 'bg-red-50 text-red-900' : ''}
                `}
                onClick={() => toggleOption(option.id)}
              >
                <div className="flex items-center justify-between">
                  <span>{option.name}</span>
                  {selected.includes(option.id) && (
                    <span className="text-red-600 font-medium">✓</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}