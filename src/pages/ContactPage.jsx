import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { BRAND_CONFIG } from '../config/brand';
import { createWhatsAppUrl } from '../config/whatsapp';
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, 
  Send, ChevronDown, CheckCircle2, HelpCircle 
} from 'lucide-react';

export default function ContactPage() {
  const { showToast, brandConfig } = useShop();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion active state
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }
    setSubmitted(true);
    showToast('✨ Thank you! Your message has been received by our floral concierge.');
    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  };

  const handleWhatsAppChat = () => {
    const url = createWhatsAppUrl("Hello RISIKA BLOOMS concierge! I would like to inquire about floral delivery.");
    window.open(url, '_blank');
  };

  return (
    <div className="contact-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-pretitle">Concierge & Assistance</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '3.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Contact RISIKA BLOOMS
          </h1>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">💌</span>
            <span className="floral-divider-line"></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Our master florists and gifting concierges are available 7 days a week to curate your moments of wonder.
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
          {/* Form */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h3 className="font-serif-editorial" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Send a Note to Our Florists
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We typically reply within 15 minutes during boutique hours.
            </p>

            {submitted ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-accent-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Message Received!</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Our concierge team will connect with you promptly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Your Name *</label>
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
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Phone Number *</label>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Email Address *</label>
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
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none' }}
                  >
                    <option value="General Inquiry">General Floral Gifting Inquiry</option>
                    <option value="Custom Bouquet">Custom Bespoke Bouquet Request</option>
                    <option value="Midnight Delivery">Midnight Delivery Urgent Tracking</option>
                    <option value="Wedding Flowers">Wedding & Engagement Flowers Consultation</option>
                    <option value="Corporate Hampers">Corporate & VIP Luxury Hampers</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Your Message *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Share your requirements, delivery date, preferred flowers..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-alt)', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
                  <Send size={18} />
                  <span>Send Message to Atelier</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Direct WhatsApp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Flagship Floral Atelier
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={20} color="var(--text-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{brandConfig?.address || BRAND_CONFIG.address}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Phone size={18} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                  <span>{brandConfig?.phone || BRAND_CONFIG.phone}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Mail size={18} color="var(--text-gold)" style={{ flexShrink: 0 }} />
                  <span>{brandConfig?.email || BRAND_CONFIG.email}</span>
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
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-accent-soft)', border: '1px solid var(--border-gold)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                🚀 Need Urgent Same-Day Flowers?
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Order before 7:00 PM for same-day delivery or order before 10:00 PM for midnight delivery in Delhi NCR, Mumbai & Bengaluru.
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
