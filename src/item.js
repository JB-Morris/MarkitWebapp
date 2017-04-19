"use strict"

$(() => {
    $('.carousel.carousel-slider').carousel({full_width: true});
    let getImage = require('./firebase.js')["getImage"];
    let itemImagesRef = require('./firebase.js')["itemImagesRef"];
    let itemsRef = require('./firebase.js')["itemsRef"];
    let getItemsById = require('./firebase.js')["getItemsById"];
    let getUserInfo = require('./firebase.js')['getUserInfo'];
    let getProfilePicture = require('./firebase.js')['getProfilePicture'];
    let auth = require('./firebase.js')['auth'];
    let getUserInfoProper = require('./firebase.js')['getUserInfoProper'];
    let itemId;

    const showItemBasedOnHash = (item) => {
        let numbers = ['One', 'Two', 'Three', 'Four'];
        if (location.hash.length > 0) {
            for (let i = 0; i < 4; i += 1) {
                getImage(item.id + `/image${numbers[i]}`, (url) => {
                    if (url) {
                        $(`#image-${i + 1}`).attr({src: url});
                    } else {
                        // TODO this doesnt actually do anything...
                        $(`#image-${i + 1}`).remove();
                    }

                });
            }


            $('#item-title').html(item.title);
            $('#item-description').html(item.description);
            $('#item-price').html('$' + item.price);
            $('#item-tags').html('Tags: ' + item.tags.join(', '));

        }
    };

    const setProfileImageURL = (user) => {
        Promise.resolve(getProfilePicture(user)).then((url) => {
            $('#seller-profile-picture').attr('src', url);
        });
    };

    const postUser = (user) => {
        setProfileImageURL(user.uid)
        $('#seller-username').html(user['firstName']);
        let userRating = user.userRating;
        if (userRating < 0) {
            for (let star = 1; star <= 5; star += 1) {
                $(`#star-${star}`).html('remove');
                $('#star-5').tooltip({tooltip: 'not yet rated'});
            }
            return;
        }
        let flooredRating = Math.floor(userRating);
        for (let star = 1; star <= flooredRating; star += 1) {
            $(`#star-${star}`).html('star_rating');
        }
        $('#star-5').tooltip({tooltip: userRating});
        if (userRating % 1 > 0.7) {
            $(`#star-${flooredRating + 1}`).html('star_rating');
        } else if (userRating % 1 > 0.3) {
            $(`#star-${flooredRating + 1}`).html('star_half');
        }
    };

    const loadListing = () => {
        let id = location.hash.split("=")[1];
        let item;
        Promise.resolve(getItemsById([id]))
        .then((itemsObject) => {
            item = itemsObject[id];
            return item;
        })
        .then((item) => {
            showItemBasedOnHash(item);
            getUserInfo(item.uid, postUser);
            addViewCount(item, auth.currentUser.uid);
        })
    };

    const addViewCount = (item, currentUserId) => {
        if(currentUserId !== item.uid) {
            let viewCount = item.views || 1;
            // TODO possibly change this from a set to something else
            itemsRef.child(item.id).child('views').set(viewCount + 1);
        }
    };

    if (window.location.pathname === "/items/item.html" || window.location.pathname === "/") {
        loadListing();
    }


});
