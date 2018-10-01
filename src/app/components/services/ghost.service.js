(function () {
    'use strict';
    angular
        .module('sketchbook')
        .factory('GhostService', fnGhostService);

    /** @ngInject */
    function fnGhostService() {

        fnGhostService.fnGetColor = function (attrObj, value) {
            var returnValue = attrObj.defaultColor ? attrObj.defaultColor : '#000';
            var tempObj = null;
            if (attrObj.mapType === "direct") {
                tempObj = _.find(attrObj[attrObj.mapType], {'value': value}); //eslint-disable-line
                returnValue = tempObj ? tempObj.color : returnValue;
            } else if (attrObj.mapType === "range") {
                tempObj = attrObj[attrObj.mapType].filter(function (obj) {
                    return value >= obj.from && value <= obj.to;
                })[0];
                returnValue = tempObj ? tempObj.color : returnValue;
            }
            return returnValue;
        };

        fnGhostService.fnGetIconValue = function (attrObj, value) {
            var returnValue = attrObj.defaultIcon ? attrObj.defaultIcon : 'fa-times';
            if(!isNaN(value) && value !== true) {
                value = parseInt(value)
            }
            var tempObj = null;
            if (attrObj.mapType === "direct") {
                tempObj = _.find(attrObj[attrObj.mapType], {'value': value}); //eslint-disable-line
                returnValue = tempObj ? tempObj.icon : returnValue;
            } else if (attrObj.mapType === "range") {
                tempObj = attrObj[attrObj.mapType].filter(function (obj) {
                    return value >= obj.from && value <= obj.to;
                })[0];
                returnValue = tempObj ? tempObj.icon : returnValue;
            }
            return returnValue;
        };

        fnGhostService.fnGetToggleValue = function (attrObj, value) {
            var returnValue = attrObj.default.value === true ? attrObj.default.trueText : attrObj.default.falseText;
            var tempObj = null;
            if (attrObj.mapType === "direct") {
                tempObj = _.find(attrObj[attrObj.mapType], {'value': value}); //eslint-disable-line
                returnValue = tempObj ? (tempObj.isTrue ? attrObj.default.trueText : attrObj.default.falseText) : returnValue;
            } else if (attrObj.mapType === "range") {
                tempObj = attrObj[attrObj.mapType].filter(function (obj) {
                    return value >= obj.from && value <= obj.to;
                })[0];
                returnValue = tempObj ? (tempObj.isTrue ? attrObj.default.trueText : attrObj.default.falseText) : returnValue;
            }
            return {displayText : returnValue, switchValue: tempObj ? tempObj.isTrue : attrObj.default.value};
        };

        fnGhostService.fnGetTextValue = function (attrObj, value) {
            var returnValue = "default string";
            var tempObj = null;
            if (attrObj.mapType === "direct") {
                var tempVal = value.toString();
                tempObj = _.find(attrObj[attrObj.mapType], {'value': tempVal}); //eslint-disable-line
                returnValue = tempObj ? tempObj.text : value;
            } else if (attrObj.mapType === "range") {
                tempObj = attrObj[attrObj.mapType].filter(function (obj) {
                    return value >= obj.from && value <= obj.to;
                })[0];
                returnValue = tempObj ? tempObj.text : value;
            }
            return returnValue;
        };
        return fnGhostService;
    }
})();

