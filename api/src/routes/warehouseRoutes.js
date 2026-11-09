const { Router } = require('express');
const controller = require('../controllers/warehouseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use('/purchase-warehouse', authMiddleware);

// A rota "count" vem antes das rotas com ":id"
router.get('/purchase-warehouse/count', controller.count);

router.get('/purchase-warehouse', controller.list);
router.post('/purchase-warehouse', controller.create);
router.put('/purchase-warehouse/:id', controller.update);
router.delete('/purchase-warehouse/:id', controller.remove);
router.post('/purchase-warehouse/:id/organize', controller.organize);

module.exports = router;