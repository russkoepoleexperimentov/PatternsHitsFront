import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children }) => (
  <div className="mb-4">
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ hasError, className = '', ...props }) => (
  <input
    className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      hasError ? 'border-red-300' : 'border-gray-300'
    } ${className}`}
    {...props}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select: React.FC<SelectProps> = ({ hasError, className = '', children, ...props }) => (
  <select
    className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      hasError ? 'border-red-300' : 'border-gray-300'
    } ${className}`}
    {...props}
  >
    {children}
  </select>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ hasError, className = '', ...props }) => (
  <textarea
    className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      hasError ? 'border-red-300' : 'border-gray-300'
    } ${className}`}
    {...props}
  />
);
