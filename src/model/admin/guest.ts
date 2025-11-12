import mongoose, { Schema } from "mongoose";

interface Guest {
    token: number,
    IP_address: number
};

const guestSchema = new Schema<Guest>({

    token: {
        type: Number
    },
    IP_address: {
        type: Number
    }

});

const guestModel = mongoose.model<Guest>('guest', guestSchema);

export default guestModel;