Java.perform(function () 
{
var CLASS_REFERENCE = Java.use("PACKAGE_NAME.CLASS");
CLASS_REFERENCE.METHOD_TO_HOOK.implementation = function(ARGS) 
{
var MYVAR = this.METHOD_TO_HOOK(ARGS)
return false;
}
CLASS_REFERENCE.METHOD_TO_HOOK.overload("java.lang.String", "int").implementation = function(ARGS) 
{
var MYVAR = this.METHOD_TO_HOOK(ARGS)
return false;
}
CLASS_REFERENCE.STATIC_METHOD();
CLASS_REFERENCE.VARIABLE.value = VALUE;
var CLASS_OBJ = CLASS_REFERENCE.$new();
CLASS_OBJ.METHOD();
});
