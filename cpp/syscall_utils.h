#pragma once
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>
#include <dirent.h>

/*
 * Direct Linux syscall wrappers — bypass all libc/Frida hooks.
 * Frida rewrites GOT/PLT of libc. Calling syscall() directly is not hookable
 * at the user-space level without a kernel module.
 */

static inline int sc_open(const char *p, int f) {
    return (int)syscall(__NR_openat, AT_FDCWD, p, f | O_CLOEXEC, 0);
}
static inline ssize_t sc_read(int fd, void *b, size_t n) {
    return (ssize_t)syscall(__NR_read, fd, b, n);
}
static inline int sc_close(int fd) {
    return (int)syscall(__NR_close, fd);
}
static inline int sc_socket(int d, int t, int p) {
    return (int)syscall(__NR_socket, d, t, p);
}
static inline int sc_connect(int fd, const struct sockaddr *a, socklen_t l) {
    return (int)syscall(__NR_connect, fd, a, l);
}
static inline ssize_t sc_send(int fd, const void *b, size_t n, int f) {
    return (ssize_t)syscall(__NR_sendto, fd, b, n, f, NULL, 0);
}
static inline ssize_t sc_recv(int fd, void *b, size_t n, int f) {
    return (ssize_t)syscall(__NR_recvfrom, fd, b, n, f, NULL, NULL);
}
static inline int sc_setsockopt(int fd, int l, int o, const void *v, socklen_t s) {
    return (int)syscall(__NR_setsockopt, fd, l, o, v, s);
}
static inline ssize_t sc_readlinkat(int dfd, const char *p, char *buf, size_t s) {
    return (ssize_t)syscall(__NR_readlinkat, dfd, p, buf, s);
}
static inline int sc_getdents64(int fd, void *buf, unsigned int count) {
    return (int)syscall(__NR_getdents64, fd, buf, count);
}
static inline ssize_t sc_read_file(const char *path, char *buf, size_t size) {
    int fd = sc_open(path, O_RDONLY);
    if (fd < 0) return -1;
    ssize_t total = 0, n;
    while (total < (ssize_t)(size - 1)) {
        n = sc_read(fd, buf + total, size - 1 - (size_t)total);
        if (n <= 0) break;
        total += n;
    }
    sc_close(fd);
    if (total >= 0) buf[total] = '\0';
    return total;
}

static inline int sc_file_exists(const char *path) {
    int fd = sc_open(path, O_RDONLY);
    if (fd >= 0) { sc_close(fd); return 1; }
    return 0;
}
