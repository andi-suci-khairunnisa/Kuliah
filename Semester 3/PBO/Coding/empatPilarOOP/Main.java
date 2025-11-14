abstract class Hewan {
    private String nama; // Encapsulation

    public Hewan(String nama) {
        this.nama = nama;
    }
    public String getNama() {
        return nama;
    }
    public void setNama(String nama) {
        this.nama = nama;
    }
    abstract void suara();
}

// Inheritance + Polymorphism
class Anjing extends Hewan {
    public Anjing(String nama) {
        super(nama);
    }
    @Override
    void suara() {
        System.out.println(getNama() + " menggonggong: Guk guk!");
    }
}
class Ayam extends Hewan {
    public Ayam(String nama) {
        super(nama);
    }
    @Override
    void suara() {
        System.out.println(getNama() + " berkokok: Kukuruyuk!");
    }
}
class Babi extends Hewan {
    public Babi(String nama) {
        super(nama);
    }
    @Override
    void suara() {
        System.out.println(getNama() + " mengorok: Oink oink!");
    }
}

public class Main {
    public static void main(String[] args) {
        Hewan anjing = new Anjing("Buddy");
        Hewan ayam = new Ayam("Jago");
        Hewan babi = new Babi("Pinky");

        anjing.suara(); ayam.suara(); babi.suara();
    }
}





