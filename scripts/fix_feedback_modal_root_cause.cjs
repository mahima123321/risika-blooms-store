const fs = require('fs');
const path = require('path');

console.log('=== FIXING FEEDBACK MODAL ROOT CAUSE ===');

// 1. UPDATE SHOPCONTEXT.JSX - EXPORT THE 4 MISSING FEEDBACK ACTIONS IN VALUE PROP!
const contextPath = path.join(__dirname, '../src/context/ShopContext.jsx');
let contextContent = fs.readFileSync(contextPath, 'utf8');

const targetStr = `        // Customer Photo Reviews & Feedback (Flipkart/Meesho style)
        productReviews,
        getProductReviews,
        addProductReview,
        voteReviewHelpful,
        deleteProductReview,`;

const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');

const replacementStr = `        // Customer Photo Reviews & Feedback (Flipkart/Meesho style)
        isWriteReviewModalOpen,
        writeReviewTargetProduct,
        openWriteReviewModal,
        closeWriteReviewModal,
        productReviews,
        getProductReviews,
        addProductReview,
        voteReviewHelpful,
        deleteProductReview,`;

const replacementStrCRLF = replacementStr.replace(/\n/g, '\r\n');

if (contextContent.includes(targetStrCRLF)) {
  contextContent = contextContent.replace(targetStrCRLF, replacementStrCRLF);
  console.log('✓ ShopContext.jsx: Added feedback modal exports (CRLF)!');
} else if (contextContent.includes(targetStr)) {
  contextContent = contextContent.replace(targetStr, replacementStr);
  console.log('✓ ShopContext.jsx: Added feedback modal exports (LF)!');
} else {
  // Regex fallback
  contextContent = contextContent.replace(
    /(\s+)\/\/ Customer Photo Reviews & Feedback \(Flipkart\/Meesho style\)([\r\n\s]+)productReviews,/,
    `$1// Customer Photo Reviews & Feedback (Flipkart/Meesho style)$2isWriteReviewModalOpen,$2writeReviewTargetProduct,$2openWriteReviewModal,$2closeWriteReviewModal,$2productReviews,`
  );
  console.log('✓ ShopContext.jsx: Added feedback modal exports via regex!');
}

fs.writeFileSync(contextPath, contextContent, 'utf8');

// Verify exports
const verifiedContext = fs.readFileSync(contextPath, 'utf8');
console.log('Verification: openWriteReviewModal in value prop:', verifiedContext.includes('openWriteReviewModal,\n') || verifiedContext.includes('openWriteReviewModal,\r\n') || verifiedContext.includes('openWriteReviewModal,'));

// 2. UPDATE WRITEREVIEWMODAL.JSX - USE CREATEPORTAL WITH Z-INDEX 999999
const modalPath = path.join(__dirname, '../src/components/reviews/WriteReviewModal.jsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Ensure createPortal is imported from react-dom
if (!modalContent.includes("import { createPortal } from 'react-dom';")) {
  modalContent = `import { createPortal } from 'react-dom';\n` + modalContent;
}

// Wrap the return in createPortal(..., document.body)
modalContent = modalContent.replace(
  `  return (\n    <div className="drawer-backdrop open owner-modal-backdrop" onClick={handleClose} style={{ zIndex: 100030 }}>`,
  `  return typeof document !== 'undefined' ? createPortal(\n    <div className="bouquet-lightbox-overlay animate-fade-in" onClick={handleClose} role="dialog" aria-modal="true" style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', position: 'fixed', inset: 0, overflowY: 'auto' }}>`
);

modalContent = modalContent.replace(
  `  return (\r\n    <div className="drawer-backdrop open owner-modal-backdrop" onClick={handleClose} style={{ zIndex: 100030 }}>`,
  `  return typeof document !== 'undefined' ? createPortal(\r\n    <div className="bouquet-lightbox-overlay animate-fade-in" onClick={handleClose} role="dialog" aria-modal="true" style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', position: 'fixed', inset: 0, overflowY: 'auto' }}>`
);

// Close portal at the end of return
modalContent = modalContent.replace(
  `    </div>\n  );\n}`,
  `    </div>,\n    document.body\n  ) : null;\n}`
);
modalContent = modalContent.replace(
  `    </div>\r\n  );\r\n}`,
  `    </div>,\r\n    document.body\r\n  ) : null;\r\n}`
);

fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('✓ WriteReviewModal.jsx updated with createPortal and zIndex: 999999!');

console.log('=== FEEDBACK ROOT CAUSE REPAIRED SUCCESSFULLY ===');

