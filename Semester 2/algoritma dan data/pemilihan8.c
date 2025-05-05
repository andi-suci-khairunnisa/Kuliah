#include <stdio.h>

int main() {
    int nilaiPixel;
    
    printf("Masukkan nilai hasil operasi pengolahan citra: ");
    scanf("%d", &nilaiPixel);
    
    // Clipping nilai ke rentang [0, 255]
    if (nilaiPixel > 255) {
        nilaiPixel = 255;
    } else if (nilaiPixel < 0) {
        nilaiPixel = 0;
    }
    
    printf("Nilai pixel setelah clipping: %d\n", nilaiPixel);
    
    return 0;
}
