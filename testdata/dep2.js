var ne = Mime.require('noexist', require);

module.exports = {
    f: function () {
        return ne.callMe();
    }
};
