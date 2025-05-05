#include <stdio.h>

int main () {
    int N;
// 1. Minta input dari pengguna
printf("Masukkan bilangan: ");
scanf("%d", &N);

// 2. Cek nilai dan tentukan kategori
if (N < 10) {
    // 3. Jika N kurang dari 10, cetak satuan
    printf("Ini adalah satuan.\n");
} else if (N < 100) {
    // 4. Jika N antara 10 dan 99, cetak puluhan
    printf("Ini adalah puluhan.\n");
} else if (N < 1000) {
    // 5. Jika N antara 100 dan 999, cetak ratusan
    printf("Ini adalah ratusan.\n");
} else {
    // 6. Jika N 1000 atau lebih, cetak ribuan
    printf("Ini adalah ribuan.\n");
}

return 0;
}
