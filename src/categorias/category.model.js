import { Schema, model } from "mongoose";

const CategorySchema = Schema({
    name: {
        type: String,
        required : [true, "El nombre es requerido"],
        maxLength: 25,
    },

    description: {
        type: String,
        required: [true, "La descripcion es requerida"],
        maxLength: 255,
    },

    productos: [
        {
            type: Schema.Types.ObjectId,
            ref: 'product'
        }
    ],

    status: {
        type: Boolean,
        default: true
    }
  
},
{
    timestamps: true,
    versionKey: false
});

export default model('category', CategorySchema);