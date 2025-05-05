#include <stdio.h>

int main() {
    int x, y, z;
    int no = 1; // Variabel untuk menghitung nomor baris
    
    printf("Solusi bilangan bulat tidak negatif untuk x + y + z = 25:\n");
    
    for (x = 0; x <= 25; x++) {
        for (y = 0; y <= 25 - x; y++) {
            z = 25 - x - y;
            printf("%d. x = %d, y = %d, z = %d\n", no, x, y, z);
            no++; // Menambahkan nomor setelah setiap baris output
        }
    }
    printf ("Terdapat %d solusi bilangan bulat tidak negatif untuk persamaan x + y + z = 25");
    
    return 0;
}