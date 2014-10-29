/*
selectivizr v1.0.3b - (c) Keith Clark, freely distributable under the terms 
of the MIT license.

selectivizr.com
*/
/* 
  
Notes about this source
-----------------------

 * The #DEBUG_START and #DEBUG_END comments are used to mark blocks of code
   that will be removed prior to building a final release version (using a
   pre-compression script)
  
  
References:
-----------
 
 * CSS Syntax          : http://www.w3.org/TR/2003/WD-css3-syntax-20030813/#style
 * Selectors           : http://www.w3.org/TR/css3-selectors/#selectors
 * IE Compatability    : http://msdn.microsoft.com/en-us/library/cc351024(VS.85).aspx
 * W3C Selector Tests  : http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/
 
*/

(function(win) {

	// =========================== Init Objects ============================

	var doc = document;
	var root = doc.documentElement;
	var xhr = "XMLHttpRequest";
	var ieVersion = doc.querySelector ? doc.documentMode : (doc.compatMode == "CSS1Compat" ? xhr in win ? 7 : 6 : 5);

	// String constants
	var EMPTY_STRING						= "";
	var SPACE_STRING						= " ";
	var PLACEHOLDER_STRING					= "$1";

	// If were not in standards mode, IE is too old / new or we can't create
	if (ieVersion) {
		toggleElementClass(root, "ie" + ieVersion, true);
	}
	var js_path								= (doc.scripts ? doc.scripts[doc.scripts.length - 1] : doc.querySelector("script:last-child")).getAttribute("src").replace(/[^\/]+$/, "");
	var ajaxCache							= {};
	if (!(ieVersion > 5 && ieVersion < 10)) {
		if(!win.StyleFix) {
			loadScript(js_path + "prefixfree.min.js").onload = function(){
				var addEvent = win.addEventListener,
					tester = doc.createElement("div"),
					process = StyleFix.process;
				tester.style.cssText = "font-size:calc(1vmax*100000)";
				if(!/vmax/.test(tester.style.fontSize)){
					StyleFix.register(vunits);
					addEvent("resize", process);
				}
				process();
			};
		}
		return;
	}

	// an XMLHttpRequest object then we should get out now.
	xhr = ieVersion < 7 ? new ActiveXObject("Microsoft.XMLHTTP") : new win[xhr];
	
	// ========================= Common Objects ============================

	// Compatiable selector engines in order of CSS3 support. Note: '*' is
	// a placholder for the object key name. (basically, crude compression)
	var selectorEngines = {
		"NW"								: "*.Dom.select",
		"MooTools"							: "$$",
		"DOMAssistant"						: "*.$", 
		"Prototype"							: "$$",
		"YAHOO"								: "*.util.Selector.query",
		"Sizzle"							: "*", 
		"jQuery"							: "*",
		"dojo"								: "*.query"
	};

	var selectorMethod;
	var enabledWatchers						= [];     // array of :enabled/:disabled elements to poll
	var domPatches							= [];
	var ie6PatchID							= 0;      // used to solve ie6's multiple class bug
	var patchIE6MultipleClasses				= true;   // if true adds class bloat to ie6
	var namespace							= "slvzr";
	var strRawCssText						= "rawCssText";

	// Stylesheet parsing regexp's
	var RE_ORIGIN							= /^\w+:\/\/[^\/]+/;
	var RE_COMMENT							= /(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*?/g;
	var RE_IMPORT							= /@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))\s*([^;]*);/g;
	var RE_MEDIA							= /@media\s+([^\{]+)/g
	var RE_ASSET_URL						= /(\bbehavior\s*?:[^;}\n\r]+)?\burl\(\s*(["']?)(?!\w+:)([^"')]+)\2\s*\)/g;
	var RE_PSEUDO_STRUCTURAL				= /^:(empty|(first|last|only|nth(-last)?)-(child|of-type))$/;
	var RE_PSEUDO_ELEMENTS					= /:(:first-(?:line|letter))/g;
	var RE_SELECTOR_GROUP					= /((?:^|(?:\s*})+)(?:\s*@media[^{]+{)?)\s*([^\{]*?[\[:][^{]+)/g;
	var RE_SELECTOR_PARSE					= /([ +~>])|(:[a-z-]+(?:\(.*?\)+)?)|(\[.*?\])/g; 
	var RE_LIBRARY_INCOMPATIBLE_PSEUDOS		= /(:not\()?:(hover|enabled|disabled|focus|checked|target|active|visited|first-line|first-letter)\)?/g;
	var RE_PATCH_CLASS_NAME_REPLACE			= /[^\w-]/g;
	
	// HTML UI element regexp's
	var RE_INPUT_ELEMENTS					= /^(INPUT|SELECT|TEXTAREA|BUTTON)$/;
	var RE_INPUT_CHECKABLE_TYPES			= /^(checkbox|radio)$/;

	// Broken attribute selector implementations (IE7/8 native [^=""], [$=""] and [*=""])
	var BROKEN_ATTR_IMPLEMENTATIONS			= ieVersion>6 ? /[\$\^*]=(['"])\1/ : null;

	// Whitespace normalization regexp's
	var RE_TIDY_TRAILING_WHITESPACE			= /([(\[+~])\s+/g;
	var RE_TIDY_LEADING_WHITESPACE			= /\s+([)\]+~])/g;
	var RE_TIDY_CONSECUTIVE_WHITESPACE		= /\s+/g;
	var RE_TIDY_TRIM_WHITESPACE				= /^\s*((?:[\S\s]*\S)?)\s*$/;
	
	// PIE
	var pie_path							= win.PIE && "behavior" in PIE ? PIE.behavior : js_path.replace(RE_ORIGIN, "") + "PIE.htc";

	function loadScript(src) {
		var script = doc.createElement("script");
		script.src = src;
		root.children[0].appendChild(script);
		return script;
	}

	function vunits(css, raw, ele) {
		if (ele) {
			var url = ele.getAttribute("href") || ele.getAttribute("data-href");
			if (url) {
				css = ajaxCache[url] || (ajaxCache[url] = css);
			} else {
				css = ele[strRawCssText] || (ele[strRawCssText] = css);
			}
		}
		var vh = (win.innerHeight || root.clientHeight) / 100,
			vw = (win.innerWidth || root.clientWidth) / 100,
			viewport = {
				max: Math.max(vh, vw),
				min: Math.min(vh, vw),
				h: vh,
				w: vw
			};

		return css.replace(
			/([-:\s])(\.\d+\w+)/g,
			"$10$2"
		).replace(
			/\b(\d+(\.\d+)?)v(w|h|max|min)\b/g,
			function(s, num, subNum, strUnit) {
				return (num * viewport[strUnit]).toFixed(4) + "px";
			}
		);
	}

	// IE media queries, vm, vw, vh, vmax, vmin, rem 
	function setLengthUnits() {
		var rem = root.currentStyle.fontSize.match(/([\d\.]+)([^\d\.]+)/),
			units = {
				"%": 0.12,
				em: 12,
				ex: 6
			},
			stylesheet,
			cssText;

		if(units[rem[2]]){
			rem[1] = rem[1] * units[rem[2]];
			rem[2] = "pt";
		} else {
			rem[1] = parseFloat(rem[1]);
		}

		for (var c = 0; c < doc.styleSheets.length; c++) {
			stylesheet = doc.styleSheets[c];
			cssText = stylesheet[strRawCssText];
			if (cssText) {
				cssText = vunits(cssText);
				if (ieVersion < 9) {
					cssText = cssText.replace(/\b(\d+(\.\d+)?)rem\b/g, function(s, num) {
						return (num * rem[1]) + rem[2];
					});
					// call media.match.js see https://github.com/reubenmoes/media-match */
					if (win.styleMedia) {
						cssText = cssText.replace(RE_MEDIA, function(str, strRules) {
							try {
								if (styleMedia.matchMedium(strRules)) {
									str = "@media all ";
								}
							} catch (ex) {}
							return str;
						});
					}
				}
				stylesheet.cssText = cssText;
			}
		}
	}

	// =========================== Patching ================================
	// --[ patchStyleSheet() ]----------------------------------------------
	// Scans the passed cssText for selectors that require emulation and
	// creates one or more patches for each matched selector.
	function patchStyleSheet( cssText ) {

		// css IE version query
		cssText = cssText.replace(RE_MEDIA, function(str, strRules) {
			return "@media " + strRules.replace(/\s+and\s+\(\s*(\w+\-)?msie\s*:\s*([\d\.]+)\s*\)/g, function(s, cond, ver) {
				ver = parseFloat(ver);
				if (cond) {
					if (/^max/.test(cond)) {
						cond = ver - ieVersion;
					} else if (/^min/.test(cond)) {
						cond = ieVersion - ver;
					}
					cond = cond >= 0;
				} else {
					cond = ver === ieVersion;
				}
				return cond ? EMPTY_STRING : s;
			});
		});

		// IE CSS3 properties
		cssText = cssText.replace(/{(([^{}]*)\bbackground(-\w+)?\s*:\s*(\w+-gradient\s*\([^;\}]+))/g, function(str, props, propsPre, backSubVal, gradient) {
			return /background(-image)?\s*:[^;]*url\(/g.test(propsPre) ? str : "{" + pie_path + "-pie-background:" + gradient + ";" + props;
		}).replace(
			/{(?=[^{}]*\bborder-image\s*:[^{}]+})/g,
			"{" + pie_path
		);
		if (ieVersion < 9) {
			cssText = cssText.replace(
				/{(?=[^{}]*\b(border-radius|\w+-shadow|pie-background)\s*:[^{}]+})/g,
				"{" + pie_path
			);
			if (ieVersion < 8) {
				cssText = cssText.replace(
					/([;\{\r\n]\s*display\s*:\s*inline-block)\s*([;\}])/g,
					"$1;*display:inline;*zoom:1$2"
				);
				if (ieVersion < 7) {
					cssText = cssText.replace(
						/([;\{\r\n]\s*position\s*:\s*fixed)\s*([;\}])/g,
						"$1;_position:absolute$2"
					).replace(
						/{(?=[^{}]*-pie-png-fix\s*:\s*true\b)/g,
						"{" + pie_path
					);
				}
			}
		} else {
			// Add prefix for transform
			cssText = cssText.replace(
				/([;\{\r\n])\s*(transform(-\w+)?\s*:[^;\}]+)/g,
				"$1-ms-$2;$2"
			).replace(
				/\bfilter\s*:\s*([^;\}]+)/g,
				function(s, vals) {
					// Disable some filter that conflict with CSS3
					vals = trim(vals.split(/\s+(?=\w+\s*[\(\:])/).filter(function(filter){
						return !/^(progid\s*\:\s*DXImageTransform\.Microsoft\.)?(Alpha|Matrix|Gradient|FlipH|FlipV)\s*\(/i.test(filter);
					}).join(" "));
					return vals ? "filter: " + vals : "";
				}
			);
		}

		// IE CSS3 selector
		return ieVersion > 8 ? cssText : cssText.replace(RE_PSEUDO_ELEMENTS, PLACEHOLDER_STRING).
			replace(RE_SELECTOR_GROUP, function(m, prefix, selectorText) {	
				var selectorGroups = selectorText.split(",");
				for (var c = 0, cs = selectorGroups.length; c < cs; c++) {
					var selector = normalizeSelectorWhitespace(selectorGroups[c]) + SPACE_STRING;
					var patches = [];
					selectorGroups[c] = selector.replace(RE_SELECTOR_PARSE, 
						function(match, combinator, pseudo, attribute, index) {
							if (combinator) {
								if (patches.length>0) {
									domPatches.push( { selector: selector.substring(0, index), patches: patches } )
									patches = [];
								}
								return combinator;
							}		
							else {
								var patch = (pseudo) ? patchPseudoClass( pseudo ) : patchAttribute( attribute );
								if (patch) {
									patches.push(patch);
									return "." + patch.className;
								}
								return match;
							}
						}
					);
				}
				return prefix + selectorGroups.join(",");
			});
	};

	// --[ patchAttribute() ]-----------------------------------------------
	// returns a patch for an attribute selector.
	function patchAttribute( attr ) {
		return (!BROKEN_ATTR_IMPLEMENTATIONS || BROKEN_ATTR_IMPLEMENTATIONS.test(attr)) ? 
			{ className: createClassName(attr), applyClass: true } : null;
	};

	// --[ patchPseudoClass() ]---------------------------------------------
	// returns a patch for a pseudo-class
	function patchPseudoClass( pseudo ) {

		var applyClass = true;
		var className = createClassName(pseudo.slice(1));
		var isNegated = pseudo.substring(0, 5) == ":not(";
		var activateEventName;
		var deactivateEventName;

		// if negated, remove :not() 
		if (isNegated) {
			pseudo = pseudo.slice(5, -1);
		}
		
		// bracket contents are irrelevant - remove them
		var bracketIndex = pseudo.indexOf("(")
		if (bracketIndex > -1) {
			pseudo = pseudo.substring(0, bracketIndex);
		}		
		
		// check we're still dealing with a pseudo-class
		if (pseudo.charAt(0) == ":") {
			switch (pseudo.slice(1)) {

				case "root":
					applyClass = function(e) {
						return isNegated ? e != root : e == root;
					}
					break;

				case "target":
					// :target is only supported in IE8
					if (ieVersion == 8) {
						applyClass = function(e) {
							var handler = function() { 
								var hash = location.hash;
								var hashID = hash.slice(1);
								return isNegated ? (hash == EMPTY_STRING || e.id != hashID) : (hash != EMPTY_STRING && e.id == hashID);
							};
							addEvent( win, "hashchange", function() {
								toggleElementClass(e, className, handler());
							})
							return handler();
						}
						break;
					}
					return false;
				
				case "checked":
					applyClass = function(e) { 
						if (RE_INPUT_CHECKABLE_TYPES.test(e.type)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName == "checked") {
									toggleElementClass( e, className, e.checked !== isNegated );
								} 							
							})
						}
						return e.checked !== isNegated;
					}
					break;
					
				case "disabled":
					isNegated = !isNegated;

				case "enabled":
					applyClass = function(e) { 
						if (RE_INPUT_ELEMENTS.test(e.tagName)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName == "$disabled") {
									toggleElementClass( e, className, e.$disabled === isNegated );
								} 
							});
							enabledWatchers.push(e);
							e.$disabled = e.disabled;
							return e.disabled === isNegated;
						}
						return pseudo == ":enabled" ? isNegated : !isNegated;
					}
					break;
					
				case "focus":
					activateEventName = "focus";
					deactivateEventName = "blur";
								
				case "hover":
					if (!activateEventName) {
						activateEventName = "mouseenter";
						deactivateEventName = "mouseleave";
					}
					applyClass = function(e) {
						addEvent( e, isNegated ? deactivateEventName : activateEventName, function() {
							toggleElementClass( e, className, true );
						})
						addEvent( e, isNegated ? activateEventName : deactivateEventName, function() {
							toggleElementClass( e, className, false );
						})
						return isNegated;
					}
					break;
					
				// everything else
				default:
					// If we don't support this pseudo-class don't create 
					// a patch for it
					if (!RE_PSEUDO_STRUCTURAL.test(pseudo)) {
						return false;
					}
					break;
			}
		}
		return { className: className, applyClass: applyClass };
	};

	// --[ applyPatches() ]-------------------------------------------------
	function applyPatches() {
		var elms, selectorText, patches, domSelectorText;

		for (var c=0; c<domPatches.length; c++) {
			selectorText = domPatches[c].selector;
			patches = domPatches[c].patches;

			// Although some selector libraries can find :checked :enabled etc.
			// we need to find all elements that could have that state because
			// it can be changed by the user.
			domSelectorText = selectorText.replace(RE_LIBRARY_INCOMPATIBLE_PSEUDOS, EMPTY_STRING);

			// If the dom selector equates to an empty string or ends with
			// whitespace then we need to append a universal selector (*) to it.
			if (domSelectorText == EMPTY_STRING || domSelectorText.charAt(domSelectorText.length - 1) == SPACE_STRING) {
				domSelectorText += "*";
			}

			// Ensure we catch errors from the selector library
			try {
				elms = selectorMethod( domSelectorText );
			} catch (ex) {
				// #DEBUG_START
				log( "Selector '" + selectorText + "' threw exception '" + ex + "'" );
				// #DEBUG_END
			}


			if (elms) {
				for (var d = 0, dl = elms.length; d < dl; d++) {
					var elm = elms[d];
					var cssClasses = elm.className;
					for (var f = 0, fl = patches.length; f < fl; f++) {
						var patch = patches[f];
						if (!hasPatch(elm, patch)) {
							if (patch.applyClass && (patch.applyClass === true || patch.applyClass(elm) === true)) {
								cssClasses = toggleClass(cssClasses, patch.className, true );
							}
						}
					}
					elm.className = cssClasses;
				}
			}
		}
	};

	// --[ hasPatch() ]-----------------------------------------------------
	// checks for the exsistence of a patch on an element
	function hasPatch( elm, patch ) {
		return new RegExp("(^|\\s)" + patch.className + "(\\s|$)").test(elm.className);
	};
	
	
	// =========================== Utility =================================
	
	function createClassName( className ) {
		return namespace + "-" + ((ieVersion == 6 && patchIE6MultipleClasses) ?
			ie6PatchID++
		:
			className.replace(RE_PATCH_CLASS_NAME_REPLACE, function(a) { return a.charCodeAt(0) }));
	};

	// --[ isDocComplete() ]-----------------------------------------------------
	// checks doc.readyState
	function isDocComplete() {
		return doc.readyState === "complete";
	};

	// --[ log() ]----------------------------------------------------------
	// #DEBUG_START
	function log( message ) {
		if (win.console) {
			win.console.log(message);
		}
	};
	// #DEBUG_END

	// --[ trim() ]---------------------------------------------------------
	// removes leading, trailing whitespace from a string
	function trim( text ) {
		return text.replace(RE_TIDY_TRIM_WHITESPACE, PLACEHOLDER_STRING);
	};

	// --[ normalizeWhitespace() ]------------------------------------------
	// removes leading, trailing and consecutive whitespace from a string
	function normalizeWhitespace( text ) {
		return trim(text).replace(RE_TIDY_CONSECUTIVE_WHITESPACE, SPACE_STRING);
	};

	// --[ normalizeSelectorWhitespace() ]----------------------------------
	// tidies whitespace around selector brackets and combinators
	function normalizeSelectorWhitespace( selectorText ) {
		return normalizeWhitespace(selectorText.
			replace(RE_TIDY_TRAILING_WHITESPACE, PLACEHOLDER_STRING).
			replace(RE_TIDY_LEADING_WHITESPACE, PLACEHOLDER_STRING)
		);
	};

	// --[ toggleElementClass() ]-------------------------------------------
	// toggles a single className on an element
	function toggleElementClass( elm, className, on ) {
		var oldClassName = elm.className;
		var newClassName = toggleClass(oldClassName, className, on);
		if (newClassName != oldClassName) {
			elm.className = newClassName;
			elm.parentNode.className += EMPTY_STRING;
		}
	};

	// --[ toggleClass() ]--------------------------------------------------
	// adds / removes a className from a string of classNames. Used to 
	// manage multiple class changes without forcing a DOM redraw
	function toggleClass( classList, className, on ) {
		var re = RegExp("(^|\\s)" + className + "(\\s|$)");
		var classExists = re.test(classList);
		if (on) {
			return classExists ? classList : classList + SPACE_STRING + className;
		} else {
			return classExists ? trim(classList.replace(re, PLACEHOLDER_STRING)) : classList;
		}
	};
	
	// --[ addEvent() ]-----------------------------------------------------
	function addEvent(elm, eventName, eventHandler) {
		elm.attachEvent("on" + eventName, eventHandler);
	};

	// --[ loadStyleSheet() ]-----------------------------------------------
	function loadStyleSheet( url ) {
		var cssText = ajaxCache[url];

		if (win.jQuery) {
			cssText = jQuery.ajax(url, {
				dataType: "text",
				async: false
			}).responseText;
		}
		if (!cssText) {
			try {
				xhr.open("GET", url, false);
				xhr.send();
				if (xhr.status === 200) {
					cssText = xhr.responseText;
				} else {
					log(url + "\t Error:" + xhr.status);
				}
			} catch (ex) {
				if(RE_ORIGIN.test(url)){
					cssText = loadStyleSheet(url.replace(RE_ORIGIN, EMPTY_STRING));
				}
			}
			ajaxCache[url] = cssText;
		}
		return cssText || EMPTY_STRING;
	};
	
	// --[ resolveUrl() ]---------------------------------------------------
	// Converts a URL fragment to a fully qualified URL using the specified
	// context URL. Returns null if same-origin policy is broken
	function resolveUrl( url, contextUrl, ignoreSameOriginPolicy ) {

		function getProtocol( url ) {
			return url.substring(0, url.indexOf("//"));
		};

		function getProtocolAndHost( url ) {
			return url.substring(0, url.indexOf("/", 8));
		};

		if (!contextUrl) {
			contextUrl = baseUrl;
		}

		// protocol-relative path
		if (url.substring(0,2)=="//") {
			url = getProtocol(contextUrl) + url;
		}

		// absolute path
		if (/^\w+:\/\//i.test(url)) {
			return !ignoreSameOriginPolicy && getProtocolAndHost(contextUrl) != getProtocolAndHost(url) ? null : url ;
		}

		// root-relative path
		if (url.charAt(0)=="/")	{
			return getProtocolAndHost(contextUrl) + url;
		}

		// relative path
		var contextUrlPath = contextUrl.split(/[?#]/)[0]; // ignore query string in the contextUrl	
		if (url.charAt(0) != "?" && contextUrlPath.charAt(contextUrlPath.length - 1) != "/") {
			contextUrlPath = contextUrlPath.substring(0, contextUrlPath.lastIndexOf("/") + 1);
		}

		return contextUrlPath + url;
	};
	
	// --[ parseStyleSheet() ]----------------------------------------------
	// Downloads the stylesheet specified by the URL, removes it's comments
	// and recursivly replaces @import rules with their contents, ultimately
	// returning the full cssText.
	function parseStyleSheet( url ) {
		if (url) {
			return loadStyleSheet(url).replace(RE_COMMENT, EMPTY_STRING).
			replace(RE_IMPORT, function( match, quoteChar, importUrl, quoteChar2, importUrl2, media ) {
				var cssText = parseStyleSheet(resolveUrl(importUrl || importUrl2, url));
				return (media) ? "@media " + media + " {" + cssText + "}" : cssText;
			}).
			replace(RE_ASSET_URL, function( match, isBehavior, quoteChar, assetUrl ) { 
				quoteChar = quoteChar || EMPTY_STRING;
				return isBehavior ? match : " url(" + quoteChar + resolveUrl(assetUrl, url, true) + quoteChar + ") "; 
			});
		}
		return EMPTY_STRING;
	};

	// --[ getStyleSheets() ]-----------------------------------------------
	function getStyleSheets() {
		if (ieVersion < 8 && win.PIE && !PIE.attach_ie67) {
			PIE.attach_ie67 = function(node) {
				function start() {
					clearTimeout(timer);
					PIE.attach(node);
				}
				var $ = win.jQuery,
					timer;
				if($){
					timer = setTimeout(start, 800);
					$(start);
				}else {
					start();
				}
				node.runtimeStyle.behavior = "none";
			}
		}

		var styles = doc.getElementsByTagName("style"),
			styleSheet,
			rawCssText,
			url,
			i;
		for (i = styles.length - 1; i >= 0; i--) {
			rawCssText = styles[i].innerHTML;
			styleSheet = styles[i].styleSheet;
			if (!(strRawCssText in styleSheet)) {
				styleSheet[strRawCssText] = patchStyleSheet(rawCssText);
			}
		}

		for (i = doc.styleSheets.length - 1; i >= 0; i--) {
			styleSheet = doc.styleSheets[i]
			url = styleSheet.href;
			if (url && !(strRawCssText in styleSheet)) {
				styleSheet[strRawCssText] = patchStyleSheet(parseStyleSheet(resolveUrl(url) || url));
			}
		}
		setLengthUnits();
	};

	// --[ init() ]---------------------------------------------------------
	function init() {

		if (pie_path && !win.PIE) {
			try {
				eval.call(win, loadStyleSheet(js_path));
			} catch (ex) {}
		}

		getStyleSheets();

		// If were not in standards mode, IE is too old / new or we can't create
		if ( ieVersion < 9 ) {

			applyPatches();

			// :enabled & :disabled polling script (since we can't hook 
			// onpropertychange event when an element is disabled) 
			if (enabledWatchers.length > 0) {
				setInterval( function() {
					for (var c = 0, cl = enabledWatchers.length; c < cl; c++) {
						var e = enabledWatchers[c];
						if (e.disabled !== e.$disabled) {
							if (e.disabled) {
								e.disabled = false;
								e.$disabled = true;
								e.disabled = true;
							}
							else {
								e.$disabled = e.disabled;
							}
						}
					}
				}, 250);
			}
		}
	};

	if(ieVersion < 8){
		pie_path = "behavior: expression(window.PIE&&PIE.attach_ie67&&PIE.attach_ie67(this));";
	} else if(loadStyleSheet(pie_path)) {
		pie_path = "behavior: url(" + pie_path + ");";
	} else {
		pie_path = EMPTY_STRING;
	}

	if(pie_path && !win.PIE){
		js_path += "PIE_IE" + ( ieVersion < 9 ? "678" : "9" ) + ".js";
		loadScript(js_path);
	}

	// Determine the baseUrl and download the stylesheets
	var baseTags = doc.getElementsByTagName("BASE");
	var baseUrl = (baseTags.length > 0) ? baseTags[0].href : doc.location.href;
	getStyleSheets();

	addEvent(win, "resize", setLengthUnits);

	// Bind selectivizr to the ContentLoaded event. 
	ContentLoaded(function() {
		// Determine the "best fit" selector engine
		for (var engine in selectorEngines) {
			var members, member, context = win;
			if (win[engine]) {
				members = selectorEngines[engine].replace("*", engine).split(".");
				while ((member = members.shift()) && (context = context[member])) {}
				if (typeof context == "function") {
					selectorMethod = context;
					init();
					return;
				}
			}
		}
		init();
	});
	
	
	/*!
	 * ContentLoaded.js by Diego Perini, modified for IE<9 only (to save space)
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 */

	// @w window reference
	// @f function reference
	function ContentLoaded(fn) {
		if(win.jQuery){
			return jQuery(fn);
		}
		var isReady = false;
		function completed() {
			// readyState === "complete" is good enough for us to call the dom ready in oldIE
			if ( !isReady ) {
				isReady = true;
				fn();
			}
		}
		if ( isDocComplete() ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout(completed);

		// Standards-based browsers support DOMContentLoaded
		} else if ( doc.addEventListener ) {
			// Use the handy event callback
			doc.addEventListener( "DOMContentLoaded", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			doc.attachEvent( "onreadystatechange", function(){
				if( isDocComplete() ){
					completed();
				}
			} );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = win.frameElement == null && root;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						completed();
					}
				})();
			}
		}
	}
})(this);
