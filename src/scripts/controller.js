"use strict";
var UrController = (function(con) {
    const MODEL = UrModel;
    const VIEW = UrView;

    con.initialize = function() {
        VIEW.initialize();
        MODEL.initialize();
    }

    con.startGame = function() {
    }

    return con;
})(UrController || {});