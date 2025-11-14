#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h> // Untuk timing lebih presisi (Linux/Unix)

// ================= MACRO KONFIGURASI =======================
#define MAT_TYPE double      // Tipe data untuk matriks (double precision)
#define N 1024               // Ukuran Matriks N x N 
#define BLOCK_SIZE 32        // Ukuran Blok untuk Loop Blocking 
#define UNROLL_FACTOR 4      // Faktor Unroll 

// Alias untuk mengakses elemen matriks 1D (Row-Major Order)
#define ACCESS(M, i, j) M[(i) * N + (j)]
typedef MAT_TYPE DType;

// ================= UTILITY FUNCTIONS =======================

// Fungsi untuk mengukur waktu (detik)
double get_time() {
    struct timeval t;
    gettimeofday(&t, NULL);
    return t.tv_sec + t.tv_usec * 1e-6;
}

// Fungsi inisialisasi matriks hasil (C) dengan nol
void zero_matrix(DType *M) {
    for (int i = 0; i < N * N; i++) {
        M[i] = (DType)0.0;
    }
}

// (Fungsi inisialisasi matriks A dan B dihilangkan untuk fokus pada fungsi perkalian)

// ================= 1. IMPLEMENTASI NAIF (BASELINE) =======================
void mat_mul_naive(const DType *A, const DType *B, DType *C) {
    zero_matrix(C);
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            for (int k = 0; k < N; k++) { 
                ACCESS(C, i, j) += ACCESS(A, i, k) * ACCESS(B, k, j);
            }
        }
    }
}

// ================= 2. OPTIMISASI LOOP INTERCHANGE (i-k-j) =======================
void mat_mul_interchanged(const DType *A, const DType *B, DType *C) {
    zero_matrix(C);
    for (int i = 0; i < N; i++) {
        for (int k = 0; k < N; k++) {
            for (int j = 0; j < N; j++) { 
                ACCESS(C, i, j) += ACCESS(A, i, k) * ACCESS(B, k, j);
            }
        }
    }
}

// ================= 3. OPTIMISASI LOOP UNROLLING (Diterapkan pada i-k-j) =======================
// Mengurangi overhead loop dan Register Reuse.
void mat_mul_unrolled(const DType *A, const DType *B, DType *C) {
    zero_matrix(C);
    const int U = UNROLL_FACTOR;
    
    for (int i = 0; i < N; i++) {
        for (int k = 0; k < N; k++) {
            DType r_a = ACCESS(A, i, k); // Register Reuse
            int j = 0;

            for (; j <= N - U; j += U) {
                ACCESS(C, i, j)     += r_a * ACCESS(B, k, j);
                ACCESS(C, i, j + 1) += r_a * ACCESS(B, k, j + 1);
                ACCESS(C, i, j + 2) += r_a * ACCESS(B, k, j + 2);
                ACCESS(C, i, j + 3) += r_a * ACCESS(B, k, j + 3);
            }
            
            // Tail loop
            for (; j < N; j++) {
                ACCESS(C, i, j) += r_a * ACCESS(B, k, j);
            }
        }
    }
}

// ================= 4. OPTIMISASI LOOP BLOCKING (Diterapkan pada i-k-j dasar) =======================
// Memaksimalkan Temporal Locality.
void mat_mul_blocked(const DType *A, const DType *B, DType *C) {
    zero_matrix(C);
    const int BSIZE = BLOCK_SIZE;

    // Loop Blok (Outer Loops: bi, bj, bk)
    for (int bi = 0; bi < N; bi += BSIZE) {
        for (int bj = 0; bj < N; bj += BSIZE) {
            for (int bk = 0; bk < N; bk += BSIZE) {

                // Loop Internal (i, k, j) - Menggunakan urutan interchange
                for (int i = bi; i < bi + BSIZE; i++) {
                    for (int k = bk; k < bk + BSIZE; k++) {
                        for (int j = bj; j < bj + BSIZE; j++) {
                            // Perkalian di dalam blok
                            ACCESS(C, i, j) += ACCESS(A, i, k) * ACCESS(B, k, j);
                        }
                    }
                }
            }
        }
    }
}


// ================= FUNGSI UTAMA (MAIN) =======================
int main() {
    // Implementasi inisialisasi matriks A dan B (disederhanakan)
    // Untuk tujuan demo, inisialisasi sederhana sudah cukup
    DType *A = (DType *)malloc(N * N * sizeof(DType));
    DType *B = (DType *)malloc(N * N * sizeof(DType));
    // ... (inisialisasi nilai A dan B) ...

    DType *C_naive = (DType *)malloc(N * N * sizeof(DType));
    DType *C_inter = (DType *)malloc(N * N * sizeof(DType));
    DType *C_unroll = (DType *)malloc(N * N * sizeof(DType));
    DType *C_block = (DType *)malloc(N * N * sizeof(DType));

    // (Lanjutan kode main untuk alokasi, inisialisasi, dan timing)
    
    // ... (Lanjutan kode main untuk alokasi, inisialisasi, dan timing)

    printf("==================================================\n");
    printf("DEMONSTRASI EVOLUSI OPTIMISASI KINERJA\n");
    printf("==================================================\n");
    
    // Asumsikan inisialisasi sudah dilakukan di sini
    
    double start_time, end_time;

    // 1. Naive
    start_time = get_time();
    mat_mul_naive(A, B, C_naive);
    end_time = get_time();
    printf("1. Naive (i-j-k) Time:      %f detik\n", end_time - start_time);

    // 2. Loop Interchange
    start_time = get_time();
    mat_mul_interchanged(A, B, C_inter);
    end_time = get_time();
    printf("2. Loop Interchange Time:   %f detik (Memperbaiki Spatial Locality)\n", end_time - start_time);

    // 3. Loop Unrolling
    start_time = get_time();
    mat_mul_unrolled(A, B, C_unroll);
    end_time = get_time();
    printf("3. Loop Unrolling Time:     %f detik (Mengurangi Overhead CPU)\n", end_time - start_time);

    // 4. Loop Blocking
    start_time = get_time();
    mat_mul_blocked(A, B, C_block);
    end_time = get_time();
    printf("4. Loop Blocking Time:      %f detik (Memaksimalkan Temporal Locality)\n", end_time - start_time);
    
    // ... (pembersihan memori) ...
    return 0;
}