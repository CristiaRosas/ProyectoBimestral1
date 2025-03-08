import { response, request } from "express";
import {hash} from "argon2";
import User from './user.model.js';

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const users = await User.find({ estado: true })
            .skip(Number(desde))
            .limit(Number(limite));
        
        res.status(200).json({
            success: true,
            total: await User.countDocuments({ estado: true }),
            users
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al obtener usuarios", 
            error 
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ 
            success: false, 
            msg: "Usuario no encontrado" 
        });
        
        res.status(200).json({ 
            success: true, 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            msg: "Error al obtener usuario", 
            error 
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password, ...data } = req.body;
        
        if (password) data.password = await hash(password);
        
        const user = await User.findByIdAndUpdate(id, data, { new: true });
        res.status(200).json({ 
            success: true, 
            msg: "Usuario actualizado con éxito", 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            msg: "Error al actualizar usuario", 
            error: error.message 
        });
    }
};

export const updatePassword = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        if (!password) 
            return res.status(400).json({ 
        success: false, 
        msg: "La contraseña es requerida" 
    });
        
        await User.findByIdAndUpdate(id, { password: await hash(password) });
        res.status(200).json({ 
            success: true, 
            msg: "Contraseña actualizada con éxito" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            msg: "No se pudo actualizar la contraseña", 
            error 
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { estado: false }, { new: true });
        res.status(200).json({ 
            success: true, 
            msg: "Usuario desactivado con éxito", 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            msg: "Error al desactivar usuario", 
            error 
        });
    }
};

export const updateStatus = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        if (typeof estado !== "boolean") 
            return res.status(400).json({ 
        success: false, 
        msg: "Estado inválido" 
    });
        
        const user = await User.findByIdAndUpdate(id, { estado }, { new: true });
        res.status(200).json({ 
            success: true, 
            msg: "Estado actualizado con éxito", 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            msg: "Error al actualizar estado", 
            error 
        });
    }
};