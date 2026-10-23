import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ChevronDown, HelpCircle, Truck, Sparkles, ShieldCheck, Clock, RefreshCw, ArrowRight } from 'lucide-react';

export default function FaqPage() {
  const { navigateTo } = useShop();
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = [
    {
      category: "Delivery & Midnight Orders",
      questions: [
        {
          q: "How does Same-Day and Express 3-Hour Delivery work?",
          a: "Orders placed before 7:00 PM are guaranteed for same-day delivery across Delhi NCR, Mumbai, Bengaluru, Hyderabad, and major metros. Our bouquets travel in temperature-locked vehicles with hydration gel caps on every stem."
        },
        {
          q: "What is Midnight Surprise Delivery?",
          a: "Midnight deliveries take place strictly between 11:15 PM and 12:00 AM sharp to ensure you are the very first wish on birthdays, anniversaries, and proposals."
        },
        {
          q: "What is the Secret Delivery Handover OTP?",
          a: "To prevent delivery fraud and guarantee that flowers reach only the intended recipient, every order generates a unique 4-digit secret OTP. Share this code with our delivery rider at your doorstep only after collecting your bouquet."
        }
      ]
    },
    {
      category: "Flower Freshness & Quality",
      questions: [
        {
          q: "How long will my fresh flowers last?",
          a: "With proper care (trimming stems diagonally every 2 days, changing cool water, and adding the complimentary Chrysal food sachet included in your parcel), our Grade-A Dutch and Nilgiri blooms remain vibrant and fragrant for 5 to 7 days."
        },
        {
          q: "What are Handcrafted Velvet Flowers?",
          a: "Our viral Korean-style velvet bouquets are handcrafted using fine plush velvet, frosted pleated mesh, and pearl trim. Unlike real cut flowers that wilt, velvet flowers are forever keepsakes that never fade."
        }
      ]
    },
    {
      category: "Customization & Studio",
      questions: [
        {
          q: "Can I customize flower colors, wrapping paper, and add-ons?",
          a: "Yes! Use our interactive 'Customize Your Bouquet' studio to pick flower colors, bouquet size, Korean wrapping styles, ribbon shades, and add-ons like plush teddy bears, Ferrero Rocher chocolates, or money scroll cylinders."
        },
        {
          q: "Do you include a personalized greeting card?",
          a: "Every bouquet comes with a complimentary gold-foil embossed greeting card printed with your custom heartfelt message and sender signature."
        }
      ]
    },
    {
      category: "Payments, Cancellations & Refunds",
      questions: [
        {
          q: "Which payment options are supported?",
          a: "We accept Cash on Delivery (COD), Direct Instant UPI (Google Pay, PhonePe, Paytm, BHIM), and all major Credit/Debit Cards & NetBanking via Razorpay secure gateway."
        },
        {
          q: "Can I cancel my order?",
          a: "Orders can be cancelled free of charge while in 'Order Placed' or 'Confirmed' status through your 'My Orders' portal. Once blooms have been hand-cut and packed in the cold box, cancellations cannot be processed due to the perishable nature of fresh flowers."
        }
      ]
    }
  ];

  return (
    <div className="faq-page animate-fade-in" style={{ padding: '3rem 0 6rem 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-pretitle">Help & Support</span>
          <h1 className="font-serif-editorial" style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Everything you need to know about delivery slots, flower care, bespoke customization, and order tracking.
          </p>
          <div className="floral-divider">
            <span className="floral-divider-line"></span>
            <span className="floral-divider-icon">🌸</span>
            <span className="floral-divider-line"></span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {faqData.map((group, gIdx) => (
            <div key={group.category} className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-gold)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                <span>{group.category}</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.questions.map((item, qIdx) => {
                  const itemKey = `${gIdx}-${qIdx}`;
                  const isOpen = openIndex === itemKey;

                  return (
                    <div 
                      key={item.q}
                      style={{
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-alt)',
                        overflow: 'hidden'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : itemKey)}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          background: 'transparent',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{item.q}</span>
                        <ChevronDown 
                          size={18} 
                          style={{ 
                            transform: isOpen ? 'rotate(180deg)' : 'none', 
                            transition: 'transform 0.25s ease', 
                            flexShrink: 0,
                            color: 'var(--text-gold)'
                          }} 
                        />
                      </button>

                      {isOpen && (
                        <div className="animate-fade-in" style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact banner */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-md)', marginTop: '2.5rem', border: '1.5px solid var(--border-gold)' }}>
          <h3 className="font-serif-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Have a Specific Question?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Our master florists and customer support team are here to assist you 7 days a week.
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => navigateTo('contact')}
          >
            <span>Contact Concierge Desk</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
