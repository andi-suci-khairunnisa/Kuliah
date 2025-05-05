#include <stdio.h>
#include <string.h>

void konversiKeRomawi(int nilai, char hasil[]) {
    int nilaiArab[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    char *angkaRomawi[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
    
    hasil[0] = '\0';
    
    for (int i = 0; i < 13; i++) {
        while (nilai >= nilaiArab[i]) {
            strcat(hasil, angkaRomawi[i]);
            nilai -= nilaiArab[i];
        }
    }
}

int main() {
    int angka;
    char romawi[100];
    
    while (1) {
        printf("Masukkan bilangan bulat positif (0 untuk keluar): ");
        scanf("%d", &angka);
        
        if (angka == 0) {
            printf("Program selesai.\n");
            break;
        } else if (angka < 0) {
            printf("Input harus bilangan positif!\n");
            continue;
        }
        
        konversiKeRomawi(angka, romawi);
        printf("Angka Romawi: %s\n", romawi);
    }
    
    return 0;
}
