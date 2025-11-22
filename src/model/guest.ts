import mongoose, { Schema } from 'mongoose';

interface Guest {
  token: number;
  IP_address: number;
}

const guestSchema = new Schema<Guest>(
  {
    token: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true },
);

const guestModel = mongoose.model<Guest>('guest', guestSchema);

export default guestModel;
