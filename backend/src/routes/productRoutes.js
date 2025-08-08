import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/allProducts', productController.getAllProducts);   // GET      /api/products
router.get('/product', productController.getProductById);       // GET      /api/products/123
router.post('/create', productController.createProduct);        // POST     /api/products
router.put('/update', productController.updateProduct);         // PUT      /api/products/123
router.delete('/delete', productController.deleteProduct);      // DELETE   /api/products/123

export default router;