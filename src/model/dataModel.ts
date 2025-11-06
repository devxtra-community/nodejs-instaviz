import mongoose, { Schema, SchemaType } from "mongoose";

interface Data {
    data: Record<string, any>[];
    user_id: mongoose.Types.ObjectId,
    chat_id?: string,
    chart_id?: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
};

const dataSchema = new Schema<Data>({

    data: [
        {
            type: Map, of: Schema.Types.Mixed
        }
    ],
    user_id: {
        type: Schema.Types.ObjectId, ref: "user"
    },
    chat_id: {
        type: Schema.Types.ObjectId, ref: "chat"
    },
    chart_id: {
        type: Schema.Types.ObjectId, ref: "chart"
    }
},
    {
        timestamps: true
    });

const dataModel = mongoose.model<Data>('data', dataSchema);

export default dataModel;