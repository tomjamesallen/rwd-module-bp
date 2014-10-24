/* global jQuery */

/*
 * rwd-module-bp.js
 *
 * Copyright 2014, Tom Allen
 * https://github.com/tomjamesallen/rwd-module-bp
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
      
      // Defer init.
      // documentReady, windowLoad, immediate
      initOn: 'windowLoad',

      // Data attribute to check for on element.
      bpDataAttribute: 'data-js-bp',

      // Where we store the current breakpoint's size.
      currentBpDataAttribute: 'data-js-bp-current',

      // A class can be used to identify a module either as well as, or instead
      // of the bp data attribute. If no bp data attribute is provided then the
      // default breakpoints will be used.
      moduleClass: 'js-bp',

      // Default breakpoints.
      bps: {
        '300': 'bp-300',
        '600': 'bp-600',
        '750': 'bp-750',
        '900': 'bp-900',
        '1050': 'bp-1050',
        '1200': 'bp-1200',
      },

      // Whether the plugin should fire events on the updateClass function being
      // called.
      fireEvents: false,

      // Whether bind update of classes to window resize.
      bindWindowResize: true,
    };
 
    // Set options to empty object if not set.
    if (typeof(options) == "undefined" || options === null) { options = {}; }
 
    /**
     * Initialise the plugin.
     */
    api.init = function () {
      // Get options.
      api.options = $.extend(defaults, options);
      op = api.options;
 
      // Run init code.
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

    /**
     * Init code.
     */
    api.initCode = function () {
      // Get the modules based on the selector.
      api._getModules();

      // Sort modules by number of matching decedents.
      api._sortModules();

      // Update the classes on the modules.
      api.updateClasses();

      // Bind events to window resize.
      api.bindEvents();
    };

    /**
     * Get the modules based on the selector.
     */
    api._getModules = function () {
      // Create empty modules array attached to the api object.
      api.modules = [];
      
      // The module selector matches elements that have the bpDataAttribute or
      // the module class. Only one of these is required.
      var moduleSelector = '[' + op.bpDataAttribute + '], .' + op.moduleClass;
      
      // Loop through elements that match selector.
      $(moduleSelector).each(function () {

        // The breakpoints property.
        var bps;

        // If there is an attribute on the module element, then we should use
        // this for the breakpoints.
        if ($(this).attr(op.bpDataAttribute)) {
          bps = $.parseJSON($(this).attr(op.bpDataAttribute));
        }
        // Else get the bps property from the plugin instance's options.
        else {
          bps = op.bps;
        }

        // Cache module.
        var $el = $(this);

        // Calculate order to update modules in based on their depth in the DOM.
        var matchingDecedents = $el.find(moduleSelector).length;

        // Create the module object.
        var module = {
          // Cache the jquery selector.
          $el: $el,

          // Save the bps object.
          bps: bps,

          // Matching decendents.
          matchingDecedents: matchingDecedents,
        };

        // Add ready class to module.
        module.$el.addClass(op.moduleClass + '-ready');

        // Attach the module object to the modules array.
        api.modules.push(module);
      });
    }

    /**
     * Sort the modules array based on the number of matching decedents that
     * each module has.
     */
    api._sortModules = function () {
      api.modules.sort(function (a, b) {
        if (a.matchingDecedents > b.matchingDecedents) {
          return -1;
        }
        if (a.matchingDecedents < b.matchingDecedents) {
          return 1;
        }
        return 0;
      });
    };

    /**
     * Update the classes on each module.
     *
     * This function can be called externally to prompt modules to update their
     * classes. This can be useful after changing some aspect of the formatting
     * or layout of a page that might affect the a module's width.
     */
    api.updateClasses = function () {
      
      // Loop through our modules.
      for (var i in api.modules) {
        
        var module = api.modules[i],
            $module = module.$el,

            // Get the outer width of our module's element.
            moduleWidth = $module.outerWidth(true);


        // Cycle through breakpoints.
        for (var size in module.bps) {
          var bpClass = module.bps[size];

          // If the module is equal to or larger in width than the breakpoint
          // then add that breakpoint's class to the module and update the
          // currentBpDataAttribute.
          if (moduleWidth >= size) {
            $module.addClass(bpClass);
            $module.attr(op.currentBpDataAttribute, size);
          }
          // Else remove the breakpoint's class from the module.
          else {
            $module.removeClass(bpClass);
          }
        }
      }

      // Fire resize event.
      if (op.fireEvents) {
        $.event.trigger({
          type: 'resize-module.rwdModuleBp',
          module: module,
        });        
      }
    };

    /**
     * Destroy the current instance.
     */
    api.destroy = function () {
      // Loop through our modules.
      for (var i in api.modules) {
        
        var module = api.modules[i],
            $module = module.$el;

        // Remove ready class from module.
        module.$el.removeClass(op.moduleClass + '-ready');

        // Cycle through breakpoints.
        for (var size in module.bps) {
          var bpClass = module.bps[size];

          // Remove all breakpoint classes.
          $module.removeClass(bpClass);
          // Remove current breakpoint data attribute.
          $module.attr(op.currentBpDataAttribute, '');
        }
      }

      // Delete the modules array.
      delete api.modules;
    };
 
    /**
     * Re-initialise the current instance.
     */
    api.reInit = function () {
      api.destroy();
      api.init();
    };

    /**
     * Bind the resize events.
     */
    api.bindEvents = function () {
      if (op.bindWindowResize) {
        if (typeof $(window).smartresize === 'function') {
          $(window).smartresize(function () {
            api.updateClasses();
          });
        }
        else {
          $(window).resize(function () {
            api.updateClasses();
          });        
        }
      }
      $(document).bind('trigger-resize.rwdModuleBp', function (event) {
        api.updateClasses();
      });
    };
 
    // If initOnAssign is true of not set, then initialise the plugin.
    if (initOnAssign === undefined || initOnAssign === null || initOnAssign === true) {
      api.init();
    }
    
    return api;
  };
 
  // Give plugin namespace.
  window.rwdModuleBp = plugin;
 
})(window, jQuery);
