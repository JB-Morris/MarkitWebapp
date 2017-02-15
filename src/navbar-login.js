$(function () {
    var signIn = require('./firebase.js')["signIn"];

    $('#navbar-placeholder').on('click', '#login-button', function () {
        $('#login-popup').fadeIn();
    });

    $(document).mouseup(function (e) {
        var popup = $('#login-popup');
        if (popup.is(e.target)) {
            popup.fadeOut();
        }
    });

    $('body').on('keypress', '#login-popup-inner', function(e) {
        if (e.which === 13) {
            signIn($('#email').val(), $('#password').val());
        }
    });

    $('body').on('click', '#sign-in-button', function() {
        signIn($('#email').val(), $('#password').val());
    });
});