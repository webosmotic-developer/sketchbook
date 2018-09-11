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
                    width:  drawContainerObj.clientWidth,
                    height:  drawContainerObj.clientHeight
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
                        name: 'rect',
                        type: 'RECT',
                        icon: 'fa-square-o',
                        attr: {},
                        style: { fill: 'transparent', stroke: '#000' }
                    },
                    {
                        name: 'circle',
                        type: 'CIRCLE_OR_ELLIPSE',
                        icon: 'fa-circle-o',
                        attr: {},
                        style: { fill: 'transparent', stroke: '#000' }
                    },
                    {
                        name: 'line',
                        type: 'STRAIGHT_LINE',
                        icon: 'fa-minus',
                        attr: {},
                        style: { stroke: '#000', 'stroke-width': '1px' }
                    },
                    {
                        name: 'text', type: 'TEXT', icon: 'fa-font', text: 'Text', attr: {},
                        style: {
                            stroke: '#000',
                            'stroke-width': '1px',
                            'text-anchor': 'middle',
                            'font-size': 40,
                            'font-family': 'sans-serif'
                        }
                    }
                ];

                $scope.sbData = { data: {}, metadata: [] };
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
                   sketchbook.update($scope.sbData.metadata);
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
