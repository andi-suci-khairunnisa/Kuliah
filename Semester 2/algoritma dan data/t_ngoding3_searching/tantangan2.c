#include <stdio.h>
#include <stdlib.h> // Untuk fungsi abs()

int main() {
    int n, x;

    // Membaca jumlah bilangan dan nilai X
    printf("Masukkan jumlah bilangan bulat dan nilai x [jumlah_bilangan_bulat (spasi) nilai_x]: \n") ;
    scanf("%d %d", &n, &x);
    int data[n]; // Menggunakan array statis untuk menyimpan data

    // Membaca bilangan bulat ke dalam array
    for (int i = 0; i < n; i++) {
       printf ("Masukkan bilangan bulat ke-%d: ", i+1); scanf("%d", &data[i]);
    }

    // Variabel untuk menyimpan bilangan dengan selisih terkecil
    int bilanganTerkecil = data[0];
    int selisihTerkecil = abs(data[0] - x); // Menghitung selisih awal

    // Melakukan pencarian secara sequential
    for (int i = 1; i < n; i++) {
        int selisih = abs(data[i] - x); // Menghitung selisih dengan X
        if (selisih < selisihTerkecil) {
            selisihTerkecil = selisih; // Update selisih terkecil
            bilanganTerkecil = data[i]; // Update bilangan terkecil
        }
    }

    // Menampilkan hasil
    printf("%d\n", bilanganTerkecil);
    return 0;
}