import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DB } from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '877550687165-usg5oc9bgvuptq00mepcn17ge3q36ujv.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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
      preferredStyle: '',
      isMember: false
    });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferredStyle: user.preferredStyle,
        isMember: user.isMember
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
        preferredStyle: user.preferredStyle,
        isMember: user.isMember
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

export async function googleLogin(req, res) {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name;

    let user = await DB.users.findOne({ email });
    if (!user) {
      user = await DB.users.create({
        email,
        name,
        passwordHash: crypto.randomBytes(16).toString('hex'),
        preferredStyle: '',
        isMember: false
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferredStyle: user.preferredStyle,
        isMember: user.isMember
      }
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(401).json({ message: 'Invalid Google token' });
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
      preferredStyle: user.preferredStyle,
      isMember: user.isMember
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

export async function subscribe(req, res) {
  try {
    const user = await DB.users.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process mock payment/subscription logic here
    await DB.users.updateOne({ _id: req.user.id }, { $set: { isMember: true } });
    
    res.json({
      message: 'Subscription successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferredStyle: user.preferredStyle,
        isMember: true
      }
    });
  } catch (error) {
    console.error('Error during subscription:', error);
    res.status(500).json({ message: 'Server error during subscription' });
  }
}
