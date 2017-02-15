$(function () {
    $('#message-offer-popup').fadeOut(1);
    var auth = require('./firebase.js')['auth'];
    var getUserInfo = require('./firebase.js')['getUserInfo'];
    var updateUserInfo = require('./firebase.js')['updateUserInfo'];
    var addTagToProfile = require('./firebase.js')['addTagToProfile'];
    var getProfileTags = require('./firebase.js')['getProfileTags'];
    var removeProfileTag = require('./firebase.js')['removeProfileTag'];
    var nameSizeMin = require('./navbar-signup.js')['nameSizeMin'];
    var nameSizeMax = require('./navbar-signup.js')['nameSizeMax'];
    var userImagesRef = require('./firebase.js')['userImagesRef'];
    var addProfilePicture = require('./firebase.js')['addProfilePicture'];
    var getProfilePicture = require('./firebase.js')['getProfilePicture'];
    var displayConversations = require('./firebase.js')['displayConversations'];
    var displayMessagesDetail = require('./firebase.js')['displayMessagesDetail'];
    var updateNavbarName = require('./firebase-auth.js')['updateNavbarName'];
    var getUserSelling = require('./firebase.js')['getUserSelling'];
    var getItemsById = require('./firebase.js')['getItemsById'];
    var setItemAsSold = require('./firebase.js')['setItemAsSold'];

    var updateNavbarPic = require('./firebase-auth.js')['updateNavbarPic'];

    var reader;
    var user;
    var uid;
    var firebaseUsername;
    var likedCardList = $('#profile-liked-card-list');
    var sellingCardList = $('#profile-selling-card-list');
    var profilePicture = $('#profile-picture');
    var addPhotoButton = $('#add-photo-button');
    var addPhotoInput = $('#add-photo-input');
    var addButton = $('.add-button');
    var editButton = $('#edit-button');
    var saveButton = $('#save-button');
    var firstName = $('#profile-first-name');
    var lastName = $('#profile-last-name');
    var username = $('#profile-user-name');
    var hub = $('#profile-hub-name');
    var paymentPreference;
    var emailNotifications = $('#email-notifications');
    var password = $('#profile-password');
    var getImage = require('./firebase.js')["getImage"];
    var getFavoriteObjects = require('./firebase.js')['getFavoriteObjects'];
    var profileLikedItems = $('#profile-liked-items');
    var navbarProfilePic = $('#navbar-user-photo');
    var profileName = $('#profile-name');

    if ($(profileLikedItems).length > 0) {
        var showFavoritedItems = function(items) {
            var imagePaths = []
            var str = $('#profile-liked-items').text();
            var compiled = _.template(str);

            $('#profile-liked-holder').empty();
            $('#profile-liked-holder').append(compiled({items: items}));




            for (var item in items) {
                imagePaths.push(items[item]['id']);
            }

            for (var i = 0; i < imagePaths.length; i += 1) {
                (function (x) {
                    getImage(imagePaths[x] + '/imageOne', function(url) {
                        tagToAdd = "img.activator:eq(" + x  + " )";
                        $(tagToAdd).attr({src: url});
                    });
                })(i);
            }
        };
    }


    $('#messages-preview-holder').on('click', '.message-preview', function() {
        let chatid = $(this).attr('chatid');
        $('#message-send-button').attr('chatid', chatid)

        // toggling clicked/selected div colors
        if($(this).closest('div').hasClass('active')) {
            return false;
        }

        $(this).find('.material-icons').remove();
        $('.active-message').toggleClass('active-message');
        $(this).closest('div').toggleClass('active-message');
        $('#message-detail-content').empty().fadeOut(100);

        displayMessagesDetail(uid, chatid);
    });

    var loadSellingCardList = function () {
        Promise.resolve(getUserSelling(uid)).then(function(items) {
            if (Object.keys(items).length >= 1) {
                let itemList = [];
                for (itemId in items) {
                    itemList.push(itemId)
                }

                Promise.resolve(getItemsById(itemList)).then(function(itemObjects) {
                    let filteredItemList = {};
                    var str = $('#profile-selling-template').text();
                    var compiled = _.template(str);
                    var imagePaths = [];

                    for (var item in itemObjects) {
                        var currentItem = itemObjects[item];
                        var itemID = currentItem['id'];

                        imagePaths.push(itemID);

                        filteredItemList[itemID] = currentItem;
                    }

                    $('#profile-selling-holder').empty();
                    $('#profile-selling-holder').append(compiled({filteredItemList: filteredItemList}));

                    for (var i = 0; i < imagePaths.length; i += 1) {
                        (function (x) {
                            getImage(imagePaths[x] + '/imageOne', function(url) {
                                $("#" + imagePaths[x]).attr({src: url});
                            });
                        })(i);
                    }
                });

            } else {
                // show a div saying user has no items for sale
            }
        });
    };

    var loadTagsList = function () {

    };


    var addToTagsList = function () {
        var addition = {
            test: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
        };
        addTagToProfile(uid, addition);
    };

    var loadSettings = function () {
        getUserInfo(uid, loadUserInfo);
        updateNavbarName();
    };

    var loadProfilePicture = function () {
        Promise.resolve(getProfilePicture(uid)).then(url => {
            profilePicture.attr('src', url);
        });
    }

    var loadUserInfo = function (userInfo) {
        firstName.val(userInfo.firstName);
        lastName.val(userInfo.lastName);
        username.val(userInfo.username);
        firebaseUsername = userInfo.username;
        hub.val(userInfo.userHub);
        loadProfilePicture();
        $('.my-profile-username').text(firebaseUsername);
        for (preference in userInfo.paymentPreferences) {
            $("select[id$='profile-payment-preference'] option[value=" + userInfo.paymentPreferences[preference] + "]").attr("selected", true);
        }

        $('select').material_select();

    };

    var checkInput = function (input) {
        return input.val().length > nameSizeMin;
    }

    var checkUsername = function (input) {
        return input.val().length >= nameSizeMin && input.val().length <= nameSizeMax
    }

    var updateSettings = function () {
        var paymentPreferences = [];
        for (preference in paymentPreference.val()) {
            paymentPreferences.push(paymentPreference.val()[preference]);
        }

        if (!paymentPreferences.length) {
            paymentPreferences.push("none");
        }

        var updatedInfo = {
            username: username.val(),
            firstName: firstName.val(),
            lastName: lastName.val(),
            userHub: hub.val(),
            paymentPreferences: paymentPreferences
        };
        updateUserInfo(uid, updatedInfo);
        loadSettings();
    };

    var rerouteProfileHash = function(hash) {
        if (window.location.hash.substr(1) === 'messages') {
            $('ul.tabs').tabs('select_tab', 'profile-messages');
        } else if (window.location.hash.substr(1) === 'notifications') {
            $('ul.tabs').tabs('select_tab', 'profile-tagslist');
        } else if (window.location.hash.substr(1) === 'settings') {
            $('ul.tabs').tabs('select_tab', 'profile-settings');
        }
    }

    auth.onAuthStateChanged(function(user) {
        if (user) {
            user = auth.currentUser.email;
            uid = auth.currentUser.uid;
            if (window.location.pathname === '/profile/profile.html') {
                $('select').material_select();
                paymentPreference = $('#profile-payment-preference');
                loadSettings();
                getFavoriteObjects(showFavoritedItems);
                displayConversations(uid);
                rerouteProfileHash();
            }

        } else if (!user && window.location.pathname === '/profile/profile.html'){
            window.location.href = "../index.html";
        }
    });

    $('#selling-tab').click(function () {
        loadSellingCardList();
    });


    $('#notifications-tab').click(function () {
        loadTagsList();
    });

    $('#messages-offer-button').click(function() {
        if ($('#message-offer-popup').hasClass('invisible-div')) {
            $('#message-offer-popup').removeClass('invisible-div').fadeIn(1000);
        }
        else {
            $('#message-offer-popup').addClass('invisible-div').fadeOut(1000);
        }
    })

    addButton.click(function () {
        addToTagsList();
    });

    addPhotoButton.click(function () {
        addPhotoInput.click();
    });

    profilePicture.click(function () {
        addPhotoInput.click();
    });

    $('#profile-selling-holder').on('click', '.selling-sold-button', function () {
        let chatID = $($(this).parent()[0].children[2])[0].children[0].id;
        setItemAsSold(chatID);
        loadSellingCardList();

        //get itemID
        // mark this item as sold in items, itemsByHub, itemsByUser
        // refresh items
    });

    addPhotoInput.change(function () {
        reader = new FileReader();
        var fileExtension = ['jpeg', 'jpg', 'png'];
        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            Materialize.toast('Only formats are allowed : ' + fileExtension.join(', '), 3000, 'rounded');
        } else {
            reader.onload = function (e) {
                addProfilePicture(uid, e.target.result, loadProfilePicture);
            }
            reader.readAsDataURL($(this)[0].files[0]);
        }
    });

    editButton.click(function () {
        saveButton.attr("disabled", false);
        editButton.attr("disabled", true);
        firstName.attr("disabled", false);
        lastName.attr("disabled", false);
        username.attr("disabled", false);
        hub.attr("disabled", false);
        paymentPreference.attr("disabled", false);
        $('select').material_select();
        emailNotifications.attr("disabled", false);
        password.attr("disabled", false);
    });

    saveButton.click(function () {
        if (!checkInput(firstName) || !checkInput(lastName) || !checkUsername(username || !checkInput(hub))) {
            Materialize.toast('First Name, Last Name, Username, and Hub must all be at least 1 character.', 3000, 'rounded');
            return;
        }

        editButton.attr("disabled", false);
        saveButton.attr("disabled", true);
        firstName.attr("disabled", true);
        lastName.attr("disabled", true);
        username.attr("disabled", true);
        hub.attr("disabled", true);
        paymentPreference.attr("disabled", true);
        $('select').material_select();
        emailNotifications.attr("disabled", true);
        password.attr("disabled", true);
        updateSettings();
    });

});
