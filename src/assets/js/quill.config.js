
bsml.editor = null;

bsml.editorSetup = function(container, cssList) {
    if(cssList==null) cssList = "";
    h.addClass(container, "quill-container");

    bsml.editor = new Quill(container, {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{'list': 'ordered' }, { 'list': 'bullet' }],
                [{'indent': '-1' }, { 'indent': '+1' }],
                [{'color': [] }, { 'background': [] }],
                [{'align': [] }],
                ['link', 'image', 'video'],
                ['clean'],
            ]
        },
        table:true,
        theme: 'snow'
    });

    bsml.editorSetCss(cssList);

    return bsml.editor;
}

bsml.editorSetCss  = function(cssList) {
    var innereditor = bsml.editor.container.firstChild;
    h.addClass(innereditor, cssList);
}

bsml.editorSetHTML = function(html) {
    bsml.editor.clipboard.dangerouslyPasteHTML(html);
}

bsml.editorGetHTML = function() {
    return bsml.editor.container.firstChild.innerHTML;
}
