package Final;

class Produk{
    private String nama;
    private double harga;

    public Produk (String nama, double harga){
        this.nama = nama;
        this.harga = harga;
    }

    public void tampilkanInfo(){
        System.out.println("\nNama Produk: " + nama);
        System.out.println("Harga: " + harga);
    }

    public double hitungTotalHarga (int jumlah){
        return (harga*jumlah);
    }

}

class Makanan extends Produk{
    private String tanggalKadaluarsa;

    public Makanan (String nama, double harga, String tanggalKadaluarsa){
        super(nama, harga);
        this.tanggalKadaluarsa = tanggalKadaluarsa;
    }

    @Override
    public void tampilkanInfo(){
        super.tampilkanInfo();
        System.out.println("Tanggal Kadaluarsa: " + tanggalKadaluarsa);
    }
}
 
class Elektronik extends Produk{
    private int garansiBulan;

    public Elektronik (String nama, double harga, int garansiBulan){
        super(nama, harga);
        this.garansiBulan = garansiBulan;
    }

    @Override
    public void tampilkanInfo(){
        super.tampilkanInfo();
        System.out.println("Garansi (bulan): " + garansiBulan);
    }
}

public class Toko {
    public static void main(String[] args) {

        Produk[] daftarProduk = {
            new Makanan ("Roti", 15000, "2024-12-31"),
            new Elektronik("handphone", 10000000, 12),
            new Makanan ("Susu", 20000, "2024-12-12"),
            new Elektronik ("Kulkas", 5000000, 24)
        };

        int[] jumlahBeli ={
            2,
            1, 
            2,
            1
        };

        for (int i = 0; i < daftarProduk.length; i++){
            daftarProduk[i].tampilkanInfo();
            double totalHarga = daftarProduk[i].hitungTotalHarga(jumlahBeli[i]);
            System.out.println("Jumlah Beli: " + jumlahBeli[i]);
            System.out.println("Total Harga: " + totalHarga);
            System.out.println("---------------------------");
        }
    }
}
