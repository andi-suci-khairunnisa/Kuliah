#include <stdio.h>

int main() {
    int saldo, kode_transaksi, jumlah_uang;

    printf("Masukkan saldo awal: ");
    scanf("%d", &saldo);

    while (1) {
        printf("Masukkan kode transaksi (0 untuk menyetor, 1 untuk mengambil): ");
        scanf("%d", &kode_transaksi);

        if (kode_transaksi != 0 && kode_transaksi != 1) {
            printf("Kode transaksi tidak valid. Silakan masukkan 0 atau 1.\n");
            continue;
        }

        printf("Masukkan jumlah uang: ");
        scanf("%d", &jumlah_uang);

        if (kode_transaksi == 0) {
          
            saldo += jumlah_uang;
            printf("Berhasil menyetor %d. Saldo Anda sekarang: %d\n", jumlah_uang, saldo);
        } else if (kode_transaksi == 1)

            if (saldo - jumlah_uang < 10000) {
                printf("Tidak dapat mengambil uang. Saldo minimum harus Rp10.000.\n");
            } else {
                saldo -= jumlah_uang;
                printf("Berhasil mengambil %d. Saldo Anda sekarang: %d\n", jumlah_uang, saldo);
            }
        
            if (saldo <= 10000) {
                printf("Saldo Anda sudah mencapai batas minimum. Transaksi dihentikan.\n");
                break;
            }
        }

        
        return 0;
    }

