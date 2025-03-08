import jwt from 'jsonwebtoken';
import Usuario from '../users/user.model.js';

export const validarJWT = async (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay ningún token en la solicitud.'
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRYVATEKEY);
        const usuario = await Usuario.findById(uid);

        if (!usuario) {
            return res.status(401).json({
                msg: 'El usuario no existe en la base de datos.'
            });
        }

        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Token no válido: usuario en estado: false'
            });
        }

        req.usuario = usuario;
        next();

    } catch (e) {
        console.log(e);
        res.status(401).json({
            msg: 'Token no válido'
        });
    }
};