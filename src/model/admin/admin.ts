import { required } from 'joi';
import mongoose, { Schema } from 'mongoose';

interface Admin {
  email: string;
  password: string;
  role: string;
}

const adminSchema = new Schema<Admin>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const adminModel = mongoose.model<Admin>('admin', adminSchema);

export default adminModel;
