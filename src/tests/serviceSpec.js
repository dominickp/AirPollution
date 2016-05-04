var Service = require('../js/service');

// The describe function is for grouping related specs.
describe('service', function(){

    var service;

    // The beforeEach function is called once before each spec in the describe in which it is called
    beforeEach(function() {
        service = new Service();
    });


    // You can have multiple describes within a spec
    describe('handling datasets', function(){

        it("add and retrieve datasets", function(){

            var dataset = [
                {Boston: 123},
                {Cambridge: 456}
            ];

            var dataset_key = 'my_city_dataset';

            service.addOriginalDataset(dataset_key, dataset);

            expect(service.getOriginalDataset(dataset_key)).toBe(dataset);
        });

    });

    describe('handling regions', function(){

        // Tests are skipped by adding an "x' before the it().
        // This test can't run because Karma/Jasmine do not have access to jQuery ($) which this function references.
        // This is an example of the type of thing Service should not be doing (updating the view), which testing
        // helps to illustrate. Testing helps you keep your separation of concerns because when you muddle things up
        // the tests become to hard to write.
        xit("should add the user's city", function(){

            var city = {
                name: "Boston",
                country: "United States",
                pm25: 123
            };

            service.setSelectedCity(city);

            expect(service.getSelectableData()).toBe(city);
        });

        // This one also doesn't work because addOtherCity causes the view to update.
        xit("should add other cities", function(){
            var boston = {
                name: "Boston",
                country: "United States",
                pm25: 123
            };

            var cambridge = {
                name: "Cambridge",
                country: "United States",
                pm25: 250
            };

            var original_other_cities = service.getOtherCities();

            expect(original_other_cities.length).toBe(0);

            service.addOtherCity(boston);
            service.addOtherCity(cambridge);

            var new_other_cities = service.getOtherCities();

            expect(new_other_cities.length).toBe(2);

        });

    });
    
});