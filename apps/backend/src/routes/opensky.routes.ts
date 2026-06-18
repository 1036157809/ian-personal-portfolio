import Router from '@koa/router';
import openskyController from '../controllers/opensky.controller';

const router = new Router();

router.get('/api/opensky/states', openskyController.getStatesAll.bind(openskyController));
router.get('/api/opensky/tracks/:icao24', openskyController.getTracks.bind(openskyController));

export default router;
