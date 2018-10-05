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
                        style: {fill: 'transparent', stroke: '#000', 'stroke-width': '1px'}
                    }, {
                        name: 'Circle or Ellipse',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle-o',
                        attrType: 'Common',
                        attr: {},
                        style: {fill: 'transparent', stroke: '#000', 'stroke-width': '1px'}
                    }, {
                        name: 'Straight Line',
                        type: 'STRAIGHT_LINE',
                        icon: 'fa-minus',
                        attrType: 'Common',
                        attr: {},
                        style: {stroke: '#000', 'stroke-width': '1px'}
                    }, {
                        name: 'Text', type: 'TEXT', icon: 'fa-font', text: 'Text', attr: {},
                        attrType: 'Common',
                        style: {
                            stroke: '#000',
                            'stroke-width': '1px',
                            'text-anchor': 'middle',
                            'font-size': 10,
                            'font-family': 'sans-serif'
                        },
                        shapes: [
                            {
                                name: 'Text Rect',
                                type: 'RECT',
                                attr: {},
                                style: {fill: 'transparent'}
                            }, {
                                name: 'Text Text',
                                type: 'Text_Text',
                                text: 'Text',
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
                    }, {
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
                    }, {
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
                    }, {
                        name: 'Rectangle LED',
                        type: 'RECT',
                        icon: 'fa-square',
                        attrType: 'LED',
                        attr: {},
                        style: {fill: 'red', stroke: 'red'}
                    }, {
                        name: 'Circle or Ellipse LED',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle',
                        attrType: 'LED',
                        attr: {},
                        style: {fill: 'red', stroke: 'red'}
                    }, {
                        name: 'Range Slider',
                        type: 'RANGE_SLIDER',
                        icon: 'fa-sliders',
                        attrType: 'Range Slider',
                        min: 0,
                        max: 100,
                        minThreshold: 10,
                        maxThreshold: 60,
                        value: 5,
                        units:'%',
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
                            },
                            {
                                name: 'Range Slider Min Threshold Value Rect',
                                type: 'RANGE_SLIDER_MIN_THRESHOLD_VALUE_RECT',
                                attr: {},
                                style: {fill: '#fff', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Min Threshold Value Text',
                                type: 'RANGE_SLIDER_MIN_THRESHOLD_VALUE_TEXT',
                                text: '0',
                                attr: {},
                                style: {
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            },
                            {
                                name: 'Range Slider Max Threshold Value Rect',
                                type: 'RANGE_SLIDER_MAX_THRESHOLD_VALUE_RECT',
                                attr: {},
                                style: {fill: '#fff', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Max Threshold Value Text',
                                type: 'RANGE_SLIDER_MAX_THRESHOLD_VALUE_TEXT',
                                text: '0',
                                attr: {},
                                style: {
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            },
                            {
                                name: 'Range Slider Value Rect',
                                type: 'RANGE_SLIDER_VALUE_RECT',
                                attr: {},
                                style: {fill: '#fff', stroke: '#000'}
                            },
                            {
                                name: 'Range Slider Value Text',
                                type: 'RANGE_SLIDER_VALUE_TEXT',
                                text: '0',
                                attr: {},
                                style: {
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            },
                            {
                                name: 'Range Slider Min Value Text',
                                type: 'RANGE_SLIDER_MIN_VALUE_TEXT',
                                text: '0',
                                attr: {},
                                style: {
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            },
                            {
                                name: 'Range Slider Max Value Text',
                                type: 'RANGE_SLIDER_MAX_VALUE_TEXT',
                                text: '0',
                                attr: {},
                                style: {
                                    'text-anchor': 'middle',
                                    'dominant-baseline': 'central',
                                    'font-size': 10,
                                    'font-family': 'sans-serif'
                                }
                            },
                            {
                                name: 'Range Slider Value Line Indicator',
                                type: 'RANGE_SLIDER_VALUE_LINE_INDICATOR',
                                attr: {},
                                style: {'stroke-width': '15px', stroke: '#A9A9A9'}
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
                    }, {
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
                            shapeObj.shapes[1].min = $scope.sbData.data.options.min;
                            shapeObj.shapes[1].max = $scope.sbData.data.options.max;
                        } else if (shapeObj.attrType === 'Icon') {
                            shapeObj.valueIcon = GhostService.fnGetIconValue($scope.sbData.data.options, $scope.sbData.data.value)
                        } else if (shapeObj.attrType === 'Range Slider') {
                            shapeObj.units = $scope.sbData.data.units;
                            shapeObj.value = $scope.sbData.data.value;
                            shapeObj.min = $scope.sbData.data.options.min;
                            shapeObj.max = $scope.sbData.data.options.max;
                            shapeObj.minThreshold = $scope.sbData.data.options.minThresholdValue;
                            shapeObj.maxThreshold = $scope.sbData.data.options.maxThresholdValue;
                            shapeObj.shapes[3].style.stroke = GhostService.fnGetColor($scope.sbData.data.options, $scope.sbData.data.value);
                            shapeObj.shapes[4].style.stroke = $scope.sbData.data.options.minThresholdColor;
                            shapeObj.shapes[5].style.stroke = $scope.sbData.data.options.maxThresholdColor;
                            shapeObj.shapes[13].units = $scope.sbData.data.units;
                        } else if (shapeObj.attrType === 'Toggle') {
                            var toggleObj = GhostService.fnGetToggleValue($scope.sbData.data.options, $scope.sbData.data.value);
                            shapeObj.value = toggleObj.switchValue;
                        } else if (shapeObj.attrType === 'LED') {
                            shapeObj.style.fill = GhostService.fnGetColor($scope.sbData.data.options, $scope.sbData.data.value);
                            shapeObj.style.stroke = GhostService.fnGetColor($scope.sbData.data.options, $scope.sbData.data.value);
                        }
                    } else if (shapeObj.attrType === 'Common' && shapeObj.type === 'HEALTH') {
                        shapeObj.healthCode = $scope.sbData.data.healthCode;
                        shapeObj.shapes[0].style.fill = $scope.sbData.data.healthColor;
                        shapeObj.shapes[1].text = $scope.sbData.data.health;
                    } else if (shapeObj.attrType === 'Common' && shapeObj.type === 'TITLE_TEXT') {
                        shapeObj.text = $scope.sbData.data.title;
                        shapeObj.shapes[1].text = $scope.sbData.data.title;
                    } else if (shapeObj.attrType === 'Common' && shapeObj.type === 'VALUE_TEXT') {
                        if ($scope.sbData.data.display === 'Toggle') {
                            var textObj = GhostService.fnGetToggleValue($scope.sbData.data.options, $scope.sbData.data.value);
                            shapeObj.text = textObj.displayText;
                            shapeObj.shapes[1].text = textObj.displayText;
                        } else {
                            shapeObj.text = $scope.sbData.data.value;
                            shapeObj.shapes[1].text = $scope.sbData.data.value;
                        }
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
                    }else if($scope.propertyObj.type === "TEXT"){
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
