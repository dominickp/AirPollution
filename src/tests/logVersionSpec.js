
describe('logVersion', function(){

    it("should get the version of underscore", function(){
        var logUnderscoreVersion = require('../js/logVersion');

        var version = logUnderscoreVersion();

        expect(version.length).toBeGreaterThan(0);
    });
});