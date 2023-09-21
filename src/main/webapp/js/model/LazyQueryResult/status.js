var Status = /** @class */ (function () {
    function Status(_a) {
        var id = _a.id;
        this.id = id;
        this.count = 0;
        this.hasReturned = false;
    }
    Status.prototype.updateStatus = function (update) {
        var _this = this;
        Object.keys(update).forEach(function (key) {
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            _this[key] = update[key];
        });
        this.hasReturned = true;
    };
    return Status;
}());
export { Status };
//# sourceMappingURL=status.js.map