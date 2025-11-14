package uts;

import java.util.*;

// Abstraction: Person adalah kelas abstrak yang tidak bisa langsung dibuat objeknya
abstract class Person {
    private String name; // Encapsulation: atribut dibuat private

    public Person(String name) {
        this.name = name;
    }

    // Getter & Setter untuk menjaga akses langsung ke atribut
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Abstract method: harus diimplementasikan oleh subclass
    public abstract void showInfo();
}

// Inheritance: Customer adalah turunan dari Person
class Customer extends Person {
    public Customer(String name) {
        super(name);
    }

    // Polymorphism: implementasi berbeda dari method abstrak
    @Override
    public void showInfo() {
        System.out.println("Pelanggan: " + getName());
    }
}

// Class Menu (daftar makanan)
class Menu {
    private String name;
    private double price;

    public Menu(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public void showInfo() {
        System.out.println(name + " - Rp " + price);
    }
}

// Class Restaurant
class Restaurant {
    private String name;
    private List<Menu> menuList = new ArrayList<>();

    public Restaurant(String name) {
        this.name = name;
    }

    public void addMenu(Menu menu) {
        menuList.add(menu);
    }

    public void showMenu() {
        System.out.println("\nDaftar Menu di " + name + ":");
        for (int i = 0; i < menuList.size(); i++) {
            System.out.println((i + 1) + ". " + menuList.get(i).getName() + " - Rp " + menuList.get(i).getPrice());
        }
    }

    public Menu getMenu(int index) {
        if (index >= 0 && index < menuList.size()) {
            return menuList.get(index);
        } else {
            return null;
        }
    }

    public String getName() {
        return name;
    }
}

// Class Order (pesanan)
class Order {
    private Customer customer;
    private Restaurant restaurant;
    private List<Menu> orderedItems = new ArrayList<>();

    public Order(Customer customer, Restaurant restaurant) {
        this.customer = customer;
        this.restaurant = restaurant;
    }

    public void addItem(Menu item) {
        orderedItems.add(item);
    }

    public double calculateTotal() {
        double total = 0;
        for (Menu item : orderedItems) {
            total += item.getPrice();
        }
        return total;
    }

    public void showOrder() {
        System.out.println("\n===== Detail Pesanan =====");
        customer.showInfo();
        System.out.println("Restoran: " + restaurant.getName());
        System.out.println("Daftar Pesanan:");
        for (Menu item : orderedItems) {
            System.out.println("- " + item.getName() + " (Rp " + item.getPrice() + ")");
        }
        System.out.println("Total Harga: Rp " + calculateTotal());
    }
}

// Main class
public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Buat restoran dan menu
        Restaurant resto = new Restaurant("Warung Makan Enak");
        resto.addMenu(new Menu("Nasi Goreng", 15000));
        resto.addMenu(new Menu("Mie Ayam", 12000));
        resto.addMenu(new Menu("Es Teh", 5000));

        // Input nama pelanggan
        System.out.print("Masukkan nama pelanggan: ");
        String nama = input.nextLine();
        Customer cust = new Customer(nama);

        // Tampilkan menu
        resto.showMenu();

        // Buat pesanan
        Order order = new Order(cust, resto);

        while (true) {
            System.out.print("\nPilih nomor menu (0 untuk selesai): ");
            int pilihan = input.nextInt();
            if (pilihan == 0) break;

            Menu item = resto.getMenu(pilihan - 1);
            if (item != null) {
                order.addItem(item);
                System.out.println(item.getName() + " telah ditambahkan ke pesanan.");
            } else {
                System.out.println("Menu tidak ditemukan!");
            }
        }

        // Tampilkan detail pesanan
        order.showOrder();
        input.close();
    }
}
