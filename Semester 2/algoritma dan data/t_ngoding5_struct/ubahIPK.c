#include<stdio.h>
#include<stdlib.h>
#include<ctype.h>

struct Mahasiswa {
    char nama[20];
    char nim[10];
    float ipk;
};

void tampilkanData(struct Mahasiswa mhs[], int n) {
    printf("\nData Mahasiswa:\n");
    for (int i = 0; i < n; i++) {
        printf("Nama: %s, NIM: %s, IPK: %.2f\n", mhs[i].nama, mhs[i].nim, mhs[i].ipk);
    }
}

void ubahIPK (struct Mahasiswa mhs[], int n, char nim[], float ipkBaru) {
    for (int i = 0; i < n; i++) {
        if (strcmp(mhs[i].nim, nim) == 0) {
            mhs[i].ipk = ipkBaru;
            printf("IPK mahasiswa %s telah diubah menjadi %.2f\n", mhs[i].nama, mhs[i].ipk);
            return;
        }
    }
    printf("Mahasiswa dengan NIM %s tidak ditemukan.\n", nim);
}

int main(){
    
    struct Mahasiswa mhs[100];

    int jumlahMahasiswa;
    printf("Masukkan jumlah mahasiswa: ");
    scanf("%d", &jumlahMahasiswa);

    for (int i = 0; i < jumlahMahasiswa; i++) {
        printf("\nMasukkan nama mahasiswa ke-%d: ", i + 1);
        scanf("%s", mhs[i].nama);
        printf("Masukkan NIM mahasiswa ke-%d: ", i + 1);
        scanf("%s", mhs[i].nim);
        printf("Masukkan IPK mahasiswa ke-%d: ", i + 1);
        scanf("%f", &mhs[i].ipk);
    }

    tampilkanData(mhs, jumlahMahasiswa);

    char opsi;
        printf("\nApakah Anda ingin mengubah IPK mahasiswa? (y/n): ");
        scanf(" %c", &opsi);
        opsi = toupper(opsi);

    while ( opsi == 'Y'){

        char NIM_MHS[10];
        float ipkBaru;
    
        printf("\nMasukkan NIM mahasiswa yang ingin diubah IPK-nya: ");
        scanf("%s", NIM_MHS);
        printf("Masukkan IPK baru: ");
        scanf("%f", &ipkBaru);
    
        ubahIPK(mhs, jumlahMahasiswa, NIM_MHS, ipkBaru); 

        printf("\nApakah Anda masih ingin mengubah IPK mahasiswa? (y/n): ");
        scanf(" %c", &opsi);
        opsi = toupper(opsi); 
    }

    printf("\nData mahasiswa setelah perubahan:\n");
    tampilkanData(mhs, jumlahMahasiswa);


    return 0;
}