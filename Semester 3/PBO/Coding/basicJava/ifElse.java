import java.util.Scanner;
public class ifElse {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Masukkan nilai Anda: ");
        int nilai = scanner.nextInt();
        char grade;

        if (nilai >= 80) {
            grade = 'A';
        } else if (nilai >= 70) {
            grade = 'B';
        } else if (nilai >= 60) {
            grade = 'C';
        } else if (nilai >= 50) {
            grade = 'D';
        } else {
            grade = 'E';
        }
        scanner.close();

        switch (grade){
            case 'A':
            System.out.println("Nilai Anda adalah A. Sangat Baik!");
            break;
            case 'B':
            System.out.println("Nilai Anda adalah B. Baik!");
            break;
            case 'C':
            System.out.println("Nilai Anda adalah C. Cukup!");
            break;
            case 'D':
            System.out.println("Nilai Anda adalah D. Anda kurang");
            break;
            case 'E':
            System.out.println("Nilai Anda adalah C. Anda gagal");
            break;

        }
    }  

}
