import { Schema, model } from "mongoose";
const CarSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    productos: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],

    status: {
        type: String,
        default: true
    }

}, {
    timestamps: true,
    versionKey: false
});

export default model('Car', CarSchema);