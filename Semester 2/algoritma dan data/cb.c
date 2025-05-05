// #include <stdio.h>

// int main() {
//     int value = 10;
//     int *ptr = &value;   // Pointer ke value
//     int **ptr2 = &ptr;   // Pointer ke pointer (ptr)

//     printf("Nilai value: %d\n", value);
//     printf("Nilai dari pointer pertama: %d\n", *ptr);
//     printf("Nilai dari pointer kedua: %d\n", **ptr2);
    
//     printf("Alamat value: %p\n", &value);
//     printf("Alamat ptr: %p\n", &ptr);
//     printf("Isi ptr2 (alamat ptr): %p\n", ptr2);
//     printf("Isi *ptr2 (alamat ptr): %p\n", *ptr2);
    

//     return 0;
// }

#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr;
    int n = 5; // Jumlah elemen

    // Mengalokasikan memori untuk 5 integer, semua elemen otomatis diisi dengan 0
    arr = (int*) calloc(n, sizeof(int));

    if (arr == NULL) {
        printf("Alokasi memori gagal!\n");
        return 1;
    }

    // Menampilkan isi array (harus bernilai 0)
    printf("Isi array setelah calloc:\n");
    for (int i = 0; i < n; i++) {
        printf("arr[%d] = %d\n", i, arr[i]);
    }

    // Bebaskan memori setelah digunakan
    free(arr);

    return 0;
}
