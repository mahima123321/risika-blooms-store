import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Plus, Shield, LogOut, Settings, Phone, Lock, Sparkles, Layers, FolderPlus } from 'lucide-react';

export default function OwnerTopBar() {
  const { 
    isOwnerAuthenticated, 
    logoutOwner, 
    openAddProductModal, 
    openOwnerSettingsModal,
    products,
    categories,
    brandConfig
  } = useShop();

  if (!isOwnerAuthenticated) return null;

  return (
    <>
      {/* 1. Desktop & Tablet Top Bar */}
      <div className="owner-top-bar animate-fade-in hide-mobile-dock">
        <div className="container owner-top-bar-content">
          <div className="owner-top-bar-left">
            <div className="owner-badge-pill">
              <Shield size={14} color="#D4AF37" />
              <span>👑 STORE OWNER STUDIO</span>
            </div>
            <span className="owner-top-bar-info">
              Catalog: <strong>{products.length} Bouquets</strong>
            </span>
          </div>

          <div className="owner-top-bar-actions">
            <button 
              className="btn btn-gold btn-sm owner-bar-btn"
              onClick={() => openAddProductModal()}
              title="Add a new bouquet with custom photo and price"
            >
              <Plus size={14} />
              <span>+ Add Bouquet</span>
            </button>

            <button 
              className="btn btn-outline btn-sm owner-bar-btn-subtle"
              onClick={() => openOwnerSettingsModal('numbers')}
              title="Change WhatsApp Number, Phone & Store Details"
            >
              <Phone size={13} color="#25D366" />
              <span>Store Settings</span>
            </button>

            <button 
              className="btn btn-outline btn-sm owner-bar-btn-subtle"
              onClick={() => openOwnerSettingsModal('categories')}
              title="Create and manage category headings"
            >
              <FolderPlus size={13} color="#D4AF37" />
              <span>+ Category ({categories?.length || 14})</span>
            </button>

            <button 
              className="btn btn-outline btn-sm owner-bar-btn-subtle"
              onClick={() => openOwnerSettingsModal('catalog')}
              title="Manage all bouquets"
            >
              <Layers size={13} />
              <span>Catalog ({products.length})</span>
            </button>

            <button 
              className="btn btn-outline btn-sm owner-bar-btn-subtle"
              onClick={() => openOwnerSettingsModal('security')}
              title="Change Owner PIN"
            >
              <Lock size={13} />
              <span>PIN</span>
            </button>

            <button 
              className="btn btn-outline btn-sm owner-bar-btn-logout"
              onClick={logoutOwner}
              title="Log out from Owner Mode"
            >
              <LogOut size={13} />
              <span>Exit Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mobile Native Floating Studio Dock (Fixed at bottom under thumb) */}
      <div className="owner-mobile-dock-wrapper show-mobile-dock">
        <div className="owner-mobile-dock">
          <button 
            type="button"
            className="owner-dock-btn owner-dock-btn-primary"
            onClick={() => openAddProductModal()}
            title="Add a new bouquet"
          >
            <Plus size={14} />
            <span>Add Bouquet</span>
          </button>

          <button 
            type="button"
            className="owner-dock-btn"
            onClick={() => openOwnerSettingsModal('catalog')}
            title="Manage bouquet catalog"
          >
            <Layers size={15} />
            <span>Catalog ({products.length})</span>
          </button>

          <button 
            type="button"
            className="owner-dock-btn"
            onClick={() => openOwnerSettingsModal('numbers')}
            title="WhatsApp & Store Settings"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>

          <button 
            type="button"
            className="owner-dock-btn owner-dock-btn-logout"
            onClick={logoutOwner}
            title="Exit Owner Mode"
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
