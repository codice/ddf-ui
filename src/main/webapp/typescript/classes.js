/**
 *  Spread operator like so:
 *  { ...props } is seen as generating a class but it's a plain object.  This prevents typescript from
 *  seeing spreading of a class as generating an instance of one.  There might be a better solution than this,
 *  but this seems simple enough / not really intrusive.
 *
 */
var SpreadOperatorProtectedClass = /** @class */ (function () {
    function SpreadOperatorProtectedClass() {
    }
    SpreadOperatorProtectedClass.prototype._DO_NOT_USE_SPREAD_OPERATOR = function () { }; // literally to force spread operator to be seen as generating non compliant class
    return SpreadOperatorProtectedClass;
}());
export { SpreadOperatorProtectedClass };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3Nlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC90eXBlc2NyaXB0L2NsYXNzZXMudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNIO0lBQUE7SUFFQSxDQUFDO0lBREMsa0VBQTJCLEdBQTNCLGNBQStCLENBQUMsRUFBQyxrRkFBa0Y7SUFDckgsbUNBQUM7QUFBRCxDQUFDLEFBRkQsSUFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogIFNwcmVhZCBvcGVyYXRvciBsaWtlIHNvOlxuICogIHsgLi4ucHJvcHMgfSBpcyBzZWVuIGFzIGdlbmVyYXRpbmcgYSBjbGFzcyBidXQgaXQncyBhIHBsYWluIG9iamVjdC4gIFRoaXMgcHJldmVudHMgdHlwZXNjcmlwdCBmcm9tXG4gKiAgc2VlaW5nIHNwcmVhZGluZyBvZiBhIGNsYXNzIGFzIGdlbmVyYXRpbmcgYW4gaW5zdGFuY2Ugb2Ygb25lLiAgVGhlcmUgbWlnaHQgYmUgYSBiZXR0ZXIgc29sdXRpb24gdGhhbiB0aGlzLFxuICogIGJ1dCB0aGlzIHNlZW1zIHNpbXBsZSBlbm91Z2ggLyBub3QgcmVhbGx5IGludHJ1c2l2ZS5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBTcHJlYWRPcGVyYXRvclByb3RlY3RlZENsYXNzIHtcbiAgX0RPX05PVF9VU0VfU1BSRUFEX09QRVJBVE9SKCkge30gLy8gbGl0ZXJhbGx5IHRvIGZvcmNlIHNwcmVhZCBvcGVyYXRvciB0byBiZSBzZWVuIGFzIGdlbmVyYXRpbmcgbm9uIGNvbXBsaWFudCBjbGFzc1xufVxuIl19