const appModulePath = require('app-module-path');
const path = require('path');

appModulePath.addPath(path.resolve('app'));
appModulePath.addPath(path.resolve());