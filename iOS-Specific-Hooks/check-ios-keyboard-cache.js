/*
* iOS Keyboard Cache
* 
* Inspired by and heavily modified version of @ay-kay/ios-keyboard-cache
* Thanks to @ay-kay for the original work!
* iterateInputTraits() - Iterate over all UITextView, UITextField (including UISearchBar) elements in the current view and check if keyboard caching is disabled on these text inputs
*
*/
function resolveAutocorrectionType(typeNr) {
switch (parseInt(typeNr, 10)) {
case 1:
return "UITextAutocorrectionTypeNo"
case 2:
return "UITextAutocorrectionTypeYes"
default:
return "UITextAutocorrectionTypeDefault"
}
}
function findFieldLabel(ui) {
var searchResults = [];
function searchSubviews(view, level, maxLevel) {
if (level > maxLevel || !view) return;
try {
var subviews = view.subviews();
for (var i = 0; i < subviews.count(); i++) {
var subview = subviews.objectAtIndex_(i);
if (subview.isKindOfClass_(ObjC.classes.UILabel)) {
var labelText = subview.text();
if (labelText && labelText.toString().length > 0 && labelText.toString().length < 50) {
searchResults.push("Label-L" + level + ": " + labelText.toString());
}
}
if (subview.isKindOfClass_(ObjC.classes.UIButton)) {
var buttonTitle = subview.titleForState_(0);                     if (buttonTitle && buttonTitle.toString().length > 0 && buttonTitle.toString().length < 50) {
searchResults.push("Button-L" + level + ": " + buttonTitle.toString());
}
}
if (subview.accessibilityLabel && subview.accessibilityLabel()) {
var accLabel = subview.accessibilityLabel().toString();
if (accLabel.length > 0 && accLabel.length < 50) {
searchResults.push("AccessLabel-L" + level + ": " + accLabel);
}
}
searchSubviews(subview, level + 1, maxLevel);
}
} catch (e) {
}
}
var superview = ui.superview();
if (superview) {
searchSubviews(superview, 0, 2);
}
if (superview && superview.superview()) {
searchSubviews(superview.superview(), 0, 2);
}
searchSubviews(ui, 0, 1);
if (searchResults.length > 0) {
for (var i = 0; i < searchResults.length; i++) {
var result = searchResults[i].toLowerCase();
if (result.includes('password') || result.includes('pass') || result.includes('pwd')) {
return searchResults[i] + " (Priority: Password)";
}
if (result.includes('username') || result.includes('user') || result.includes('login')) {
return searchResults[i] + " (Priority: Username)";
}
if (result.includes('email') || result.includes('mail')) {
return searchResults[i] + " (Priority: Email)";
}
}
return searchResults[0];
}
return "Unknown";
}
function iterateInputTraits() {
var inputTraits = [ObjC.classes.UITextView, ObjC.classes.UITextField];
inputTraits.forEach(function(inputTrait) {
ObjC.choose(inputTrait, {
onMatch: function(ui) {
send("-".repeat(100));
send(ui.toString());
var fieldName = "Unknown";
try {
if (ui.placeholder && ui.placeholder() && ui.placeholder().toString().length > 0) {
fieldName = "Placeholder: " + ui.placeholder().toString();
} else if (ui.accessibilityLabel && ui.accessibilityLabel() && ui.accessibilityLabel().toString().length > 0) {
fieldName = "AccessibilityLabel: " + ui.accessibilityLabel().toString();
} else if (ui.accessibilityIdentifier && ui.accessibilityIdentifier() && ui.accessibilityIdentifier().toString().length > 0) {
fieldName = "AccessibilityID: " + ui.accessibilityIdentifier().toString();
} else {
fieldName = findFieldLabel(ui);
}
} catch (e) {
fieldName = "Error getting name: " + e.message;
}
send("Field Name: " + fieldName);
send("is Editable: " + ui.isEditable());
send("secureTextEntry: " + ui.isSecureTextEntry());
send("autocorrectionType: " + ui.autocorrectionType() + " (" + resolveAutocorrectionType(ui.autocorrectionType()) + ")");
},
onComplete: function() {
send("-".repeat(100));
send("Finished searching for " + inputTrait.toString() + " elements.");
}
});
});
}
iterateInputTraits();
