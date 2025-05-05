#include <stdio.h>

int main(){
    int totalbelanja, totalbayar;

    printf("Masukkan total belanja: ");
    scanf("%d", &totalbelanja);
    totalbayar = (totalbelanja/25) * 25;
    
    printf ("Total harga yang dibayar setelah dibulatkan dari Rp.%d menjadi Rp.%d\n", totalbelanja, totalbayar);
    return 0;
}