/**
*
*   Parse SVG utility (part of Geometrize library)
*   https://github.com/foo123/Geometrize
*
**/
!function(root, name, factory) {
"use strict";
if (('object' === typeof module) && module.exports) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if (('function' === typeof define) && define.amd && ('function' === typeof require) && ('function' === typeof require.specified) && require.specified(name) /*&& !require.defined(name)*/) /* AMD */
    define(name, ['module'], function(module) {factory.moduleUri = module.uri; return factory.call(root);});
else if (!(name in root)) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1) && ('function' === typeof(define)) && define.amd && define(function() {return root[name];});
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "parseSVG",
    /* module factory */        function ModuleFactory__parseSVG(undef) {
"use strict";

var TAG = /<(\/)?([a-z0-9_\-:]+?)\b\s*([^<>]*)\/?>/im,
    ATT = /([a-z0-9_\-:]+?)\b\s*(=\s*"([^"]*)")?/im,
    COMMAND = /[MLHVCSQTAZ]/gi,
    TRANSFORM = /(matrix|scale|rotate|translate|skewX|skewY)\s*\(([^\(\)]*)\)/im,
    NUMBER = /-?(?:(?:\d+\.\d+)|(?:\.\d+)|(?:\d+))/g,
    HAS = Object.prototype.hasOwnProperty, stdMath = Math
;
function trim(s)
{
    return s.trim();
}
function parse_number(s)
{
    s = s || '';
    //if ('-.' === s.slice(0, 2)) s = '-0.' + s.slice(2);
    //else if ('.' === s.slice(0, 1)) s = '0' + s;
    return parseFloat(s) || 0;
}
function parse_style(atts)
{
    var styleProperties = {
    'stroke-width':1,
    'stroke':1,
    'stroke-opacity':1,
    'stroke-linecap':1,
    'stroke-linejoin':1,
    'fill':1,
    'fill-opacity':1,
    'fill-rule':1
    }, isNum = {'stroke-width':1,'stroke-opacity':1,'fill-opacity':1};
    var style = trim((atts['style']||'')).split(';').reduce(function(s, e) {
        var kv = trim(e).split(':'), k = kv[0], v = kv.slice(1).join(':');
        if (HAS.call(styleProperties, k)) s[k] = 1 === isNum[k] ? parse_number(v) : v;
        return s;
    }, {});
    Object.keys(styleProperties).forEach(function(k) {
        if (HAS.call(atts, k)) style[k] = 1 === isNum[k] ? parse_number(atts[k]) : atts[k];
    });
    return style;
}
function parse_transform(atts)
{
    var m, s = trim(atts.transform || ''), tr = [];
    while (m=s.match(TRANSFORM))
    {
        tr.push([trim(m[1]).toLowerCase(), (trim(m[2]).match(NUMBER) || []).map(parse_number)]);
        s = s.slice(m.index + m[0].length);
    }
    return tr.length ? tr : null;
}
function parse_path(d)
{
    d = trim(String(d)).replace('-', ' -');
    var c = d.match(COMMAND), p = d.split(COMMAND),
        prev = [0,0], start = prev;
    return c ? c.reduce(function(a, c, i) {
        var isRelative = c === c.toLowerCase(),
            pp = (trim(p[i+1] || '').match(NUMBER) || []).map(parse_number),
            p1, p2, p3, p4, tmp;
        switch (c.toUpperCase())
        {
            case 'M':
                prev = [
                (isRelative ? prev[0] : 0) + pp[0],
                (isRelative ? prev[1] : 0) + pp[1]
                ];
                start = prev;
                break;
            case 'H':
                while (1 <= pp.length)
                {
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    prev[1]
                    ];
                    prev = p2;
                    a.push({
                    type: 'Line',
                    points: [p1, p2]
                    });
                }
                break;
            case 'V':
                while (1 <= pp.length)
                {
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    prev[0],
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    prev = p2;
                    a.push({
                    type: 'Line',
                    points: [p1, p2]
                    });
                }
                break;
            case 'L':
                while (2 <= pp.length)
                {
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    prev = p2;
                    a.push({
                    type: 'Line',
                    points: [p1, p2]
                    });
                }
                break;
            case 'A':
                while (7 <= pp.length)
                {
                    tmp = {
                        start: null,
                        end: null,
                        radiusX: pp.shift(),
                        radiusY: pp.shift(),
                        angle: pp.shift(),
                        largeArc: pp.shift(),
                        sweep: pp.shift()
                    }
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    prev = p2;
                    tmp.start = p1;
                    tmp.end = p2;
                    a.push({
                    type: 'Arc',
                    params: tmp
                    });
                }
                break;
            case 'Q':
                while (4 <= pp.length)
                {
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    p3 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    prev = p3;
                    a.push({
                    type: 'Quadratic',
                    points: [p1, p2, p3]
                    });
                }
                break;
            case 'C':
                while (6 <= pp.length)
                {
                    p1 = [prev[0], prev[1]];
                    p2 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    p3 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    p4 = [
                    (isRelative ? prev[0] : 0) + pp.shift(),
                    (isRelative ? prev[1] : 0) + pp.shift()
                    ];
                    prev = p4;
                    a.push({
                    type: 'Cubic',
                    points: [p1, p2, p3, p4]
                    });
                }
                break;
            case 'Z':
                p1 = [prev[0], prev[1]],
                p2 = [start[0], start[1]];
                prev = p2;
                start = prev;
                a.push({
                type: 'Line',
                points: [p1, p2],
                Z: true
                });
                break;
            // ignore those for now
            case 'S':
            case 'T':
            default:
                break;
        }
        return a;
    }, []) : [];
}
function parse_atts(s)
{
    var m, atts = {};
    while (m=s.match(ATT))
    {
        atts[m[1].toLowerCase()] = m[3] ? trim(m[3]) : true;
        s = s.slice(m.index + m[0].length);
    }
    return atts;
}
function parse_tag(s, cursor)
{
    var i = cursor.index || 0, m;
    s = s.slice(i);
    if (m=s.match(TAG))
    {
        if ('/' === m[1])
        {
            cursor.index = i + m.index + m[0].length;
            return {
                match: m[0],
                tag: m[2].toLowerCase(),
                end: true
            };
        }
        else
        {
            var atts = parse_atts(m[3]);
            atts.style = parse_style(atts);
            atts.transform = parse_transform(atts);
            cursor.index = i + m.index + m[0].length;
            return {
                match: m[0],
                tag: m[2].toLowerCase(),
                atts: atts
            };
        }
    }
}
function parse(s, cursor, expectEndTag)
{
    var el, objects = [], matchEndTag = expectEndTag ? 1 : 0;
    while (el=parse_tag(s, cursor))
    {
        switch (el.tag)
        {
            case 'line':
            if (!el.end)
            {
            objects.push({
                type: 'Line',
                transform: el.atts.transform,
                style: el.atts.style,
                points: [
                [parse_number(el.atts.x1), parse_number(el.atts.y1)],
                [parse_number(el.atts.x2), parse_number(el.atts.y2)]
                ]
            });
            }
            break;
            case 'polyline':
            if (!el.end)
            {
            objects.push({
                type: 'Polyline',
                transform: el.atts.transform,
                style: el.atts.style,
                points: ((el.atts.points || '').match(NUMBER) || []).map(parse_number).reduce(function(points, p, i) {
                    if (i % 2)
                    {
                        points[(i - 1)/2][1] = p;
                    }
                    else
                    {
                        points.push([p, 0]);
                    }
                    return points;
                }, [])
            });
            }
            break;
            case 'polygon':
            if (!el.end)
            {
            objects.push({
                type: 'Polygon',
                transform: el.atts.transform,
                style: el.atts.style,
                points: ((el.atts.points || '').match(NUMBER) || []).map(parse_number).reduce(function(points, p, i) {
                    if (i % 2)
                    {
                        points[(i - 1)/2][1] = p;
                    }
                    else
                    {
                        points.push([p, 0]);
                    }
                    return points;
                }, [])
            });
            }
            break;
            case 'rect':
            if (!el.end)
            {
            var x = parse_number(el.atts.x), y = parse_number(el.atts.y),
                w = parse_number(el.atts.width), h = parse_number(el.atts.height);
            objects.push({
                type: 'Polygon',
                transform: el.atts.transform,
                style: el.atts.style,
                points: [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
            });
            }
            break;
            case 'circle':
            if (!el.end)
            {
            objects.push({
                type: 'Circle',
                transform: el.atts.transform,
                style: el.atts.style,
                params: {
                    center: [parse_number(el.atts.cx),parse_number(el.atts.cy)],
                    radius: parse_number(el.atts.r)
                }
            });
            }
            break;
            case 'ellipse':
            if (!el.end)
            {
            objects.push({
                type: 'Ellipse',
                transform: el.atts.transform,
                style: el.atts.style,
                params: {
                    center: [parse_number(el.atts.cx),parse_number(el.atts.cy)],
                    radiusX: parse_number(el.atts.rx),
                    radiusY: parse_number(el.atts.ry),
                    angle: 0
                }
            });
            }
            break;
            case 'path':
            if (!el.end)
            {
            objects.push({
                type: 'Path',
                transform: el.atts.transform,
                style: el.atts.style,
                nodes: parse_path(el.atts.d || '')
            });
            }
            break;
            case 'g':
            if (el.end)
            {
                if ('g' === expectEndTag)
                {
                    --matchEndTag;
                    if (0 === matchEndTag) return objects;
                }
            }
            else
            {
                if ('g' === expectEndTag) ++matchEndTag;
                objects.push({
                    type: 'Group',
                    transform: el.atts.transform,
                    style: el.atts.style,
                    nodes: parse(s, cursor, 'g')
                });
            }
            break;
            case 'svg':
            if (el.end)
            {
                if ('svg' === expectEndTag)
                {
                    --matchEndTag;
                    if (0 === matchEndTag) return objects;
                }
            }
            else
            {
                if ('svg' === expectEndTag) ++matchEndTag;
                objects.push({
                    type: 'SVG',
                    viewBox: el.atts.viewbox ? el.atts.viewbox.match(NUMBER).map(parse_number) : [0,0,0,0],
                    nodes: parse(s, cursor, 'svg')
                });
            }
            break;
            default:
            // ignore
            break;
        }
    }
    return objects;
}
function parseSVG(svg)
{
    return parse(trim(String(svg)), {index:0});
}
parseSVG.parsePath = parse_path;

// export it
return parseSVG;
});
