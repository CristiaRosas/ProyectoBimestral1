import { response, request }  from "express";
import Producto from "./producto.model.js";
import Factura from "../facturas/factura.model.js";

export const saveProducto = async (req, res) => {
  try {
      const { name } = req.body;
      const productoExistente = await Producto.findOne({ name: name.trim() });

      if (productoExistente) {
          return res.status(400).json({
              success: false,
              message: "Ya existe un producto con ese nombre",
          });
      }

      const producto = new Producto(req.body);
      await producto.save();

      res.status(201).json({ success: true, message: "Producto agregado con éxito!", producto });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error al agregar producto", error });
  }
};

export const getProductos = async (req = request, res = response) => {
  try {
      const { limite = 10, desde = 0 } = req.query;
      const productos = await Producto.find({ estado: true })
          .skip(Number(desde))
          .limit(Number(limite))
          .populate('relacion', 'name description');

      res.status(200).json({
          success: true,
          total: 
          productos,
      });
  } catch (error) {
      res.status(500).json({ 
        success: false, 
        msg: "Error al obtener productos", 
        error 
    });
  }
};

export const getProductoById = async (req, res) => {
  try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) 
        return res.status(404).json({ 
        success: false, 
        msg: "Producto no encontrado" });
      
      res.status(200).json({ 
        success: true, 
        producto 
    });
  } catch (error) {
      res.status(500).json({ 
        success: false, 
        msg: "Error al obtener producto", 
        error 
    });
  }
};

export const getProductoByName = async (req, res) => {
  try {
      const producto = await Producto.findOne({ name: req.params.name });
      if (!producto) return res.status(404).json({ 
        success: false, 
        msg: "Producto no encontrado" 
    });
      
      res.status(200).json({ 
        success: true, 
        producto 
    });
  } catch (error) {
      res.status(500).json({ 
        success: false, 
        msg: "Error al obtener producto", 
        error 
    });
  }
};

export const updateProducto = async (req, res = response) => {
  try {
      const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!producto) 
        return res.status(404).json({ 
        success: false, 
        msg: "Producto no encontrado" 
});
      
      res.status(200).json({ 
        success: true, 
        producto });
  } catch (error) {
      res.status(500).json({ 
        success: false, 
        msg: "Error al actualizar producto", 
        error 
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
      const { id } = req.params;
      const route = req.originalUrl;

      if (route.includes("/sell")) {
          const product = await Producto.findById(id);
          if (!product || !product.estado) 
            return res.status(404).json({ 
            success: false, 
            message: "Producto no encontrado" 
    });
          if (product.stock <= 0) 
            return res.status(400).json({ 
            success: false,
            message: "Producto agotado" 
        });
          
          product.stock -= 1;
          product.sold += 1;
          product.outOfStock = product.stock === 0;
          await product.save();
          
          return res.status(200).json({ 
            success: true, 
            message: "Producto vendido con éxito!", 
            product });
      }

      const deletedProduct = await Producto.findByIdAndUpdate(id, { estado: false }, { new: true });
      if (!deletedProduct) 
        return res.status(404).json({ 
        success: false, 
        message: "Producto no encontrado"
     });
      
      return res.status(200).json({ 
        success: true, 
        message: "Producto eliminado con éxito", 
        product: deletedProduct 
    });
  } catch (error) {
      res.status(500).json({ 
        success: false,
         message: "Error al eliminar producto", 
         error 
        });
    }
};

export const getMostPurchasedProducts = async (req, res) => {
  try {
      const facturas = await Factura.find().populate("products.product");

      if (!facturas.length) {
          return res.status(404).json({ 
              success: false, 
              message: "No se encontraron compras en el historial." 
          });
      }

      const productCount = {};

      facturas.forEach(factura => {
          factura.products.forEach(item => {
              const productId = item.product._id.toString();
              if (productCount[productId]) {
                  productCount[productId].count += item.quantity; 
              } else {
                  productCount[productId] = {
                      product: item.product,
                      count: item.quantity
                  };
              }
          });
      });

      const sortedProducts = Object.values(productCount).sort((a, b) => b.count - a.count);

      res.status(200).json({ 
          success: true, 
          message: "Productos más comprados a nivel global.",
          products: sortedProducts
      });
  } catch (error) {
      console.error("Error al obtener los productos más comprados:", error);
      res.status(500).json({ 
          success: false, 
          message: "Error al obtener los productos más comprados.", 
          error: error.message 
      });
  }
};

export const getOutOfStockProducts = async (req, res) => {
  try {
      const productosOutOfStock = await Producto.find({ stock: 0 });

      if (productosOutOfStock.length === 0) {
          return res.status(404).json({ 
              success: false, 
              message: "No hay productos con stock 0." 
          });
      }
      res.status(200).json({
          success: true,
          message: "Productos con stock 0.",
          productos: productosOutOfStock
      });
  } catch (error) {
      console.error("Error al obtener productos con stock 0:", error);
      res.status(500).json({
          success: false,
          message: "Error al obtener productos con stock 0.",
          error: error.message
      });
  }
};
