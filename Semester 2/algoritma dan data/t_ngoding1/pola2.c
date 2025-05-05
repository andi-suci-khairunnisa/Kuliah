#include <stdio.h>

int main() {
    int i, j, tinggi;

    printf("Masukkan tinggi segitiga: ");
    scanf("%d", &tinggi);

    for (i = 1; i <= tinggi; i++) {
        // for (j = tinggi; j > i; j--) {
        //     printf(" ");
        // }
        for (j = tinggi; j >= (2 * i - 1); j--) {
            printf("*");
        }
        printf("\n");
    }

    return 0;
}