print ("Hello, World!\n")
# print (123)
# print("Nama saya", "Budi", "umur saya", 20, "tahun")

nama = "Budi"
umur = 20
tinggi = 170.5
status = True

print (f"nama saya {nama}, umur saya {umur}, dan tinggi saya adalah {tinggi} cm dan status kelulusan saya adalah {status}\n")

apel = 2
jeruk = 3

print(f"saya memiliki apel sebanyak {apel} buah, total buah yang saya miliki adalah {apel + jeruk} buah")


while True:
    jawaban = input ("\nMau berteman dengan saya? (y/n)  ")
    if jawaban.lower() == "y":
        nama_teman = input ("\nYay! sekarang kita berteman, nama kamu siapa?  ")
        print (f"\nSenang berteman dengan kamu {nama_teman}!\n")
        break
    elif jawaban.lower() == "n":
        print ("\nDasar jelek!")
        break
    else:
        print ("\nkamu ngomong apa sih! Aku ulang pertanyaannya ya!")
        continue
