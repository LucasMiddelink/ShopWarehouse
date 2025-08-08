import pool from '../config/database.js';
import functions from '../lib/functions.js';

const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
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

const getProductById = async (req, res) => {
  const id = parseInt(req.query.id);

  try {

    if (!functions.isIdValid(id, res)) {
      return;
    };

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

const createProduct = async (req, res) => {
  try {
    const { name, sku, description, price, category, stock_quantity } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        error: 'Name and SKU are required'
      });
    }

    const result = await pool.query(
      'INSERT INTO products (name, sku, description, price, category, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', // $1, $2, $3 prevents SQL injection
      [name, sku, description || '', price || 0, category || 'Uncategorized', stock_quantity || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    };
  };
};

const updateProduct = async (req, res) => {
  const id = parseInt(req.query.id);
  try {

    if (!functions.isIdValid(id, res)) {
      return;
    };

    const { name, sku, description, price, category, stock_quantity } = req.body;

    const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (functions.productNotFound(existingProduct.rows, res, 'Product not found')) {
      return;
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    // TODO optimise this
    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (sku) {
      updates.push(`sku = $${paramCount}`);
      values.push(sku);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }
    if (category) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (stock_quantity) {
      updates.push(`stock_quantity = $${paramCount}`);
      values.push(stock_quantity);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    };
  };
};

const deleteProduct = async (req, res) => {
  const id = parseInt(req.query.id);

  try {

    if (!functions.isIdValid(id, res)) {
      return;
    };

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (functions.productNotFound(result.rows, res, 'Product not found')) {
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  };
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};