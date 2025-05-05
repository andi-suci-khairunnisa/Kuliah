#include <stdio.h>

int main() {
    int suku1, suku2, jumlah_suku;
    
    // Meminta input suku pertama, suku kedua, dan jumlah suku
    printf("Masukkan suku pertama: ");
    scanf("%d", &suku1);
    printf("Masukkan suku kedua: ");
    scanf("%d", &suku2);
    printf("Masukkan jumlah suku yang diinginkan: ");
    scanf("%d", &jumlah_suku);

    // Menampilkan deret Fibonacci
    printf("Deret Fibonacci: ");
    
    // Menampilkan suku pertama dan kedua
    printf("%d, %d", suku1, suku2);
    
    // Menghitung dan menampilkan suku berikutnya
    for (int i = 3; i <= jumlah_suku; i++) {
        int suku_berikutnya = suku1 + suku2;
        printf(", %d", suku_berikutnya);
        
        // Memperbarui suku untuk iterasi berikutnya
        suku1 = suku2;
        suku2 = suku_berikutnya;
    }
    
    printf("\n");
    return 0;
}
