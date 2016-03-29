
describe('logVersion', function(){

    it("should get the version", function(){
        var logUnderscoreVersion = require('../js/logVersion');

        var version = logUnderscoreVersion();

        expect(version.length).toBeGreaterThan(0);
    });
});