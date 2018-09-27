(function () {
    'use strict';

    angular
        .module('sketchbook')
        .directive('sketchbook', fnSketchbookDirective);

    /** @ngInject */
    function fnSketchbookDirective($timeout, d3, Sketchbook) {
        return {
            restrict: 'EA',
            scope: {},
            templateUrl: 'app/components/directives/sketchbook/sketchbook.html',
            link: function ($scope, element) {
                var drawContainerEle = element[0].querySelector('#draw-container');
                var drawContainerObj = angular.element(drawContainerEle)[0];
                var sketchbook = new Sketchbook({
                    parentEle: drawContainerEle,
                    width: drawContainerObj.clientWidth,
                    height: drawContainerObj.clientHeight
                });

                $scope.sortableOptions = {
                    scrollSensitivity: 50,
                    cursor: "move",
                    update: function () {
                    },
                    stop: function () {
                        //d3.select("#sb-container").selectAll("*").remove();
                        sketchbook.orderShape($scope.sbData.metadata);
                    }
                };

                $scope.selectedShapeObj = null;
                $scope.shapesArr = [
                    {
                        name: 'Rectangle',
                        type: 'RECT',
                        icon: 'fa-square-o',
                        attr: {},
                        style: {fill: 'transparent', stroke: '#000'}
                    },
                    {
                        name: 'Circle or Ellipse',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle-o',
                        attr: {},
                        style: {fill: 'transparent', stroke: '#000'}
                    },
                    {
                        name: 'Straight Line',
                        type: 'STRAIGHT_LINE',
                        icon: 'fa-minus',
                        attr: {},
                        style: {stroke: '#000', 'stroke-width': '1px'}
                    },
                    {
                        name: 'Range Slider',
                        type: 'RANGE_SLIDER',
                        icon: 'fa-sliders',
                        min: 20,
                        max: 40,
                        shapes: [
                            {
                                name: 'Range Slider Rectangle',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'transparent', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Line',
                                type: 'RANGE_SLIDER_LINE',
                                attr: {},
                                style: {'stroke-width': '15px', stroke: '#ff700b','stroke-linecap':"round"}
                            },
                            {
                                name: 'Range Slider Min',
                                type: 'RANGE_SLIDER_MIN_ELLIPSE',
                                attr: {},
                                style: {fill: '#fff', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Max',
                                type: 'RANGE_SLIDER_MAX_ELLIPSE',
                                attr: {},
                                style: {fill: '#fff', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Line Color',
                                type: 'RANGE_SLIDER_LINE_COLOR',
                                attr: {},
                                style: {'stroke-width': '15px', stroke: '#228B22'}
                            }
                        ]
                    }, {
                        name: 'Arc',
                        type: 'ARC',
                        icon: 'fa-pie-chart',
                        angle: 60,
                        radius: 10,
                        orientation: 'left',
                        shapes: [
                            {name: 'Outer Arc', type: 'OUTER_ARC', attr: {}, style: {fill: '#000'}},
                            {name: 'Main Arc', type: 'MAIN_ARC', attr: {}, style: {fill: 'red'}}
                        ]
                    }, {
                        name: 'Text', type: 'TEXT', icon: 'fa-font', text: 'Text', attr: {},
                        style: {
                            stroke: '#000',
                            'stroke-width': '1px',
                            'text-anchor': 'middle',
                            'font-size': 40,
                            'font-family': 'sans-serif'
                        }
                    }, {
                        name: 'Icon',
                        type: 'ICON',
                        icon: 'fa-font-awesome',
                        valueIcon: 'fa-times',
                        attr: {},
                        style: {fill: '#000', stroke: '#000'},
                        shapes: [
                            {
                                name: 'Foreign Object Icon', type: 'FOREIGN_OBJECT_ICON',
                                attr: {}, style: {fill: '#000'}
                            }
                        ]
                    }, {
                        name: 'Health',
                        type: 'HEALTH',
                        icon: 'fa-heartbeat',
                        healthCode: 200,
                        attr: {},
                        style: {},
                        shapes: [
                            {
                                name: 'Health Rect',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'green'}
                            }, {
                                name: 'Health Text',
                                type: 'Health_Text',
                                text: 'OK',
                                attr: {},
                                style: {
                                    stroke: '#000',
                                    'stroke-width': '1px',
                                    'text-anchor': 'middle',
                                    "dominant-baseline": "central",
                                    'font-size': 10,
                                    'font-family': 'sans-serif'}
                            }
                        ]
                    },
                    {
                        name: 'Stack',
                        type: 'STACK',
                        icon: 'fa-bar-chart',
                        value: 90,
                        min: 1,
                        max: 100,
                        orientation: 'vertical', //vertical and horizontal
                        shapes: [
                            {name: 'stack', type: 'STACK-CHART', attr: {}, style: {fill: '#000'}}
                        ]
                    }
                ];

                $scope.sbData = {data: {}, metadata: []};
                sketchbook.setData($scope.sbData.metadata);


                /*----- START: Set and Update Property ------*/
                sketchbook.onShapeClick = function (sketch) {
                    if (sketch) {
                        $scope.propertyObj = sketch;
                    } else {
                        $scope.propertyObj = null;
                    }
                    $scope.$apply();
                };

                $scope.fnUpdateProperties = function () {
                    sketchbook.update($scope.sbData.metadata, $scope.propertyObj);
                };
                /*----- END: Set and Update Property ------*/

                /*----- START: Highlight Elements ------*/
                $scope.fnHighlightShape = function (isCalledForHighlight, metaObj) {
                    sketchbook.highlightShape(isCalledForHighlight, metaObj, $scope.propertyObj);
                };
                /*----- END: Highlight Elements ------*/

                $scope.fnSetSelectedShape = function (shapeObj) {
                    $scope.selectedShapeObj = shapeObj;
                    sketchbook.setShapeObj(angular.fromJson(angular.toJson(shapeObj)));
                };

                sketchbook.removeSelectedShape = function () {
                    $scope.selectedShapeObj = null;
                    $timeout(function () {
                        $scope.$apply();
                    })
                };
            }
        }
    }
})();
