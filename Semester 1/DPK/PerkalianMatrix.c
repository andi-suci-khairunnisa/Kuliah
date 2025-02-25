#include <stdio.h>
#include <stdlib.h>

int main() {
    int m, n, p, q;
    double **matriks1, **matriks2, **hasil;
    int i, j, k;

    printf("Masukkan jumlah baris matriks pertama: ");
    scanf("%d", &m);
    printf("Masukkan jumlah kolom matriks pertama: ");
    scanf("%d", &n);

    printf("Masukkan jumlah baris matriks kedua: ");
    scanf("%d", &p);
    printf("Masukkan jumlah kolom matriks kedua: ");
    scanf("%d", &q);

    if (n != p) {
        printf("Matriks tidak dapat dikalikan karena kolom matriks pertama tidak sama dengan baris matriks kedua.\n");
        return 1;
    }

    matriks1 = (double **)malloc(m * sizeof(double *));
    for (i = 0; i < m; i++) {
        matriks1[i] = (double *)malloc(n * sizeof(double));
    }

    matriks2 = (double **)malloc(p * sizeof(double *));
    for (i = 0; i < p; i++) {
        matriks2[i] = (double *)malloc(q * sizeof(double));
    }

    hasil = (double **)malloc(m * sizeof(double *));
    for (i = 0; i < m; i++) {
        hasil[i] = (double *)malloc(q * sizeof(double));
    }


    double nilai_awal = 0.0;
    printf("Matriks pertama:\n");
    for (i = 0; i < m; i++) {
        for (j = 0; j < n; j++) {
            matriks1[i][j] = nilai_awal;
            nilai_awal += 1.0;
            printf("%.2f ", matriks1[i][j]);
        }
        printf("\n");
    }

    nilai_awal = 0.0;
    printf("Matriks kedua:\n");
    for (i = 0; i < p; i++) {
        for (j = 0; j < q; j++) {
            matriks2[i][j] = nilai_awal;
            nilai_awal += 1.0;
            printf("%.2f ", matriks2[i][j]);
        }
        printf("\n");
    }

    printf("Hasil perkalian matriks:\n");
    for (i = 0; i < m; i++) {
        for (j = 0; j < q; j++) {
            hasil[i][j] = 0.0;
            for (k = 0; k < n; k++) {
                hasil[i][j] += matriks1[i][k] * matriks2[k][j];
            }
            printf("%.2f ", hasil[i][j]);
        }
        printf("\n");
    }

    for (i = 0; i < m; i++) {
        free(matriks1[i]);
        free(hasil[i]);
    }
    for (i = 0; i < p; i++) {
        free(matriks2[i]);
    }

    free(matriks1);
    free(matriks2);
    free(hasil);

    return 0;
}
