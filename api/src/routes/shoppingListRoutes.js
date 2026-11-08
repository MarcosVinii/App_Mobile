const { Router } = require('express');
const controller = require('../controllers/shoppingListController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/shopping-lists', authMiddleware);

router.get('/shopping-lists', controller.list);
router.post('/shopping-lists', controller.create);
router.get('/shopping-lists/:id', controller.getById);
router.put('/shopping-lists/:id', controller.rename);
router.delete('/shopping-lists/:id', controller.remove);
router.put('/shopping-lists/:id/order', controller.reorder);
router.post('/shopping-lists/:id/sections', controller.createSection);

module.exports = router;