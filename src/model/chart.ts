import { any } from "joi";
import mongoose, { Schema } from "mongoose";

interface Chart {
    chat_id?: mongoose.Types.ObjectId,
    user_id?: mongoose.Types.ObjectId,
    data_id?: mongoose.Types.ObjectId,
    chart_data?: any[]
};

const chartSchema = new Schema<Chart>({

    user_id: {
        type: Schema.Types.ObjectId, ref: "user"
    },
    chat_id: {
        type: Schema.Types.ObjectId, ref: "chat"
    },
    data_id: {
        type: Schema.Types.ObjectId, ref: "datas"
    },
    chart_data: {
        type: [{}]
    },

});

const chartModel = mongoose.model<Chart>('chart', chartSchema);

export default chartModel;