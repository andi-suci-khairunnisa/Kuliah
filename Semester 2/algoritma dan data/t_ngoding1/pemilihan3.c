#include<stdio.h>

int main (){
    int bil1, bil2, bil3;
    int temp;

    printf("Masukkan bilangan pertama: ");
    scanf("%d", &bil1);
    printf("Masukkan bilangan kedua: ");
    scanf("%d", &bil2);
    printf("Masukkan bilangan ketiga: ");
    scanf("%d", &bil3);

    if (bil2 < bil1 && bil2 < bil3){
        temp = bil1;
        bil1 = bil2;
        bil2 = temp;
    }else if (bil3 < bil1 && bil3 < bil2){
        temp = bil1;
        bil1 = bil3;
        bil3 = temp;
    }

    if (bil3 < bil2){
        temp = bil2;
        bil2 = bil3;
        bil3 = temp;
    }

    printf ("Urutan bilangan dari yang terkecil adalah:\n 1. %d\n 2. %d\n 3. %d\n", bil1, bil2, bil3);
    return 0;
}