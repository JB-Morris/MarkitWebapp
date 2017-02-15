$(function () {
    $('.parallax').parallax();
    var getRecentItemsInHub = require('./firebase.js')['getRecentItemsInHub'];
    var itemImagesRef = require('./firebase.js')["itemImagesRef"];
    var auth = require('./firebase.js')["auth"];
    var getImage = require('./firebase.js')["getImage"];
    var populateSuggestionsInHub = require('./firebase.js')['populateSuggestionsInHub'];
    var getItemsById = require('./firebase.js')['getItemsById'];
    var getUserInfo = require('./firebase.js')['getUserInfo'];


    var mostRecentItems = $('#hub-most-recent');
    var showMostRecentItems = function(items) {
        var imagePaths = []
        var str = $('#hub-most-recent').text();
        var compiled = _.template(str);

        $('#hub-recent-holder').empty();
        $('#hub-recent-holder').prepend(compiled({items: items}));


        for (var item in items) {
            imagePaths.push(items[item]['id']);
        }

        for (var i = 0; i < imagePaths.length; i += 1) {
            (function (x) {
                getImage(imagePaths[x] + '/imageOne', function(url) {
                    tagToAdd = ".hub-recent img:eq(" + x  + " )";
                    $(tagToAdd).attr({src: url});
                });
            })(i);
        }
    };

    var showSuggestions = function(suggestions) {
        Promise.resolve(suggestions).then(function(itemList) {
            Promise.resolve(getItemsById(itemList)).then(function(itemsObject) {
                if (Object.keys(itemsObject).length > 0) {
                    $('#hub-suggestions-holder').empty();
                }

                var imagePaths = []
                var str = $('#hub-suggested').text();
                var compiled = _.template(str);

                $('#hub-suggestions-holder').prepend(compiled({itemsObject: itemsObject}));


                for (var item in itemsObject) {
                    imagePaths.push(itemsObject[item]['id']);
                }

                for (var i = 0; i < imagePaths.length; i += 1) {
                    (function (x) {
                        getImage(imagePaths[x] + '/imageOne', function(url) {
                            $("#" + imagePaths[x]).attr({src: url});
                        });
                    })(i);
                }
            })
        });
    };

    var showUserInfo = function (userData) {
        $('#hub-username-blurb').text(userData.firstName);
    }

    auth.onAuthStateChanged(function(user) {
        if (user && $(mostRecentItems).length > 0) {
            getUserInfo(auth.currentUser.uid, showUserInfo);
            getRecentItemsInHub('Loyola Marymount University', showMostRecentItems);
            showSuggestions(populateSuggestionsInHub('Loyola Marymount University', auth.currentUser.uid));
        } else if (!user && $(mostRecentItems).length > 0) {
            window.location.href = "../index.html";

        }
    });    
    

});