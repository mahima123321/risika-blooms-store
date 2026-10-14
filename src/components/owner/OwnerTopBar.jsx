import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Shield, LogOut, Settings, Phone, Lock, Sparkles, Layers } from 'lucide-react';

export default function OwnerTopBar() {
  const { 
    isOwnerAuthenticated, 
    logoutOwner, 
    openAddProductModal, 
    openOwnerSettingsModal,
    products,
    brandConfig
  } = useShop();

  if (!isOwnerAuthenticated) return null;

  return (
    <div className="owner-top-bar animate-fade-in">
      <div className="container owner-top-bar-content">
        <div className="owner-top-bar-left">
          <div className="owner-badge-pill">
            <Shield size={14} color="#D4AF37" />
            <span>👑 STORE OWNER STUDIO</span>
          </div>
          <span className="owner-top-bar-info">
            Catalog: <strong>{products.length} Bouquets</strong> • WhatsApp: <strong>{brandConfig?.whatsappNumber || 'Active'}</strong>
          </span>
        </div>

        <div className="owner-top-bar-actions">
          <button 
            className="btn btn-gold btn-sm owner-bar-btn"
            onClick={() => openAddProductModal()}
            title="Add a new bouquet with custom photo and price"
          >
            <Plus size={14} />
            <span>+ Add Bouquet (नया बुके डालें)</span>
          </button>

          <button 
            className="btn btn-outline btn-sm owner-bar-btn-subtle"
            onClick={() => openOwnerSettingsModal('numbers')}
            title="Change WhatsApp Number, Phone & Store Details"
          >
            <Phone size={13} color="#25D366" />
            <span>नंबर व सेटिंग्स बदलें</span>
          </button>

          <button 
            className="btn btn-outline btn-sm owner-bar-btn-subtle"
            onClick={() => openOwnerSettingsModal('catalog')}
            title="Manage all bouquets, edit prices and delete items"
          >
            <Layers size={13} />
            <span>बुके कैटलॉग ({products.length})</span>
          </button>

          <button 
            className="btn btn-outline btn-sm owner-bar-btn-subtle"
            onClick={() => openOwnerSettingsModal('security')}
            title="Change Owner PIN / Password"
          >
            <Lock size={13} />
            <span>PIN बदलें</span>
          </button>

          <button 
            className="btn btn-outline btn-sm owner-bar-btn-logout"
            onClick={logoutOwner}
            title="Log out from Owner Mode"
          >
            <LogOut size={13} />
            <span>लॉगआउट</span>
          </button>
        </div>
      </div>
    </div>
  );
}
