'use client';

import { useState } from 'react';

interface PopupBlockedNotificationProps {
  onRetryWithRedirect: () => void;
  onDismiss: () => void;
  show: boolean;
}

export default function PopupBlockedNotification({ 
  onRetryWithRedirect, 
  onDismiss, 
  show 
}: PopupBlockedNotificationProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Popup Blocked
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Your browser blocked the Google sign-in popup. You can either:
          </p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Allow popups for this site and try again</li>
            <li>Use the redirect method instead (recommended)</li>
          </ul>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onRetryWithRedirect}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Use Redirect Method
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
        
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            💡 Tip: You can allow popups for this site in your browser settings to avoid this message in the future.
          </p>
        </div>
      </div>
    </div>
  );
}