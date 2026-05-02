const router = require('express').Router();
const carsController = require('../controllers/cars.controller');
const verifyJWT = require('../middleware/verifyJWT');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET ALL CARS
 * GET /api/cars
 * Query: { page, limit, category, fuelType, transmission, minPrice, maxPrice, search }
 */
router.get('/', carsController.getAllCars);

/**
 * GET POPULAR CARS
 * GET /api/cars/popular
 * Query: { limit }
 */
router.get('/popular', carsController.getPopularCars);

/**
 * GET TRENDING CARS
 * GET /api/cars/trending
 * Query: { limit }
 */
router.get('/trending', carsController.getTrendingCars);

/**
 * GET CAR BY ID
 * GET /api/cars/:id
 */
router.get('/:id', carsController.getCarById);

// ============================================
// PROTECTED ROUTES (Require JWT)
// ============================================

/**
 * CREATE CAR
 * POST /api/cars
 * Headers: Authorization: Bearer {token}
 * Body: { title, brand, model, year, price, category, fuelType, transmission, color, mileage, description, features, images }
 */
router.post('/', verifyJWT, carsController.createCar);

/**
 * UPDATE CAR
 * PUT /api/cars/:id
 * Headers: Authorization: Bearer {token}
 */
router.put('/:id', verifyJWT, carsController.updateCar);

/**
 * DELETE CAR
 * DELETE /api/cars/:id
 * Headers: Authorization: Bearer {token}
 */
router.delete('/:id', verifyJWT, carsController.deleteCar);

/**
 * GET MY CARS
 * GET /api/cars/user/my-cars
 * Headers: Authorization: Bearer {token}
 */
router.get('/user/my-cars', verifyJWT, carsController.getMyCars);

module.exports = router;