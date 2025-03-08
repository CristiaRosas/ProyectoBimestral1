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

/* xport const updateFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { productos, status } = req.body;

        const factura = await Factura.findById(id);
        if (!factura) {
            return res.status(404).json({ success: false, message: "Factura no encontrada" });
        }

        let total = 0;
        const updatedProductos = [];

        // Restaurar stock de productos previos
        await Promise.all(factura.productos.map(async item => {
            const producto = await Producto.findById(item.producto);
            if (producto) {
                producto.stock += item.quantity;
                producto.sold -= item.quantity;
                producto.outOfStock = producto.stock === 0;
                await producto.save();
            }
        }));

        // Actualizar stock con nuevos productos
        await Promise.all(productos.map(async item => {
            const producto = await Producto.findById(item.producto);
            if (!producto) {
                throw new Error(`El producto con id ${item.producto} no se encontró en la base de datos`);
            }

            producto.stock -= item.quantity;
            producto.sold += item.quantity;
            producto.outOfStock = producto.stock === 0;
            await producto.save();

            updatedProductos.push({
                producto: producto._id,
                quantity: item.quantity,
                price: producto.price
            });

            total += producto.price * item.quantity;
        }));

        // Guardar cambios en la factura
        factura.total = total;
        factura.status = status || factura.status;
        factura.productos = updatedProductos;
        await factura.save();

        res.status(200).json({
            success: true,
            message: "Factura actualizada correctamente",
            factura: await Factura.findById(id).populate("productos.producto", "name price")
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al actualizar la factura",
            error: error.message
        });
    }
}; */