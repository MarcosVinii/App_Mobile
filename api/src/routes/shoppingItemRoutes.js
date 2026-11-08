const { Router } = require('express');
const controller = require('../controllers/shoppingItemController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/shopping-items', authMiddleware);

router.get('/shopping-items', controller.list);
router.post('/shopping-items', controller.create);
router.put('/shopping-items/:id', controller.update);
router.patch('/shopping-items/:id/status', controller.changeStatus);
router.delete('/shopping-items/:id', controller.remove);

module.exports = router;