h.ready(function() {

    var itens = document.querySelectorAll(".inputmask, [data-inputmask], [data-inputmask-mask], [data-inputmask-alias],[data-inputmask-regex]");
    h.forEach(itens, function(i, item) {

        if (item.inputmask === undefined) {
            Inputmask().mask(item);
        }

    });

});