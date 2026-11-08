const { Router } = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/products', authMiddleware);

router.get('/products', productController.list);
router.post('/products', productController.create);
router.get('/products/:id', productController.getById);
router.put('/products/:id', productController.update);
router.patch('/products/:id/quantity', productController.changeQuantity);
router.delete('/products/:id', productController.remove);

module.exports = router;