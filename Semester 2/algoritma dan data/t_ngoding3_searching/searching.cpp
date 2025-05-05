#include <iostream>
#include <string>
using namespace std;

// Fungsi untuk melakukan binary search
int binarySearch(string names[], int size, string target) {
    int left = 0;
    int right = size - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        // Jika nama ditemukan
        if (names[mid] == target) {
            return mid; // Mengembalikan indeks
        }
        // Jika nama lebih kecil dari nama di tengah, cari di sebelah kiri
        else if (names[mid] > target) {
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
    string names[] = { "Ahmad", "Alif", "Bella", "Budi", "Chandra", "Citra", "Diana", "Dewi", "Eli", "Eko", 
                       "Fajar", "Farhan", "Gani", "Gita", "Hani", "Hendra", "Indra", "Ika", "Jasmine", 
                       "Joko", "Kirana", "Kevin", "Lara", "Laras", "Lina", "Marcel", "Maya", "Nadia", 
                       "Nina", "Oki", "Omar", "Putri", "Qiana", "Rina", "Rudi", "Sari", "Sinta", "Tari", 
                       "Tina", "Uli", "Umar", "Vina", "Vira", "Wanda", "Wira", "Xena", "Yani", "Yudi", 
                       "Zaki" };
    int size = sizeof(names) / sizeof(names[0]);

    int n;
    cout << "Masukkan jumlah test case: ";
    cin >> n;

    for (int i = 0; i < n; i++) {
        string target;
        cout << "Masukkan nama yang dicari: ";
        cin >> target;

        int result = binarySearch(names, size, target);
        if (result != -1) {
            cout << "Nama ditemukan pada indeks: " << result << endl;
        } else {
            cout << "Tidak ditemukan" << endl;
        }
    }

    return 0;
}