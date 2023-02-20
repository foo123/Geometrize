/**[DOC_MD]
 * ### Scene3D
 *
 * scene container for 3D geometric objects
 *
 * ```javascript
 * const scene = Scene3D(containerEl);
 * ```
[/DOC_MD]**/
var Scene3D = makeClass(null, {
    constructor: function Scene3D(dom) {
    },
    dispose: null,
    add: null,
    remove: null,
    toSVG: null,
    toCanvas: null,
    toIMG: null
});
Geometrize.Scene3D = Scene3D;
