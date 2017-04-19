"use strict"

$(() => {
    const getRecentItemsInHub = require('./firebase.js')['getRecentItemsInHub'];
    const getImage = require('./firebase.js')['getImage'];
    const scrollAmount = 420;
    const scrollSpeed = 300;

    const displayItemsInScroller = (campus, numberOfResults, placeholderElement) => {
        Promise.resolve(getRecentItemsInHub(campus, numberOfResults)).then(items => {
            let imagePaths = [];
            const str = placeholderElement.text();
            const compiled = _.template(str);

            placeholderElement.empty();
            placeholderElement.prepend(compiled({items: items}));

            for (let item in items) {
                imagePaths.push(items[item]['id']);
            }

            for (let i = 0; i < imagePaths.length; i += 1) {
                ((x)=> {
                    getImage(imagePaths[x] + '/imageOne', (url) => {
                        $(`.${imagePaths[x]}`).attr({src: url});
                    });
                })(i);
            }
        });
        

        $('.left-scroll-arrow-container').on('click', function () {
            const $divToScroll = $($(this).parent().find('.outside-scroll-container'));
            const leftPos = $divToScroll.scrollLeft();

            if (leftPos === 0) {
                $divToScroll.animate({ scrollLeft:  0 }, scrollSpeed);
            } else {
                $divToScroll.animate({ scrollLeft: leftPos - scrollAmount }, scrollSpeed);
            }
        });

        $('.right-scroll-arrow-container').on('click', function () {
            const $divToScroll = $($(this).parent().find('.outside-scroll-container'));
            const leftPos = $divToScroll.scrollLeft();
            if (leftPos <= scrollAmount * 2) {
                $divToScroll.animate({ scrollLeft:  leftPos + scrollAmount }, scrollSpeed);
            }
        });     
    };

    module.exports = {
        displayItemsInScroller,
    };

});