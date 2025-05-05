#include <iostream>
using namespace std;
int main(){
    int N; 
    cin >> N;
 
    int r_z = 1; int c_z = N;
    
for (int r=1; r<N; r++ ){
    for (int c=1; c<N  ; c++){
    if ((r * c == N) && (r<c)){
        if ((c-r) < (c_z - r_z)) {
            r_z = r;
            c_z = c;
        }
    }
}} cout << r_z << " " << c_z;


    return 0;
}