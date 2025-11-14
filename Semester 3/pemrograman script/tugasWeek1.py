'''
Membuat listing sederhana yang menampilkan tipe data yang ada di Python

'''
data_list = [
    42,                     # int
    3.14,                   # float
    "Halo Dunia",           # str
    True,                   # bool
    None,                   # NoneType
    [1, 2, 3],              # list
    (4, 5, 6),              # tuple
    {"nama": "Andi"},       # dict
    {7, 8, 9},              # set
    b"byte",                # bytes
    complex(2, 3)           # complex
]

for item in data_list: 
    print(f"""Nilai: {item},
Tipe: {type(item)}\n""")
    
'''


---

Fungsi-fungsi dasar di Python:

| Fungsi        | Deskripsi Singkat                                      | Contoh Penggunaan                      |
|---------------|--------------------------------------------------------|----------------------------------------|
| `print()`     | Menampilkan output ke layar                            | `print("Halo Dunia")`                  |
| `input()`     | Menerima input dari pengguna                           | `nama = input("Masukkan nama: ")`      |
| `len()`       | Menghitung jumlah elemen dalam objek                   | `len("Python")` → `6`                 |
| `type()`      | Menampilkan tipe data dari suatu objek                 | `type(42)` → `<class 'int'>`           |
| `str()`       | Mengubah data menjadi string                           | `str(123)` → `"123"`                   |
| `int()`       | Mengubah data menjadi integer                          | `int("5")` → `5`                       |
| `float()`     | Mengubah data menjadi float                            | `float("3.14")` → `3.14`               |
| `bool()`      | Mengubah data menjadi boolean                          | `bool("")` → `False`                   |
| `range()`     | Membuat urutan angka                                   | `range(5)` → `0,1,2,3,4`               |
| `sum()`       | Menjumlahkan elemen dalam iterable                     | `sum([1, 2, 3])` → `6`                 |
| `max()`       | Mengambil nilai maksimum dari iterable                 | `max([4, 7, 2])` → `7`                 |
| `min()`       | Mengambil nilai minimum dari iterable                  | `min([4, 7, 2])` → `2`                 |
| `abs()`       | Mengambil nilai absolut                                | `abs(-10)` → `10`                      |
| `round()`     | Membulatkan angka float                                | `round(3.14159, 2)` → `3.14`           |
| `sorted()`    | Mengurutkan elemen dalam iterable                      | `sorted([3, 1, 2])` → `[1, 2, 3]`      |
| `list()`      | Membuat list dari iterable                             | `list("abc")` → `['a', 'b', 'c']`      |
| `dict()`      | Membuat dictionary                                     | `dict(a=1, b=2)` → `{'a': 1, 'b': 2}`  |
| `help()`      | Menampilkan dokumentasi fungsi atau modul              | `help(print)`                          |
| `id()`        | Menampilkan alamat memori dari objek                   | `id(x)`                                |


'''