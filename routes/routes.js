const express = require('express');
const router = express.Router();
const  {postEvents, getStats} = require('../controllers/eventControllers')


//Ingestion Endpoint
router.post('/event', postEvents);

//Statistics Endpoint
router.get('/stats', getStats);

module.exports = router;                                                    