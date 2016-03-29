'use strict';

var _ = require('underscore');

var logUnderscoreVersion = function() {
    console.log(_.VERSION);
    return _.VERSION;
};

module.exports = logUnderscoreVersion;