# 1. Fungsi tanpa parameter dan tanpa nilai kembali

def sambutan():
  welcome = "HALO!"
  print("*"*50)
  print("*" + welcome.center(48) + "*")
  print("*"*50)
  
  '''
  Fungsi ini digunakan untuk menampilkan pesan sambutan yang menarik di awal program. Karena tidak memiliki parameter,
  ia akan selalu menampilkan pesan yang sama
  '''

# 2. Fungsi dengan parameter dan tanpa nilai kembali 

def sapa(nama):
  print(f"\nHalo {nama}! Kalau ke pasar jangan lupa belanja perintahnya Bunda!")
  
  '''
  Fungsi ini menerima satu parameter, yaitu nama. Ia menggunakan parameter ini untuk mempersonalisasi pesan sapaan. 
  Seperti fungsi sebelumnya, fungsi ini tidak mengembalikan nilai apa pun.
  '''
  
      
# 3. Fungsi tanpa parameter tetapi dengan nilai kembali
def daftar_belanja_Bunda():
  mm = {
      '1' : "Ikan Bolu",
      '2' : 'Tahu',
      '3' : "Tempe",
      "4" : "Telur",
      "5" : "Bawang Putih dan Merah",
      '6' : 'Sabun Mandi',
      '7' : "Bedak",
      '8' : 'Somay',
      '9' : 'Nasi Kuning',
      '10' : 'Rinso' 
  }
  return mm.items()

'''
Fungsi ini tidak memerlukan parameter apa pun untuk dijalankan. Namun, ia mengembalikan nilai berupa daftar item belanjaan
Bunda dalam format pasangan kunci-nilai (dict.items()). Nilai yang dikembalikan ini bisa ditangkap dan digunakan untuk 
keperluan lain dalam program, seperti ditampilkan atau diproses lebih lanjut.
'''

# 4. Fungsi dengan parameter dan dengan nilai kembali
def apaSudahBelanja(sudah_belanja):
  if sudah_belanja.lower() == "ya":
    return "Terima kasih anak baik!"
  elif sudah_belanja.lower() == "tidak":
    return "\nBunda akan marah lohh"
  else:
    return "\nKamu salah input"

'''
Fungsi ini menerima satu parameter, yaitu sudah_belanja, yang diharapkan berisi string "ya" atau "tidak". Berdasarkan nilai
parameter ini, fungsi mengembalikan pesan yang sesuai.'''



### contoh penggunaan masing-masing fungsi tersebut. 

sambutan()
nama = input("\nSiapa nama kamu? ")
sapa(nama)

kamu_kepasar = input("\nApakah kamu pergi ke pasar? (ya/tidak) ")
if kamu_kepasar.lower() == "ya":
  print("\nIni Daftar Belanja Bunda:")
  for x,y in daftar_belanja_Bunda():
    print(f"{x}. {y}")

  sudah_belanja = input("\nApakah kamu sudah belanja? (ya/tidak) ")
  print (apaSudahBelanja(sudah_belanja))

else:
  print(f"\nOhh oke {nama}!")