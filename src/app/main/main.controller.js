(function () {
    'use strict';

    angular
        .module('sketchbook')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController() {
        var vm = this;

        vm.attributesArr = [
            {
                "name": "fw_version",
                "title": "Fw_version",
                "units": "",
                "value": 1,
                "display": "Gauge",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "min": 1,
                    "max": 1,
                    "defaultColor": "#6CCCCC",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "ld_power",
                "title": "Ld_power",
                "units": "",
                "value": 5,
                "display": "Stack",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "min":-3.191,
                    "max": 1,
                    "defaultColor": "#6CCCCC",
                    "stackType": "Horizontal",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "ld_power_status",
                "title": "Ld_power_status",
                "units": "",
                "value": "green",
                "display": "Text",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "text": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "overload_alarm",
                "title": "Overload_alarm",
                "units": "",
                "value": "green",
                "display": "Text",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "text": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "serial_number",
                "title": "Serial_number",
                "units": "",
                "value": 15600063,
                "display": "Gauge",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "min": 1,
                    "max": 17160069,
                    "defaultColor": "#6CCCCC",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "op1_status",
                "title": "Op1_status",
                "units": "",
                "value": "green",
                "display": "Text",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "text": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "op1_pd_power",
                "title": "Op1_pd_power",
                "units": "",
                "value": 7.3,
                "display": "Stack",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "min": 1,
                    "max": 8.03,
                    "defaultColor": "#6CCCCC",
                    "stackType": "Horizontal",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "op1_rx_optic_att",
                "title": "Op1_rx_optic_att",
                "units": "",
                "value": 11,
                "display": "Gauge",
                "health": "Healthy",
                "healthCode": 200,
                "options": {
                    "min": 1,
                    "max": 12,
                    "defaultColor": "#6CCCCC",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ]
                },
                "healthColor": "#88c643",
                "metadata": []
            },
            {
                "name": "test Icon",
                "title": "Icon",
                "units": "",
                "value": "200",
                "display": "Icon",
                "health": "SEV 1",
                "healthCode": 500,
                "options": {
                    "defaultIcon": "fa-battery-2",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "icon": ""
                        }
                    ],
                    "stackType": "horizontal"
                },
                "healthColor": "#e7413d",
                "metadata": []
            },
            {
                "name": "toggle",
                "title": "Toggle",
                "units": "",
                "value": "on",
                "display": "Toggle",
                "health": "SEV 1",
                "healthCode": 500,
                "options": {
                    "default": {
                        "value": true,
                        "trueText": "On",
                        "falseText": "Off"
                    },
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "isTrue": ""
                        }
                    ],
                    "stackType": "horizontal"
                },
                "healthColor": "#e7413d",
                "metadata": []
            },
            {
                "name": "prop2",
                "units": "%",
                "display": "Range Slider",
                "health": "HELP",
                "healthColor": "red",
                "options": {
                    "min": 1,
                    "max": 100,
                    "mapType": "range",
                    "range": [
                        {
                            "from": 1,
                            "to": 100,
                            "color": "#2f1e70"
                        }
                    ],
                    "defaultColor": "#2c5929",
                    "minThresholdValue": 20,
                    "maxThresholdValue": 80,
                    "minThresholdColor": "#d84611",
                    "maxThresholdColor": "#d84611",
                    "minLabel": "Low Power",
                    "maxLabel": "High Power"
                },
                "value": 50,
                "metadata": []
            },{
                "name": "Led",
                "title": "LED",
                "units": "",
                "value": "200",
                "display": "LED",
                "health": "SEV 1",
                "healthCode": 500,
                "options": {
                    "defaultColor": "#8f79af",
                    "mapType": "range",
                    "range": [
                        {
                            "from": "",
                            "to": "",
                            "color": ""
                        }
                    ],
                    "stackType": "horizontal"
                },
                "healthColor": "#e7413d",
                "metadata": []
            },
            {
                "name": "prop2",
                "title": "prop2 Range Slider",
                "units": "%",
                "display": "Range Slider",
                "health": "HELP",
                "healthColor": "red",
                "options": {
                    "min": 0,
                    "max": 100,
                    "mapType": "range",
                    "range": [
                        {
                            "from": 1,
                            "to": 100,
                            "color": "#2f1e70"
                        }
                    ],
                    "defaultColor": "#2c5929",
                    "minThresholdValue": 20,
                    "maxThresholdValue": 80,
                    "minThresholdColor": "#d84611",
                    "maxThresholdColor": "#d81015",
                    "minLabel": "Low Power",
                    "maxLabel": "High Power"
                },
                "value": 50,
                "metadata": []
            }
        ];
        vm.selectedAttributeObj = null;
        vm.isAttributeSelected = false;

        vm.fnSelectAttribute = function (attributeObj) {
            vm.selectedAttributeObj = attributeObj;
            vm.isAttributeSelected = true;
        };

        vm.fnExitAttrEditView = function (attrObj) {
            if (attrObj) {
                angular.forEach(vm.attributesArr, function (attribute) {
                    if (attribute.name === attrObj.name) {
                        attribute.metadata = attrObj.metadata;
                    }
                })
            }
            vm.isAttributeSelected = false;
            vm.selectedAttributeObj = null;
        };

        vm.fnInitMainCtrl = function () {

        };
    }
})();
