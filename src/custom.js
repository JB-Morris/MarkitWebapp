"use strict"

$(function() {
    const displayItemsInScroller = require('./sidescroller-view.js')['displayItemsInScroller'];
    const campusList = ['UCLA', 'Loyola Marymount University'];
    const initializeTagTextExt = require('./new-post.js')['initializeTagTextExt']
    let blurbLeft = true;
    const tagsList = [
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
    ];    

    $('.slider').slider();
    $('ul.tabs').tabs();
    $('.parallax').parallax();

    const fadingBlurbs = (blurbSide) => {
        if (blurbSide) {
            $(".main-info-left").fadeIn(2000).delay(5000).fadeOut('slow', function() {
                // blurbLeft = !blurbLeft;
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
        const keysInput = $("#main-keys").val().toLowerCase().trim().split(/\s+/);
        const hubInput = $('#main-campus').textext()[0].tags()._formData;
        const tagsInput = $('#main-tags').textext()[0].tags()._formData;
        const priceMaxInput = $("#main-price").val().length > 0 ?  $("#main-price").val() : "9999";

        for (let i = 0; i < tagsInput.length; i += 1) {
            tagsInput[i] = tagsInput[i].toLowerCase();

        }

        window.location.href = `/find/find.html#key=${keysInput}?hub=${hubInput}?tags=${tagsInput}?priceMin=1?priceMax=${priceMaxInput}`;
    });

    $('.campus-button-coming-soon').hover(function() {
        const $this = $(this);
        const schoolName = $this.text();
        $this.data('schoolName', schoolName);
        $this.text("Coming Soon");
    }, function () {
        const $this = $(this);
        $this.text($this.data('schoolName'));
    })

    if (window.location.pathname === "/index.html" || window.location.pathname === "/") {
        setTimeout(() => { fadingBlurbs(blurbLeft) }, 1000);
        initializeTagTextExt('#main-tags', tagsList);
        initializeTagTextExt('#main-campus', campusList);

        $("#lmu-scroller-placeholder").load("../sidescroller-view/sidescroller-view.html", function () {
            const $this = $(this);
            displayItemsInScroller('Loyola Marymount University', 5, $this.find(".inside-scroll-container"));            
        });

        $("#ucla-scroller-placeholder").load("../sidescroller-view/sidescroller-view.html", function () {
            const $this = $(this);
            displayItemsInScroller('UCLA', 5, $this.find(".inside-scroll-container"));            
        });
    }
});
