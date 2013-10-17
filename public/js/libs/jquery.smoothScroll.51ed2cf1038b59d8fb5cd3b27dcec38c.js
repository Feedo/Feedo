/* 
 * Predefined - jquery.smoothScroll.js
 * Copyright (c) 2013 Predefined
 * */

/*
 * jQuery Smooth Scroll Plugin
 * By Sören Gade
 * Copyright (c) 2013 Sören Gade
 *
 * Version: 1.1
 * jQuery Version: 1.9.0
 * Last Update: 05 Feb 2012
 *
 * Usage:
 * $(selector).smoothScrollTop([options]);
 *
 * Paramters:
 *      duration: The time of the scroll animation in ms.
 *          Defaults to 500.
 *      offset: Offset from the top of the specified element.
 *          Defaults to 0.
 *      element: The element to scroll on.
 *          Defaults to the selected element.
 *      parent: The parent the scroll should be done on.
 *          Defaults to $("body").
 *      done: A callback that will be called when the function quits.
 *          Defaults to nothing.
 *      scrollInvisibles: Determines whether invisible objects should be valid targets.
 *          Defaults to false.
 *      debug: Determines whether debug messages (for bug finding) should be displayed.
 *          Defaults to false.
 *
 * Version history:
 *  1.1:
 *      + added callback function ('done')
 *  1.0:
 *      + Initial release
 * */

(function( $ ) {
    var _internals = {
        debugIf: function(condition, msg) {
            if ( condition )
                this.debug(msg);
        },
        debug: function(msg) {
            msg = "jQuery.smoothScrollTop: " + msg;
            console.log(msg);
        }
    };
    
    $.fn.smoothScrollTop = function( options ) {
        // load default settings with options
        var settings = $.extend({
            'duration': 500,
            'offset': 0,
            'element': this,
            'parent': $("body"),
            
            'done': null,

            'scrollInvisibles': false,            
            'debug': false
        }, options);
        
        // filter for multiple elements
        if ( settings.element.length > 1 )
        {
            _internals.debugIf(settings.debug, "Scrolling is not possible on multiple elements. Assuming first element to be meant.");
            // get the first element
            settings.element = settings.element.first();
        }
        
        // checks whether the element is visible
        if ( settings.element.css('display') == "none" || settings.element.css('opacity') == "0" )
        {
            // if we are not allowed to scroll on invisibles
            if ( !settings.scrollInvisibles )
            {
                _internals.debugIf(settings.debug, "Scrolling on invisbile objects is turned off.");
                // exit
                return this;
            }
        }
        
        // get the y value to scroll to
        var top = 0;
        /* if ( typeof settings.element.position() !== "undefined" ) */
             top = settings.element.position().top;
        
        // add the offset to the top
        if ( settings.offset != 0 )
            top += settings.offset;
        
        _internals.debugIf(settings.debug, "Scrolling to " + top + " (offset: " + settings.offset + ")");
        
        // animate the parent to scroll to the element
        $(settings.parent).animate({
            scrollTop: top // scroll to it
        }, settings.duration, function() {
            // after the settings.duration, output the message
            _internals.debugIf(settings.debug, "Scrolling done.");
            
            if ( settings.done != null )
                settings.done();
        });
        
        return this;
    };
})( jQuery );
