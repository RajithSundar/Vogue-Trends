import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  preferredStyle: { type: String }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
