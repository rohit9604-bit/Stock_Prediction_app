import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { pool } from '../db.js';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function getAllUsers(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, business_name, phone, created_at FROM users ORDER BY id DESC'
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}

export async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password, businessName, phone } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rowCount > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, business_name, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, business_name, phone, created_at',
      [name, email, passwordHash, businessName, phone]
    );

    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({ user, token });
  } catch (e) {
    console.error('Signup error:', e);
    return res.status(500).json({
      message: 'Signup failed',
      error: {
        message: e?.message,
        code: e?.code,
        detail: e?.detail,
        constraint: e?.constraint,
        schema: e?.schema,
        table: e?.table,
        column: e?.column,
      },
    });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const { rows, rowCount } = await pool.query(
      'SELECT id, name, email, business_name, phone, password_hash FROM users WHERE email=$1',
      [email]
    );
    if (rowCount === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    delete user.password_hash;

    return res.json({ user, token });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({
      message: 'Login failed',
      error: {
        message: e?.message,
        code: e?.code,
        detail: e?.detail,
        constraint: e?.constraint,
        schema: e?.schema,
        table: e?.table,
        column: e?.column,
      },
    });
  }
}