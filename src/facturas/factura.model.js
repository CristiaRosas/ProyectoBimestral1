import { Schema, model } from "mongoose";

const FacturaSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, "La cantidad debe ser mayor a 1!"]
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],

    total: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['Pendiente', 'Pagado', 'Cancelado'],
        default: 'Pendiente'
    }
},
    {
        timestamps: true,
        versionKey: false
    });
export default model('Factura', FacturaSchema);
