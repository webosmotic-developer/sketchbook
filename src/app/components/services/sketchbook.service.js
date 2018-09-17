(function () {
    'use strict';

    angular
        .module('sketchbook')
        .factory('Sketchbook', fnSketchbookFactory);

    /** @ngInject */
    function fnSketchbookFactory(d3) {

        var _this = this;
        var sketchbook;
        var shapeDrag = d3.behavior.drag()
            .on('dragstart', function () {
                d3.event.sourceEvent.stopPropagation();
            })
            .on('drag', function (d) {
                d.spX = d.spX + d3.event.dx;
                d.spY = d.spY + d3.event.dy;
                d3.select(this).attr('transform', function (d) {
                    return 'translate(' + d.spX + ',' + d.spY + ')';
                });
            });
        var shapeResize = d3.behavior.drag()
            .on('dragstart', function () {
                d3.event.sourceEvent.stopPropagation();
            })
            .on('drag', function (d) {
                var newEndPoint = d3.mouse(_this.sbSelector.node());
                if (d3.event.sourceEvent.shiftKey) {
                    d.epX = Math.max(newEndPoint[0], newEndPoint[1]);
                    d.epY = d.spY - d.spX + Math.max(newEndPoint[0], newEndPoint[1]);
                } else {
                    d.epX = newEndPoint[0];
                    d.epY = newEndPoint[1];
                }
                if (d.spX < d.epX && d.spY < d.epY) {
                    switch (d.type) {
                        case 'CIRCLE_OR_ELLIPSE':
                        case 'RECT':
                            d = _this.calShapeHW(d);
                            _this.createShapePath(d3.select(this.parentNode), 'shape-path', d);
                            _this.updateResizeSelector(d3.select(this.parentNode).select('path.shape-path'), d);
                            break;
                        case 'RANGE_SLIDER':
                            d = _this.calShapeHW(d);
                            d.handleSize = Math.min(d.height, d.width) * 0.1; // 10% of height or width
                            var data = d.shapes.filter(function (o) {
                                o.height = d.height;
                                o.width = d.width;
                                return o.type === 'RECT';
                            })[0];
                            d.scale.range([d.handleSize, d.width - d.handleSize]);
                            _this.createRangeSlider(d3.select(this.parentNode.parentNode), 'range-slider', d);
                            _this.updateResizeSelector(d3.select(this.parentNode).select('path.rs-path'), data);
                            break;
                        case 'ARC':
                            d = _this.calShapeHW(d);
                            _this.createArcShape(d3.select(this.parentNode.parentNode), 'shape-arc', d);
                            _this.updateResizeSelector(d3.select(this.parentNode).select('path.arc-path'), d);
                            break;
                        case 'ICON':
                            d = _this.calShapeHW(d);
                            _this.createIconShape(d3.select(this.parentNode.parentNode), 'shape-icon', d);
                            _this.updateResizeSelector(d3.select(this.parentNode).select('foreignObject.icon-path'), d);
                            break;
                    }
                }
            });
        var line = d3.svg.line()
            .x(function (d) {
                return d[0];
            })
            .y(function (d) {
                return d[1];
            });

        _this.onMouseOverSvgEvent = function () {
            if (_this.shapeObj) {
                _this.sbSvg.style('cursor', 'crosshair');
            }
        }

        /**
         * Create svg mouse down event
         * */
        _this.onMouseDownSvgEvent = function () {
            d3.event.stopPropagation();
            if (d3.event.type === 'mousedown' && _this.shapeObj) {
                _this.shapeObj.id = 'sb' + Date.now();
                if (_this.shapeObj.type === 'RANGE_SLIDER') {
                    _this.shapeObj.scale = d3.scale.linear().domain([0, 50]);
                }
                _this.shapeObj.zIndex = _this.data.length + 1;
                var mPoint = d3.mouse(_this.sbSelector.node());
                _this.shapeObj.spX = mPoint[0];
                _this.shapeObj.spY = mPoint[1];
                _this.sbSvg.on('mousemove', _this.onMouseMoveSvgEvent);
                _this.sbSvg.on('mouseup', _this.onMouseUpSvgEvent);
                _this.sbSvg.on('mouseleave', _this.onMouseLeaveSvgEvent);
            }
        };

        /**
         * Create svg mouse move event
         * */
        _this.onMouseMoveSvgEvent = function () {
            d3.event.stopPropagation();
            var type = d3.event.type;
            if (type === 'mousemove') {
                var mPoint = d3.mouse(_this.sbSelector.node());
                if (d3.event.shiftKey) {
                    _this.shapeObj.epX = Math.max(mPoint[0], mPoint[1]);
                    _this.shapeObj.epY = _this.shapeObj.spY - _this.shapeObj.spX + Math.max(mPoint[0], mPoint[1]);
                } else {
                    _this.shapeObj.epX = mPoint[0];
                    _this.shapeObj.epY = mPoint[1];
                }
                switch (_this.shapeObj.type) {
                    case 'CIRCLE_OR_ELLIPSE':
                    case 'RECT':
                    case 'ARC':
                    case 'ICON':
                        _this.shapeObj = _this.calShapeHW(_this.shapeObj);
                        break;
                    case 'RANGE_SLIDER':
                        _this.shapeObj = _this.calShapeHW(_this.shapeObj);
                        _this.shapeObj.handleSize = Math.min(_this.shapeObj.height, _this.shapeObj.width) * 0.1; // 10% of height or width
                        _this.shapeObj.scale.range([_this.shapeObj.handleSize, _this.shapeObj.width - _this.shapeObj.handleSize]);
                        break;
                }
                _this.createShapes(_this.sbSelector, [_this.shapeObj]);
            }
        };

        /**
         * Create svg mouse up event
         * */
        _this.onMouseUpSvgEvent = function () {
            _this.ignoreSvgEvents();
        };

        /**
         * Create svg mouse leave event
         * */
        _this.onMouseLeaveSvgEvent = function () {
            _this.ignoreSvgEvents();
        };

        _this.ignoreSvgEvents = function () {
            d3.event.stopPropagation();
            d3.select('#' + _this.shapeObj.id).remove();
            _this.sbSvg.style('cursor', 'default');
            _this.sbSvg.on('mousemove', null);
            _this.sbSvg.on('mouseup', null);
            _this.sbSvg.on('mouseleave', null);
            if (_this.shapeObj && _this.shapeObj.epX && _this.shapeObj.epY) {
                _this.data.push(_this.clone(_this.shapeObj));
                sketchbook.update(_this.data);
                sketchbook.setShapeObj(null);
            }
        }

        /**
         * Erase selection
         * */
        _this.eraseResizeSelector = function () {
            d3.selectAll('path.selection-path').remove();
            d3.selectAll('circle.resize-circle').remove();
            sketchbook.setShapeObj(null);
        };

        /**
         * Update shape resize selector
         * @param ele
         * @param d
         * */
        _this.updateResizeSelector = function (ele, d) {
            var bound = ele.node().getBBox();
            var rectData = angular.copy(d);
            rectData.height = bound.height;
            rectData.width = bound.width;
            rectData.x = bound.x;
            rectData.y = bound.y;
            d.rpX = rectData.x + rectData.width;
            d.rpY = rectData.y + rectData.height;
            _this.createShapeResize(d3.select(ele[0][0].parentNode), 'resize-circle', d);
            rectData.type = 'RESIZE_RECT';
            _this.createShapePath(d3.select(ele[0][0].parentNode), 'selection-path', rectData);
        };

        /**
         * Calculate shape height and width
         * @param shapeObj
         * */
        _this.calShapeHW = function (shapeObj) {
            shapeObj.height = shapeObj.epY - shapeObj.spY;
            shapeObj.width = shapeObj.epX - shapeObj.spX;
            return shapeObj;
        };

        /**
         * Clone object
         * @param shapeObj
         * */
        _this.clone = function (obj) {
            if (null == obj || 'object' != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        };

        _this.fnHighlightShape = function (isCalledForHighlight, data, propertyObj) {
            d3.selectAll('path.selection-path').remove();
            d3.selectAll('circle.resize-circle').remove();
            if (isCalledForHighlight) {
                if (data.type !== 'TEXT') {
                    if (data.type === 'RANGE_SLIDER') {
                        _this.updateResizeSelector(d3.select('#' + data.id).select('path.rs-path'), data);
                    } else if (data.type === 'ARC') {
                        _this.updateResizeSelector(d3.select('#' + data.id).select('path.arc-path'), data);
                    } else if (data.type === 'ICON') {
                        _this.updateResizeSelector(d3.select('#' + data.id).select('foreignObject.icon-path'), data);
                    } else {
                        _this.updateResizeSelector(d3.select('#' + data.id).select('path.shape-path'), data);
                    }
                }
            } else if (propertyObj) {
                if (propertyObj.type !== 'TEXT') {
                    if (propertyObj.type === 'RANGE_SLIDER') {
                        _this.updateResizeSelector(d3.select('#' + propertyObj.id).select('path.rs-path'),
                            propertyObj);
                    } else if (propertyObj.type === 'RANGE_SLIDER') {
                        _this.updateResizeSelector(d3.select('#' + propertyObj.id).select('path.arc-path'),
                            propertyObj);
                    } else if (propertyObj.type === 'ICON') {
                        _this.updateResizeSelector(d3.select('#' + propertyObj.id).select('foreignObject.icon-path'),
                            propertyObj);
                    } else {
                        _this.updateResizeSelector(d3.select('#' + propertyObj.id).select('path.shape-path'),
                            propertyObj);
                    }
                }
            }
        };

        /**
         * Create shapes
         * @param ele - selection for append
         * @param data - sketchbook data
         * */
        _this.createShapes = function (ele, data) {
            var shape = ele.selectAll('g.shape')
                .data(data, function (d) {
                    return d.id;
                });

            // Enter
            shape.enter().append('g')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('class', 'shape')
                .attr('transform', function (d) {
                    return 'translate(' + d.spX + ',' + d.spY + ')';
                })
                .on('click', function (d) {
                    d3.event.stopPropagation();
                    _this.eraseResizeSelector();
                    if (d.type === 'RANGE_SLIDER') {
                        _this.updateResizeSelector(d3.select(this).select('path.rs-path'), d);
                    } else if (d.type === 'ARC') {
                        _this.updateResizeSelector(d3.select(this).select('path.arc-path'), d);
                    } else if (d.type === 'ICON') {
                        _this.updateResizeSelector(d3.select(this).select('foreignObject.icon-path'), d);
                    } else if (d.type !== 'TEXT') {
                        _this.updateResizeSelector(d3.select(this).select('path.shape-path'), d);
                    }
                    sketchbook.onShapeClickCallback(sketchbook.onShapeClick, d);
                })
                .call(shapeDrag);

            // Update
            shape
                .attr('transform', function (d) {
                    return 'translate(' + d.spX + ',' + d.spY + ')';
                });

            angular.forEach(data, function (d) {
                if (d.type === 'TEXT') {
                    _this.createTextElem(shape, 'shape-text');
                } else if (d.type === 'RANGE_SLIDER') {
                    _this.createRangeSlider(shape, 'range-slider');
                } else if (d.type === 'ARC') {
                    _this.createArcShape(shape, 'shape-arc');
                } else if (d.type === 'ICON') {
                    _this.createIconShape(shape, 'shape-icon');
                } else {
                    _this.createShapePath(shape, 'shape-path');
                }
            });

            // Exit
            shape.exit().remove();
        };

        /**
         * Create Input Text element
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createTextElem = function (select, selectAll, data) {
            var text = select.selectAll('text.' + selectAll).data(function (d) {
                return data ? [data] : [d];
            });

            // Enter
            text.enter().append('text').attr('class', selectAll);

            // Update
            text
                .each(function (d) {
                    d = _this.updateAttr(d);
                    var element = d3.select(this);
                    angular.forEach(d.attr, function (val, key) {
                        element.attr(key, val);
                    });
                    angular.forEach(d.style, function (val, key) {
                        element.style(key, val);
                    });
                    if (d.text) {
                        element.text(d.text);
                    }
                });

            // Exit
            text.exit().remove();
        };

        /**
         * Create Icon element
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createIconShape = function (select, selectAll, data) {
            var gForeignObj = select.selectAll('g.' + selectAll).data(function (d) {
                var shapeData = data ? [data] : [d];
                shapeData = shapeData.map(function (so) {
                    if (so.shapes && so.shapes.length) {
                        so.shapes = so.shapes.map(function (o, i) {
                            var name = o.name.split(' ').join('-').toLowerCase();
                            o.id = name + '-' + (i + 1);
                            o.spX = so.spX;
                            o.spY = so.spY;
                            o.epX = so.epX;
                            o.epY = so.epY;
                            o.height = so.height;
                            o.width = so.width;
                            o.valueIcon = so.valueIcon;
                            return o;
                        });
                    }
                    return so;
                });
                return shapeData;
            });

            // Enter
            gForeignObj.enter().append('g').attr('class', selectAll);

            // Update
            gForeignObj.attr('class', selectAll);

            var path = gForeignObj.selectAll('foreignObject.icon-path')
                .data(function (d) {
                    return d.shapes ? d.shapes : [];
                });

            // Enter
            path.enter().append('foreignObject')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('class', 'icon-path');

            // Update
            path
                .each(function (d) {
                    d = _this.updateAttr(d);
                    var element = d3.select(this);
                    angular.forEach(d.attr, function (val, key) {
                        element.attr(key, val);
                    });
                    angular.forEach(d.style, function (val, key) {
                        element.style(key, val);
                    });
                    if (d.html) {
                        element.html(d.html);
                    }
                });

            // Exit
            path.exit().remove();

            // Exit
            gForeignObj.exit().remove();
        };

        /**
         * Create Input Text element
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createShapePath = function (select, selectAll, data) {
            var path = select.selectAll('path.' + selectAll).data(function (d) {
                return data ? [data] : [d];
            });

            // Enter
            path.enter().append('path').attr('class', selectAll);

            // Update
            path
                .each(function (d) {
                    d = _this.updateAttr(d);
                    var element = d3.select(this);
                    angular.forEach(d.attr, function (val, key) {
                        element.attr(key, val);
                    });
                    angular.forEach(d.style, function (val, key) {
                        element.style(key, val);
                    });
                });

            // Exit
            path.exit().remove();
        };

        /**
         * Create Shape resize element
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createShapeResize = function (select, selectAll, data) {
            var circle = select.selectAll('circle.' + selectAll).data(function (d) {
                return data ? [data] : [d];
            });

            // Enter
            circle.enter().append('circle').attr('class', selectAll).call(shapeResize);

            // Update
            circle
                .attr('cx', function (d) {
                    return d.rpX;
                })
                .attr('cy', function (d) {
                    return d.rpY;
                })
                .attr('r', 7)
                .style('cursor', 'nwse-resize')
                .style('fill', '#5da2ff');

            // Exit
            circle.exit().remove();
        };

        /**
         * Create range slider
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createArcShape = function (select, selectAll, data) {
            var gArc = select.selectAll('g.' + selectAll).data(function (d) {
                var shapeData = data ? [data] : [d];
                shapeData = shapeData.map(function (so) {
                    if (so.shapes && so.shapes.length) {
                        so.shapes = so.shapes.map(function (o, i) {
                            var name = o.name.split(' ').join('-').toLowerCase();
                            o.id = name + '-' + (i + 1);
                            o.spX = so.spX;
                            o.spY = so.spY;
                            o.epX = so.epX;
                            o.epY = so.epY;
                            o.height = so.height;
                            o.width = so.width;
                            o.angle = so.angle;
                            o.radius = so.radius;
                            o.orientation = so.orientation;
                            return o;
                        });
                    }
                    return so;
                });
                return shapeData;
            });

            // Enter
            gArc.enter().append('g').attr('class', selectAll);

            // Update
            gArc.attr('class', selectAll);

            var path = gArc.selectAll('path.arc-path')
                .data(function (d) {
                    return d.shapes ? d.shapes : [];
                });

            // Enter
            path.enter().append('path')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('class', 'arc-path');

            // Update
            path
                .each(function (d) {
                    d = _this.updateAttr(d);
                    var element = d3.select(this);
                    angular.forEach(d.attr, function (val, key) {
                        element.attr(key, val);
                    });
                    angular.forEach(d.style, function (val, key) {
                        element.style(key, val);
                    });
                });

            // Exit
            path.exit().remove();

            // Exit
            gArc.exit().remove();
        };

        /**
         * Create range slider
         * @param select
         * @param selectAll
         * @param data
         * */
        _this.createRangeSlider = function (select, selectAll, data) {
            var gRangeSlider = select.selectAll('g.' + selectAll).data(function (d) {
                var shapeData = data ? [data] : [d];
                shapeData = shapeData.map(function (so) {
                    if (so.shapes && so.shapes.length) {
                        so.shapes = so.shapes.map(function (o, i) {
                            var name = o.name.split(' ').join('-').toLowerCase();
                            o.id = name + '-' + (i + 1);
                            o.spX = so.spX;
                            o.spY = so.spY;
                            o.epX = so.epX;
                            o.epY = so.epY;
                            o.height = so.height;
                            o.width = so.width;
                            o.min = so.min;
                            o.max = so.max;
                            o.handleSize = so.handleSize;
                            o.scale = so.scale;
                            return o;
                        });
                    }
                    return so;
                });
                return shapeData;
            });

            // Enter
            gRangeSlider.enter().append('g').attr('class', selectAll);

            // Update
            gRangeSlider.attr('class', selectAll);

            var path = gRangeSlider.selectAll('path.rs-path')
                .data(function (d) {
                    return d.shapes ? d.shapes : [];
                });

            // Enter
            path.enter().append('path')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('class', 'rs-path');

            // Update
            path
                .each(function (d) {
                    d = _this.updateAttr(d);
                    var element = d3.select(this);
                    angular.forEach(d.attr, function (val, key) {
                        element.attr(key, val);
                    });
                    angular.forEach(d.style, function (val, key) {
                        element.style(key, val);
                    });
                });

            // Exit
            path.exit().remove();

            // Exit
            gRangeSlider.exit().remove();
        };

        /**
         * Update attr for element
         * */
        _this.updateAttr = function (shapeObj) {
            var h = 0, w = 0, r, rx, ry,
                x = shapeObj.x ? shapeObj.x : 0,
                y = shapeObj.y ? shapeObj.y : 0;
            var fnCalcRectAttr = function () {
                var attr = {};
                h = shapeObj.height;
                w = shapeObj.width;
                attr.x = x;
                attr.y = y;
                attr.height = h;
                attr.width = w;
                attr.d = 'M ' + x + ', ' + y + ' h ' + w + ' v ' + h + ' h ' + -w + ' v ' + -h + ' z';
                return attr;
            };
            switch (shapeObj.type) {
                case 'CIRCLE_OR_ELLIPSE':
                    r = Math.min(shapeObj.height, shapeObj.width) / 2;
                    rx = shapeObj.width; // Horizontal
                    ry = shapeObj.height; // Vertical
                    shapeObj.attr.d = 'M' + -(rx - r) + ',0a' + rx + ',' + ry +
                        ' 0 1,0 ' + (rx * 2) + ',0a' + rx + ',' + ry + ' 0 1,0 ' + -(rx * 2) + ',0';
                    break;

                case 'RECT':
                    shapeObj.attr = fnCalcRectAttr();
                    break;

                case 'STRAIGHT_LINE':
                    shapeObj.attr.d = line([[0, 0], [shapeObj.epX - shapeObj.spX, shapeObj.epY - shapeObj.spY]]);
                    break;

                case 'RANGE_SLIDER_LINE':
                    shapeObj.attr.d = line([[shapeObj.handleSize, shapeObj.height / 2], [shapeObj.width - shapeObj.handleSize, shapeObj.height / 2]]);
                    break;

                case 'RANGE_SLIDER_MIN_ELLIPSE':
                case 'RANGE_SLIDER_MAX_ELLIPSE':
                    var tx = (shapeObj.type === 'RANGE_SLIDER_MIN_ELLIPSE' ? shapeObj.scale(shapeObj.min) : shapeObj.scale(shapeObj.max));
                    r = shapeObj.handleSize; // 10% of height or width
                    rx = r; // Horizontal
                    ry = r; // Vertical
                    shapeObj.attr.transform = 'translate(' + (tx - shapeObj.handleSize) + ',' + shapeObj.height / 2 + ')';
                    shapeObj.attr.d = 'M' + -(rx - r) + ',0a' + rx + ',' + ry +
                        ' 0 1,0 ' + (rx * 2) + ',0a' + rx + ',' + ry + ' 0 1,0 ' + -(rx * 2) + ',0';
                    break;

                case 'TEXT':
                    shapeObj.attr.x = shapeObj.epX - shapeObj.spX;
                    shapeObj.attr.y = shapeObj.epY - shapeObj.spY;
                    break;

                case 'OUTER_ARC':
                case 'MAIN_ARC':
                    var outerRadius = Math.max(shapeObj.width, shapeObj.height);
                    var innerRadius = outerRadius - shapeObj.radius;
                    var startAngle, endAngle;
                    if (shapeObj.orientation === 'left') {
                        endAngle = -Math.PI / 2;
                        startAngle = endAngle + (Math.PI * (shapeObj.angle / 100));
                    } else {
                        endAngle = Math.PI / 2;
                        startAngle = endAngle - (Math.PI * (shapeObj.angle / 100));
                    }

                    var arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius)
                        .startAngle(function () {
                            return shapeObj.type === 'OUTER_ARC' ? -endAngle : startAngle;
                        })
                        .endAngle(function () {
                            return endAngle;
                        });
                    shapeObj.attr.d = arc(shapeObj);
                    break;

                case 'RESIZE_RECT':
                    shapeObj.attr = fnCalcRectAttr();
                    shapeObj.style = {
                        'fill': 'rgb(93, 162, 255, 0.5)', 'stroke-linecap': 'square', 'stroke': '#5da2ff',
                        'stroke-linejoin': 'round', 'stroke-width': 2, 'stroke-dasharray': '5, 5'
                    };
                    break;
                case 'FOREIGN_OBJECT_ICON':
                    shapeObj.attr.height = shapeObj.height;
                    shapeObj.attr.width = shapeObj.width;
                    shapeObj.html = '<i class="fa '+ shapeObj.valueIcon +'" style="font-size: '+ Math.max(shapeObj.height, shapeObj.width) +'px"></i>';
                    break;
            }
            return shapeObj;
        };

        /**
         * Sketchbook constructor.
         * @param options
         * */
        function Sketchbook(options) {
            sketchbook = this;
            this.setMargin(options ? options.margin : {});
            this.setParentElement(options && options.parentEle);
            this.setWidth(options && options.width);
            this.setHeight(options && options.height);
            this.setData(options && options.data);
            this.create();
        }

        /**
         * Create sketchbook
         * */
        Sketchbook.prototype.create = function () {
            _this.sbSvg = d3.select(_this.parentEle).append('svg').attr('id', 'sb').attr('class', 'sb')
                .on('mouseover', _this.onMouseOverSvgEvent)
                .on('mousedown', _this.onMouseDownSvgEvent)
                .on('click', function () {
                    _this.eraseResizeSelector();
                    sketchbook.onShapeClickCallback(sketchbook.onShapeClick);
                });
            d3.select("body")
                .on('keyup', function () {
                    if (d3.event && d3.event.keyCode === 46) {
                        var selectionPath = d3.select("#sb-container").selectAll("g").selectAll(".selection-path");
                        angular.forEach(selectionPath, function (data) {
                            if (data[0] && data[0].parentNode.__data__.id) {
                                d3.select("#" + data[0].parentNode.__data__.id).remove();
                                angular.forEach(_this.data, function (dataObj, index) {
                                    if (dataObj.id === data[0].parentNode.__data__.id) {
                                        _this.data.splice(index, 1);
                                    }
                                });
                                sketchbook.onShapeClickCallback(sketchbook.onShapeClick);
                            }
                        });
                    }
                });
            _this.sbZoom = _this.sbSvg.append('g').attr('id', 'sb-zoom').attr('class', 'sb-zoom');
            _this.sbContainer = _this.sbZoom.append('g').attr('id', 'sb-container').attr('class', 'sb-container');
            _this.sbSelector = _this.sbZoom.append('g').attr('id', 'sb-selector').attr('class', 'sb-selector');
            this.resize();
        };

        /**
         * Update sketchbook
         * @param data
         * */
        Sketchbook.prototype.update = function (data) {
            _this.createShapes(_this.sbContainer, data);
        };

        /**
         * Resize sketchbook
         * */
        Sketchbook.prototype.resize = function () {
            this.width = _this.width - _this.margin.left - _this.margin.right;
            this.height = _this.height - _this.margin.top - _this.margin.bottom;

            _this.sbSvg.attr('width', this.width + _this.margin.left + _this.margin.right)
                .attr('height', this.height + _this.margin.top + _this.margin.bottom);
            _this.sbContainer.attr('transform', 'translate(' + _this.margin.left + ',' + _this.margin.top + ')');
            _this.sbSelector.attr('transform', 'translate(' + _this.margin.left + ',' + _this.margin.top + ')');
        };

        Sketchbook.prototype.orderShape = function (data) {
            angular.forEach(data, function (dataObj, index) {
                dataObj.zIndex = index + 1;
            });
            this.update(data);
            _this.sbContainer.selectAll('g.shape')
                .sort(function (a, b) {
                    if (a.zIndex < b.zIndex) return -1;
                    else return 1;
                });
        };

        Sketchbook.prototype.highlightShape = function (isCalledForHighlight, dataObj, propertyObj) {
            _this.fnHighlightShape(isCalledForHighlight, dataObj, propertyObj);
        };

        /**
         * Set Margin
         * @param margin
         * */
        Sketchbook.prototype.setMargin = function (margin) {
            _this.margin = {
                top: margin && margin.top ? margin.top : 20,
                right: margin && margin.right ? margin.right : 20,
                bottom: margin && margin.bottom ? margin.bottom : 20,
                left: margin && margin.left ? margin.left : 20
            };
        };

        /**
         * Set Parrent element for append svg element
         * @param parentEle
         * */
        Sketchbook.prototype.setParentElement = function (parentEle) {
            _this.parentEle = parentEle ? parentEle : 'body';
        };

        /**
         * Set shape object
         * @param shapeObj
         * */
        Sketchbook.prototype.setShapeObj = function (shapeObj) {
            _this.shapeObj = shapeObj ? _this.clone(shapeObj) : null;
            if (!shapeObj) {
                sketchbook.removeSelectedShapeCallback(sketchbook.removeSelectedShape);
            }
        };

        /**
         * On shape click callback
         * @param callback
         * */
        Sketchbook.prototype.onShapeClickCallback = function (callback) {
            callback(arguments[1]);
        };

        /**
         * On shape click event
         * */
        Sketchbook.prototype.onShapeClick = function () {
        };

        /**
         * On shape click callback
         * @param callback
         * */
        Sketchbook.prototype.removeSelectedShapeCallback = function (callback) {
            callback(arguments[1]);
        };

        /**
         * On shape click event
         * */
        Sketchbook.prototype.removeSelectedShape = function () {
        };

        /**
         * Set width
         * @param width
         * */
        Sketchbook.prototype.setWidth = function (width) {
            _this.width = width ? width : 0;
        };

        /**
         * Set height
         * @param height
         * */
        Sketchbook.prototype.setHeight = function (height) {
            _this.height = height ? height : 0;
        };

        /**
         * Set data
         * @param data
         * */
        Sketchbook.prototype.setData = function (data) {
            _this.data = data ? data : [];
        };

        return Sketchbook;
    }
})();
