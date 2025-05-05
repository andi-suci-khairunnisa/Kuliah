#include <stdio.h>

int main() {
    int N, i;
    char karakter;
    
    printf("Masukkan jumlah karakter: ");
    scanf("%d", &N);
    
    printf("Masukkan %d karakter:\n", N);
    
    for (i = 0; i < N; i++) {
        scanf(" %c", &karakter);
        printf("%c", karakter);
    }
    
    printf("\n");
    
    return 0;}