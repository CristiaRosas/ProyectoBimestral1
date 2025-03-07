import mongoose from "mongoose";
import Factura from "../facturas/factura.model.js";
import Producto from "../products/producto.model.js";

export const getFacturas = async (req, res) =>{
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: {$ne: "cancelado"} };

    try {
        const facturas = await Factura.find(query)
        .skip(Number(desde))
        .skip(Number(limite))
        .populate("user", "name")
        .populate("productos.producto", "name price");

        const total = await Factura.countDocuments(query);

        const formattedFacturas = facturas.map(factura => ({
            _id: factura._id,
            user: factura.user ? factura.user.name : "El usuario no se encontro en la base de datos",
            productos: factura.productos.map(item => ({
                name: item.producto ? item.producto.name : "No se encontro el producto en la base de datos",
                price: item.producto ? item.producto.price : 0,
                quantity: item.quantity
            })),
            total: factura.total,
            status: factura.status,
            createAt: factura.createAt,
            updatedAt: factura.updatedAt
        }));

        res.status(200).json({
            succes: true,
            total,
            facturas: formattedFacturas
            
        });

    } catch (error) {
        res.status(500).json({
            succes: false,
            message: "Hubo un error al obtener la factura",
            error: error.message
        });
    }
};

export const updateFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existentFactura = await Factura.findById(id);
        if (!existentFactura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        let newProductoDetails = [];
        let total = 0;

        for (let item of existentFactura.productos) {
            const  producto = await Producto.findById(item.producto);
            if (producto) {
                producto.stock += item.quantity;
                producto.sold -= item.quantity,
                producto.outOfStock = producto.stock === 0;
                await producto.save();
            }
        }

        for (let item of data.productos) {
            const producto = await Producto.findById(item.producto);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `El producto con id ${item.producto} no se encontro en la base de datos`
                });
            }

            producto.stock -= item.quantity;
            producto.sold += item.quantity;
            producto.outOfStock = producto.stock === 0;
            await producto.save();

            newProductoDetails.push({
                producto: producto._id,
                quantity: item.quantity,
                price: producto.price
            });

            total += producto.price * item.quantity;
        }

        existentFactura.total = total;
        existentFactura.status = data.status || existentFactura.status;
        existentFactura.productos = newProductoDetails;

        await existentFactura.save();

        const updatedFactura = await Factura.findById(id)
        .populate('productos.producto', 'name')

        const formattedFactura = {
            ...updatedFactura.toObject(),
            productos: updatedFactura.productos.map( item => ({
                name: item.producto? item.producto.name : "No se encontro el producto en la base de datos",
                price: item.producto ? item.producto.price : 0,
                quantity: item.quantity
            }))
        };

        res.status(200).json({
            success: true,
            message: 'Factura actualizada correctamente',
            factura: formattedFactura
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al actualizar la factura',
            error: error.message
        })
    }
}
