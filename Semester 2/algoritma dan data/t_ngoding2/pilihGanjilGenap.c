#include<stdio.h>

int main(){

    int N;
    int ganjil=0, genap=0;
    int array[N];

    printf("Masukkan jumlah elemen: ");
    scanf("%d", &N);

    for (int i = 0; i < N; i++){
        printf("Masukkan elemen ke-%d: ", i+1);
        scanf("%d", &array[i]);
        
        if (array[i] % 2 == 0){
            genap += 1;
        }else{
            ganjil += 1;
        }
    }
    printf ("Jumlah bilangan genap: %d\n", genap);
    printf ("Jumlah bilangan ganjil: %d\n", ganjil);


    return 0;
}