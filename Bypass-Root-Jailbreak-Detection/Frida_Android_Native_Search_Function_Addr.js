var SEARCH_FUNCTION_ADDR = 0x0;
var exportedFunctions = Module.enumerateExports(LIB_SO)
exportedFunctions.forEach(function(element, index)
{
if(element.name.includes(SEARCHED_FUNCTION)) 
{
console.log("Name = " + element.name);
console.log("Pointer = " + element.address);
SEARCH_FUNCTION_ADDR = element.address;
}
})
