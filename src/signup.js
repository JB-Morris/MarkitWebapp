"use strict"

$(function() {
    const createAccount = require('./firebase.js')["createAccount"];
    const sendVerificationEmail = require('./firebase.js')['sendVerificationEmail'];
    const facebookAuthentication = require('./firebase.js')['facebookLogin'];
    const googleAuthentication = require('./firebase.js')['googleLogin'];
    const auth = require('./firebase.js')['auth'];

    const nameCheck = new RegExp(/^[a-zA-Z]{2,15}[\ ][a-zA-Z]{2,20}$/);
    const emailCheck = new RegExp(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/);
    const passwordSizeLimit = 8;
    const nameSizeMin = 2;
    const nameSizeMax = 15;    

    let nameValid = false;
    let lastNameValid = false;
    let emailValid = false;
    let passwordValid = false;

    let first = "";
    let last = "";

    const checkInput = function () {
        return nameValid && emailValid && passwordValid;
    };



    $('#navbar-placeholder').on('click', '#sign-up-button', function () {
        window.location.href = '/signup/signup.html';
    });

    $('body').on('click', '#google-login-button', function() {
        googleAuthentication();
    });

    $('body').on('click', '#fb-login-button', function() {
        facebookAuthentication();
    });


    $('body').on('click', '#sign-up-button-container', function() {
        if (checkInput()) {
            createAccount($('#signup-email').val(), $('#signup-password').val(), first, last);
            sendVerificationEmail();
        } else {
            // Materialize.toast('Invalid input.', 3000, 'rounded');
            if (!nameValid) {
                $("#fullname-alert").removeClass('hide');
            } 

            if (!passwordValid) {
                $("#password-alert").removeClass('hide');
            }
        }
    });


    $('body').on('keyup', '#signup-names', function() {
        const fullName = $('#signup-names').val();
        first = fullName.substr(0,fullName.indexOf(' '));
        last = fullName.substr(fullName.indexOf(' ') + 1);

        if (first.length < nameSizeMin || first.length > nameSizeMax || 
            last.length < nameSizeMin || last.length > nameSizeMax) {
            nameValid = false;
            $('#checkmark-name').addClass('hide');
        } else {
            nameValid = true
            $('#checkmark-name').removeClass('hide');
        }
    });

    $('body').on('keyup', '#signup-email', function() {
        let userEmail = $('#signup-email').val();

        if (emailCheck.test(userEmail)) {
            auth.fetchProvidersForEmail(userEmail).then(function(result) {
                if (result.length === 0) {
                    emailValid = true;
                    $('#checkmark-email').removeClass('hide');
                    $('#email-edu-blurb').text("(Must be .edu)");
                    $('#email-edu-blurb').removeClass('red-text text-darken-1');
                } else {
                    console.log('lol');
                    $('#email-edu-blurb').text("(Email is already registered)");
                    $('#email-edu-blurb').addClass('red-text text-darken-1');
                }
            }).catch(function(error) {
                console.log(error);
            });
        } else {
            emailValid = false;
            $('#checkmark-email').addClass('hide');
        }
    });

    $('body').on('keyup', '#signup-password', function() {
        if ($('#signup-password').val().length >= passwordSizeLimit) {
            passwordValid = true;
            $('#checkmark-password').removeClass('hide');
        } else {
            passwordValid = false;
            $('#checkmark-password').addClass('hide');
        }
    });

    module.exports = {
        nameSizeMin,
        nameSizeMax
    };

});
