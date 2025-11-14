x = True
y = False

print (x and y)  # False

nama = input ("\nMasukkan nama kamu: ")
umur = int (input("Masukkan umur kamu: "))

print ("\n")

print (type(umur))
print (type(nama))

print (f"""
Nama saya {nama}, umur saya {umur} tahun.""")

if umur >= 18:
    print ("Saya sudah dewasa")
elif umur >= 13:
    print ("Saya sudah remaja")
else:
    print ("Saya masih anak-anak")
    
print ("Saya punya banyak buah!")

buah = ["apel", "jeruk", "mangga", "gerseng"]

for buahku in buah:
    print (f"ada buah {buahku},")
    if buahku == "mangga":
        print (f"dan buah terakhir adalah {buah[3]}.\n")
        break