/* ------------------------------------------------------------------------------------------------------
### My Instagram Tweaks by @illtellyoulater
- To be run using CJS2 browser extension (Custom Javascript for Websites 2)
- To be enabled on following regexp URL: https:\/\/(www\.|)instagram\.com\/(?!stories\/)
### Features 
- Remove anti-save protection (divs) on photos
- Enable video controls
- NEW: stop execution when browsinng stories (so it doesn't break the DOM), resume when on any other page
### Inspired by
- https://github.com/illtellyoulater/instagram-video-controls (forked)
------------------------------------------------------------------------------------------------------ */


// Glob variables
var scriptActive = false;
var myInterval;

// URL mutation observer. Run when URL changes. 
// Stop the script if we are on a story (it breaks the DOM)
// Restart the script if we are on a photo/video page
let previousUrl = '';
const observer = new MutationObserver(function (mutations) {
    if (location.href !== previousUrl) {
        previousUrl = location.href;
        console.log(`URL changed to ${location.href}`);
    }
    if (location.href.includes('/stories/')) {
        console.log("STOP! URL contains /stories/");
        clearInterval(myInterval);
    } else {
        console.log("RUN! URL doesn't contain /stories/");
        ensureCalledJustOnce();
    }
});
const config = {
    subtree: true,
    childList: true
};
observer.observe(document, config);


// Core function
// Run just once, otherwise we will have overlapping intervals
function ensureCalledJustOnce() {
    if (scriptActive === true) {return;}
    scriptActive = true;
    myInterval = setInterval(function runAtInterval() {
        console.log("Add-IG-controls script running");
        
        /* Enable video controls on videos */
        var arr = document.querySelectorAll('video');
        arr.forEach(function (videoel) {
            videoel.setAttribute("controls", "controls");
            var containerel = videoel.parentElement.parentElement.parentElement.parentElement;
            if (containerel.children.length > 1) {
                containerel.removeChild(containerel.lastChild); // these elements prevent interaction with controls
                //containerel.removeChild(containerel.lastChild); 
            }
            if (videoel.nextSibling) videoel.nextSibling.style.display = 'none';
            /* 
            We also need to not display the img element right after <video>
            (it can't just be deleted or there will be a cross-origin error)
            We check for its presence so it won't run multiple times on the same element causing undef. obj. error
            */
            videoel.volume = 0.27; // lower volume value instead of full volume
        });
        
        /* Remove anti-saving DIV on photos */
        var articles = document.querySelectorAll("article");
        articles.forEach(function (article) {
            // select anti-saving div for a single photo post
            var anti_save_div_single = article.querySelector('[role="button"] > div > div+div');
            // select anti-saving div for a multiple photo post
            var anti_save_div_multi = article.querySelector('[role="button"] > div > div > div+div');
            if (anti_save_div_single) anti_save_div_single.remove();
            if (anti_save_div_multi) anti_save_div_multi.remove();
        });
        /* 
        Photos (vids too) are nested in ARTICLES elements 
        When IG has loaded, and as we keep scrolling, IG populates the DOM with 5 photos/vids at once
        We continuosly act on all of them checking for presence of anti-saving div and removing it
        Videos don't have an anti-saving div so a DOM path for it is not found and no action is taken on them
        */
        
    }, 1000);
}
