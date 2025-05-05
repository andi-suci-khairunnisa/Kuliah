#include<stdio.h>

int main() {
    int a, b, c;
    printf (" Masukkan sisi-sisi yang akan membentuk segitiga:\n");
    printf (" Masukkan sisi a: "); scanf ("%d", &a);
    printf (" Masukkan sisi b: "); scanf ("%d", &b);
    printf (" Masukkan sisi c: "); scanf ("%d", &c);

    if (a+b < c){
        printf("Bukan sisi segitiga\n");
    } else {
        if (a*a + b*b == c*c){
            printf ("Merupakan segitiga siku-siku\n");
        } else if (a*a + b*b < c*c){
            printf ("Merupakan segitiga lancip\n");
        } else if (a*a + b*b > c*c){
            printf ("Merupakan segitiga tumpul\n");
    }
}}