import { response, request }  from "express";
import Producto from "./producto.model.js";

export const saveProducto = async (req, res) => {
  try {
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
          .limit(Number(limite));

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
