#include <stdio.h>

void insertionSort(int arr[], int n);

int main() {
    int N, n;
    scanf("%d", &N);

    int array[N]; 
    for (int i = 0; i<N; i++ ){
        scanf("%d", &array[i]);
    }

    n = sizeof(array) / sizeof(array[0]); 
    insertionSort(array, n);

    for (int i = 0; i<N; i++ ){
        printf("%d ", array[i]);
    }
    return 0; 
}

void insertionSort(int arr[], int n) { 
    
    for (int i = 1; i < n; i++) {
        int key = arr[i];  
        int j = i - 1;     

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; 
            j--; }

        arr[j + 1] = key; 
    }
}