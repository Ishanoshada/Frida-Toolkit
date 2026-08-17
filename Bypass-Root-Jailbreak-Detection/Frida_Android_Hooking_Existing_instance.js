Java.perform(function () 
{
Java.choose("PACKAGE_NAME.CLASS", 
{
onMatch : function(instance)
{ 
console.log("Instance found: " + instance);
console.log("Instance found: " + instance.toString());
/*
OUR OWN IMPLEMENTATION OF THE METHOD
*/
},
onComplete:function()
{
/*
OUR OWN IMPLEMENTATION OF THE METHOD
*/
}
});
});
