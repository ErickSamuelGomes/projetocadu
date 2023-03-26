
bsml.Autosuggest2 = (function () {

    var options = {};
    var delayObject = 0;

    //for each auto-suggest input in page
    const mapAllInputs = function () {

        //for each auto-suggest input in page
        h.forEach(document.querySelectorAll("[data-autosuggest]"), function (i, input) {

            startUpInput(input);
        });
    }

    //startup specific input
    const startUpInput = function (input) {

        input.setAttribute("autocomplete", "off");

        input.setAttribute("maxlength", 50);

        loadOptions(input);

        //add a wrapp around the input to style the suggestion box
        inputWrapperAdd(input);

        //check for user keyboard input
        h.addEventListener(input, "keypress", inputOnKeyPressSearch);

        //check for user keyboard input
        h.addEventListener(input, "keyup", inputOnKeyUpSearch);

        //check if the user changed the text after it was selected
        h.addEventListener(input, "blur", inputOnBlur);
    }

    //load default configurations from input
    const loadOptions = function (input) {

        options.input_last_value = "";
    }

    //trigger on input blur
    const inputOnBlur = function (e) {
        const input = e.target;
        //check if any option was selected from de autosuggest box
        const selected = input.getAttribute("data-autosuggest-selected") != null ? input.getAttribute("data-autosuggest-selected") : "false";
       
        //no option selected
        if (selected === "false") {
            options.input_last_value = input.value;
            //empty the input field
            input.value = "";
            //check if has any input id field associated with
            const data_id_target = input.getAttribute("data-autosuggest-target-selector");
            if (data_id_target && document.querySelector(data_id_target)) {
                //empty that field also
                const data_obj_target = document.querySelector(data_id_target);
                data_obj_target.value = "";
            }
        }
    }

    const inputOnKeyPressSearch = function (e) {
        if(e.keyCode===13)  {
            e.preventDefault();
            return false;
        }
    }

    //trigger on input keyup
    const inputOnKeyUpSearch = function (e) {
        var input = e.target;

        const options_delay_milliseconds = parseInt(input.getAttribute("data-autosuggest-delaymilliseconds")) || 250;

        //if the input hast changed its value
        if (options.input_last_value === input.value) return;

        //sabe a copy of input value
        options.input_last_value = input.value;

        clearTimeout(delayObject);

        delayObject = setTimeout(function () {

            const configs = isJson(input.getAttribute("data-autosuggest"));

            h.forEach(configs, function (i, group_config) {

                searchGroup(input, group_config);

            });

        }, options_delay_milliseconds);

    }

    //search an specific configuration url group
    const searchGroup = function (input, group_config) {

        if (h.isNullOrEmpty(input)) return;
        if (h.isNullOrEmpty(group_config)) return;

        const data_url = h.toEmptyIfNull(group_config.url).replace("$this", encodeURI(input.value));
        const data_group = h.toEmptyIfNull(group_config.title);
        const data_icon = h.toEmptyIfNull(group_config.icon);
        const data_more = h.toEmptyIfNull(group_config.more);
        const data_compare = h.toEmptyIfNull(group_config.compare);
        const data_length = h.toEmptyIfNull(input.value.length);

        const data_text = h.toEmptyIfNull(group_config.text); //get the json property name used the fill the input field
        const data_split = h.toEmptyIfNull(group_config.split);
        const data_id = h.toEmptyIfNull(group_config.id);//get the json property name used the fill the associated ID input field
        const data_action = h.toEmptyIfNull(group_config.action)//get de action 
        const data_id_target = input.getAttribute("data-autosuggest-target-selector");//get the ID field target 

        const options_max_itens = input.getAttribute("data-autosuggest-maxitens") || 5;
        const options_minlength = input.getAttribute("data-autosuggest-minlength") || 3;
        const options_minwidth = input.getAttribute("data-autosuggest-minwidth") || "";
        const options_fillwithresult = h.isTrue(input.getAttribute("data-autosuggest-fillwithresult"), true);
        const options_clientfilter = h.isTrue(input.getAttribute("data-autosuggest-clientfilter"), true);

        //if the input field has the minium lenth to start searching
        if (options_minlength > data_length) return;


        //set the autosuggest input as it has not been selected any option from suggest box
        input.setAttribute("data-autosuggest-selected", false);
        var container = containerAddOrGet(input, options_minwidth);
        var container_group = containerGroupAddOrGet(input, container, data_group, data_more);

        //show the container
        h.addClass(container, "show");

        //if clicks in the body close de container
        bodyClickToCloseContainer(container);

        //show de spinner
        containerGroupSpinnerShow(container_group);

        //ajax request to the data source
        h.getJSON(data_url,

            function (return_data) {

                //clear the containerGroup
                containerGroupClear(container_group);

                var total_itens = 0;

                const success = return_data.success ? return_data.success : return_data;
                
                //for each result from the ajax request
                h.forEach(success, function (i, result) {

                    //get the json field value used in the comparisson from the ajax json record 
                    const data_compare_text = h.isNullOrEmpty(data_compare) ? result : eval("result." + data_compare);
                    
                    //compare the input field value with the comparisson json property value
                    if (!options_clientfilter || data_compare_text.toLowerCase().indexOf(input.value.toLowerCase()) >= 0) {

                        total_itens++;

                        if (total_itens <= options_max_itens) {

                            //get the json property value used to fill the input field
                            const tmp_data_text_value = data_text ? eval("result." + data_text) : result;

                            const data_text_value = data_split ? tmp_data_text_value.split(data_split)[0] : tmp_data_text_value;

                            //get the json property value used the fill the associated ID input field
                            const data_id_value = data_id ? eval("result." + data_id) :
                                (data_split ? tmp_data_text_value.split(data_split)[1] : "");

                            
                            //create the HTML option in the suggestion box
                            containerItemAdd(container, container_group, input, data_id_value, data_text_value, data_icon, data_id_target, data_action, options_fillwithresult);

                        }
                    }

                });

                bsml.convertIcons(container);

                containerGroupAddNotFound(container_group);
                //check if any item was added
                containerGroupSpinnerHide(container_group);


            });

    }

    const bodyClickToCloseContainer = function(container) {

        if(container.getAttribute("data-body-click-close")) return;

        container.setAttribute("data-body-click-close", "true");

        h.addEventListener(document.body, "click", function() {

            h.removeClass(container, "show");

        });

    }

    //add a wrapp around the input to style the suggestion box
    const inputWrapperAdd = function (input) {

        if (h.isNullOrEmpty(input.parentNode)) return;
        if (input.parentNode.className.indexOf("dropdown") >= 0) return;

        const wrapper = document.createElement("div");
        wrapper.className = "dropdown";
        wrapper.setAttribute("role", "search");
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

    }


    //check if the final container is empty
    const containerGroupAddNotFound = function (container_group) {

        if (h.isNullOrEmpty(container_group)) return;

        const items = container_group.querySelectorAll(".dropdown-result");

        if (!h.isNullOrEmpty(items) && items.length > 0) return;

        const container_item = document.createElement("div");
        container_item.className = "dropdown-item dropdown-notfound small";
        container_item.innerHTML = tsml.getTranslation("no_item_found");
        container_group.appendChild(container_item);

    }



    //add an group to the container
    const containerGroupAddOrGet = function (input, container, group_title, data_more) {

        if (h.isNullOrEmpty(container)) return null;

        //search if already exists
        var container_group = container.querySelector(`.dropdown-group[data-id='${group_title}']`);

        //found the container group
        if (!h.isNullOrEmpty(container_group)) return container_group;

        const container_hasgroups = container.querySelectorAll("dropdown-group").length > 0;

        //create the HTML option in the suggestion box
        container_group = document.createElement("div");
        container_group.className = ` dropdown-group clear ${(container_hasgroups ? "mb-3" : "" )}  `;
        container_group.setAttribute("data-id", group_title);
        container.appendChild(container_group);

        containerGroupMore(input, container_group, data_more);

        const container_group_title = document.createElement("h5");
        container_group_title.innerText = group_title;

        container_group_title.className = " small bold text-primary pull-left float-left mt-2 ml-2 ";
        if (h.isNullOrEmpty(group_title))
            container_group_title.className += " d-none ";
        container_group.appendChild(container_group_title);

        const container_group_spinner = document.createElement("div");
        container_group_spinner.className = "spinner spinner-sm pull-left float-left mt-1 ml-2";
        container_group.appendChild(container_group_spinner);


        const container_group_body = document.createElement("div");
        container_group_body.className = " dropdown-body  ";
        container_group.appendChild(container_group_body);


        return container_group;

    }

    //add "more" button within group if exists
    const containerGroupMore = function (input, container_group, data_more) {

        if (h.isNullOrEmpty(container_group)) return;
        if (h.isNullOrEmpty(data_more)) return;

        container_group_more = document.createElement("a");
        container_group_more.className = "dropdown-item-more btn btn-link btn-xs  small d-block pull-right float-right mr-2 ";
        container_group_more.innerHTML = tsml.getTranslation("see_more");

        container_group_more.setAttribute("href", "javascript:void(0)");

        h.addEventListener(container_group_more, "click", function (e, el) {

            location.href = data_more.replace("$this", options.input_last_value);
        });

        container_group.appendChild(container_group_more);

    }

    //remove all dynamic elements from group
    const containerGroupClear = function (container_group) {

        if (h.isNullOrEmpty(container_group)) return;

        var container_body = container_group.querySelector(".dropdown-body");

        if (h.isNullOrEmpty(container_body)) return;

        const items = container_body.querySelectorAll(".dropdown-result");

        h.forEach(items, function (i, item) {

            container_body.removeChild(item);

        });

        const notfound = container_group.querySelectorAll(".dropdown-notfound");

        h.forEach(notfound, function (i, item) {

            container_group.removeChild(item);

        });

    }

    //show group spinner
    const containerGroupSpinnerShow = function (container_group) {

        if (h.isNullOrEmpty(container_group)) return;

        bsml.toggleSpinner(container_group, true);
    }

    //hide group spinner
    const containerGroupSpinnerHide = function (container_group) {

        if (h.isNullOrEmpty(container_group)) return;

        bsml.toggleSpinner(container_group, false);
    }

    //add an item to the container group
    const containerItemAdd = function (container, container_group, input, data_id_value, data_text_value, data_icon, data_id_target, data_action, options_fillwithresult) {


        if (h.isNullOrEmpty(container)) return;
        if (h.isNullOrEmpty(container_group)) return;
        if (h.isNullOrEmpty(input)) return;

        const container_body = container_group.querySelector(".dropdown-body");

        if (h.isNullOrEmpty(container_body)) return;

        //remove html tags
        data_text_value = h.toEmptyIfNull(data_text_value).replace(input.value, "<b>" + input.value + "</b>");

        //create the HTML option in the suggestion box
        const container_item = document.createElement("a");
        container_item.className = ` dropdown-item dropdown-result small   `;
        container_item.style.whiteSpace = "normal";
        container_item.setAttribute("href", "javascript:void(0)");
        container_item.setAttribute("data-id", data_id_value);

        var container_item_content = `<div class="d-flex">`;
        if (!h.isNullOrEmpty(data_icon)) {
            container_item_content += `<div class="mr-2"><i class="ico-${data_icon} ico-sm"></i></div>`;
        }
        container_item_content += `<div>${data_text_value}</div>`;
        container_item_content += `</div>`;

        container_item.insertAdjacentHTML('afterBegin', container_item_content);

        //when the option is selected in the suggestion box
        container_item.onclick = function () {

            containerItemClick(container, input, data_id_value, data_text_value, data_id_target, data_action, options_fillwithresult);
        }

        container_body.appendChild(container_item);

        return container_item;

    }

    //add events on container item click
    const containerItemClick = function (container, input, data_id_value, data_text_value, data_id_target, data_action, options_fillwithresult) {

        if (h.isNullOrEmpty(container)) return;
        if (h.isNullOrEmpty(input)) return;

        if (options_fillwithresult) {
            //clean the field from html tags
            input.value = data_text_value.replace(/<(?:.|\n)*?>/gm, '');
            input.setAttribute("data-autosuggest-selected", true);
        }

        if (!h.isNullOrEmpty(data_id_target) && document.querySelector(data_id_target)) {
            const data_obj_target = document.querySelector(data_id_target);
            data_obj_target.value = data_id_value;
            h.triggerEvent(data_obj_target, "change");
            h.triggerCustomEvent(data_obj_target, "custom-change");
        }

        if (!h.isNullOrEmpty(data_action)) {

            data_action = data_action.replace("$this", (input.value));
            data_action = data_action.replace("$id", data_id_value);
            data_action = data_action.replace("$text", data_text_value);

            eval(data_action);
        }
        h.removeClass(container, "show");

    }


    //check if has an autosuggest box already created and associated with the input field. if not create it    
    const containerAddOrGet = function (input, options_minwidth) {

        var container = input.parentNode.querySelector(".dropdown-menu-autosuggest");

        if (container !== null) return container;

        container = document.createElement("div");
        container.className = "dropdown-menu dropdown-menu-autosuggest";
        container.style.maxWidth = window.innerWidth * 0.8 + "px";

        if (!h.isNullOrEmpty(options_minwidth))
            container.style.minWidth = options_minwidth;

        input.parentNode.appendChild(container);

        return container;

    }

    //check if string is a json
    const isJson = function (text) {

        try {
            const o = JSON.parse(text);

            if (o && typeof o === "object") {
                return o;
            }
        } catch (e) { }

        return false;
    }

    return {

        Init: function (el) {

            if (h.isNullOrEmpty(el))
                mapAllInputs();
            else
                startUpInput(el);
        }
    };

})();

bsml.Autosuggest2.Init();






