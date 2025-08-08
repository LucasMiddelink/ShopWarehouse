import express from 'express';
import inventoryController from '../controllers/invetoryControllers.js';

const router = express.Router();

router.get('/', inventoryController.getAllInventory);              // GET  /api/inventory 
router.get('/product', inventoryController.getInventoryByProduct); // GET  /api/inventory/product/:id 
router.get('/low-stock', inventoryController.getLowStockItems);    // GET  /api/inventory/low-stock
router.get('/stats', inventoryController.getInventoryStats);       // GET /api/inventory/stats
router.put('/receive', inventoryController.receiveInventory);      // PUT /api/inventory/receive
router.put('/adjust', inventoryController.adjustInventory);        // PUT /api/inventory/adjust
router.put('/pick', inventoryController.adjustInventory);          // PUT /api/inventory/pick

export default router;