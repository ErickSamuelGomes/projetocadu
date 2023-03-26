var checksml = {};

checksml.init = function () {
    var visibles = document.querySelectorAll(".btn-visible-field");
    for (const visible of visibles) {
        visible.addEventListener('click', function(e) {
            if(!visible.classList.contains('able-field') &&  !visible.classList.contains('active-field')){
                visible.classList.remove('able-field');
                visible.classList.add('active-field');
            } else if(visible.classList.contains('active-field') ){
                visible.classList.remove('active-field');
                visible.classList.add('able-field');
            } else {
                visible.classList.remove('active-field');
                visible.classList.remove('able-field');                  
            }
        })
    }

    var checks = document.querySelectorAll(".btn-check-field");
    for (const check of checks) {
        check.addEventListener('click', function(e) {
            if(check.classList.contains('active-field') ){
                check.classList.remove('active-field');
                if(check.classList.contains('visible-next') ){
                    check.nextElementSibling.classList.remove('show');
                } 
            } else {
                check.classList.add('active-field');
                if(check.classList.contains('visible-next') ){
                    check.nextElementSibling.classList.add('show');
                } 
            }
            
        })
    }

    var locks = document.querySelectorAll(".btn-padlock-field");
    for (const lock of locks) {
        lock.addEventListener('click', function(e) {
            if(!lock.classList.contains('closed-field') &&  !lock.classList.contains('blocked-field')  &&  !lock.classList.contains('manipulable-field') ){
                lock.classList.remove('closed-field');
                lock.classList.remove('blocked-field');
                lock.classList.add('manipulable-field');
            } else if(lock.classList.contains('manipulable-field') ){
                lock.classList.remove('manipulable-field');
                lock.classList.add('blocked-field');
            } else if(lock.classList.contains('blocked-field') ){
                lock.classList.remove('blocked-field');
                lock.classList.add('closed-field');
            } else {
                lock.classList.remove('blocked-field');
                lock.classList.remove('manipulable-field');
                lock.classList.remove('closed-field');
            }
        })
    }
}