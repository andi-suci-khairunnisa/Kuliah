#include <iostream>
#include <vector>
using namespace std;

void potong_lumpia(int n, int l, vector<int> &posisi_potong) {
    vector<int> bagian = {l}; // Mulai dengan satu bagian
    
    for (int i = 0; i < n; i++) {
        int idx = posisi_potong[i] - 1; // Indeks bagian yang akan dipotong
        int panjang_baru = bagian[idx] / 2;
        
        // Sisipkan hasil potongan
        bagian.insert(bagian.begin() + idx + 1, panjang_baru);
        bagian[idx] = panjang_baru;
    }
    
    // Cetak hasil akhir
    cout << "Hasil panjang bagian lumpia setelah dipotong: ";
    for (int panjang : bagian) {
        cout << panjang << " ";
    }
    cout << endl;
}

int main() {
    int n, l;
    cout << "Masukkan nilai N: "; cin >> n;
    cout << "Masukkan panjang lumpia (L): "; cin >> l;
    
    vector<int> posisi_potong(n);
    for (int i = 0; i < n; i++) {
        cout << "Masukkan urutan posisi potong sebanyak " << n << " angka: " <<"["<<i+1<<"/"<< n <<"] ";
        cin >> posisi_potong[i];
    }
    
    potong_lumpia(n, l, posisi_potong);
    return 0;
}
