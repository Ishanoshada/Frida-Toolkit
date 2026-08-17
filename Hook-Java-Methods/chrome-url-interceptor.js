Java.perform(function () {
let Tab = Java.use("org.chromium.chrome.browser.tab.Tab");
let previousUrl = null;
Tab["getUrl"].implementation = function () {
let result = this["getUrl"]();
if (result !== previousUrl) {
console.log(`Current URL: ${result}`);
previousUrl = result;
}
return result;
};
});
