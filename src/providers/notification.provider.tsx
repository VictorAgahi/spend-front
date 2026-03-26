import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast, ToastType } from '../components/molecules/Toast';
import { notificationEvents } from '../services/notification.events';

interface NotificationContextType {
  showToast: (message: string, type: ToastType) => void;
  error: (message: string) => void;
  success: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe((event) => {
      showToast(event.message, event.type);
    });
    return unsubscribe;
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const error = (message: string) => showToast(message, 'error');
  const success = (message: string) => showToast(message, 'success');

  return (
    <NotificationContext.Provider value={{ showToast, error, success }}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          // Offset each toast if multiple visible
          // In simpler version, we just stack them or show one by one
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
