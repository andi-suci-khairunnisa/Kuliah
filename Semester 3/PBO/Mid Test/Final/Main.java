package Final;

class Rekening{
    private String nomorRekening;
    private String namaPemilik;
    private double saldo;
    
    public Rekening (String nomorRekening, String namaPemilik, double saldo){
        this.nomorRekening = nomorRekening;
        this.namaPemilik = namaPemilik;
        this.saldo = saldo;
    }

    public void setor(double jumlah){
        this.saldo = saldo + jumlah;
    }

    public void tarik(double jumlah){
        this.saldo = saldo - jumlah;
    }

    public double getSaldo() {
        return saldo;
    }

}

public class Main {
    public static void main(String[] args) {
        Rekening rekening_A = new Rekening("123456", "Budi", 10000 );
        Rekening rekening_B = new Rekening("654321", "Adi", 20000 );

    rekening_A.setor(500);
    rekening_B.tarik(500);

    System.out.println(rekening_A.getSaldo());
    System.out.println( rekening_B.getSaldo());

    }
    
}
