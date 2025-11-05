import mongoose, { Schema } from "mongoose";

interface Chart {
    chat_id?: mongoose.Types.ObjectId,
    user_id?: mongoose.Types.ObjectId,
    chart_data?: any
};

const chartSchema = new Schema<Chart>({

    user_id: {
        type: Schema.Types.ObjectId, ref: "user"
    },
    chat_id: {
        type: Schema.Types.ObjectId, ref: "chat"
    },
    chart_data: {
        type: String
    },

});

const chartModel = mongoose.model<Chart>('chart', chartSchema);

export default chartModel;