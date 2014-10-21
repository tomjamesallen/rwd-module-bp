/* global jQuery */

/*
 * rwd-module-bp.js
 *
 * Copyright 2014, Tom Allen
 *
 * Lightweight js plugin add classes to element based on its width.
 *
 * Released under the WTFPL license - http://sam.zoy.org/wtfpl/
 */

;(function (window, $) {
 
  var plugin = function (options, initOnAssign) {
    var api = {}, op;
 
    // Establish plugin defaults.
    var defaults = {
      // documentReady, windowLoad, immediate
      initOn: 'windowLoad',

      prefix: 'data-js-bp',

      currentPrefix: 'data-js-bp-current',

      moduleClass: 'js-bp',

      // Default breakpoints.
      bps: {
        '300': 'bp-300',
        '500': 'bp-500',
        '700': 'bp-700'
      }
    };
 
    // Set options to empty object if not set.
    if (typeof(options) == "undefined" || options === null) { options = {}; }
 
    api.init = function () {
      api.options = $.extend(defaults, options);
      op = api.options;
 
      if (op.initOn === 'documentReady') {
        $(document).ready(function () {
          api.initCode();
        });
      }
      else if (op.initOn === 'windowLoad') {
        $(window).load(function () {
          api.initCode();
        });
      }
      else {
        api.initCode();
      }
    };
 
    api.initCode = function () {
      api._getModules();
      api.updateClasses();
      api.bindEvents();
    };

    api._getModules = function () {
      api.modules = [];
      $('[' + op.prefix + '], .' + op.moduleClass).each(function () {

        var bps;

        if ($(this).attr(op.prefix)) {
          bps = $.parseJSON($(this).attr(op.prefix));
        }
        else {
          bps = op.bps;
        }

        var module = {
          $el: $(this),
          bps: bps,
        };

        api.modules.push(module);
      });
    }

    api.updateClasses = function () {
      for (var i in api.modules) {
        var module = api.modules[i];
        var $module = module.$el;
        var moduleWidth = $module.width();

        for (var size in module.bps) {
          var bpClass = module.bps[size];

          if (moduleWidth > size) {
            $module.addClass(bpClass);
            $module.attr(op.currentPrefix, size);
          }
          else {
            $module.removeClass(bpClass);
          }
        }
      }
    };
 
    api.destroy = function () {
      
    };
 
    api.reInit = function () {
      api.destroy();
      api.init();
    };

    api.bindEvents = function () {
      $(window).resize(function () {
        api.updateClasses();
      });
    };
 
    if (initOnAssign === undefined || initOnAssign === null || initOnAssign === true) {
      api.init();
    }
    
    return api;
  };
 
  // Name plugin here.
  window.rwdModuleBp = plugin;
 
})(window, jQuery);