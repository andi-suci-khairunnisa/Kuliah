#include <stdio.h>

int main() {
    int jamkerja;
    char gol;
    
    printf("masukkan golongan:");
    scanf("%c", &gol);
    printf("masukkan jam kerja:");
    scanf("%d", &jamkerja);
    
    switch (gol){
        case 'A':
            if(jamkerja <= 40){
                printf("gaji adalah %d", jamkerja * 15000);
            }
            else if(jamkerja > 40){
                printf("gaji adalah %d", (40 * jamkerja)+ ((jamkerja - 40) * 1,5 * 15000));
            }
            
        case 'B':
            if(jamkerja <= 40){
                printf("gaji adalah %d", jamkerja * 12000);
            }
            else if(jamkerja > 40){
                printf("gaji adalah %d", (40 * jamkerja)+ ((jamkerja - 40) * 1,5 * 12000));
            }
        case 'C':
            if(jamkerja <= 40){
                printf("gaji adalah %d", jamkerja * 10000);
            }
            else if(jamkerja > 40){
                printf("gaji adalah %d", (40 * jamkerja)+ ((jamkerja - 40) * 1,5 * 10000));
            }
        case 'D':
            if(jamkerja <= 40){
                printf("gaji adalah %d", jamkerja * 8000);
            }
            else if(jamkerja > 40){
                printf("gaji adalah %d", (40 * jamkerja)+ ((jamkerja - 40) * 1,5 * 8000));
            }
            
    }
}