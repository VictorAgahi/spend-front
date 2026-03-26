import { ToastType } from '../components/molecules/Toast';

type ToastEvent = {
  message: string;
  type: ToastType;
};

type Listener = (event: ToastEvent) => void;

class EventEmitter {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: ToastEvent) {
    this.listeners.forEach(l => l(event));
  }
}

export const notificationEvents = new EventEmitter();
