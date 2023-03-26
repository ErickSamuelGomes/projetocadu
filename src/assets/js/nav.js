var navsml = {};

navsml.init = function () {

    navsml.checkForComponentsToLoad();
    navsml.prepareLinkToAjax(bsml.global.body, ".ajax-link");
    navsml.checkUrlForHashPath();   
}

navsml.checkUrlForHashPath = function() {
    var url = location.hash.replace("#!", "");
    if(url && url!="") {
        navsml.ajaxNavigator(url, function(ret) {
            navsml.changePageContent(ret);
            navsml.changePageLocation(url);
        });
    }
}

navsml.checkForComponentsToLoad = function() {
    var components = document.querySelectorAll("[data-load-from]");
    h.forEach(components, function(item, component) {
        var url = component.getAttribute("data-load-from");
        if(url && url!="") {
            navsml.ajaxNavigator(url, function(ret) {
                var div = document.createElement("div");
                div.innerHTML = ret;
                component.appendChild(div);

                navsml.processBootstrap(component);
                tsml.translate(component);
            });      
        }
    });
}

navsml.processBootstrap = function(component) {

    bsml.convertIcons();    
    
    if(typeof BSN.Dropdown === 'function') {
        
        var dropdowns = component.querySelectorAll("[data-toggle='dropdown']");
        h.forEach(dropdowns, function(item, dropdown) {
            new BSN.Dropdown(dropdown, true );
        });
    }
    
    if(typeof BSN.Collapse === 'function') {    
        var collapses = component.querySelectorAll("[data-toggle='collapse']");
        h.forEach(collapses, function(item, collapse) {
            new BSN.Collapse(collapse, true );
        });
    }

    if(typeof BSN.Modal === 'function') {
        var modals = component.querySelectorAll("[data-toggle='modal']");
        h.forEach(modals, function(item, modal) {
            new BSN.Modal(modal );
        });
    }
    if(typeof BSN.Tab === 'function') {
        var tabs = component.querySelectorAll("[data-toggle='tab']");
        h.forEach(tabs, function(item, tab) {
            new BSN.Tab(tab );
        });
    }
    if(typeof BSN.Carrousel === 'function') {
        var carrousels = component.querySelectorAll("[data-ride='carousel']");
        h.forEach(carrousels, function(item, slide) {
            new BSN.Carrousel(slide);
        });
    }
    if(typeof BSN.Button === 'function') {
        var buttons = component.querySelectorAll("[data-toggle='buttons']");
        h.forEach(buttons, function(item, button) {
            new BSN.Button(button);
        });
    }
}

navsml.prepareLinkToAjax = function(el, selector) {
    h.delegateEvent(el, "click", selector, function(e, _this) {    
        var url = _this.getAttribute("href");
        if(url && url!="") {
            navsml.ajaxNavigator(url, function(ret) {
                navsml.changePageContent(ret);
                navsml.changePageLocation(url);
            });            
        }
        e.preventDefault();
        return false;
    });
}


navsml.ajaxNavigator = function(url, callback) {
    //bsml.openOverlay();    
    h.get(url + ".html", function(ret) {
      //  bsml.closeOverlay();
        callback(ret);
    });
}

navsml.changePageContent = function(html) {
    var container = document.querySelector(".page-content");
    container.innerHTML = "";
    var div = document.createElement('div');
    div.innerHTML = html;
    container.insertAdjacentHTML('afterBegin', html);

    var runscript = container.querySelector("#runscript");
    if(runscript && runscript.innerHTML!="") {
        
        eval(runscript.innerHTML);
    }

    bsml.convertIcons();    
    navsml.processBootstrap(container);
    bsml.resizeIframes();
    tsml.translate(container);
    bsml.setToggleContainer();
    bsml.checkShortcuts();
    
    checksml.init();
}

navsml.changePageLocation = function(url) {
    location.href = location.pathname + "#!" + url;
}

//document ready
h.ready(function () {
    navsml.init();
});