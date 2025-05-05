#include <stdio.h>

int main (){
    float diskon, totalbelanja, totalbayar;
    printf ("Masukkan total belanja: ");
    scanf ("%f", &totalbelanja);

    if (totalbelanja > 100000){
        diskon = 0.1 * totalbelanja;
    }else {
        diskon = 0;
    }
    totalbayar = totalbelanja - diskon;
    printf ("Total harga yang dibayar adalah sebesar Rp.%.2f dengan total diskon yang didapat sebesar Rp.%.2f\n", totalbayar, diskon);

    return 0;
}