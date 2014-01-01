/*global mongoose:true */
(function () {
    var Cat = mongoose.model('Cat', { name: String }),
        kitty = new Cat({ name: 'Zildjian' });
    
    kitty.save(function (err) {
        if (err) {
            console.log('meow');
        }
    });
}());