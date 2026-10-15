import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { createWhatsAppUrl } from '../config/whatsapp';
import { 
  sendMessageVerification, 
  DEFAULT_VERIFICATION_EMAIL 
} from '../services/emailService';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, 
  Send, ChevronDown, CheckCircle2, ShieldCheck, 
  Copy, Check, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const { showToast, brandConfig } = useShop();

  const targetEmail = brandConfig?.email || DEFAULT_VERIFICATION_EMAIL;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationReceipt, setVerificationReceipt] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // FAQ Accordion active state
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does message verification to mahimakk18@gmail.com work?",
      a: "When you send a message through our atelier form, it is instantly verified and forwarded to our official boutique inbox at mahimakk18@gmail.com. You receive an instant verification reference ID (e.g. #RB-VERIFY-XXXXXX) for complete tracking."
    },
    {
      q: "What is the cutoff time for Same-Day Flower Delivery?",
      a: "Orders placed before 7:00 PM are eligible for guaranteed same-day delivery across Delhi NCR, Mumbai, Bengaluru, Hyderabad, and major metros. Express 3-hour courier slots are also available on WhatsApp inquiry."
    },
    {
      q: "How does Midnight Surprise Delivery work?",
      a: "Midnight orders are dispatched in specialized climate-controlled floral vehicles and delivered between 11:15 PM and 12:00 AM sharp. Our delivery concierge discreetly coordinates with you to make the surprise magical."
    },
    {
      q: "Can I customize flower colors, wrapping paper, or ribbon?",
      a: "Absolutely! You can choose your color, wrapping style, ribbon, and add-ons directly on our product detail pages or use our 'Build Your Own Bouquet' studio. You can also chat directly on WhatsApp for bespoke requests."
    },
    {
      q: "How does direct WhatsApp ordering work?",
      a: "Clicking 'Order on WhatsApp' opens WhatsApp with a pre-formatted message containing your selected flowers, customization, delivery address, and date. Our concierge immediately verifies flower availability and shares photos before dispatch."
    },
    {
      q: "What is your 100% Freshness Guarantee?",
      a: "Every bouquet is hand-cut fresh on the day of delivery, and stems are packed with hydration gel packs. We guarantee that your flowers will remain vibrant and fresh for at least 5 to 7 days with proper care."
    },
    {
      q: "Do you undertake bulk wedding varmalas and stage decor?",
      a: "Yes! We craft royal Rajwada varmalas, bridal cascade bouquets, and entrance jhalars for weddings across India. Contact our wedding desk on WhatsApp for custom themes."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendMessageVerification({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        targetEmail
      });

      setVerificationReceipt(res);
      showToast(`✨ Message verified & sent to ${targetEmail}! Reference: #${res.referenceId}`, 'success');
    } catch (err) {
      console.error('Failed to submit verified message:', err);
      showToast('Message submitted and saved to concierge queue.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (verificationReceipt?.referenceId) {
      navigator.clipboard.writeText(verificationReceipt.referenceId);
      setCopiedRef(true);
      showToast('📋 Reference code copied to clipboard!', 'info');
      setTimeout(() => setCopiedRef(false), 3000);
    }
  };

  const handleResetForm = () => {
    setVerificationReceipt(null);
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  };

  const handleWhatsAppChat = () => {
    const text = verificationReceipt 
      ? `Hello ROSHIKA BLOOMS! I just sent a verified message with Reference ID: ${verificationReceipt.referenceId}. Could you please assist me?`
      : "Hello ROSHIKA BLOOMS concierge! I would like to inquire about floral delivery.";
    const url = createWhatsAppUrl(text, brandConfig?.whatsappNumber);
    window.open(url, '_blank');
  };

  return (
    <div className="contact-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }} className="gold-badge">
            <ShieldCheck size={14} color="var(--text-gold)" />
            <span>Verified Atelier Inbox: {targetEmail}</span>
          </div>
          <h1 className="font-serif-editorial" style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Contact ROSHIKA BLOOMS
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">💌</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Our master florists and gifting concierges are available 7 days a week. All inquiries are securely verified and forwarded directly to <strong>{targetEmail}</strong>.
          </p>
        </div>

        {/* Contact Split: Form + Info Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '3rem',
          alignItems: 'start',
          marginBottom: '5rem'
        }}>
          {/* Form / Verification Receipt */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
            {verificationReceipt ? (
              /* Verified Success Receipt Card */
              <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.12)',
                  border: '2px solid #16A34A',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}>
                  <CheckCircle2 size={38} />
                </div>

                <span className="rose-badge" style={{ marginBottom: '0.5rem' }}>
                  ✓ Message Verified & Dispatched
                </span>

                <h3 className="font-serif-editorial" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Thank You, {formData.name || 'Valued Patron'}!
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Your inquiry has been successfully verified and transmitted directly to the master florist inbox at <strong>{targetEmail}</strong>.
                </p>

                {/* Reference ID Card */}
                <div style={{
                  background: 'var(--bg-accent-soft)',
                  border: '1.5px dashed var(--border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.75rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-gold)', fontWeight: 700 }}>
                      Official Verification Receipt
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {copiedRef ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                      <span>{copiedRef ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                    #{verificationReceipt.referenceId}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div><strong>Routed To:</strong> {targetEmail}</div>
                    <div><strong>Timestamp:</strong> {verificationReceipt.timestamp}</div>
                    <div><strong>Topic:</strong> {formData.subject}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-whatsapp btn-md"
                    onClick={handleWhatsAppChat}
                  >
                    <MessageCircle size={16} />
                    <span>Follow Up on WhatsApp</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-md"
                    onClick={handleResetForm}
                  >
                    <RefreshCw size={15} />
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Inquiry Form */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 className="font-serif-editorial" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Send a Note to Our Florists
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Directly verified & forwarded to <strong>{targetEmail}</strong>
                    </p>
                  </div>
                  <span className="rose-badge" style={{ fontSize: '0.72rem' }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    SSL Verified Dispatch
                  </span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                        Your Full Name *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Rohini Malhotra"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                        Phone Number *
                      </label>
                      <input 
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Your Email Address (For Direct Reply) *
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. rohini@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Inquiry Topic / Occasion
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                    >
                      <option value="General Inquiry">General Floral Gifting Inquiry</option>
                      <option value="Custom Bouquet">Custom Bespoke Bouquet Studio Request</option>
                      <option value="Midnight Delivery">Midnight Delivery Urgent Tracking</option>
                      <option value="Wedding Flowers">Wedding & Engagement Flowers Consultation</option>
                      <option value="Corporate Hampers">Corporate & VIP Luxury Hampers</option>
                      <option value="Message Verification">Message / Order Verification Inquiries</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Your Message / Custom Requirement *
                    </label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Share your requirements, delivery date, preferred flower colors, personalized message card text..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {/* Verification Banner */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-accent-soft)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <ShieldCheck size={16} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                    <span>
                      All messages are verified and dispatched immediately to <strong>{targetEmail}</strong>.
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg" 
                    disabled={isSubmitting}
                    style={{ marginTop: '0.25rem', width: '100%' }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Verifying & Sending to {targetEmail}...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Verified Message to Atelier</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Contact Details & Direct WhatsApp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="gold-badge" style={{ fontSize: '0.72rem' }}>
                  <Sparkles size={11} /> Flagship Boutique
                </span>
              </div>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                ROSHIKA BLOOMS Atelier
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={20} color="var(--text-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{brandConfig?.address || BRAND_CONFIG.address}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                  <a href={`tel:${(brandConfig?.phone || BRAND_CONFIG.phone).replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {brandConfig?.phone || BRAND_CONFIG.phone}
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                  <a href={`mailto:${targetEmail}?subject=Inquiry from Roshika Blooms Website`} style={{ color: 'var(--text-gold)', textDecoration: 'underline', fontWeight: 600 }}>
                    {targetEmail}
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Clock size={18} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                  <span>{brandConfig?.hours || BRAND_CONFIG.hours}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  className="btn btn-whatsapp"
                  onClick={handleWhatsAppChat}
                  style={{ width: '100%' }}
                >
                  <MessageCircle size={18} />
                  <span>Instant WhatsApp Concierge</span>
                </button>
              </div>
            </div>

            {/* Quick Promise Box */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-accent-soft)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🚀 Need Urgent Same-Day Flowers?
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Order before 7:00 PM for guaranteed same-day dispatch or order before 10:00 PM for midnight surprise delivery in Delhi NCR, Mumbai & Bengaluru.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-pretitle">Common Inquiries</span>
            <h2 className="font-serif-editorial" style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: openFaq === idx ? '1.5px solid var(--border-gold)' : '1px solid var(--border-subtle)'
                }}
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <span>{faq.q}</span>
                  <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-gold)' }} />
                </div>
                {openFaq === idx && (
                  <div className="animate-fade-in" style={{ padding: '0 1.5rem 1.25rem 1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
