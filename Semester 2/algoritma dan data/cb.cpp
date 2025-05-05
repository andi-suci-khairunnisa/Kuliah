#include <iostream>
using namespace std;

int main(){
    string nama;
    cout << "Tuliskan nama: ";
    // cin >> nama;
    getline(cin, nama); // Menggunakan getline untuk membaca seluruh baris termasuk spasi
    cout << endl;

    cout << "Hi "<< nama;
    cout << " Selamat datang di club!" << endl;

    return 0;
}