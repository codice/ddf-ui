/**
 *  Spread operator like so:
 *  { ...props } is seen as generating a class but it's a plain object.  This prevents typescript from
 *  seeing spreading of a class as generating an instance of one.  There might be a better solution than this,
 *  but this seems simple enough / not really intrusive.
 *
 */
export declare class SpreadOperatorProtectedClass {
    _DO_NOT_USE_SPREAD_OPERATOR(): void;
}
