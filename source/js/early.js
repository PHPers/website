/*!
 * Modernizr v2.8.3
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.3',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq) && matchMedia(mq).matches || false;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVybml6ci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZWFybHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIE1vZGVybml6ciB2Mi44LjNcbiAqIHd3dy5tb2Rlcm5penIuY29tXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYXJ1ayBBdGVzLCBQYXVsIElyaXNoLCBBbGV4IFNleHRvblxuICogQXZhaWxhYmxlIHVuZGVyIHRoZSBCU0QgYW5kIE1JVCBsaWNlbnNlczogd3d3Lm1vZGVybml6ci5jb20vbGljZW5zZS9cbiAqL1xuXG4vKlxuICogTW9kZXJuaXpyIHRlc3RzIHdoaWNoIG5hdGl2ZSBDU1MzIGFuZCBIVE1MNSBmZWF0dXJlcyBhcmUgYXZhaWxhYmxlIGluXG4gKiB0aGUgY3VycmVudCBVQSBhbmQgbWFrZXMgdGhlIHJlc3VsdHMgYXZhaWxhYmxlIHRvIHlvdSBpbiB0d28gd2F5czpcbiAqIGFzIHByb3BlcnRpZXMgb24gYSBnbG9iYWwgTW9kZXJuaXpyIG9iamVjdCwgYW5kIGFzIGNsYXNzZXMgb24gdGhlXG4gKiA8aHRtbD4gZWxlbWVudC4gVGhpcyBpbmZvcm1hdGlvbiBhbGxvd3MgeW91IHRvIHByb2dyZXNzaXZlbHkgZW5oYW5jZVxuICogeW91ciBwYWdlcyB3aXRoIGEgZ3JhbnVsYXIgbGV2ZWwgb2YgY29udHJvbCBvdmVyIHRoZSBleHBlcmllbmNlLlxuICpcbiAqIE1vZGVybml6ciBoYXMgYW4gb3B0aW9uYWwgKG5vdCBpbmNsdWRlZCkgY29uZGl0aW9uYWwgcmVzb3VyY2UgbG9hZGVyXG4gKiBjYWxsZWQgTW9kZXJuaXpyLmxvYWQoKSwgYmFzZWQgb24gWWVwbm9wZS5qcyAoeWVwbm9wZWpzLmNvbSkuXG4gKiBUbyBnZXQgYSBidWlsZCB0aGF0IGluY2x1ZGVzIE1vZGVybml6ci5sb2FkKCksIGFzIHdlbGwgYXMgY2hvb3NpbmdcbiAqIHdoaWNoIHRlc3RzIHRvIGluY2x1ZGUsIGdvIHRvIHd3dy5tb2Rlcm5penIuY29tL2Rvd25sb2FkL1xuICpcbiAqIEF1dGhvcnMgICAgICAgIEZhcnVrIEF0ZXMsIFBhdWwgSXJpc2gsIEFsZXggU2V4dG9uXG4gKiBDb250cmlidXRvcnMgICBSeWFuIFNlZGRvbiwgQmVuIEFsbWFuXG4gKi9cblxud2luZG93Lk1vZGVybml6ciA9IChmdW5jdGlvbiggd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkICkge1xuXG4gICAgdmFyIHZlcnNpb24gPSAnMi44LjMnLFxuXG4gICAgTW9kZXJuaXpyID0ge30sXG5cbiAgICAvKj4+Y3NzY2xhc3NlcyovXG4gICAgLy8gb3B0aW9uIGZvciBlbmFibGluZyB0aGUgSFRNTCBjbGFzc2VzIHRvIGJlIGFkZGVkXG4gICAgZW5hYmxlQ2xhc3NlcyA9IHRydWUsXG4gICAgLyo+PmNzc2NsYXNzZXMqL1xuXG4gICAgZG9jRWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBvdXIgXCJtb2Rlcm5penJcIiBlbGVtZW50IHRoYXQgd2UgZG8gbW9zdCBmZWF0dXJlIHRlc3RzIG9uLlxuICAgICAqL1xuICAgIG1vZCA9ICdtb2Rlcm5penInLFxuICAgIG1vZEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG1vZCksXG4gICAgbVN0eWxlID0gbW9kRWxlbS5zdHlsZSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgaW5wdXQgZWxlbWVudCBmb3IgdmFyaW91cyBXZWIgRm9ybXMgZmVhdHVyZSB0ZXN0cy5cbiAgICAgKi9cbiAgICBpbnB1dEVsZW0gLyo+PmlucHV0ZWxlbSovID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSAvKj4+aW5wdXRlbGVtKi8gLFxuXG4gICAgLyo+PnNtaWxlKi9cbiAgICBzbWlsZSA9ICc6KScsXG4gICAgLyo+PnNtaWxlKi9cblxuICAgIHRvU3RyaW5nID0ge30udG9TdHJpbmcsXG5cbiAgICAvLyBUT0RPIDo6IG1ha2UgdGhlIHByZWZpeGVzIG1vcmUgZ3JhbnVsYXJcbiAgICAvKj4+cHJlZml4ZXMqL1xuICAgIC8vIExpc3Qgb2YgcHJvcGVydHkgdmFsdWVzIHRvIHNldCBmb3IgY3NzIHRlc3RzLiBTZWUgdGlja2V0ICMyMVxuICAgIHByZWZpeGVzID0gJyAtd2Via2l0LSAtbW96LSAtby0gLW1zLSAnLnNwbGl0KCcgJyksXG4gICAgLyo+PnByZWZpeGVzKi9cblxuICAgIC8qPj5kb21wcmVmaXhlcyovXG4gICAgLy8gRm9sbG93aW5nIHNwZWMgaXMgdG8gZXhwb3NlIHZlbmRvci1zcGVjaWZpYyBzdHlsZSBwcm9wZXJ0aWVzIGFzOlxuICAgIC8vICAgZWxlbS5zdHlsZS5XZWJraXRCb3JkZXJSYWRpdXNcbiAgICAvLyBhbmQgdGhlIGZvbGxvd2luZyB3b3VsZCBiZSBpbmNvcnJlY3Q6XG4gICAgLy8gICBlbGVtLnN0eWxlLndlYmtpdEJvcmRlclJhZGl1c1xuXG4gICAgLy8gV2Via2l0IGdob3N0cyB0aGVpciBwcm9wZXJ0aWVzIGluIGxvd2VyY2FzZSBidXQgT3BlcmEgJiBNb3ogZG8gbm90LlxuICAgIC8vIE1pY3Jvc29mdCB1c2VzIGEgbG93ZXJjYXNlIGBtc2AgaW5zdGVhZCBvZiB0aGUgY29ycmVjdCBgTXNgIGluIElFOCtcbiAgICAvLyAgIGVyaWsuZWFlLm5ldC9hcmNoaXZlcy8yMDA4LzAzLzEwLzIxLjQ4LjEwL1xuXG4gICAgLy8gTW9yZSBoZXJlOiBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzL2lzc3VlLzIxXG4gICAgb21QcmVmaXhlcyA9ICdXZWJraXQgTW96IE8gbXMnLFxuXG4gICAgY3Nzb21QcmVmaXhlcyA9IG9tUHJlZml4ZXMuc3BsaXQoJyAnKSxcblxuICAgIGRvbVByZWZpeGVzID0gb21QcmVmaXhlcy50b0xvd2VyQ2FzZSgpLnNwbGl0KCcgJyksXG4gICAgLyo+PmRvbXByZWZpeGVzKi9cblxuICAgIC8qPj5ucyovXG4gICAgbnMgPSB7J3N2Zyc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyd9LFxuICAgIC8qPj5ucyovXG5cbiAgICB0ZXN0cyA9IHt9LFxuICAgIGlucHV0cyA9IHt9LFxuICAgIGF0dHJzID0ge30sXG5cbiAgICBjbGFzc2VzID0gW10sXG5cbiAgICBzbGljZSA9IGNsYXNzZXMuc2xpY2UsXG5cbiAgICBmZWF0dXJlTmFtZSwgLy8gdXNlZCBpbiB0ZXN0aW5nIGxvb3BcblxuXG4gICAgLyo+PnRlc3RzdHlsZXMqL1xuICAgIC8vIEluamVjdCBlbGVtZW50IHdpdGggc3R5bGUgZWxlbWVudCBhbmQgc29tZSBDU1MgcnVsZXNcbiAgICBpbmplY3RFbGVtZW50V2l0aFN0eWxlcyA9IGZ1bmN0aW9uKCBydWxlLCBjYWxsYmFjaywgbm9kZXMsIHRlc3RuYW1lcyApIHtcblxuICAgICAgdmFyIHN0eWxlLCByZXQsIG5vZGUsIGRvY092ZXJmbG93LFxuICAgICAgICAgIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgIC8vIEFmdGVyIHBhZ2UgbG9hZCBpbmplY3RpbmcgYSBmYWtlIGJvZHkgZG9lc24ndCB3b3JrIHNvIGNoZWNrIGlmIGJvZHkgZXhpc3RzXG4gICAgICAgICAgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgLy8gSUU2IGFuZCA3IHdvbid0IHJldHVybiBvZmZzZXRXaWR0aCBvciBvZmZzZXRIZWlnaHQgdW5sZXNzIGl0J3MgaW4gdGhlIGJvZHkgZWxlbWVudCwgc28gd2UgZmFrZSBpdC5cbiAgICAgICAgICBmYWtlQm9keSA9IGJvZHkgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9keScpO1xuXG4gICAgICBpZiAoIHBhcnNlSW50KG5vZGVzLCAxMCkgKSB7XG4gICAgICAgICAgLy8gSW4gb3JkZXIgbm90IHRvIGdpdmUgZmFsc2UgcG9zaXRpdmVzIHdlIGNyZWF0ZSBhIG5vZGUgZm9yIGVhY2ggdGVzdFxuICAgICAgICAgIC8vIFRoaXMgYWxzbyBhbGxvd3MgdGhlIG1ldGhvZCB0byBzY2FsZSBmb3IgdW5zcGVjaWZpZWQgdXNlc1xuICAgICAgICAgIHdoaWxlICggbm9kZXMtLSApIHtcbiAgICAgICAgICAgICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICBub2RlLmlkID0gdGVzdG5hbWVzID8gdGVzdG5hbWVzW25vZGVzXSA6IG1vZCArIChub2RlcyArIDEpO1xuICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyA8c3R5bGU+IGVsZW1lbnRzIGluIElFNi05IGFyZSBjb25zaWRlcmVkICdOb1Njb3BlJyBlbGVtZW50cyBhbmQgdGhlcmVmb3JlIHdpbGwgYmUgcmVtb3ZlZFxuICAgICAgLy8gd2hlbiBpbmplY3RlZCB3aXRoIGlubmVySFRNTC4gVG8gZ2V0IGFyb3VuZCB0aGlzIHlvdSBuZWVkIHRvIHByZXBlbmQgdGhlICdOb1Njb3BlJyBlbGVtZW50XG4gICAgICAvLyB3aXRoIGEgJ3Njb3BlZCcgZWxlbWVudCwgaW4gb3VyIGNhc2UgdGhlIHNvZnQtaHlwaGVuIGVudGl0eSBhcyBpdCB3b24ndCBtZXNzIHdpdGggb3VyIG1lYXN1cmVtZW50cy5cbiAgICAgIC8vIG1zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMzODk3JTI4VlMuODUlMjkuYXNweFxuICAgICAgLy8gRG9jdW1lbnRzIHNlcnZlZCBhcyB4bWwgd2lsbCB0aHJvdyBpZiB1c2luZyAmc2h5OyBzbyB1c2UgeG1sIGZyaWVuZGx5IGVuY29kZWQgdmVyc2lvbi4gU2VlIGlzc3VlICMyNzdcbiAgICAgIHN0eWxlID0gWycmIzE3MzsnLCc8c3R5bGUgaWQ9XCJzJywgbW9kLCAnXCI+JywgcnVsZSwgJzwvc3R5bGU+J10uam9pbignJyk7XG4gICAgICBkaXYuaWQgPSBtb2Q7XG4gICAgICAvLyBJRTYgd2lsbCBmYWxzZSBwb3NpdGl2ZSBvbiBzb21lIHRlc3RzIGR1ZSB0byB0aGUgc3R5bGUgZWxlbWVudCBpbnNpZGUgdGhlIHRlc3QgZGl2IHNvbWVob3cgaW50ZXJmZXJpbmcgb2Zmc2V0SGVpZ2h0LCBzbyBpbnNlcnQgaXQgaW50byBib2R5IG9yIGZha2Vib2R5LlxuICAgICAgLy8gT3BlcmEgd2lsbCBhY3QgYWxsIHF1aXJreSB3aGVuIGluamVjdGluZyBlbGVtZW50cyBpbiBkb2N1bWVudEVsZW1lbnQgd2hlbiBwYWdlIGlzIHNlcnZlZCBhcyB4bWwsIG5lZWRzIGZha2Vib2R5IHRvby4gIzI3MFxuICAgICAgKGJvZHkgPyBkaXYgOiBmYWtlQm9keSkuaW5uZXJIVE1MICs9IHN0eWxlO1xuICAgICAgZmFrZUJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgIGlmICggIWJvZHkgKSB7XG4gICAgICAgICAgLy9hdm9pZCBjcmFzaGluZyBJRTgsIGlmIGJhY2tncm91bmQgaW1hZ2UgaXMgdXNlZFxuICAgICAgICAgIGZha2VCb2R5LnN0eWxlLmJhY2tncm91bmQgPSAnJztcbiAgICAgICAgICAvL1NhZmFyaSA1LjEzLzUuMS40IE9TWCBzdG9wcyBsb2FkaW5nIGlmIDo6LXdlYmtpdC1zY3JvbGxiYXIgaXMgdXNlZCBhbmQgc2Nyb2xsYmFycyBhcmUgdmlzaWJsZVxuICAgICAgICAgIGZha2VCb2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgICAgZG9jT3ZlcmZsb3cgPSBkb2NFbGVtZW50LnN0eWxlLm92ZXJmbG93O1xuICAgICAgICAgIGRvY0VsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICBkb2NFbGVtZW50LmFwcGVuZENoaWxkKGZha2VCb2R5KTtcbiAgICAgIH1cblxuICAgICAgcmV0ID0gY2FsbGJhY2soZGl2LCBydWxlKTtcbiAgICAgIC8vIElmIHRoaXMgaXMgZG9uZSBhZnRlciBwYWdlIGxvYWQgd2UgZG9uJ3Qgd2FudCB0byByZW1vdmUgdGhlIGJvZHkgc28gY2hlY2sgaWYgYm9keSBleGlzdHNcbiAgICAgIGlmICggIWJvZHkgKSB7XG4gICAgICAgICAgZmFrZUJvZHkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmYWtlQm9keSk7XG4gICAgICAgICAgZG9jRWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9IGRvY092ZXJmbG93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkaXYpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gISFyZXQ7XG5cbiAgICB9LFxuICAgIC8qPj50ZXN0c3R5bGVzKi9cblxuICAgIC8qPj5tcSovXG4gICAgLy8gYWRhcHRlZCBmcm9tIG1hdGNoTWVkaWEgcG9seWZpbGxcbiAgICAvLyBieSBTY290dCBKZWhsIGFuZCBQYXVsIElyaXNoXG4gICAgLy8gZ2lzdC5naXRodWIuY29tLzc4Njc2OFxuICAgIHRlc3RNZWRpYVF1ZXJ5ID0gZnVuY3Rpb24oIG1xICkge1xuXG4gICAgICB2YXIgbWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhIHx8IHdpbmRvdy5tc01hdGNoTWVkaWE7XG4gICAgICBpZiAoIG1hdGNoTWVkaWEgKSB7XG4gICAgICAgIHJldHVybiBtYXRjaE1lZGlhKG1xKSAmJiBtYXRjaE1lZGlhKG1xKS5tYXRjaGVzIHx8IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgYm9vbDtcblxuICAgICAgaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMoJ0BtZWRpYSAnICsgbXEgKyAnIHsgIycgKyBtb2QgKyAnIHsgcG9zaXRpb246IGFic29sdXRlOyB9IH0nLCBmdW5jdGlvbiggbm9kZSApIHtcbiAgICAgICAgYm9vbCA9ICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/XG4gICAgICAgICAgICAgICAgICBnZXRDb21wdXRlZFN0eWxlKG5vZGUsIG51bGwpIDpcbiAgICAgICAgICAgICAgICAgIG5vZGUuY3VycmVudFN0eWxlKVsncG9zaXRpb24nXSA9PSAnYWJzb2x1dGUnO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBib29sO1xuXG4gICAgIH0sXG4gICAgIC8qPj5tcSovXG5cblxuICAgIC8qPj5oYXNldmVudCovXG4gICAgLy9cbiAgICAvLyBpc0V2ZW50U3VwcG9ydGVkIGRldGVybWluZXMgaWYgYSBnaXZlbiBlbGVtZW50IHN1cHBvcnRzIHRoZSBnaXZlbiBldmVudFxuICAgIC8vIGthbmdheC5naXRodWIuY29tL2lzZXZlbnRzdXBwb3J0ZWQvXG4gICAgLy9cbiAgICAvLyBUaGUgZm9sbG93aW5nIHJlc3VsdHMgYXJlIGtub3duIGluY29ycmVjdHM6XG4gICAgLy8gICBNb2Rlcm5penIuaGFzRXZlbnQoXCJ3ZWJraXRUcmFuc2l0aW9uRW5kXCIsIGVsZW0pIC8vIGZhbHNlIG5lZ2F0aXZlXG4gICAgLy8gICBNb2Rlcm5penIuaGFzRXZlbnQoXCJ0ZXh0SW5wdXRcIikgLy8gaW4gV2Via2l0LiBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzMzM1xuICAgIC8vICAgLi4uXG4gICAgaXNFdmVudFN1cHBvcnRlZCA9IChmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIFRBR05BTUVTID0ge1xuICAgICAgICAnc2VsZWN0JzogJ2lucHV0JywgJ2NoYW5nZSc6ICdpbnB1dCcsXG4gICAgICAgICdzdWJtaXQnOiAnZm9ybScsICdyZXNldCc6ICdmb3JtJyxcbiAgICAgICAgJ2Vycm9yJzogJ2ltZycsICdsb2FkJzogJ2ltZycsICdhYm9ydCc6ICdpbWcnXG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBpc0V2ZW50U3VwcG9ydGVkKCBldmVudE5hbWUsIGVsZW1lbnQgKSB7XG5cbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChUQUdOQU1FU1tldmVudE5hbWVdIHx8ICdkaXYnKTtcbiAgICAgICAgZXZlbnROYW1lID0gJ29uJyArIGV2ZW50TmFtZTtcblxuICAgICAgICAvLyBXaGVuIHVzaW5nIGBzZXRBdHRyaWJ1dGVgLCBJRSBza2lwcyBcInVubG9hZFwiLCBXZWJLaXQgc2tpcHMgXCJ1bmxvYWRcIiBhbmQgXCJyZXNpemVcIiwgd2hlcmVhcyBgaW5gIFwiY2F0Y2hlc1wiIHRob3NlXG4gICAgICAgIHZhciBpc1N1cHBvcnRlZCA9IGV2ZW50TmFtZSBpbiBlbGVtZW50O1xuXG4gICAgICAgIGlmICggIWlzU3VwcG9ydGVkICkge1xuICAgICAgICAgIC8vIElmIGl0IGhhcyBubyBgc2V0QXR0cmlidXRlYCAoaS5lLiBkb2Vzbid0IGltcGxlbWVudCBOb2RlIGludGVyZmFjZSksIHRyeSBnZW5lcmljIGVsZW1lbnRcbiAgICAgICAgICBpZiAoICFlbGVtZW50LnNldEF0dHJpYnV0ZSApIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBlbGVtZW50LnNldEF0dHJpYnV0ZSAmJiBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSApIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGV2ZW50TmFtZSwgJycpO1xuICAgICAgICAgICAgaXNTdXBwb3J0ZWQgPSBpcyhlbGVtZW50W2V2ZW50TmFtZV0sICdmdW5jdGlvbicpO1xuXG4gICAgICAgICAgICAvLyBJZiBwcm9wZXJ0eSB3YXMgY3JlYXRlZCwgXCJyZW1vdmUgaXRcIiAoYnkgc2V0dGluZyB2YWx1ZSB0byBgdW5kZWZpbmVkYClcbiAgICAgICAgICAgIGlmICggIWlzKGVsZW1lbnRbZXZlbnROYW1lXSwgJ3VuZGVmaW5lZCcpICkge1xuICAgICAgICAgICAgICBlbGVtZW50W2V2ZW50TmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShldmVudE5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQgPSBudWxsO1xuICAgICAgICByZXR1cm4gaXNTdXBwb3J0ZWQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNFdmVudFN1cHBvcnRlZDtcbiAgICB9KSgpLFxuICAgIC8qPj5oYXNldmVudCovXG5cbiAgICAvLyBUT0RPIDo6IEFkZCBmbGFnIGZvciBoYXNvd25wcm9wID8gZGlkbid0IGxhc3QgdGltZVxuXG4gICAgLy8gaGFzT3duUHJvcGVydHkgc2hpbSBieSBrYW5nYXggbmVlZGVkIGZvciBTYWZhcmkgMi4wIHN1cHBvcnRcbiAgICBfaGFzT3duUHJvcGVydHkgPSAoe30pLmhhc093blByb3BlcnR5LCBoYXNPd25Qcm9wO1xuXG4gICAgaWYgKCAhaXMoX2hhc093blByb3BlcnR5LCAndW5kZWZpbmVkJykgJiYgIWlzKF9oYXNPd25Qcm9wZXJ0eS5jYWxsLCAndW5kZWZpbmVkJykgKSB7XG4gICAgICBoYXNPd25Qcm9wID0gZnVuY3Rpb24gKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBoYXNPd25Qcm9wID0gZnVuY3Rpb24gKG9iamVjdCwgcHJvcGVydHkpIHsgLyogeWVzLCB0aGlzIGNhbiBnaXZlIGZhbHNlIHBvc2l0aXZlcy9uZWdhdGl2ZXMsIGJ1dCBtb3N0IG9mIHRoZSB0aW1lIHdlIGRvbid0IGNhcmUgYWJvdXQgdGhvc2UgKi9cbiAgICAgICAgcmV0dXJuICgocHJvcGVydHkgaW4gb2JqZWN0KSAmJiBpcyhvYmplY3QuY29uc3RydWN0b3IucHJvdG90eXBlW3Byb3BlcnR5XSwgJ3VuZGVmaW5lZCcpKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQWRhcHRlZCBmcm9tIEVTNS1zaGltIGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvZXM1LXNoaW0vYmxvYi9tYXN0ZXIvZXM1LXNoaW0uanNcbiAgICAvLyBlczUuZ2l0aHViLmNvbS8jeDE1LjMuNC41XG5cbiAgICBpZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uIGJpbmQodGhhdCkge1xuXG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0ICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBib3VuZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkge1xuXG4gICAgICAgICAgICAgIHZhciBGID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICAgICAgICBGLnByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgICAgICAgIHZhciBzZWxmID0gbmV3IEYoKTtcblxuICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGFyZ2V0LmFwcGx5KFxuICAgICAgICAgICAgICAgICAgc2VsZixcbiAgICAgICAgICAgICAgICAgIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5hcHBseShcbiAgICAgICAgICAgICAgICAgIHRoYXQsXG4gICAgICAgICAgICAgICAgICBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBib3VuZDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2V0Q3NzIGFwcGxpZXMgZ2l2ZW4gc3R5bGVzIHRvIHRoZSBNb2Rlcm5penIgRE9NIG5vZGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0Q3NzKCBzdHIgKSB7XG4gICAgICAgIG1TdHlsZS5jc3NUZXh0ID0gc3RyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldENzc0FsbCBleHRyYXBvbGF0ZXMgYWxsIHZlbmRvci1zcGVjaWZpYyBjc3Mgc3RyaW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzZXRDc3NBbGwoIHN0cjEsIHN0cjIgKSB7XG4gICAgICAgIHJldHVybiBzZXRDc3MocHJlZml4ZXMuam9pbihzdHIxICsgJzsnKSArICggc3RyMiB8fCAnJyApKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpcyByZXR1cm5zIGEgYm9vbGVhbiBmb3IgaWYgdHlwZW9mIG9iaiBpcyBleGFjdGx5IHR5cGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXMoIG9iaiwgdHlwZSApIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IHR5cGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29udGFpbnMgcmV0dXJucyBhIGJvb2xlYW4gZm9yIGlmIHN1YnN0ciBpcyBmb3VuZCB3aXRoaW4gc3RyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnRhaW5zKCBzdHIsIHN1YnN0ciApIHtcbiAgICAgICAgcmV0dXJuICEhfignJyArIHN0cikuaW5kZXhPZihzdWJzdHIpO1xuICAgIH1cblxuICAgIC8qPj50ZXN0cHJvcCovXG5cbiAgICAvLyB0ZXN0UHJvcHMgaXMgYSBnZW5lcmljIENTUyAvIERPTSBwcm9wZXJ0eSB0ZXN0LlxuXG4gICAgLy8gSW4gdGVzdGluZyBzdXBwb3J0IGZvciBhIGdpdmVuIENTUyBwcm9wZXJ0eSwgaXQncyBsZWdpdCB0byB0ZXN0OlxuICAgIC8vICAgIGBlbGVtLnN0eWxlW3N0eWxlTmFtZV0gIT09IHVuZGVmaW5lZGBcbiAgICAvLyBJZiB0aGUgcHJvcGVydHkgaXMgc3VwcG9ydGVkIGl0IHdpbGwgcmV0dXJuIGFuIGVtcHR5IHN0cmluZyxcbiAgICAvLyBpZiB1bnN1cHBvcnRlZCBpdCB3aWxsIHJldHVybiB1bmRlZmluZWQuXG5cbiAgICAvLyBXZSdsbCB0YWtlIGFkdmFudGFnZSBvZiB0aGlzIHF1aWNrIHRlc3QgYW5kIHNraXAgc2V0dGluZyBhIHN0eWxlXG4gICAgLy8gb24gb3VyIG1vZGVybml6ciBlbGVtZW50LCBidXQgaW5zdGVhZCBqdXN0IHRlc3RpbmcgdW5kZWZpbmVkIHZzXG4gICAgLy8gZW1wdHkgc3RyaW5nLlxuXG4gICAgLy8gQmVjYXVzZSB0aGUgdGVzdGluZyBvZiB0aGUgQ1NTIHByb3BlcnR5IG5hbWVzICh3aXRoIFwiLVwiLCBhc1xuICAgIC8vIG9wcG9zZWQgdG8gdGhlIGNhbWVsQ2FzZSBET00gcHJvcGVydGllcykgaXMgbm9uLXBvcnRhYmxlIGFuZFxuICAgIC8vIG5vbi1zdGFuZGFyZCBidXQgd29ya3MgaW4gV2ViS2l0IGFuZCBJRSAoYnV0IG5vdCBHZWNrbyBvciBPcGVyYSksXG4gICAgLy8gd2UgZXhwbGljaXRseSByZWplY3QgcHJvcGVydGllcyB3aXRoIGRhc2hlcyBzbyB0aGF0IGF1dGhvcnNcbiAgICAvLyBkZXZlbG9waW5nIGluIFdlYktpdCBvciBJRSBmaXJzdCBkb24ndCBlbmQgdXAgd2l0aFxuICAgIC8vIGJyb3dzZXItc3BlY2lmaWMgY29udGVudCBieSBhY2NpZGVudC5cblxuICAgIGZ1bmN0aW9uIHRlc3RQcm9wcyggcHJvcHMsIHByZWZpeGVkICkge1xuICAgICAgICBmb3IgKCB2YXIgaSBpbiBwcm9wcyApIHtcbiAgICAgICAgICAgIHZhciBwcm9wID0gcHJvcHNbaV07XG4gICAgICAgICAgICBpZiAoICFjb250YWlucyhwcm9wLCBcIi1cIikgJiYgbVN0eWxlW3Byb3BdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeGVkID09ICdwZngnID8gcHJvcCA6IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvKj4+dGVzdHByb3AqL1xuXG4gICAgLy8gVE9ETyA6OiBhZGQgdGVzdERPTVByb3BzXG4gICAgLyoqXG4gICAgICogdGVzdERPTVByb3BzIGlzIGEgZ2VuZXJpYyBET00gcHJvcGVydHkgdGVzdDsgaWYgYSBicm93c2VyIHN1cHBvcnRzXG4gICAgICogICBhIGNlcnRhaW4gcHJvcGVydHksIGl0IHdvbid0IHJldHVybiB1bmRlZmluZWQgZm9yIGl0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRlc3RET01Qcm9wcyggcHJvcHMsIG9iaiwgZWxlbSApIHtcbiAgICAgICAgZm9yICggdmFyIGkgaW4gcHJvcHMgKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IG9ialtwcm9wc1tpXV07XG4gICAgICAgICAgICBpZiAoIGl0ZW0gIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBwcm9wZXJ0eSBuYW1lIGFzIGEgc3RyaW5nXG4gICAgICAgICAgICAgICAgaWYgKGVsZW0gPT09IGZhbHNlKSByZXR1cm4gcHJvcHNbaV07XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQncyBiaW5kIGEgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICBpZiAoaXMoaXRlbSwgJ2Z1bmN0aW9uJykpe1xuICAgICAgICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBhdXRvYmluZCB1bmxlc3Mgb3ZlcnJpZGVcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmJpbmQoZWxlbSB8fCBvYmopO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdW5ib3VuZCBmdW5jdGlvbiBvciBvYmogb3IgdmFsdWVcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyo+PnRlc3RhbGxwcm9wcyovXG4gICAgLyoqXG4gICAgICogdGVzdFByb3BzQWxsIHRlc3RzIGEgbGlzdCBvZiBET00gcHJvcGVydGllcyB3ZSB3YW50IHRvIGNoZWNrIGFnYWluc3QuXG4gICAgICogICBXZSBzcGVjaWZ5IGxpdGVyYWxseSBBTEwgcG9zc2libGUgKGtub3duIGFuZC9vciBsaWtlbHkpIHByb3BlcnRpZXMgb25cbiAgICAgKiAgIHRoZSBlbGVtZW50IGluY2x1ZGluZyB0aGUgbm9uLXZlbmRvciBwcmVmaXhlZCBvbmUsIGZvciBmb3J3YXJkLVxuICAgICAqICAgY29tcGF0aWJpbGl0eS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0ZXN0UHJvcHNBbGwoIHByb3AsIHByZWZpeGVkLCBlbGVtICkge1xuXG4gICAgICAgIHZhciB1Y1Byb3AgID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSksXG4gICAgICAgICAgICBwcm9wcyAgID0gKHByb3AgKyAnICcgKyBjc3NvbVByZWZpeGVzLmpvaW4odWNQcm9wICsgJyAnKSArIHVjUHJvcCkuc3BsaXQoJyAnKTtcblxuICAgICAgICAvLyBkaWQgdGhleSBjYWxsIC5wcmVmaXhlZCgnYm94U2l6aW5nJykgb3IgYXJlIHdlIGp1c3QgdGVzdGluZyBhIHByb3A/XG4gICAgICAgIGlmKGlzKHByZWZpeGVkLCBcInN0cmluZ1wiKSB8fCBpcyhwcmVmaXhlZCwgXCJ1bmRlZmluZWRcIikpIHtcbiAgICAgICAgICByZXR1cm4gdGVzdFByb3BzKHByb3BzLCBwcmVmaXhlZCk7XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCB0aGV5IGNhbGxlZCAucHJlZml4ZWQoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsIHdpbmRvd1ssIGVsZW1dKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3BzID0gKHByb3AgKyAnICcgKyAoZG9tUHJlZml4ZXMpLmpvaW4odWNQcm9wICsgJyAnKSArIHVjUHJvcCkuc3BsaXQoJyAnKTtcbiAgICAgICAgICByZXR1cm4gdGVzdERPTVByb3BzKHByb3BzLCBwcmVmaXhlZCwgZWxlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyo+PnRlc3RhbGxwcm9wcyovXG5cblxuICAgIC8qKlxuICAgICAqIFRlc3RzXG4gICAgICogLS0tLS1cbiAgICAgKi9cblxuICAgIC8vIFRoZSAqbmV3KiBmbGV4Ym94XG4gICAgLy8gZGV2LnczLm9yZy9jc3N3Zy9jc3MzLWZsZXhib3hcblxuICAgIHRlc3RzWydmbGV4Ym94J10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwoJ2ZsZXhXcmFwJyk7XG4gICAgfTtcblxuICAgIC8vIFRoZSAqb2xkKiBmbGV4Ym94XG4gICAgLy8gd3d3LnczLm9yZy9UUi8yMDA5L1dELWNzczMtZmxleGJveC0yMDA5MDcyMy9cblxuICAgIHRlc3RzWydmbGV4Ym94bGVnYWN5J10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYm94RGlyZWN0aW9uJyk7XG4gICAgfTtcblxuICAgIC8vIE9uIHRoZSBTNjAgYW5kIEJCIFN0b3JtLCBnZXRDb250ZXh0IGV4aXN0cywgYnV0IGFsd2F5cyByZXR1cm5zIHVuZGVmaW5lZFxuICAgIC8vIHNvIHdlIGFjdHVhbGx5IGhhdmUgdG8gY2FsbCBnZXRDb250ZXh0KCkgdG8gdmVyaWZ5XG4gICAgLy8gZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy9pc3N1ZS85Ny9cblxuICAgIHRlc3RzWydjYW52YXMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICByZXR1cm4gISEoZWxlbS5nZXRDb250ZXh0ICYmIGVsZW0uZ2V0Q29udGV4dCgnMmQnKSk7XG4gICAgfTtcblxuICAgIHRlc3RzWydjYW52YXN0ZXh0J10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhKE1vZGVybml6clsnY2FudmFzJ10gJiYgaXMoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKS5maWxsVGV4dCwgJ2Z1bmN0aW9uJykpO1xuICAgIH07XG5cbiAgICAvLyB3ZWJrLml0LzcwMTE3IGlzIHRyYWNraW5nIGEgbGVnaXQgV2ViR0wgZmVhdHVyZSBkZXRlY3QgcHJvcG9zYWxcblxuICAgIC8vIFdlIGRvIGEgc29mdCBkZXRlY3Qgd2hpY2ggbWF5IGZhbHNlIHBvc2l0aXZlIGluIG9yZGVyIHRvIGF2b2lkXG4gICAgLy8gYW4gZXhwZW5zaXZlIGNvbnRleHQgY3JlYXRpb246IGJ1Z3ppbC5sYS83MzI0NDFcblxuICAgIHRlc3RzWyd3ZWJnbCddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogVGhlIE1vZGVybml6ci50b3VjaCB0ZXN0IG9ubHkgaW5kaWNhdGVzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzXG4gICAgICogICAgdG91Y2ggZXZlbnRzLCB3aGljaCBkb2VzIG5vdCBuZWNlc3NhcmlseSByZWZsZWN0IGEgdG91Y2hzY3JlZW5cbiAgICAgKiAgICBkZXZpY2UsIGFzIGV2aWRlbmNlZCBieSB0YWJsZXRzIHJ1bm5pbmcgV2luZG93cyA3IG9yLCBhbGFzLFxuICAgICAqICAgIHRoZSBQYWxtIFByZSAvIFdlYk9TICh0b3VjaCkgcGhvbmVzLlxuICAgICAqXG4gICAgICogQWRkaXRpb25hbGx5LCBDaHJvbWUgKGRlc2t0b3ApIHVzZWQgdG8gbGllIGFib3V0IGl0cyBzdXBwb3J0IG9uIHRoaXMsXG4gICAgICogICAgYnV0IHRoYXQgaGFzIHNpbmNlIGJlZW4gcmVjdGlmaWVkOiBjcmJ1Zy5jb20vMzY0MTVcbiAgICAgKlxuICAgICAqIFdlIGFsc28gdGVzdCBmb3IgRmlyZWZveCA0IE11bHRpdG91Y2ggU3VwcG9ydC5cbiAgICAgKlxuICAgICAqIEZvciBtb3JlIGluZm8sIHNlZTogbW9kZXJuaXpyLmdpdGh1Yi5jb20vTW9kZXJuaXpyL3RvdWNoLmh0bWxcbiAgICAgKi9cblxuICAgIHRlc3RzWyd0b3VjaCddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib29sO1xuXG4gICAgICAgIGlmKCgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHx8IHdpbmRvdy5Eb2N1bWVudFRvdWNoICYmIGRvY3VtZW50IGluc3RhbmNlb2YgRG9jdW1lbnRUb3VjaCkge1xuICAgICAgICAgIGJvb2wgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluamVjdEVsZW1lbnRXaXRoU3R5bGVzKFsnQG1lZGlhICgnLHByZWZpeGVzLmpvaW4oJ3RvdWNoLWVuYWJsZWQpLCgnKSxtb2QsJyknLCd7I21vZGVybml6cnt0b3A6OXB4O3Bvc2l0aW9uOmFic29sdXRlfX0nXS5qb2luKCcnKSwgZnVuY3Rpb24oIG5vZGUgKSB7XG4gICAgICAgICAgICBib29sID0gbm9kZS5vZmZzZXRUb3AgPT09IDk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYm9vbDtcbiAgICB9O1xuXG5cbiAgICAvLyBnZW9sb2NhdGlvbiBpcyBvZnRlbiBjb25zaWRlcmVkIGEgdHJpdmlhbCBmZWF0dXJlIGRldGVjdC4uLlxuICAgIC8vIFR1cm5zIG91dCwgaXQncyBxdWl0ZSB0cmlja3kgdG8gZ2V0IHJpZ2h0OlxuICAgIC8vXG4gICAgLy8gVXNpbmcgISFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24gZG9lcyB0d28gdGhpbmdzIHdlIGRvbid0IHdhbnQuIEl0OlxuICAgIC8vICAgMS4gTGVha3MgbWVtb3J5IGluIElFOTogZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy81MTNcbiAgICAvLyAgIDIuIERpc2FibGVzIHBhZ2UgY2FjaGluZyBpbiBXZWJLaXQ6IHdlYmsuaXQvNDM5NTZcbiAgICAvL1xuICAgIC8vIE1lYW53aGlsZSwgaW4gRmlyZWZveCA8IDgsIGFuIGFib3V0OmNvbmZpZyBzZXR0aW5nIGNvdWxkIGV4cG9zZVxuICAgIC8vIGEgZmFsc2UgcG9zaXRpdmUgdGhhdCB3b3VsZCB0aHJvdyBhbiBleGNlcHRpb246IGJ1Z3ppbC5sYS82ODgxNThcblxuICAgIHRlc3RzWydnZW9sb2NhdGlvbiddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnZ2VvbG9jYXRpb24nIGluIG5hdmlnYXRvcjtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1sncG9zdG1lc3NhZ2UnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICEhd2luZG93LnBvc3RNZXNzYWdlO1xuICAgIH07XG5cblxuICAgIC8vIENocm9tZSBpbmNvZ25pdG8gbW9kZSB1c2VkIHRvIHRocm93IGFuIGV4Y2VwdGlvbiB3aGVuIHVzaW5nIG9wZW5EYXRhYmFzZVxuICAgIC8vIEl0IGRvZXNuJ3QgYW55bW9yZS5cbiAgICB0ZXN0c1snd2Vic3FsZGF0YWJhc2UnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICEhd2luZG93Lm9wZW5EYXRhYmFzZTtcbiAgICB9O1xuXG4gICAgLy8gVmVuZG9ycyBoYWQgaW5jb25zaXN0ZW50IHByZWZpeGluZyB3aXRoIHRoZSBleHBlcmltZW50YWwgSW5kZXhlZCBEQjpcbiAgICAvLyAtIFdlYmtpdCdzIGltcGxlbWVudGF0aW9uIGlzIGFjY2Vzc2libGUgdGhyb3VnaCB3ZWJraXRJbmRleGVkREJcbiAgICAvLyAtIEZpcmVmb3ggc2hpcHBlZCBtb3pfaW5kZXhlZERCIGJlZm9yZSBGRjRiOSwgYnV0IHNpbmNlIHRoZW4gaGFzIGJlZW4gbW96SW5kZXhlZERCXG4gICAgLy8gRm9yIHNwZWVkLCB3ZSBkb24ndCB0ZXN0IHRoZSBsZWdhY3kgKGFuZCBiZXRhLW9ubHkpIGluZGV4ZWREQlxuICAgIHRlc3RzWydpbmRleGVkREInXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICEhdGVzdFByb3BzQWxsKFwiaW5kZXhlZERCXCIsIHdpbmRvdyk7XG4gICAgfTtcblxuICAgIC8vIGRvY3VtZW50TW9kZSBsb2dpYyBmcm9tIFlVSSB0byBmaWx0ZXIgb3V0IElFOCBDb21wYXQgTW9kZVxuICAgIC8vICAgd2hpY2ggZmFsc2UgcG9zaXRpdmVzLlxuICAgIHRlc3RzWydoYXNoY2hhbmdlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpc0V2ZW50U3VwcG9ydGVkKCdoYXNoY2hhbmdlJywgd2luZG93KSAmJiAoZG9jdW1lbnQuZG9jdW1lbnRNb2RlID09PSB1bmRlZmluZWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID4gNyk7XG4gICAgfTtcblxuICAgIC8vIFBlciAxLjY6XG4gICAgLy8gVGhpcyB1c2VkIHRvIGJlIE1vZGVybml6ci5oaXN0b3J5bWFuYWdlbWVudCBidXQgdGhlIGxvbmdlclxuICAgIC8vIG5hbWUgaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBhIHNob3J0ZXIgYW5kIHByb3BlcnR5LW1hdGNoaW5nIG9uZS5cbiAgICAvLyBUaGUgb2xkIEFQSSBpcyBzdGlsbCBhdmFpbGFibGUgaW4gMS42LCBidXQgYXMgb2YgMi4wIHdpbGwgdGhyb3cgYSB3YXJuaW5nLFxuICAgIC8vIGFuZCBpbiB0aGUgZmlyc3QgcmVsZWFzZSB0aGVyZWFmdGVyIGRpc2FwcGVhciBlbnRpcmVseS5cbiAgICB0ZXN0c1snaGlzdG9yeSddID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISEod2luZG93Lmhpc3RvcnkgJiYgaGlzdG9yeS5wdXNoU3RhdGUpO1xuICAgIH07XG5cbiAgICB0ZXN0c1snZHJhZ2FuZGRyb3AnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJldHVybiAoJ2RyYWdnYWJsZScgaW4gZGl2KSB8fCAoJ29uZHJhZ3N0YXJ0JyBpbiBkaXYgJiYgJ29uZHJvcCcgaW4gZGl2KTtcbiAgICB9O1xuXG4gICAgLy8gRkYzLjYgd2FzIEVPTCdlZCBvbiA0LzI0LzEyLCBidXQgdGhlIEVTUiB2ZXJzaW9uIG9mIEZGMTBcbiAgICAvLyB3aWxsIGJlIHN1cHBvcnRlZCB1bnRpbCBGRjE5ICgyLzEyLzEzKSwgYXQgd2hpY2ggdGltZSwgRVNSIGJlY29tZXMgRkYxNy5cbiAgICAvLyBGRjEwIHN0aWxsIHVzZXMgcHJlZml4ZXMsIHNvIGNoZWNrIGZvciBpdCB1bnRpbCB0aGVuLlxuICAgIC8vIGZvciBtb3JlIEVTUiBpbmZvLCBzZWU6IG1vemlsbGEub3JnL2VuLVVTL2ZpcmVmb3gvb3JnYW5pemF0aW9ucy9mYXEvXG4gICAgdGVzdHNbJ3dlYnNvY2tldHMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJ1dlYlNvY2tldCcgaW4gd2luZG93IHx8ICdNb3pXZWJTb2NrZXQnIGluIHdpbmRvdztcbiAgICB9O1xuXG5cbiAgICAvLyBjc3MtdHJpY2tzLmNvbS9yZ2JhLWJyb3dzZXItc3VwcG9ydC9cbiAgICB0ZXN0c1sncmdiYSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFNldCBhbiByZ2JhKCkgY29sb3IgYW5kIGNoZWNrIHRoZSByZXR1cm5lZCB2YWx1ZVxuXG4gICAgICAgIHNldENzcygnYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDE1MCwyNTUsMTUwLC41KScpO1xuXG4gICAgICAgIHJldHVybiBjb250YWlucyhtU3R5bGUuYmFja2dyb3VuZENvbG9yLCAncmdiYScpO1xuICAgIH07XG5cbiAgICB0ZXN0c1snaHNsYSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFNhbWUgYXMgcmdiYSgpLCBpbiBmYWN0LCBicm93c2VycyByZS1tYXAgaHNsYSgpIHRvIHJnYmEoKSBpbnRlcm5hbGx5LFxuICAgICAgICAvLyAgIGV4Y2VwdCBJRTkgd2hvIHJldGFpbnMgaXQgYXMgaHNsYVxuXG4gICAgICAgIHNldENzcygnYmFja2dyb3VuZC1jb2xvcjpoc2xhKDEyMCw0MCUsMTAwJSwuNSknKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbnMobVN0eWxlLmJhY2tncm91bmRDb2xvciwgJ3JnYmEnKSB8fCBjb250YWlucyhtU3R5bGUuYmFja2dyb3VuZENvbG9yLCAnaHNsYScpO1xuICAgIH07XG5cbiAgICB0ZXN0c1snbXVsdGlwbGViZ3MnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBTZXR0aW5nIG11bHRpcGxlIGltYWdlcyBBTkQgYSBjb2xvciBvbiB0aGUgYmFja2dyb3VuZCBzaG9ydGhhbmQgcHJvcGVydHlcbiAgICAgICAgLy8gIGFuZCB0aGVuIHF1ZXJ5aW5nIHRoZSBzdHlsZS5iYWNrZ3JvdW5kIHByb3BlcnR5IHZhbHVlIGZvciB0aGUgbnVtYmVyIG9mXG4gICAgICAgIC8vICBvY2N1cnJlbmNlcyBvZiBcInVybChcIiBpcyBhIHJlbGlhYmxlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIEFDVFVBTCBzdXBwb3J0IGZvciB0aGlzIVxuXG4gICAgICAgIHNldENzcygnYmFja2dyb3VuZDp1cmwoaHR0cHM6Ly8pLHVybChodHRwczovLykscmVkIHVybChodHRwczovLyknKTtcblxuICAgICAgICAvLyBJZiB0aGUgVUEgc3VwcG9ydHMgbXVsdGlwbGUgYmFja2dyb3VuZHMsIHRoZXJlIHNob3VsZCBiZSB0aHJlZSBvY2N1cnJlbmNlc1xuICAgICAgICAvLyAgIG9mIHRoZSBzdHJpbmcgXCJ1cmwoXCIgaW4gdGhlIHJldHVybiB2YWx1ZSBmb3IgZWxlbVN0eWxlLmJhY2tncm91bmRcblxuICAgICAgICByZXR1cm4gKC8odXJsXFxzKlxcKC4qPyl7M30vKS50ZXN0KG1TdHlsZS5iYWNrZ3JvdW5kKTtcbiAgICB9O1xuXG5cblxuICAgIC8vIHRoaXMgd2lsbCBmYWxzZSBwb3NpdGl2ZSBpbiBPcGVyYSBNaW5pXG4gICAgLy8gICBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzM5NlxuXG4gICAgdGVzdHNbJ2JhY2tncm91bmRzaXplJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYmFja2dyb3VuZFNpemUnKTtcbiAgICB9O1xuXG4gICAgdGVzdHNbJ2JvcmRlcmltYWdlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYm9yZGVySW1hZ2UnKTtcbiAgICB9O1xuXG5cbiAgICAvLyBTdXBlciBjb21wcmVoZW5zaXZlIHRhYmxlIGFib3V0IGFsbCB0aGUgdW5pcXVlIGltcGxlbWVudGF0aW9ucyBvZlxuICAgIC8vIGJvcmRlci1yYWRpdXM6IG11ZGRsZWRyYW1ibGluZ3MuY29tL3RhYmxlLW9mLWNzczMtYm9yZGVyLXJhZGl1cy1jb21wbGlhbmNlXG5cbiAgICB0ZXN0c1snYm9yZGVycmFkaXVzJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYm9yZGVyUmFkaXVzJyk7XG4gICAgfTtcblxuICAgIC8vIFdlYk9TIHVuZm9ydHVuYXRlbHkgZmFsc2UgcG9zaXRpdmVzIG9uIHRoaXMgdGVzdC5cbiAgICB0ZXN0c1snYm94c2hhZG93J10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYm94U2hhZG93Jyk7XG4gICAgfTtcblxuICAgIC8vIEZGMy4wIHdpbGwgZmFsc2UgcG9zaXRpdmUgb24gdGhpcyB0ZXN0XG4gICAgdGVzdHNbJ3RleHRzaGFkb3cnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jykuc3R5bGUudGV4dFNoYWRvdyA9PT0gJyc7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ29wYWNpdHknXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBCcm93c2VycyB0aGF0IGFjdHVhbGx5IGhhdmUgQ1NTIE9wYWNpdHkgaW1wbGVtZW50ZWQgaGF2ZSBkb25lIHNvXG4gICAgICAgIC8vICBhY2NvcmRpbmcgdG8gc3BlYywgd2hpY2ggbWVhbnMgdGhlaXIgcmV0dXJuIHZhbHVlcyBhcmUgd2l0aGluIHRoZVxuICAgICAgICAvLyAgcmFuZ2Ugb2YgWzAuMCwxLjBdIC0gaW5jbHVkaW5nIHRoZSBsZWFkaW5nIHplcm8uXG5cbiAgICAgICAgc2V0Q3NzQWxsKCdvcGFjaXR5Oi41NScpO1xuXG4gICAgICAgIC8vIFRoZSBub24tbGl0ZXJhbCAuIGluIHRoaXMgcmVnZXggaXMgaW50ZW50aW9uYWw6XG4gICAgICAgIC8vICAgR2VybWFuIENocm9tZSByZXR1cm5zIHRoaXMgdmFsdWUgYXMgMCw1NVxuICAgICAgICAvLyBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLyNpc3N1ZS81OS9jb21tZW50LzUxNjYzMlxuICAgICAgICByZXR1cm4gKC9eMC41NSQvKS50ZXN0KG1TdHlsZS5vcGFjaXR5KTtcbiAgICB9O1xuXG5cbiAgICAvLyBOb3RlLCBBbmRyb2lkIDwgNCB3aWxsIHBhc3MgdGhpcyB0ZXN0LCBidXQgY2FuIG9ubHkgYW5pbWF0ZVxuICAgIC8vICAgYSBzaW5nbGUgcHJvcGVydHkgYXQgYSB0aW1lXG4gICAgLy8gICBnb28uZ2wvdjNWNEdwXG4gICAgdGVzdHNbJ2Nzc2FuaW1hdGlvbnMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdhbmltYXRpb25OYW1lJyk7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ2Nzc2NvbHVtbnMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdjb2x1bW5Db3VudCcpO1xuICAgIH07XG5cblxuICAgIHRlc3RzWydjc3NncmFkaWVudHMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRm9yIENTUyBHcmFkaWVudHMgc3ludGF4LCBwbGVhc2Ugc2VlOlxuICAgICAgICAgKiB3ZWJraXQub3JnL2Jsb2cvMTc1L2ludHJvZHVjaW5nLWNzcy1ncmFkaWVudHMvXG4gICAgICAgICAqIGRldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9DU1MvLW1vei1saW5lYXItZ3JhZGllbnRcbiAgICAgICAgICogZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0NTUy8tbW96LXJhZGlhbC1ncmFkaWVudFxuICAgICAgICAgKiBkZXYudzMub3JnL2Nzc3dnL2NzczMtaW1hZ2VzLyNncmFkaWVudHMtXG4gICAgICAgICAqL1xuXG4gICAgICAgIHZhciBzdHIxID0gJ2JhY2tncm91bmQtaW1hZ2U6JyxcbiAgICAgICAgICAgIHN0cjIgPSAnZ3JhZGllbnQobGluZWFyLGxlZnQgdG9wLHJpZ2h0IGJvdHRvbSxmcm9tKCM5ZjkpLHRvKHdoaXRlKSk7JyxcbiAgICAgICAgICAgIHN0cjMgPSAnbGluZWFyLWdyYWRpZW50KGxlZnQgdG9wLCM5ZjksIHdoaXRlKTsnO1xuXG4gICAgICAgIHNldENzcyhcbiAgICAgICAgICAgICAvLyBsZWdhY3kgd2Via2l0IHN5bnRheCAoRklYTUU6IHJlbW92ZSB3aGVuIHN5bnRheCBub3QgaW4gdXNlIGFueW1vcmUpXG4gICAgICAgICAgICAgIChzdHIxICsgJy13ZWJraXQtICcuc3BsaXQoJyAnKS5qb2luKHN0cjIgKyBzdHIxKSArXG4gICAgICAgICAgICAgLy8gc3RhbmRhcmQgc3ludGF4ICAgICAgICAgICAgIC8vIHRyYWlsaW5nICdiYWNrZ3JvdW5kLWltYWdlOidcbiAgICAgICAgICAgICAgcHJlZml4ZXMuam9pbihzdHIzICsgc3RyMSkpLnNsaWNlKDAsIC1zdHIxLmxlbmd0aClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gY29udGFpbnMobVN0eWxlLmJhY2tncm91bmRJbWFnZSwgJ2dyYWRpZW50Jyk7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ2Nzc3JlZmxlY3Rpb25zJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnYm94UmVmbGVjdCcpO1xuICAgIH07XG5cblxuICAgIHRlc3RzWydjc3N0cmFuc2Zvcm1zJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhdGVzdFByb3BzQWxsKCd0cmFuc2Zvcm0nKTtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snY3NzdHJhbnNmb3JtczNkJ10gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcmV0ID0gISF0ZXN0UHJvcHNBbGwoJ3BlcnNwZWN0aXZlJyk7XG5cbiAgICAgICAgLy8gV2Via2l0J3MgM0QgdHJhbnNmb3JtcyBhcmUgcGFzc2VkIG9mZiB0byB0aGUgYnJvd3NlcidzIG93biBncmFwaGljcyByZW5kZXJlci5cbiAgICAgICAgLy8gICBJdCB3b3JrcyBmaW5lIGluIFNhZmFyaSBvbiBMZW9wYXJkIGFuZCBTbm93IExlb3BhcmQsIGJ1dCBub3QgaW4gQ2hyb21lIGluXG4gICAgICAgIC8vICAgc29tZSBjb25kaXRpb25zLiBBcyBhIHJlc3VsdCwgV2Via2l0IHR5cGljYWxseSByZWNvZ25pemVzIHRoZSBzeW50YXggYnV0XG4gICAgICAgIC8vICAgd2lsbCBzb21ldGltZXMgdGhyb3cgYSBmYWxzZSBwb3NpdGl2ZSwgdGh1cyB3ZSBtdXN0IGRvIGEgbW9yZSB0aG9yb3VnaCBjaGVjazpcbiAgICAgICAgaWYgKCByZXQgJiYgJ3dlYmtpdFBlcnNwZWN0aXZlJyBpbiBkb2NFbGVtZW50LnN0eWxlICkge1xuXG4gICAgICAgICAgLy8gV2Via2l0IGFsbG93cyB0aGlzIG1lZGlhIHF1ZXJ5IHRvIHN1Y2NlZWQgb25seSBpZiB0aGUgZmVhdHVyZSBpcyBlbmFibGVkLlxuICAgICAgICAgIC8vIGBAbWVkaWEgKHRyYW5zZm9ybS0zZCksKC13ZWJraXQtdHJhbnNmb3JtLTNkKXsgLi4uIH1gXG4gICAgICAgICAgaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMoJ0BtZWRpYSAodHJhbnNmb3JtLTNkKSwoLXdlYmtpdC10cmFuc2Zvcm0tM2QpeyNtb2Rlcm5penJ7bGVmdDo5cHg7cG9zaXRpb246YWJzb2x1dGU7aGVpZ2h0OjNweDt9fScsIGZ1bmN0aW9uKCBub2RlLCBydWxlICkge1xuICAgICAgICAgICAgcmV0ID0gbm9kZS5vZmZzZXRMZWZ0ID09PSA5ICYmIG5vZGUub2Zmc2V0SGVpZ2h0ID09PSAzO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ2Nzc3RyYW5zaXRpb25zJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgndHJhbnNpdGlvbicpO1xuICAgIH07XG5cblxuICAgIC8qPj5mb250ZmFjZSovXG4gICAgLy8gQGZvbnQtZmFjZSBkZXRlY3Rpb24gcm91dGluZSBieSBEaWVnbyBQZXJpbmlcbiAgICAvLyBqYXZhc2NyaXB0Lm53Ym94LmNvbS9DU1NTdXBwb3J0L1xuXG4gICAgLy8gZmFsc2UgcG9zaXRpdmVzOlxuICAgIC8vICAgV2ViT1MgZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy8zNDJcbiAgICAvLyAgIFdQNyAgIGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvNTM4XG4gICAgdGVzdHNbJ2ZvbnRmYWNlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJvb2w7XG5cbiAgICAgICAgaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMoJ0Bmb250LWZhY2Uge2ZvbnQtZmFtaWx5OlwiZm9udFwiO3NyYzp1cmwoXCJodHRwczovL1wiKX0nLCBmdW5jdGlvbiggbm9kZSwgcnVsZSApIHtcbiAgICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc21vZGVybml6cicpLFxuICAgICAgICAgICAgICBzaGVldCA9IHN0eWxlLnNoZWV0IHx8IHN0eWxlLnN0eWxlU2hlZXQsXG4gICAgICAgICAgICAgIGNzc1RleHQgPSBzaGVldCA/IChzaGVldC5jc3NSdWxlcyAmJiBzaGVldC5jc3NSdWxlc1swXSA/IHNoZWV0LmNzc1J1bGVzWzBdLmNzc1RleHQgOiBzaGVldC5jc3NUZXh0IHx8ICcnKSA6ICcnO1xuXG4gICAgICAgICAgYm9vbCA9IC9zcmMvaS50ZXN0KGNzc1RleHQpICYmIGNzc1RleHQuaW5kZXhPZihydWxlLnNwbGl0KCcgJylbMF0pID09PSAwO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYm9vbDtcbiAgICB9O1xuICAgIC8qPj5mb250ZmFjZSovXG5cbiAgICAvLyBDU1MgZ2VuZXJhdGVkIGNvbnRlbnQgZGV0ZWN0aW9uXG4gICAgdGVzdHNbJ2dlbmVyYXRlZGNvbnRlbnQnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm9vbDtcblxuICAgICAgICBpbmplY3RFbGVtZW50V2l0aFN0eWxlcyhbJyMnLG1vZCwne2ZvbnQ6MC8wIGF9IycsbW9kLCc6YWZ0ZXJ7Y29udGVudDpcIicsc21pbGUsJ1wiO3Zpc2liaWxpdHk6aGlkZGVuO2ZvbnQ6M3B4LzEgYX0nXS5qb2luKCcnKSwgZnVuY3Rpb24oIG5vZGUgKSB7XG4gICAgICAgICAgYm9vbCA9IG5vZGUub2Zmc2V0SGVpZ2h0ID49IDM7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBib29sO1xuICAgIH07XG5cblxuXG4gICAgLy8gVGhlc2UgdGVzdHMgZXZhbHVhdGUgc3VwcG9ydCBvZiB0aGUgdmlkZW8vYXVkaW8gZWxlbWVudHMsIGFzIHdlbGwgYXNcbiAgICAvLyB0ZXN0aW5nIHdoYXQgdHlwZXMgb2YgY29udGVudCB0aGV5IHN1cHBvcnQuXG4gICAgLy9cbiAgICAvLyBXZSdyZSB1c2luZyB0aGUgQm9vbGVhbiBjb25zdHJ1Y3RvciBoZXJlLCBzbyB0aGF0IHdlIGNhbiBleHRlbmQgdGhlIHZhbHVlXG4gICAgLy8gZS5nLiAgTW9kZXJuaXpyLnZpZGVvICAgICAvLyB0cnVlXG4gICAgLy8gICAgICAgTW9kZXJuaXpyLnZpZGVvLm9nZyAvLyAncHJvYmFibHknXG4gICAgLy9cbiAgICAvLyBDb2RlYyB2YWx1ZXMgZnJvbSA6IGdpdGh1Yi5jb20vTmllbHNMZWVuaGVlci9odG1sNXRlc3QvYmxvYi85MTA2YTgvaW5kZXguaHRtbCNMODQ1XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB0aHggdG8gTmllbHNMZWVuaGVlciBhbmQgemNvcnBhblxuXG4gICAgLy8gTm90ZTogaW4gc29tZSBvbGRlciBicm93c2VycywgXCJub1wiIHdhcyBhIHJldHVybiB2YWx1ZSBpbnN0ZWFkIG9mIGVtcHR5IHN0cmluZy5cbiAgICAvLyAgIEl0IHdhcyBsaXZlIGluIEZGMy41LjAgYW5kIDMuNS4xLCBidXQgZml4ZWQgaW4gMy41LjJcbiAgICAvLyAgIEl0IHdhcyBhbHNvIGxpdmUgaW4gU2FmYXJpIDQuMC4wIC0gNC4wLjQsIGJ1dCBmaXhlZCBpbiA0LjAuNVxuXG4gICAgdGVzdHNbJ3ZpZGVvJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpLFxuICAgICAgICAgICAgYm9vbCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIElFOSBSdW5uaW5nIG9uIFdpbmRvd3MgU2VydmVyIFNLVSBjYW4gY2F1c2UgYW4gZXhjZXB0aW9uIHRvIGJlIHRocm93biwgYnVnICMyMjRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICggYm9vbCA9ICEhZWxlbS5jYW5QbGF5VHlwZSApIHtcbiAgICAgICAgICAgICAgICBib29sICAgICAgPSBuZXcgQm9vbGVhbihib29sKTtcbiAgICAgICAgICAgICAgICBib29sLm9nZyAgPSBlbGVtLmNhblBsYXlUeXBlKCd2aWRlby9vZ2c7IGNvZGVjcz1cInRoZW9yYVwiJykgICAgICAucmVwbGFjZSgvXm5vJC8sJycpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2l0aG91dCBRdWlja1RpbWUsIHRoaXMgdmFsdWUgd2lsbCBiZSBgdW5kZWZpbmVkYC4gZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy81NDZcbiAgICAgICAgICAgICAgICBib29sLmgyNjQgPSBlbGVtLmNhblBsYXlUeXBlKCd2aWRlby9tcDQ7IGNvZGVjcz1cImF2YzEuNDJFMDFFXCInKSAucmVwbGFjZSgvXm5vJC8sJycpO1xuXG4gICAgICAgICAgICAgICAgYm9vbC53ZWJtID0gZWxlbS5jYW5QbGF5VHlwZSgndmlkZW8vd2VibTsgY29kZWNzPVwidnA4LCB2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCcnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoKGUpIHsgfVxuXG4gICAgICAgIHJldHVybiBib29sO1xuICAgIH07XG5cbiAgICB0ZXN0c1snYXVkaW8nXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F1ZGlvJyksXG4gICAgICAgICAgICBib29sID0gZmFsc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICggYm9vbCA9ICEhZWxlbS5jYW5QbGF5VHlwZSApIHtcbiAgICAgICAgICAgICAgICBib29sICAgICAgPSBuZXcgQm9vbGVhbihib29sKTtcbiAgICAgICAgICAgICAgICBib29sLm9nZyAgPSBlbGVtLmNhblBsYXlUeXBlKCdhdWRpby9vZ2c7IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sJycpO1xuICAgICAgICAgICAgICAgIGJvb2wubXAzICA9IGVsZW0uY2FuUGxheVR5cGUoJ2F1ZGlvL21wZWc7JykgICAgICAgICAgICAgICAucmVwbGFjZSgvXm5vJC8sJycpO1xuXG4gICAgICAgICAgICAgICAgLy8gTWltZXR5cGVzIGFjY2VwdGVkOlxuICAgICAgICAgICAgICAgIC8vICAgZGV2ZWxvcGVyLm1vemlsbGEub3JnL0VuL01lZGlhX2Zvcm1hdHNfc3VwcG9ydGVkX2J5X3RoZV9hdWRpb19hbmRfdmlkZW9fZWxlbWVudHNcbiAgICAgICAgICAgICAgICAvLyAgIGJpdC5seS9pcGhvbmVvc2NvZGVjc1xuICAgICAgICAgICAgICAgIGJvb2wud2F2ICA9IGVsZW0uY2FuUGxheVR5cGUoJ2F1ZGlvL3dhdjsgY29kZWNzPVwiMVwiJykgICAgIC5yZXBsYWNlKC9ebm8kLywnJyk7XG4gICAgICAgICAgICAgICAgYm9vbC5tNGEgID0gKCBlbGVtLmNhblBsYXlUeXBlKCdhdWRpby94LW00YTsnKSAgICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtLmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykpICAgICAgICAgICAgIC5yZXBsYWNlKC9ebm8kLywnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2goZSkgeyB9XG5cbiAgICAgICAgcmV0dXJuIGJvb2w7XG4gICAgfTtcblxuXG4gICAgLy8gSW4gRkY0LCBpZiBkaXNhYmxlZCwgd2luZG93LmxvY2FsU3RvcmFnZSBzaG91bGQgPT09IG51bGwuXG5cbiAgICAvLyBOb3JtYWxseSwgd2UgY291bGQgbm90IHRlc3QgdGhhdCBkaXJlY3RseSBhbmQgbmVlZCB0byBkbyBhXG4gICAgLy8gICBgKCdsb2NhbFN0b3JhZ2UnIGluIHdpbmRvdykgJiYgYCB0ZXN0IGZpcnN0IGJlY2F1c2Ugb3RoZXJ3aXNlIEZpcmVmb3ggd2lsbFxuICAgIC8vICAgdGhyb3cgYnVnemlsLmxhLzM2NTc3MiBpZiBjb29raWVzIGFyZSBkaXNhYmxlZFxuXG4gICAgLy8gQWxzbyBpbiBpT1M1IFByaXZhdGUgQnJvd3NpbmcgbW9kZSwgYXR0ZW1wdGluZyB0byB1c2UgbG9jYWxTdG9yYWdlLnNldEl0ZW1cbiAgICAvLyB3aWxsIHRocm93IHRoZSBleGNlcHRpb246XG4gICAgLy8gICBRVU9UQV9FWENFRURFRF9FUlJST1IgRE9NIEV4Y2VwdGlvbiAyMi5cbiAgICAvLyBQZWN1bGlhcmx5LCBnZXRJdGVtIGFuZCByZW1vdmVJdGVtIGNhbGxzIGRvIG5vdCB0aHJvdy5cblxuICAgIC8vIEJlY2F1c2Ugd2UgYXJlIGZvcmNlZCB0byB0cnkvY2F0Y2ggdGhpcywgd2UnbGwgZ28gYWdncmVzc2l2ZS5cblxuICAgIC8vIEp1c3QgRldJVzogSUU4IENvbXBhdCBtb2RlIHN1cHBvcnRzIHRoZXNlIGZlYXR1cmVzIGNvbXBsZXRlbHk6XG4gICAgLy8gICB3d3cucXVpcmtzbW9kZS5vcmcvZG9tL2h0bWw1Lmh0bWxcbiAgICAvLyBCdXQgSUU4IGRvZXNuJ3Qgc3VwcG9ydCBlaXRoZXIgd2l0aCBsb2NhbCBmaWxlc1xuXG4gICAgdGVzdHNbJ2xvY2Fsc3RvcmFnZSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShtb2QsIG1vZCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShtb2QpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRlc3RzWydzZXNzaW9uc3RvcmFnZSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKG1vZCwgbW9kKTtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0obW9kKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIHRlc3RzWyd3ZWJ3b3JrZXJzJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhd2luZG93LldvcmtlcjtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snYXBwbGljYXRpb25jYWNoZSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIXdpbmRvdy5hcHBsaWNhdGlvbkNhY2hlO1xuICAgIH07XG5cblxuICAgIC8vIFRoYW5rcyB0byBFcmlrIERhaGxzdHJvbVxuICAgIHRlc3RzWydzdmcnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgISFkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMuc3ZnLCAnc3ZnJykuY3JlYXRlU1ZHUmVjdDtcbiAgICB9O1xuXG4gICAgLy8gc3BlY2lmaWNhbGx5IGZvciBTVkcgaW5saW5lIGluIEhUTUwsIG5vdCB3aXRoaW4gWEhUTUxcbiAgICAvLyB0ZXN0IHBhZ2U6IHBhdWxpcmlzaC5jb20vZGVtby9pbmxpbmUtc3ZnXG4gICAgdGVzdHNbJ2lubGluZXN2ZyddID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gJzxzdmcvPic7XG4gICAgICByZXR1cm4gKGRpdi5maXJzdENoaWxkICYmIGRpdi5maXJzdENoaWxkLm5hbWVzcGFjZVVSSSkgPT0gbnMuc3ZnO1xuICAgIH07XG5cbiAgICAvLyBTVkcgU01JTCBhbmltYXRpb25cbiAgICB0ZXN0c1snc21pbCddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJiAvU1ZHQW5pbWF0ZS8udGVzdCh0b1N0cmluZy5jYWxsKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucy5zdmcsICdhbmltYXRlJykpKTtcbiAgICB9O1xuXG4gICAgLy8gVGhpcyB0ZXN0IGlzIG9ubHkgZm9yIGNsaXAgcGF0aHMgaW4gU1ZHIHByb3Blciwgbm90IGNsaXAgcGF0aHMgb24gSFRNTCBjb250ZW50XG4gICAgLy8gZGVtbzogc3J1ZmFjdWx0eS5zcnUuZWR1L2RhdmlkLmRhaWxleS9zdmcvbmV3c3R1ZmYvY2xpcFBhdGg0LnN2Z1xuXG4gICAgLy8gSG93ZXZlciByZWFkIHRoZSBjb21tZW50cyB0byBkaWcgaW50byBhcHBseWluZyBTVkcgY2xpcHBhdGhzIHRvIEhUTUwgY29udGVudCBoZXJlOlxuICAgIC8vICAgZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy8yMTMjaXNzdWVjb21tZW50LTExNDk0OTFcbiAgICB0ZXN0c1snc3ZnY2xpcHBhdGhzJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmIC9TVkdDbGlwUGF0aC8udGVzdCh0b1N0cmluZy5jYWxsKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucy5zdmcsICdjbGlwUGF0aCcpKSk7XG4gICAgfTtcblxuICAgIC8qPj53ZWJmb3JtcyovXG4gICAgLy8gaW5wdXQgZmVhdHVyZXMgYW5kIGlucHV0IHR5cGVzIGdvIGRpcmVjdGx5IG9udG8gdGhlIHJldCBvYmplY3QsIGJ5cGFzc2luZyB0aGUgdGVzdHMgbG9vcC5cbiAgICAvLyBIb2xkIHRoaXMgZ3V5IHRvIGV4ZWN1dGUgaW4gYSBtb21lbnQuXG4gICAgZnVuY3Rpb24gd2ViZm9ybXMoKSB7XG4gICAgICAgIC8qPj5pbnB1dCovXG4gICAgICAgIC8vIFJ1biB0aHJvdWdoIEhUTUw1J3MgbmV3IGlucHV0IGF0dHJpYnV0ZXMgdG8gc2VlIGlmIHRoZSBVQSB1bmRlcnN0YW5kcyBhbnkuXG4gICAgICAgIC8vIFdlJ3JlIHVzaW5nIGYgd2hpY2ggaXMgdGhlIDxpbnB1dD4gZWxlbWVudCBjcmVhdGVkIGVhcmx5IG9uXG4gICAgICAgIC8vIE1pa2UgVGF5bHIgaGFzIGNyZWF0ZWQgYSBjb21wcmVoZW5zaXZlIHJlc291cmNlIGZvciB0ZXN0aW5nIHRoZXNlIGF0dHJpYnV0ZXNcbiAgICAgICAgLy8gICB3aGVuIGFwcGxpZWQgdG8gYWxsIGlucHV0IHR5cGVzOlxuICAgICAgICAvLyAgIG1pa2V0YXlsci5jb20vY29kZS9pbnB1dC10eXBlLWF0dHIuaHRtbFxuICAgICAgICAvLyBzcGVjOiB3d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS1pbnB1dC1lbGVtZW50Lmh0bWwjaW5wdXQtdHlwZS1hdHRyLXN1bW1hcnlcblxuICAgICAgICAvLyBPbmx5IGlucHV0IHBsYWNlaG9sZGVyIGlzIHRlc3RlZCB3aGlsZSB0ZXh0YXJlYSdzIHBsYWNlaG9sZGVyIGlzIG5vdC5cbiAgICAgICAgLy8gQ3VycmVudGx5IFNhZmFyaSA0IGFuZCBPcGVyYSAxMSBoYXZlIHN1cHBvcnQgb25seSBmb3IgdGhlIGlucHV0IHBsYWNlaG9sZGVyXG4gICAgICAgIC8vIEJvdGggdGVzdHMgYXJlIGF2YWlsYWJsZSBpbiBmZWF0dXJlLWRldGVjdHMvZm9ybXMtcGxhY2Vob2xkZXIuanNcbiAgICAgICAgTW9kZXJuaXpyWydpbnB1dCddID0gKGZ1bmN0aW9uKCBwcm9wcyApIHtcbiAgICAgICAgICAgIGZvciAoIHZhciBpID0gMCwgbGVuID0gcHJvcHMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgYXR0cnNbIHByb3BzW2ldIF0gPSAhIShwcm9wc1tpXSBpbiBpbnB1dEVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF0dHJzLmxpc3Qpe1xuICAgICAgICAgICAgICAvLyBzYWZhcmkgZmFsc2UgcG9zaXRpdmUncyBvbiBkYXRhbGlzdDogd2Viay5pdC83NDI1MlxuICAgICAgICAgICAgICAvLyBzZWUgYWxzbyBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzE0NlxuICAgICAgICAgICAgICBhdHRycy5saXN0ID0gISEoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGF0YWxpc3QnKSAmJiB3aW5kb3cuSFRNTERhdGFMaXN0RWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXR0cnM7XG4gICAgICAgIH0pKCdhdXRvY29tcGxldGUgYXV0b2ZvY3VzIGxpc3QgcGxhY2Vob2xkZXIgbWF4IG1pbiBtdWx0aXBsZSBwYXR0ZXJuIHJlcXVpcmVkIHN0ZXAnLnNwbGl0KCcgJykpO1xuICAgICAgICAvKj4+aW5wdXQqL1xuXG4gICAgICAgIC8qPj5pbnB1dHR5cGVzKi9cbiAgICAgICAgLy8gUnVuIHRocm91Z2ggSFRNTDUncyBuZXcgaW5wdXQgdHlwZXMgdG8gc2VlIGlmIHRoZSBVQSB1bmRlcnN0YW5kcyBhbnkuXG4gICAgICAgIC8vICAgVGhpcyBpcyBwdXQgYmVoaW5kIHRoZSB0ZXN0cyBydW5sb29wIGJlY2F1c2UgaXQgZG9lc24ndCByZXR1cm4gYVxuICAgICAgICAvLyAgIHRydWUvZmFsc2UgbGlrZSBhbGwgdGhlIG90aGVyIHRlc3RzOyBpbnN0ZWFkLCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICAgICAgICAvLyAgIGNvbnRhaW5pbmcgZWFjaCBpbnB1dCB0eXBlIHdpdGggaXRzIGNvcnJlc3BvbmRpbmcgdHJ1ZS9mYWxzZSB2YWx1ZVxuXG4gICAgICAgIC8vIEJpZyB0aGFua3MgdG8gQG1pa2V0YXlsciBmb3IgdGhlIGh0bWw1IGZvcm1zIGV4cGVydGlzZS4gbWlrZXRheWxyLmNvbS9cbiAgICAgICAgTW9kZXJuaXpyWydpbnB1dHR5cGVzJ10gPSAoZnVuY3Rpb24ocHJvcHMpIHtcblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBib29sLCBpbnB1dEVsZW1UeXBlLCBkZWZhdWx0VmlldywgbGVuID0gcHJvcHMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICBpbnB1dEVsZW0uc2V0QXR0cmlidXRlKCd0eXBlJywgaW5wdXRFbGVtVHlwZSA9IHByb3BzW2ldKTtcbiAgICAgICAgICAgICAgICBib29sID0gaW5wdXRFbGVtLnR5cGUgIT09ICd0ZXh0JztcblxuICAgICAgICAgICAgICAgIC8vIFdlIGZpcnN0IGNoZWNrIHRvIHNlZSBpZiB0aGUgdHlwZSB3ZSBnaXZlIGl0IHN0aWNrcy4uXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHR5cGUgZG9lcywgd2UgZmVlZCBpdCBhIHRleHR1YWwgdmFsdWUsIHdoaWNoIHNob3VsZG4ndCBiZSB2YWxpZC5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdmFsdWUgZG9lc24ndCBzdGljaywgd2Uga25vdyB0aGVyZSdzIGlucHV0IHNhbml0aXphdGlvbiB3aGljaCBpbmZlcnMgYSBjdXN0b20gVUlcbiAgICAgICAgICAgICAgICBpZiAoIGJvb2wgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtLnZhbHVlICAgICAgICAgPSBzbWlsZTtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXRFbGVtLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7dmlzaWJpbGl0eTpoaWRkZW47JztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIC9ecmFuZ2UkLy50ZXN0KGlucHV0RWxlbVR5cGUpICYmIGlucHV0RWxlbS5zdHlsZS5XZWJraXRBcHBlYXJhbmNlICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICBkb2NFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0RWxlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZpZXcgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuICAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSAyLTQgYWxsb3dzIHRoZSBzbWlsZXkgYXMgYSB2YWx1ZSwgZGVzcGl0ZSBtYWtpbmcgYSBzbGlkZXJcbiAgICAgICAgICAgICAgICAgICAgICBib29sID0gIGRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoaW5wdXRFbGVtLCBudWxsKS5XZWJraXRBcHBlYXJhbmNlICE9PSAndGV4dGZpZWxkJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9iaWxlIGFuZHJvaWQgd2ViIGJyb3dzZXIgaGFzIGZhbHNlIHBvc2l0aXZlLCBzbyBtdXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGUgaGVpZ2h0IHRvIHNlZSBpZiB0aGUgd2lkZ2V0IGlzIGFjdHVhbGx5IHRoZXJlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGlucHV0RWxlbS5vZmZzZXRIZWlnaHQgIT09IDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgZG9jRWxlbWVudC5yZW1vdmVDaGlsZChpbnB1dEVsZW0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIC9eKHNlYXJjaHx0ZWwpJC8udGVzdChpbnB1dEVsZW1UeXBlKSApe1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWMgZG9lc24ndCBkZWZpbmUgYW55IHNwZWNpYWwgcGFyc2luZyBvciBkZXRlY3RhYmxlIFVJXG4gICAgICAgICAgICAgICAgICAgICAgLy8gICBiZWhhdmlvcnMgc28gd2UgcGFzcyB0aGVzZSB0aHJvdWdoIGFzIHRydWVcblxuICAgICAgICAgICAgICAgICAgICAgIC8vIEludGVyZXN0aW5nbHksIG9wZXJhIGZhaWxzIHRoZSBlYXJsaWVyIHRlc3QsIHNvIGl0IGRvZXNuJ3RcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgZXZlbiBtYWtlIGl0IGhlcmUuXG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggL14odXJsfGVtYWlsKSQvLnRlc3QoaW5wdXRFbGVtVHlwZSkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gUmVhbCB1cmwgYW5kIGVtYWlsIHN1cHBvcnQgY29tZXMgd2l0aCBwcmViYWtlZCB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgIGJvb2wgPSBpbnB1dEVsZW0uY2hlY2tWYWxpZGl0eSAmJiBpbnB1dEVsZW0uY2hlY2tWYWxpZGl0eSgpID09PSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSB1cGdyYWRlZCBpbnB1dCBjb21wb250ZW50IHJlamVjdHMgdGhlIDopIHRleHQsIHdlIGdvdCBhIHdpbm5lclxuICAgICAgICAgICAgICAgICAgICAgIGJvb2wgPSBpbnB1dEVsZW0udmFsdWUgIT0gc21pbGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpbnB1dHNbIHByb3BzW2ldIF0gPSAhIWJvb2w7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5wdXRzO1xuICAgICAgICB9KSgnc2VhcmNoIHRlbCB1cmwgZW1haWwgZGF0ZXRpbWUgZGF0ZSBtb250aCB3ZWVrIHRpbWUgZGF0ZXRpbWUtbG9jYWwgbnVtYmVyIHJhbmdlIGNvbG9yJy5zcGxpdCgnICcpKTtcbiAgICAgICAgLyo+PmlucHV0dHlwZXMqL1xuICAgIH1cbiAgICAvKj4+d2ViZm9ybXMqL1xuXG5cbiAgICAvLyBFbmQgb2YgdGVzdCBkZWZpbml0aW9uc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAgLy8gUnVuIHRocm91Z2ggYWxsIHRlc3RzIGFuZCBkZXRlY3QgdGhlaXIgc3VwcG9ydCBpbiB0aGUgY3VycmVudCBVQS5cbiAgICAvLyB0b2RvOiBoeXBvdGhldGljYWxseSB3ZSBjb3VsZCBiZSBkb2luZyBhbiBhcnJheSBvZiB0ZXN0cyBhbmQgdXNlIGEgYmFzaWMgbG9vcCBoZXJlLlxuICAgIGZvciAoIHZhciBmZWF0dXJlIGluIHRlc3RzICkge1xuICAgICAgICBpZiAoIGhhc093blByb3AodGVzdHMsIGZlYXR1cmUpICkge1xuICAgICAgICAgICAgLy8gcnVuIHRoZSB0ZXN0LCB0aHJvdyB0aGUgcmV0dXJuIHZhbHVlIGludG8gdGhlIE1vZGVybml6cixcbiAgICAgICAgICAgIC8vICAgdGhlbiBiYXNlZCBvbiB0aGF0IGJvb2xlYW4sIGRlZmluZSBhbiBhcHByb3ByaWF0ZSBjbGFzc05hbWVcbiAgICAgICAgICAgIC8vICAgYW5kIHB1c2ggaXQgaW50byBhbiBhcnJheSBvZiBjbGFzc2VzIHdlJ2xsIGpvaW4gbGF0ZXIuXG4gICAgICAgICAgICBmZWF0dXJlTmFtZSAgPSBmZWF0dXJlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBNb2Rlcm5penJbZmVhdHVyZU5hbWVdID0gdGVzdHNbZmVhdHVyZV0oKTtcblxuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKChNb2Rlcm5penJbZmVhdHVyZU5hbWVdID8gJycgOiAnbm8tJykgKyBmZWF0dXJlTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKj4+d2ViZm9ybXMqL1xuICAgIC8vIGlucHV0IHRlc3RzIG5lZWQgdG8gcnVuLlxuICAgIE1vZGVybml6ci5pbnB1dCB8fCB3ZWJmb3JtcygpO1xuICAgIC8qPj53ZWJmb3JtcyovXG5cblxuICAgIC8qKlxuICAgICAqIGFkZFRlc3QgYWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSB0aGVpciBvd24gZmVhdHVyZSB0ZXN0c1xuICAgICAqIHRoZSByZXN1bHQgd2lsbCBiZSBhZGRlZCBvbnRvIHRoZSBNb2Rlcm5penIgb2JqZWN0LFxuICAgICAqIGFzIHdlbGwgYXMgYW4gYXBwcm9wcmlhdGUgY2xhc3NOYW1lIHNldCBvbiB0aGUgaHRtbCBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmVhdHVyZSAtIFN0cmluZyBuYW1pbmcgdGhlIGZlYXR1cmVcbiAgICAgKiBAcGFyYW0gdGVzdCAtIEZ1bmN0aW9uIHJldHVybmluZyB0cnVlIGlmIGZlYXR1cmUgaXMgc3VwcG9ydGVkLCBmYWxzZSBpZiBub3RcbiAgICAgKi9cbiAgICAgTW9kZXJuaXpyLmFkZFRlc3QgPSBmdW5jdGlvbiAoIGZlYXR1cmUsIHRlc3QgKSB7XG4gICAgICAgaWYgKCB0eXBlb2YgZmVhdHVyZSA9PSAnb2JqZWN0JyApIHtcbiAgICAgICAgIGZvciAoIHZhciBrZXkgaW4gZmVhdHVyZSApIHtcbiAgICAgICAgICAgaWYgKCBoYXNPd25Qcm9wKCBmZWF0dXJlLCBrZXkgKSApIHtcbiAgICAgICAgICAgICBNb2Rlcm5penIuYWRkVGVzdCgga2V5LCBmZWF0dXJlWyBrZXkgXSApO1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgZmVhdHVyZSA9IGZlYXR1cmUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgaWYgKCBNb2Rlcm5penJbZmVhdHVyZV0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgLy8gd2UncmUgZ29pbmcgdG8gcXVpdCBpZiB5b3UncmUgdHJ5aW5nIHRvIG92ZXJ3cml0ZSBhbiBleGlzdGluZyB0ZXN0XG4gICAgICAgICAgIC8vIGlmIHdlIHdlcmUgdG8gYWxsb3cgaXQsIHdlJ2QgZG8gdGhpczpcbiAgICAgICAgICAgLy8gICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiXFxcXGIobm8tKT9cIiArIGZlYXR1cmUgKyBcIlxcXFxiXCIpO1xuICAgICAgICAgICAvLyAgIGRvY0VsZW1lbnQuY2xhc3NOYW1lID0gZG9jRWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSggcmUsICcnICk7XG4gICAgICAgICAgIC8vIGJ1dCwgbm8gcmx5LCBzdHVmZiAnZW0uXG4gICAgICAgICAgIHJldHVybiBNb2Rlcm5penI7XG4gICAgICAgICB9XG5cbiAgICAgICAgIHRlc3QgPSB0eXBlb2YgdGVzdCA9PSAnZnVuY3Rpb24nID8gdGVzdCgpIDogdGVzdDtcblxuICAgICAgICAgaWYgKHR5cGVvZiBlbmFibGVDbGFzc2VzICE9PSBcInVuZGVmaW5lZFwiICYmIGVuYWJsZUNsYXNzZXMpIHtcbiAgICAgICAgICAgZG9jRWxlbWVudC5jbGFzc05hbWUgKz0gJyAnICsgKHRlc3QgPyAnJyA6ICduby0nKSArIGZlYXR1cmU7XG4gICAgICAgICB9XG4gICAgICAgICBNb2Rlcm5penJbZmVhdHVyZV0gPSB0ZXN0O1xuXG4gICAgICAgfVxuXG4gICAgICAgcmV0dXJuIE1vZGVybml6cjsgLy8gYWxsb3cgY2hhaW5pbmcuXG4gICAgIH07XG5cblxuICAgIC8vIFJlc2V0IG1vZEVsZW0uY3NzVGV4dCB0byBub3RoaW5nIHRvIHJlZHVjZSBtZW1vcnkgZm9vdHByaW50LlxuICAgIHNldENzcygnJyk7XG4gICAgbW9kRWxlbSA9IGlucHV0RWxlbSA9IG51bGw7XG5cbiAgICAvKj4+c2hpdiovXG4gICAgLyoqXG4gICAgICogQHByZXNlcnZlIEhUTUw1IFNoaXYgcHJldjMuNy4xIHwgQGFmYXJrYXMgQGpkYWx0b24gQGpvbl9uZWFsIEByZW0gfCBNSVQvR1BMMiBMaWNlbnNlZFxuICAgICAqL1xuICAgIDsoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuICAgICAgICAvKmpzaGludCBldmlsOnRydWUgKi9cbiAgICAgICAgLyoqIHZlcnNpb24gKi9cbiAgICAgICAgdmFyIHZlcnNpb24gPSAnMy43LjAnO1xuXG4gICAgICAgIC8qKiBQcmVzZXQgb3B0aW9ucyAqL1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHdpbmRvdy5odG1sNSB8fCB7fTtcblxuICAgICAgICAvKiogVXNlZCB0byBza2lwIHByb2JsZW0gZWxlbWVudHMgKi9cbiAgICAgICAgdmFyIHJlU2tpcCA9IC9ePHxeKD86YnV0dG9ufG1hcHxzZWxlY3R8dGV4dGFyZWF8b2JqZWN0fGlmcmFtZXxvcHRpb258b3B0Z3JvdXApJC9pO1xuXG4gICAgICAgIC8qKiBOb3QgYWxsIGVsZW1lbnRzIGNhbiBiZSBjbG9uZWQgaW4gSUUgKiovXG4gICAgICAgIHZhciBzYXZlQ2xvbmVzID0gL14oPzphfGJ8Y29kZXxkaXZ8ZmllbGRzZXR8aDF8aDJ8aDN8aDR8aDV8aDZ8aXxsYWJlbHxsaXxvbHxwfHF8c3BhbnxzdHJvbmd8c3R5bGV8dGFibGV8dGJvZHl8dGR8dGh8dHJ8dWwpJC9pO1xuXG4gICAgICAgIC8qKiBEZXRlY3Qgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyBkZWZhdWx0IGh0bWw1IHN0eWxlcyAqL1xuICAgICAgICB2YXIgc3VwcG9ydHNIdG1sNVN0eWxlcztcblxuICAgICAgICAvKiogTmFtZSBvZiB0aGUgZXhwYW5kbywgdG8gd29yayB3aXRoIG11bHRpcGxlIGRvY3VtZW50cyBvciB0byByZS1zaGl2IG9uZSBkb2N1bWVudCAqL1xuICAgICAgICB2YXIgZXhwYW5kbyA9ICdfaHRtbDVzaGl2JztcblxuICAgICAgICAvKiogVGhlIGlkIGZvciB0aGUgdGhlIGRvY3VtZW50cyBleHBhbmRvICovXG4gICAgICAgIHZhciBleHBhbklEID0gMDtcblxuICAgICAgICAvKiogQ2FjaGVkIGRhdGEgZm9yIGVhY2ggZG9jdW1lbnQgKi9cbiAgICAgICAgdmFyIGV4cGFuZG9EYXRhID0ge307XG5cbiAgICAgICAgLyoqIERldGVjdCB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHVua25vd24gZWxlbWVudHMgKi9cbiAgICAgICAgdmFyIHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzO1xuXG4gICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBhLmlubmVySFRNTCA9ICc8eHl6PjwveHl6Pic7XG4gICAgICAgICAgICAvL2lmIHRoZSBoaWRkZW4gcHJvcGVydHkgaXMgaW1wbGVtZW50ZWQgd2UgY2FuIGFzc3VtZSwgdGhhdCB0aGUgYnJvd3NlciBzdXBwb3J0cyBiYXNpYyBIVE1MNSBTdHlsZXNcbiAgICAgICAgICAgIHN1cHBvcnRzSHRtbDVTdHlsZXMgPSAoJ2hpZGRlbicgaW4gYSk7XG5cbiAgICAgICAgICAgIHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzID0gYS5jaGlsZE5vZGVzLmxlbmd0aCA9PSAxIHx8IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgLy8gYXNzaWduIGEgZmFsc2UgcG9zaXRpdmUgaWYgdW5hYmxlIHRvIHNoaXZcbiAgICAgICAgICAgICAgKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpKCdhJyk7XG4gICAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIHR5cGVvZiBmcmFnLmNsb25lTm9kZSA9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiBmcmFnLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQgPT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgICAgICAgICB0eXBlb2YgZnJhZy5jcmVhdGVFbGVtZW50ID09ICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgLy8gYXNzaWduIGEgZmFsc2UgcG9zaXRpdmUgaWYgZGV0ZWN0aW9uIGZhaWxzID0+IHVuYWJsZSB0byBzaGl2XG4gICAgICAgICAgICBzdXBwb3J0c0h0bWw1U3R5bGVzID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSgpKTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ3JlYXRlcyBhIHN0eWxlIHNoZWV0IHdpdGggdGhlIGdpdmVuIENTUyB0ZXh0IGFuZCBhZGRzIGl0IHRvIHRoZSBkb2N1bWVudC5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjc3NUZXh0IFRoZSBDU1MgdGV4dC5cbiAgICAgICAgICogQHJldHVybnMge1N0eWxlU2hlZXR9IFRoZSBzdHlsZSBlbGVtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gYWRkU3R5bGVTaGVldChvd25lckRvY3VtZW50LCBjc3NUZXh0KSB7XG4gICAgICAgICAgdmFyIHAgPSBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKSxcbiAgICAgICAgICBwYXJlbnQgPSBvd25lckRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgb3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICAgICAgICBwLmlubmVySFRNTCA9ICd4PHN0eWxlPicgKyBjc3NUZXh0ICsgJzwvc3R5bGU+JztcbiAgICAgICAgICByZXR1cm4gcGFyZW50Lmluc2VydEJlZm9yZShwLmxhc3RDaGlsZCwgcGFyZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGBodG1sNS5lbGVtZW50c2AgYXMgYW4gYXJyYXkuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2Ygc2hpdmVkIGVsZW1lbnQgbm9kZSBuYW1lcy5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldEVsZW1lbnRzKCkge1xuICAgICAgICAgIHZhciBlbGVtZW50cyA9IGh0bWw1LmVsZW1lbnRzO1xuICAgICAgICAgIHJldHVybiB0eXBlb2YgZWxlbWVudHMgPT0gJ3N0cmluZycgPyBlbGVtZW50cy5zcGxpdCgnICcpIDogZWxlbWVudHM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBnaXZlbiBkb2N1bWVudFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fSBvd25lckRvY3VtZW50IFRoZSBkb2N1bWVudC5cbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IG9mIGRhdGEuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRFeHBhbmRvRGF0YShvd25lckRvY3VtZW50KSB7XG4gICAgICAgICAgdmFyIGRhdGEgPSBleHBhbmRvRGF0YVtvd25lckRvY3VtZW50W2V4cGFuZG9dXTtcbiAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIGV4cGFuSUQrKztcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnRbZXhwYW5kb10gPSBleHBhbklEO1xuICAgICAgICAgICAgZXhwYW5kb0RhdGFbZXhwYW5JRF0gPSBkYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgc2hpdmVkIGVsZW1lbnQgZm9yIHRoZSBnaXZlbiBub2RlTmFtZSBhbmQgZG9jdW1lbnRcbiAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBub2RlTmFtZSBuYW1lIG9mIHRoZSBlbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGNvbnRleHQgZG9jdW1lbnQuXG4gICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFRoZSBzaGl2ZWQgZWxlbWVudC5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQobm9kZU5hbWUsIG93bmVyRG9jdW1lbnQsIGRhdGEpe1xuICAgICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xuICAgICAgICAgICAgb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihzdXBwb3J0c1Vua25vd25FbGVtZW50cyl7XG4gICAgICAgICAgICByZXR1cm4gb3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICBkYXRhID0gZ2V0RXhwYW5kb0RhdGEob3duZXJEb2N1bWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBub2RlO1xuXG4gICAgICAgICAgaWYgKGRhdGEuY2FjaGVbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgICBub2RlID0gZGF0YS5jYWNoZVtub2RlTmFtZV0uY2xvbmVOb2RlKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzYXZlQ2xvbmVzLnRlc3Qobm9kZU5hbWUpKSB7XG4gICAgICAgICAgICBub2RlID0gKGRhdGEuY2FjaGVbbm9kZU5hbWVdID0gZGF0YS5jcmVhdGVFbGVtKG5vZGVOYW1lKSkuY2xvbmVOb2RlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUgPSBkYXRhLmNyZWF0ZUVsZW0obm9kZU5hbWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEF2b2lkIGFkZGluZyBzb21lIGVsZW1lbnRzIHRvIGZyYWdtZW50cyBpbiBJRSA8IDkgYmVjYXVzZVxuICAgICAgICAgIC8vICogQXR0cmlidXRlcyBsaWtlIGBuYW1lYCBvciBgdHlwZWAgY2Fubm90IGJlIHNldC9jaGFuZ2VkIG9uY2UgYW4gZWxlbWVudFxuICAgICAgICAgIC8vICAgaXMgaW5zZXJ0ZWQgaW50byBhIGRvY3VtZW50L2ZyYWdtZW50XG4gICAgICAgICAgLy8gKiBMaW5rIGVsZW1lbnRzIHdpdGggYHNyY2AgYXR0cmlidXRlcyB0aGF0IGFyZSBpbmFjY2Vzc2libGUsIGFzIHdpdGhcbiAgICAgICAgICAvLyAgIGEgNDAzIHJlc3BvbnNlLCB3aWxsIGNhdXNlIHRoZSB0YWIvd2luZG93IHRvIGNyYXNoXG4gICAgICAgICAgLy8gKiBTY3JpcHQgZWxlbWVudHMgYXBwZW5kZWQgdG8gZnJhZ21lbnRzIHdpbGwgZXhlY3V0ZSB3aGVuIHRoZWlyIGBzcmNgXG4gICAgICAgICAgLy8gICBvciBgdGV4dGAgcHJvcGVydHkgaXMgc2V0XG4gICAgICAgICAgcmV0dXJuIG5vZGUuY2FuSGF2ZUNoaWxkcmVuICYmICFyZVNraXAudGVzdChub2RlTmFtZSkgJiYgIW5vZGUudGFnVXJuID8gZGF0YS5mcmFnLmFwcGVuZENoaWxkKG5vZGUpIDogbm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXR1cm5zIGEgc2hpdmVkIERvY3VtZW50RnJhZ21lbnQgZm9yIHRoZSBnaXZlbiBkb2N1bWVudFxuICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgY29udGV4dCBkb2N1bWVudC5cbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHNoaXZlZCBEb2N1bWVudEZyYWdtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRG9jdW1lbnRGcmFnbWVudChvd25lckRvY3VtZW50LCBkYXRhKXtcbiAgICAgICAgICBpZiAoIW93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoc3VwcG9ydHNVbmtub3duRWxlbWVudHMpe1xuICAgICAgICAgICAgcmV0dXJuIG93bmVyRG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhID0gZGF0YSB8fCBnZXRFeHBhbmRvRGF0YShvd25lckRvY3VtZW50KTtcbiAgICAgICAgICB2YXIgY2xvbmUgPSBkYXRhLmZyYWcuY2xvbmVOb2RlKCksXG4gICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgZWxlbXMgPSBnZXRFbGVtZW50cygpLFxuICAgICAgICAgIGwgPSBlbGVtcy5sZW5ndGg7XG4gICAgICAgICAgZm9yKDtpPGw7aSsrKXtcbiAgICAgICAgICAgIGNsb25lLmNyZWF0ZUVsZW1lbnQoZWxlbXNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogU2hpdnMgdGhlIGBjcmVhdGVFbGVtZW50YCBhbmQgYGNyZWF0ZURvY3VtZW50RnJhZ21lbnRgIG1ldGhvZHMgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fERvY3VtZW50RnJhZ21lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGRvY3VtZW50LlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBzaGl2TWV0aG9kcyhvd25lckRvY3VtZW50LCBkYXRhKSB7XG4gICAgICAgICAgaWYgKCFkYXRhLmNhY2hlKSB7XG4gICAgICAgICAgICBkYXRhLmNhY2hlID0ge307XG4gICAgICAgICAgICBkYXRhLmNyZWF0ZUVsZW0gPSBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQ7XG4gICAgICAgICAgICBkYXRhLmNyZWF0ZUZyYWcgPSBvd25lckRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQ7XG4gICAgICAgICAgICBkYXRhLmZyYWcgPSBkYXRhLmNyZWF0ZUZyYWcoKTtcbiAgICAgICAgICB9XG5cblxuICAgICAgICAgIG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uKG5vZGVOYW1lKSB7XG4gICAgICAgICAgICAvL2Fib3J0IHNoaXZcbiAgICAgICAgICAgIGlmICghaHRtbDUuc2hpdk1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuY3JlYXRlRWxlbShub2RlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlRWxlbWVudChub2RlTmFtZSwgb3duZXJEb2N1bWVudCwgZGF0YSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIG93bmVyRG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCA9IEZ1bmN0aW9uKCdoLGYnLCAncmV0dXJuIGZ1bmN0aW9uKCl7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhciBuPWYuY2xvbmVOb2RlKCksYz1uLmNyZWF0ZUVsZW1lbnQ7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2guc2hpdk1ldGhvZHMmJignICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1bnJvbGwgdGhlIGBjcmVhdGVFbGVtZW50YCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEVsZW1lbnRzKCkuam9pbigpLnJlcGxhY2UoL1tcXHdcXC1dKy9nLCBmdW5jdGlvbihub2RlTmFtZSkge1xuICAgICAgICAgICAgZGF0YS5jcmVhdGVFbGVtKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGRhdGEuZnJhZy5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiAnYyhcIicgKyBub2RlTmFtZSArICdcIiknO1xuICAgICAgICAgIH0pICtcbiAgICAgICAgICAgICcpO3JldHVybiBufSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoaHRtbDUsIGRhdGEuZnJhZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAvKipcbiAgICAgICAgICogU2hpdnMgdGhlIGdpdmVuIGRvY3VtZW50LlxuICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQgdG8gc2hpdi5cbiAgICAgICAgICogQHJldHVybnMge0RvY3VtZW50fSBUaGUgc2hpdmVkIGRvY3VtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gc2hpdkRvY3VtZW50KG93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgICBpZiAoIW93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGRhdGEgPSBnZXRFeHBhbmRvRGF0YShvd25lckRvY3VtZW50KTtcblxuICAgICAgICAgIGlmIChodG1sNS5zaGl2Q1NTICYmICFzdXBwb3J0c0h0bWw1U3R5bGVzICYmICFkYXRhLmhhc0NTUykge1xuICAgICAgICAgICAgZGF0YS5oYXNDU1MgPSAhIWFkZFN0eWxlU2hlZXQob3duZXJEb2N1bWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcnJlY3RzIGJsb2NrIGRpc3BsYXkgbm90IGRlZmluZWQgaW4gSUU2LzcvOC85XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJ0aWNsZSxhc2lkZSxkaWFsb2csZmlnY2FwdGlvbixmaWd1cmUsZm9vdGVyLGhlYWRlcixoZ3JvdXAsbWFpbixuYXYsc2VjdGlvbntkaXNwbGF5OmJsb2NrfScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIHN0eWxpbmcgbm90IHByZXNlbnQgaW4gSUU2LzcvOC85XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXJre2JhY2tncm91bmQ6I0ZGMDtjb2xvcjojMDAwfScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoaWRlcyBub24tcmVuZGVyZWQgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RlbXBsYXRle2Rpc3BsYXk6bm9uZX0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghc3VwcG9ydHNVbmtub3duRWxlbWVudHMpIHtcbiAgICAgICAgICAgIHNoaXZNZXRob2RzKG93bmVyRG9jdW1lbnQsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gb3duZXJEb2N1bWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYGh0bWw1YCBvYmplY3QgaXMgZXhwb3NlZCBzbyB0aGF0IG1vcmUgZWxlbWVudHMgY2FuIGJlIHNoaXZlZCBhbmRcbiAgICAgICAgICogZXhpc3Rpbmcgc2hpdmluZyBjYW4gYmUgZGV0ZWN0ZWQgb24gaWZyYW1lcy5cbiAgICAgICAgICogQHR5cGUgT2JqZWN0XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqIC8vIG9wdGlvbnMgY2FuIGJlIGNoYW5nZWQgYmVmb3JlIHRoZSBzY3JpcHQgaXMgaW5jbHVkZWRcbiAgICAgICAgICogaHRtbDUgPSB7ICdlbGVtZW50cyc6ICdtYXJrIHNlY3Rpb24nLCAnc2hpdkNTUyc6IGZhbHNlLCAnc2hpdk1ldGhvZHMnOiBmYWxzZSB9O1xuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGh0bWw1ID0ge1xuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQW4gYXJyYXkgb3Igc3BhY2Ugc2VwYXJhdGVkIHN0cmluZyBvZiBub2RlIG5hbWVzIG9mIHRoZSBlbGVtZW50cyB0byBzaGl2LlxuICAgICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgICAqIEB0eXBlIEFycmF5fFN0cmluZ1xuICAgICAgICAgICAqL1xuICAgICAgICAgICdlbGVtZW50cyc6IG9wdGlvbnMuZWxlbWVudHMgfHwgJ2FiYnIgYXJ0aWNsZSBhc2lkZSBhdWRpbyBiZGkgY2FudmFzIGRhdGEgZGF0YWxpc3QgZGV0YWlscyBkaWFsb2cgZmlnY2FwdGlvbiBmaWd1cmUgZm9vdGVyIGhlYWRlciBoZ3JvdXAgbWFpbiBtYXJrIG1ldGVyIG5hdiBvdXRwdXQgcHJvZ3Jlc3Mgc2VjdGlvbiBzdW1tYXJ5IHRlbXBsYXRlIHRpbWUgdmlkZW8nLFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogY3VycmVudCB2ZXJzaW9uIG9mIGh0bWw1c2hpdlxuICAgICAgICAgICAqL1xuICAgICAgICAgICd2ZXJzaW9uJzogdmVyc2lvbixcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBIVE1MNSBzdHlsZSBzaGVldCBzaG91bGQgYmUgaW5zZXJ0ZWQuXG4gICAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAgICogQHR5cGUgQm9vbGVhblxuICAgICAgICAgICAqL1xuICAgICAgICAgICdzaGl2Q1NTJzogKG9wdGlvbnMuc2hpdkNTUyAhPT0gZmFsc2UpLFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogSXMgZXF1YWwgdG8gdHJ1ZSBpZiBhIGJyb3dzZXIgc3VwcG9ydHMgY3JlYXRpbmcgdW5rbm93bi9IVE1MNSBlbGVtZW50c1xuICAgICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICAnc3VwcG9ydHNVbmtub3duRWxlbWVudHMnOiBzdXBwb3J0c1Vua25vd25FbGVtZW50cyxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEEgZmxhZyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBkb2N1bWVudCdzIGBjcmVhdGVFbGVtZW50YCBhbmQgYGNyZWF0ZURvY3VtZW50RnJhZ21lbnRgXG4gICAgICAgICAgICogbWV0aG9kcyBzaG91bGQgYmUgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAgICogQHR5cGUgQm9vbGVhblxuICAgICAgICAgICAqL1xuICAgICAgICAgICdzaGl2TWV0aG9kcyc6IChvcHRpb25zLnNoaXZNZXRob2RzICE9PSBmYWxzZSksXG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBBIHN0cmluZyB0byBkZXNjcmliZSB0aGUgdHlwZSBvZiBgaHRtbDVgIG9iamVjdCAoXCJkZWZhdWx0XCIgb3IgXCJkZWZhdWx0IHByaW50XCIpLlxuICAgICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgICAqIEB0eXBlIFN0cmluZ1xuICAgICAgICAgICAqL1xuICAgICAgICAgICd0eXBlJzogJ2RlZmF1bHQnLFxuXG4gICAgICAgICAgLy8gc2hpdnMgdGhlIGRvY3VtZW50IGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWVkIGBodG1sNWAgb2JqZWN0IG9wdGlvbnNcbiAgICAgICAgICAnc2hpdkRvY3VtZW50Jzogc2hpdkRvY3VtZW50LFxuXG4gICAgICAgICAgLy9jcmVhdGVzIGEgc2hpdmVkIGVsZW1lbnRcbiAgICAgICAgICBjcmVhdGVFbGVtZW50OiBjcmVhdGVFbGVtZW50LFxuXG4gICAgICAgICAgLy9jcmVhdGVzIGEgc2hpdmVkIGRvY3VtZW50RnJhZ21lbnRcbiAgICAgICAgICBjcmVhdGVEb2N1bWVudEZyYWdtZW50OiBjcmVhdGVEb2N1bWVudEZyYWdtZW50XG4gICAgICAgIH07XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgICAgLy8gZXhwb3NlIGh0bWw1XG4gICAgICAgIHdpbmRvdy5odG1sNSA9IGh0bWw1O1xuXG4gICAgICAgIC8vIHNoaXYgdGhlIGRvY3VtZW50XG4gICAgICAgIHNoaXZEb2N1bWVudChkb2N1bWVudCk7XG5cbiAgICB9KHRoaXMsIGRvY3VtZW50KSk7XG4gICAgLyo+PnNoaXYqL1xuXG4gICAgLy8gQXNzaWduIHByaXZhdGUgcHJvcGVydGllcyB0byB0aGUgcmV0dXJuIG9iamVjdCB3aXRoIHByZWZpeFxuICAgIE1vZGVybml6ci5fdmVyc2lvbiAgICAgID0gdmVyc2lvbjtcblxuICAgIC8vIGV4cG9zZSB0aGVzZSBmb3IgdGhlIHBsdWdpbiBBUEkuIExvb2sgaW4gdGhlIHNvdXJjZSBmb3IgaG93IHRvIGpvaW4oKSB0aGVtIGFnYWluc3QgeW91ciBpbnB1dFxuICAgIC8qPj5wcmVmaXhlcyovXG4gICAgTW9kZXJuaXpyLl9wcmVmaXhlcyAgICAgPSBwcmVmaXhlcztcbiAgICAvKj4+cHJlZml4ZXMqL1xuICAgIC8qPj5kb21wcmVmaXhlcyovXG4gICAgTW9kZXJuaXpyLl9kb21QcmVmaXhlcyAgPSBkb21QcmVmaXhlcztcbiAgICBNb2Rlcm5penIuX2Nzc29tUHJlZml4ZXMgID0gY3Nzb21QcmVmaXhlcztcbiAgICAvKj4+ZG9tcHJlZml4ZXMqL1xuXG4gICAgLyo+Pm1xKi9cbiAgICAvLyBNb2Rlcm5penIubXEgdGVzdHMgYSBnaXZlbiBtZWRpYSBxdWVyeSwgbGl2ZSBhZ2FpbnN0IHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSB3aW5kb3dcbiAgICAvLyBBIGZldyBpbXBvcnRhbnQgbm90ZXM6XG4gICAgLy8gICAqIElmIGEgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IG1lZGlhIHF1ZXJpZXMgYXQgYWxsIChlZy4gb2xkSUUpIHRoZSBtcSgpIHdpbGwgYWx3YXlzIHJldHVybiBmYWxzZVxuICAgIC8vICAgKiBBIG1heC13aWR0aCBvciBvcmllbnRhdGlvbiBxdWVyeSB3aWxsIGJlIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjdXJyZW50IHN0YXRlLCB3aGljaCBtYXkgY2hhbmdlIGxhdGVyLlxuICAgIC8vICAgKiBZb3UgbXVzdCBzcGVjaWZ5IHZhbHVlcy4gRWcuIElmIHlvdSBhcmUgdGVzdGluZyBzdXBwb3J0IGZvciB0aGUgbWluLXdpZHRoIG1lZGlhIHF1ZXJ5IHVzZTpcbiAgICAvLyAgICAgICBNb2Rlcm5penIubXEoJyhtaW4td2lkdGg6MCknKVxuICAgIC8vIHVzYWdlOlxuICAgIC8vIE1vZGVybml6ci5tcSgnb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6NzY4KScpXG4gICAgTW9kZXJuaXpyLm1xICAgICAgICAgICAgPSB0ZXN0TWVkaWFRdWVyeTtcbiAgICAvKj4+bXEqL1xuXG4gICAgLyo+Pmhhc2V2ZW50Ki9cbiAgICAvLyBNb2Rlcm5penIuaGFzRXZlbnQoKSBkZXRlY3RzIHN1cHBvcnQgZm9yIGEgZ2l2ZW4gZXZlbnQsIHdpdGggYW4gb3B0aW9uYWwgZWxlbWVudCB0byB0ZXN0IG9uXG4gICAgLy8gTW9kZXJuaXpyLmhhc0V2ZW50KCdnZXN0dXJlc3RhcnQnLCBlbGVtKVxuICAgIE1vZGVybml6ci5oYXNFdmVudCAgICAgID0gaXNFdmVudFN1cHBvcnRlZDtcbiAgICAvKj4+aGFzZXZlbnQqL1xuXG4gICAgLyo+PnRlc3Rwcm9wKi9cbiAgICAvLyBNb2Rlcm5penIudGVzdFByb3AoKSBpbnZlc3RpZ2F0ZXMgd2hldGhlciBhIGdpdmVuIHN0eWxlIHByb3BlcnR5IGlzIHJlY29nbml6ZWRcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHByb3BlcnR5IG5hbWVzIG11c3QgYmUgcHJvdmlkZWQgaW4gdGhlIGNhbWVsQ2FzZSB2YXJpYW50LlxuICAgIC8vIE1vZGVybml6ci50ZXN0UHJvcCgncG9pbnRlckV2ZW50cycpXG4gICAgTW9kZXJuaXpyLnRlc3RQcm9wICAgICAgPSBmdW5jdGlvbihwcm9wKXtcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wcyhbcHJvcF0pO1xuICAgIH07XG4gICAgLyo+PnRlc3Rwcm9wKi9cblxuICAgIC8qPj50ZXN0YWxscHJvcHMqL1xuICAgIC8vIE1vZGVybml6ci50ZXN0QWxsUHJvcHMoKSBpbnZlc3RpZ2F0ZXMgd2hldGhlciBhIGdpdmVuIHN0eWxlIHByb3BlcnR5LFxuICAgIC8vICAgb3IgYW55IG9mIGl0cyB2ZW5kb3ItcHJlZml4ZWQgdmFyaWFudHMsIGlzIHJlY29nbml6ZWRcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHByb3BlcnR5IG5hbWVzIG11c3QgYmUgcHJvdmlkZWQgaW4gdGhlIGNhbWVsQ2FzZSB2YXJpYW50LlxuICAgIC8vIE1vZGVybml6ci50ZXN0QWxsUHJvcHMoJ2JveFNpemluZycpXG4gICAgTW9kZXJuaXpyLnRlc3RBbGxQcm9wcyAgPSB0ZXN0UHJvcHNBbGw7XG4gICAgLyo+PnRlc3RhbGxwcm9wcyovXG5cblxuICAgIC8qPj50ZXN0c3R5bGVzKi9cbiAgICAvLyBNb2Rlcm5penIudGVzdFN0eWxlcygpIGFsbG93cyB5b3UgdG8gYWRkIGN1c3RvbSBzdHlsZXMgdG8gdGhlIGRvY3VtZW50IGFuZCB0ZXN0IGFuIGVsZW1lbnQgYWZ0ZXJ3YXJkc1xuICAgIC8vIE1vZGVybml6ci50ZXN0U3R5bGVzKCcjbW9kZXJuaXpyIHsgcG9zaXRpb246YWJzb2x1dGUgfScsIGZ1bmN0aW9uKGVsZW0sIHJ1bGUpeyAuLi4gfSlcbiAgICBNb2Rlcm5penIudGVzdFN0eWxlcyAgICA9IGluamVjdEVsZW1lbnRXaXRoU3R5bGVzO1xuICAgIC8qPj50ZXN0c3R5bGVzKi9cblxuXG4gICAgLyo+PnByZWZpeGVkKi9cbiAgICAvLyBNb2Rlcm5penIucHJlZml4ZWQoKSByZXR1cm5zIHRoZSBwcmVmaXhlZCBvciBub25wcmVmaXhlZCBwcm9wZXJ0eSBuYW1lIHZhcmlhbnQgb2YgeW91ciBpbnB1dFxuICAgIC8vIE1vZGVybml6ci5wcmVmaXhlZCgnYm94U2l6aW5nJykgLy8gJ01vekJveFNpemluZydcblxuICAgIC8vIFByb3BlcnRpZXMgbXVzdCBiZSBwYXNzZWQgYXMgZG9tLXN0eWxlIGNhbWVsY2FzZSwgcmF0aGVyIHRoYW4gYGJveC1zaXppbmdgIGh5cGVudGF0ZWQgc3R5bGUuXG4gICAgLy8gUmV0dXJuIHZhbHVlcyB3aWxsIGFsc28gYmUgdGhlIGNhbWVsQ2FzZSB2YXJpYW50LCBpZiB5b3UgbmVlZCB0byB0cmFuc2xhdGUgdGhhdCB0byBoeXBlbmF0ZWQgc3R5bGUgdXNlOlxuICAgIC8vXG4gICAgLy8gICAgIHN0ci5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKHN0cixtMSl7IHJldHVybiAnLScgKyBtMS50b0xvd2VyQ2FzZSgpOyB9KS5yZXBsYWNlKC9ebXMtLywnLW1zLScpO1xuXG4gICAgLy8gSWYgeW91J3JlIHRyeWluZyB0byBhc2NlcnRhaW4gd2hpY2ggdHJhbnNpdGlvbiBlbmQgZXZlbnQgdG8gYmluZCB0bywgeW91IG1pZ2h0IGRvIHNvbWV0aGluZyBsaWtlLi4uXG4gICAgLy9cbiAgICAvLyAgICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAvLyAgICAgICAnV2Via2l0VHJhbnNpdGlvbicgOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgLy8gICAgICAgJ01velRyYW5zaXRpb24nICAgIDogJ3RyYW5zaXRpb25lbmQnLFxuICAgIC8vICAgICAgICdPVHJhbnNpdGlvbicgICAgICA6ICdvVHJhbnNpdGlvbkVuZCcsXG4gICAgLy8gICAgICAgJ21zVHJhbnNpdGlvbicgICAgIDogJ01TVHJhbnNpdGlvbkVuZCcsXG4gICAgLy8gICAgICAgJ3RyYW5zaXRpb24nICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgLy8gICAgIH0sXG4gICAgLy8gICAgIHRyYW5zRW5kRXZlbnROYW1lID0gdHJhbnNFbmRFdmVudE5hbWVzWyBNb2Rlcm5penIucHJlZml4ZWQoJ3RyYW5zaXRpb24nKSBdO1xuXG4gICAgTW9kZXJuaXpyLnByZWZpeGVkICAgICAgPSBmdW5jdGlvbihwcm9wLCBvYmosIGVsZW0pe1xuICAgICAgaWYoIW9iaikge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKHByb3AsICdwZngnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRlc3RpbmcgRE9NIHByb3BlcnR5IGUuZy4gTW9kZXJuaXpyLnByZWZpeGVkKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnLCB3aW5kb3cpIC8vICdtb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXG4gICAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwocHJvcCwgb2JqLCBlbGVtKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIC8qPj5wcmVmaXhlZCovXG5cblxuICAgIC8qPj5jc3NjbGFzc2VzKi9cbiAgICAvLyBSZW1vdmUgXCJuby1qc1wiIGNsYXNzIGZyb20gPGh0bWw+IGVsZW1lbnQsIGlmIGl0IGV4aXN0czpcbiAgICBkb2NFbGVtZW50LmNsYXNzTmFtZSA9IGRvY0VsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UoLyhefFxccyluby1qcyhcXHN8JCkvLCAnJDEkMicpICtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbmV3IGNsYXNzZXMgdG8gdGhlIDxodG1sPiBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlbmFibGVDbGFzc2VzID8gJyBqcyAnICsgY2xhc3Nlcy5qb2luKCcgJykgOiAnJyk7XG4gICAgLyo+PmNzc2NsYXNzZXMqL1xuXG4gICAgcmV0dXJuIE1vZGVybml6cjtcblxufSkodGhpcywgdGhpcy5kb2N1bWVudCk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
