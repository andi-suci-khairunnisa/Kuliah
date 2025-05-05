// #include <stdio.h>

// int main () {
//     // mendefinisikan struct Weapon
//     struct Weapon {
//         char* name;
//         int attackPower;
//         int range;
//     };

//     // mendefinisikan struct Player
//     struct Player {
//         char* name;
//         int healthPoin;
//         struct Weapon weapon;
//     };

//     // membuat object struct
//     struct Player player1 = {
//         .name = "Petani Kode",
//         .healthPoin = 100,
//         .weapon = {
//             .name = "Katana",
//             .attackPower = 30,
//         },
//         .weapon.range = 5
//     };

//     // print player dan weapon
//     printf("== Player Status ==\n");
//     printf("Player: %s\n", player1.name);
//     printf("HP: %d%\n", player1.healthPoin);
//     printf("-- Weapon --\n");
//     printf("   Name: %s\n", player1.weapon.name);
//     printf("   Attack: %d\n", player1.weapon.attackPower);
//     printf("   Range: %d\n", player1.weapon.range);


//     return 0;
// }


#include <stdio.h>
struct student
{
    char name[50];
    int age;
};

// membuat fungsi dengan struct sebagai parameter
void display(struct student s) {
  printf("\nDisplaying information\n");
  printf("Name: %s", s.name);
  printf("\nRoll: %d", s.age);
}

int main() {
    struct student s1;

    printf("Enter name: ");
    fgets(s1.name, sizeof(s1.name), stdin);
    printf("Enter age: ");
    scanf("%d", &s1.age);

    display(s1);   // passing structure as an argument

    return 0;
}
