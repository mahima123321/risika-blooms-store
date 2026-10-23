import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useShop } from '../../context/ShopContext';
import { 
  QrCode, X, Copy, Check, Download, Share2, Smartphone, 
  CreditCard, Camera, ExternalLink, RefreshCw, Sparkles 
} from 'lucide-react';

export default function QrScannerModal() {
  const { 
    isQrModalOpen, closeQrModal, qrModalData, 
    brandConfig, cartTotal, showToast 
  } = useShop();

  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'upi' | 'camera'
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const currentUrl = qrModalData?.url || (typeof window !== 'undefined' ? window.location.href : 'https://rishhikabloom.netlify.app');
  const upiId = qrModalData?.upiId || brandConfig?.upiId || 'rishikablooms@upi';
  const payAmount = qrModalData?.amount || (cartTotal > 0 ? cartTotal : '');

  // UPI payment deep link
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Rishika%20Blooms&am=${payAmount ? encodeURIComponent(payAmount) : ''}&cu=INR`;

  // QR Code Image URLs via public high-res QR API
  const storeQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(currentUrl)}`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiLink)}`;

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (isQrModalOpen) {
      document.body.classList.add('modal-locked');
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeQrModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('modal-locked');
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        stopCamera();
      };
    } else {
      document.body.classList.remove('modal-locked');
      document.body.style.overflow = '';
      stopCamera();
    }
  }, [isQrModalOpen]);

  // Manage camera lifecycle
  useEffect(() => {
    if (activeTab === 'camera' && isQrModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeTab, isQrModalOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);

      // If BarcodeDetector is natively supported, scan live frames
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
          const detectInterval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  clearInterval(detectInterval);
                  const raw = barcodes[0].rawValue;
                  setScannedResult(raw);
                  showToast('QR Code successfully detected!', 'success');
                  try {
                    if (navigator.vibrate) navigator.vibrate(200);
                  } catch {}
                }
              } catch {}
            }
          }, 400);
        } catch {}
      }
    } catch (err) {
      setCameraError('Please allow camera permissions to scan QR codes.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      showToast('Store link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      showToast('UPI ID copied to clipboard!', 'success');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleDownloadQr = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast('QR Code downloaded successfully!', 'success');
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rishika Blooms — Luxury Flowers & Keepsakes',
        text: 'Explore handcrafted luxury velvet bouquets, roses & birthday specials at Rishika Blooms!',
        url: currentUrl
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (!isQrModalOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="bouquet-lightbox-overlay" 
      onClick={closeQrModal}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 999999 }}
    >
      <div 
        className="qr-studio-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="qr-studio-header">
          <div className="qr-studio-title-box">
            <span className="qr-studio-badge">
              <Sparkles size={11} /> OFFICIAL STORE STUDIO
            </span>
            <h3 className="qr-studio-title">QR Code & Scanner Hub</h3>
          </div>
          <button 
            type="button" 
            className="bouquet-lightbox-close-btn"
            onClick={closeQrModal}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="qr-studio-tabs">
          <button
            type="button"
            className={`qr-tab-btn ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Smartphone size={15} />
            <span>Scan on Phone</span>
          </button>
          <button
            type="button"
            className={`qr-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
            onClick={() => setActiveTab('upi')}
          >
            <CreditCard size={15} />
            <span>UPI Instant Pay</span>
          </button>
          <button
            type="button"
            className={`qr-tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            <Camera size={15} />
            <span>Camera Scanner</span>
          </button>
        </div>

        {/* Tab 1: Store & Product QR Code */}
        {activeTab === 'store' && (
          <div className="qr-tab-content animate-fade-in">
            <div className="qr-code-frame">
              <img 
                src={storeQrImgUrl} 
                alt="Rishika Blooms Official Store QR Code" 
                className="qr-code-image" 
              />
              <div className="qr-code-watermark">
                <span className="qr-watermark-text">RISHIKA BLOOMS</span>
              </div>
            </div>

            <p className="qr-instruction-text">
              Point your smartphone camera at this QR code to instantly open and explore the catalog on mobile.
            </p>

            <div className="qr-url-pill">
              <span className="qr-url-text">{currentUrl}</span>
              <button 
                type="button" 
                className="qr-copy-btn"
                onClick={handleCopyLink}
                title="Copy link"
              >
                {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="qr-action-buttons">
              <button 
                type="button" 
                className="btn btn-gold btn-sm"
                onClick={() => handleDownloadQr(storeQrImgUrl, 'rishika-blooms-qr.png')}
              >
                <Download size={14} />
                <span>Download QR</span>
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={handleShare}
              >
                <Share2 size={14} />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: UPI Instant Payment QR Code */}
        {activeTab === 'upi' && (
          <div className="qr-tab-content animate-fade-in">
            <div className="qr-code-frame upi-frame">
              <img 
                src={upiQrImgUrl} 
                alt="UPI Payment QR Code" 
                className="qr-code-image" 
              />
              {payAmount && (
                <div className="qr-amount-badge">
                  <span>Pay: ₹{Number(payAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="upi-details-card">
              <div className="upi-id-row">
                <span className="upi-label">Verified UPI ID:</span>
                <strong className="upi-value">{upiId}</strong>
                <button 
                  type="button" 
                  className="qr-copy-icon-btn"
                  onClick={handleCopyUpi}
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                </button>
              </div>

              <div className="upi-apps-row">
                <span className="upi-apps-badge">PhonePe</span>
                <span className="upi-apps-badge">Google Pay</span>
                <span className="upi-apps-badge">Paytm</span>
                <span className="upi-apps-badge">BHIM UPI</span>
              </div>
            </div>

            <p className="qr-instruction-text">
              Scan with any UPI app on your phone. Send payment screenshot to our WhatsApp concierge for instant order confirmation.
            </p>

            <div className="qr-action-buttons">
              <a 
                href={upiLink} 
                className="btn btn-whatsapp btn-sm"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <ExternalLink size={14} />
                <span>Pay via Installed UPI App</span>
              </a>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => handleDownloadQr(upiQrImgUrl, 'rishika-blooms-upi-qr.png')}
              >
                <Download size={14} />
                <span>Save QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Live Camera QR Scanner */}
        {activeTab === 'camera' && (
          <div className="qr-tab-content animate-fade-in">
            <div className="camera-viewport-card">
              {cameraError ? (
                <div className="camera-error-box">
                  <p>{cameraError}</p>
                  <button 
                    type="button" 
                    className="btn btn-gold btn-sm" 
                    onClick={startCamera}
                  >
                    <RefreshCw size={14} />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : (
                <div className="camera-video-wrapper">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="camera-video-feed" 
                  />
                  <div className="camera-overlay-target">
                    <div className="camera-reticle" />
                    <div className="camera-laser-beam" />
                  </div>
                </div>
              )}
            </div>

            {scannedResult ? (
              <div className="camera-result-card animate-fade-in">
                <span className="result-label">Scanned Content:</span>
                <p className="result-value">{scannedResult}</p>
                {scannedResult.startsWith('http') && (
                  <a 
                    href={scannedResult} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-gold btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Scanned Link</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="qr-instruction-text">
                Align any QR code or bouquet card inside the gold reticle to scan automatically.
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;
}
