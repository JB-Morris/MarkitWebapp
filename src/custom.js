"use strict" 
$(function() {
    $('.slider').slider();
    $('ul.tabs').tabs();
    $('.parallax').parallax();

    let initializeTagTextExt = require('./new-post.js')['initializeTagTextExt']

    let blurbLeft = true;

    let fadingBlurbs = (blurbSide) => {
        if (blurbSide) {
            $(".main-info-left").fadeIn(2000).delay(5000).fadeOut('slow', function() {
                blurbLeft = !blurbLeft;
                fadingBlurbs(blurbLeft);
            });
        } else {
            $(".main-info-right").fadeIn(2000).delay(5000).fadeOut('slow', function() {
                blurbLeft = !blurbLeft;
                fadingBlurbs(blurbLeft);
            });
        }
    }



    $("#search-button-main-page").on('click', () => {
        keysInput = $("#main-keys").val();
        hubInput = "todo";
        tagsInput = "todo";
        priceMaxInput = $("#main-price").val();
        
        // window.location.href = `/find/find.html#key=\${keysInput}?hub=\${hubInput}?tags=\${tagsInput}?priceMin=1?priceMax=\${priceMaxInput}`;
    })

    if (window.location.pathname === "/index.html") {
        setTimeout(() => { fadingBlurbs(blurbLeft) }, 1000);
        initializeTagTextExt('#main-tags')

    }

});

    
