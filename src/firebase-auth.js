"use strict"

$(function() {
    var auth = require('./firebase.js')["auth"];
    let uid;
    let navbarProfilePic;
    let profilePic;
    let profileName;
    let searchNavbar = $('.search-navbar');
    
    var getProfilePicture = require('./firebase.js')["getProfilePicture"];
    var getUserInfo = require('./firebase.js')["getUserInfoProper"];
 
    var updateNavbarName = function (profileName) {
        Promise.resolve(getUserInfo(uid)).then(userData => {
            profileName.text(userData.username);
        });        
    };

    var updateNavbarPic = function (navbarProfilePic) {
        Promise.resolve(getProfilePicture(uid)).then(url => {
            navbarProfilePic.attr('src', url);
        });
    }

    var highlightPage = function() {
        $('#navbar-placeholder a').each(function(){
            if ($(this).prop('href') == window.location.href) {
                $(this).addClass('active'); $(this).addClass('active-navbar-li');
            }
        });
    }

    var useQuickSearchBar = () => {
        window.location = `/find/find.html`;

    }

    auth.onAuthStateChanged(function(user) {
        if (user) {
            uid = auth.currentUser.uid;
            
            $("#navbar-placeholder").load("../navbar/navbar-logged-in.html", function () {
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

                // $('.search-navbar').on("keyup", function(e) {
                //     let searchQuery = searchNavbar.val();
                //     if (e.keyCode == 13 && searchQuery) {
                //         alert("shit")
                //     }
                // });

                updateNavbarName(profileName);
                updateNavbarPic(navbarProfilePic);
                highlightPage();
            });
        } else {
            $("#navbar-placeholder").load("../navbar/navbar-signup.html", function () {
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