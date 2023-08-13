/* -------------------------------------------------------------------------------------------------------

An experiment I did to learn more about the mutation observer patter with the help of ChatGPT.
This is probably a bit of an overshot for its purpose, I suppose a simpler solution could be implemented
by using a javascript injection engine like Violent Monkey.

Features:
- Removes photos anti-save protection (stacked divs)
- Enables video controls
- While watching stories the tweaks are not applied to avoid messing up with the stories logic

Tested with "Custom Javascript for Websites 2" chrome extension with the following URL regexp in place
https:\/\/(www\.|)instagram\.com\/(?!stories\/)

------------------------------------------------------------------------------------------------------- */

// Glob variables
var scriptActive = false;
var myInterval;

// URL mutation observer. Runs when URL changes. 
// Stop the script if we are on a story.
// Restart the script if we are on a photo/video page.
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
