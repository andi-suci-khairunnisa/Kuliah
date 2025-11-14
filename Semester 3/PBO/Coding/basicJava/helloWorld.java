import java.util.Scanner;

public class helloWorld {
    public static void main(String[] args) {
    System.out.println("Hello, World!\n");
    Scanner scanner = new Scanner(System.in);
    System.out.print("Masukkan nama Anda: ");
    String nama = scanner.nextLine();
    System.out.print("Masukkan nim Anda: ");
    int nim = scanner.nextInt();
    scanner.nextLine();
    System.out.println("\nHalo, " + nama + "!");
    System.out.println("Nim Anda adalah: " + nim);
    
    String[] buku = new String[5];
    String[] penulis = new String[]{"Dandelion", "Suci", "Nisa"};
    buku[0] = "Pemrograman Java";
    System.out.println("\nBuku " + buku[0] + " ditulis oleh " + penulis[1] + ".");

    for (int i=0; i < buku.length; i++){
        System.out.print("Masukkan nama buku ke-" + (i+1) + ": ");
        buku[i] = scanner.nextLine();
    }

    scanner.close();
    System.out.println("\nDaftar Buku:");
    for (int i = 0; i < buku.length; i++){
        System.out.println((i+1) + ". Buku ke-" + (i+1) + ": " + buku[i]);
    }
    
    }
}
