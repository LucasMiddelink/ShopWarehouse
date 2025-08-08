import pool from '../config/database.js';
import functions from '../lib/functions.js';

/*
    TODO
    Add messaging for change in stock_quantity, orders such as reason for change.
*/

const getAllInventory = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, sku, description, stock_quantity FROM products');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

const getInventoryByProduct = async (req, res) => {
    try {
        const id = parseInt(req.query.id);
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (functions.productNotFound(result.rows, res, 'Product not found')) {
            return;
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

const getLowStockItems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE stock_quantity < 20');

        if (functions.productNotFound(result.rows, res, 'No products low on stock')) {
            return;
        }

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

// Update stock_quantity on product
const receiveInventory = async (req, res) => {
    try {
        const id = parseInt(req.query.id);
        const quant = parseInt(req.query.quant);
        if (!functions.inputValidation(id, quant, res)) {
            return;
        };

        if (!functions.quantityValidation(id, quant, res)) {
            return;
        };

        const checkProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (functions.productNotFound(checkProduct.rows, res, 'Product not found')) {
            return;
        }

        const result = await pool.query(
            'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
            [quant, id]
        );

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

const pickInventory = async (req, res) => {
    try {

        const { product_id, quantity } = req.body;

        const id = parseInt(product_id);
        const pickQuantity = parseInt(quantity);

        if (!functions.inputValidation(id, pickQuantity, res)) {
            return;
        }

        // Check if product exists and get current stock
        const productCheck = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

        if (functions.productNotFound(result.rows, res, 'Product not found')) {
            return;
        }

        const currentStock = productCheck.rows[0].stock_quantity;

        // Validate if enough stock
        if (pickQuantity > currentStock) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available: ${currentStock}, Requested: ${pickQuantity}`
            });
        }

        const result = await pool.query(
            'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 RETURNING *',
            [pickQuantity, id]
        );

        res.json({
            success: true,
            data: result.rows[0],
            message: `Successfully picked ${pickQuantity} units. New stock: ${result.rows[0].stock_quantity}`,
            notes: notes || null
        });

    } catch (error) {
        console.error('Pick inventory error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

const adjustInventory = async (req, res) => {
    const id = parseInt(req.query.id);
    const quant = parseInt(req.query.quant);

    if (!functions.inputValidation(id, quant, res)) {
        return;
    };

    if (!functions.quantityValidation(id, quant, res)) {
        return;
    };


    const checkProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (functions.productNotFound(checkProduct.rows, res, 'Product not found')) {
        return;
    }

    await pool.query
        ('UPDATE products SET stock_quantity = $1 WHERE id = $2', [quant, id]);

    res.json({
        success: true,
        data: checkProduct.rows[0],
        message: 'Product updated successfully'
    });
};

const getInventoryStats = async (req, res) => {

    try {
        const result = await pool.query('SELECT COUNT(*) as total_products, SUM(stock_quantity) as total_items_in_stock, COUNT(CASE WHEN stock_quantity <= 20 THEN 1 END) as low_stock_items FROM products');
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    };
};

export default {
    getAllInventory,
    getInventoryByProduct,
    getLowStockItems,
    receiveInventory,
    pickInventory,
    adjustInventory,
    getInventoryStats
};