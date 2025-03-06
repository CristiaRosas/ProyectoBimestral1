import mongoose from "mongoose";
import Product from "../products/producto.model.js";
import Category from "../categorias/category.model.js";

export const saveCategorias = async (req, res) => {
    try {
        const data = req.body;
        let productoId = [];

        if (data.productos && Array.isArray(data.productos) && data.productos.length > 0) {
            const productos = await Product.find({ name: { $in: data.productos } });

            if (productos.length !== data.productos.length) {
                return res.status(400).json({
                    message: 'Uno o más productos no existen en la base de datos'
                });
            }

            productoId = productos.map(productos => productos._id);
        }

        const categoria = new Category({
            ...data,
            productos: productoId
        });

        await categoria.save();

        // Poblar los productos antes de enviar la respuesta
        const categoriaPoblada = await Category.findById(categoria._id).populate('productos', 'name');

        res.status(200).json({
            success: true,
            message: 'Categoría guardada con éxito',
            categoria: categoriaPoblada
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al guardar la categoría',
            error: error.message
        });
    }
};

export const getCategorias = async (req, res) => {
    const { limit = 10, desde = 0 } = req.query;
    const query = { status: true };

    try {
        const categorias = await Category.find(query)
            .skip(Number(desde))
            .limit(Number(limit))
            .populate('productos', 'name');

        const total = await Category.countDocuments(query);
        const categoriasWithProductNames = categorias.map(categoria => ({
            ...categoria.toObject(),
            productos: categoria.productos.map(product => product.name)
        }));

        res.status(200).json({
            success: true,
            total,
            categorias: categoriasWithProductNames
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al obtener las categorías',
            error: error.message
        });
    }
};

export const getCategoriasById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const category = await Category.findById(id).populate('productos', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const categoriaData = {
            ...category.toObject(),
            productos: category.productos.length
                ? category.productos.map(product => product.name)
                : ['No hay productos asociados a esta categoría']
        };

        res.status(200).json({
            success: true,
            categoria: categoriaData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al obtener la categoría',
            error: error.message
        });
    }
};

export const getProductsByCategory = async (req, res) => {
    const { name } = req.params;

    try {
        const category = await Category.findOne({ name: name }).populate('productos', 'name');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const categoriaData = {
            ...category.toObject(),
            productos: category.productos.length
                ? category.productos.map(product => product.name)
                : ['No hay productos asociados a esta categoría']
        };

        res.status(200).json({
            success: true,
            categoria: categoriaData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al obtener los productos de la categoría',
            error: error.message
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const existentCategory = await Category.findById(id);
        if (!existentCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        let productosId = existentCategory.productos;
        if (data.productos && Array.isArray(data.productos)) {
            const productos = await Product.find({ name: { $in: data.productos } });

            if (productos.length !== data.productos.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más productos no existen en la base de datos'
                });
            }

            productosId = productos.map(producto => producto._id);
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                ...data,
                productos: productosId
            },
            { new: true }
        ).populate('productos', 'name');

        res.status(200).json({
            success: true,
            message: 'Categoría actualizada con éxito',
            categoria: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al actualizar la categoría',
            error: error.message
        });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const categoryToDelete = await Category.findById(id);
        if (!categoryToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        let defaultCategory = await Category.findOne({ name: 'Sin categoria' });

        if (!defaultCategory) {
            defaultCategory = new Category({
                name: 'Sin categoria',
                description: 'productos sin categoría',
                productos: [],
                status: true
            });
            await defaultCategory.save();
        }

        const productToMovw = categoryToDelete.productos;
        defaultCategory.productos.push(...productToMovw);
        await defaultCategory.save();

        await Category.findByIdAndDelete(id); // Eliminar la categoría después de mover los productos

        res.status(200).json({
            success: true,
            message: 'Categoría eliminada con éxito'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hubo un error al eliminar la categoría',
            error: error.message
        });
    }
};