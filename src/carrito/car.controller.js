import Product from '../products/producto.model.js';
import Car from '../carrito/car.model.js';
import Factura from '../facturas/factura.model.js';

export const addProductToCar = async (req, res) => {
    try {
        const { productoId, quantity } = req.body;
        const product = await Product.findById(productoId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "No se ecnontro el producto en la base de datos!"
            });
        }

        let car = await Car.findOne({ user: req.usuario.id });

        if (!car) {
            car = new Car({ user: req.usuario.id, productos: [] });
        }

        const productIndex = car.productos.findIndex(item => item.product.toString() === productoId); // Corregido

        if (productIndex > -1) {
            car.productos[productIndex].quantity += quantity;
        } else {
            car.productos.push({ product: productoId, quantity }); // Corregido
        }

        await car.save();
        res.status(200).json({
            success: true,
            message: "Se añadio el producto al carrito con éxito!",
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al añadir el producto al carrito!",
            error: error.message
        });
    }
};

export const getCar = async (req, res) => {
    try {
        const car = await Car.findOne({ user: req.usuario.id }).populate("productos.product"); // Corrección aquí

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "No se encontro el carrito en la base de datos!  Asegúrese de estar logueado y que el carrito esté creado."
            });
        }

        res.status(200).json({
            success: true,
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al obtener el carrito!",
            error: error.message
        });
    }
};

export const removeProductFromCar = async (req, res) => {
    try {
        const { productId } = req.params;

        let car = await Car.findOne({ user: req.usuario.id });

        if (!car) {
            return res.status(404).json({
                success: false,
                message: "carrito no encontrado en la base de datos!"
            });
        }

        car.productos = car.productos.filter(item => item.product.toString() !== productId); 
        await car.save();

        res.status(200).json({
            success: true,
            message: "El producto se ha eliminado del carrito con éxito!",
            car
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al eliminar el producto del carrito!",
            error: error.message
        });
    }
};

export const pagarCar = async (req, res) => {
    try {
        let car = await Car.findOne({ user: req.usuario.id }).populate("productos.product"); 

        if (!car || car.productos.length === 0) { 
            return res.status(400).json({
                success: false,
                message: "El carrito está vacío o no contiene productos!",
            });
        }

        let total = 0;
        for (let item of car.productos) { 
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `No hay stock suficiente del producto: ${item.product.name}`
                });
            }
            total += item.product.price * item.quantity;
        }

        const factura = new Factura({
            user: req.usuario.id,
            products: car.productos.map(item => ({ 
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            total,
            status: 'Pagado'
        });

        await factura.save();

        for (let item of car.productos) { 
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        await Car.findOneAndDelete({ user: req.usuario.id });

        res.status(200).json({
            success: true,
            message: "Se completo el pago y la compra exitosa!",
            factura
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "HUbo un error al completar el pago y la compra!",
            error: error.message
        });
    }
};

export const historial = async (req, res) => {
    try {
        const facturas = await Factura.find({ user: req.usuario.id }).populate("products.product");

        if (!facturas.length) {
            return res.status(404).json({
                success: false,
                message: "No secontro la compra en el historial!",
            });
        }

        res.status(200).json({
            success: true,
            facturas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hubo un error al obtener el historial de compras!",
            error: error.message
        });
    }
};