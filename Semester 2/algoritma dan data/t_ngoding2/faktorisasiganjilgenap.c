#include<stdio.h>

int faktorial (int N){
    if (N == 0)
        return 1;
    else if (N % 2 == 0)
        return N / 2 * faktorial(N-1);
    else 
        return N * faktorial(N-1);
}

int main(){
    int N;
    printf("Masukkan bilangan: ");
    scanf("%d", &N);

    faktorial(N);
    printf ("N!! = %d", faktorial(N));

    return 0;
}