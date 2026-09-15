import { Router } from 'express';
import { NavigationController } from '../controllers/navigation.controller';

const router = Router();

router.get('/locations', NavigationController.getLocations);
router.get('/locations/search', NavigationController.searchLocations);
router.get('/locations/:id', NavigationController.getLocationById);
router.get('/navigation/route', NavigationController.getRoute);
router.get('/buildings', NavigationController.getBuildings);
router.get('/facilities', NavigationController.getFacilities);

export default router;
