import React from 'react';
import { useShop } from '../../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function Toast() {
  const { toasts } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Sparkles;
        if (toast.type === 'error') Icon = AlertCircle;
        if (toast.type === 'info') Icon = Info;
        if (toast.type === 'success') Icon = CheckCircle2;

        return (
          <div key={toast.id} className="toast-item">
            <Icon size={18} color="var(--rb-gold-400)" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
