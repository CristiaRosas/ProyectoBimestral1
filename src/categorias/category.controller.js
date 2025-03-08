import mongoose from "mongoose";
import Product from "../products/producto.model.js";
import Category from "../categorias/category.model.js";

export const saveCategorias = async (req, res) => {
    try {
        const { name, description, productos = [] } = req.body;
        const categoriaExistente = await Category.findOne({ name: name.trim() });

        if (categoriaExistente) {
            return res.status(400).json({
                success: false,
                message: "Ya existe una categoría con ese nombre",
            });
        }

        const productosEncontrados = await Product.find({ name: { $in: productos } });

        if (productos.length && productosEncontrados.length !== productos.length) {
            return res.status(400).json({
                success: false,
                message: "Uno o más productos no existen en la base de datos",
            });
        }

        const productoIds = productosEncontrados.map(producto => producto._id);

        const categoria = new Category({ name, description, productos: productoIds });
        const categoriaGuardada = await categoria.save();

        await Product.updateMany(
            { _id: { $in: productoIds } }, 
            { $set: { relacion: categoriaGuardada._id } } 
        );

        const categoriaPoblada = await Category.findById(categoriaGuardada._id).populate("productos", "name");

        res.status(200).json({ 
            success: true, 
            message: "Categoría guardada con éxito y productos actualizados",
            categoria: categoriaPoblada,
        });
    } catch (error) {
        console.error("Error al guardar la categoría:", error);
        res.status(500).json({ 
            success: false, 
            message: "Hubo un error al guardar la categoría", 
            error: error.message 
        });
    }
};

export const getCategorias = async (req, res) => {
    try {
        const { limit = 10, desde = 0 } = req.query;

        const categorias = await Category.find({ status: true })
            .skip(Number(desde))
            .limit(Number(limit))
            .populate("productos", "name");

        const total = await Category.countDocuments({ status: true });

        res.status(200).json({
            success: true,
            total,
            categorias
        });
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las categorías",
            error: error.message
        });
    }
};

export const getCategoriasById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const categoria = await Category.findById(id).populate("productos", "name");

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            categoria
        });
    } catch (error) {
        console.error("Error al obtener la categoría por ID:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la categoría",
            error: error.message
        });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const { name } = req.params;

        const categoria = await Category.findOne({ name }).populate("productos", "name");

        if (!categoria) {
            return res.status(404).json({ 
                success: false, 
                message: "Categoría no encontrada",
                error: error.message 
            });
        }

        res.status(200).json({ success: true, categoria });
    } catch (error) {
        console.error("Error al obtener productos por categoría:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error al obtener productos de la categoría", 
            error: error.message 
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, productos = [] } = req.body;

        const categoria = await Category.findById(id);

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        const productosEncontrados = await Product.find({ name: { $in: productos } });

        if (productos.length && productosEncontrados.length !== productos.length) {
            return res.status(400).json({
                success: false,
                message: "Uno o más productos no existen en la base de datos"
            });
        }

        const productoIds = productosEncontrados.map(producto => producto._id);

        categoria.name = name;
        categoria.description = description;
        categoria.productos = productoIds;
        const categoriaActualizada = await categoria.save();

        const categoriaPoblada = await Category.findById(categoriaActualizada._id).populate("productos", "name");

        res.status(200).json({
            success: true,
            message: "Categoría actualizada con éxito",
            categoria: categoriaPoblada
        });
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar la categoría",
            error: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const categoria = await Category.findById(id);

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        categoria.status = false;
        await categoria.save();

        let defaultCategory = await Category.findOne({ name: "Sin categoría" });

        if (!defaultCategory) {
            defaultCategory = new Category({
                name: "Sin categoría",
                description: "Productos sin categoría",
                productos: [],
                status: true,
            });
            await defaultCategory.save();
        }

        await Product.updateMany(
            { _id: { $in: categoria.productos } }, 
            { $set: { relacion: defaultCategory._id } } 
        );

        defaultCategory.productos.push(...categoria.productos);
        await defaultCategory.save();

        res.status(200).json({
            success: true,
            message: "Categoría eliminada con éxito y productos reasignados a la categoría por defecto"
        });
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar la categoría",
            error: error.message
        });
    }
};

const createDefaultCategory = async () => {
    try {
        let defaultCategory = await Category.findOne({ name: "Sin categoría" });

        if (!defaultCategory) {
            defaultCategory = new Category({
                name: "Sin categoría",
                description: "Productos sin categoría",
                productos: [],
                status: true,
            });

            await defaultCategory.save();
            console.log("Categoría 'Sin categoría' creada con éxito.");
        } else {
            console.log("La categoría 'Sin categoría' ya existe.");
        }
    } catch (error) {
        console.error("Error al crear la categoría por defecto:", error);
    }
};

createDefaultCategory();
