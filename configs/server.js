'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import limiter from '../src/middlewares/validar-cant-peticiones.js';
import  { dbConnection } from './mongo.js';
import authRoutes from '../src/auth/auth.routes.js';
import userRoutes from '../src/users/user.routes.js';
import productoRoutes from '../src/products/producto.routes.js';
import categoryRoutes from '../src/categorias/category.routes.js';
import facturaRoutes from '../src/facturas/factura.routes.js';
import carRoutes from '../src/carrito/car.routes.js';

const middlewares = (app) => {
    app.use(express.urlencoded({extended : false}));
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter);
};

const routes = (app) => {
    app.use('/Ventas/v1/auth', authRoutes);
    app.use('/Ventas/v1/users', userRoutes);
    app.use('/Ventas/v1/productos', productoRoutes);
    app.use('/Ventas/v1/categorias', categoryRoutes);
    app.use('/Ventas/v1/facturas', facturaRoutes);
    app.use('/Ventas/v1/carrito', carRoutes);
};

export const conetarDB = async() => {
    try {
        await dbConnection();
        console.log('Base de datos conectada exitosamente');
    } catch (error) {
        console.log('Error al conectarse a la base de datos', error) 
    }
};

export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3003;

    try {
        middlewares(app);
        conetarDB(app);
        routes(app);
        app.listen(port);
        console.log(`Servidor ejecutándose en el puerto ${port}`);
    } catch (error) {
        console.log(`Error al iniciar el servidor ${error}`)
    }
}

