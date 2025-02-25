import jwt from 'jsonwebtoken';

import Usuario from '../user/user.model.js';

export const validarJWT = async(req, res, next) =>{
    const token = req.header('x-token');

    if(!token){
        return res.status(401).json({
            msg: 'There is no token in the request'
        })
    }

    try{
        const { uid } = jwt.verify(token, process.env.SECRETORPRYVATEKEY);
        const usuario = await Usuario.findById(uid);

        if(!usuario){
            return res.status(401).json({
                msg: 'User does not exist in the database'
            })
        }

        if(!usuario.estado){
            return res.status(401).json({
                msg: 'Invalid token - user in status: false'
            })
        }

        req.usuario = usuario;

        next();

    }catch (e){
        console.log(e);
        res.status(401).json({
            msg: 'Invalid token'
        })
    }
}