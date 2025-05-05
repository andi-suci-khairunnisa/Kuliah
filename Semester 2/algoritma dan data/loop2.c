#include<stdio.h>

int main(){
	int i, N, jumlah= 0;

    printf("Masukkan nilai N:  ");
    scanf ("%d", &N);

    for (i=0; i<N; i++){
       jumlah += 2*i+1;
    }
    printf ("jumlah %d bilangan ganjil pertama ialah: %d", N, jumlah);
	return 0;}