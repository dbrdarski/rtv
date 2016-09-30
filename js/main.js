var scriptsPath = document.getElementById('require-js').getAttribute("data-path");
requirejs.config({
    "baseUrl": scriptsPath,
    "paths": {
        "jquery" : "https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min",
        "jquery.vimeo": "jquery.vimeo.api.min",
        "mustache": "mustache.min",
        // "util": "../util.min",
        // "scrollMonitor" : "scrollMonitor"
    },
    "shim": {
        "jquery.vimeo": ["jquery"]
    }
});

requirejs(["../app"]);