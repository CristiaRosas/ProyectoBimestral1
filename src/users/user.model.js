import {Schema, model} from "mongoose";

const UserSchema = Schema({
    name : {
        type: String,
        required: [true, 'Nombre de usuario es obligatorio'],
        maxLength: [25, 'No se puede superar 25 caracteres.']
    },
    surname : {
        type: String,
        required: [true, 'Apellido obligatorio'],
        maxLength: [25, 'No se pueden superar 25 caracteres.']
    },
    username : {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Correo electrónico obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'contraseña obligatoria'],
        minLength: 8
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'CLIENT_ROLE'],
        default: 'CLIENT_ROLE'
    },
    estado: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);

UserSchema.methods.toJSON = function() {
    const {__v, password, _id, ...usuario} = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default model('User', UserSchema);