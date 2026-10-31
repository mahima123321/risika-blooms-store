const fs = require('fs');
const path = require('path');

const myOrdersPath = path.join(__dirname, '../src/pages/MyOrdersPage.jsx');
let content = fs.readFileSync(myOrdersPath, 'utf8');

// 1. Ensure buildCustomerDeliveryOtpWhatsAppMessage and Lucide icons are imported
if (!content.includes('buildCustomerDeliveryOtpWhatsAppMessage')) {
  content = content.replace(
    "buildDeliveryConfirmationWhatsAppMessage \n} from '../config/whatsapp';",
    "buildDeliveryConfirmationWhatsAppMessage,\n  buildCustomerDeliveryOtpWhatsAppMessage\n} from '../config/whatsapp';"
  );
  if (!content.includes('buildCustomerDeliveryOtpWhatsAppMessage')) {
    content = content.replace(
      "buildDeliveryConfirmationWhatsAppMessage",
      "buildDeliveryConfirmationWhatsAppMessage, buildCustomerDeliveryOtpWhatsAppMessage"
    );
  }
}

if (!content.includes('Send,') && !content.includes('Send }')) {
  content = content.replace(
    "Truck, \n  MapPin",
    "Truck, Send, Smartphone, MessageSquare,\n  MapPin"
  );
  if (!content.includes('Send')) {
    content = content.replace("Truck,", "Truck, Send, Smartphone, MessageSquare,");
  }
}

// 2. Destructure triggerIncomingSmsNotification from useShop()
if (!content.includes('triggerIncomingSmsNotification')) {
  content = content.replace(
    "openOwnerSettingsModal\n  } = useShop();",
    "openOwnerSettingsModal,\n    triggerIncomingSmsNotification\n  } = useShop();"
  );
}

// 3. Add handleDispatchAndSendOtp helper
const dispatchHelperCode = `
  // Owner Dispatches Bouquet and sends OTP message to customer's phone
  const handleDispatchAndSendOtp = (ord) => {
    const targetPhone = ord.recipientPhone || ord.customerPhone;
    const cleanPhone = String(targetPhone || '').replace(/\\D/g, '');
    const phone10 = cleanPhone.slice(-10);
    const waPhone = phone10.length === 10 ? \`91\${phone10}\` : cleanPhone;
    const otpCode = ord.deliveryOtp || '4892';

    // 1. Update order status to 'Out for Delivery' if not already
    if (ord.status !== 'Out for Delivery' && ord.status !== 'Delivered') {
      updateOrderStatus(ord.orderId, 'Out for Delivery');
    }

    // 2. Trigger native SMS notification & simulation banner on device
    if (triggerIncomingSmsNotification) {
      triggerIncomingSmsNotification({
        orderId: ord.orderId,
        deliveryOtp: otpCode,
        phone: phone10,
        customerName: ord.recipientName || ord.customerName,
        autoLaunchNative: false
      });
    }

    // 3. Build WhatsApp message and open chat
    const otpMsg = buildCustomerDeliveryOtpWhatsAppMessage({ order: ord });
    if (waPhone) {
      const waUrl = createWhatsAppUrl(otpMsg, waPhone);
      window.open(waUrl, '_blank');
    }

    showToast(\`📲 Handover OTP [\${otpCode}] sent to customer (\${targetPhone})! Order marked Out for Delivery.\`, 'success');
  };
`;

if (!content.includes('handleDispatchAndSendOtp')) {
  content = content.replace('// Quick Copy Helper', `${dispatchHelperCode}\n  // Quick Copy Helper`);
}

// 4. Update the Owner Card OTP Box to include Step 1 (Send OTP to Customer) & Step 2 (Doorstep Verification)
const oldOtpBoxRegex = /\{\/\* 🔑 Secret Handover OTP & Verification Box \*\/\}[\s\S]*?\{\/\* Order Status Updater & Actions \*\/\}/;

const newOtpBoxCode = `{/* 🔑 Secret Handover OTP & Dispatch Actions */}
                          <div style={{
                            background: isDelivered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.07)',
                            border: isDelivered ? '1.5px solid #10B981' : '1.5px dashed #D4AF37',
                            borderRadius: 'var(--radius-sm)',
                            padding: '1.15rem',
                            marginBottom: '1rem'
                          }}>
                            {/* STEP 1: SEND OTP MESSAGE WHEN GOING TO DELIVER */}
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
                                    <Smartphone size={16} color="#10B981" />
                                    <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                                      Step 1: Going to Deliver? Send OTP Message to Customer's Phone
                                    </strong>
                                  </div>

                                  {ord.status === 'Out for Delivery' ? (
                                    <span style={{ fontSize: '0.72rem', background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Out for Delivery
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', background: '#D97706', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                      ● Ready for Dispatch
                                    </span>
                                  )}
                                </div>

                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                                  Tap below to send the secret 4-digit Handover OTP directly to customer's phone ({targetPhone || 'Customer Phone'}).
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDispatchAndSendOtp(ord)}
                                    className="btn btn-sm"
                                    style={{
                                      flex: 1,
                                      minWidth: '220px',
                                      padding: '0.65rem 1rem',
                                      fontWeight: 800,
                                      fontSize: '0.84rem',
                                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Send size={14} />
                                    <span>
                                      {ord.status === 'Out for Delivery' 
                                        ? '🔄 Resend OTP Message to Customer (WhatsApp)' 
                                        : '📲 Out for Delivery: Send OTP to Customer (WhatsApp)'}
                                    </span>
                                  </button>

                                  {targetPhone && (
                                    <a
                                      href={\`sms:\${cleanPhone}?body=\${encodeURIComponent(\`🌸 Rishika Blooms: Your Secret Delivery Handover OTP for Order #\${ord.orderId} is: \${ord.deliveryOtp || '4892'}. Please share this code with our rider only after receiving your bouquet at your doorstep.\`)}\`}
                                      className="btn btn-outline btn-sm"
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        color: '#10B981',
                                        borderColor: 'rgba(16, 185, 129, 0.4)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textDecoration: 'none',
                                        padding: '0.65rem 0.85rem'
                                      }}
                                    >
                                      <MessageSquare size={13} />
                                      <span>Send via SMS</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* STEP 2: DOORSTEP OTP HANDOVER & VERIFICATION */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isDelivered ? '#059669' : '#D4AF37', textTransform: 'uppercase' }}>
                                  {isDelivered ? '✅ Order Handover Complete & Verified' : 'Step 2: Reached Doorstep? Ask Customer for OTP & Enter Code:'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {isDelivered
                                    ? \`Handover verified with OTP: \${ord.deliveryOtp || '4892'} • Congratulations wishes sent to customer.\`
                                    : 'Enter customer\'s 4-digit code. Order will be marked Delivered & Paid automatically:'
                                  }
                                </div>
                              </div>

                              {/* Customer's expected OTP code (always visible to owner for reference) */}
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Customer's Code:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: '#10B981', letterSpacing: '2px' }}>
                                  {ord.deliveryOtp || '4892'}
                                </span>
                              </div>
                            </div>

                            {/* OTP Input for Unfinished Delivery */}
                            {!isDelivered && (
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-digit OTP"
                                  value={otpInputs[ord.orderId] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\\D/g, '').slice(0, 4);
                                    setOtpInputs(prev => ({ ...prev, [ord.orderId]: val }));
                                    if (val.length === 4) {
                                      handleOtpVerify(ord.orderId, val);
                                    }
                                  }}
                                  style={{
                                    width: '130px',
                                    padding: '0.65rem',
                                    textAlign: 'center',
                                    fontFamily: 'monospace',
                                    fontSize: '1.15rem',
                                    fontWeight: 900,
                                    letterSpacing: '3px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: otpErrors[ord.orderId] ? '2px solid #EF4444' : '1.5px solid var(--border-gold)',
                                    background: 'var(--bg-alt)',
                                    outline: 'none'
                                  }}
                                />

                                <button
                                  type="button"
                                  disabled={verifyingId === ord.orderId}
                                  onClick={() => handleOtpVerify(ord.orderId)}
                                  className="btn btn-gold btn-sm"
                                  style={{ padding: '0.7rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)', color: '#000000' }}
                                >
                                  {verifyingId === ord.orderId ? (
                                    <span>Verifying...</span>
                                  ) : (
                                    <>
                                      <CheckCircle2 size={16} />
                                      <span>Verify & Mark Delivered</span>
                                    </>
                                  )}
                                </button>

                                {otpErrors[ord.orderId] && (
                                  <div style={{ color: '#EF4444', fontSize: '0.75rem', width: '100%', marginTop: '3px' }}>
                                    {otpErrors[ord.orderId]}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Order Status Updater & Actions */}`;

if (oldOtpBoxRegex.test(content)) {
  content = content.replace(oldOtpBoxRegex, newOtpBoxCode);
  console.log('Replaced owner OTP box with Step 1 (Send OTP message) and Step 2 (Doorstep verification)!');
} else {
  console.log('Could not match oldOtpBoxRegex, checking structure');
}

fs.writeFileSync(myOrdersPath, content, 'utf8');
console.log('MyOrdersPage.jsx updated successfully!');
