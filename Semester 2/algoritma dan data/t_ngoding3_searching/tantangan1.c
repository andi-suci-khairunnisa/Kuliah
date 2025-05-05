#include <stdio.h>
#include <stdlib.h>

// Fungsi untuk membandingkan dua elemen (digunakan dalam qsort)
int banding(const void *a, const void *b) {
    return (*(int *)a - *(int *)b);
}

// Fungsi untuk mencari indeks pertama yang lebih dari nilai target
int cariLebihDari(int *bebek, int n, int target) {
    int kiri = 0, kanan = n - 1;
    while (kiri <= kanan) {
        int tengah = kiri + (kanan - kiri) / 2;
        if (bebek[tengah] > target) {
            kanan = tengah - 1; // Cari di sebelah kiri
        } else {
            kiri = tengah + 1; // Cari di sebelah kanan
        }
    }
    return kiri; // Kembali ke indeks pertama yang lebih dari target
}

// Fungsi untuk mencari indeks terakhir yang kurang dari sama dengan nilai target
int cariKurangSamaDengan(int *bebek, int n, int target) {
    int kiri = 0, kanan = n - 1;
    while (kiri <= kanan) {
        int tengah = kiri + (kanan - kiri) / 2;
        if (bebek[tengah] <= target) {
            kiri = tengah + 1; // Cari di sebelah kanan
        } else {
            kanan = tengah - 1; // Cari di sebelah kiri
        }
    }
    return kanan; // Kembali ke indeks terakhir yang kurang dari sama dengan target
}

int main() {
    int n, q;

    // Membaca jumlah bebek
    printf("Masukkan jumlah bebek: "); scanf("%d", &n);
    int bebek[n]; // Menggunakan array statis

    // Membaca berat bebek
    for (int i = 0; i < n; i++) {
        printf("berat bebek ke %d: ", i+1) ; scanf("%d", &bebek[i]);
    }

    // Mengurutkan berat bebek
    qsort(bebek, n, sizeof(int), banding);

    // Membaca jumlah pertanyaan
    printf ("Masukkan jumlah pertanyaan:"); scanf("%d", &q);
    for (int i = 0; i < q; i++) {
        int x, y;
        printf("Masukkan batas yang diinginkan [berat_minimum (spasi) berat_max]: ") ; scanf("%d %d", &x, &y);

        // Mencari indeks untuk pertanyaan
        int indeksLebihDari = cariLebihDari(bebek, n, x);
        int indeksKurangSamaDengan = cariKurangSamaDengan(bebek, n, y);

        // Menghitung jumlah bebek yang memenuhi syarat
        int jumlahBebek = indeksKurangSamaDengan - indeksLebihDari + 1;

        // Menampilkan hasil
        printf("%d\n", jumlahBebek);
    }

    return 0;
}