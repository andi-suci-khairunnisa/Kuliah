#include <stdio.h>

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Pilih pivot
    int i = low - 1; // Indeks elemen yang lebih kecil

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]); // Tukar elemen
        }
    }
    swap(&arr[i + 1], &arr[high]); // Tempatkan pivot
    return (i + 1); // Kembalikan indeks pivot
}

void quicksort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high); // Partisi
        quicksort(arr, low, pi - 1); // Rekursi kiri
        quicksort(arr, pi + 1, high); // Rekursi kanan
    }
}

int main() {
    int arr[] = {10, 7, 8, 9, 1, 5};
    int n = sizeof(arr) / sizeof(arr[0]);

    printf("Array sebelum diurutkan: \n");
    printArray(arr, n);

    quicksort(arr, 0, n - 1);

    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    return 0;
}}