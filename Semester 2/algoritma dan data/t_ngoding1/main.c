#include <stdio.h>

int main() {
    int bilangan, jumlah_digit = 0;

    printf("Masukkan bilangan: ");
    scanf("%d", &bilangan);

    // Penanganan khusus untuk bilangan 0
    if (bilangan == 0) {
        printf("Satuan\n");
        return 0;
    }

    // Mengubah bilangan negatif menjadi positif
    if (bilangan < 0) {
        bilangan = -bilangan;
    }

    // Menghitung jumlah digit
    while (bilangan > 0) {
        bilangan = bilangan / 10;  // Membagi bilangan dengan 10 untuk menghilangkan digit terakhir
        jumlah_digit++;            // Menghitung berapa kali pembagian dilakukan
    }

    // Menentukan jenis bilangan berdasarkan jumlah digit
    if (jumlah_digit == 1) {
        printf("Satuan\n");
    } else if (jumlah_digit == 2) {
        printf("Puluhan\n");
    } else if (jumlah_digit == 3) {
        printf("Ratusan\n");
    } else if (jumlah_digit == 4) {
        printf("Ribuan\n");
    } else if (jumlah_digit == 5) {
        printf("Puluh Ribuan\n");
    } else if (jumlah_digit == 6) {
        printf("Ratus Ribuan\n");
    } else if (jumlah_digit == 7) {
        printf("Jutaan\n");
    } else if (jumlah_digit == 8) {
        printf("Puluh Jutaan\n");
    } else if (jumlah_digit == 9) {
        printf("Ratus Jutaan\n");
    } else if (jumlah_digit == 10) {
        printf("Milyaran\n");
    } else {
        printf("Bilangan terlalu besar\n");
    }

    return 0;
}