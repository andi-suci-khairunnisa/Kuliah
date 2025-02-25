#include <stdio.h>
#define MAX 10

int main() {
    double matriks1[MAX][MAX], matriks2[MAX][MAX], hasil[MAX][MAX];
    int i, j, k;
    int ukuran = 5 ; 
    double nilai_awal = 0.0; 



    
    for (i = 0; i < ukuran; i++) {
        for (j = 0; j < ukuran; j++) {
            matriks1[i][j] = nilai_awal;
            printf("matriks 1[%d][%d]:%.2f\t", i, j, matriks1[i][j]);
            nilai_awal += 1.0; 
        } printf("\n");
    } printf("\n");

    nilai_awal = 0.0;
    for (i = 0; i < ukuran; i++) {
        for (j = 0; j < ukuran; j++) {
            matriks2[i][j] = nilai_awal;
            printf("matriks 2[%d][%d]:%.2f\t", i, j,  matriks2[i][j]);
            nilai_awal += 1.0;
        } printf("\n");
    }  printf("\n");

    
    for (i = 0; i < ukuran; i++) {
        for (j = 0; j < ukuran; j++) {
            hasil[i][j] = 0.0;
            for (k = 0; k < ukuran; k++) {
                hasil[i][j] += matriks1[i][k] * matriks2[k][j];
            } 
        } 
    } 

    printf("Hasil perkalian matriks:\n");
    for (i = 0; i < ukuran; i++) {
        for (j = 0; j < ukuran; j++) {
            printf("hasil[%d][%d]: \t%.2f\t", i, j, hasil[i][j]);
        }
        printf("\n");
    }

    return 0;
}
