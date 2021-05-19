/**
 * v2
 *
 * @url https://github.com/SeydX/homebridge-mercedesme
 * @author SeydX <seyd55@outlook.de>
 *
 **/

'use strict';

module.exports = function (homebridge) {
  let MercedesPlatform = require('./src/platform.js')(homebridge);
  homebridge.registerPlatform('homebridge-mercedesme', 'MercedesPlatform', MercedesPlatform, true);
};
