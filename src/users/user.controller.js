import { response, request } from "express";
import {hash} from "argon2";
import User from './user.model.js';

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);
 
        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error
        });
    }
};

export const getUserById = async (req, res) => {
    try {
    
        const {id} = req.params;

        const user = await User.findById(id).populate('keeper', 'nameCourse');

        if(!user){
            return res.status(404).json({
                succes: false,
                msg: 'Usuario no encontrado'
            })
        }

        res.status(200).json({
            succes: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msj: "Error al obtener usuario",
            error
        })
    }
}


export const updateUser = async (req, res  = response) => {
    try {
        const {id} = req.params;
        const {_id, password, email, ...data} = req.body;

        if(password){
            data.password = await hash(password)
        }

        const user = await User.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            succes: true,
            msj: 'Usuario actualizado con éxito',
            user
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msj: "Error al actualizar usuario",
            error
        })
    }
}

export const updatePassword = async (req, res = response) => {
    try {
        const {id} = req.params;
        const {password} = req.body;
 
        if(password){
            const passwordUpdate = await hash(password)
 
            await User.findByIdAndUpdate(id, { password: passwordUpdate });
        };
 
        res.status(200).json({
            succes: true,
            msj: 'Contraseña actualizado con exito',
        });
 
    } catch (error) {
        res.status(500).json({
            succes: true,
            msj: 'No se pudo actualizar la contraseña',
            error
        })
    }
}