package pertemuan9;

abstract class Animal {
    protected int legs;

    public Animal(int legs) {
        this.legs = legs; //penggunaan this untuk mengacu pada atribut kelas
    }

    public void walk(){
        System.out.println("Hewan ini mempunyai "+ legs +" kaki.");
    }

    public abstract void eat();
}

interface Pet{
    String getName();
    void setName(String name);
    void play();
}

class Spider extends Animal {
    public Spider(){
        super(8); //memanggil konstruktor kelas induk Animal
    }
    @Override
    public void eat(){
        System.out.println("Laba-laba makan serangga.");
    }  
}

class Cat extends Animal implements Pet{
    private String name;

    public Cat(String name){
        super(4);
        this.name = name;
    }

    @Override
    public void setName(String name){
        this.name = name; //this disini mengacu pada atribut kelas sehingga walau fungsi ini tidak memilki return tetap bisa mengubah nilai atribut name
    }

    @Override
    public String getName(){
        return name;
    }

    @Override
    public void eat(){
        System.out.println(name + " makan ikan.");
    }
    
    @Override
    public void play(){
        System.out.println(name + " sedang bermain.");
    }
}

class Fish extends Animal implements Pet{
    private String name;
    
    public Fish(){
        super(0);
    }
    
    @Override
    public void setName(String name){
        this.name = name;
    }
    
    @Override
    public String getName(){
        return name;
    }

    @Override
    public void eat(){
        System.out.println(name + " makan pelet.");
    }

    @Override
    public void play(){
        System.out.println(name + " sedang bermain.");
    }

    @Override
    public void walk(){
        System.out.println("Ikan tidak memiliki kaki, jadi tidak bisa berjalan.");
    }
}

public class Main {
    public static void main(String[] args) {
        Cat kitty = new Cat ("Kitty");
        System.out.println("\nHalo!! Saya adalah kucing. Awalnya nama saya adalah: " + kitty.getName());
        kitty.setName("Ciki");
        System.out.println("Kemudian diubah menjadi: " + kitty.getName());
        kitty.eat();
        kitty.play();
        kitty.walk();

        Fish nemo = new Fish();
        nemo.setName("Nemo");
        System.out.println("\nHalo, kalau saya adalah ikan, nama saya adalah: " + nemo.getName());
        nemo.eat();
        nemo.play();
        nemo.walk();
        }
    }

