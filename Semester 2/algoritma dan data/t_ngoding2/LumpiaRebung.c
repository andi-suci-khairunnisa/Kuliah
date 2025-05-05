#include <stdio.h>

int main() {
    int N, L;
    printf("Masukkan jumlah N: "); scanf("%d", &N);
    printf("Masukkan panjang lumpia (L): "); scanf("%d", &L);
    
    int B[N];
    for (int i = 0; i < N; i++) {
        printf("Masukkan urutan posisi potong sebanyak %d angka[%d/%d]: ", N, i+1, N);
        scanf("%d", &B[i]);
    }

    // Array untuk menyimpan panjang bagian lumpia
    int bagian[N + 1];
    bagian[0] = L; // Bagian pertama adalah panjang lumpia awal

    // Melakukan pemotongan
    for (int i = 0; i < N; i++) {
        int index = B[i] - 1; // Mengubah ke indeks 0
        int panjang = bagian[index]; // Panjang bagian yang akan dipotong
        bagian[index] = panjang / 2; // Setengah dari panjang bagian yang dipotong
        // Memindahkan bagian yang dipotong ke bagian berikutnya
        for (int j = N; j > index + 1; j--) {
            bagian[j] = bagian[j - 1];
        }
        bagian[index + 1] = panjang / 2; // Menambahkan bagian baru
    }

    // Mencetak hasil
    for (int i = 0; i <= N; i++) {
        printf("%d ", bagian[i]);
    }
    printf("\n");

    return 0;
}
