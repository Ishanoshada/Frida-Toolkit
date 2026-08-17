/*
* User guide and more details available here:
* https: */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports=[
{
"name": "reserved0",
"args": [],
"ret": ""
},
{
"name": "reserved1",
"args": [],
"ret": ""
},
{
"name": "reserved2",
"args": [],
"ret": ""
},
{
"name": "DestroyJavaVM",
"args": [
"JavaVM*"
],
"ret": "jint"
},
{
"name": "AttachCurrentThread",
"args": [
"JavaVM*",
"void**",
"void*"
],
"ret": "jint"
},
{
"name": "DetachCurrentThread",
"args": [
"JavaVM*"
],
"ret": "jint"
},
{
"name": "GetEnv",
"args": [
"JavaVM*",
"void**",
"jint"
],
"ret": "jint"
},
{
"name": "AttachCurrentThreadAsDaemon",
"args": [
"JavaVM*",
"void**",
"void*"
],
"ret": "jint"
}
]
},{}],2:[function(require,module,exports){
module.exports=[
{
"name": "reserved0",
"args": [],
"ret": ""
},
{
"name": "reserved1",
"args": [],
"ret": ""
},
{
"name": "reserved2",
"args": [],
"ret": ""
},
{
"name": "reserved3",
"args": [],
"ret": ""
},
{
"name": "GetVersion",
"args": [
"JNIEnv*"
],
"ret": "jint"
},
{
"name": "DefineClass",
"args": [
"JNIEnv*",
"char*",
"jobject",
"jbyte*",
"jsize"
],
"ret": "jclass"
},
{
"name": "FindClass",
"args": [
"JNIEnv*",
"char*"
],
"ret": "jclass"
},
{
"name": "FromReflectedMethod",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jmethodID"
},
{
"name": "FromReflectedField",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jfieldID"
},
{
"name": "ToReflectedMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jboolean"
],
"ret": "jobject"
},
{
"name": "GetSuperclass",
"args": [
"JNIEnv*",
"jclass"
],
"ret": "jclass"
},
{
"name": "IsAssignableFrom",
"args": [
"JNIEnv*",
"jclass",
"jclass"
],
"ret": "jboolean"
},
{
"name": "ToReflectedField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jboolean"
],
"ret": "jobject"
},
{
"name": "Throw",
"args": [
"JNIEnv*",
"jthrowable"
],
"ret": "jint"
},
{
"name": "ThrowNew",
"args": [
"JNIEnv*",
"jclass",
"char*"
],
"ret": "jint"
},
{
"name": "ExceptionOccurred",
"args": [
"JNIEnv*"
],
"ret": "jthrowable"
},
{
"name": "ExceptionDescribe",
"args": [
"JNIEnv*"
],
"ret": "void"
},
{
"name": "ExceptionClear",
"args": [
"JNIEnv*"
],
"ret": "void"
},
{
"name": "FatalError",
"args": [
"JNIEnv*",
"char*"
],
"ret": "void"
},
{
"name": "PushLocalFrame",
"args": [
"JNIEnv*",
"jint"
],
"ret": "jint"
},
{
"name": "PopLocalFrame",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jobject"
},
{
"name": "NewGlobalRef",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jobject"
},
{
"name": "DeleteGlobalRef",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "void"
},
{
"name": "DeleteLocalRef",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "void"
},
{
"name": "IsSameObject",
"args": [
"JNIEnv*",
"jobject",
"jobject"
],
"ret": "jboolean"
},
{
"name": "NewLocalRef",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jobject"
},
{
"name": "EnsureLocalCapacity",
"args": [
"JNIEnv*",
"jint"
],
"ret": "jint"
},
{
"name": "AllocObject",
"args": [
"JNIEnv*",
"jclass"
],
"ret": "jobject"
},
{
"name": "NewObject",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jobject"
},
{
"name": "NewObjectV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jobject"
},
{
"name": "NewObjectA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jobject"
},
{
"name": "GetObjectClass",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jclass"
},
{
"name": "IsInstanceOf",
"args": [
"JNIEnv*",
"jobject",
"jclass"
],
"ret": "jboolean"
},
{
"name": "GetMethodID",
"args": [
"JNIEnv*",
"jclass",
"char*",
"char*"
],
"ret": "jmethodID"
},
{
"name": "CallObjectMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jobject"
},
{
"name": "CallObjectMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jobject"
},
{
"name": "CallObjectMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jobject"
},
{
"name": "CallBooleanMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jboolean"
},
{
"name": "CallBooleanMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jboolean"
},
{
"name": "CallBooleanMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jboolean"
},
{
"name": "CallByteMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jbyte"
},
{
"name": "CallByteMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jbyte"
},
{
"name": "CallByteMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jbyte"
},
{
"name": "CallCharMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jchar"
},
{
"name": "CallCharMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jchar"
},
{
"name": "CallCharMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jchar"
},
{
"name": "CallShortMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jshort"
},
{
"name": "CallShortMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jshort"
},
{
"name": "CallShortMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jshort"
},
{
"name": "CallIntMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jint"
},
{
"name": "CallIntMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jint"
},
{
"name": "CallIntMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jint"
},
{
"name": "CallLongMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jlong"
},
{
"name": "CallLongMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jlong"
},
{
"name": "CallLongMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jlong"
},
{
"name": "CallFloatMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jfloat"
},
{
"name": "CallFloatMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jfloat"
},
{
"name": "CallFloatMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jfloat"
},
{
"name": "CallDoubleMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "jdouble"
},
{
"name": "CallDoubleMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "jdouble"
},
{
"name": "CallDoubleMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "jdouble"
},
{
"name": "CallVoidMethod",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"..."
],
"ret": "void"
},
{
"name": "CallVoidMethodV",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"va_list"
],
"ret": "void"
},
{
"name": "CallVoidMethodA",
"args": [
"JNIEnv*",
"jobject",
"jmethodID",
"jvalue*"
],
"ret": "void"
},
{
"name": "CallNonvirtualObjectMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jobject"
},
{
"name": "CallNonvirtualObjectMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jobject"
},
{
"name": "CallNonvirtualObjectMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jobject"
},
{
"name": "CallNonvirtualBooleanMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jboolean"
},
{
"name": "CallNonvirtualBooleanMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jboolean"
},
{
"name": "CallNonvirtualBooleanMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jboolean"
},
{
"name": "CallNonvirtualByteMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jbyte"
},
{
"name": "CallNonvirtualByteMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jbyte"
},
{
"name": "CallNonvirtualByteMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jbyte"
},
{
"name": "CallNonvirtualCharMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jchar"
},
{
"name": "CallNonvirtualCharMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jchar"
},
{
"name": "CallNonvirtualCharMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jchar"
},
{
"name": "CallNonvirtualShortMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jshort"
},
{
"name": "CallNonvirtualShortMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jshort"
},
{
"name": "CallNonvirtualShortMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jshort"
},
{
"name": "CallNonvirtualIntMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jint"
},
{
"name": "CallNonvirtualIntMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jint"
},
{
"name": "CallNonvirtualIntMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jint"
},
{
"name": "CallNonvirtualLongMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jlong"
},
{
"name": "CallNonvirtualLongMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jlong"
},
{
"name": "CallNonvirtualLongMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jlong"
},
{
"name": "CallNonvirtualFloatMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jfloat"
},
{
"name": "CallNonvirtualFloatMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jfloat"
},
{
"name": "CallNonvirtualFloatMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jfloat"
},
{
"name": "CallNonvirtualDoubleMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "jdouble"
},
{
"name": "CallNonvirtualDoubleMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jdouble"
},
{
"name": "CallNonvirtualDoubleMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jdouble"
},
{
"name": "CallNonvirtualVoidMethod",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"..."
],
"ret": "void"
},
{
"name": "CallNonvirtualVoidMethodV",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"va_list"
],
"ret": "void"
},
{
"name": "CallNonvirtualVoidMethodA",
"args": [
"JNIEnv*",
"jobject",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "void"
},
{
"name": "GetFieldID",
"args": [
"JNIEnv*",
"jclass",
"char*",
"char*"
],
"ret": "jfieldID"
},
{
"name": "GetObjectField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jobject"
},
{
"name": "GetBooleanField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jboolean"
},
{
"name": "GetByteField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jbyte"
},
{
"name": "GetCharField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jchar"
},
{
"name": "GetShortField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jshort"
},
{
"name": "GetIntField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jint"
},
{
"name": "GetLongField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jlong"
},
{
"name": "GetFloatField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jfloat"
},
{
"name": "GetDoubleField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID"
],
"ret": "jdouble"
},
{
"name": "SetObjectField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jobject"
],
"ret": "void"
},
{
"name": "SetBooleanField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jboolean"
],
"ret": "void"
},
{
"name": "SetByteField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jbyte"
],
"ret": "void"
},
{
"name": "SetCharField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jchar"
],
"ret": "void"
},
{
"name": "SetShortField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jshort"
],
"ret": "void"
},
{
"name": "SetIntField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jint"
],
"ret": "void"
},
{
"name": "SetLongField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jlong"
],
"ret": "void"
},
{
"name": "SetFloatField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jfloat"
],
"ret": "void"
},
{
"name": "SetDoubleField",
"args": [
"JNIEnv*",
"jobject",
"jfieldID",
"jdouble"
],
"ret": "void"
},
{
"name": "GetStaticMethodID",
"args": [
"JNIEnv*",
"jclass",
"char*",
"char*"
],
"ret": "jmethodID"
},
{
"name": "CallStaticObjectMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jobject"
},
{
"name": "CallStaticObjectMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jobject"
},
{
"name": "CallStaticObjectMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jobject"
},
{
"name": "CallStaticBooleanMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jboolean"
},
{
"name": "CallStaticBooleanMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jboolean"
},
{
"name": "CallStaticBooleanMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jboolean"
},
{
"name": "CallStaticByteMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jbyte"
},
{
"name": "CallStaticByteMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jbyte"
},
{
"name": "CallStaticByteMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jbyte"
},
{
"name": "CallStaticCharMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jchar"
},
{
"name": "CallStaticCharMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jchar"
},
{
"name": "CallStaticCharMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jchar"
},
{
"name": "CallStaticShortMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jshort"
},
{
"name": "CallStaticShortMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jshort"
},
{
"name": "CallStaticShortMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jshort"
},
{
"name": "CallStaticIntMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jint"
},
{
"name": "CallStaticIntMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jint"
},
{
"name": "CallStaticIntMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jint"
},
{
"name": "CallStaticLongMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jlong"
},
{
"name": "CallStaticLongMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jlong"
},
{
"name": "CallStaticLongMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jlong"
},
{
"name": "CallStaticFloatMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jfloat"
},
{
"name": "CallStaticFloatMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jfloat"
},
{
"name": "CallStaticFloatMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jfloat"
},
{
"name": "CallStaticDoubleMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "jdouble"
},
{
"name": "CallStaticDoubleMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "jdouble"
},
{
"name": "CallStaticDoubleMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "jdouble"
},
{
"name": "CallStaticVoidMethod",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"..."
],
"ret": "void"
},
{
"name": "CallStaticVoidMethodV",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"va_list"
],
"ret": "void"
},
{
"name": "CallStaticVoidMethodA",
"args": [
"JNIEnv*",
"jclass",
"jmethodID",
"jvalue*"
],
"ret": "void"
},
{
"name": "GetStaticFieldID",
"args": [
"JNIEnv*",
"jclass",
"char*",
"char*"
],
"ret": "jfieldID"
},
{
"name": "GetStaticObjectField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jobject"
},
{
"name": "GetStaticBooleanField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jboolean"
},
{
"name": "GetStaticByteField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jbyte"
},
{
"name": "GetStaticCharField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jchar"
},
{
"name": "GetStaticShortField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jshort"
},
{
"name": "GetStaticIntField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jint"
},
{
"name": "GetStaticLongField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jlong"
},
{
"name": "GetStaticFloatField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jfloat"
},
{
"name": "GetStaticDoubleField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID"
],
"ret": "jdouble"
},
{
"name": "SetStaticObjectField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jobject"
],
"ret": "void"
},
{
"name": "SetStaticBooleanField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jboolean"
],
"ret": "void"
},
{
"name": "SetStaticByteField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jbyte"
],
"ret": "void"
},
{
"name": "SetStaticCharField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jchar"
],
"ret": "void"
},
{
"name": "SetStaticShortField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jshort"
],
"ret": "void"
},
{
"name": "SetStaticIntField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jint"
],
"ret": "void"
},
{
"name": "SetStaticLongField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jlong"
],
"ret": "void"
},
{
"name": "SetStaticFloatField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jfloat"
],
"ret": "void"
},
{
"name": "SetStaticDoubleField",
"args": [
"JNIEnv*",
"jclass",
"jfieldID",
"jdouble"
],
"ret": "void"
},
{
"name": "NewString",
"args": [
"JNIEnv*",
"jchar*",
"jsize"
],
"ret": "jstring"
},
{
"name": "GetStringLength",
"args": [
"JNIEnv*",
"jstring"
],
"ret": "jsize"
},
{
"name": "GetStringChars",
"args": [
"JNIEnv*",
"jstring",
"jboolean*"
],
"ret": "jchar"
},
{
"name": "ReleaseStringChars",
"args": [
"JNIEnv*",
"jstring",
"jchar*"
],
"ret": "void"
},
{
"name": "NewStringUTF",
"args": [
"JNIEnv*",
"char*"
],
"ret": "jstring"
},
{
"name": "GetStringUTFLength",
"args": [
"JNIEnv*",
"jstring"
],
"ret": "jsize"
},
{
"name": "GetStringUTFChars",
"args": [
"JNIEnv*",
"jstring",
"jboolean*"
],
"ret": "char*"
},
{
"name": "ReleaseStringUTFChars",
"args": [
"JNIEnv*",
"jstring",
"char*"
],
"ret": "void"
},
{
"name": "GetArrayLength",
"args": [
"JNIEnv*",
"jarray"
],
"ret": "jsize"
},
{
"name": "NewObjectArray",
"args": [
"JNIEnv*",
"jsize",
"jclass",
"jobject"
],
"ret": "jobjectArray"
},
{
"name": "GetObjectArrayElement",
"args": [
"JNIEnv*",
"jobjectArray",
"jsize"
],
"ret": "jobject"
},
{
"name": "SetObjectArrayElement",
"args": [
"JNIEnv*",
"jobjectArray",
"jsize",
"jobject"
],
"ret": "void"
},
{
"name": "NewBooleanArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jbooleanArray"
},
{
"name": "NewByteArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jbyteArray"
},
{
"name": "NewCharArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jcharArray"
},
{
"name": "NewShortArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jshortArray"
},
{
"name": "NewIntArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jintArray"
},
{
"name": "NewLongArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jlongArray"
},
{
"name": "NewFloatArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jfloatArray"
},
{
"name": "NewDoubleArray",
"args": [
"JNIEnv*",
"jsize"
],
"ret": "jdoubleArray"
},
{
"name": "GetBooleanArrayElements",
"args": [
"JNIEnv*",
"jbooleanArray",
"jboolean*"
],
"ret": "jboolean*"
},
{
"name": "GetByteArrayElements",
"args": [
"JNIEnv*",
"jbyteArray",
"jboolean*"
],
"ret": "jbyte*"
},
{
"name": "GetCharArrayElements",
"args": [
"JNIEnv*",
"jcharArray",
"jboolean*"
],
"ret": "jchar*"
},
{
"name": "GetShortArrayElements",
"args": [
"JNIEnv*",
"jshortArray",
"jboolean*"
],
"ret": "jshort*"
},
{
"name": "GetIntArrayElements",
"args": [
"JNIEnv*",
"jintArray",
"jboolean*"
],
"ret": "jint*"
},
{
"name": "GetLongArrayElements",
"args": [
"JNIEnv*",
"jlongArray",
"jboolean*"
],
"ret": "jlong*"
},
{
"name": "GetFloatArrayElements",
"args": [
"JNIEnv*",
"jfloatArray",
"jboolean*"
],
"ret": "jfloat*"
},
{
"name": "GetDoubleArrayElements",
"args": [
"JNIEnv*",
"jdoubleArray",
"jboolean*"
],
"ret": "jdouble*"
},
{
"name": "ReleaseBooleanArrayElements",
"args": [
"JNIEnv*",
"jbooleanArray",
"jboolean*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseByteArrayElements",
"args": [
"JNIEnv*",
"jbyteArray",
"jbyte*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseCharArrayElements",
"args": [
"JNIEnv*",
"jcharArray",
"jchar*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseShortArrayElements",
"args": [
"JNIEnv*",
"jshortArray",
"jshort*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseIntArrayElements",
"args": [
"JNIEnv*",
"jintArray",
"jint*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseLongArrayElements",
"args": [
"JNIEnv*",
"jlongArray",
"jlong*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseFloatArrayElements",
"args": [
"JNIEnv*",
"jfloatArray",
"jfloat*",
"jint"
],
"ret": "void"
},
{
"name": "ReleaseDoubleArrayElements",
"args": [
"JNIEnv*",
"jdoubleArray",
"jdouble*",
"jint"
],
"ret": "void"
},
{
"name": "GetBooleanArrayRegion",
"args": [
"JNIEnv*",
"jbooleanArray",
"jsize",
"jsize",
"jboolean*"
],
"ret": "void"
},
{
"name": "GetByteArrayRegion",
"args": [
"JNIEnv*",
"jbyteArray",
"jsize",
"jsize",
"jbyte*"
],
"ret": "void"
},
{
"name": "GetCharArrayRegion",
"args": [
"JNIEnv*",
"jcharArray",
"jsize",
"jsize",
"jchar*"
],
"ret": "void"
},
{
"name": "GetShortArrayRegion",
"args": [
"JNIEnv*",
"jshortArray",
"jsize",
"jsize",
"jshort*"
],
"ret": "void"
},
{
"name": "GetIntArrayRegion",
"args": [
"JNIEnv*",
"jintArray",
"jsize",
"jsize",
"jint*"
],
"ret": "void"
},
{
"name": "GetLongArrayRegion",
"args": [
"JNIEnv*",
"jlongArray",
"jsize",
"jsize",
"jlong*"
],
"ret": "void"
},
{
"name": "GetFloatArrayRegion",
"args": [
"JNIEnv*",
"jfloatArray",
"jsize",
"jsize",
"jfloat*"
],
"ret": "void"
},
{
"name": "GetDoubleArrayRegion",
"args": [
"JNIEnv*",
"jdoubleArray",
"jsize",
"jsize",
"jdouble*"
],
"ret": "void"
},
{
"name": "SetBooleanArrayRegion",
"args": [
"JNIEnv*",
"jbooleanArray",
"jsize",
"jsize",
"jboolean*"
],
"ret": "void"
},
{
"name": "SetByteArrayRegion",
"args": [
"JNIEnv*",
"jbyteArray",
"jsize",
"jsize",
"jbyte*"
],
"ret": "void"
},
{
"name": "SetCharArrayRegion",
"args": [
"JNIEnv*",
"jcharArray",
"jsize",
"jsize",
"jchar*"
],
"ret": "void"
},
{
"name": "SetShortArrayRegion",
"args": [
"JNIEnv*",
"jshortArray",
"jsize",
"jsize",
"jshort*"
],
"ret": "void"
},
{
"name": "SetIntArrayRegion",
"args": [
"JNIEnv*",
"jintArray",
"jsize",
"jsize",
"jint*"
],
"ret": "void"
},
{
"name": "SetLongArrayRegion",
"args": [
"JNIEnv*",
"jlongArray",
"jsize",
"jsize",
"jlong*"
],
"ret": "void"
},
{
"name": "SetFloatArrayRegion",
"args": [
"JNIEnv*",
"jfloatArray",
"jsize",
"jsize",
"jfloat*"
],
"ret": "void"
},
{
"name": "SetDoubleArrayRegion",
"args": [
"JNIEnv*",
"jdoubleArray",
"jsize",
"jsize",
"jdouble*"
],
"ret": "void"
},
{
"name": "RegisterNatives",
"args": [
"JNIEnv*",
"jclass",
"JNINativeMethod*",
"jint"
],
"ret": "jint"
},
{
"name": "UnregisterNatives",
"args": [
"JNIEnv*",
"jclass"
],
"ret": "jint"
},
{
"name": "MonitorEnter",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jint"
},
{
"name": "MonitorExit",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jint"
},
{
"name": "GetJavaVM",
"args": [
"JNIEnv*",
"JavaVM**"
],
"ret": "jint"
},
{
"name": "GetStringRegion",
"args": [
"JNIEnv*",
"jstring",
"jsize",
"jsize",
"jchar*"
],
"ret": "void"
},
{
"name": "GetStringUTFRegion",
"args": [
"JNIEnv*",
"jstring",
"jsize",
"jsize",
"char*"
],
"ret": "void"
},
{
"name": "GetPrimitiveArrayCritical",
"args": [
"JNIEnv*",
"jarray",
"jboolean*"
],
"ret": "void"
},
{
"name": "ReleasePrimitiveArrayCritical",
"args": [
"JNIEnv*",
"jarray",
"void*",
"jint"
],
"ret": "void"
},
{
"name": "GetStringCritical",
"args": [
"JNIEnv*",
"jstring",
"jboolean*"
],
"ret": "jchar"
},
{
"name": "ReleaseStringCritical",
"args": [
"JNIEnv*",
"jstring",
"jchar*"
],
"ret": "void"
},
{
"name": "NewWeakGlobalRef",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jweak"
},
{
"name": "DeleteWeakGlobalRef",
"args": [
"JNIEnv*",
"jweak"
],
"ret": "void"
},
{
"name": "ExceptionCheck",
"args": [
"JNIEnv*"
],
"ret": "jboolean"
},
{
"name": "NewDirectByteBuffer",
"args": [
"JNIEnv*",
"void*",
"jlong"
],
"ret": "jobject"
},
{
"name": "GetDirectBufferAddress",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "void"
},
{
"name": "GetDirectBufferCapacity",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jlong"
},
{
"name": "GetObjectRefType",
"args": [
"JNIEnv*",
"jobject"
],
"ret": "jobjectRefType"
}
]
},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jni_env_interceptor_1 = require("../jni_env_interceptor");
class JNIEnvInterceptorARM64 extends jni_env_interceptor_1.JNIEnvInterceptor {
constructor(references, threads, transport) {
super(references, threads, transport);
this.stack = NULL;
this.stackIndex = 0;
this.grTop = NULL;
this.vrTop = NULL;
this.grOffs = 0;
this.grOffsIndex = 0;
this.vrOffs = 0;
this.vrOffsIndex = 0;
}
createStubFunction() {
const stub = Memory.alloc(Process.pageSize);
Memory.patchCode(stub, Process.pageSize, (code) => {
const cw = new Arm64Writer(code, { pc: stub });
const RET = 0xd65f03c0;
cw.putInstruction(RET);
});
return stub;
}
buildVaArgParserShellcode(text, data, parser) {
const DATA_OFFSET = 0x400;
const BITS_IN_BYTE = 8;
const HALF = 2;
const NUM_REGS = 31;
const NUM_REG_NO_LR = 30;
text.add(DATA_OFFSET).writePointer(parser);
Memory.patchCode(text, Process.pageSize, (code) => {
const cw = new Arm64Writer(code, { pc: text });
const ADRP_X0_0 = 0x90000000;
cw.putInstruction(ADRP_X0_0);
for (let i = 1; i < NUM_REGS; i++) {
let ins = 0xF9000000;
ins += i;
const base = 0x408;
const offset = base + i * Process.pointerSize;
ins += offset / HALF << BITS_IN_BYTE;
cw.putInstruction(ins);
}
const LDR_X0_X0_400 = 0xF9420000;
cw.putInstruction(LDR_X0_X0_400);
const BLR_X0 = 0xD63F0000;
cw.putInstruction(BLR_X0);
cw.putPushRegReg("x0", "sp");
cw.putInstruction(ADRP_X0_0);
for (let i = 1; i < NUM_REG_NO_LR; i++) {
let ins = 0xF9400000;
ins += i;
const base = 0x408;
const offset = base + i * Process.pointerSize;
ins += offset / HALF << BITS_IN_BYTE;
cw.putInstruction(ins);
}
cw.putPopRegReg("x0", "sp");
cw.putInstruction(BLR_X0);
const ADRP_X1_0 = 0x90000001;
cw.putInstruction(ADRP_X1_0);
const LDR_X2_X1_4F8 = 0xF9427C22;
cw.putInstruction(LDR_X2_X1_4F8);
const BR_X2 = 0xD61F0040;
cw.putInstruction(BR_X2);
cw.flush();
});
}
setUpVaListArgExtract(vaList) {
const vrStart = 2;
const grOffset = 3;
const vrOffset = 4;
this.stack = vaList.readPointer();
this.stackIndex = 0;
this.grTop = vaList.add(Process.pointerSize).readPointer();
this.vrTop = vaList.add(Process.pointerSize * vrStart).readPointer();
this.grOffs = vaList.add(Process.pointerSize * grOffset).readS32();
this.grOffsIndex = 0;
this.vrOffs = vaList.add(Process.pointerSize * grOffset + vrOffset).readS32();
this.vrOffsIndex = 0;
}
extractVaListArgValue(method, paramId) {
const MAX_VR_REG_NUM = 8;
const VR_REG_SIZE = 2;
const MAX_GR_REG_NUM = 4;
let currentPtr = NULL;
if (method.fridaParams[paramId] === "float" ||
method.fridaParams[paramId] === "double") {
if (this.vrOffsIndex < MAX_VR_REG_NUM) {
currentPtr = this.vrTop
.add(this.vrOffs)
.add(this.vrOffsIndex * Process.pointerSize * VR_REG_SIZE);
this.vrOffsIndex++;
}
else {
currentPtr = this.stack.add(this.stackIndex * Process.pointerSize);
this.stackIndex++;
}
}
else {
if (this.grOffsIndex < MAX_GR_REG_NUM) {
currentPtr = this.grTop
.add(this.grOffs)
.add(this.grOffsIndex * Process.pointerSize);
this.grOffsIndex++;
}
else {
currentPtr = this.stack.add(this.stackIndex * Process.pointerSize);
this.stackIndex++;
}
}
return currentPtr;
}
resetVaListArgExtract() {
this.stack = NULL;
this.stackIndex = 0;
this.grTop = NULL;
this.vrTop = NULL;
this.grOffs = 0;
this.grOffsIndex = 0;
this.vrOffs = 0;
this.vrOffsIndex = 0;
}
}
exports.JNIEnvInterceptorARM64 = JNIEnvInterceptorARM64;
;
},{"../jni_env_interceptor":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jni_env_interceptor_1 = require("../jni_env_interceptor");
const types_1 = require("../../utils/types");
class JNIEnvInterceptorARM extends jni_env_interceptor_1.JNIEnvInterceptor {
constructor(references, threads, transport) {
super(references, threads, transport);
this.vaList = NULL;
this.vaListOffset = 0;
}
createStubFunction() {
const stub = Memory.alloc(Process.pageSize);
Memory.patchCode(stub, Process.pageSize, (code) => {
const cw = new ArmWriter(code, { pc: stub });
const PUSH_LR = 0xe52de004;
cw.putInstruction(PUSH_LR);
const POP_PC = 0xe49df004;
cw.putInstruction(POP_PC);
});
return stub;
}
buildVaArgParserShellcode(text, data, parser) {
const DATA_OFFSET = 0x400;
text.add(DATA_OFFSET).writePointer(parser);
Memory.patchCode(text, Process.pageSize, (code) => {
const cw = new ArmWriter(code, { pc: text });
cw.putNop();
cw.putNop();
cw.putNop();
cw.putNop();
const STR_R0_400 = 0xe58f0400;
cw.putInstruction(STR_R0_400);
const STR_R1_400 = 0xe58f1400;
cw.putInstruction(STR_R1_400);
const STR_R2_400 = 0xe58f2400;
cw.putInstruction(STR_R2_400);
const STR_R3_400 = 0xe58f3400;
cw.putInstruction(STR_R3_400);
const STR_LR_400 = 0xe58fe400;
cw.putInstruction(STR_LR_400);
const LDR_R0_3E4 = 0xe59f03d4;
cw.putInstruction(LDR_R0_3E4);
const BLX_R0 = 0xe12fff30;
cw.putInstruction(BLX_R0);
const LDR_R1_3E0 = 0xe59f13e8;
cw.putInstruction(LDR_R1_3E0);
const LDR_R2_3E0 = 0xe59f23e8;
cw.putInstruction(LDR_R2_3E0);
const LDR_R3_3E0 = 0xe59f33e8;
cw.putInstruction(LDR_R3_3E0);
cw.putInstruction(BLX_R0);
const LDR_R1_3E4 = 0xe59f13e4;
cw.putInstruction(LDR_R1_3E4);
const BX_R1 = 0xe12fff11;
cw.putInstruction(BX_R1);
cw.flush();
});
}
setUpVaListArgExtract(vaList) {
this.vaList = vaList;
this.vaListOffset = 0;
}
extractVaListArgValue(method, paramId) {
const currentPtr = this.vaList.add(this.vaListOffset);
this.vaListOffset += types_1.Types.sizeOf(method.fridaParams[paramId]);
return currentPtr;
}
resetVaListArgExtract() {
this.vaList = NULL;
this.vaListOffset = 0;
}
}
exports.JNIEnvInterceptorARM = JNIEnvInterceptorARM;
},{"../../utils/types":17,"../jni_env_interceptor":7}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const java_vm_json_1 = __importDefault(require("../data/java_vm.json"));
class JavaVM {
constructor() {
this._methods = java_vm_json_1.default;
}
get methods() {
return this._methods;
}
static getInstance() {
if (JavaVM.instance === undefined) {
JavaVM.instance = new JavaVM();
}
return JavaVM.instance;
}
}
exports.JavaVM = JavaVM;
},{"../data/java_vm.json":1}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const java_vm_1 = require("./java_vm");
const types_1 = require("../utils/types");
const method_data_1 = require("../utils/method_data");
const JAVA_VM_INDEX = 0;
const COPY_ARRAY_INDEX = 0;
const JNI_OK = 0;
const JNI_ENV_INDEX = 1;
class JavaVMInterceptor {
constructor(references, threads, transport, jniEnvInterceptor) {
this.references = references;
this.threads = threads;
this.transport = transport;
this.jniEnvInterceptor = jniEnvInterceptor;
this.shadowJavaVM = NULL;
}
isInitialised() {
return !this.shadowJavaVM.isNull();
}
get() {
return this.shadowJavaVM;
}
create() {
const javaVMOffset = 3;
const javaVMLength = 8;
const javaVM = this.threads.getJavaVM();
const newJavaVMStruct = Memory.alloc(Process.pointerSize * javaVMLength);
this.references.add(newJavaVMStruct);
const newJavaVM = Memory.alloc(Process.pointerSize);
newJavaVM.writePointer(newJavaVMStruct);
for (let i = javaVMOffset; i < javaVMLength; i++) {
const offset = i * Process.pointerSize;
const javaVMStruct = javaVM.readPointer();
const methodAddr = javaVMStruct.add(offset).readPointer();
const callback = this.createJavaVMIntercept(i, methodAddr);
const trampoline = this.jniEnvInterceptor.createStubFunction();
this.references.add(trampoline);
Interceptor.replace(trampoline, callback);
newJavaVMStruct.add(offset).writePointer(trampoline);
}
this.shadowJavaVM = newJavaVM;
return newJavaVM;
}
createJavaVMIntercept(id, methodAddr) {
const self = this;
const method = java_vm_1.JavaVM.getInstance().methods[id];
const fridaArgs = method.args.map((a) => types_1.Types.convertNativeJTypeToFridaType(a));
const fridaRet = types_1.Types.convertNativeJTypeToFridaType(method.ret);
const nativeFunction = new NativeFunction(methodAddr, fridaRet, fridaArgs);
const nativeCallback = new NativeCallback(function () {
const threadId = this.threadId;
const javaVM = self.threads.getJavaVM();
let localArgs = [].slice.call(arguments);
let jniEnv = NULL;
localArgs[JAVA_VM_INDEX] = javaVM;
const clonedArgs = localArgs.slice(COPY_ARRAY_INDEX);
const ret = nativeFunction.apply(null, localArgs);
const data = new method_data_1.MethodData(method, clonedArgs, ret);
self.transport.reportJavaVMCall(data, this.context);
if (method.name === "GetEnv" ||
method.name === "AttachCurrentThread" ||
method.name === "AttachCurrentThreadAsDaemon") {
if (ret === JNI_OK) {
self.threads.setJNIEnv(threadId, localArgs[JNI_ENV_INDEX].readPointer());
}
if (!self.jniEnvInterceptor.isInitialised()) {
jniEnv = self.jniEnvInterceptor.create();
}
else {
jniEnv = self.jniEnvInterceptor.get();
}
localArgs[JNI_ENV_INDEX].writePointer(jniEnv);
}
return ret;
}, fridaRet, fridaArgs);
this.references.add(nativeCallback);
return nativeCallback;
}
}
exports.JavaVMInterceptor = JavaVMInterceptor;
;
},{"../utils/method_data":15,"../utils/types":17,"./java_vm":5}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../utils/types");
const java_method_1 = require("../utils/java_method");
const method_data_1 = require("../utils/method_data");
const config_1 = require("../utils/config");
const jni_env_json_1 = __importDefault(require("../data/jni_env.json"));
const TYPE_NAME_START = 0;
const TYPE_NAME_END = -1;
const COPY_ARRAY_INDEX = 0;
const JNI_ENV_INDEX = 0;
class JNIEnvInterceptor {
constructor(references, threads, transport) {
this.shadowJNIEnv = NULL;
this.methods = {};
this.fastMethodLookup = {};
this.vaArgsBacktraces = {};
this.references = references;
this.threads = threads;
this.transport = transport;
this.javaVMInterceptor = null;
this.vaArgsBacktraces = {};
}
isInitialised() {
return !this.shadowJNIEnv.equals(NULL);
}
get() {
return this.shadowJNIEnv;
}
create() {
const END_INDEX = 1;
const threadId = Process.getCurrentThreadId();
const jniEnv = this.threads.getJNIEnv(threadId);
const jniEnvOffset = 4;
const jniEnvLength = 232;
const newJNIEnvStruct = Memory.alloc(Process.pointerSize * jniEnvLength);
this.references.add(newJNIEnvStruct);
const newJNIEnv = Memory.alloc(Process.pointerSize);
newJNIEnv.writePointer(newJNIEnvStruct);
this.references.add(newJNIEnv);
for (let i = jniEnvOffset; i < jniEnvLength; i++) {
const method = jni_env_json_1.default[i];
const offset = i * Process.pointerSize;
const jniEnvStruct = jniEnv.readPointer();
const methodAddr = jniEnvStruct.add(offset).readPointer();
if (method.args[method.args.length - END_INDEX] === "...") {
const callback = this.createJNIVarArgIntercept(i, methodAddr);
const trampoline = this.createStubFunction();
this.references.add(trampoline);
Interceptor.replace(trampoline, callback);
newJNIEnvStruct.add(offset).writePointer(trampoline);
}
else {
const callback = this.createJNIIntercept(i, methodAddr);
const trampoline = this.createStubFunction();
this.references.add(trampoline);
Interceptor.replace(trampoline, callback);
newJNIEnvStruct.add(offset).writePointer(trampoline);
}
}
this.shadowJNIEnv = newJNIEnv;
return newJNIEnv;
}
setJavaVMInterceptor(javaVMInterceptor) {
this.javaVMInterceptor = javaVMInterceptor;
}
createStubFunction() {
return new NativeCallback(() => { }, 'void', []);
}
createJNIVarArgIntercept(id, methodPtr) {
const self = this;
const method = jni_env_json_1.default[id];
const text = Memory.alloc(Process.pageSize);
const data = Memory.alloc(Process.pageSize);
this.references.add(text);
this.references.add(data);
const vaArgsCallback = this.createJNIVarArgInitialCallback(method, methodPtr);
this.references.add(vaArgsCallback);
self.buildVaArgParserShellcode(text, data, vaArgsCallback);
const config = config_1.Config.getInstance();
Interceptor.attach(text, function () {
let backtraceType = Backtracer.ACCURATE;
if (config.backtrace === "fuzzy") {
backtraceType = config.backtrace;
}
self.vaArgsBacktraces[this.threadId] =
Thread.backtrace(this.context, backtraceType);
});
return text;
}
addJavaArgsForJNIIntercept(method, args) {
const LAST_INDEX = -1;
const FIRST_INDEX = 0;
const METHOD_ID_INDEX = 2;
const lastParamType = method.args.slice(LAST_INDEX)[FIRST_INDEX];
if (!["va_list", "jvalue*"].includes(lastParamType)) {
return args.slice(COPY_ARRAY_INDEX);
}
const clonedArgs = args.slice(COPY_ARRAY_INDEX);
const midPtr = args[METHOD_ID_INDEX];
const javaMethod = this.methods[midPtr.toString()];
const nativeJTypes = javaMethod.nativeParams;
const readPtr = args.slice(LAST_INDEX)[FIRST_INDEX];
if (lastParamType === "va_list") {
this.setUpVaListArgExtract(readPtr);
}
const UNION_SIZE = 8;
for (let i = 0; i < nativeJTypes.length; i++) {
const type = types_1.Types.convertNativeJTypeToFridaType(nativeJTypes[i]);
let val;
if (lastParamType === "va_list") {
const currentPtr = this.extractVaListArgValue(javaMethod, i);
val = this.readValue(currentPtr, type, true);
}
else {
val = this.readValue(readPtr.add(UNION_SIZE * i), type);
}
clonedArgs.push(val);
}
if (lastParamType === "va_list") {
this.resetVaListArgExtract();
}
return clonedArgs;
}
handleGetMethodResult(args, ret) {
const SIG_INDEX = 3;
const signature = args[SIG_INDEX].readCString();
if (signature !== null) {
const methodSig = new java_method_1.JavaMethod(signature);
this.methods[ret.toString()] = methodSig;
}
}
handleGetJavaVM(args, ret) {
if (this.javaVMInterceptor !== null) {
const JNI_OK = 0;
const JAVA_VM_INDEX = 1;
if (ret === JNI_OK) {
const javaVMPtr = args[JAVA_VM_INDEX];
this.threads.setJavaVM(javaVMPtr.readPointer());
let javaVM;
if (!this.javaVMInterceptor.isInitialised()) {
javaVM = this.javaVMInterceptor.create();
}
else {
javaVM = this.javaVMInterceptor.get();
}
javaVMPtr.writePointer(javaVM);
}
}
}
handleRegisterNatives(args) {
const METHOD_INDEX = 2;
const SIZE_INDEX = 3;
const JNI_METHOD_SIZE = 3;
const self = this;
const methods = args[METHOD_INDEX];
const size = args[SIZE_INDEX];
for (let i = 0; i < size * JNI_METHOD_SIZE; i += JNI_METHOD_SIZE) {
const methodsPtr = methods;
const namePtr = methodsPtr
.add(i * Process.pointerSize)
.readPointer();
const name = namePtr.readCString();
const sigOffset = 1;
const sigPtr = methodsPtr
.add((i + sigOffset) * Process.pointerSize)
.readPointer();
const sig = sigPtr.readCString();
const addrOffset = 2;
const addr = methodsPtr
.add((i + addrOffset) * Process.pointerSize)
.readPointer();
if (name === null || sig === null) {
continue;
}
Interceptor.attach(addr, {
onEnter(args) {
const check = name + sig;
const config = config_1.Config.getInstance();
const EMPTY_ARRAY_LEN = 0;
if (config.includeExport.length > EMPTY_ARRAY_LEN) {
const included = config.includeExport.filter((i) => check.includes(i));
if (included.length === EMPTY_ARRAY_LEN) {
return;
}
}
if (config.excludeExport.length > EMPTY_ARRAY_LEN) {
const excluded = config.excludeExport.filter((e) => check.includes(e));
if (excluded.length > EMPTY_ARRAY_LEN) {
return;
}
}
if (!self.threads.hasJNIEnv(this.threadId)) {
self.threads.setJNIEnv(this.threadId, args[JNI_ENV_INDEX]);
}
args[JNI_ENV_INDEX] = self.shadowJNIEnv;
}
});
}
}
handleJNIInterceptResult(method, args, ret) {
const name = method.name;
if (["GetMethodID", "GetStaticMethodID"].includes(name)) {
this.handleGetMethodResult(args, ret);
}
else if (method.name === "GetJavaVM") {
this.handleGetJavaVM(args, ret);
}
else if (method.name === "RegisterNatives") {
this.handleRegisterNatives(args);
}
}
createJNIIntercept(id, methodPtr) {
const self = this;
const METHOD_ID_INDEX = 2;
const method = jni_env_json_1.default[id];
const paramTypes = method.args.map((t) => types_1.Types.convertNativeJTypeToFridaType(t));
const retType = types_1.Types.convertNativeJTypeToFridaType(method.ret);
const nativeFunction = new NativeFunction(methodPtr, retType, paramTypes);
const nativeCallback = new NativeCallback(function () {
const threadId = this.threadId;
const jniEnv = self.threads.getJNIEnv(threadId);
const args = [].slice.call(arguments);
args[JNI_ENV_INDEX] = jniEnv;
const clonedArgs = self.addJavaArgsForJNIIntercept(method, args);
const ret = nativeFunction.apply(null, args);
let jmethod = undefined;
if (args.length !== clonedArgs.length) {
const key = args[METHOD_ID_INDEX].toString();
jmethod = self.methods[key];
}
const data = new method_data_1.MethodData(method, clonedArgs, ret, jmethod);
self.transport.reportJNIEnvCall(data, this.context);
self.handleJNIInterceptResult(method, args, ret);
return ret;
}, retType, paramTypes);
this.references.add(nativeCallback);
return nativeCallback;
}
createJNIVarArgMainCallback(method, methodPtr, initialparamTypes, mainParamTypes, retType) {
const self = this;
const mainCallback = new NativeCallback(function () {
const METHOD_ID_INDEX = 2;
const threadId = this.threadId;
const args = [].slice.call(arguments);
const jniEnv = self.threads.getJNIEnv(threadId);
const key = args[METHOD_ID_INDEX].toString();
const jmethod = self.methods[key];
args[JNI_ENV_INDEX] = jniEnv;
const ret = new NativeFunction(methodPtr, retType, initialparamTypes).apply(null, args);
const data = new method_data_1.MethodData(method, args, ret, jmethod);
self.transport.reportJNIEnvCall(data, self.vaArgsBacktraces[this.threadId]);
delete self.vaArgsBacktraces[this.threadId];
return ret;
}, retType, mainParamTypes);
return mainCallback;
}
createJNIVarArgInitialCallback(method, methodPtr) {
const self = this;
const vaArgsCallback = new NativeCallback(function () {
const METHOD_ID_INDEX = 2;
const methodId = arguments[METHOD_ID_INDEX];
const javaMethod = self.methods[methodId];
if (self.fastMethodLookup[methodId] !== undefined) {
return self.fastMethodLookup[methodId];
}
const originalParams = method.args
.slice(TYPE_NAME_START, TYPE_NAME_END)
.map((t) => types_1.Types.convertNativeJTypeToFridaType(t));
const callbackParams = originalParams.slice(COPY_ARRAY_INDEX);
originalParams.push("...");
javaMethod.fridaParams.forEach((p) => {
callbackParams.push(p === "float" ? "double" : p);
originalParams.push(p);
});
const retType = types_1.Types.convertNativeJTypeToFridaType(method.ret);
const mainCallback = self.createJNIVarArgMainCallback(method, methodPtr, originalParams, callbackParams, retType);
self.references.add(mainCallback);
self.fastMethodLookup[methodId] = mainCallback;
return mainCallback;
}, "pointer", ["pointer", "pointer", "pointer"]);
return vaArgsCallback;
}
readValue(currentPtr, type, extend) {
let val = NULL;
if (type === "char") {
val = currentPtr.readS8();
}
else if (type === "int16") {
val = currentPtr.readS16();
}
else if (type === "uint16") {
val = currentPtr.readU16();
}
else if (type === "int") {
val = currentPtr.readS32();
}
else if (type === "int64") {
val = currentPtr.readS64();
}
else if (type === "float") {
if (extend === true) {
val = currentPtr.readDouble();
}
else {
val = currentPtr.readFloat();
}
}
else if (type === "double") {
val = currentPtr.readDouble();
}
else if (type === "pointer") {
val = currentPtr.readPointer();
}
return val;
}
}
exports.JNIEnvInterceptor = JNIEnvInterceptor;
;
},{"../data/jni_env.json":2,"../utils/config":13,"../utils/java_method":14,"../utils/method_data":15,"../utils/types":17}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JNIThreadManager {
constructor() {
this.threads = {};
this.shadowJavaVM = NULL;
}
getJavaVM() {
return this.shadowJavaVM;
}
hasJavaVM() {
return !this.shadowJavaVM.isNull();
}
setJavaVM(javaVM) {
this.shadowJavaVM = javaVM;
}
getJNIEnv(threadId) {
if (this.threads[threadId] !== undefined) {
return this.threads[threadId];
}
else {
return NULL;
}
}
hasJNIEnv(threadId) {
return !this.getJNIEnv(threadId).isNull();
}
setJNIEnv(threadId, jniEnv) {
this.createEntry(threadId, jniEnv);
}
needsJNIEnvUpdate(threadId, jniEnv) {
const entry = this.getEntry(threadId);
if (entry === undefined || !entry.equals(jniEnv)) {
return true;
}
return false;
}
createEntry(threadId, jniEnv) {
this.threads[threadId] = jniEnv;
}
getEntry(threadId) {
return this.threads[threadId];
}
}
exports.JNIThreadManager = JNIThreadManager;
;
},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jni_env_interceptor_1 = require("../jni_env_interceptor");
class JNIEnvInterceptorX64 extends jni_env_interceptor_1.JNIEnvInterceptor {
constructor(references, threads, transport) {
super(references, threads, transport);
this.grOffset = 0;
this.grOffsetStart = 0;
this.fpOffset = 0;
this.fpOffsetStart = 0;
this.overflowPtr = NULL;
this.dataPtr = NULL;
}
buildVaArgParserShellcode(text, data, parser) {
Memory.patchCode(text, Process.pageSize, (code) => {
const cw = new X86Writer(code, { pc: text });
const XMM_INC_VALUE = 8;
const SKIP_FIRST_REG = 1;
const XMM_MOV_INS_1 = 0x66;
const XMM_MOV_INS_2 = 0x48;
const XMM_MOV_INS_3 = 0x0f;
const XMM_MOV_TO_INS_4 = 0x7e;
const XMM_MOV_INS_5 = 0xc7;
const regs = [
"rdi", "rsi", "rdx", "rcx", "r8", "r9", "rax",
"rbx", "r10", "r11", "r12", "r13", "r14", "r15",
"xmm0", "xmm1", "xmm2", "xmm3", "xmm4", "xmm5",
"xmm6", "xmm7"
];
let dataOffset = 0;
let xmmOffset = 0;
for (let i = 0; i < regs.length; i++) {
cw.putMovNearPtrReg(data.add(dataOffset), "rdi");
dataOffset += Process.pointerSize;
if (i < regs.length - SKIP_FIRST_REG) {
if (regs[i + SKIP_FIRST_REG].includes("xmm")) {
cw.putU8(XMM_MOV_INS_1);
cw.putU8(XMM_MOV_INS_2);
cw.putU8(XMM_MOV_INS_3);
cw.putU8(XMM_MOV_TO_INS_4);
cw.putU8(XMM_MOV_INS_5 + xmmOffset * XMM_INC_VALUE);
xmmOffset++;
}
else {
cw.putMovRegReg("rdi", regs[i + SKIP_FIRST_REG]);
}
}
}
xmmOffset--;
cw.putPopReg("rdi");
cw.putMovNearPtrReg(data.add(dataOffset), "rdi");
dataOffset += Process.pointerSize;
cw.putCallAddress(parser);
cw.putMovNearPtrReg(data.add(dataOffset), "rax");
dataOffset += Process.pointerSize;
const REG_SIZE = 2;
const END_INDEX = 1;
const SKIP_FIRST_COPY = 0;
const FIRST_ELEM_INDEX = 0;
const XMM_MOV_FROM_INS_4 = 0x6e;
let regRestoreOffset = dataOffset - Process.pointerSize * REG_SIZE;
for (let i = regs.length - END_INDEX; i >= FIRST_ELEM_INDEX; i--) {
regRestoreOffset = i * Process.pointerSize;
cw.putMovRegNearPtr("rdi", data.add(regRestoreOffset));
if (i > SKIP_FIRST_COPY) {
if (regs[i].includes("xmm")) {
cw.putU8(XMM_MOV_INS_1);
cw.putU8(XMM_MOV_INS_2);
cw.putU8(XMM_MOV_INS_3);
cw.putU8(XMM_MOV_FROM_INS_4);
cw.putU8(XMM_MOV_INS_5 + xmmOffset * XMM_INC_VALUE);
xmmOffset--;
}
else {
cw.putMovRegReg(regs[i], "rdi");
}
}
}
cw.putMovNearPtrReg(data.add(dataOffset), "rdi");
const rdiBackup = dataOffset;
dataOffset += Process.pointerSize;
const cbAddressOffset = rdiBackup - Process.pointerSize;
cw.putMovRegNearPtr("rdi", data.add(cbAddressOffset));
cw.putMovNearPtrReg(data.add(dataOffset), "r13");
const r13Backup = dataOffset;
cw.putMovRegReg("r13", "rdi");
cw.putMovRegNearPtr("rdi", data.add(rdiBackup));
cw.putCallReg("r13");
cw.putMovRegNearPtr("r13", data.add(r13Backup));
const retAddressOffset = cbAddressOffset - Process.pointerSize;
cw.putJmpNearPtr(data.add(retAddressOffset));
cw.flush();
});
}
setUpVaListArgExtract(vaList) {
const FP_OFFSET = 4;
const DATA_OFFSET = 2;
this.grOffset = vaList.readU32();
this.grOffsetStart = this.grOffset;
this.fpOffset = vaList.add(FP_OFFSET).readU32();
this.fpOffsetStart = this.fpOffset;
this.overflowPtr = vaList.add(Process.pointerSize).readPointer();
this.dataPtr = vaList.add(Process.pointerSize * DATA_OFFSET)
.readPointer();
}
extractVaListArgValue(method, paramId) {
const FP_REG_SIZE = 2;
const MAX_GR_REG_NUM = 2;
const MAX_FP_REG_NUM = 14;
const OFFSET = 1;
let currentPtr = NULL;
if (method.fridaParams[paramId] === "float" ||
method.fridaParams[paramId] === "double") {
const fpDelta = this.fpOffset - this.fpOffsetStart;
if (fpDelta / Process.pointerSize < MAX_FP_REG_NUM) {
currentPtr = this.dataPtr.add(this.fpOffset);
this.fpOffset += Process.pointerSize * FP_REG_SIZE;
}
else {
const reverseId = method.fridaParams.length - paramId - OFFSET;
currentPtr = this.overflowPtr.add(reverseId * Process.pointerSize);
}
}
else {
const grDelta = this.grOffset - this.grOffsetStart;
if (grDelta / Process.pointerSize < MAX_GR_REG_NUM) {
currentPtr = this.dataPtr.add(this.grOffset);
this.grOffset += Process.pointerSize;
}
else {
const reverseId = method.fridaParams.length - paramId - OFFSET;
currentPtr = this.overflowPtr.add(reverseId * Process.pointerSize);
}
}
return currentPtr;
}
resetVaListArgExtract() {
this.grOffset = 0;
this.grOffsetStart = 0;
this.fpOffset = 0;
this.fpOffsetStart = 0;
this.overflowPtr = NULL;
this.dataPtr = NULL;
}
}
exports.JNIEnvInterceptorX64 = JNIEnvInterceptorX64;
;
},{"../jni_env_interceptor":7}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jni_env_interceptor_1 = require("../jni_env_interceptor");
const types_1 = require("../../utils/types");
class JNIEnvInterceptorX86 extends jni_env_interceptor_1.JNIEnvInterceptor {
constructor(references, threads, transport) {
super(references, threads, transport);
this.vaList = NULL;
this.vaListOffset = 0;
}
buildVaArgParserShellcode(text, data, parser) {
const DATA_OFFSET = 0x400;
text.add(DATA_OFFSET).writePointer(parser);
Memory.patchCode(text, Process.pageSize, (code) => {
const cw = new X86Writer(code, { pc: text });
const dataOffset = DATA_OFFSET + Process.pointerSize;
cw.putPopReg("eax");
cw.putMovNearPtrReg(text.add(dataOffset + Process.pointerSize), "eax");
cw.putCallAddress(parser);
cw.putCallReg("eax");
cw.putJmpNearPtr(text.add(dataOffset + Process.pointerSize));
cw.flush();
});
}
setUpVaListArgExtract(vaList) {
this.vaList = vaList;
this.vaListOffset = 0;
}
extractVaListArgValue(method, paramId) {
let currentPtr = this.vaList.add(this.vaListOffset);
this.vaListOffset += types_1.Types.sizeOf(method.fridaParams[paramId]);
return currentPtr;
}
resetVaListArgExtract() {
this.vaList = NULL;
this.vaListOffset = 0;
}
}
exports.JNIEnvInterceptorX86 = JNIEnvInterceptorX86;
;
},{"../../utils/types":17,"../jni_env_interceptor":7}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reference_manager_1 = require("./utils/reference_manager");
const config_1 = require("./utils/config");
const data_transport_1 = require("./transport/data_transport");
const jni_env_interceptor_x86_1 = require("./jni/x86/jni_env_interceptor_x86");
const jni_env_interceptor_x64_1 = require("./jni/x64/jni_env_interceptor_x64");
const jni_env_interceptor_arm_1 = require("./jni/arm/jni_env_interceptor_arm");
const jni_env_interceptor_arm64_1 = require("./jni/arm64/jni_env_interceptor_arm64");
const java_vm_interceptor_1 = require("./jni/java_vm_interceptor");
const jni_thread_manager_1 = require("./jni/jni_thread_manager");
const IS_IN_REPL = true;
const JNI_ENV_INDEX = 0;
const JAVA_VM_INDEX = 0;
const LIB_TRACK_FIRST_INDEX = 0;
const threads = new jni_thread_manager_1.JNIThreadManager();
const references = new reference_manager_1.ReferenceManager();
const transport = new data_transport_1.DataTransport(threads);
let jniEnvInterceptor = undefined;
if (Process.arch === "ia32") {
jniEnvInterceptor = new jni_env_interceptor_x86_1.JNIEnvInterceptorX86(references, threads, transport);
}
else if (Process.arch === "x64") {
jniEnvInterceptor = new jni_env_interceptor_x64_1.JNIEnvInterceptorX64(references, threads, transport);
}
else if (Process.arch === "arm") {
jniEnvInterceptor = new jni_env_interceptor_arm_1.JNIEnvInterceptorARM(references, threads, transport);
}
else if (Process.arch === "arm64") {
jniEnvInterceptor = new jni_env_interceptor_arm64_1.JNIEnvInterceptorARM64(references, threads, transport);
}
if (jniEnvInterceptor === undefined) {
throw new Error(Process.arch + " currently unsupported, please file an issue.");
}
const javaVMInterceptor = new java_vm_interceptor_1.JavaVMInterceptor(references, threads, transport, jniEnvInterceptor);
jniEnvInterceptor.setJavaVMInterceptor(javaVMInterceptor);
let config = config_1.Config.getInstance();
const trackedLibs = {};
const libBlacklist = {};
function checkLibrary(path) {
const EMPTY_ARRAY_LENGTH = 0;
const ONE_ELEMENT_ARRAY_LENGTH = 1;
let willFollowLib = false;
if (!IS_IN_REPL && !config_1.Config.initialised()) {
const op = recv("config", (message) => {
config = config_1.Config.getInstance(message.payload.libraries, message.payload.backtrace, message.payload.show_data, message.payload.include, message.payload.exclude, message.payload.include_export, message.payload.exclude_export, message.payload.env, message.payload.vm);
});
op.wait();
}
if (config.libsToTrack.length === ONE_ELEMENT_ARRAY_LENGTH) {
if (config.libsToTrack[LIB_TRACK_FIRST_INDEX] === "*") {
willFollowLib = true;
}
}
if (!willFollowLib) {
willFollowLib = config.libsToTrack.filter((l) => path.includes(l)).length > EMPTY_ARRAY_LENGTH;
}
if (willFollowLib) {
send({
type: "tracked_library",
library: path
});
}
return willFollowLib;
}
function interceptJNIOnLoad(jniOnLoadAddr) {
return Interceptor.attach(jniOnLoadAddr, {
onEnter(args) {
let shadowJavaVM = NULL;
const javaVM = ptr(args[JAVA_VM_INDEX].toString());
if (!threads.hasJavaVM()) {
threads.setJavaVM(javaVM);
}
if (!javaVMInterceptor.isInitialised()) {
shadowJavaVM = javaVMInterceptor.create();
}
else {
shadowJavaVM = javaVMInterceptor.get();
}
args[JAVA_VM_INDEX] = shadowJavaVM;
}
});
}
function interceptJNIFunction(jniFunctionAddr) {
return Interceptor.attach(jniFunctionAddr, {
onEnter(args) {
if (jniEnvInterceptor === undefined) {
return;
}
const threadId = this.threadId;
const jniEnv = ptr(args[JNI_ENV_INDEX].toString());
let shadowJNIEnv = NULL;
threads.setJNIEnv(threadId, jniEnv);
if (!jniEnvInterceptor.isInitialised()) {
shadowJNIEnv = jniEnvInterceptor.create();
}
else {
shadowJNIEnv = jniEnvInterceptor.get();
}
args[JNI_ENV_INDEX] = shadowJNIEnv;
}
});
}
const dlopenRef = Module.findExportByName(null, "dlopen");
const dlsymRef = Module.findExportByName(null, "dlsym");
const dlcloseRef = Module.findExportByName(null, "dlclose");
if (dlopenRef !== null && dlsymRef !== null && dlcloseRef !== null) {
const HANDLE_INDEX = 0;
const dlopen = new NativeFunction(dlopenRef, 'pointer', ['pointer', 'int']);
Interceptor.replace(dlopen, new NativeCallback((filename, mode) => {
const path = filename.readCString();
const retval = dlopen(filename, mode);
if (checkLibrary(path)) {
trackedLibs[retval.toString()] = true;
}
else {
libBlacklist[retval.toString()] = true;
}
return retval;
}, 'pointer', ['pointer', 'int']));
const dlsym = new NativeFunction(dlsymRef, "pointer", ["pointer", "pointer"]);
Interceptor.attach(dlsym, {
onEnter(args) {
const SYMBOL_INDEX = 1;
this.handle = ptr(args[HANDLE_INDEX].toString());
if (libBlacklist[this.handle]) {
return;
}
this.symbol = args[SYMBOL_INDEX].readCString();
},
onLeave(retval) {
if (retval.isNull() || libBlacklist[this.handle]) {
return;
}
const EMPTY_ARRAY_LEN = 0;
if (config.includeExport.length > EMPTY_ARRAY_LEN) {
const included = config.includeExport.filter((i) => this.symbol.includes(i));
if (included.length === EMPTY_ARRAY_LEN) {
return;
}
}
if (config.excludeExport.length > EMPTY_ARRAY_LEN) {
const excluded = config.excludeExport.filter((e) => this.symbol.includes(e));
if (excluded.length > EMPTY_ARRAY_LEN) {
return;
}
}
if (trackedLibs[this.handle] === undefined) {
const mod = Process.findModuleByAddress(retval);
if (mod !== null && checkLibrary(mod.path)) {
trackedLibs[this.handle] = true;
}
}
if (trackedLibs[this.handle] !== undefined) {
const symbol = this.symbol;
if (symbol === "JNI_OnLoad") {
interceptJNIOnLoad(ptr(retval.toString()));
}
else if (symbol.startsWith("Java_") === true) {
interceptJNIFunction(ptr(retval.toString()));
}
}
else {
let name = config.libsToTrack[HANDLE_INDEX];
if (name !== "*") {
const mod = Process.findModuleByAddress(retval);
if (mod === null) {
return;
}
name = mod.name;
}
if (config.libsToTrack.includes(name) || name === "*") {
interceptJNIFunction(ptr(retval.toString()));
}
}
}
});
const dlclose = new NativeFunction(dlcloseRef, "int", ["pointer"]);
Interceptor.attach(dlclose, {
onEnter(args) {
const handle = args[HANDLE_INDEX].toString();
if (trackedLibs[handle]) {
this.handle = handle;
}
},
onLeave(retval) {
if (this.handle !== undefined) {
if (retval.isNull()) {
delete trackedLibs[this.handle];
}
}
}
});
}
if (IS_IN_REPL) {
console.error("Welcome to jnitrace. Tracing is running...");
console.warn("NOTE: the recommended way to run this module is using the " +
"python wrapper. It provides nicely formated coloured output " +
"in the form of frida-trace. To get jnitrace run " +
"'pip install jnitrace' or go to " +
"'https:}
},{"./jni/arm/jni_env_interceptor_arm":4,"./jni/arm64/jni_env_interceptor_arm64":3,"./jni/java_vm_interceptor":6,"./jni/jni_thread_manager":8,"./jni/x64/jni_env_interceptor_x64":9,"./jni/x86/jni_env_interceptor_x86":10,"./transport/data_transport":12,"./utils/config":13,"./utils/reference_manager":16}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../utils/types");
const config_1 = require("../utils/config");
const JNI_OK = 0;
const TYPE_NAME_START = 0;
const TYPE_NAME_END = -1;
const SKIP_ENV_INDEX = 1;
const EMPTY_ARRAY_LEN = 0;
class NativeMethodJSONContainer {
constructor(name, sig, addr) {
this.name = name;
this.sig = sig;
this.addr = addr;
}
}
;
class DataJSONContainer {
constructor(value, data, dataIndex) {
const RET_INDEX = -1;
this.value = value;
if (data !== null) {
if (!(data instanceof ArrayBuffer)) {
this.data = data;
}
}
if (dataIndex !== undefined) {
if (dataIndex === RET_INDEX) {
this.has_data = true;
}
else {
this.data_for = dataIndex;
}
}
}
getMetadata() {
return this.metadata;
}
setMetadata(metadata) {
this.metadata = metadata;
}
}
;
class BacktraceJSONContainer {
constructor(address, module, symbol) {
this.address = address;
this.module = module;
this.symbol = symbol;
}
}
;
class RecordJSONContainer {
constructor(callType, method, args, ret, threadId, timestamp, javaParams, backtrace) {
this.type = "trace_data";
this.call_type = callType;
this.method = method;
this.args = args;
this.ret = ret;
this.thread_id = threadId;
this.timestamp = timestamp;
this.java_params = javaParams;
this.backtrace = backtrace;
}
}
;
class DataTransport {
constructor(threads) {
this.threads = threads;
this.start = Date.now();
this.byteArraySizes = {};
this.jobjects = {};
this.jfieldIDs = {};
this.jmethodIDs = {};
}
reportJavaVMCall(data, context) {
const config = config_1.Config.getInstance();
const outputArgs = [];
const outputRet = new DataJSONContainer(data.ret, null);
const javaVM = this.threads.getJavaVM();
if (!config.vm || this.shouldIgnoreMethod(data)) {
return;
}
outputArgs.push(new DataJSONContainer(javaVM, null));
const sendData = this.addJavaVMArgs(data, outputArgs);
this.sendToHost("JavaVM", data, outputArgs, outputRet, sendData, context);
}
reportJNIEnvCall(data, context) {
const RET_INDEX = 0;
const config = config_1.Config.getInstance();
const threadId = Process.getCurrentThreadId();
const outputArgs = [];
const outputRet = [];
const jniEnv = this.threads.getJNIEnv(threadId);
this.updateState(data);
outputArgs.push(new DataJSONContainer(jniEnv, null));
let sendData = null;
const argData = this.addJNIEnvArgs(data, outputArgs);
const retData = this.addJNIEnvRet(data, outputRet);
if (argData !== null && retData === null) {
sendData = argData;
}
else if (argData == null && retData !== null) {
sendData = retData;
}
this.enrichTraceData(data, outputArgs, outputRet);
if (!config.env || this.shouldIgnoreMethod(data)) {
return;
}
this.sendToHost("JNIEnv", data, outputArgs, outputRet[RET_INDEX], sendData, context);
}
updateArrayLengths(data, isGet) {
const JARRAY_INDEX = 1;
if (isGet) {
this.byteArraySizes[data.args[JARRAY_INDEX].toString()]
= data.ret;
}
else {             this.byteArraySizes[data.ret.toString()]
= data.args[JARRAY_INDEX];
}
}
updateMethodIDs(data) {
const NAME_INDEX = 2;
const SIG_INDEX = 3;
const methodID = data.ret.toString();
const name = data.args[NAME_INDEX].readCString();
const sig = data.args[SIG_INDEX].readCString();
if (name !== null && sig !== null) {
this.jmethodIDs[methodID] = name + sig;
}
}
updateFieldIDs(data) {
const NAME_INDEX = 2;
const SIG_INDEX = 3;
const fieldID = data.ret.toString();
const name = data.args[NAME_INDEX].readCString();
const sig = data.args[SIG_INDEX].readCString();
if (name !== null && sig !== null) {
this.jfieldIDs[fieldID] = name + ":" + sig;
}
}
updateClassIDs(data) {
const NAME_INDEX = 1;
const jclass = data.ret.toString();
const name = data.args[NAME_INDEX].readCString();
if (name !== null) {
this.jobjects[jclass] = name;
}
}
updateObjectIDsFromRefs(data, isCreate) {
const OBJECT_INDEX = 1;
if (isCreate) {
const newRef = data.ret.toString();
const oldRef = data.args[OBJECT_INDEX].toString();
if (this.jobjects[oldRef] !== undefined) {
this.jobjects[newRef] = this.jobjects[oldRef];
}
}
else {
const jobject = data.args[OBJECT_INDEX].toString();
delete this.jobjects[jobject];
}
}
updateObjectIDsFromClass(data) {
const OBJECT_INDEX = 1;
const jobject = data.args[OBJECT_INDEX].toString();
const jclass = data.ret.toString();
if (this.jobjects[jobject] !== undefined) {
this.jobjects[jclass] = jobject;
}
}
updateObjectIDsFromCall(data) {
const TYPE_START = 1;
const TYPE_END = -1;
const LAST_CALL_INDEX = 3;
const CALL_PTRS_OFFSET = 5;
if (data.javaMethod !== undefined) {
let start = 4;
const lastArg = data.method.args[LAST_CALL_INDEX];
if (["jvalue*", "va_list"].includes(lastArg)) {
start = CALL_PTRS_OFFSET;
}
for (let i = start; i < data.args.length; i++) {
const arg = data.args[i].toString();
if (this.jobjects[arg] !== undefined) {
continue;
}
const nativeJType = data.javaMethod.nativeParams[i - start];
if (types_1.Types.isComplexObjectType(nativeJType)) {
this.jobjects[arg] = nativeJType.slice(TYPE_START, TYPE_END);
}
}
if (data.method.name.includes("Object")) {
if (this.jobjects[data.ret.toString()] === undefined) {
this.jobjects[data.ret.toString()]
= data.javaMethod.ret.slice(TYPE_START, TYPE_END);
}
}
}
}
updateState(data) {
const name = data.method.name;
if (name === "GetArrayLength") {
this.updateArrayLengths(data, true);
}
else if (name.startsWith("New") && name.endsWith("Array")) {
this.updateArrayLengths(data, false);
}
else if (["GetMethodID", "GetStaticMethodID"].includes(name)) {
this.updateMethodIDs(data);
}
else if (["GetFieldID", "GetStaticFieldID"].includes(name)) {
this.updateFieldIDs(data);
}
else if (["FindClass", "DefineClass"].includes(name)) {
this.updateClassIDs(data);
}
else if (name.startsWith("New") && name.endsWith("GlobalRef")) {
this.updateObjectIDsFromRefs(data, true);
}
else if (name.startsWith("Delete") && name.endsWith("GlobalRef")) {
this.updateObjectIDsFromRefs(data, false);
}
else if (name === "GetObjectClass") {
this.updateObjectIDsFromClass(data);
}
else if (name.startsWith("Call")) {
this.updateObjectIDsFromCall(data);
}
}
shouldIgnoreMethod(data) {
const config = config_1.Config.getInstance();
const include = config.include;
const exclude = config.exclude;
const name = data.method.name;
if (include.length > EMPTY_ARRAY_LEN) {
const included = include.filter((i) => new RegExp(i).test(name));
if (included.length === EMPTY_ARRAY_LEN) {
return true;
}
}
if (exclude.length > EMPTY_ARRAY_LEN) {
const excluded = exclude.filter((e) => new RegExp(e).test(name));
if (excluded.length > EMPTY_ARRAY_LEN) {
return true;
}
}
return false;
}
enrichSingleItem(type, key, item) {
if (types_1.Types.isComplexObjectType(type)) {
if (this.jobjects[key] !== undefined) {
item.setMetadata(this.jobjects[key]);
}
}
else if (type === "jmethodID") {
if (this.jmethodIDs[key] !== undefined) {
item.setMetadata(this.jmethodIDs[key]);
}
}
else if (type === "jfieldID") {
if (this.jfieldIDs[key] !== undefined) {
item.setMetadata(this.jfieldIDs[key]);
}
}
}
enrichTraceData(data, args, ret) {
const ONLY_RET = 0;
let i = 0;
for (; i < data.method.args.length; i++) {
if (["jvalue*, va_list"].includes(data.method.args[i])) {
i++;
continue;
}
else if (data.method.args[i] === "...") {
break;
}
this.enrichSingleItem(data.method.args[i], data.args[i].toString(), args[i]);
}
const OFFSET = i;
for (; i < args.length; i++) {
if (data.javaMethod !== undefined) {
this.enrichSingleItem(data.javaMethod.nativeParams[i - OFFSET], data.args[i].toString(), args[i]);
}
}
if (data.ret !== undefined) {
this.enrichSingleItem(data.method.ret, data.ret.toString(), ret[ONLY_RET]);
}
}
addDefinceClassArgs(data, outputArgs) {
const CLASS_NAME_INDEX = 1;
const OBJECT_INDEX = 2;
const BUF_INDEX = 3;
const LEN_INDEX = 4;
const name = data.getArgAsPtr(CLASS_NAME_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[CLASS_NAME_INDEX], name));
outputArgs.push(new DataJSONContainer(data.args[OBJECT_INDEX], null));
const buf = data.getArgAsPtr(BUF_INDEX);
const len = data.getArgAsNum(LEN_INDEX);
const classData = buf.readByteArray(len);
outputArgs.push(new DataJSONContainer(data.args[BUF_INDEX], null, BUF_INDEX));
outputArgs.push(new DataJSONContainer(data.args[LEN_INDEX], null));
return classData;
}
addFindClassArgs(data, outputArgs) {
const CLASS_NAME_INDEX = 1;
const name = data.getArgAsPtr(CLASS_NAME_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[CLASS_NAME_INDEX], name));
}
addThrowNewArgs(data, outputArgs) {
const CLASS_INDEX = 1;
const MESSAGE_INDEX = 2;
const message = data.getArgAsPtr(MESSAGE_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[CLASS_INDEX], null));
outputArgs.push(new DataJSONContainer(data.args[MESSAGE_INDEX], message));
}
addFatalErrorArgs(data, outputArgs) {
const MESSAGE_INDEX = 1;
const message = data.getArgAsPtr(MESSAGE_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[MESSAGE_INDEX], message));
}
addGetGenericIDArgs(data, outputArgs) {
const CLASS_INDEX = 1;
const NAME_INDEX = 2;
const SIG_INDEX = 3;
const name = data.getArgAsPtr(NAME_INDEX).readCString();
const sig = data.getArgAsPtr(SIG_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[CLASS_INDEX], null));
outputArgs.push(new DataJSONContainer(data.args[NAME_INDEX], name));
outputArgs.push(new DataJSONContainer(data.args[SIG_INDEX], sig));
}
addNewStringArgs(data, outputArgs) {
const BUF_INDEX = 1;
const LEN_INDEX = 2;
const buf = data.getArgAsPtr(BUF_INDEX);
const len = data.getArgAsNum(LEN_INDEX);
const unicode = buf.readByteArray(len);
outputArgs.push(new DataJSONContainer(data.args[BUF_INDEX], null, BUF_INDEX));
outputArgs.push(new DataJSONContainer(data.args[LEN_INDEX], null));
return unicode;
}
addGetGenericBufferArgs(data, outputArgs) {
const JARRAY_INDEX = 1;
const BUF_INDEX = 2;
outputArgs.push(new DataJSONContainer(data.args[JARRAY_INDEX], null));
if (!data.getArgAsPtr(BUF_INDEX).isNull()) {
outputArgs.push(new DataJSONContainer(data.args[BUF_INDEX], data.getArgAsPtr(BUF_INDEX).readS8()));
}
else {
outputArgs.push(new DataJSONContainer(data.args[BUF_INDEX], null));
}
}
addReleaseCharsArgs(data, outputArgs) {
const JSTIRNG_INDEX = 2;
const UNICODE_BUF_INDEX = 2;
const unicode = data.getArgAsPtr(UNICODE_BUF_INDEX).readCString();
outputArgs.push(new DataJSONContainer(data.args[JSTIRNG_INDEX], null));
outputArgs.push(new DataJSONContainer(data.args[UNICODE_BUF_INDEX], unicode));
}
addGetGenericBufferRegionArgs(data, outputArgs) {
const LAST_ARG_OFFSET = 1;
const LEN_INDEX = 3;
const BUF_INDEX = 4;
const type = data.method.args[BUF_INDEX]
.slice(TYPE_NAME_START, TYPE_NAME_END);
const nType = types_1.Types.convertNativeJTypeToFridaType(type);
const size = types_1.Types.sizeOf(nType);
const buf = data.getArgAsPtr(BUF_INDEX);
const len = data.getArgAsNum(LEN_INDEX);
const region = buf.readByteArray(len * size);
const loopLen = data.args.length - LAST_ARG_OFFSET;
for (let i = SKIP_ENV_INDEX; i < loopLen; i++) {
outputArgs.push(new DataJSONContainer(data.args[i], null));
}
outputArgs.push(new DataJSONContainer(data.args[data.args.length - LAST_ARG_OFFSET], null, data.args.length - LAST_ARG_OFFSET));
return region;
}
addNewStringUTFArgs(data, outputArgs) {
const CHAR_PTR_INDEX = 1;
const utf = data.getArgAsPtr(CHAR_PTR_INDEX).readUtf8String();
outputArgs.push(new DataJSONContainer(data.args[CHAR_PTR_INDEX], utf));
}
addRegisterNativesArgs(data, outputArgs) {
const JCLASS_INDEX = 1;
const METHODS_PTR_INDEX = 2;
const SIZE_INDEX = 3;
const JNI_METHOD_SIZE = 3;
const size = data.getArgAsNum(SIZE_INDEX);
const natives = [];
outputArgs.push(new DataJSONContainer(data.args[JCLASS_INDEX], null));
for (let i = 0; i < size * JNI_METHOD_SIZE; i += JNI_METHOD_SIZE) {
const methodsPtr = data.getArgAsPtr(METHODS_PTR_INDEX);
const namePtr = methodsPtr
.add(i * Process.pointerSize)
.readPointer();
const name = namePtr.readCString();
const sigOffset = 1;
const sigPtr = methodsPtr
.add((i + sigOffset) * Process.pointerSize)
.readPointer();
const sig = sigPtr.readCString();
const addrOffset = 2;
const addr = methodsPtr
.add((i + addrOffset) * Process.pointerSize)
.readPointer();
natives.push(new NativeMethodJSONContainer({
value: namePtr.toString(),
data: name
}, {
value: sigPtr.toString(),
data: sig
}, {
value: addr.toString()
}));
}
outputArgs.push(new DataJSONContainer(data.args[METHODS_PTR_INDEX], natives));
outputArgs.push(new DataJSONContainer(data.args[SIZE_INDEX], null));
}
addGetJavaVMArgs(data, outputArgs) {
const JAVAVM_INDEX = 1;
outputArgs.push(new DataJSONContainer(data.args[JAVAVM_INDEX], data.getArgAsPtr(JAVAVM_INDEX).readPointer()));
}
addReleaseStringCriticalArgs(data, outputArgs) {
const JSTRING_INDEX = 1;
const JCHAR_PTR_INDEX = 2;
outputArgs.push(new DataJSONContainer(data.args[JSTRING_INDEX], null));
outputArgs.push(new DataJSONContainer(data.args[JCHAR_PTR_INDEX], data.getArgAsPtr(JSTRING_INDEX).readCString()));
}
addReleaseElementsArgs(data, outputArgs) {
const BYTE_ARRAY_INDEX = 1;
const BUFFER_PTR_INDEX = 2;
const SKIP_ENV_INDEX = 1;
const byteArrayArg = data.method.args[BYTE_ARRAY_INDEX];
const type = byteArrayArg.slice(TYPE_NAME_START, TYPE_NAME_END);
const nType = types_1.Types.convertNativeJTypeToFridaType(type);
const size = types_1.Types.sizeOf(nType);
const buf = data.getArgAsPtr(BUFFER_PTR_INDEX);
const byteArray = data.getArgAsPtr(BYTE_ARRAY_INDEX).toString();
const len = this.byteArraySizes[byteArray];
let region = null;
if (len !== undefined) {
region = buf.readByteArray(len * size);
}
for (let i = SKIP_ENV_INDEX; i < data.args.length; i++) {
const arg = data.args[i];
let dataFor = undefined;
if (i === BUFFER_PTR_INDEX) {
dataFor = i;
}
outputArgs.push(new DataJSONContainer(arg, null, dataFor));
}
return region;
}
addGenericArgs(data, outputArgs) {
for (let i = 1; i < data.args.length; i++) {
outputArgs.push(new DataJSONContainer(data.args[i], null));
}
}
addJNIEnvArgs(data, outputArgs) {
const name = data.method.name;
if (name === "DefineClass") {
return this.addDefinceClassArgs(data, outputArgs);
}
else if (name === "FindClass") {
this.addFindClassArgs(data, outputArgs);
}
else if (name === "ThrowNew") {
this.addThrowNewArgs(data, outputArgs);
}
else if (name === "FatalError") {
this.addFatalErrorArgs(data, outputArgs);
}
else if (name.endsWith("ID")) {
this.addGetGenericIDArgs(data, outputArgs);
}
else if (name === "NewString") {
return this.addNewStringArgs(data, outputArgs);
}
else if (name.startsWith("Get") && name.endsWith("Chars") ||
name.startsWith("Get") && name.endsWith("Elements") ||
name.startsWith("Get") && name.endsWith("ArrayCritical") ||
name === "GetStringCritical") {
this.addGetGenericBufferArgs(data, outputArgs);
}
else if (name.startsWith("Release") && name.endsWith("Chars")) {
this.addReleaseCharsArgs(data, outputArgs);
}
else if (name.endsWith("Region")) {
return this.addGetGenericBufferRegionArgs(data, outputArgs);
}
else if (name === "NewStringUTF") {
this.addNewStringUTFArgs(data, outputArgs);
}
else if (name === "RegisterNatives") {
this.addRegisterNativesArgs(data, outputArgs);
}
else if (name === "GetJavaVM") {
this.addGetJavaVMArgs(data, outputArgs);
}
else if (name === "ReleaseStringCritical") {
this.addReleaseStringCriticalArgs(data, outputArgs);
}
else if (name.startsWith("Release") && name.endsWith("Elements") ||
name.startsWith("Release") && name.endsWith("ArrayCritical")) {
return this.addReleaseElementsArgs(data, outputArgs);
}
else {
this.addGenericArgs(data, outputArgs);
}
return null;
}
addJNIEnvRet(data, outputRet) {
const RET_INDEX = -1;
const ENVPTR_ARG_INDEX = 1;
const name = data.method.name;
if (name.startsWith("Get") && name.endsWith("Elements") ||
name.startsWith("Get") && name.endsWith("ArrayCritical")) {
const key = data.args[ENVPTR_ARG_INDEX].toString();
if (this.byteArraySizes[key] !== undefined) {
const type = data.method.ret.slice(TYPE_NAME_START, TYPE_NAME_END);
const nType = types_1.Types.convertNativeJTypeToFridaType(type);
const size = types_1.Types.sizeOf(nType);
const buf = data.ret;
const len = this.byteArraySizes[data.getArgAsPtr(ENVPTR_ARG_INDEX).toString()];
outputRet.push(new DataJSONContainer(data.ret, null, RET_INDEX));
return buf.readByteArray(len * size);
}
}
outputRet.push(new DataJSONContainer(data.ret, null));
return null;
}
addAttachCurrentThreadArgs(data, outputArgs) {
const ENV_ARG_INDEX = 1;
const ARGS_ARG_INDEX = 2;
const JINT_SIZE = 4;
const argStructSize = types_1.Types.sizeOf("pointer") +
types_1.Types.sizeOf("pointer") +
JINT_SIZE;
const threadId = Process.getCurrentThreadId();
const env = data.args[ENV_ARG_INDEX];
let envData = null;
if (data.ret === JNI_OK) {
envData = this.threads.getJNIEnv(threadId);
}
else if (!data.getArgAsPtr(ENV_ARG_INDEX).isNull()) {
envData = data.getArgAsPtr(ENV_ARG_INDEX).readPointer();
}
outputArgs.push(new DataJSONContainer(env, envData));
const argValue = data.args[ARGS_ARG_INDEX];
if (!data.getArgAsPtr(ARGS_ARG_INDEX).isNull()) {
outputArgs.push(new DataJSONContainer(argValue, null, ARGS_ARG_INDEX));
return data
.getArgAsPtr(ARGS_ARG_INDEX)
.readByteArray(argStructSize);
}
else {
outputArgs.push(new DataJSONContainer(argValue, null));
}
return null;
}
addGetEnvArgs(data, outputArgs) {
const ENV_ARG_INDEX = 1;
const VERSION_ARG_INDEX = 2;
const threadId = Process.getCurrentThreadId();
const env = data.args[ENV_ARG_INDEX];
let binData = null;
if (data.ret === JNI_OK) {
binData = this.threads.getJNIEnv(threadId);
}
else if (!data.getArgAsPtr(ENV_ARG_INDEX).isNull()) {
binData = data.getArgAsPtr(ENV_ARG_INDEX).readPointer();
}
outputArgs.push(new DataJSONContainer(env, binData));
outputArgs.push(new DataJSONContainer(data.args[VERSION_ARG_INDEX], null));
}
addJavaVMArgs(data, outputArgs) {
const name = data.method.name;
if (name.startsWith("AttachCurrentThread")) {
return this.addAttachCurrentThreadArgs(data, outputArgs);
}
else if (name === "GetEnv") {
this.addGetEnvArgs(data, outputArgs);
}
return null;
}
createBacktrace(context, type) {
let bt = context;
if (!(bt instanceof Array)) {
let backtraceType = null;
if (type === "fuzzy") {
backtraceType = Backtracer.FUZZY;
}
else {
backtraceType = Backtracer.ACCURATE;
}
bt = Thread.backtrace(context, backtraceType);
}
return bt.map((addr) => {
return new BacktraceJSONContainer(addr, Process.findModuleByAddress(addr), DebugSymbol.fromAddress(addr));
});
}
sendToHost(type, data, args, ret, sendData, context) {
const config = config_1.Config.getInstance();
const jParams = data.jParams;
let backtrace = undefined;
if (config.backtrace !== "none") {
backtrace = this.createBacktrace(context, config.backtrace);
}
const output = new RecordJSONContainer(type, data.method, args, ret, Process.getCurrentThreadId(), Date.now() - this.start, jParams, backtrace);
send(output, sendData);
}
}
exports.DataTransport = DataTransport;
;
},{"../utils/config":13,"../utils/types":17}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
constructor(libsToTrack = ["*"], backtrace = "accurate", showData = true, include = [], exclude = [], includeExport = [], excludeExport = [], env = true, vm = true) {
this._libsToTrack = libsToTrack;
this._backtrace = backtrace;
this._showData = showData;
this._include = include;
this._exclude = exclude;
this._includeExport = includeExport;
this._excludeExport = excludeExport;
this._env = env;
this._vm = vm;
this._hostInitialised = false;
}
get libsToTrack() {
return this._libsToTrack;
}
get backtrace() {
return this._backtrace;
}
get showData() {
return this._showData;
}
get include() {
return this._include;
}
get exclude() {
return this._exclude;
}
get includeExport() {
return this._includeExport;
}
get excludeExport() {
return this._excludeExport;
}
get env() {
return this._env;
}
get vm() {
return this._vm;
}
static initialised() {
if (Config.instance === undefined) {
return false;
}
else {
return Config.instance._hostInitialised;
}
}
static getInstance(libsToTrack, backtrace, showData, include, exclude, includeExport, excludeExport, env, vm) {
if (libsToTrack !== undefined &&
backtrace !== undefined &&
showData !== undefined &&
include !== undefined &&
exclude !== undefined &&
includeExport !== undefined &&
excludeExport !== undefined &&
env !== undefined &&
vm !== undefined) {
Config.instance = new Config(libsToTrack, backtrace, showData, include, exclude, includeExport, excludeExport, env, vm);
Config.instance._hostInitialised = true;
}
else if (Config.instance === undefined) {
Config.instance = new Config();
}
return Config.instance;
}
}
exports.Config = Config;
;
},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const SEMI_COLON_OFFSET = 1;
class JavaMethod {
constructor(signature) {
const primitiveTypes = ["B", "S", "I", "J", "F", "D", "C", "Z", "V"];
let isArray = false;
let isRet = false;
const jParamTypes = [];
let jRetType = "unknown";
for (var i = 0; i < signature.length; i++) {
if (signature.charAt(i) === "(") {
continue;
}
if (signature.charAt(i) === ")") {
isRet = true;
continue;
}
if (signature.charAt(i) === "[") {
isArray = true;
continue;
}
let jtype = "unknown";
if (primitiveTypes.includes(signature.charAt(i))) {
jtype = signature.charAt(i);
}
else if (signature.charAt(i) === "L") {
var end = signature.indexOf(";", i) + SEMI_COLON_OFFSET;
jtype = signature.substring(i, end);
i = end - SEMI_COLON_OFFSET;
}
if (isArray) {
jtype = "[" + jtype;
}
if (!isRet) {
jParamTypes.push(jtype);
}
else {
jRetType = jtype;
}
isArray = false;
}
this.signature = signature;
this._params = jParamTypes;
this._ret = jRetType;
}
get params() {
return this._params;
}
get nativeParams() {
const nativeParams = [];
this._params.forEach((p) => {
const nativeJType = types_1.Types.convertJTypeToNativeJType(p);
nativeParams.push(nativeJType);
});
return nativeParams;
}
get fridaParams() {
const fridaParams = [];
this._params.forEach((p) => {
const nativeJType = types_1.Types.convertJTypeToNativeJType(p);
const fridaType = types_1.Types.convertNativeJTypeToFridaType(nativeJType);
fridaParams.push(fridaType);
});
return fridaParams;
}
get ret() {
return this._ret;
}
get fridaRet() {
const jTypeRet = types_1.Types.convertJTypeToNativeJType(this._ret);
return types_1.Types.convertNativeJTypeToFridaType(jTypeRet);
}
}
exports.JavaMethod = JavaMethod;
;
},{"./types":17}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MethodData {
constructor(method, args, ret, jmethod) {
this._method = method;
this._jmethod = jmethod;
this._args = args;
this._ret = ret;
if (jmethod === undefined) {
this._jparams = [];
}
else {
this._jparams = jmethod.nativeParams;
}
}
;
get method() {
return this._method;
}
get javaMethod() {
return this._jmethod;
}
get args() {
return this._args;
}
;
getArgAsPtr(i) {
return this._args[i];
}
getArgAsNum(i) {
return this._args[i];
}
get jParams() {
return this._jparams;
}
;
get ret() {
return this._ret;
}
;
}
exports.MethodData = MethodData;
;
},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReferenceManager {
constructor() {
this.references = {};
}
add(ref) {
this.references[ref.toString()] = ref;
}
release(ref) {
if (this.references[ref.toString()] !== undefined) {
delete this.references[ref.toString()];
}
}
}
exports.ReferenceManager = ReferenceManager;
;
},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ARRAY_TYPE_INDEX = 1;
const TYPE_SIZE_64_BIT = 8;
const TYPE_SIZE_CHAR = 1;
const Types = {
isComplexObjectType(type) {
const JOBJECT = [
"jobject",
"jclass",
"jweak"
];
return JOBJECT.includes(type);
},
sizeOf(type) {
if (type === "double" || type === "float" || type === "int64") {
return TYPE_SIZE_64_BIT;
}
else if (type === "char") {
return TYPE_SIZE_CHAR;
}
else {
return Process.pointerSize;
}
},
convertNativeJTypeToFridaType(jtype) {
if (jtype.endsWith("*")) {
return "pointer";
}
if (jtype === "va_list") {
return "pointer";
}
if (jtype === "jmethodID") {
return "pointer";
}
if (jtype === "jfieldID") {
return "pointer";
}
if (jtype === "va_list") {
return "va_list";
}
if (jtype === "jweak") {
jtype = "jobject";
}
if (jtype === "jthrowable") {
jtype = "jobject";
}
if (jtype.includes("Array")) {
jtype = "jarray";
}
if (jtype === "jarray") {
jtype = "jobject";
}
if (jtype === "jstring") {
jtype = "jobject";
}
if (jtype === "jclass") {
jtype = "jobject";
}
if (jtype === "jobject") {
return "pointer";
}
if (jtype === "jsize") {
jtype = "jint";
}
if (jtype === "jdouble") {
return "double";
}
if (jtype === "jfloat") {
return "float";
}
if (jtype === "jchar") {
return "uint16";
}
if (jtype === "jboolean") {
return "char";
}
if (jtype === "jlong") {
return "int64";
}
if (jtype === "jint") {
return "int";
}
if (jtype === "jshort") {
return "int16";
}
if (jtype === "jbyte") {
return "char";
}
return jtype;
},
convertJTypeToNativeJType(jtype) {
let result = "";
let isArray = false;
if (jtype.startsWith("[")) {
isArray = true;
jtype = jtype.substring(ARRAY_TYPE_INDEX);
}
if (jtype === "B") {
result += "jbyte";
}
else if (jtype === "S") {
result += "jshort";
}
else if (jtype === "I") {
result += "jint";
}
else if (jtype === "J") {
result += "jlong";
}
else if (jtype === "F") {
result += "jfloat";
}
else if (jtype === "D") {
result += "jdouble";
}
else if (jtype === "C") {
result += "jchar";
}
else if (jtype === "Z") {
result += "jboolean";
}
else if (jtype.startsWith("L")) {
if (jtype === "Ljava/lang/String;") {
result += "jstring";
}
else if (jtype === "Ljava/lang/Class;") {
result += "jclass";
}
else {
result += "jobject";
}
}
if (isArray) {
if (result === "jstring") {
result = "jobject";
}
result += "Array";
}
return result;
}
};
exports.Types = Types;
},{}]},{},[11])
