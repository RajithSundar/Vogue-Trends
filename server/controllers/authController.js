import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vogue_secret_key_jwt_2026_fallback';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'vogue_salt_key_2026').digest('hex');
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await DB.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = hashPassword(password);
    const user = await DB.users.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      preferredStyle: ''
    });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferredStyle: user.preferredStyle
      }
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await DB.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferredStyle: user.preferredStyle
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await DB.users.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      preferredStyle: user.preferredStyle
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}
