#include <stdio.h>

int main() {
   char angka;
   char *angka2;
   int opsi, nilai;

   printf("OPSI:\n\t 1. Konversi karakter digit rentang 0-9 ke interger\n\t 2. Konversi karakter digit yang bukan rentang 0-9 ke integer\n\n");

    while (1){
   printf ("Masukkan opsi yang diinginkan [1\\2]: ");
    scanf ("%d", &opsi);

    if (opsi == 1){
        printf ("Masukkan angka yang diinginkan: ");
        scanf (" %c", &angka);
        nilai = angka - '0';
        printf ("Hasil angka yang telah dikonversi ialah integer %d", nilai);
        break;
    } else if (opsi == 2){
        printf ("Masukkan angka yang diinginkan: ");
        scanf (" %s", &angka2);
        nilai = -99;
        printf ("Hasil angka yang telah dikonversi ialah integer %d", nilai);
        break;
    } else {
        printf ("Opsi yang dimasukkan tidak valid\n\n");
    } }
   
  return 0;}