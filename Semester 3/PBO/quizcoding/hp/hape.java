package hp;

class Handphone {
    void hidupkan() {
        System.out.println("Handphone menyala");
    }

    void lakukanPanggilan() {
        System.out.println("Melakukan panggilan...");
    }

    void kirimSMS() {
        System.out.println("Mengirim SMS...");
    }

    void matikan() {
        System.out.println("Handphone dimatikan");
    }
}
public class hape {
    public static void main(String[] args) {
        Handphone handphone = new Handphone();
        handphone.hidupkan();
        handphone.lakukanPanggilan();
        handphone.kirimSMS();
        handphone.matikan();
    }
}
