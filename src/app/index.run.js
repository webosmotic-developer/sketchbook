(function () {
    'use strict';

    angular
        .module('sketchbook')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log) {

        $log.debug('runBlock end');
    }

})();
