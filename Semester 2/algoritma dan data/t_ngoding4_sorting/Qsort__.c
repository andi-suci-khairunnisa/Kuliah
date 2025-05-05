#include <stdio.h>
#include <stdlib.h>

int bandingkan(const void* a, const void* b) {
    return (*(int*)a - *(int*)b);
}

int main() {
    int array[] = {10, 7, 8, 9, 1, 5};
    int jumlah = sizeof(array) / sizeof(array[0]);
	
    qsort(array, jumlah, sizeof(int), bandingkan);

    for (int i = 0; i < jumlah; i++)
        printf("%d ", array[i]);

    return 0;
}