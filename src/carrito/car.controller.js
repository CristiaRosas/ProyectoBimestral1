import Product from '../products/producto.model.js';
import Car from '../carrito/car.model.js';
import Factura from '../facturas/factura.model.js';

export const addProductToCar = async (req, res) => {
    try {
        const { productName, quantity } = req.body;
        const userId = req.usuario.id;

        // Buscar el producto por nombre
        const product = await Product.findOne({ name: productName });
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Producto no encontrado." 
            });
        }

        // Validación: Si el stock es 0, no permitir agregar el producto
        if (product.stock === 0) {
            return res.status(400).json({
                success: false,
                message: "Este producto está agotado."
            });
        }

        let car = await Car.findOne({ user: userId });
        if (!car) {
            car = new Car({ user: userId, productos: [] });
        }

        const productIndex = car.productos.findIndex(item => item.product.toString() === product._id.toString());

        let totalQuantity = quantity;
        if (productIndex > -1) {
            totalQuantity = car.productos[productIndex].quantity + quantity; 
        }

        if (totalQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Solo hay ${product.stock} unidades disponibles.`
            });
        }

        if (productIndex > -1) {
            car.productos[productIndex].quantity += quantity;
        } else {

            car.productos.push({ product: product._id, quantity });
        }

        await car.save();

        
        const populatedCar = await Car.findOne({ user: userId }).populate("productos.product", "name");

        res.status(200).json({ 
            success: true, 
            message: "Producto añadido al carrito.", 
            car: populatedCar 
        });
    } catch (error) {
        console.error("Error al añadir producto al carrito:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al añadir producto al carrito.", 
            error: error.message 
        });
    }
};

export const getCar = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const car = await Car.findOne({ user: userId }).populate("productos.product");

        if (!car) {
            return res.status(404).json({ success: false, message: "Carrito no encontrado." });
        }

        res.status(200).json({ success: true, car });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ success: false, message: "Error al obtener el carrito.", error: error.message });
    }
};

export const removeProductFromCar = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.usuario.id;

        let car = await Car.findOne({ user: userId });
        if (!car) {
            return res.status(404).json({ 
                success: false, 
                message: "Carrito no encontrado." 
            });
        }

        car.productos = car.productos.filter(item => item.product.toString() !== productId);
        await car.save();

        res.status(200).json({ 
            success: true, 
            message: "Producto eliminado del carrito.", 
            car 
        });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al eliminar producto del carrito.", 
            error: error.message 
        });
    }
};

export const pagarCar = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const car = await Car.findOne({ user: userId }).populate("productos.product");

        if (!car || car.productos.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Carrito vacío." 
            });
        }

        let total = 0;
        for (const item of car.productos) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Stock insuficiente para ${item.product.name}.` });
            }
            total += item.product.price * item.quantity;
        }

        const factura = new Factura({
            user: userId,
            products: car.productos.map(item => ({ product: item.product._id, quantity: item.quantity, price: item.product.price })),
            total,
            status: 'Pagado'
        });

        await factura.save();

        for (const item of car.productos) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity, sold: item.quantity } });
        }

        await Car.findOneAndDelete({ user: userId });

        const detailedFactura = await Factura.findById(factura._id).populate("products.product", "name price");

        res.status(200).json({ 
            success: true, 
            message: "Pago completado.", 
            factura: detailedFactura 
        });
    } catch (error) {
        console.error("Error al pagar el carrito:", error);
        res.status(500).json({ success: false, 
            message: "Error al pagar el carrito.", 
            error: error.message 
        });
    }
};

export const historial = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const facturas = await Factura.find({ user: userId }).populate("products.product");

        if (!facturas.length) {
            return res.status(404).json({ 
                success: false, 
                message: "Historial de compras vacío." });
        }

        res.status(200).json({ 
            success: true, 
            facturas 
        });
    } catch (error) {
        console.error("Error al obtener el historial de compras:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al obtener el historial de compras.", 
            error: error.message 
        });
    }
};
