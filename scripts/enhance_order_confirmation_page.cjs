const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/pages/OrderConfirmationPage.jsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Imports
if (!content.includes('buildCustomerDeliveryOtpWhatsAppMessage')) {
  content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { buildCustomerDeliveryOtpWhatsAppMessage, createWhatsAppUrl } from '../config/whatsapp';"
  );
}

if (!content.includes('MessageSquare')) {
  content = content.replace(
    "Phone, Package, Truck, Sparkles",
    "Phone, Package, Truck, Sparkles, MessageSquare, Send"
  );
}

// 2. Destructure triggerIncomingSmsNotification & showToast
if (!content.includes('triggerIncomingSmsNotification')) {
  content = content.replace(
    "const { currentView, orders, navigateTo } = useShop();",
    "const { currentView, orders, navigateTo, triggerIncomingSmsNotification, showToast } = useShop();"
  );
}

// 3. OTP box addition
const oldOtpBox = `<div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Share with rider at doorstep only after inspecting blooms
              </div>
            </div>`;

const newOtpBox = `<div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Share with rider at doorstep only after inspecting blooms
              </div>
              <button
                type="button"
                onClick={() => {
                  if (triggerIncomingSmsNotification) {
                    triggerIncomingSmsNotification({
                      orderId: order.orderId,
                      deliveryOtp: order.deliveryOtp,
                      phone: order.customerPhone || order.recipientPhone,
                      customerName: order.customerName,
                      autoLaunchNative: false
                    });
                  }
                  const otpMsg = buildCustomerDeliveryOtpWhatsAppMessage({ order });
                  const targetPhone = order.customerPhone || order.recipientPhone;
                  const clean = String(targetPhone || '').replace(/\\D/g, '');
                  const finalPh = clean.length === 10 ? \`91\${clean}\` : clean;
                  if (finalPh) {
                    window.open(createWhatsAppUrl(otpMsg, finalPh), '_blank');
                  }
                  if (showToast) showToast('📲 Handover OTP sent to your phone & WhatsApp!', 'success');
                }}
                className="btn btn-sm"
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={13} />
                <span>Receive OTP on WhatsApp</span>
              </button>
            </div>`;

if (content.includes(oldOtpBox)) {
  content = content.replace(oldOtpBox, newOtpBox);
  fs.writeFileSync(pagePath, content, 'utf8');
  console.log('OrderConfirmationPage.jsx updated successfully!');
} else {
  console.log('Could not find oldOtpBox in OrderConfirmationPage.jsx');
}

