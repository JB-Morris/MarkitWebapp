$(function() {
    var addListing = require('./firebase.js')['addListing'];
    var auth = require('./firebase.js')['auth'];
    var itemTitle;
    var itemDescription;
    var itemTags;
    var itemPrice;
    var itemHub;
    var userID;
    var itemImages;

    var checkBasicItems = function() {
        var checksPassed = true;
        userID = auth.currentUser.uid;
        itemTitle = $("#item-post-title").val();
        itemDescription = $("#item-post-description").val();

        itemTags = $('#itemTags').textext()[0].tags()._formData;
        itemPrice = $("#item-post-price").val();
        itemImages = [];
        $('#dropzone').find('img').each(function(index) {
            itemImages.push($(this).attr('src'));
        });

        itemHub = $('#hub-selection').textext()[0].tags()._formData;

        if (!/^[\w\s\.\,\'\"\!\?\$\#\@\!\%\^\&\*\(\)\-\+\=\/\\]{5,30}$/.test(itemTitle)) {
            Materialize.toast('Title must be between 5 and 30 characters', 3000, 'rounded');
            checksPassed = false;
        } else if (!/^[\w\s\.\,\'\"\!\?\$\#\@\!\%\^\&\*\(\)\-\+\=\/\\]+$/.test(itemDescription) || itemDescription.length < 5) {
            Materialize.toast('Description can only contain letters and numbers', 3000, 'rounded');
            checksPassed = false;
        } else if(!itemPrice.match(/^[0-9]+([.][0-9]{0,2})?$/) || itemPrice < 0.01 || itemPrice > 3000) {
            Materialize.toast('only enter numbers, and an optional decimal', 3000, 'rounded');
            checksPassed = false;
        } else if(itemHub.length < 1 || itemHub.length > 3) {
            checksPassed = false;
            Materialize.toast('Please enter up to 3 hubs', 3000, 'rounded');
        } else if (itemTags.length < 2 || itemTags.length > 5) {
            Materialize.toast('Please enter 2 to 5 tags', 3000, 'rounded');
            checksPassed = false;
        } else if (itemImages.length < 1) {
            Materialize.toast('Please add at least one image', 3000, 'rounded');
            checksPassed = false;
        } else {
            for (var i = 0; i < itemTags.length; i += 1) {
                if (!/^[a-zA-Z\-]+$/.test(itemTags[i]) || itemTags[i].length > 15) {
                    Materialize.toast('tags can only contain letters and hyphens, up to 15 characters', 3000, 'rounded');
                    checksPassed = false;
                }
            }   

            itemHub.forEach(function(currentHub) {
                if (!/^[a-zA-Z\-\s]+$/.test(currentHub)) {
                    Materialize.toast('Hubs can only contain letters, hyphens and spaces', 3000, 'rounded');
                    checksPassed = false;
                } 
            });
        }

        return checksPassed;
    };

    var addImagesToSlider = function() {
        var imageCount = ['one', 'two', 'three', 'four'];
        $('#carousel-wrapper').append($('<div></div>').addClass('carousel carousel-slider'));

        for (var i = 0; i < itemImages.length; i += 1) {    
            $('.carousel-slider').append(
                $('<a></a>').addClass('carousel-item').attr('href', '#' + imageCount[i] + '!').append(
                    $('<img>').attr('src', itemImages[i])
                )
            ); 
        }
        $('.carousel.carousel-slider').carousel({full_width: true, indicators: true});
    };

    $("#post-preview").click(function () {
        if (checkBasicItems()) {
            addImagesToSlider();
            
            $('#preview-submit-tab').removeClass('disabled');
            $('ul.tabs').tabs('select_tab', 'preview-submit');
            $('#basic-info-tab').addClass('disabled');

            $('#preview-title').append(itemTitle);
            $('#preview-price').append(itemPrice);
            $('#preview-description').append(itemDescription);
            
            for (tag of itemTags) {
                $('#preview-tags').append(
                    $('<a></a>').attr('href', '#').addClass('hub-card').text(tag)
                );
                $('#preview-tags').append(" ");
            }
        }
    });

    $('#back-to-preview').on('click', function (e) {
        $('#basic-info-tab').removeClass('disabled');
        $('ul.tabs').tabs('select_tab', 'basic-info');
        $('#preview-submit-tab').addClass('disabled');
        
        $('#preview-title').empty();
        $('#preview-price').empty().text("$");
        $('#preview-description').empty();
        $('#preview-tags').empty().append(
            $('<span>').attr('id', 'preview-tag-blurb').text('Tags: ')
        );
        $('#carousel-wrapper').empty();
    });

    //add listing
    $("main").on('click', '#submit-post', function (e) {
        if (itemTitle && itemDescription && itemTags && itemPrice) {
            addListing(itemTitle, itemDescription, itemTags, itemPrice, itemHub, userID, itemImages);
            $("#new-post-main").text("Item has been Posted :)");
        } else {
            alert("please enter a username and comment");
        }
    });

    var itemTagRef = $('#itemTags');
    if (itemTagRef.length > 0) {
        itemTagRef.textext({plugins : 'tags autocomplete'})
            .bind('getSuggestions', function(e, data){
                var list = [
                        'Table',
                        'Desk',
                        'Computer',
                        'Electronics',
                        'iPhone',
                        'Cell-Phone',
                        'Apple',
                        'Macbook',
                        'Chair',
                        'Leather',
                        'Clothing',
                        'Bedroom',
                        'Bathroom',
                        'Couch',
                        'Kitchen',
                        'Living-Room',
                        'Dinner-Table'
                    ],
                    textext = $(e.target).textext()[0],
                    query = (data ? data.query : '') || '';

                $(this).trigger('setSuggestions',{
                    result : textext.itemManager().filter(list, query) }
                );
        });
    }

    var hubRef = $('#hub-selection');
    if (hubRef.length > 0) {
        hubRef.textext({plugins : 'tags autocomplete'})
            .bind('getSuggestions', function(e, data){
                var list = [
                        'Loyola Marymount University',
                        'UCLA'
                    ],
                    textext = $(e.target).textext()[0],
                    query = (data ? data.query : '') || '';

                $(this).trigger('setSuggestions',{
                    result : textext.itemManager().filter(list, query) }
                );
        });
    }


    /**
        drophub to add images by clicking
        or by dragging and dropping
    **/
    var reader;
    var drop;

    $('#dropMain, .drop').on({
        'click': function(e) {
            $('#fileBox').click();
            drop = this;
            reader = new FileReader();
        },
        'dragover dragenter': function(e) {
            e.preventDefault();
            e.stopPropagation();
        },
        'drop': function(e) {
            var dropArea = this;
            var dataTransfer =  e.originalEvent.dataTransfer;
            if (dataTransfer && dataTransfer.files.length) {
                e.preventDefault();
                e.stopPropagation();
                $.each(dataTransfer.files, function(i, file) { 
                    reader = new FileReader();
                    reader.onload = $.proxy(function(file, $fileList, event) {
                        var img = file.type.match('image.*') ? $("<img>").attr('src', event.target.result) : "";
                        $fileList.empty().append(img);
                    }, this, file, $(dropArea));
                    reader.readAsDataURL(file);
                });
            }
        }
    });

    $("#fileBox").change(function() {
        var fileExtension = ['jpeg', 'jpg', 'png'];
        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            Materialize.toast('Only formats are allowed : ' + fileExtension.join(', '), 3000, 'rounded');

        } else if (this.files && this.files[0]) {
            reader.onload = function (e) {
                $(drop).empty().append($("<img>").attr("src", reader.result));
                $(drop).css('background-color', '#fff');
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    $('#show-hub-link').on('click', function () {
        $('#hub-popup').fadeIn();
    });

    $(document).mouseup(function (e) {
        var popup = $('#hub-popup');
        if (popup.is(e.target)) {
            popup.fadeOut();
        }
    });

    $('#submit-hub').on('click', function() {
        let hubs = $('#hub-selection').textext()[0].tags()._formData;
        
        if (hubs.length > 0 ) {
            $("#current-hubs-signed-in").empty();
            for (var i = 0; i < hubs.length; i += 1) {
                $('#current-hubs-signed-in').append(
                    $('<span>').addClass('hub-card z-depth-1').append(hubs[i])
                    
                );
                $("#current-hubs-signed-in").append(" ");
            }
            $('#hub-popup').fadeOut();
        }
    });

    $('#cancel-hub').on('click', function() {
        $('#hub-popup').fadeOut();
    });
});