const Router = require('express').Router;
const controllers = require('../controllers');

module.exports = class CampsRouter {

    constructor() {
        this.router = new Router();
        this.initMiddleware();
        this.initRoutes();
    }

    initMiddleware() {
        // Version Router level middlewares
    }

    initRoutes() {
        /**
         * E.G - /api/VERSION/spark/camps/open
         */
        this.router.get('/spark/camps/open', controllers.sparkCamps.getOpenCamps);
        this.router.get('/spark/camps/:id/members', controllers.sparkCamps.getCampMembers);
    }
};