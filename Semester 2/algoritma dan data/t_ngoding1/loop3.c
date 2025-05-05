#include<stdio.h>

int main(){
	int i, N, jumlah= 0;

    printf("Masukkan nilai N:  ");
    scanf ("%d", &N);

    for (i=0; jumlah < N; i++){
       jumlah += 2*i+1;
    }
    printf ("jumlah bilangan ganjil pertama dari 1 sampai %d  adalah %d", N, jumlah);
	return 0;
}