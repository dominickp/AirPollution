describe('Man', function(){
    it("should set a name", function(){
        var man = new Man("Jerry");

        expect(man.name).toBe("Jerry");
    });
});