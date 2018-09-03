(function () {
    'use strict';

    angular
        .module('sketchbook')
        .directive('sketchbook', fnSketchbookDirective);

    /** @ngInject */
    function fnSketchbookDirective(d3) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/components/directives/sketchbook/sketchbook.html',
            link: function ($scope, element) {

                var margin = {top: 20, right: 20, bottom: 20, left: 20};
                var sbSvg, sbWidth, sbHeight, sbZoom, sbContainer, sbSelector, cSelShapeObj = null;
                var drawContainerEle = element[0].querySelector('#draw-container');
                var drawContainerObj = angular.element(drawContainerEle)[0];
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
                        var newEndPoint = d3.mouse(sbSelector.node());
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
                                    d = fnCalShapeHW(d);
                                    break;
                            }
                            fnCreateShapePath(d3.select(this.parentNode), 'shape-path', d);
                            fnUpdateResize(d3.select(this.parentNode).select('path.shape-path'), d);
                        }
                    });
                var line = d3.svg.line()
                    .x(function (d) {
                        return d[0];
                    })
                    .y(function (d) {
                        return d[1];
                    });

                $scope.selectedShapeObj = null;
                $scope.shapesArr = [
                    {name: 'rect', type: 'RECT', icon: 'fa-square-o', attr: {}, style: {fill: 'transparent', stroke: '#000'}},
                    {name: 'circle', type: 'CIRCLE_OR_ELLIPSE', icon: 'fa-circle-o', attr: {}, style: {fill: 'transparent', stroke: '#000'}},
                    {name: 'line', type: 'STRAIGHT_LINE', icon: 'fa-minus', attr: {}, style: {stroke: '#000', 'stroke-width': '1px'}},
                    {name: 'text', type: 'TEXT', icon: 'fa-font', text: 'Text', attr: {},
                        style: {stroke: '#000', 'stroke-width': '1px', 'text-anchor': 'middle', 'font-size': 40, 'font-family':'sans-serif'}}
                ];

                $scope.sbData = {data: {}, metadata: []};

                /**
                 * Update sketchbook
                 * */
                $scope.fnUpdate = function (data) {
                    fnCreateShapes(sbContainer, data);
                };


                /*----- START: Set and Update Property ------*/
                $scope.fnSelectPropertyObj = function (sketch) {
                    if (sketch) {
                        $scope.propertyObj = sketch;
                    } else {
                        $scope.propertyObj = null;
                    }
                    $scope.$apply();
                };

                $scope.fnUpdateProperties = function () {
                    $scope.fnUpdate($scope.sbData.metadata);
                };
                /*----- END: Set and Update Property ------*/

                /**
                 * Resize sketchbook
                 * */
                $scope.fnResize = function () {
                    sbWidth = drawContainerObj.clientWidth - margin.left - margin.right;
                    sbHeight = drawContainerObj.clientHeight - margin.top - margin.bottom;

                    sbSvg.attr('width', sbWidth + margin.left + margin.right)
                        .attr('height', sbHeight + margin.top + margin.bottom);
                    sbContainer.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                    sbSelector.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                };

                /**
                 * Create sketchbook
                 * */
                $scope.fnCreate = function () {
                    sbSvg = d3.select(drawContainerEle).append('svg').attr('id', 'sb').attr('class', 'sb')
                        .on('mousedown', fnOnMouseDownSvgEvent)
                        .on('click', fnEraseResizeSelector);
                    sbZoom = sbSvg.append('g').attr('id', 'sb-zoom').attr('class', 'sb-zoom');
                    sbContainer = sbZoom.append('g').attr('id', 'sb-container').attr('class', 'sb-container');
                    sbSelector = sbZoom.append('g').attr('id', 'sb-selector').attr('class', 'sb-selector');

                    $scope.fnResize();
                };

                $scope.fnCreate();

                $scope.fnSetSelectedShape = function (shapeObj) {
                    sbSvg.style('cursor', 'crosshair');
                    $scope.selectedShapeObj = shapeObj;
                };

                /*----- START: Create Shapes -----*/
                function fnCreateShapes(ele, data) {
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
                            fnEraseResizeSelector();
                            if (d.type !== 'TEXT') {
                                fnUpdateResize(d3.select(this).select('path.shape-path'), d);
                            }
                            $scope.fnSelectPropertyObj(d);
                        })
                        .call(shapeDrag);

                    // Update
                    shape
                        .attr('transform', function (d) {
                            return 'translate(' + d.spX + ',' + d.spY + ')';
                        });

                    angular.forEach(data, function (d) {
                        if (d.type === 'TEXT') {
                            fnCreateTextElem(shape, 'shape-text');
                        } else {
                            fnCreateShapePath(shape, 'shape-path');
                        }
                    });

                    // Exit
                    shape.exit().remove();
                }

                /*----- END: Create Shape -----*/

                /*----- START: Create Text -----*/
                function fnCreateTextElem(select, selectAll, data) {
                    var text = select.selectAll('text.' + selectAll).data(function (d) {
                        return data ? [data] : [d];
                    });

                    // Enter
                    text.enter().append('text').attr('class', selectAll);

                    // Update
                    text
                        .each(function (d) {
                            d = fnUpdateAttr(d);
                            var element = d3.select(this);
                            angular.forEach(d.attr, function (val, key) {
                                element.attr(key, val);
                            });
                            angular.forEach(d.style, function (val, key) {
                                element.style(key, val);
                            });
                            if(d.text) {
                                element.text(d.text);
                            }
                        });

                    // Exit
                    text.exit().remove();
                }
                /*----- END: Create Text -----*/

                /*----- START: Create Shape Path -----*/
                function fnCreateShapePath(select, selectAll, data) {
                    var path = select.selectAll('path.' + selectAll).data(function (d) {
                        return data ? [data] : [d];
                    });

                    // Enter
                    path.enter().append('path').attr('class', selectAll);

                    // Update
                    path
                        .each(function (d) {
                            d = fnUpdateAttr(d);
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
                }

                /*----- END: Create Shape Path -----*/

                /*----- START: Create Shape Resize -----*/
                function fnCreateShapeResize(select, selectAll, data) {
                    var circle = select.selectAll('circle.' + selectAll).data(function (d) {
                        return data ? [data] : [d];
                    });

                    // Enter
                    circle.enter().append('circle').attr('class', selectAll).call(shapeResize);

                    // Update
                    circle
                        .attr('cx', function (d) {
                            return d.width + d.x;
                        })
                        .attr('cy', function (d) {
                            return d.height + d.y;
                        })
                        .attr('r', 7)
                        .style('cursor', 'nwse-resize')
                        .style('fill', '#5da2ff');

                    // Exit
                    circle.exit().remove();
                }

                /*----- END: Create Shape Resize -----*/

                /*----- START: Update Shape Resize -----*/
                function fnUpdateResize(ele, d) {
                    var bound = ele.node().getBBox();
                    d.height = bound.height;
                    d.width = bound.width;
                    d.x = bound.x;
                    d.y = bound.y;
                    fnCreateShapeResize(d3.select(ele[0][0].parentNode), 'resize-circle', d);
                    var rectData = angular.copy(d);
                    rectData.type = 'RESIZE_RECT';
                    fnCreateShapePath(d3.select(ele[0][0].parentNode), 'selection-path', rectData);
                }

                /*----- END: Update Shape Resize -----*/

                function fnEraseResizeSelector() {
                    d3.selectAll('path.selection-path').remove();
                    d3.selectAll('circle.resize-circle').remove();
                    $scope.propertyObj = null;
                    $scope.$apply();
                }

                /*----- START: SVG Events -----*/
                function fnOnMouseDownSvgEvent() {
                    d3.event.stopPropagation();
                    if (d3.event.type === 'mousedown' && $scope.selectedShapeObj) {
                        cSelShapeObj = angular.copy($scope.selectedShapeObj);
                        cSelShapeObj.id = 'shape' + Date.now();
                        var mPoint = d3.mouse(sbSelector.node());
                        cSelShapeObj.spX = mPoint[0];
                        cSelShapeObj.spY = mPoint[1];
                        sbSvg.on('mousemove', fnOnMouseMoveSvgEvent);
                        sbSvg.on('mouseup', fnIgnoreSvgEvents);
                        sbSvg.on('mouseleave', fnIgnoreSvgEvents);
                    }
                }

                function fnOnMouseMoveSvgEvent() {
                    d3.event.stopPropagation();
                    var type = d3.event.type;
                    if (type === 'mousemove') {
                        var mPoint = d3.mouse(sbSelector.node());
                        if (d3.event.shiftKey) {
                            cSelShapeObj.epX = Math.max(mPoint[0], mPoint[1]);
                            cSelShapeObj.epY = cSelShapeObj.spY - cSelShapeObj.spX + Math.max(mPoint[0], mPoint[1]);
                        } else {
                            cSelShapeObj.epX = mPoint[0];
                            cSelShapeObj.epY = mPoint[1];
                        }
                        switch (cSelShapeObj.type) {
                            case 'CIRCLE_OR_ELLIPSE':
                            case 'RECT':
                                cSelShapeObj = fnCalShapeHW(cSelShapeObj);
                                break;
                        }
                        fnCreateShapes(sbSelector, [cSelShapeObj]);
                    }
                }

                function fnIgnoreSvgEvents() {
                    d3.event.stopPropagation();
                    d3.select('#' + cSelShapeObj.id).remove();
                    sbSvg.style('cursor', 'default');
                    $scope.selectedShapeObj = null;
                    $scope.$apply();
                    sbSvg.on('mousemove', null);
                    sbSvg.on('mouseup', null);
                    sbSvg.on('mouseleave', null);
                    if (cSelShapeObj && cSelShapeObj.epX && cSelShapeObj.epY) {
                        $scope.sbData.metadata.push(angular.copy(cSelShapeObj));
                        $scope.fnUpdate($scope.sbData.metadata);
                        cSelShapeObj = null;
                    }
                }

                /*----- END: SVG Events -----*/

                function fnCalShapeHW(cSelShapeObj) {
                    cSelShapeObj.height = cSelShapeObj.epY - cSelShapeObj.spY;
                    cSelShapeObj.width = cSelShapeObj.epX - cSelShapeObj.spX;
                    return cSelShapeObj;
                }

                function fnUpdateAttr(cSelShapeObj) {
                    var h = 0, w = 0,
                        x = cSelShapeObj.x ? cSelShapeObj.x : 0,
                        y = cSelShapeObj.y ? cSelShapeObj.y : 0;
                    var fnCalcRectAttr = function (attr) {
                        h = cSelShapeObj.height;
                        w = cSelShapeObj.width;
                        attr.x = x;
                        attr.y = y;
                        attr.height = h;
                        attr.width = w;
                        attr.d = 'M ' + x + ', ' + y + ' h ' + w + ' v ' + h + ' h ' + -w + ' v ' + -h + ' z';
                        return attr;
                    };
                    switch (cSelShapeObj.type) {
                        case 'CIRCLE_OR_ELLIPSE':
                            var r = Math.min(cSelShapeObj.height, cSelShapeObj.width) / 2;
                            var rx = cSelShapeObj.width; // Horizontal
                            var ry = cSelShapeObj.height; // Vertical
                            cSelShapeObj.attr.d = 'M' + -(rx - r) + ',0a' + rx + ',' + ry +
                                ' 0 1,0 ' + (rx * 2) + ',0a' + rx + ',' + ry + ' 0 1,0 ' + -(rx * 2) + ',0';
                            break;

                        case 'RECT':
                            cSelShapeObj.attr = fnCalcRectAttr(cSelShapeObj);
                            break;

                        case 'STRAIGHT_LINE':
                            cSelShapeObj.attr.d = line([[0, 0],
                                [cSelShapeObj.epX - cSelShapeObj.spX, cSelShapeObj.epY - cSelShapeObj.spY]]);
                            break;

                        case 'TEXT':
                            cSelShapeObj.attr.x = cSelShapeObj.epX - cSelShapeObj.spX;
                            cSelShapeObj.attr.y = cSelShapeObj.epY - cSelShapeObj.spY;
                            break;

                        case 'RESIZE_RECT':
                            cSelShapeObj.attr = fnCalcRectAttr(cSelShapeObj);
                            cSelShapeObj.style = {
                                'fill': 'rgb(93, 162, 255, 0.5)', 'stroke-linecap': 'square', 'stroke': '#5da2ff',
                                'stroke-linejoin': 'round', 'stroke-width': 2, 'stroke-dasharray': '5, 5'
                            };
                            break;
                    }
                    return cSelShapeObj;
                }
            }
        }
    }
})();
