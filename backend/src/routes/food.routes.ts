import { Router } from 'express';
import { FoodController } from '../controllers/food.controller';

const router = Router();

router.get('/cafeterias', FoodController.getCafeterias);
router.get('/cafeterias/:id', FoodController.getCafeteriaDetails);
router.get('/food/recommendations', FoodController.getFoodRecommendations);
router.get('/food/items', FoodController.getAllFoodItems);

export default router;
