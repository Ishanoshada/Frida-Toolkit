setTimeout(function() {
Java.perform(function() {
var sock = Java.use("java.net.Socket");
sock.bind.implementation = function(localAddress) {
console.log("Socket.bind(" + localAddress.toString() + ")");
sock.bind.call(this, localAddress);
}
sock.connect.overload("java.net.SocketAddress").implementation = function(endPoint) {
console.log("Socket.connect(" + endPoint.toString() + ")");
sock.connect.overload("java.net.SocketAddress").call(this, endPoint);
}
sock.connect.overload("java.net.SocketAddress", "int").implementation = function(endPoint, tmout) {
console.log("Socket.connect(" + endPoint.toString() + ", Timeout: " + tmout + ")");
sock.connect.overload("java.net.SocketAddress", "int").call(this, endPoint, tmout);
}
sock.getInetAddress.implementation = function() {
ret = sock.getInetAddress.call(this);
console.log(ret.toString() + " Socket.getInetAddress()");
return ret;
}
sock.getInputStream.implementation = function() {
console.log("Socket.getInputStream()");
return sock.getInputStream.call(this);
}
sock.getOutputStream.implementation = function() {
console.log("Socket.getOutputStream()");
return sock.getOutputStream.call(this);
}
});
}, 0);
/*
License: (CC BY-SA 4.0) 
* */
setTimeout(function() {
Java.perform(function() {
var sock = Java.use("java.net.Socket");
sock.$init.overload().implementation = function() {
console.log("new Socket() called");
this.$init.overload().call(this);
}
sock.$init.overload("java.net.InetAddress", "int").implementation = function(inetAddress, port) {
console.log("new Socket('" + inetAddress.toString() + "', " + port + ") called");
this.$init.overload("java.net.InetAddress", "int").call(this, inetAddress, port);
}
sock.$init.overload("java.net.InetAddress", "int", "java.net.InetAddress", "int").implementation = function(inetAddress, port, localInet, localPort) {
console.log("new Socket(RemoteInet: '" + inetAddress.toString() + "', RemotePort" + port + ", LocalInet: '" + localInet + "', LocalPort: " + localPort + ") called");
this.$init.overload("java.net.InetAddress", "int", "java.net.InetAddress", "int").call(this, inetAddress, port);
}
sock.$init.overload("java.net.Proxy").implementation = function(proxy) {
console.log("new Socket(Proxy: '" + proxy.toString() + "') called");
this.$init.overload("java.net.Proxy").call(this, proxy);
}
sock.$init.overload("java.net.SocketImpl").implementation = function(si) {
console.log("new Socket(SocketImpl: '" + si.toString() + "') called");
this.$init.overload("java.net.SocketImpl").call(this, si);
}
sock.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").implementation = function(host, port, localInetAddress, localPort) {
console.log("new Socket(Host: '" + host + "', RemPort: " + port + ", LocalInet: '" + localInetAddress + "', localPort: " + localPort + ") called");
this.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").call(this, si);
}
});
}, 0);
