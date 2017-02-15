'use strict'

var firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
require('firebase/storage');

firebase.initializeApp({
    // serviceAccount: "./MarkIt-3489756f4a28.json",
    apiKey: "AIzaSyCaA6GSHA0fw1mjjncBES6MVd7OIVc8JV8",
    authDomain: "markit-80192.firebaseapp.com",
    databaseURL: "https://markit-80192.firebaseio.com",
    storageBucket: "markit-80192.appspot.com",
    messagingSenderId: "4085636156"
});

var database = firebase.database();
var auth = firebase.auth();
var itemsRef = database.ref('items/');
var itemImagesRef = firebase.storage().ref('images/itemImages/');
var userImagesRef = firebase.storage().ref('images/profileImages/');
var usersRef = database.ref('users/');


var addProfilePicture = function (uid, image, callback) {
    return new Promise(function(resolve, reject) {
        image = image.replace(/^.*base64,/g, '');
        var profilePicName = "imageOne";
        var uploadTask = userImagesRef.child(uid + '/' + profilePicName).putString(image, 'base64');

        uploadTask.on('state_changed', function(snapshot) {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');

            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, function(error) {
            reject(error);
            console.log("error uploading image");
        }, function() {
            var downloadURL = uploadTask.snapshot.downloadURL;
            resolve(downloadURL);
            $('#profile-picture').attr('src', downloadURL);

            $('#navbar-user-photo').attr('src', downloadURL);
        });
        
    });
};

var getProfilePicture = function (uid) {
    return userImagesRef.child(uid).child('imageOne').getDownloadURL().then(function(url) {
        return url;
    }).catch(function(error) {
        console.log("error image not found");
        console.log("error either in item id, filename, or file doesn't exist");
    });
}

var sendVerificationEmail = function () {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            user.sendEmailVerification().then(function() {
            });   
        }
    });
};

var addListing = function (title, description, tags, price, hubs, uid, images) {
    var imageNames = ["imageOne", "imageTwo", "imageThree", "imageFour"];
    var myDate = Date();
    var itemRef = itemsRef.push();
    var itemKey = itemRef.key;
    var lowerCasedTags = $.map(tags, function(n,i) {return n.toLowerCase();});

    var itemData = {
        title: title,
        description: description,
        tags: lowerCasedTags,
        price: price,
        uid: uid,
        id: itemKey,
        hubs: hubs,
        date: myDate
    };

    addTags(lowerCasedTags);
    addHubs(hubs);
    addNewListingToProfile(uid, itemKey);
    itemsRef.child(itemKey).set(itemData);
    database.ref('itemsByUser/' + uid + '/').child(itemKey).set(itemData);

    hubs.forEach(function(currentHub) {
        database.ref('itemsByHub/' + currentHub + '/').child(itemKey).set(itemData);
    });
    
    // adding images to storage
    for (var i = 0; i < images.length; i += 1) {
        (function(x) {
            images[x] = images[x].replace(/^.*base64,/g, '');
            var uploadTask = itemImagesRef.child(itemKey + '/' +  imageNames[x]).putString(images[x], 'base64');

            uploadTask.on('state_changed', function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');

                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            }, function(error) {
                console.log("error uploading image");
            }, function() {
                var downloadURL = uploadTask.snapshot.downloadURL;
            });
        })(i);
    }
};


var getListings = function () {
    return itemsRef.once("value").then(function (snapshot) {
        return snapshot.val();
    }).catch(function (error) {
        console.log(error);
    });
};

var getRecentItemsInHub = function (hub, callback) {
    database.ref('itemsByHub/' + hub + '/').orderByKey().limitToLast(4).once('value').then(function (snapshot) {
        callback(snapshot.val());
    }, function (error) {
        console.log(error);
    });
};

// Remove this function below and replace with the one after it
// so that it returns a promise, rather than this anti-patern
// of callback + promise
var getFavorites = function (callback) {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            usersRef.child(auth.currentUser.uid + '/favorites/').once("value").then(function (snapshot) {
                callback(snapshot.val());
            }, function (error) {
                console.log(error);
            });
        }
    });
};

var getUserFavorites = function() {
    return usersRef.child(auth.currentUser.uid + '/favorites/').once("value").then(function (snapshot) {
        return snapshot.val();
    }).catch(function (error) {
        console.log(error);
    });
};

var getUserSelling = function (uid) {
    return usersRef.child(`${uid}/itemsForSale/`).once('value').then(function (snapshot) {
        return snapshot.val();
    }).catch(function (error) {
        console.log(error);
    });
}

// Adding proper promise, but not replacing the callback antipatern
// as not to break profile code
var getUserInfoProper = function(uid) {
    return usersRef.child(uid + '/').once('value').then(function(snapshot) {
        return snapshot.val();
    });
};

var getUserInfo = function(uid, callback) {
    usersRef.child(uid + '/').once('value').then(function(snapshot) {
        var userInfo = snapshot.val();
        callback(userInfo);
    });
};

var updateUserInfo = function(uid, updatedInfo) {
    for (var update in updatedInfo) {
        usersRef.child(uid + '/' + update).set(updatedInfo[update]);
    }
};

var getImage = function(address, callback) {
    itemImagesRef.child(address).getDownloadURL().then(function(url) {
        callback(url);
    }).catch(function(error) {
        console.log("error image not found");
        console.log("error either in item id, filename, or file doesn't exist");
    });
};

var getFavoriteObjects = function (callback) {
    auth.onAuthStateChanged(function(user) {
        // get user favorites
        usersRef.child(auth.currentUser.uid + '/favorites/').once("value").then(function (snapshot) {
            var favorites = snapshot.val();
            // pull object of items that user has favorited
            itemsRef.once('value').then(function (snapshotItems) {
                var allItems = snapshotItems.val();
                var userFavoritesMatch = [];
                for (var item in allItems) {
                    if (favorites && favorites.hasOwnProperty(item)) {
                        userFavoritesMatch.push(allItems[item]);
                    }
                }
                callback(userFavoritesMatch);
            }, function (error) {
                console.log(error);
            });
        }, function (error) {
            console.log(error);
        });
    });
};

var removeFavorite = function (item) {
    usersRef.child(auth.currentUser.uid + '/favorites/' + item).remove();
    itemsRef.child(item + '/favorites/' + auth.currentUser.uid).remove();

    itemsRef.child(item).once('value').then(function(snapshot) {
        let item = snapshot.val()
        let itemTags = item['tags']
        for (let i = 0; i < itemTags.length; i += 1) {
            usersRef.child(auth.currentUser.uid + 
                '/tagSuggestions/' + itemTags[i]).set(0.5);
        }

    });    
};

var filterListings = function (keywords, hubs, tags, price_range) {
    listingsRef.orderByChild();
};

var signIn = function (email, password) {
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
};

var addNewListingToProfile = function(uid, itemID) {
    usersRef.child(uid + '/itemsForSale/' + itemID).set(true);
};

var addFavoriteToProfile = function(uid, itemID) {
    usersRef.child(uid + '/favorites/' + itemID).set(true);
    itemsRef.child(itemID + '/favorites/').child(auth.currentUser.uid).set(true);
    
    //update suggested tags
    itemsRef.child(itemID).once('value').then(function(snapshot) {
        let item = snapshot.val()
        let itemTags = item['tags']
        for (let i = 0; i < itemTags.length; i += 1) {
            usersRef.child(uid + '/tagSuggestions/' + itemTags[i]).set(1);
        }

    });    

};

var addTagToProfile = function (uid, tagObject) {
    usersRef.child(uid + '/tagsList/' + Object.keys(tagObject)[0]).set(Object.values(tagObject)[0].slice(0,5));
};

var getProfileTags = function () {
    return usersRef.child(auth.currentUser.uid + '/tagsList/').once("value").then(function (snapshot) {
        return snapshot.val();
    }).catch(function (error) {
        console.log(error);
    });
};

var removeProfileTag = function (itemTitle) {
    usersRef.child(auth.currentUser.uid + '/tagsList/' + itemTitle).remove()
};

var createAccount = function () {
    auth.createUserWithEmailAndPassword($("#sign-up-email").val(), 
        $("#sign-up-password").val()).then(function(user) {
            var newUser = firebase.auth().currentUser;
            newUserDBEntry(newUser);
        }, function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
    });    
};

var newUserDBEntry = function (user) {
    var firstName = $("#sign-up-first-name").val();
    var lastName = $("#sign-up-last-name").val();
    var username = $("#sign-up-username").val();
    var userHub = $("#sign-up-hub").val();
    var defaultPreference = ["cash"];
    var date =  Date();

    var userInfo = {
        uid: user.uid,
        email: user.email,
        username: username,
        userHub: userHub,
        firstName: firstName,
        lastName: lastName,
        paymentPreferences: defaultPreference,
        dateCreated: date
    };
    usersRef.child(user.uid).set(userInfo);
};

var addTags = function(itemTags) {
    database.ref('tags/').once('value', function(snapshot) {
        var tagsInDB = snapshot.val();
        itemTags.forEach(function (tag) {
            if (tagsInDB.hasOwnProperty(tag)) {
                database.ref('tags/').child(tag).set(tagsInDB[tag] + 1);
            } else {
                database.ref('tags/').child(tag).set(1);
            }
        });
    }, function (errorObject) {
        console.log(errorObject.code);
    });
};

var addHubs = function(itemHubs) {
    database.ref('tags/').once('value', function(snapshot) {
        var hubsInDB = snapshot.val();
        itemHubs.forEach(function (hub) {
            if (hubsInDB.hasOwnProperty(hub)) {
                database.ref('hubs/').child(hub).set(hubsInDB[hub] + 1);
            } else {
                database.ref('hubs/').child(hub).set(1);
            }
        });
    }, function (errorObject) {
        console.log(errorObject.code);
    });
};

var initializeMessage = function (id, sellerId, uid, imageLink, message, otherUsername, myUsername) {
    let chatKey = usersRef.push().key;
    let date = (new Date()).toString();

    let context = {
        itemID: uid,
        itemImageURL: imageLink,
        otherUser: sellerId,
        latestPost: date,
        conversationID: chatKey,
        otherUsername: otherUsername,
        readMessages: true
    };

    let contextOther = {
        itemID: uid,
        itemImageURL: imageLink,
        otherUser: id,
        latestPost: date,
        conversationID: chatKey,
        otherUsername: myUsername,
        readMessages: false

    };

    let messageObject = {
        date: date,
        text: message,
        type: 'text',
        user: id
    };

    let messageObjectOther = {
        date: date,
        text: message,
        type: 'text',
        user: id
    };

    usersRef.child(`/${id}/chats/${chatKey}/context`).set(context);
    usersRef.child(`/${id}/chats/${chatKey}/messages`).push(messageObject);

    usersRef.child(`/${sellerId}/chats/${chatKey}/context`).set(contextOther);
    usersRef.child(`/${sellerId}/chats/${chatKey}/messages`).push(messageObjectOther);
}

var getLastMessage = function(messageObject) {
    let listOfKeys = Object.keys(messageObject);
    let lastMessage = messageObject[listOfKeys[listOfKeys.length - 1]].text;;

    return lastMessage;
}

var sortConversations = function(uid, chatID) {
    usersRef.child(`${uid}/chats/`).once('value').then(function(snapshot) {
        let messages = snapshot.val()
        var str = $('#messages-preview-template').text();
        var compiled = _.template(str);

        let previewMessages = [];
        let promises = [];


        for (let messageID in messages) {
            let message = messages[messageID];
            let messageObj = {};

            var date = new Date(message.context.latestPost);
            let hours = date.getHours();
            var time = `${date.getUTCHours()}:${date.getMinutes()}`;
            time += (hours >= 12) ? " PM" : " AM";

            messageObj.timeStamp = message.context.latestPost;
            messageObj.time = time
            messageObj.lastMessage = getLastMessage(message['messages']);
            messageObj.user = message.context.otherUsername;
            messageObj.picture = message.context.itemImageURL;
            messageObj.messageID = messageID
            messageObj.readStatus = message.context.readMessages;

            promises.push(getItemsById([message.context.itemID]).then(itemInfo => {
                messageObj.title = itemInfo[Object.keys(itemInfo)[0]].title;
            }));


            previewMessages.push(messageObj);
        }
        // Wait for them all to complete
        Promise.all(promises).then(() => {
            previewMessages.sort(function(a, b){
                return new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime() 
            });

            for (var i = 0; i < previewMessages.length; i += 1) {
                previewMessages[i].timeStamp = previewMessages[i].timeStamp.split(' ').slice(0,3).join(' ');
            }

            $('#messages-preview-holder').empty();
            $('#messages-preview-holder').append(compiled({previewMessages: previewMessages}));
        });

    });
}

var displayConversations = function (uid) {
    usersRef.child(`${uid}/chats/`).limitToLast(1).on('child_added', function(snapshot) {
        updateExistingConversations(uid);
    });
}

var updateExistingConversations = function(uid) {
    usersRef.child(`${uid}/chats/`).once('value', function(snapshot) {
        let chats = snapshot.val();
        for (let chatID in chats) {
            //turn off potential previous listeners
            usersRef.child(`${uid}/chats/${chatID}/context/latestPost`).off();

            usersRef.child(`${uid}/chats/${chatID}/context/latestPost`).on('value', function(timeStamp) {
                sortConversations(uid)
            });
        }
    });
}

// takes array of items
var getItemsById = function (itemsToMatch) {
    return database.ref('items/').once('value').then(function (snapshot) {
        let allItems = snapshot.val();
        let matchedItems = {};

        for (let i = 0; i < itemsToMatch.length; i += 1) {
            if (itemsToMatch[i] in allItems) {
                matchedItems[itemsToMatch[i]] = allItems[itemsToMatch[i]];
            }
        }
        return matchedItems;

    }).catch(function (error) {
        console.log(error);
    });
}


var setItemAsSold = function(itemID) {
    itemsRef.child(`${itemID}/sold/`).set(true);
}

var previousListener = [null, null];

var shutOffMessageDetailListener = function(uid, chatID) {
    usersRef.child(`${uid}/chats/${chatID}/messages`).off();
}

var displayMessagesDetail = function (uid, chatID) {
    if (previousListener[0] !== null) {
        shutOffMessageDetailListener(previousListener[0], previousListener[1]);
    }

    previousListener = [uid, chatID];

    usersRef.child(`${uid}/chats/${chatID}/messages`).on('child_added', function(snapshot) {
        let message = snapshot.val();
        let userClass = (message.user === auth.currentUser.uid ? 
            'message-bubble-self' : 
            'message-bubble-other'
        );

        setTimeout(function() {
            usersRef.child(`${uid}/chats/${chatID}/context/readMessages`).set(true);
            $('#message-detail-content').append($('<p></p>').addClass(userClass).text(message.text));
            $('#message-detail-content').fadeIn();
            
            // sroll to bottom of chat
            var wtf = $('#message-detail-content');
            var height = wtf[0].scrollHeight;
            wtf.scrollTop(height);
        }, 100);
    }, function() {
        sortConversations(uid)
    });


};

var getSpecificChat = function (uid, chatID) {
    return usersRef.child(`${uid}/chats/${chatID}/`).once('value').then(function (snapshot) {
        return snapshot.val();
    });
};

var postNewMessage = function(uid, chatID, message) {
    Promise.resolve(getSpecificChat(uid, chatID)).then(function(result) {
        let otherUserID = result.context.otherUser;
        let date = (new Date()).toString()

        let messageObject = {
            date: date,
            text: message,
            type: 'text',
            user: uid
        };

        usersRef.child(`${uid}/chats/${chatID}/messages`).push(messageObject);
        usersRef.child(`${otherUserID}/chats/${chatID}/messages`).push(messageObject);

        usersRef.child(`${uid}/chats/${chatID}/context/latestPost`).set(date);
        usersRef.child(`${otherUserID}/chats/${chatID}/context/latestPost`).set(date);

        usersRef.child(`${otherUserID}/chats/${chatID}/context/readMessages`).set(false);

    });
};

$('#message-send-button').on('click', function() {
    postNewMessage(auth.currentUser.uid, $(this).attr('chatid'), $('#message-send-text').val());
    $('#message-send-text').val('');
});


$("#message-send-text").keyup(function(event){
    if (event.keyCode == 13) {
        $("#message-send-button").click();
    }
});

// AI algorithm functions for suggestions in hub
// next 3 functions
var getItemsInHub = function (hub) {
    return database.ref('itemsByHub/' + hub + '/').once('value').then(function (snapshot) {
        return snapshot.val();
    });
};

var getUserSuggestions = function (uid) {
    return usersRef.child(uid + '/tagSuggestions/').once('value').then(function (snapshot) {
        return snapshot.val();
    });
};

var populateSuggestionsInHub = function(hub, uid) {
    return Promise.all([
        getItemsInHub(hub), 
        getUserSuggestions(uid), getUserFavorites()]).then(function (results) {
            let itemsInHub = results[0];
            let userSuggestions = results[1];
            let userFavorites = results[2];

            // if user has favorites
            if (userSuggestions) {
                // for each item in the hub
                for (let item in itemsInHub) {
                    let itemTagCount = itemsInHub[item]['tags'].length;
                    let tagMatches = {};
                    let tagMatchCount = 0;
                    let tagWeight = 0;
                    let itemTags = itemsInHub[item]['tags'];

                    // for each tag in each item
                    itemTags.forEach(function (tag) {
                        // calculate weights
                        if (tag in userSuggestions) {
                            tagMatches[tag] = userSuggestions[tag];
                            tagMatchCount += 1;
                            tagWeight += userSuggestions[tag];
                            
                        }
                    });

                    tagWeight /= itemTagCount;

                    if (tagMatchCount === 0) {
                        continue;
                    }

                    // for each tags in item
                    itemTags.forEach(function(tag) {
                        // set weights
                        if (tag in userSuggestions && userSuggestions[tag] < 1) {
                            usersRef.child(uid + '/tagSuggestions/' + tag).set((userSuggestions[tag]));
                        } else if (!(tag in userSuggestions)) {
                            usersRef.child(uid + '/tagSuggestions/' + tag).set(tagWeight);
                        }
                    });
                }

                // iterate through items and display items with highest values
                let userItemSuggestions = {}
                for (let item in itemsInHub) {
                    // immediately check if the item is part of user favorites
                    // if it is, skip since no need to suggest a favorited
                    // item
                    if (itemsInHub[item]['id'] in userFavorites) {
                        continue;
                    }
                    let itemTags = itemsInHub[item]['tags'];
                    let tagCount = itemsInHub[item]['tags'].length;
                    let itemWeight = 0;
                    itemTags.forEach(function (tag) {
                        if (tag in userSuggestions) {
                            itemWeight += userSuggestions[tag];
                        }
                    });
                    itemWeight /= tagCount;
                    userItemSuggestions[itemsInHub[item]['id']] = itemWeight;
                }

                // sorting results in an array, where each
                // input is an array [key, value]
                var sortedSuggestions = []

                for (let item in userItemSuggestions) {
                    sortedSuggestions.push(item)
                }

                sortedSuggestions.sort(function(a, b) {
                    return b - a
                });

                return sortedSuggestions;
            }

        });
}


module.exports = {
    auth,
    signIn,
    getListings,
    addListing,
    addHubs,
    addTags,
    filterListings,
    createAccount,
    itemImagesRef,
    addFavoriteToProfile,
    getFavorites,
    getFavoriteObjects,
    removeFavorite,
    getImage,
    getRecentItemsInHub,
    getUserInfo,
    updateUserInfo,
    populateSuggestionsInHub,
    addTagToProfile,
    getProfileTags,
    removeProfileTag,
    getItemsById,
    userImagesRef,
    addProfilePicture,
    getProfilePicture,
    initializeMessage,
    displayConversations,
    getUserInfoProper,
    displayMessagesDetail,
    postNewMessage,
    sendVerificationEmail,
    getUserSelling,
    setItemAsSold
};