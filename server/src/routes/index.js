const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ message: 'API Routes' });
});

module.exports = router;