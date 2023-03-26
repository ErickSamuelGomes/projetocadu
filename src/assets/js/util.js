// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () { };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*
Utils
*/
var h = {};

h.isIE = /MSIE \d|Trident.*rv:/.test(navigator.userAgent);
h.isIE8 = navigator.userAgent.search("Trident/4.0") > -1;
h.isIE9 = navigator.userAgent.search("Trident/5.0") > -1;
h.isIE10 = navigator.userAgent.search("Trident/6.0") > -1;
h.isIE11 = navigator.userAgent.search("Trident/7.0") > -1;
h.isPwa = window.matchMedia('(display-mode: standalone)').matches;
h.isIos = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform);
h.isAndroid = ['Linux', 'Android ', null].filter( x=> navigator.platform.indexOf(x) >= 0 );

/*
Error handling
*/
//IE8+
window.onerror = function (message, file, line) {
    h.showClientError(message, file, line);
}

//mostra erro de cliente na tela
h.showClientError = function (message, file, line) {
    if (file == null) file = "";
    if (line == null) line = "";
    var containers = document.getElementsByClassName("alert-js");
    if (containers.length > 0) {
        var container = containers[0];
        if (container != null) {
            container.innerHTML = container.innerHTML + "<small>" + message + ", " + file + ", " + line + "</small>";
            container.style.display = "block";
        }
    }

}

//capta erro de requisição ajax
h.ajaxErrorHandler = function (request, textStatus, errorThrown) {
    var msg = "";
    
    if (request.status != 200) {
        var data;

        if (request.responseText) {
    
            data = h.parseJSON(request.responseText);

        } else if (request.responseJSON) {
    
            data = request.responseJSON;

        } else if (request.statusText) {
    
            msg += request.statusText + "";

        }

        if (data && data.error) {
    
            if (data.error.FriendlyMessage) {
    
                msg += data.error.FriendlyMessage + "";
            }
            if (data.error.logCode) {
    
                msg += data.error.LogCode + "";
            }

        }
    }

    h.forEach(document.querySelectorAll(".spinner"), function (_i, item) {
        h.addClass(item, "d-none");
    });
    

    h.showClientError(msg);
}


/*
Polyfill IE8
*/
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

/*
Polyfill replaceWith - Safari, and IE > 10
*/
function replaceWithPolyfill() {
    'use-strict'; // For safari, and IE > 10
    var parent = this.parentNode, i = arguments.length, currentNode;
    if (!parent) return;
    if (!i) // if there are no arguments
        parent.removeChild(this);
    while (i--) { // i-- decrements i and returns the value of i before the decrement
        currentNode = arguments[i];
        if (typeof currentNode !== 'object') {
            currentNode = this.ownerDocument.createTextNode(currentNode);
        } else if (currentNode!=null && currentNode.parentNode) {
            currentNode.parentNode.removeChild(currentNode);
        }
        if(currentNode!=null) {
            // the value of "i" below is after the decrement
            if (!i) // if currentNode is the first argument (currentNode === arguments[0])
                parent.replaceChild(currentNode, this);
            else // if currentNode isn't the first
                parent.insertBefore(this.previousSibling, currentNode);
        }
    }
}
if (!Element.prototype.replaceWith)
    Element.prototype.replaceWith = replaceWithPolyfill;
/*if (!DocumentType.prototype.replaceWith)
    DocumentType.prototype.replaceWith = replaceWithPolyfill;
if (CharacterData!=null && CharacterData!=undefined && !CharacterData.prototype.replaceWith)
    CharacterData.prototype.replaceWith = replaceWithPolyfill;
    */




//document.ready, including IE8+
h.ready = function (fn) {
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
    } else if (document.attachEvent) {

        document.attachEvent("onreadystatechange", function () {
            if (document.readyState === "complete") {
                fn();
            }
        });
    }
}

h.serialize = function (container) {
    if(container==null) return "";
    
    var elements = container.querySelectorAll("input, select, textarea");

    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < elements.length; i++) {

        var field = elements[i];
        var fieldname = field.name != "" ? field.name : field.id;
        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
        
        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push(encodeURIComponent(fieldname) + "=" + encodeURIComponent(field.options[n].value));
            }
        }

        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push(encodeURIComponent(fieldname) + "=" + encodeURIComponent(field.value));
        }
    }
    return serialized.join('&');
};

h.serializeToJson = function (container) {
    if (container == null) return "";

    const elements = container.querySelectorAll("input, select, textarea");

    // Setup our serialized data
    const serialized = [];

    // Loop through each field in the form
    for (let i = 0; i < elements.length; i++) {

        const field = elements[i];
        const fieldname = field.name !== "" ? field.name : field.id;
        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
            for (let n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push(`"${encodeURIComponent(fieldname)}":"${encodeURIComponent(field.options[n].value)}"`);
            }
        }

        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push(`"${encodeURIComponent(fieldname)}":"${encodeURIComponent(field.value)}"`);
        }
    }
    return JSON.parse(`{${serialized.join(',')}}`);
};

//faz uma POST para JSON
h.postJSON = function (url, callbackSuccess, callbackError) {
    var qs = "";
    if (callbackError == null) callbackError = h.ajaxErrorHandler;
    if (url.indexOf('?') >= 0) {
        var array_url = url.split('?');
        url = array_url[0];
        qs = array_url[1];
    }

    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    setAFToken(request);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = h.parseJSON(request.responseText);
            callbackSuccess(data);

        } else {
            callbackError(request);
        }
    };

    request.onerror = function () {
        callbackError(request);
    };
    request.send(qs);
}


h.callWebAPI = function (url, method, data, callbackSuccess, callbackError) {
    var qs = "";
    if (callbackError == null) callbackError = h.ajaxErrorHandler;
    if (!(typeof data === 'string' || data instanceof String)) data = JSON.stringify(data);

    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    setAFToken(request);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = h.parseJSON(request.responseText);
            callbackSuccess(data);

        } else {
            callbackError(request);
        }
    };

    request.onerror = function () {
        callbackError(request);
    };
    request.send(data);
}


//faz um GET para JSON
h.getJSON = function (url, callbackSuccess, callbackError) {
    if (callbackError == null) callbackError = h.ajaxErrorHandler;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    setAFToken(request);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = h.parseJSON(request.responseText);
            callbackSuccess(data);

        } else {
            callbackError(request);
        }
    };

    request.onerror = function () {
        callbackError(request);
    };
    request.send();
}


h.get = function (url, callback) {

    var localTest = /^(?:file):/;
    var request = new XMLHttpRequest();
    var status = 0;

    request.onreadystatechange = function () {
        /* if we are on a local protocol, and we have response text, we'll assume
    *  				things were sucessful */
        if (request.readyState == 4) {
            status = request.status;
        }
        if (localTest.test(location.href) && request.responseText) {
            status = 200;
        }
        if (request.readyState == 4 && status == 200) {

            var ret = request.responseText;
            callback(ret);
        }
    }

    try {
        request.open("GET", url, true);
        
        setAFToken(request);
            
        request.send();
    } catch (err) {
        /* todo catch error */
    }

}

h.parseJSON = function(responseText, url) {
    if(!responseText) return "";
    try {
        return JSON.parse(responseText);
    }catch(e) {
        console.log(url);
        console.log(responseText);
        return "";
    }
}

h.isInIframe = function() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


h.matches = function (el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };

    return f.call(el, selector);
}

h.triggerEvent = function(el, type) {

    var e = new Event(type);
    el.dispatchEvent(e);
}

h.triggerCustomEvent = function(el, type) {

    var e = new CustomEvent(type);
    el.dispatchEvent(e);
}

h.delegateEvent = function (el, ev, selector, fn, options) {
    h.addEventListener(el, ev, function (e) {
       
        if (e.target && (h.matches(e.target, selector + ", " + selector + " *"))) {
            fn(e, e.target);
        } /*else if (e.target && e.target.parentNode && (h.matches(e.target.parentNode, selector))) {
            fn(e, e.target.parentNode);
        } else if (e.target && e.target.parentNode && e.target.parentNode.parentNode && (h.matches(e.target.parentNode.parentNode, selector))) {
            fn(e, e.target.parentNode.parentNode);
        }*/
        
    }, options);
}


h.addEventListener = function (el, ev, fn, options) {

    if (!el || el == null) return;

    if (el.length && el.length > 0) {

        // Em alguns casos window pode conter mais de 1 elemento window, quando é global ocorre erro ao acessar addEventListener
        var itemFunction = el == window ?
            function (e, item) { try { item.addEventListener(ev, fn, options); } catch (err) { } } :
            function (e, item) { item.addEventListener(ev, fn, options); };

        h.forEach(el, itemFunction);

    } else if (el.addEventListener) {
        el.addEventListener(ev, fn, options);
    }
}

h.forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, i, array[i]); // passes back stuff we need
    }
};

h.addClass = function (el, className) {
    if (!el) return;
    if (className==null || className==='') return;
    h.forEach(className.split(' '), function(i, css) {
        if(css.trim()!==''){
            if (el.classList)
                el.classList.add(css);
            else
                el.className += ' ' + css;
        }
    }); 
}

h.removeClass = function (el, className) {
    if(el === null) return;
    if(typeof el != 'object') el = document.querySelectorAll(el);
    if (el && el!=null) {

        execRemoveClass = function(item) {
            if (item.classList)
                item.classList.remove(className);   
            else
                item.className = item.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }

        if (el.length && el.length > 0) {
			execRemoveClass(el);
            h.forEach(el, function(i, item) {
                execRemoveClass(item);
            });
        }
        else {
            execRemoveClass(el) ;
        }
    }

}

h.hasClass = function (el, className) {
    if (!el) return;
    if (el.classList) {
        return el.classList.contains(className);
    } else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
}

h.toggleClass = function (el, className) {
    if (!el) return;
    if (h.hasClass(el, className)) {
        h.removeClass(el, className);
        return "";
    } else {
        h.addClass(el, className);
        return className;
    }
}

h.getCookie = function (sName) {
    var oCrumbles = document.cookie.split(';');
    for (var i = 0; i < oCrumbles.length; i++) {
        var oPair = oCrumbles[i].split('=');
        var sKey = decodeURIComponent(oPair[0].trim());
        var sValue = oPair.length > 1 ? oPair[1] : '';
        if (sKey == sName) {
            return decodeURIComponent(sValue);
        }
    }
    return '';
};

h.setCookie = function (sName, sValue, options) {

    //valor default é durar 1 ano
    if(options==null || options ==="") {
        var cookie_expire_date = new Date();
        cookie_expire_date.setFullYear(cookie_expire_date.getFullYear() + 1);
        options = { path: '/', expires: cookie_expire_date };
    }

    var sCookie = encodeURIComponent(sName) + '=' + encodeURIComponent(sValue);
    // Shorthand: options === expires date
    if (options && options instanceof Date) {
        options = {
            expires: options
        };
    }
    // Longhand: options object
    if (options && typeof options == 'object') {
        if (options.expires) {
            sCookie += '; expires=' + options.expires.toUTCString();
        }
        if (options.path) {
            sCookie += '; path=' + options.path.toString();
        }
        if (options.domain) {
            sCookie += '; domain=' + options.domain.toString();
        }
        if (options.secure) {
            sCookie += '; secure';
        }
    }

    document.cookie = sCookie;
};

h.removeCookie = function (sName, options) {
    if (!options) {
        var options = {};
    }
    options.expires = new Date();
    h.setCookie(sName, '', options);
};


h.addScript = function (src, callback, async, condition) {
    if (async == null) async = false;
    if (condition == null) condition = true;
    if (condition == null) callback = false;
    if (condition) {
        var s = document.createElement('script');
        var loaded;
        if (callback) {
            s.onload = function () {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        if (async) s.async = true;
        s.setAttribute("src", src);
        document.body.appendChild(s);
    }
}



h.getJsFilePath = function (filename) {
    var scriptElements = document.getElementsByTagName('script');
    for (var i = 0; i < scriptElements.length; i++) {
        var source = scriptElements[i].src;
        if (source.indexOf(filename) > -1) {
            var location = source.substring(0, source.indexOf(filename));
            return location;

        }
    }
    return false;
}

h.remove = function(el) {
    if(el === null) return false;
    if(typeof el != 'object') el = document.querySelectorAll(el);
    if(el === null) return false;
    
    if(el.length && el.length > 1) {
        h.forEach(x, function(i, item) {
            if(item.parentNode!==null)
                item.parentNode.removeChild(item);
        });
    }else {
        if(el.parentNode && el.parentNode!==null)
            el.parentNode.removeChild(el);
    }
}

h.hashCode = function(s) {
    var hash = 0;
    if (s.length == 0) {
        return hash;
    }
    for (var i = 0; i < s.length; i++) {
        var char = s.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

//verifica se o objeto/string é nulo ou vazio
h.isNullOrEmpty = function(s) {
    return !s || s===null || (h.isString(s) && (s==="" || s.trim()===""));
}

//se objeto/string é nulo retorna vazio
h.toEmptyIfNull = function(s) {
    return h.isNullOrEmpty(s) ? "" : s;
}

//verifica se objeto é string
h.isString = function(s) {
    return (typeof s === 'string' || s instanceof String);
}

//verifica se objeto é boolean
h.isBoolean = function(s) {
    return (typeof s === 'boolean');
}

//verifica se objeto/string é verdadeiro
h.isTrue = function(s, defaultvalue) {

    defaultvalue = defaultvalue || false;

    if(h.isNullOrEmpty(s))
        return defaultvalue;

    if(h.isString(s) && s==="true")
        return true;

    if(h.isString(s) && s==="false")
        return false;        

    if(h.isBoolean(s) )
        return s;        

    return defaultvalue;   
}

//pega valor da querystring
h.getQueryString = function(s) {
    return new URLSearchParams(window.location.search).get(s);
}

setAFToken = function (request) {
    var afToken = document.querySelector("input[name=__RequestVerificationToken]");
    if (afToken)
        request.setRequestHeader("X-SML-AntiForgeryToken", afToken.value);
}

