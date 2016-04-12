var $ = require("jquery");

var WebController = function (pages) {
    var model = this;

    model.page = 1;
    model.amount = pages;
    model.actions = [];

    model.next = function () {

        if (model.page > model.amount) {
            return;
        }


        var page = $("#p" + model.page);
        page.removeClass("hidden");

        $('html, body').animate({
            scrollTop: page.offset().top
        }, 1000);

        if (model.actions[model.page]) {

            model.actions[model.page].forEach(function (d) {

                setTimeout(function () {
                    d();
                }, 999);


            });
        }

        model.page++;

    };

    model.reset = function () {

        for (var i = 1; i <= model.amount; i++) {
            var page = $("#p" + i);
            page.addClass("hidden");
        }

        $(".next").each(function () {

            console.log(this);
            if ($(this).hasClass("hidden")) {
                $(this).removeClass("hidden");
            }

        });


        model.page = 1;
    };

    model.setAction = function (page, func) {

        if (!model.actions[page]) {
            model.actions[page] = [func];
        }
        else {
            model.actions[page].push(func);
        }


    };

    model.nextNoScroll = function () {
        var page = $("#p" + model.page);
        page.removeClass("hidden");


        if (model.actions[model.page]) {

            model.actions[model.page].forEach(function (d) {

                setTimeout(function () {
                    d();
                }, 999);


            });
        }
        model.page++;
    };

};

module.exports = WebController;

