/**
 * Export dictionery for services singletons.
 * @type {{}}
 */
const configService = require('./config'),
    sparkService = require('./spark'),
    dbService = require('./database'),
    permissionsService = require('./permissions'),
    initialLogin = require('./initial-login');

module.exports = {
    config: configService,
    spark: sparkService,
    db: dbService,
    permissions: permissionsService,
    initialLogin: initialLogin
};
