#include <stdio.h>

int main() {
    int i, N;
    printf ("Masukkan nilai N: ");
    scanf ("%d", &N);

    for (i=1; i<=N; i++){
        printf ("\n");
        for (int j=1; j<=i; j++){
            printf ("*");
        }
    }
    return 0;
}