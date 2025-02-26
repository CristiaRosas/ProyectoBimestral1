'use strict';

import mongoose from "mongoose";

export const dbConnection = async () => {
    try{
        mongoose.connection.on('error', ()=>{
            console.log('MongoDB | no se pudo conectar a MongoDB');
            mongoose.disconnec();
        });
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | Prueba la conexión');
        });
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | Conectado a MongoDB');
        });
        mongoose.connection.on('open', ()=>{
            console.log('MongoDB | Conectado a database');
        });
        mongoose.connection.on('reconected', ()=>{
            console.log('MongoDB | reconectado a MongoDB');
        });
        mongoose.connection.on('disconnected', ()=>{
            console.log('MongoDB | desconectado');
        });
        await mongoose.connect(process.env.URI_MONGO,{
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });
    }catch (error){
        console.log('Database connection failed', error)
    }
} 