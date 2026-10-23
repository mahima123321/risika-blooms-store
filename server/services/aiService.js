import { db } from '../db.js';

/**
 * Intelligent Rule-Based & AI Bouquet Recommendations
 */
export function getFloralRecommendations({ occasion = 'birthday', budget = 1500, color = 'all', recipient = 'partner' }) {
  const maxPrice = Number(budget) || 2000;
  let query = "SELECT * FROM products WHERE status = 'published' AND price <= ?";
  const params = [maxPrice];

  if (color && color !== 'all') {
    query += ' AND (LOWER(name) LIKE ? OR LOWER(colors) LIKE ? OR LOWER(description) LIKE ?)';
    const colorPattern = `%${color.toLowerCase()}%`;
    params.push(colorPattern, colorPattern, colorPattern);
  }

  query += ' ORDER BY is_bestseller DESC, rating DESC, price DESC LIMIT 6';
  const products = db.prepare(query).all(...params);

  // Occasion specific styling advice
  const adviceMap = {
    birthday: {
      theme: 'Vibrant & Joyful Celebration',
      reasoning: 'Velvet party bouquets with personalized Happy Birthday cards and bright sunflowers/tulips elevate milestone birthdays with unforgettable cheer.'
    },
    anniversary: {
      theme: 'Deep Romance & Everlasting Bond',
      reasoning: 'Rich velvet red roses, midnight sapphire arrangements, or wine-toned lilies reflect timeless devotion that will never wither.'
    },
    wedding: {
      theme: 'Elegance, Purity & Grandeur',
      reasoning: 'Porcelain white lilies, champagne cascades, and delicate pearl-beaded ruffles create breathtaking moments for brides and couples.'
    },
    apology: {
      theme: 'Heartfelt Sincerity',
      reasoning: 'Gentle pastel blush tulips and white lilies convey softness, genuine contrition, and tender respect.'
    }
  };

  const advice = adviceMap[occasion.toLowerCase()] || adviceMap.birthday;

  return {
    engine: 'Risika Floral Concierge Engine (Rule-Grounded)',
    occasion,
    budget: maxPrice,
    recipient,
    color,
    theme: advice.theme,
    curationNotes: advice.reasoning,
    recommendedProducts: products
  };
}

/**
 * Natural Language Product Search & Query Parser
 */
export function searchProductsNaturalLanguage(userQuery) {
  if (!userQuery || !userQuery.trim()) {
    return db.prepare("SELECT * FROM products WHERE status = 'published' ORDER BY is_bestseller DESC LIMIT 8").all();
  }

  const q = userQuery.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 2);

  // Extract budget mentions (e.g. "under 1000", "below 1500", "₹1200")
  let budgetConstraint = null;
  const budgetMatch = q.match(/(?:under|below|less than|within|upto)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) || q.match(/(?:₹|rs\.?)\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    budgetConstraint = parseInt(budgetMatch[1], 10);
  }

  let sql = "SELECT * FROM products WHERE status = 'published'";
  const params = [];

  if (budgetConstraint) {
    sql += ' AND price <= ?';
    params.push(budgetConstraint);
  }

  // Build LIKE queries for keyword matches
  const keywordClauses = [];
  for (const word of words) {
    if (['under', 'below', 'less', 'than', 'bouquet', 'bouquets', 'send', 'gift', 'buy', 'want', 'need'].includes(word)) continue;
    keywordClauses.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category_slug) LIKE ? OR LOWER(tags) LIKE ?)');
    const term = `%${word}%`;
    params.push(term, term, term, term);
  }

  if (keywordClauses.length > 0) {
    sql += ` AND (${keywordClauses.join(' OR ')})`;
  }

  sql += ' ORDER BY is_bestseller DESC, rating DESC LIMIT 12';
  const results = db.prepare(sql).all(...params);

  // If strict search had no hits, return top trending
  if (results.length === 0) {
    return db.prepare("SELECT * FROM products WHERE status = 'published' ORDER BY is_bestseller DESC, is_trending DESC LIMIT 6").all();
  }

  return results;
}

/**
 * Grounded Store FAQ & Customer Assistant
 */
export function answerCustomerFaq(question) {
  const q = String(question || '').toLowerCase();

  if (q.includes('otp') || q.includes('passcode') || (q.includes('delivery') && q.includes('code'))) {
    return {
      answer: 'Every Risika Blooms delivery is protected by a confidential 4-digit doorstep delivery OTP. When our cold-chain delivery executive arrives, share this OTP to complete the secure handover.',
      suggestedAction: 'track_order'
    };
  }

  if (q.includes('order') && (q.includes('track') || q.includes('status') || q.includes('where'))) {
    return {
      answer: 'You can track any order instantly using our "My Orders" tab with your 10-digit mobile number or unique Order ID (e.g., RB-2026-XXXXXX). You will see real-time preparation, dispatch status, and your secret 4-digit doorstep delivery OTP.',
      suggestedAction: 'track_order'
    };
  }

  if (q.includes('same day') || q.includes('time') || q.includes('slot') || q.includes('fast')) {
    return {
      answer: 'Yes! We offer Same-Day Handover and 90-minute Express delivery across Delhi NCR for all orders placed before 7:00 PM. Midnight delivery is also available between 11:00 PM - 12:00 AM.',
      suggestedAction: 'delivery_info'
    };
  }

  if (q.includes('custom') || q.includes('build') || q.includes('own') || q.includes('color')) {
    return {
      answer: 'You can create your bespoke bouquet using our interactive "Customize Your Bouquet" studio! Choose stem colors, bouquet sizes, Korean wrapping papers, satin ribbons, chocolates, and personalized calligraphy greeting cards.',
      suggestedAction: 'build_bouquet'
    };
  }

  if (q.includes('cancel') || q.includes('refund') || q.includes('return')) {
    return {
      answer: 'Orders can be cancelled prior to dispatch directly from your "My Orders" page. Refunds for prepaid orders are credited to the original payment source within 2-4 business days according to our clear refund policy.',
      suggestedAction: 'policy'
    };
  }

  return {
    answer: 'Risika Blooms is Delhi NCR’s premier luxury floral atelier, crafting everlasting velvet bouquets, fresh Dutch blooms, and royal celebration gifts. How else may our concierge assist your celebration today?',
    suggestedAction: 'contact'
  };
}
