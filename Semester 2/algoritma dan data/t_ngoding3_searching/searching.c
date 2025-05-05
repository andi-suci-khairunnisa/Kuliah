#include <stdio.h>
#include <string.h>

// Fungsi untuk melakukan binary search
int binarySearch(char names[][20], int size, char target[]) {
    int left = 0;
    int right = size - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        // Jika nama ditemukan
        if (strcmp(names[mid], target) == 0) {
            return mid; // Mengembalikan indeks
        }
        // Jika nama lebih kecil dari nama di tengah, cari di sebelah kiri
        else if (strcmp(names[mid], target) > 0) {
            right = mid - 1;
        }
        // Jika nama lebih besar dari nama di tengah, cari di sebelah kanan
        else {
            left = mid + 1;
        }
    }
    return -1; // Mengembalikan -1 jika tidak ditemukan
}

int main() {
    char names[][20] = { "Ahmad", "Alif", "Bella", "Budi", "Chandra", "Citra", "Diana", "Dewi", "Eli", "Eko", 
                         "Fajar", "Farhan", "Gani", "Gita", "Hani", "Hendra", "Indra", "Ika", "Jasmine", 
                         "Joko", "Kirana", "Kevin", "Lara", "Laras", "Lina", "Marcel", "Maya", "Nadia", 
                         "Nina", "Oki", "Omar", "Putri", "Qiana", "Rina", "Rudi", "Sari", "Sinta", "Tari", 
                         "Tina", "Uli", "Umar", "Vina", "Vira", "Wanda", "Wira", "Xena", "Yani", "Yudi", 
                         "Zaki" };
    int size = sizeof(names) / sizeof(names[0]);

    int n;
    printf("Masukkan jumlah test case: ");
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        char target[20];
        printf("Masukkan nama yang dicari: ");
        scanf("%s", target);

        int result = binarySearch(names, size, target);
        if (result != -1) {
            printf("Nama ditemukan pada indeks: %d\n", result);
        } else {
            printf("Tidak ditemukan\n");
        }
    }

    return 0;
}