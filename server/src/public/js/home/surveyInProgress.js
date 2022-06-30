"use strict"

function showModal(url, width, height) {
    document.querySelector(".background").className = "background show";
    $('#modalIframe').attr('src', url);
    $('#modalIframe').css('width', width);
    $('#modalIframe').css('height', height);
    $('html, body').css({'overflow': 'hidden', 'height': '100%'});
    $('#wrapper').on('scroll touchmove mousewheel', function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    });
}

function changeAddress(url, width, height) {
    $('#modalIframe').attr('src', url);
    $('#modalIframe').css('width', width);
    $('#modalIframe').css('height', height);
}


function closeModal() {
    location.reload();
    // document.querySelector(".background").className = "background";
    // $('html, body').css({'overflow': 'auto', 'height': '100%'});
    // $('#wrapper').off('scroll touchmove mousewheel');
    // $('#modalIframe').attr('src', "");
}