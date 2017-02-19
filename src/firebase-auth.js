"use strict"

$(function() {
    var auth = require('./firebase.js')["auth"];
    let uid;
    let navbarProfilePic;
    let profilePic;
    let profileName;

    var getProfilePicture = require('./firebase.js')["getProfilePicture"];
    var getUserInfo = require('./firebase.js')["getUserInfoProper"];

    var updateNavbarName = function () {
        Promise.resolve(getUserInfo(uid)).then(userData => {
            profileName.text(userData.username);
        });
    };

    var updateNavbarPic = function () {
        Promise.resolve(getProfilePicture(uid)).then(url => {
            navbarProfilePic.attr('src', url);
        });
    }

    var checkIfAtIndexPage = function() {
        console.log(window.location.pathname)
        let isIndex = window.location.pathname === "/MarkitWebapp/index.html" ||
            window.location.pathname ===  "/MarkitWebapp/";
        if (isIndex) {
            console.log('at index');
            return true
        } else {
            console.log('not at index');
            return false
        }
    }

    auth.onAuthStateChanged(function(user) {
        // TODO add the next couple of lines to the checkIfAtIndexPage function
        let addPath = "../";
        if (checkIfAtIndexPage()) {
            addPath = "";
        }
        if (user) {
            uid = auth.currentUser.uid;

            $("#navbar-placeholder").load(`./${addPath}navbar/navbar-logged-in.html`, function () {
                navbarProfilePic = $('#navbar-user-photo');
                profileName = $('#profile-name');

                $(".dropdown-button").dropdown();

                $(".button-collapse").sideNav({
                    menuWidth: 300, // Default is 240
                    edge: 'right', // Choose the horizontal origin
                    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                    draggable: true // Choose whether you can drag to open on touch screens
                });

                $("#navbar-logout-button").click(function () {
                    auth.signOut();
                });

                $('#navbar-message').click(function()  {
                    $('ul.tabs').tabs('select_tab', 'profile-messages');
                });

                $('#navbar-notifications').click(function () {
                    $('ul.tabs').tabs('select_tab', 'profile-tagslist');
                });

                $('#navbar-settings').click(function () {
                    $('ul.tabs').tabs('select_tab', 'profile-settings');
                });

                updateNavbarName();
                updateNavbarPic();

            });
        } else {
            $("#navbar-placeholder").load(`./${addPath}navbar/navbar-signup.html`, function () {
                $(".dropdown-button").dropdown();
                $(".button-collapse").sideNav({
                    menuWidth: 300, // Default is 240
                    edge: 'right', // Choose the horizontal origin
                    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
                    draggable: true // Choose whether you can drag to open on touch screens
                });
            });
        }
    });

    module.exports = {
        updateNavbarName,
        updateNavbarPic
    }

});
