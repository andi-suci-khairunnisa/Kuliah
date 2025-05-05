#include<stdio.h>

float konversiFarenheit(float Celcius){
    return (Celcius * 9/5) + 32;
}

void tampillkanKelvin(float Celcius){
    printf("Suhu dalam Kelvin: %.2f\n", Celcius + 273.15);
}

int main(){

    float Celcius;
    float hasil;

    printf("Masukkan suhu: ");
    scanf("%f", &Celcius);

    hasil = konversiFarenheit(Celcius);
    printf("Suhu dalam Farenheit: %.2f\n", hasil);
    tampillkanKelvin(Celcius);
    
return 0;
}