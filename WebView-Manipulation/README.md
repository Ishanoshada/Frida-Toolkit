# WebView-Manipulation

## Purpose
This folder contains Frida scripts for manipulating and hooking WebView components, including JavaScript interface manipulation and web component inspection.

## Overview
Many Android and iOS apps use WebView for displaying web content. These scripts enable hooking JavaScript interfaces, intercepting web requests, and manipulating WebView behavior.

## Common Use Cases
- **JavaScript Interface Hooking**: Intercept Java-JavaScript bridge calls
- **WebView Debugging**: Enable WebView debugging and inspection
- **NSURLRequest Interception**: iOS WebView URL request hooking
- **JavaScript Execution**: Execute custom JavaScript in WebView
- **Content Injection**: Inject content into WebView
- **Form Data Interception**: Capture form submissions

## Scripts Included (3 total)
- JavaScript interface hooking scripts
- WebView debugging utilities
- NSURLRequest interception (iOS)

## Usage Examples

### JavaScript Interface Hooking
```bash
# Hook JavaScript interfaces
frida -U -f com.example.app -l javascript-interface-hook.js --no-pause
```

### WebView Debugging
```bash
# Enable WebView debugging
frida -U -f com.example.app -l webview-debugging.js --no-pause
```

### iOS WebView Manipulation
```bash
# Intercept iOS WebView requests
frida -U -f com.example.app -l nsurlrequest-interceptor.js --no-pause
```

## Key Techniques

### JavaScript Interface Hooking
```javascript
// Hook JavaScript interface calls
Java.use('android.webkit.WebView')
    .addJavascriptInterface
    .implementation = function(obj, interfaceName) {
        console.log('[WebView] JavaScript interface added:', interfaceName);
        return this.addJavascriptInterface(obj, interfaceName);
    };
```

### Method Interception
```javascript
// Intercept specific JavaScript-Java method calls
// When JavaScript calls Java methods through interface
let bridgedObject = Java.use('com.example.BridgeClass');
bridgedObject.publicMethod.implementation = function(param) {
    console.log('[Bridge] Called from JavaScript:', param);
    return this.publicMethod(param);
};
```

### JavaScript Execution
```javascript
// Execute JavaScript in WebView context
Java.use('android.webkit.WebView')
    .evaluateJavascript
    .implementation = function(script, callback) {
        console.log('[JS] Executing script');
        return this.evaluateJavascript(script, callback);
    };
```

## JavaScript-Java Bridge (Android)

### Bridge Mechanism
- Java methods exposed to JavaScript via `addJavascriptInterface()`
- JavaScript can call Java methods directly
- Java methods can return values to JavaScript
- Common security issue if not properly validated

### Common Bridge Patterns
```javascript
// Typical Java interface definition
public class BridgeInterface {
    public String getData() { return "data"; }
    public void sendData(String data) { /* ... */ }
}

// Added to WebView
webView.addJavascriptInterface(new BridgeInterface(), "Bridge");

// Called from JavaScript
Bridge.getData();
Bridge.sendData("value");
```

## iOS WebView (WKWebView)

### URLRequest Interception
```javascript
// Hook WKWebView navigation
ObjC.classes.WKWebView['loadRequest:']
    .implementation = function(request) {
        console.log('[WebView] Loading:', request.$ownMembers());
        return this['loadRequest:'](request);
    };
```

### JavaScript Execution
```javascript
// Execute JavaScript in iOS WebView
ObjC.classes.WKWebView['evaluateJavaScript:completionHandler:']
    .implementation = function(js, handler) {
        console.log('[JS] Executing:', js);
        return this['evaluateJavaScript:completionHandler:'](js, handler);
    };
```

## WebView Security Issues

### Common Vulnerabilities
- **JavaScript Bridge Abuse**: Unrestricted Java method access
- **File Access**: JavaScript can access local files
- **XSS Injection**: Malicious JavaScript injection
- **SSL Pinning Bypass**: WebView may bypass pinning
- **Cookie Access**: JavaScript can access cookies

### Exploitation Examples

**Bridge Exploitation**:
```javascript
// If bridge method not validated
Bridge.deleteFile("/sensitive/file");
Bridge.executeCommand("rm -rf /");  // Possible if not protected
```

**JavaScript Injection**:
```javascript
// If user input not sanitized
let userInput = "<script>alert('XSS')</script>";
webView.loadData(userInput, "text/html", "UTF-8");
```

## WebView Content Interception

### Request Hooking
```javascript
// Hook all WebView requests
Java.use('android.webkit.WebViewClient')
    .shouldInterceptRequest
    .overload('android.webkit.WebView', 'android.webkit.WebResourceRequest')
    .implementation = function(view, request) {
        console.log('[WebView] Request:', request.getUrl());
        return this.shouldInterceptRequest(view, request);
    };
```

### Response Handling
```javascript
// Hook response handling
Java.use('android.webkit.WebViewClient')
    .onPageStarted
    .implementation = function(view, url, favicon) {
        console.log('[WebView] Page starting:', url);
        return this.onPageStarted(view, url, favicon);
    };
```

## Form and Input Interception

### Form Submission Hooking
```javascript
// Intercept form data
Java.use('android.webkit.WebViewClient')
    .postUrl
    .overload('java.lang.String', 'byte[]')
    .implementation = function(url, postData) {
        console.log('[Form] Submitting to:', url);
        console.log('[Form] Data:', Java.array('byte', postData));
        return this.postUrl(url, postData);
    };
```

## Integration with Other Categories

Combine with these categories:
- **Intercept-Network-Traffic** - Monitor WebView network requests
- **Hook-Java-Methods** - Generic JavaScript interface hooking
- **Bypass-SSL-Certificate-Pinning** - WebView SSL bypass

## Testing Workflow

```bash
# 1. Identify WebView usage
frida -U -f com.example.app -l "
Java.perform(function() {
    Java.use('android.webkit.WebView')
        .addJavascriptInterface
        .implementation = function(obj, name) {
            console.log('[+] JavaScript interface:', name);
            return this.addJavascriptInterface(obj, name);
        };
});
"

# 2. Enumerate exposed methods
# (Note interface names from output)

# 3. Hook specific methods
frida -U -f com.example.app \
  -l javascript-interface-hook.js \
  --no-pause

# 4. Trigger JavaScript calls
# (Use app features that interact with WebView)

# 5. Analyze intercepted calls
# (Review console output)
```

## Security Best Practices

### For App Developers
- Minimize exposed Java methods
- Validate all JavaScript inputs
- Use Parcel for serialization
- Implement proper access controls
- Disable file access if not needed
- Use HTTPS for all WebView content

### For Security Researchers
- Document bridge interfaces
- Test all exposed methods
- Check for injection vulnerabilities
- Verify input validation
- Test SSL/certificate handling

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: WebView Analysis | **Scripts**: 3 | **Platform**: Android, iOS | **Last Updated**: 2025
