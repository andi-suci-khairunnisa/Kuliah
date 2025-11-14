def isKabisat(tahun): # Fungsi untuk mengecek apakah tahun kabisat
    if (tahun % 4 == 0 and tahun % 100 != 0) or (tahun % 400 == 0):
        return True
    else:
        return False

def isPolindrom(string): # Fungsi untuk mengecek apakah string polindrom
    if string == string[::-1]:
        return True
    else:
        return False

# Menu utama
opsi = input ("""\nPilih opsi yang diinginkan:
      1. Cek Tahun Kabisat?
      2. Cek String Polindrom?
Masukkan opsi(1/2): """)

if opsi == '1':
    tahun = int(input("\nMasukkan tahun yang ingin dicek: "))
    if isKabisat(tahun):
        print(f"{tahun} adalah tahun kabisat.")
    else:
        print(f"{tahun} bukan tahun kabisat.")
elif opsi == '2':
    string = input("\nMasukkan string yang ingin dicek: ")
    if isPolindrom(string):
        print(f'"{string}" adalah polindrom.')
    else:
        print(f'"{string}" bukan polindrom.')
