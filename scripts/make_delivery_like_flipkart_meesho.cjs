const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. UPDATE MyOrdersPage.jsx
// =========================================================================
const myOrdersPath = path.join(__dirname, '../src/pages/MyOrdersPage.jsx');
let myOrdersContent = fs.readFileSync(myOrdersPath, 'utf8');

// Add celebration modal state
if (!myOrdersContent.includes('deliveredCelebrationOrder, setDeliveredCelebrationOrder')) {
  myOrdersContent = myOrdersContent.replace(
    "const [activeMode, setActiveMode] = useState",
    "const [deliveredCelebrationOrder, setDeliveredCelebrationOrder] = useState(null);\n  const [activeMode, setActiveMode] = useState"
  );
}

// Remove WhatsApp redirect from handleOtpVerify
const oldVerifyCode = `        // Auto-open WhatsApp congratulations wishes
        const target = res.order || allOrders.find(o => o.orderId === orderId);
        if (target) {
          const msg = buildDeliveryConfirmationWhatsAppMessage({ order: target });
          const phone = target.recipientPhone || target.customerPhone;
          if (phone) {
            const clean = String(phone).replace(/\\D/g, '');
            const finalPh = clean.length === 10 ? \`91\${clean}\` : clean;
            const url = createWhatsAppUrl(msg, finalPh);
            window.open(url, '_blank');
          }
        }`;

const newVerifyCode = `        // In-App Flipkart/Meesho delivery celebration modal (No external WhatsApp redirect)
        const target = res.order || allOrders.find(o => o.orderId === orderId);
        if (target) {
          setDeliveredCelebrationOrder(target);
        }`;

if (myOrdersContent.includes(oldVerifyCode)) {
  myOrdersContent = myOrdersContent.replace(oldVerifyCode, newVerifyCode);
  console.log('Removed WhatsApp opening from handleOtpVerify, replaced with in-app celebration modal!');
} else {
  // Regex replacement in case formatting differs
  const verifyRegex = /\/\/ Auto-open WhatsApp congratulations wishes[\s\S]*?window\.open\(url, '_blank'\);[\s\S]*?\}/;
  if (verifyRegex.test(myOrdersContent)) {
    myOrdersContent = myOrdersContent.replace(verifyRegex, `// In-App Flipkart/Meesho delivery celebration modal (No external WhatsApp redirect)\n        const target = res.order || allOrders.find(o => o.orderId === orderId);\n        if (target) {\n          setDeliveredCelebrationOrder(target);\n        }`);
    console.log('Regex replaced verify WhatsApp redirect!');
  }
}

// Update handleDispatchAndSendOtp to handleDispatch (purely in-app, no WhatsApp opening)
const oldDispatchRegex = /\/\/ Owner Dispatches Bouquet and sends OTP message[\s\S]*?showToast\([\s\S]*?Order marked Out for Delivery\.\`, 'success'\);\s*\};/;

const newDispatchCode = `// Owner Marks Out for Delivery (100% In-App like Flipkart / Meesho - No WhatsApp Redirect)
  const handleDispatch = (ord) => {
    // 1. Update order status to 'Out for Delivery'
    updateOrderStatus(ord.orderId, 'Out for Delivery');

    // 2. Trigger native in-app message simulation on device
    if (triggerIncomingSmsNotification) {
      triggerIncomingSmsNotification({
        orderId: ord.orderId,
        deliveryOtp: ord.deliveryOtp || '4892',
        phone: ord.customerPhone || ord.recipientPhone,
        customerName: ord.recipientName || ord.customerName,
        autoLaunchNative: false
      });
    }

    showToast(\`🚚 Order #\${ord.orderId} marked Out for Delivery! Handover OTP: \${ord.deliveryOtp || '4892'}\`, 'success');
  };`;

if (oldDispatchRegex.test(myOrdersContent)) {
  myOrdersContent = myOrdersContent.replace(oldDispatchRegex, newDispatchCode);
  console.log('Updated dispatch handler to 100% in-app (no WhatsApp redirect)!');
}

// Update Owner Card Step 1 UI to clean Flipkart / Meesho style
const oldStep1Regex = /\{\/\* STEP 1: SEND OTP MESSAGE WHEN GOING TO DELIVER \*\/\}[\s\S]*?\{\/\* STEP 2: DOORSTEP OTP HANDOVER & VERIFICATION \*\/\}/;

const newStep1Code = `{/* STEP 1: DISPATCH / OUT FOR DELIVERY (Flipkart / Meesho Style) */}
                            {!isDelivered && (
                              <div style={{
                                background: 'var(--bg-alt)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                padding: '0.9rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Truck size={16} color="#10B981" />
                                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                                      Step 1: Dispatch Status (Flipkart / Meesho Style)
                                    </strong>
                                  </div>

                                  {ord.status === 'Out for Delivery' ? (
                                    <span style={{ fontSize: '0.74rem', background: '#10B981', color: '#FFF', padding: '3px 10px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Out for Delivery (Rider Dispatched)
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.74rem', background: '#D97706', color: '#FFF', padding: '3px 10px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Ready for Dispatch
                                    </span>
                                  )}
                                </div>

                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                                  When rider leaves to deliver, tap below to mark Out for Delivery. Customer's doorstep verification OTP is: <strong style={{ color: '#10B981', fontFamily: 'monospace', letterSpacing: '1px' }}>{ord.deliveryOtp || '4892'}</strong>.
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDispatch(ord)}
                                    className="btn btn-sm"
                                    style={{
                                      flex: 1,
                                      minWidth: '220px',
                                      padding: '0.65rem 1rem',
                                      fontWeight: 800,
                                      fontSize: '0.84rem',
                                      background: ord.status === 'Out for Delivery'
                                        ? 'var(--bg-surface)'
                                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                      color: ord.status === 'Out for Delivery' ? '#10B981' : '#FFFFFF',
                                      border: ord.status === 'Out for Delivery' ? '1.5px solid #10B981' : 'none',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Truck size={15} />
                                    <span>
                                      {ord.status === 'Out for Delivery'
                                        ? '✓ Order is Out for Delivery'
                                        : '🚚 Mark Out for Delivery (Dispatch Rider)'}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopy(ord.deliveryOtp || '4892', \`otp-\${ord.orderId}\`)}
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.65rem 0.85rem' }}
                                  >
                                    <Copy size={13} />
                                    <span>{copiedId === \`otp-\${ord.orderId}\` ? 'Copied OTP' : \`Copy OTP (\${ord.deliveryOtp || '4892'})\`}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* STEP 2: DOORSTEP OTP HANDOVER & VERIFICATION */}`;

if (oldStep1Regex.test(myOrdersContent)) {
  myOrdersContent = myOrdersContent.replace(oldStep1Regex, newStep1Code);
  console.log('Replaced Step 1 with Flipkart / Meesho in-app dispatch button!');
}

// Add the In-App Flipkart/Meesho Delivery Celebration Modal before closing div
const celebrationModalCode = `
      {/* Flipkart / Meesho In-App Delivery Success Celebration Modal */}
      {deliveredCelebrationOrder && (
        <div 
          className="drawer-backdrop open" 
          style={{ zIndex: 100060, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setDeliveredCelebrationOrder(null)}
        >
          <div 
            className="glass-panel animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '2rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid #10B981',
              background: 'var(--bg-surface)',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.25)'
            }}
          >
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2.5px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={40} color="#10B981" />
            </div>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Flipkart / Meesho Verified Handover
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0.5rem 0' }}>
              Order Delivered Successfully! 🎉
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '1.25rem' }}>
              #{deliveredCelebrationOrder.orderId}
            </div>

            <div style={{
              background: 'var(--bg-alt)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                <strong>{deliveredCelebrationOrder.recipientName || deliveredCelebrationOrder.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doorstep Handover OTP:</span>
                <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>✓ {deliveredCelebrationOrder.deliveryOtp || '4892'} Verified</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                <strong style={{ color: '#10B981' }}>✓ Paid in Full</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivered Status:</span>
                <strong style={{ color: '#10B981' }}>● Delivered (Just Now)</strong>
              </div>
            </div>

            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1.5px dashed #D4AF37',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              lineHeight: 1.45,
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              "💐 Congratulations {deliveredCelebrationOrder.recipientName || deliveredCelebrationOrder.customerName}! Your fresh luxury floral bouquet has been handed over successfully. We hope it brings boundless joy, smiles, and fragrance to your celebration! ✨"
            </div>

            <button
              type="button"
              onClick={() => setDeliveredCelebrationOrder(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem', background: '#10B981', border: 'none', justifyContent: 'center' }}
            >
              <span>Done & Return to Orders</span>
            </button>
          </div>
        </div>
      )}
`;

if (!myOrdersContent.includes('deliveredCelebrationOrder && (')) {
  myOrdersContent = myOrdersContent.replace(
    '      </div>\n    </div>\n  );\n}',
    `${celebrationModalCode}      </div>\n    </div>\n  );\n}`
  );
  console.log('Appended in-app delivery celebration modal to MyOrdersPage.jsx!');
}

fs.writeFileSync(myOrdersPath, myOrdersContent, 'utf8');
console.log('MyOrdersPage.jsx saved successfully!');

// =========================================================================
// 2. UPDATE OrderConfirmationPage.jsx (Remove WhatsApp button, use Copy OTP)
// =========================================================================
const confirmPagePath = path.join(__dirname, '../src/pages/OrderConfirmationPage.jsx');
let confirmContent = fs.readFileSync(confirmPagePath, 'utf8');

const oldConfirmWhatsAppBtnRegex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?createWhatsAppUrl\(otpMsg[\s\S]*?Receive OTP on WhatsApp[\s\S]*?<\/button>/;

const newCopyOtpBtn = `<button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.deliveryOtp || '4892');
                  if (showToast) showToast('📋 Delivery OTP copied to clipboard!', 'success');
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
                <span>📋 Copy Handover OTP</span>
              </button>`;

if (oldConfirmWhatsAppBtnRegex.test(confirmContent)) {
  confirmContent = confirmContent.replace(oldConfirmWhatsAppBtnRegex, newCopyOtpBtn);
  fs.writeFileSync(confirmPagePath, confirmContent, 'utf8');
  console.log('OrderConfirmationPage.jsx updated: removed WhatsApp redirect!');
}

// =========================================================================
// 3. UPDATE DeliveryOrdersModal.jsx (Remove WhatsApp redirects)
// =========================================================================
const deliveryModalPath = path.join(__dirname, '../src/components/owner/DeliveryOrdersModal.jsx');
let modalContent = fs.readFileSync(deliveryModalPath, 'utf8');

// Remove WhatsApp redirect in handleVerifyOtp
const modalWaRedirectRegex = /\/\/ Automatically dispatch WhatsApp celebration[\s\S]*?window\.open\(waUrl, '_blank'\);\s*\}\s*\}\s*\}/;
if (modalWaRedirectRegex.test(modalContent)) {
  modalContent = modalContent.replace(
    modalWaRedirectRegex,
    `// In-app verification completed (No external WhatsApp redirect)\n        showToast('🎉 Delivery verified! Marked as Delivered & Paid.', 'success');`
  );
  console.log('Removed WhatsApp opening from DeliveryOrdersModal handleVerifyOtp!');
}

// Remove WhatsApp redirect in handleSendOtpToCustomer
const modalSendOtpRegex = /const handleSendOtpToCustomer = \(order\) => \{[\s\S]*?window\.open\(waUrl, '_blank'\);[\s\S]*?\};/;
const newModalSendOtp = `const handleSendOtpToCustomer = (order) => {
    // 1. Mark Out for Delivery
    updateOrderStatus(order.orderId || order.id, 'Out for Delivery');
    showToast(\`🚚 Order #\${order.orderId || order.id} marked Out for Delivery! Handover OTP: \${order.deliveryOtp || '4892'}\`, 'success');
  };`;

if (modalSendOtpRegex.test(modalContent)) {
  modalContent = modalContent.replace(modalSendOtpRegex, newModalSendOtp);
  console.log('Removed WhatsApp opening from DeliveryOrdersModal handleSendOtpToCustomer!');
}

fs.writeFileSync(deliveryModalPath, modalContent, 'utf8');
console.log('DeliveryOrdersModal.jsx updated successfully!');

