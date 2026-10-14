import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import Toast from './components/common/Toast';
import MobileBottomNav from './components/common/MobileBottomNav';
import OwnerTopBar from './components/owner/OwnerTopBar';
import OwnerLoginModal from './components/owner/OwnerLoginModal';
import OwnerProductModal from './components/owner/OwnerProductModal';
import OwnerSettingsModal from './components/owner/OwnerSettingsModal';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BuildBouquetPage from './pages/BuildBouquetPage';
import GiftComboPage from './pages/GiftComboPage';
import SurpriseFinderPage from './pages/SurpriseFinderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import WishlistPage from './pages/WishlistPage';
import CartDrawer from './pages/CartDrawer';
import DeliveryInfoPage from './pages/DeliveryInfoPage';
import { PrivacyPolicyPage, TermsPage } from './pages/PolicyPages';

import './App.css';

function MainAppContent() {
  const { currentView } = useShop();

  const renderActivePage = () => {
    switch (currentView.page) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'category':
        return <CategoryPage />;
      case 'product':
        return <ProductDetailPage />;
      case 'build-bouquet':
        return <BuildBouquetPage />;
      case 'gift-combos':
        return <GiftComboPage />;
      case 'surprise-finder':
        return <SurpriseFinderPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'delivery-info':
        return <DeliveryInfoPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-wrapper">
      <OwnerTopBar />
      <Header />
      <main className="main-content">
        {renderActivePage()}
      </main>
      <Footer />

      {/* Global Slide-Over Drawers, Owner Modals & Floating Controls */}
      <CartDrawer />
      <WishlistPage />
      <OwnerLoginModal />
      <OwnerProductModal />
      <OwnerSettingsModal />
      <WhatsAppButton />
      <MobileBottomNav />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}
