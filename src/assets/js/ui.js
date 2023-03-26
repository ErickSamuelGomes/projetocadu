'use strict';
// Avoid `console` errors in browsers that lack a console.
/*
Interface
*/
var bsml = bsml || {};

bsml.properties = {
    closeOverlayOnClick: false
}

bsml.global = {
    window: document.querySelector('html'),
    header: document.querySelector('.page-header'),
    body: document.querySelector('body'),
    menu: document.querySelector(".menu"),
    page_content: document.querySelector('.page-content'),
    alert_system: document.querySelector(".alert-system"),
    preloader: document.querySelector(".preloader"),
    use_preloader: !h.hasClass(document.querySelector('body'), "no-preload"),
    is_menu_opened: h.hasClass(document.querySelector('body'), "menu-mobile-opened")
}


bsml.init = function () {

    bsml.applyStyleBasedOnQueryString(bsml.global.body, "remove-header=1", "remove-header");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "remove-menu=1", "remove-menu");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "remove-title=1", "remove-title");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "expand=1", "template-expand");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "embed=1", "embed");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "debug=1", "debug");
    bsml.applyStyleBasedOnQueryString(bsml.global.body, "trial=1", "trial");

    bsml.addPrivayStatement(bsml.global.body);
    bsml.addExtraComponents(bsml.global.body, bsml.global.alert_system);
    bsml.controOfflineStatus(bsml.global.body);
    //bsml.showGoToTop();
    bsml.setHideObjectOnScroll(bsml.global.header, "page-header-hide");

    bsml.setExpanded();
    bsml.setOpenCloseBoxes();
    bsml.setToggleContainer();
    bsml.resizeIframes();
	bsml.loadSprite(bsml.global.body);
    bsml.convertIcons();
    bsml.setAutosuggest();
    bsml.setDatePicker();
    bsml.checkShortcuts();
    tsml.translate(bsml.global.body);
    

    h.delegateEvent(bsml.global.header, "click", ".btn-open-menu", bsml.toggleMenu);
    h.delegateEvent(bsml.global.header, "click", ".btn-contract", bsml.toggleExpand);
    h.delegateEvent(bsml.global.header, "click", ".btn-expand", bsml.toggleExpand);
    h.delegateEvent(bsml.global.header, "click", ".btn-expand-search", bsml.toggleSearch);

    h.delegateEvent(bsml.global.menu, "click", ".nav-link", bsml.toogleMenuLinkActive);
    h.delegateEvent(bsml.global.page_content, "click", ".box-open-and-close .box-header", bsml.toggleBox);
    h.delegateEvent(bsml.global.body, "click", ".alert .close", bsml.dismissAlert);
    h.delegateEvent(bsml.global.body, "click", "[data-toggle-target]", bsml.toogleContainer);

    h.delegateEvent(bsml.global.body, "click", "[data-toggle='alert']", bsml.notificate);

    h.delegateEvent(bsml.global.body, "click", ".app-overlay", bsml.closeOverlay);
    
    if ('ontouchstart' in document.documentElement) {
        bsml.global.body.style.height = "100%";
        h.delegateEvent(bsml.global.body, "touchstart", ".app-overlay", bsml.closeOverlay);
    }

    var isOnIOS = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i);
    var eventName = isOnIOS ? "pagehide" : "beforeunload";
    
    h.addEventListener(window.self, eventName, bsml.showPreloader);
    
    //h.addEventListener(window.self, "unload", bsml.hidePreloader);

    bsml.hidePreloader();
}

//Adiciona box de alerta de privacidade
bsml.addPrivayStatement = function(container) {
    
    if(!h.hasClass(bsml.global.body, "use-privacy")) return;

    const cookie_name = "bsml.privacy.accept";
    const cookie_value = h.getCookie(cookie_name)
    
    if(cookie_value==null || cookie_value!=="true" ) {
        
        const html = `<div class="alert privacy" id="containerPrivacy" >
                        ${tsml.getTranslation("privacy_message")}
                        <button type="button" id="btnClosePrivacy" class="btn btn-info btn-xs btn-mobile mt-2">${tsml.getTranslation("privacy_button")}</button>
                    </div>`;
        
        container.insertAdjacentHTML("afterbegin", html);

        h.addEventListener(document.getElementById("btnClosePrivacy"), "click", function() {

            var cookie_expire_date = new Date();
            cookie_expire_date.setFullYear(cookie_expire_date.getFullYear() + 1);
            var cookie_options = { path: '/', expires: cookie_expire_date };        
            h.setCookie(cookie_name, "true", cookie_options);

            h.remove(document.getElementById("containerPrivacy"));
            
        });
    }   
}


bsml.checkShortcuts = function () {
    var shortcuts = [];
    var els = document.querySelectorAll("[data-accesskey-code]");
    h.forEach(els, function (i, el) {
        shortcuts.push({ element: el, code: el.getAttribute("data-accesskey-code") });
    });

    document.onkeyup = function (e) {
        if(e==null || e.srcElement==null) return;
        var isContentEditable = e.srcElement.getAttribute("contenteditable")!=null && e.srcElement.getAttribute("contenteditable")=="true"
        var isinput = /^(?:input|select|textarea)$/i.test(e.srcElement.tagName) || isContentEditable;
        if (isinput) return;
        h.forEach(shortcuts, function (i, shortcut) {
            if (e.which == shortcut.code) {
                if (shortcut.element.href != null && shortcut.element.href != "")
                    location.href = shortcut.element.href;
                h.triggerEvent(shortcut.element, "click");
            }
                
        });
    };
}


bsml.setToggleContainer = function() {
    var selector  = "[data-toggle-target]";
    var btns = document.querySelectorAll(selector);

    h.forEach(btns, function(i, btn){

        var container_selector = btn.getAttribute("data-toggle-target");
        var container = document.querySelector(container_selector)
        var container_id = container.getAttribute("id");
                
        var cookie_action = h.getCookie(container_id);
        
        if(cookie_action!=null && cookie_action!="") {
            
            var container_selector = "#" + container_id;

            bsml.toggleContainerShowOrHide(container, container_selector, container_id, cookie_action, false);

        }
    }); 
}

bsml.toogleContainer = function(e, el) {
    
    var btn = el.tagName.toLowerCase()=="button" ? el : el.closest("button");
    
    if(btn==null) return;

    var container_selector = btn.getAttribute("data-toggle-target");
   
    var btn_action =  btn.getAttribute("data-toggle-action");
   
    if(container_selector==null || container_selector=="" || btn_action==null || btn_action=="") return;
    
    var container = document.querySelector(container_selector);
    
    if(container==null) return;

    var container_id = container.getAttribute("id");
    
    bsml.toggleContainerShowOrHide(container, container_selector, container_id, btn_action, true);
    
}

bsml.toggleContainerShowOrHide = function(container, container_selector, container_id, action, setcookie) {

    var cookie_expire_date = new Date();
    cookie_expire_date.setFullYear(cookie_expire_date.getFullYear() + 1);
    var cookie_options = { path: '/', expires: cookie_expire_date };
    var btn_show = document.querySelector("[data-toggle-target='" + container_selector + "'][data-toggle-action='show'");
    var btn_hide = document.querySelector("[data-toggle-target='" + container_selector + "'][data-toggle-action='hide'");

    if(action==="show") {

        h.addClass(container, "expand-xl");
        if(btn_show) h.removeClass(btn_show, "d-xl-inline-block");
        if(btn_hide) h.addClass(btn_hide, "d-xl-inline-block");
        if(setcookie) h.setCookie(container_id, action, cookie_options);
        
        return;
    }

    if(action==="hide") {
        h.removeClass(container, "expand-xl");
        if(btn_show) h.addClass(btn_show, "d-xl-inline-block");
        if(btn_hide) h.removeClass(btn_hide, "d-xl-inline-block");
        if(setcookie) h.setCookie(container_id, action, cookie_options);
        return;
    }      

}

bsml.setDatePicker = function(container){
    if(container==null) container = document;
    h.forEach(container.querySelectorAll(".date-picker"), function(i, item) {
        var existsmaskplugin = (typeof Inputmask  != "undefined");
        item.placeholder = "__/__/____";
        flatpickr(item, { allowInput:existsmaskplugin, dateFormat: tsml.getTranslation("date_picker_format"), locale:tsml.getTranslation("date_picker_locale")});
        item.setAttribute("autocomplete", "off");
        item.setAttribute("data-inputmask", "'mask':'99/99/9999'");
        if(existsmaskplugin){
            Inputmask().mask(item);
        }
    });
}


bsml.showPreloader = function() {
    
    if(bsml.global.use_preloader) {
        h.removeClass(bsml.global.preloader, "preloader-hide");
        h.addClass(bsml.global.preloader.querySelector(".spinner"), "text-warning");

        h.addEventListener(bsml.global.preloader, "click", bsml.hidePreloader);
        
    }
}

bsml.hidePreloader = function() {
    
    if(bsml.global.use_preloader) {
        h.addClass(bsml.global.preloader, "preloader-hide");
    }
}

bsml.toast = function(msg, css) {

    let notifications = document.querySelectorAll(".alert-notification-show");
    
    let zindex = notifications.length > 0 
                        ? Math.max.apply(Math, Array.from(notifications).map(function(o) { return o.style.zIndex; })) + 1
                        : 102;
                        
    if(css==null) css = "alert-notification";
    var html = `<div class="alert-notification-show" ${(zindex!==null? `style="z-index:${zindex}"`: ``)}><div class="alert ${css}"><button type="button" class="close" data-dismiss="alert" aria-label="Close">×</button><div class="alert-notification-header d-flex"><i class="ico-info me-2"></i><h5 class="font-weight-bold">Notificação</h5> </div><div class="alert-notification-body"><p>${msg}</p></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    bsml.convertIcons(document.body.firstChild);
}


bsml.showNotification = function (el, msg) {
    if(el === null) return false;
    if(typeof el != 'object') el = document.querySelector(el);
    
    h.removeClass(el, "alert-notification-show");

    var newone = el.cloneNode(true);
    el.parentNode.replaceChild(newone, el);

    if (msg != null)
        newone.innerHTML = msg;

    h.removeClass(newone, "d-none");
    h.addClass(newone, "alert-notification-show");
}



bsml.notificate = function (e, el) {
    
    if(el === null) return false;

    var target = el.getAttribute("data-target");
    var el_target = document.querySelector(target);

    if (el_target) {
        h.removeClass(el_target, "alert-notification-show");
        var newone = el_target.cloneNode(true);
        el_target.parentNode.replaceChild(newone, el_target);
    
        h.removeClass(newone, "d-none");
        h.addClass(newone, "alert-notification-show");
    }
}

bsml.feedback = function (text) {
    let alertContainer = document.getElementById("alert-container");
    if (!alertContainer) {
      alertContainer = htmlToElement(
        `<div id="alert-container" class="alert-container"></div>`
      );
      document.body.insertAdjacentElement("beforeend", alertContainer);
    }
  
    const alert = htmlToElement(
      `<div class="alert alert-feedback alert-dismissible fade show" role="alert">
        <span>${text}</span>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`
    );
    alertContainer.insertAdjacentElement("beforeend", alert);
  
    setTimeout(() => alert.classList.remove("show"), 4000);
  
    alert.addEventListener("transitionend", (event) => {
      if (!event.target.classList.contains("show")) alert.remove();
    });
  
    const closeButton = alert.querySelector('[data-dismiss="alert"]');
    closeButton.addEventListener("click", function () {
      const alertInstance = new bootstrap.Alert(alert);
      alertInstance.close();
    });
  };
  

function htmlToElement(html) {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

bsml.addExtraComponents = function () {
  let html = "";

  if (bsml.global.alert_system) {
    html =
      "" +
      '<div class="hide small alert alert-danger alert-js"><button type="button" class="close" data-dismiss="alert" aria-label="Close">×</button><span data-locale-html="alert_client_error"></span></div>' +
      '<div class="hide small alert alert-blocked alert-minimal-support"><button type="button" class="close" data-dismiss="alert" aria-label="Close">×</button><span data-locale-html="alert_minimal_support"></span></div>' +
      '<div class="hide small alert alert-blocked alert-offline text-center"><span data-locale-html="alert_offline"></span></div>';

    bsml.global.alert_system.insertAdjacentHTML("beforeend", html);

    var alerts_addons = document.querySelectorAll(".alert-system-addon div");
    if (alerts_addons.length > 0) {
      h.forEach(alerts_addons, function (i, item) {
        var btn_addon = item.querySelectorAll("button");
        if (btn_addon.length == 0) {
          var tmp = document.createElement("div");
          tmp.innerHTML =
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">×</button>';
          item.appendChild(tmp.firstChild);
        }
        bsml.global.alert_system.appendChild(item);
      });
    }
  }

  if (bsml.global.use_preloader && !bsml.global.preloader) {
    html =
      "" + '<div class="preloader">' + '<div class="spinner"></div>' + "</div>";

    bsml.global.body.insertAdjacentHTML("afterbegin", html);
    bsml.global.preloader = document.querySelector(".preloader");
  }

  html =
    "" +
    '<div class="app-overlay">' +
    '<div class="loading">' +
    '<div class="spinner text-white"></div>' +
    "</div>" +
    "</div>";

  bsml.global.body.insertAdjacentHTML("afterbegin", html);
};

bsml.controOfflineStatus = function () {
    if (!h.hasClass(bsml.global.body, "enable-offline")) {
        h.addEventListener(window, "online", bsml.checkOnlineStatus);
        h.addEventListener(window, "offline", bsml.checkOnlineStatus);
    }
}

bsml.toogleMenuLinkActive = function (e, el) {
    var active = document.querySelector(".menu .nav-link.active");
    if (active) {
        h.removeClass(active, "active");
    }
    h.addClass(el, "active");
}

bsml.resizeIframes = function () {

    var iframes = document.querySelectorAll(".embed-iframe");
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        y = w.innerHeight || e.clientHeight || g.clientHeight;

    var ph = document.querySelector(".page-header"),
        pt = document.querySelector(".page-title"),
        phy = (ph && ph.clientHeight) || 0,
        pty = (pt && pt.clientHeight) || 0;

    h.forEach(iframes, function (i, iframe) {

        iframe.height = y - phy - pty;

        h.addClass(bsml.global.body, "no-scroll");

    });
}

//hide alert's on click 
bsml.dismissAlert = function (e, ev) {
    var box = ev.parentNode;
    if (h.hasClass(box, "alert")) {
        var text = box.innerText;
        var boxuid = h.hashCode(text)
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var options = { path: '/', expires: tomorrow };
        h.setCookie("dismiss_" + boxuid, true, options)
        var container = box.parentNode;
        container.removeChild(box);
    }
}

bsml.setExpanded = function (selector) {

    if (h.getCookie("template-expand") == "1") {
        h.addClass(bsml.global.body, "template-expand");
        //chk.setAttribute("checked", "checked");
    } else {
        h.removeClass(bsml.global.body, "template-expand");
        //chk.removeAttribute("checked");
    }
}

//expand template
bsml.toggleExpand = function (e, el) {

    //set expire date to cookie
    var expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 1);

    //Set path to cookie to be accessed from all pages
    var options = { path: '/', expires: expireDate };

    h.toggleClass(bsml.global.body, "template-expand") == "template-expand" ?
        h.setCookie("template-expand", "1", options) :
        h.removeCookie("template-expand", options);
}



var bsml_modal_LastModalObject = null;
//abre um modal com iframe para uma url
//size = 1,2,3,4,5 default 4, full screen
bsml.modalOpen = function (url, size, usetopframe, isOtherDomain) {

    var el = null;
    if (size == null) size = 4;
    if (usetopframe==null) usetopframe = false;

    if (typeof url === 'object') {
        el = url;
        if (el.getAttribute("data-href") && el.getAttribute("data-href") != "") {
            url = el.getAttribute("data-href");
        } else {
            url = el.getAttribute("href");
        }
    }
            
    var e = '';
    if (e) {
        e = event;
    } else {
        e = window.event;
    }

    var w = window.self;

    var getDomain = function (uri) {

        return (uri.replace('http://', '').replace('https://', '').split(/[/?#]/)[0]);
    }

    var isRelative = function (uri) {
        return uri.toLowerCase().indexOf("http") < 0;
    }

    var getTopFrame = function (init) {
        if (init == null) init = self;
        var found = false;
        var frame = init;
        if (frame != null && frame != top) {
            try {

                while (!found) {
                    if (frame != top
                        && frame.parent != null
                        && frame.parent.document != null
                        && frame.location != frame.parent.location) {
                        frame = frame.parent;
                    } else {
                        found = true;
                    }
                }
            } catch (e) { found = true; }
        }
        return frame;
    }

    var w = usetopframe ? getTopFrame() : self;

    if (e != null && (e.ctrlKey || e.metaKey)) {

        window.open(url);

    } else {

        var modal = null;
        var modalframe = null;

        if (el != null && el.getAttribute("data-modal-id") && el.getAttribute("data-modal-id") != "") {

            modal = document.getElementById(el.getAttribute("data-modal-id"));

        } else {

            modal = w.document.getElementById("dynmodal");

            if (modal == null) {
                var html = bsml.buildModal("dynmodal", url);
                w.document.body.insertAdjacentHTML('afterbegin', html);
                modal = w.document.getElementById("dynmodal");

            } else {

                modalframe = modal.querySelector("iframe");

                //if (modalframe.src.indexOf(url) < 0) {
                    h.removeClass(modalframe, "modal-iframe-show");
                    h.removeClass(modal.querySelector(".rainbow-progress-bar"), "hide");
                    modalframe.src = url;
                //}
            }
        }

        var modal_dialog = modal.querySelector(".modal-dialog");
        h.removeClass(modal_dialog, "modal-with-iframe-1");
        h.removeClass(modal_dialog, "modal-with-iframe-2");
        h.removeClass(modal_dialog, "modal-with-iframe-3");
        h.removeClass(modal_dialog, "modal-with-iframe-4");
        h.removeClass(modal_dialog, "modal-with-iframe-5");
        h.removeClass(modal, "left");
        h.addClass(modal_dialog, "modal-with-iframe-" + size);

        if (size == 4 || size == 5) {

            h.addClass(modal, "left");
            if (isRelative(url) ||
                getDomain(url) == getDomain(document.location.href)) {

                modal.setAttribute("data-original-url", document.location.href);
                history.replaceState(null, null, url);
            }
        }

        var modal_instance = new w.BSN.Modal(modal);

        modal_instance.show();

        bsml_modal_LastModalObject = modal_instance;
            
        modal.addEventListener('hidden.bs.modal', function (event) {
            if (modal.getAttribute("data-original-url") != null) {
                history.replaceState(null, null, modal.getAttribute("data-original-url"));
            }
        }, false);
    }

    if(isOtherDomain){
        window.addEventListener("message", function (eventTarget) {
            var close_modal = window.document.querySelector('.modal-close');              

            if (eventTarget.data === "hide-modal-close") {
                close_modal.style.display = "none";
            } else if (eventTarget.data === "show-modal-close") {
                close_modal.style.display = "block";
            }     
        });
    }

    return false;
}

var bsml_preloadContent_LastModalId = null;

bsml.preloadContent = function () {

    h.delegateEvent(document.body, "mouseover", ".prefetch", function(e, el) {

        el = el.closest(".prefetch");

        if (el && el.getAttribute("data-href") && (el.getAttribute("data-modal-id") == null || el.getAttribute("data-modal-id")=="")) {

            if (bsml_preloadContent_LastModalId != null) {
                var lastEl = document.querySelector("[data-modal-id='" + bsml_preloadContent_LastModalId + "']");
                if (lastEl != null) {
                    lastEl.setAttribute("data-modal-id", "");
                }
                var lastModal = document.getElementById(bsml_preloadContent_LastModalId);
                if (lastModal != null) {
                    document.body.removeChild(lastModal);
                }
            }

            var url = el.getAttribute("data-href");
            var modalid = 'dynmodal_' + Math.floor(Math.random() * 10000);
            var html = bsml.buildModal(modalid, url);
            el.setAttribute("data-modal-id", modalid);
            document.body.insertAdjacentHTML('afterbegin', html);

            bsml_preloadContent_LastModalId = modalid;

        }
    });
}

bsml.closeModal = function() {
    if(bsml_modal_LastModalObject!==null)
        bsml_modal_LastModalObject.hide();
}

bsml.buildModal = function (modalid, url) {

    var html =
        '<div id="' + modalid + '" class="modal fade" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" >' +
        '   <div class="modal-dialog modal-dialog-centered modal-with-iframe" >' +
        '       <div class="modal-content" >' +
        '           <div class="rainbow-progress-bar"></div>' +
        '           <div class="modal-close"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>' +
        '           <iframe class="modal-iframe" onload="bsml.showModalFrame(this)"  src="' + url + '" width="100%" height="100%" frameborder="0"></iframe>';
        '       </div>' +
        '   </div>' +
        '</div>';

    return html;
}

bsml.showModalFrame = function (frame) {
    h.addClass(frame, "modal-iframe-show");
    h.addClass(document.querySelector(".rainbow-progress-bar"), "hide");
}

//toggle UI boxes
bsml.toggleBox = function (e, el) {
    var box = el.parentNode;
    var boxid = box.getAttribute("id") || "box-filter-" + box.offsetTop;

    //set expire date to cookie
    var expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + 1);

    //Set path to cookie to be accessed from all pages
    var options = { path: '/', expires: expireDate };

    h.toggleClass(box, "box-closed") == "box-closed" 
        ? h.setCookie(boxid, "closed", options)
        : h.setCookie(boxid, "open", options) ;
}

//toggle UI boxes based on cookies
bsml.setOpenCloseBoxes = function () {

    h.forEach(document.querySelectorAll(".box-open-and-close"), function (i, box) {

        var boxid = box.getAttribute("id") || "box-filter-" + box.offsetTop;

        if (h.getCookie(boxid) == "open") {
            h.removeClass(box, "box-closed");
        } else {
            h.addClass(box, "box-closed");
        }

    });
}

bsml.setAutosuggest = function(e, el) {
    /*
    <input type="text" 
        id="toautosuggest" 
        data-autosuggest-minlength="3" 
        data-autosuggest-maxitens="3" 
        data-autosuggest-url="/src/usernames.json?inpSearch={this}"
        data-autosuggest-result-split="___"
        data-autosuggest-id-target-selector="#idauto"
        data-autosuggest-text="title"
        data-autosuggest-id="id"
        data-autosuggest-compare="title"
        data-autosuggest-action="alert(1)"
        >
    */

    //for each auto-suggest input in page
    h.forEach(document.querySelectorAll("[data-autosuggest-url]"), function (i, input) {

        input.setAttribute("autocomplete", "off");
        var data_max_itens = input.getAttribute("data-autosuggest-maxitens") || 5;
        var data_min_length = input.getAttribute("data-autosuggest-minlength") || 2;
        var data_url = input.getAttribute("data-autosuggest-url") ;
        var data_delay_milliseconds = parseInt(input.getAttribute("data-autosuggest-delaymilliseconds")) || 250 ;
        var spinner;

        //add a wrapp to style the suggestion box
        if(input.parentNode.className.indexOf("dropdown")<0) {
            let wrapper = document.createElement("div");
            wrapper.className = "dropdown";
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            spinner = document.createElement("div");
            spinner.className = "spinner spinner-sm spinner-input d-none";
            wrapper.appendChild(spinner);
        }
        
        //check if the user changed the text after it was selected
        input.addEventListener("blur", function(e) {
            
            //check if any option was selected from de autosuggest box
            let selected = this.getAttribute("data-autosuggest-selected")==null?  this.getAttribute("data-autosuggest-selected") : false;
            //no option selected
            if(!selected) {
                //empty the input field
                this.value = "";
                //check if has any input id field associated with
                let data_id_target = this.getAttribute("data-autosuggest-id-target-selector");
                if(data_id_target && document.querySelector(data_id_target)) {
                    //empty that field also
                    let data_obj_target = document.querySelector(data_id_target);
                    data_obj_target.value = "";
                    //h.triggerEvent(data_obj_target, "change");
                    //h.triggerCustomEvent(data_obj_target, "custom-change");
                    bsml.hide(spinner);
                }
            }
        });

        input.addEventListener("keyup", bsml.delay(function() {

            var data_url = input.getAttribute("data-autosuggest-url").replace("{this}", input.value);
            var data_length = input.value.length;
            var container = input.parentNode.querySelector(".dropdown-menu-autosuggest");

            //set the autosuggest input as it has not been selected any option from suggest box
            input.setAttribute("data-autosuggest-selected", false);

            if(data_url!=null) {
                
                //hide the box
                h.removeClass(container, "show");
                
                //if the input field has the minium lenth to start searching
                if(data_min_length <= data_length) {

                    bsml.show(spinner);

                    //ajax request to the data source
                    h.getJSON(data_url, 

                        function(success) {
                            
                            container = bsml.createOrCleanContainer(input, container);
                
                            var total_itens = 0;

                            //the json field used to compare the input field value
                            var data_compare = input.getAttribute("data-autosuggest-compare");

                            if(success.success) {
                                success = success.success;
                            }
                            
                            //for each result from the ajax request
                            h.forEach(success, function(i, result) {

                                //get the json field value used in the comparisson from the ajax json record 
                                var data_to_compare;
                                if(data_compare) {
                                    data_to_compare = eval("result." + data_compare);
                                }else {
                                    data_to_compare = result;
                                }

                                //compare the input field value with the comparisson json property value
                                if(data_to_compare.toLowerCase().indexOf(input.value.toLowerCase())>=0) {
                                    
                                    total_itens = total_itens + 1;
                                    
                                    if(total_itens <= data_max_itens) {


                                        //get the json property name used the fill the input field
                                        var data_text = input.getAttribute("data-autosuggest-text");
                                        var data_result_split =  input.getAttribute("data-autosuggest-result-split");
                                        
                                        //get the json property value used to fill the input field
                                        var tmp_data_text_value = data_text ? eval("result." + data_text) : result;

                                        var data_text_value = data_result_split? tmp_data_text_value.split(data_result_split)[0] : tmp_data_text_value;

                                        //get the json property name used the fill the associated ID input field
                                        var data_id = input.getAttribute("data-autosuggest-id");

                                        //get the json property value used the fill the associated ID input field
                                        var data_id_value = data_id ? eval("result." + data_id) : 
                                                            (data_result_split ? tmp_data_text_value.split(data_result_split)[1] : "");
                                        
                                        //remove html tags
                                        data_text_value = data_text_value.replace(input.value, "<u>" + input.value + "</u>");

                                        //create the HTML option in the suggestion box
                                        var container_item = document.createElement("a");
                                        container_item.className ="dropdown-item text-truncate";
                                        container_item.innerHTML = data_text_value;
                                        container_item.setAttribute("href", "javascript:void(0)");
                                        container_item.setAttribute("data-id", data_id_value);
                                        
                                        //when the option is selected in the suggestion box
                                        container_item.onclick = function() {

                                            //
                                            input.value = data_text_value.replace(/<(?:.|\n)*?>/gm, '');
                                            input.setAttribute("data-autosuggest-selected", true);
                
                                            //get the ID field target 
                                            var data_id_target = input.getAttribute("data-autosuggest-id-target-selector");
                                            
                                            //get de action 
                                            var data_action = input.getAttribute("data-autosuggest-action");

                                            if(data_id_target && document.querySelector(data_id_target)) {
                                                let data_obj_target = document.querySelector(data_id_target);
                                                data_obj_target.value = data_id_value;
                                                h.triggerEvent(data_obj_target, "change");
                                                h.triggerCustomEvent(data_obj_target, "custom-change");
                                            }

                                            if(data_action) {
                                                eval(data_action);
                                            }
                                            h.removeClass(container, "show");
                                            bsml.hide(spinner);
                                        }
                                        container.appendChild(container_item);
                                    }
                                    h.addClass(container, "show");
                                
                                }
                                bsml.hide(spinner);
                            });

                            if(container.childNodes.length==0) {
                                var container_item = document.createElement("a");
                                container_item.className ="dropdown-item";
                                container_item.innerHTML = "Não foi encontrado";
                                container.appendChild(container_item);
                                h.addClass(container, "show");
                                bsml.hide(spinner);
                            }

                        });
                } else {
                    //clean container if the input field has not the minimum length
                    bsml.createOrCleanContainer(input, container);
                }
            }
        }, data_delay_milliseconds));
    });
}

/*
container: o objeto DOM (por exemplo, um div) onde o spinner sera plotado
show: true ou false
*/
bsml.toggleSpinner = function (container, show) {

    if (container != null) {

        var spinner = container.querySelector(".spinner");
        if (spinner == null) {

            spinner = document.createElement("div");
            spinner.className = "spinner";
            container.appendChild(spinner);
        }

        if (show) {
            h.removeClass(spinner, "d-none");
        } else {
            h.addClass(spinner, "d-none");
        }
    }
}

bsml.toggleButtonSpinner = function(button, show) {
    if(button==null) return;
    if(typeof button != 'object') button = document.querySelector(button);
    if(button==null) return;
    if(show==null) show = !h.hasClass(button, "btn-spinner-active");

    if(show) {
        h.addClass(button, "btn-spinner-active");
        return;            
    }

    if(!show) {
        h.removeClass(button, "btn-spinner-active");
        return;            
    }


}


//check if online
bsml.checkOnlineStatus = function () {

    navigator.onLine && h.hasClass(bsml.global.body, 'offline') ? h.removeClass(bsml.global.body, "offline") : "";
    !navigator.onLine && !h.hasClass(bsml.global.body, 'offline') ? h.addClass(bsml.global.body, "offline") : "";
}

//open overlay
bsml.openOverlay = function () {
    //if(h.isInIframe() && parent!=null && parent.bsml!=null && parent.bsml.openOverlay!=null) {
      //  parent.bsml.openOverlay();
    //}
    //else {
        h.addClass(bsml.global.body, "show-overlay");
    //}
}

//close overlay
bsml.closeOverlay = function () {
    
        h.removeClass(bsml.global.body, "show-overlay");
        h.removeClass(bsml.global.body, "menu-mobile-opened");
    
}

//toggle menu
bsml.toggleMenu = function () {
    h.toggleClass(bsml.global.body, "menu-mobile-opened");
    bsml.properties.closeOverlayOnClick = h.hasClass(bsml.global.body, "menu-mobile-opened");
}
//toggle search box (mobile)
bsml.toggleSearch = function () {
    h.toggleClass(bsml.global.body, "template-search-opened");
    document.querySelector("[type='search']").focus();
}


//show button gototop
bsml.showGoToTop = function () {
    var el = document.querySelector(".goto-top");
    if (!el) return;

    h.addEventListener(window, "scroll", function () {
        var wScrollCurrent = window.pageYOffset;
        if (wScrollCurrent > 0) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

//apply style with querystring
bsml.applyStyleBasedOnQueryString = function (el, condition, css) {
    try{
        if (
            (window.sessionStorage
            && window.sessionStorage.getItem(css)!=null
            && window.sessionStorage.getItem(css)!="")
            || location.search.indexOf(condition) > 0) {
            
            h.addClass(el, css);

            window.sessionStorage.setItem(css, 1);
        }
    }catch (e) {}
}

//show or hide element depending on scroll position
bsml.setHideObjectOnScroll = function (el, csshide) {
    if (!h.isIE) {

        if (!el) return true;

        var elHeight = 0,
            elTop = 0,
            dHeight = 0,
            wHeight = 0,
            wScrollCurrent = 0,
            wScrollBefore = 0,
            wScrollDiff = 0;

        h.addEventListener(window, "scroll", function () {
            elHeight = el.offsetHeight;
            dHeight = document.body.offsetHeight;
            wHeight = window.innerHeight;
            wScrollCurrent = window.pageYOffset;
            wScrollDiff = wScrollBefore - wScrollCurrent;
            elTop = parseInt(window.getComputedStyle(el).getPropertyValue('top')) + wScrollDiff;

            if (wScrollCurrent <= 0) // scrolled to the very top; el sticks to the top
                h.removeClass(el, csshide);

            else if (wScrollDiff > 0) // scrolled up; el slides in
                h.removeClass(el, csshide);

            else if (wScrollDiff < 0) // scrolled down
            {
                if (wScrollCurrent + wHeight >= dHeight - elHeight)  // scrolled to the very bottom; el slides in
                    h.removeClass(el, csshide);
                else // scrolled down; el slides out
                    h.addClass(el, csshide);
            }

            wScrollBefore = wScrollCurrent;
        });
    }
}

bsml.getBootstrapPath = function() {
    if (!bsml.bootstrapPath) {
        bsml.bootstrapPath = h.getJsFilePath("orquestra-bootstrap.")!=""? h.getJsFilePath("orquestra-bootstrap.") : h.getJsFilePath("util.");
        bsml.bootstrapPath = bsml.bootstrapPath.replace("assets/", "").replace("js/", "");
    }
    return bsml.bootstrapPath;
}


bsml.convertIcons = function (el) {
    
    if (!el) el = document;

    const iconsArray = el.querySelectorAll("[class*=ico-]");

    h.forEach(iconsArray, function(i, icon) {        
        
        const iconClassName = icon.getAttribute("class");

        h.forEach(iconClassName.match(/ico-[a-zA-Z-]*/gi), function(j, iconStyle) {

            if(iconStyle!="ico-lg" 
                && iconStyle!="ico-md"
                && iconStyle!="ico-sm"
                && iconStyle!="ico-xl" 
                && iconStyle!="ico-90p"  
                && iconStyle!="ico-inverse" ) {

                iconStyle = iconStyle.replace("ico-", "").replace("-inverse", "");

                var tmp = document.createElement("div");
                tmp.innerHTML = `<svg class="${iconClassName}" focusable="true"><use xlink:href="#${iconStyle}" /></svg>`;
                icon.replaceWith(tmp.firstChild);

            }
        });
    });
}

//includes delay to search only when user stops typing
bsml.delay = function (callback, ms) {
    var timer = 0;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
}

//check if has an autosuggest box already created and associated with the input field. if not create it    
bsml.createOrCleanContainer = function(input, container){    
    if(container==null) {
        container = document.createElement("div");
        container.className = "dropdown-menu dropdown-menu-autosuggest";    
        container.style.maxWidth = window.innerWidth*0.8 + "px";

        input.parentNode.appendChild(container);
    }else {
        //if the box already exists, empty it
        while(container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    return container;
}


bsml.alert = function(msg, okcallback) {

    bsml.hidePreloader();

    msg = msg.replace(/\n/g, '<br>');
    var intance_id = "modal_alert_" + (Math.floor((Math.random() * 10000) + 1));
    bsml.global.body.insertAdjacentHTML('afterbegin', '<div id="' + intance_id + '" class="fade modal modal-static" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content rounded-4 shadow"></div></div></div>');

    var instance = new BSN.Modal(document.querySelector("#" + intance_id),
        {
          content: '<div class="modal-body p-4 text-center"><h3 class="mb-0">' + tsml.getTranslation("attention") + '</h3><p class="mt-3 mb-0 text-break">' + msg +  '</p></div><div class="modal-footer flex-nowrap p-0" style="height: 50px;"><button type="button" class="btn btn-link fs-6 col-12 text-decoration-none m-0 rounded-0 confirm-btn-bsml-alert text-primary">OK</button></div>', 
        });
    instance.show();
    var ok = document.querySelector("#" + intance_id + " .btn");
    ok.focus();
    h.addEventListener(ok, "click", function(){
        instance.hide();
        if (okcallback != null && okcallback != undefined) okcallback();
    });
}

bsml.confirm = function(msg, okcallback, nocallback) {

    bsml.hidePreloader();

    if(msg==null) 
        msg  = tsml.getTranslation("confirm_default");

    msg = msg.replace(/\n/g, '<br>');
    var intance_id = "modal_alert_" + (Math.floor((Math.random() * 10000) + 1));
    bsml.global.body.insertAdjacentHTML('afterbegin', '<div id="' + intance_id + '" class="fade modal modal-static" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content rounded-4 shadow"></div></div></div>');
    var modal = document.querySelector("#" + intance_id);
    var instance = new BSN.Modal(modal,
        {
          content: '<div class="modal-body p-4 text-center"><h3 class="mb-0"><span data-locale-html="confirm"></span></h3><p class="mt-3 mb-0 text-break">' + msg +  '</p></div><div class="modal-footer flex-nowrap p-0" style="height: 50px;"><button type="button" id="noconfirm" class="btn text-muted btn-link fs-6 text-decoration-none col-6 m-0 rounded-0 noconfirm-btn-bsml-confirm border-right;" data-locale-html="cancel"></button> <button id="confirm" type="button" class="btn btn-link fs-6 text-decoration-none col-6 m-0 rounded-0 confirm-btn-bsml-confirm text-primary"><strong>Ok</strong></button></div>', 
        });
        tsml.translate(modal);        
    instance.show();
    
    var ok = document.getElementById("confirm");
    var nok = document.getElementById("noconfirm");
    ok.focus();
    h.addEventListener(ok, "click", function(){
        instance.hide();
        if (okcallback != null && okcallback != undefined) okcallback();
    });
    h.addEventListener(nok, "click", function(){
        if (nocallback != null && nocallback != undefined) nocallback();
        instance.hide();
    });
}


bsml.listIconsSprite = function(callback) {

    var sprite_path = bsml.getBootstrapPath() + "assets/icon/sprite/sprite.svg";

    h.get(
        sprite_path,
        function(data) {

            /*h.forEach(data, function(i, item) {

                document.write(item)

            });*/
            alert(data)
            //document.write(data)

        }
    )
}


bsml.loadSprite = function (body, id) {
	if(id===null) id = "sprite-id";
    const url = `${bsml.getBootstrapPath()}assets/icon/sprite/sprite.svg`;
	const prefix = "cache-v2-";
	const hasId = typeof id === "string";
	let isCached = false;

	// Check for *actual* storage support
	const cacheSupported = (function () {
		if (!hasId) {
			return false;
		}
		const test = '___test';
		try {
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch (e) {
			return false;
		}
	})();

	const updateSprite = function(container, data) {
		// Inject content
		container.innerHTML = data;

		// Inject the SVG to the body
		body.insertBefore(container, body.childNodes[0]);
	}

	// Only load once
	if (!hasId || document.querySelectorAll("#" + id).length === 0) {
		// Create container
		const container = document.createElement("div");
		container.setAttribute("hidden", "");

		if (hasId) {
			container.setAttribute("id", id);
		}

		// Check in cache
		if (cacheSupported) {
			const cached = localStorage.getItem(prefix + id);
			isCached = cached !== null;

			if (isCached) {
				const data = JSON.parse(cached);
				updateSprite(container, data.content);
				return true;
			}
		}
		
		const xhr = new XMLHttpRequest();

		// XHR for Chrome/Firefox/Opera/Safari
		if ("withCredentials" in xhr) {
			 xhr.open("GET", url, true);
		}
		// Not supported
		else {
			return;
		}

		// Once loaded, inject to container and body
		xhr.onload = function () {
			if (cacheSupported) {
				localStorage.setItem(prefix + id, JSON.stringify({
					content: xhr.responseText
				}));
			}

			updateSprite(container, xhr.responseText);
		};

		xhr.send();
	}
}

//hide an element
bsml.hide = function(el) {
    h.addClass(el, "d-none");
}

//show an element
bsml.show = function(el) {
    h.removeClass(el, "d-none");
    h.removeClass(el, "invisible");
}

//document ready
h.ready(function () {
    if (h.isIE) document.documentElement.className += " minimal-support";
    document.documentElement.className = document.documentElement.className.replace("no-js", "js");

    //polyfill for IE (all)
    if (h.isIE) {
        h.addScript(bsml.getBootstrapPath() + "vendor/bootstrap-native/polyfill.min.js");
        h.addScript(bsml.getBootstrapPath() + "vendor/svgxuse/svgxuse.min.js");
    }
    bsml.init();
});






  