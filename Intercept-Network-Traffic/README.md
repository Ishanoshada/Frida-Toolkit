# Intercept-Network-Traffic

## Purpose
This folder contains Frida scripts to monitor and intercept HTTP/HTTPS network traffic in Android and iOS applications.

## Overview
Understanding app network behavior is critical for security testing. These scripts log HTTP requests and responses, monitor network connections, trace TCP traffic, and enable traffic analysis without proxy setup.

## Common Use Cases
- **HTTP/HTTPS Logging**: Log all network requests and responses
- **OkHttp Interception**: Monitor OkHttp3 client operations
- **Request/Response Inspection**: View headers, body, status codes
- **TCP Traffic Tracing**: Monitor low-level network operations
- **WebSocket Monitoring**: Track WebSocket connections
- **Network Parameter Logging**: Log URLs, methods, status codes

## Scripts Included (40 total)

### Key Scripts
- `okhttp3-interceptor.js` - OkHttp3 request/response logging
- `android-okhttp3-logger.js` - Android OkHttp3 detailed logging
- `tcp-dump-ios-14.js` - iOS TCP traffic capture
- `android-http-logger.js` - Generic HTTP logging
- And 36 additional network monitoring scripts

## Usage Examples

### OkHttp3 Interception
```bash
# Log all OkHttp3 network requests
frida -U -f com.example.app -l okhttp3-interceptor.js --no-pause
```

### Detailed HTTP Logging
```bash
# Comprehensive HTTP request/response logging
frida -U -f com.example.app -l android-okhttp3-logger.js --no-pause
```

### iOS Network Monitoring
```bash
# Monitor iOS network traffic
frida -U -f com.example.app -l tcp-dump-ios-14.js --no-pause
```

### Combined Monitoring
```bash
# Multiple network analysis scripts
frida -U -f com.example.app \
  -l okhttp3-interceptor.js \
  -l tcp-dump-ios-14.js \
  --no-pause
```

### Save Network Log
```bash
# Capture traffic to file for analysis
frida -U -f com.example.app \
  -l android-okhttp3-logger.js \
  --no-pause > network_log.txt
```

## Key Techniques

### OkHttp3 Request Interception
```javascript
// Hook OkHttp3 request execution
Java.use('okhttp3.OkHttpClient')
    .newCall
    .implementation = function(request) {
        console.log('[OkHttp] URL:', request.url());
        console.log('[OkHttp] Method:', request.method());
        return this.newCall(request);
    };
```

### Response Monitoring
```javascript
// Hook response callbacks
Java.use('okhttp3.Callback')
    .onResponse
    .implementation = function(call, response) {
        console.log('[Response] Code:', response.code());
        console.log('[Response] Body:', response.body());
        return this.onResponse(call, response);
    };
```

### Request Body Logging
```javascript
// Capture request bodies
Java.use('okhttp3.RequestBody')
    .writeTo
    .implementation = function(sink) {
        console.log('[RequestBody] Writing to sink');
        return this.writeTo(sink);
    };
```

## HTTP Libraries & Frameworks

### Android
- **OkHttp3** (Most Common)
  - Used by Retrofit, Volley
  - Android default HTTP client
  
- **Retrofit** (API layer on OkHttp)
  - Type-safe HTTP client
  - Automatic serialization
  
- **Volley** (Older apps)
  - Google's network library
  - RequestQueue pattern

- **HttpURLConnection**
  - Standard Java HTTP
  - Less common in modern apps

### iOS
- **URLSession**
  - Native iOS HTTP
  - All modern iOS apps
  
- **Alamofire**
  - Popular third-party library
  - Request/response management

## Network Data Captured

### Request Details
- **URL & Endpoint**: API path and base URL
- **HTTP Method**: GET, POST, PUT, DELETE, etc.
- **Headers**: Content-Type, Authorization, etc.
- **Body**: Request payload (JSON, form data, etc.)
- **Query Parameters**: URL parameters

### Response Details
- **Status Code**: 200, 404, 500, etc.
- **Headers**: Response metadata
- **Body**: Response payload
- **Timing**: Response time/latency
- **Errors**: Network errors or exceptions

## Traffic Analysis Workflow

```bash
# Step 1: Start network monitoring
frida -U -f com.example.app \
  -l android-okhttp3-logger.js \
  --no-pause > traffic.log 2>&1

# Step 2: Use app normally
# (Login, browse, interact)

# Step 3: Stop capturing (Ctrl+C)

# Step 4: Analyze captured traffic
grep "URL:" traffic.log | sort | uniq
grep "POST" traffic.log
grep "Authorization" traffic.log

# Step 5: Extract API patterns
grep -E "https://api\." traffic.log | cut -d' ' -f2 | sort | uniq
```

## Common API Patterns to Monitor

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET /api/auth/profile
```

### Data APIs
```
GET /api/data/list
POST /api/data/create
PUT /api/data/{id}
DELETE /api/data/{id}
```

### Tracking/Analytics
```
POST /analytics/event
POST /tracking/pageview
POST /telemetry/log
```

## Integration with Other Categories

Combine with these categories:
- **Bypass-SSL-Certificate-Pinning** - Proxy traffic to Burp
- **Intercept-Crypto-Operations** - Analyze encrypted payloads
- **Hook-Java-Methods** - Hook specific API calls

## Troubleshooting

**Issue**: No traffic logged
- Verify network request is actually happening
- Check app network permissions
- Ensure correct HTTP library targeted

**Issue**: Only seeing some requests
- App might use multiple HTTP libraries
- Native code might handle some requests
- Try loading multiple interceptor scripts

**Issue**: Response body is empty
- Response body might be streamed
- Hook response body reading instead
- Check response headers for data

## Privacy & Legal

**Important**: Network monitoring should only be used:
- ✅ On your own applications
- ✅ With explicit authorization
- ✅ For legitimate security testing
- ❌ Not for monitoring other users
- ❌ Not for capturing private data

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Network Analysis | **Scripts**: 40 | **Platform**: Android, iOS | **Last Updated**: 2025
