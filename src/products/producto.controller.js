import { response, request }  from "express";
import Producto from "./producto.model.js";

export const saveProducto = async (req, res) => {
    try {
      const data = req.body;
      const producto = new Producto(data);
      await producto.save();
  
      res.status(200).json({
        success: true,
        message: 'Producto agregado con exito!',
        producto
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Hubo un error al agregar producto',
        error
      });
    }
  };

  export const getProductos = async (req = request, res = response) => {
    try {
      const { limite = 10, desde = 0 } = req.query;
      const query = { estado: true };
  
      const [total, productos] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query).skip(Number(desde)).limit(Number(limite)),
      ]);
  
      res.status(200).json({
        success: true,
        total,
        productos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Hubo un error al obtener el producto",
      });
    }
  };

export const getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id);

        if (!producto) {
            return  res.status(404).json({
                succes: false,
                msg: 'El producto no se encontro en la base de datos'
            })
        }

        res.status(200).json({
            succes: true,
            producto
        })

    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Hubo un error al obtener el producto',
            error: error.message
        })
    }
}

export const getProductoByName = async (req, res) => {
    try {
      const { name } = req.params;
      const producto = await Producto.findOne({ name });
  
      if (!producto) {
        return res.status(404).json({
          success: false,
          msg: "El producto no se encontro en la base de datos",
        });
      }
  
      res.status(200).json({
        success: true,
        msg: "Producto encontrado con exito!",
        producto,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Hubo un error al obtener el producto",
        error: error.message,
      });
    }
  };

  export const updateProducto = async (req, res = response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const producto = await Producto.findByIdAndUpdate(id, data, { new: true });
  
      res.status(200).json({
        success: true,
        msg: "El producto fue actualizado con exito!",
        producto,
      });
    } catch (error) {
      console.error("Error en updateProducto:", error);
      res.status(500).json({
        success: false,
        msg: "Hubo un error al actualizar el producto!",
        error: error,
      });
    }
  };

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const route = req.originalUrl;

        if (route.includes('/sell')) {
            const product = await Producto.findById(id);

            if (!product || !product.estado) {
                return res.status(404).json({
                    success: false,
                    message: 'El producto no se encontro el la base de datos!'
                });
            }

            if (product.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El producto esta agotado'
                });
            }

            product.stock -= 1;
            product.sold += 1;
            product.outOfStock = product.stock === 0;
            await product.save();

            return res.status(200).json({
                success: true,
                message: 'El producto se vendio exitosamente!',
                product
            });

        } else {
            const deletedProduct = await Producto.findByIdAndUpdate(
                id,
                { estado: false },
                { new: true }
            );

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'El producto no se encontro en la base de datos'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'El proeducto se elimino con exito',
                product: deletedProduct
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error',
            error: error.message
        });
    }
};