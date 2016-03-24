console.log("src/js/man.js");

var Man = function(name){
    // initialize
    this.name = name;

    this.greet = function(){
        return "Hello "+this.name;
    };
};
