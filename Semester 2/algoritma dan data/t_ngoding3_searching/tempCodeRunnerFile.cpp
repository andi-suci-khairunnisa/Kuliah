#include <iostream>
#include <algorithm>
using namespace std;

int main(){
    
    int N;
    cin >> N;
    int data[N]; 
    float median;

    for (int i = 0; i<N; i++ ){
        cin >> data[i];
    }

    if ((N>=1 && N <= 100000) && (data[N-1]>=1 && data[N-1] <= 100 )){
        int size= sizeof(data)/sizeof(data[0]);
    sort(data, data+size); 

    if (size/2 == 0) {
        median = (data[size/2] + data[size/2 - 1]) / 2.0; 
    } else {
        median = data[size/2]; // Nilai tengah
    }

    printf("Median: %.1f\n", median);

    }
     
    
    return 0;
}