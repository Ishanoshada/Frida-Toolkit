/**************************************************************************************************
*
* The first step in intercepting HTTP & HTTPS traffic is to set the default proxy settings,
* telling the app that all requests should be sent via our HTTP proxy.
*
* In this script, we set that up via a few different mechanisms, which cumulatively should
* ensure that all connections are sent via the proxy, even if they attempt to use their
* own custom proxy configurations to avoid this.
*
* Despite that, this still only covers well behaved apps - it's still possible for apps
* to send network traffic directly if they're determined to do so, or if they're built
* with a framework that does not do this by default (Flutter is notably in this category).
* To handle those less tidy cases, we manually capture traffic to recognized target ports
* in the native connect() hook script.
*
* Source available at https: * SPDX-License-Identifier: AGPL-3.0-or-later
* SPDX-File
*
*************************************************************************************************/
Java.perform(() => {
Java.use('java.lang.System').setProperty('http.proxyHost', PROXY_HOST);
Java.use('java.lang.System').setProperty('http.proxyPort', PROXY_PORT.toString());
Java.use('java.lang.System').setProperty('https.proxyHost', PROXY_HOST);
Java.use('java.lang.System').setProperty('https.proxyPort', PROXY_PORT.toString());
Java.use('java.lang.System').clearProperty('http.nonProxyHosts');
Java.use('java.lang.System').clearProperty('https.nonProxyHosts');
const controlledSystemProperties = [
'http.proxyHost',
'http.proxyPort',
'https.proxyHost',
'https.proxyPort',
'http.nonProxyHosts',
'https.nonProxyHosts'
];
Java.use('java.lang.System').clearProperty.implementation = function (property) {
if (controlledSystemProperties.includes(property)) {
if (DEBUG_MODE) console.log(`Ignoring attempt to clear ${property} system property`);
return this.getProperty(property);
}
return this.clearProperty(...arguments);
}
Java.use('java.lang.System').setProperty.implementation = function (property) {
if (controlledSystemProperties.includes(property)) {
if (DEBUG_MODE) console.log(`Ignoring attempt to override ${property} system property`);
return this.getProperty(property);
}
return this.setProperty(...arguments);
}
const ConnectivityManager = Java.use('android.net.ConnectivityManager');
const ProxyInfo = Java.use('android.net.ProxyInfo');
ConnectivityManager.getDefaultProxy.implementation = () => ProxyInfo.$new(PROXY_HOST, PROXY_PORT, '');
console.log(`== Proxy system configuration overridden to ${PROXY_HOST}:${PROXY_PORT} ==`);
const Collections = Java.use('java.util.Collections');
const ProxyType = Java.use('java.net.Proxy$Type');
const InetSocketAddress = Java.use('java.net.InetSocketAddress');
const ProxyCls = Java.use('java.net.Proxy'); 
const targetProxy = ProxyCls.$new(
ProxyType.HTTP.value,
InetSocketAddress.$new(PROXY_HOST, PROXY_PORT)
);
const getTargetProxyList = () => Collections.singletonList(targetProxy);
const ProxySelector = Java.use('java.net.ProxySelector');
const selectorClassNames = new Set([
'*Proxy*!select(java.net.URI): java.util.List/s',
'*!select(java.net.URI): java.util.List/su'
].flatMap((query) => Java.enumerateMethods(query))
.flatMap((matchingLoader) => matchingLoader.classes.map((classData) => classData.name))
);
const proxySelectorClasses = [...selectorClassNames]
.map((className) => Java.use(className))
.filter((Cls) => ProxySelector.class.isAssignableFrom(Cls.class));
proxySelectorClasses.forEach(ProxySelectorCls => {
if (DEBUG_MODE) {
console.log('Rewriting', ProxySelectorCls.toString());
}
ProxySelectorCls.select.implementation = () => getTargetProxyList()
});
console.log(`== Proxy configuration overridden to ${PROXY_HOST}:${PROXY_PORT} ==`);
});
