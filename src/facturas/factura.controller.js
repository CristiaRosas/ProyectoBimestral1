import mongoose from "mongoose";
import Factura from "../facturas/factura.model.js";
import Producto from "../products/producto.model.js";

export const getFacturas = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: { $ne: "Cancelado" } };

        const [facturas, total] = await Promise.all([
            Factura.find(query) 
                .skip(Number(desde))
                .limit(Number(limite))
                .populate("user", "name")
                .populate("products.product", "name price"),
            Factura.countDocuments(query) 
        ]);

        const formattedFacturas = facturas.map(factura => ({
            _id: factura._id,
            user: factura.user?.name || "El usuario no se encontró en la base de datos",
            productos: factura.products.map(item => ({
                name: item.product?.name || "No se encontró el producto en la base de datos",
                price: item.product?.price || 0,
                quantity: item.quantity
            })),
            total: factura.total,
            status: factura.status,
            createdAt: factura.createdAt,
            updatedAt: factura.updatedAt
        }));

        res.status(200).json({ 
            success: true, 
            total, 
            facturas: formattedFacturas });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al obtener la factura",
            error: error.message
        });
    }
};
