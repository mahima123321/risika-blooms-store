import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import MobileBottomNav from './components/common/MobileBottomNav';
import OwnerTopBar from './components/owner/OwnerTopBar';
import OwnerLoginModal from './components/owner/OwnerLoginModal';
import OwnerProductModal from './components/owner/OwnerProductModal';
import OwnerSettingsModal from './components/owner/OwnerSettingsModal';
import QrScannerModal from './components/common/QrScannerModal';
import IncomingSmsBanner from './components/common/IncomingSmsBanner';
import WhatsAppButton from './components/common/WhatsAppButton';

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
import DeliveryInfoPage from './pages/DeliveryInfoPage';
import CartDrawer from './pages/CartDrawer';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FaqPage from './pages/FaqPage';
import { 
  PrivacyPolicyPage, 
  TermsPage, 
  ShippingPolicyPage, 
  RefundPolicyPage 
} from './pages/PolicyPages';

import './App.css';

function MainAppContent() {
  const { currentView, isMobileFrame } = useShop();

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
      case 'custom-gifts':
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
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'my-orders':
      case 'order-tracking':
      case 'orders':
        return <MyOrdersPage />;
      case 'admin':
      case 'admin-dashboard':
      case 'seller':
      case 'seller-hub':
      case 'admin-login':
        return <AdminDashboardPage />;
      case 'faq':
      case 'faqs':
        return <FaqPage />;
      case 'delivery-info':
      case 'delivery':
      case 'delivery-portal':
      case 'delivery-hub':
        return <DeliveryInfoPage />;
      case 'privacy':
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms':
      case 'terms-conditions':
        return <TermsPage />;
      case 'shipping-policy':
        return <ShippingPolicyPage />;
      case 'return-policy':
      case 'refund-policy':
      case 'cancellation-policy':
        return <RefundPolicyPage />;
      
      // Category Shortcuts
      case 'roses':
        return <CategoryPage overrideCategory="rose-bouquets" />;
      case 'bouquets':
      case 'flowers':
        return <CategoryPage overrideCategory="mixed-flower-bouquets" />;
      case 'teddies':
        return <CategoryPage overrideCategory="teddy-bear-bouquets" />;
      case 'hampers':
        return <CategoryPage overrideCategory="chocolate-bouquets" />;
      case 'garlands':
      case 'jhalar':
        return <CategoryPage overrideCategory="flower-jhalar-garlands" />;
      case 'wedding':
        return <CategoryPage overrideCategory="wedding-engagement-flowers" />;
      case 'birthday':
        return <CategoryPage overrideCategory="birthday-anniversary-bouquets" />;
      case 'anniversary':
        return <CategoryPage overrideCategory="birthday-anniversary-bouquets" />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className={`app-wrapper ${isMobileFrame ? 'mobile-app-frame' : 'desktop-expanded-mode'}`}>
      <OwnerTopBar />
      <Header />
      <main className="main-content">
        {renderActivePage()}
      </main>
      <Footer />

      {/* Global Modals & Controls */}
      <WishlistPage />
      <OwnerLoginModal />
      <OwnerProductModal />
      <OwnerSettingsModal />
      <QrScannerModal />
      <IncomingSmsBanner />
      <MobileBottomNav />
      <WhatsAppButton />
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
