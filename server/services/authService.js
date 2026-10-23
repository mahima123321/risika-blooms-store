import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'risika_secret_key_jwt_2026_luxury_floral_atelier';

export function registerCustomer({ name, email, phone, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const stmt = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, 'customer')
  `);
  const result = stmt.run(name.trim(), email.toLowerCase().trim(), phone ? phone.trim() : null, passwordHash);

  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
}

export function loginCustomer({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password.');
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at
  };

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user: safeUser, token };
}

export function loginAdminWithPin(enteredPin) {
  const expectedPin = process.env.ADMIN_PIN || 'risika2026';
  if (!enteredPin || enteredPin.trim() !== expectedPin) {
    throw new Error('Invalid Owner Security PIN. Access denied.');
  }

  let admin = db.prepare('SELECT id, name, email, role FROM users WHERE role = ? LIMIT 1').get('admin');
  if (!admin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(expectedPin, salt);
    const res = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'admin')
    `).run('Store Owner', 'admin@rishikablooms.com', '919305371705', passwordHash);
    admin = { id: res.lastInsertRowid, name: 'Store Owner', email: 'admin@rishikablooms.com', role: 'admin' };
  }

  const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  return { admin, token };
}

export function getUserProfile(userId) {
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(userId);
  if (!user) throw new Error('User not found.');

  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(userId);
  return { user, addresses };
}

export function addAddress(userId, { recipient_name, phone, house_no, street, landmark, city, state, pincode, is_default }) {
  if (is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
  }

  const stmt = db.prepare(`
    INSERT INTO addresses (user_id, recipient_name, phone, house_no, street, landmark, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(userId, recipient_name, phone, house_no, street, landmark || '', city, state, pincode, is_default ? 1 : 0);
  return db.prepare('SELECT * FROM addresses WHERE id = ?').get(res.lastInsertRowid);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
