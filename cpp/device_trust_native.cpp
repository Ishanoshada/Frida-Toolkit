// [DeviceTrust/Android] Native C++ Layer
// Root/jailbreak and hook/Frida detection via native checks.
// Uses /proc filesystem, dladdr, memory analysis.
// Standard C++ and POSIX APIs only.

#include <jni.h>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <chrono>
#include <cctype>
#include <dlfcn.h>
#include <unistd.h>
#include <dirent.h>
#include <limits.h>
#include <android/log.h>

#define LOG_TAG "DeviceTrust/Native"
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

using namespace std;

/**
 * [DeviceTrust/Android] Helper functions for collecting native security signals
 * 
 * - /proc/self/maps analysis (RWX segments, Frida modules)
 * - /proc/self/fd checks (Frida file descriptors)
 * - libc symbol analysis via dladdr (libc getpid hooking detection)
 */

/**
 * Scans /proc/self/maps file to detect RWX segments and suspicious modules
 */
struct MapsAnalysis {
    int rwxSegments = 0;
    bool hasRwx = false;
    bool fridaLibLoaded = false;
    vector<string> suspiciousModules;
};

MapsAnalysis analyzeProcMaps() {
    MapsAnalysis result;
    ifstream maps("/proc/self/maps");
    
    if (!maps.is_open()) {
        return result;
    }

    string line;
    int lineCount = 0;
    const int MAX_LINES = 10000; // Performance guardrail

    while (getline(maps, line) && lineCount < MAX_LINES) {
        lineCount++;
        
        // Check for rwx segments
        if (line.find(" rwxp") != string::npos || line.find(" rwx") != string::npos) {
            result.rwxSegments++;
            result.hasRwx = true;
        }

        // Suspicious module keywords (lowercase comparison)
        string lowerLine = line;
        for (auto& c : lowerLine) c = tolower(static_cast<unsigned char>(c));

        vector<string> keywords = {
            "frida", "gum-js", "gum_js", "gadget",
            "substrate", "xposed", "lsposed", "edxposed"
        };

        for (const auto& keyword : keywords) {
            if (lowerLine.find(keyword) != string::npos) {
                if (keyword.find("frida") != string::npos || keyword.find("gum") != string::npos) {
                    result.fridaLibLoaded = true;
                }
                
                // Extract module path (basename typically .so file)
                size_t lastSlash = line.rfind('/');
                if (lastSlash != string::npos) {
                    string module = line.substr(lastSlash + 1);
                    // Extract up to first space
                    size_t space = module.find(' ');
                    if (space != string::npos) {
                        module = module.substr(0, space);
                    }
                    
                    // Ensure uniqueness before adding
                    bool exists = false;
                    for (const auto& m : result.suspiciousModules) {
                        if (m == module) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists && !module.empty()) {
                        result.suspiciousModules.push_back(module);
                    }
                }
                break;
            }
        }
    }

    maps.close();
    return result;
}

/**
 * Scan /proc/self/fd symlinks for frida/gadget hints
 */
bool checkFdForFrida() {
    DIR* dir = opendir("/proc/self/fd");
    if (!dir) {
        return false;
    }

    bool found = false;
    struct dirent* entry;
    int count = 0;
    const int MAX_FD_CHECK = 100; // Performance cap

    while ((entry = readdir(dir)) != nullptr && count < MAX_FD_CHECK) {
        count++;
        
        if (entry->d_name[0] == '.') {
            continue;
        }

        string fdPath = "/proc/self/fd/" + string(entry->d_name);
        char linkTarget[PATH_MAX];
        ssize_t len = readlink(fdPath.c_str(), linkTarget, sizeof(linkTarget) - 1);
        
        if (len > 0) {
            linkTarget[len] = '\0';
            string target = linkTarget;
            
            // Convert to lowercase
            for (auto& c : target) c = tolower(static_cast<unsigned char>(c));
            
            if (target.find("frida") != string::npos || 
                target.find("gadget") != string::npos ||
                target.find("gum-js") != string::npos) {
                found = true;
                break;
            }
        }
    }

    closedir(dir);
    return found;
}

/**
 * Check if a libc symbol resolves to the expected library using dladdr
 * May indicate hook/GOT manipulation
 */
struct LibcCheck {
    string soPath;
    bool unexpected = false;
};

LibcCheck checkLibcSymbol() {
    LibcCheck result;
    
    // Check getpid symbol
    void* symbol = reinterpret_cast<void*>(getpid);
    Dl_info info;
    
    if (dladdr(symbol, &info) != 0) {
        if (info.dli_fname != nullptr) {
            result.soPath = info.dli_fname;
            
            // Unexpected path (expected: /system/lib64/libc.so or /apex/.../libc.so)
            string path = result.soPath;
            if (path.find("/system/lib") == string::npos && 
                path.find("/apex/") == string::npos &&
                path.find("libc.so") == string::npos) {
                result.unexpected = true;
            }
        }
    }
    
    return result;
}

string escapeJsonString(const string& str) {
    string escaped;
    for (char c : str) {
        if (c == '"' || c == '\\') {
            escaped += '\\';
        }
        escaped += c;
    }
    return escaped;
}

string vectorToJsonArray(const vector<string>& vec) {
    if (vec.empty()) {
        return "[]";
    }
    
    string json = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        json += "\"" + escapeJsonString(vec[i]) + "\"";
        if (i < vec.size() - 1) {
            json += ",";
        }
    }
    json += "]";
    return json;
}

/**
 * JNI method: collects native signals and returns JSON string
 */
extern "C" JNIEXPORT jstring JNICALL
Java_com_mikoloy_device_1trust_DeviceTrustNative_collectNativeSignals(
    JNIEnv* env,
    jobject /* this */) {
    
    auto startTime = chrono::high_resolution_clock::now();

    // 1. /proc/self/maps analysis
    MapsAnalysis mapsResult = analyzeProcMaps();

    // 2. /proc/self/fd check
    bool fdFrida = checkFdForFrida();

    // 3. libc symbol check
    LibcCheck libcResult = checkLibcSymbol();

    auto endTime = chrono::high_resolution_clock::now();
    chrono::duration<double, milli> elapsed = endTime - startTime;

    // [DeviceTrust/Android] Build JSON response
    // Native signal report returned to Kotlin layer.
    // Format compatible with parseNativeSignals in DeviceTrust.kt.
    ostringstream json;
    json << "{";
    json << "\"rwxSegments\":" << mapsResult.rwxSegments << ",";
    json << "\"hasRwx\":" << (mapsResult.hasRwx ? "true" : "false") << ",";
    json << "\"fridaLibLoaded\":" << (mapsResult.fridaLibLoaded ? "true" : "false") << ",";
    json << "\"fdFrida\":" << (fdFrida ? "true" : "false") << ",";
    json << "\"libcGetpidSo\":\"" << escapeJsonString(libcResult.soPath) << "\",";
    json << "\"libcGetpidUnexpected\":" << (libcResult.unexpected ? "true" : "false") << ",";
    json << "\"nativeTimeMs\":" << elapsed.count() << ",";
    json << "\"suspiciousModules\":" << vectorToJsonArray(mapsResult.suspiciousModules);
    json << "}";
    // [DeviceTrust/Android] JSON build complete

    string result = json.str();
    
    #ifdef DEBUG
    LOGD("Native signals: %s", result.c_str());
    #endif

    return env->NewStringUTF(result.c_str());
}