#include <stdio.h>

// int main () {
//    char name[50], web_address[50];

//    printf("Nama: ");
//    gets(name); mending ini jangan dipake katanya berbahaya
   
//    printf("Alamat web: ");
//    gets(web_address); 

//    printf("You entered: %s\n", name);
//    printf("Web address: %s\n", web_address);

//    return(0);
// }

#include <stdio.h>

int main(){
    char name[50], email[50];
    
    printf("Nama: ");
    fgets(name, sizeof(name), stdin); // formatnya itu: fgets(nama_variabel, sizeof(nama_variabel), stdin);
    
    printf("Email: ");
    fgets(email, sizeof(email), stdin); 
   
    printf("\n-------------------------\n");
    printf("Nama anda: %s", name);
    printf("Alamat email: %s", email);
    
    return 0;
}