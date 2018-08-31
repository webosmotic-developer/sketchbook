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
                        d.startPoint = [d.startPoint[0] + d3.event.dx, d.startPoint[1] + d3.event.dy];
                        d3.select(this).attr('transform', function (d) {
                            return 'translate(' + d.startPoint[0] + ',' + d.startPoint[1] + ')';
                        });
                    });

                var shapeResize = d3.behavior.drag()
                    .on('dragstart', function () {
                        d3.event.sourceEvent.stopPropagation();
                    })
                    .on('drag', function (d) {
                        var newEndPoint = d3.mouse(sbSelector.node());
                        var h = newEndPoint[1] - d.startPoint[1];
                        var w = newEndPoint[0] - d.startPoint[0];
                        if (d.startPoint[0] < newEndPoint[0] && d.startPoint[1] < newEndPoint[1]) {
                            d.attr.radius = Math.min(h, w) / 2;
                            d.attr.height = h;
                            d.attr.width = w;
                            fnCreateShapePath(d3.select(this.parentNode), 'shape-path', d);

                            var copyData = angular.copy(d);
                            copyData.name = 'rect';
                            copyData.style = {
                                'fill': 'rgb(93, 162, 255, 0.5)', 'stroke-linecap': 'square', 'stroke': '#5da2ff',
                                'stroke-linejoin': 'round', 'stroke-width': 2, 'stroke-dasharray': '5, 5'
                            };
                            fnCreateShapePath(d3.select(this.parentNode), 'selection-path', copyData);

                            d3.select(this).attr('cx', w);
                            d3.select(this).attr('cy', h);
                        }
                    });

                $scope.selectedShapeObj = null;
                $scope.shapesArr = [
                    {name: 'rect', icon: 'fa-square-o', attr: {}, style: {}},
                    {name: 'circle', icon: 'fa-circle-o', attr: {}, style: {}}
                ];

                $scope.sbData = {data: {}, metadata: []};

                /**
                 * Update sketchbook
                 * */
                $scope.fnUpdate = function (data) {
                    fnCreateShapes(sbContainer, data);
                };

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
                        .on('click', function () {
                            d3.selectAll('path.selection-path').remove();
                            d3.selectAll('circle.resize-circle').remove();
                        });
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
                            return 'translate(' + d.startPoint[0] + ',' + d.startPoint[1] + ')';
                        })
                        .on('click', function (d) {
                            d3.event.stopPropagation();
                            var bound = d3.select(this).select('path.shape-path').node().getBBox();
                            d.attr.x = bound.x;
                            d.attr.y = bound.y;
                            d.attr.height = bound.height;
                            d.attr.width = bound.width;
                            fnCreateShapeResize(d3.select(this), 'resize-circle', d);
                            var rectData = angular.copy(d);
                            rectData.name = 'rect';
                            rectData.style = {
                                'fill': 'rgb(93, 162, 255, 0.5)', 'stroke-linecap': 'square', 'stroke': '#5da2ff',
                                'stroke-linejoin': 'round', 'stroke-width': 2, 'stroke-dasharray': '5, 5'
                            };
                            fnCreateShapePath(d3.select(this), 'selection-path', rectData);
                        })
                        .call(shapeDrag);

                    // Update
                    shape
                        .attr('transform', function (d) {
                            return 'translate(' + d.startPoint[0] + ',' + d.startPoint[1] + ')';
                        });

                    fnCreateShapePath(shape, 'shape-path');

                    // Exit
                    shape.exit().remove();
                }

                /*----- END: Create Shape -----*/

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
                            fnCreatePathString(d);
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

                /*----- START: Create Path d attr value-----*/
                function fnCreatePathString(d) {
                    var attr = d.attr;
                    switch (d.name) {
                        case 'circle':
                            var r = attr.radius;
                            attr.d = 'M ' + r + ',' + r + ' m ' + -r + ', 0 a ' + r + ',' + r + ' 0 1,0 '
                                + r * 2 + ',0 a ' + r + ',' + r + ' 0 1,0 ' + -r * 2 + ',0';
                            break;

                        case 'rect':
                            var h = attr.height, w = attr.width, x = attr.x, y = attr.y;
                            attr.d = 'M ' + x + ', ' + y + ' h ' + w + ' v ' + h + ' h ' + -w + ' v ' + -h + ' z';
                            break;
                        default:
                            attr.d = null;
                    }
                }

                /*----- END: Create Path d attr value-----*/

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
                            return d.attr.width;
                        })
                        .attr('cy', function (d) {
                            return d.attr.height;
                        })
                        .attr('r', 5)
                        .style('cursor', 'nwse-resize')
                        .style('fill', '#5da2ff');

                    // Exit
                    circle.exit().remove();
                }

                /*----- END: Create Shape Resize -----*/


                function fnOnMouseDownSvgEvent() {
                    d3.event.stopPropagation();
                    if (d3.event.type === 'mousedown' && $scope.selectedShapeObj) {
                        cSelShapeObj = angular.copy($scope.selectedShapeObj);
                        cSelShapeObj.id = 'shape' + Date.now();
                        cSelShapeObj.startPoint = d3.mouse(sbSelector.node());
                        sbSvg.on('mousemove', fnOnMouseMoveSvgEvent);
                        sbSvg.on('mouseup', fnIgnoreSvgEvents);
                        sbSvg.on('mouseleave', fnIgnoreSvgEvents);
                    }
                }

                function fnOnMouseMoveSvgEvent() {
                    d3.event.stopPropagation();
                    var type = d3.event.type;
                    if (type === 'mousemove') {
                        cSelShapeObj.endPoint = d3.mouse(sbSelector.node());
                        fnCreateShapes(sbSelector, [fnReturnShapeData(cSelShapeObj)]);
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
                    if (cSelShapeObj && cSelShapeObj.endPoint) {
                        $scope.sbData.metadata.push(fnReturnShapeData(cSelShapeObj));
                        $scope.fnUpdate($scope.sbData.metadata);
                        cSelShapeObj = null;
                    }
                }

                function fnCalShapeHW(cSelShapeObj) {
                    var sPoint = cSelShapeObj.startPoint;
                    var ePoint = cSelShapeObj.endPoint;
                    var height = ePoint[1] - sPoint[1];
                    var width = ePoint[0] - sPoint[0];
                    return {height: height, width: width};
                }

                function fnReturnShapeData(cSelShapeObj) {
                    var hw = fnCalShapeHW(cSelShapeObj);
                    var h = hw.height;
                    var w = hw.width;
                    cSelShapeObj.style = {fill: 'transparent', stroke: '#000'};
                    switch (cSelShapeObj.name) {
                        case 'circle':
                            var r = Math.min(h, w) / 2;
                            cSelShapeObj.attr.radius = r;
                            cSelShapeObj.attr.height = h;
                            cSelShapeObj.attr.width = w;
                            break;

                        case 'rect':
                            cSelShapeObj.attr.x = 0;
                            cSelShapeObj.attr.y = 0;
                            cSelShapeObj.attr.height = h;
                            cSelShapeObj.attr.width = w;
                            break;
                    }
                    return cSelShapeObj;
                }
            }
        }
    }
})();
