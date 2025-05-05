#include <stdio.h>

int main() {
    int suku1, suku2, jumlah_suku;
    
    printf("Masukkan suku pertama: ");
    scanf("%d", &suku1);
    printf("Masukkan suku kedua: ");
    scanf("%d", &suku2);
    printf("Masukkan jumlah suku yang diinginkan: ");
    scanf("%d", &jumlah_suku);

    printf("Deret Fibonacci: ");
    
    printf("%d, %d", suku1, suku2);
    
    for (int i = 3; i <= jumlah_suku; i++) {
        int suku_berikutnya = suku1 + suku2;
        printf(", %d", suku_berikutnya);
        
        suku1 = suku2;
        suku2 = suku_berikutnya;
    }
    
    printf("\n");
    return 0;
}
