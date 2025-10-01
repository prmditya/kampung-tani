import React from "react";
import { UI_CONSTANTS } from "@/lib/constants";

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Error",
  message,
  retry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`
      p-6 rounded-lg border border-red-200 dark:border-red-800 
      bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200
      ${className}
    `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="mt-1 text-sm opacity-90">{message}</p>

          {retry && (
            <button
              onClick={retry}
              className={`
                mt-3 px-3 py-1 text-sm font-medium rounded-md
                bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200
                hover:bg-red-200 dark:hover:bg-red-800
                ${UI_CONSTANTS.ANIMATION.TRANSITION}
                ${UI_CONSTANTS.ANIMATION.BUTTON_ACTIVE}
              `}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
