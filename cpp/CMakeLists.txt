cmake_minimum_required(VERSION 3.22.1)

project(FridaToolkitNative LANGUAGES C CXX)

if(NOT ANDROID)
    message(FATAL_ERROR "Build these libraries with the Android NDK toolchain.")
endif()

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

function(configure_native_library target)
    target_include_directories(${target} PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}")
    target_compile_options(${target} PRIVATE -fvisibility=hidden)
    target_link_libraries(${target} PRIVATE log dl)
endfunction()

add_library(sna SHARED
    hunter_entry.c
    fd_scan.c
    frida_detect.c
    maps_scan.c
    port_probe.c
    stack_check.c
    thread_scan.c
    timing.c
)
configure_native_library(sna)

add_library(snb SHARED
    guard_entry.c
    adb_native.c
    build_native.c
    env_check.c
    lsposed_check.c
    mount_check.c
    plt_check.c
    root_check.c
)
configure_native_library(snb)

add_library(snitchtt SHARED snitchtt_jni.c)
configure_native_library(snitchtt)

add_library(device_trust_native SHARED device_trust_native.cpp)
configure_native_library(device_trust_native)
