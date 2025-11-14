from abc import ABC, abstractmethod

# 1. Abstraction & Contract
class Hewan(ABC):
    """Kelas Induk Abstrak untuk semua jenis hewan."""
    def __init__(self, nama):
        self.nama = nama

    @abstractmethod
    def perilaku_inti(self):
        """Metode abstrak yang wajib diimplementasikan oleh kelas turunan."""
        pass

# 2. Constructor, Inheritance 
class Kucing(Hewan):
    """Kelas Anak Pertama yang mewarisi dari Hewan."""
    def __init__(self, nama, umur):
        super().__init__(nama)
        self._umur = umur #3. Encapsulation

    def get_umur(self):
        return self._umur

    def set_umur(self, umur):
        if umur < 0:
            print("Error: Umur tidak boleh negatif.")
        else:
            self._umur = umur

    def perilaku_inti(self):
        return f"{self.nama} (kucing) sedang mengeong: Meow!"

# 4. Polymorphism
class Anjing(Hewan):
    """Kelas Anak Kedua yang juga mewarisi dari Hewan."""
    def __init__(self, nama):
        super().__init__(nama)

    def perilaku_inti(self):
        return f"{self.nama} (anjing) sedang menggonggong: Guk Guk!"

# 5. Polymorphism Demonstration
def demonstrasi_perilaku(objek_hewan):
    """Fungsi independen untuk menunjukkan polymorphism."""
    print(objek_hewan.perilaku_inti())

# -- BAGIAN EKSEKUSI PROGRAM --

kucing_peliharaan = Kucing("Oyen", 2)
anjing_peliharaan = Anjing("Doggo")

print("--- Demonstrasi Perilaku (Polymorphism) ---")
demonstrasi_perilaku(kucing_peliharaan)
demonstrasi_perilaku(anjing_peliharaan)

print("\n--- Demonstrasi Enkapsulasi ---")
print(f"Umur awal {kucing_peliharaan.nama}: {kucing_peliharaan.get_umur()}")
kucing_peliharaan.set_umur(3)
print(f"Umur baru {kucing_peliharaan.nama}: {kucing_peliharaan.get_umur()}")
kucing_peliharaan.set_umur(-1) # Test validasi