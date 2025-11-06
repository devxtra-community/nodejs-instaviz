import mongoose, { Schema } from "mongoose";

interface Chat {
    chart_id?: mongoose.Types.ObjectId,
    user_id?: mongoose.Types.ObjectId,
    data_id?: mongoose.Types.ObjectId,
    chat: string
};

const chatSchema = new Schema<Chat>({

    user_id: {
        type: Schema.Types.ObjectId, ref: "user"
    },
    chart_id: {
        type: Schema.Types.ObjectId, ref: "chart"
    },
    data_id: {
        type: Schema.Types.ObjectId, ref: "data"
    },
    chat: {
        type: String
    }

});

const chatModel = mongoose.model<Chat>('chat', chatSchema);

export default chatModel;