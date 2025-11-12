import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  Icon?: React.ElementType;
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options, placeholder, disabled = false, Icon }) => {
  return (
    <div className="relative w-full">
      <label htmlFor={label} className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />}
        <select
          id={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            appearance-none w-full
            bg-gray-800 border border-gray-600 text-white rounded-lg 
            focus:ring-2 focus:ring-red-500 focus:border-red-500 
            block p-3 transition ease-in-out duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-4'}
          `}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default Select;
