(function () {
    'use strict';

    angular
        .module('sketchbook')
        .directive('sketchbook', fnSketchbookDirective);

    /** @ngInject */
    function fnSketchbookDirective($timeout, d3, Sketchbook, GhostService) {
        return {
            restrict: 'EA',
            scope: {
                selectedAttributeObj: '=',
                fnSaveAttributeMetadata: '&',
                fnExitAttrEditView: '&'
            },
            templateUrl: 'app/components/directives/sketchbook/sketchbook.html',
            link: function ($scope, element) {
                var drawContainerEle = element[0].querySelector('#draw-container');
                var drawContainerObj = angular.element(drawContainerEle)[0];
                var sketchbook = new Sketchbook({
                    parentEle: drawContainerEle,
                    width: drawContainerObj.clientWidth,
                    height: drawContainerObj.clientHeight
                });

                var resetAttributeObj = angular.copy($scope.selectedAttributeObj);

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
                        attrType: 'Common',
                        attr: {},
                        style: {fill: 'transparent', stroke: '#000'}
                    },
                    {
                        name: 'Circle or Ellipse',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle-o',
                        attrType: 'Common',
                        attr: {},
                        style: {fill: 'transparent', stroke: '#000'}
                    },
                    {
                        name: 'Straight Line',
                        type: 'STRAIGHT_LINE',
                        icon: 'fa-minus',
                        attrType: 'Common',
                        attr: {},
                        style: {stroke: '#000', 'stroke-width': '1px'}
                    },
                    {
                        name: 'Title Text', type: 'TITLE_TEXT', icon: 'fa-header', text: 'Title', attr: {},
                        attrType: 'Common',
                        style: {
                            stroke: '#000',
                            'stroke-width': '1px',
                            'text-anchor': 'middle',
                            'dominant-baseline': 'central',
                            'font-size': 10,
                            'font-family': 'sans-serif'
                        },
                        shapes: [
                            {
                                name: 'Title Rect',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'transparent'}
                            }, {
                                name: 'Title Text',
                                type: 'Title_Text',
                                text: 'Title',
                                attr: {},
                                style: {
                                    stroke: '#000',
                                    'stroke-width': '1px',
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            }
                        ]
                    },
                    {
                        name: 'Value Text', type: 'VALUE_TEXT', icon: 'fa-text-width', text: '10', attr: {},
                        attrType: 'Common',
                        style: {
                            stroke: '#000',
                            'stroke-width': '1px',
                            'text-anchor': 'middle',
                            'dominant-baseline': 'central',
                            'font-size': 10,
                            'font-family': 'sans-serif'
                        },
                        shapes: [
                            {
                                name: 'Value Rect',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'transparent'}
                            }, {
                                name: 'Value Text',
                                type: 'Value_Text',
                                text: '10',
                                attr: {},
                                style: {
                                    stroke: '#000',
                                    'stroke-width': '1px',
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            }
                        ]
                    },
                    {
                        name: 'Rectangle LED',
                        type: 'RECT',
                        icon: 'fa-square',
                        attrType: 'LED',
                        attr: {},
                        style: {fill: 'red', stroke: 'red'}
                    },
                    {
                        name: 'Circle or Ellipse LED',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle',
                        attrType: 'LED',
                        attr: {},
                        style: {fill: 'red', stroke: 'red'}
                    },
                    {
                        name: 'Range Slider',
                        type: 'RANGE_SLIDER',
                        icon: 'fa-sliders',
                        attrType: 'Range Slider',
                        min: 10,
                        max: 40,
                        shapes: [
                            {
                                name: 'Range Slider Rectangle',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'transparent', stroke: '#000'}
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
                            },
                            {
                                name: 'Range Slider Min Line Color',
                                type: 'RANGE_SLIDER_MIN_LINE_COLOR',
                                attr: {},
                                style: {'stroke-width': '15px', stroke: '#fff01a'}
                            },
                            {
                                name: 'Range Slider Max Line Color',
                                type: 'RANGE_SLIDER_MAX_LINE_COLOR',
                                attr: {},
                                style: {'stroke-width': '15px', stroke: '#26ff0a'}
                            }
                        ]
                    }, {
                        name: 'Arc',
                        type: 'ARC',
                        icon: 'fa-pie-chart',
                        attrType: 'Gauge',
                        angle: 60,
                        radius: 10,
                        orientation: 'left',
                        shapes: [
                            {name: 'Outer Arc', type: 'OUTER_ARC', attr: {}, style: {fill: '#000'}},
                            {name: 'Main Arc', type: 'MAIN_ARC', attr: {}, style: {fill: 'red'}}
                        ]
                    }, {
                        name: 'Text', type: 'TEXT', icon: 'fa-font', text: 'Text', attr: {},
                        attrType: 'Text',
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
                        attrType: 'Icon',
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
                        attrType: 'Common',
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
                                    'font-family': 'sans-serif'
                                }
                            }
                        ]
                    },
                    {
                        name: 'Stack',
                        type: 'STACK',
                        icon: 'fa-bar-chart',
                        attrType: 'Stack',
                        value: 90,
                        min: 1,
                        max: 100,
                        orientation: 'vertical', //vertical and horizontal
                        shapes: [
                            {name: 'stack', type: 'STACK-CHART', attr: {}, style: {fill: '#000'}}
                        ]
                    },
                    {
                        name: 'Toggle',
                        type: 'TOGGLE',
                        icon: 'fa-toggle-on',
                        attrType: 'Toggle',
                        value: true,
                        shapes: [
                            {
                                name: 'Toggle-switch',
                                type: 'TOGGLE-SWITCH',
                                attr: {},
                                style: {fill: 'transparent', stroke: '#000'}
                            }
                        ]
                    }
                ];

                $scope.sbData = {
                    data: $scope.selectedAttributeObj,
                    metadata: $scope.selectedAttributeObj.metadata
                };

                angular.forEach($scope.shapesArr, function (shapeObj) {
                    if (shapeObj.attrType === $scope.sbData.data.display) {
                        if (shapeObj.attrType === 'Stack') {
                            shapeObj.value = $scope.sbData.data.value;
                            shapeObj.min = $scope.sbData.data.options.min;
                            shapeObj.max = $scope.sbData.data.options.max;
                            shapeObj.orientation = $scope.sbData.data.options.stackType;
                            shapeObj.shapes[0].style.fill = GhostService.fnGetColor($scope.sbData.data.options, $scope.sbData.data.value);
                        } else if (shapeObj.attrType === 'Gauge') {
                            shapeObj.angle = $scope.sbData.data.value;
                            shapeObj.min = $scope.sbData.data.options.min;
                            shapeObj.max = $scope.sbData.data.options.max;
                            shapeObj.shapes[1].style.fill = GhostService.fnGetColor($scope.sbData.data.options, $scope.sbData.data.value);
                        } else if (shapeObj.attrType === 'Icon') {
                            shapeObj.valueIcon = GhostService.fnGetIconValue($scope.sbData.data.options, $scope.sbData.data.value)
                        } else if (shapeObj.attrType === 'Range Slider') {
                            console.log("range slider");
                        } else if (shapeObj.attrType === 'Toggle') {
                            console.log("toggle");
                        } else if (shapeObj.attrType === 'Led') {
                            console.log("led");
                        }
                    } else if (shapeObj.attrType === 'Common' && shapeObj.type === 'HEALTH') {
                        shapeObj.healthCode = $scope.sbData.data.healthCode;
                        shapeObj.shapes[0].style.fill = $scope.sbData.data.healthColor;
                        shapeObj.shapes[1].text = $scope.sbData.data.health;
                    }
                });
                sketchbook.setData($scope.sbData.metadata);

                /*START: Attribute*/
                $scope.fnSaveAttribute = function () {
                    $scope.fnExitAttrEditView();
                };

                $scope.fnExitAttributeEdit = function () {
                    $scope.selectedAttributeObj = angular.copy(resetAttributeObj);
                    $scope.fnExitAttrEditView({attrObj: $scope.selectedAttributeObj});
                };
                /*END: Attribute*/


                /*----- START: Set and Update Property ------*/
                sketchbook.onShapeClick = function (sketch) {
                    if (sketch) {
                        if (sketch.type === "TITLE_TEXT") {
                            $scope.propertyObj = sketch;
                            $scope.propertyObj.style = sketch.shapes[1].style;
                            $scope.propertyObj.text = sketch.shapes[1].text;
                        } else {
                            $scope.propertyObj = sketch;
                        }
                    } else {
                        $scope.propertyObj = null;
                    }
                    $scope.$apply();
                };

                $scope.fnUpdateProperties = function () {
                    if ($scope.propertyObj.type === "TITLE_TEXT") {
                        $scope.propertyObj.shapes[1].style = $scope.propertyObj.style;
                        $scope.propertyObj.shapes[1].text = $scope.propertyObj.text;
                    }
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
