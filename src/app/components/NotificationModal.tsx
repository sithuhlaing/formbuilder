import React from "react";

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
}

export default function NotificationModal({
  isOpen,
  title,
  message,
  type = "success",
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "success":
      default:
        return (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative transform overflow-hidden rounded-xl bg-white p-6 text-center shadow-2xl transition-all sm:w-full sm:max-w-sm border border-gray-100 flex flex-col items-center gap-4 animate-in fade-in-50 zoom-in-95 duration-200">
        {getIcon()}

        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 px-2">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 rounded-md bg-[#005eb8] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003087] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}
