/* Description: Call method of class
* Mode: S+A
* Version: 1.0
* 
*/
Java.choose("com.example.app.activity_class_name" , {
onMatch : function(instance){     console.log("Found instance: "+instance);
console.log("Result of method call: " + instance.method_name_to_call());   },
onComplete:function(){}
});
