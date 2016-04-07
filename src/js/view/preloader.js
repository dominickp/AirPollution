var $ = require("jquery");

var preloader = function() {

    var model = this;

    model.remove = function(){
        $("#preloader-container").fadeOut();
    };

};

module.exports = preloader;

