#include <stdio.h>

int main() {
    int i, j, tinggi;

    printf("Masukkan tinggi segitiga: ");
    scanf("%d", &tinggi);

    for (i = tinggi; i >= 1; i--) {
        for (j = tinggi; j > i; j--) {
            printf(" ");
        }
        for (j = 1; j <= (2 * i - 1); j++) {
            printf("*");
        }
        printf("\n");}

    return 0;
}