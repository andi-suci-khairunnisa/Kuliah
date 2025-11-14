-- ============================================
-- DATABASE PERPUSTAKAAN
-- Tugas Aljabar Relasional - Basis Data
-- ============================================
create database perpustakaan_database;
use perpustakaan_database;

-- Hapus tabel jika sudah ada (untuk reset database)
DROP TABLE IF EXISTS peminjaman;
DROP TABLE IF EXISTS anggota;
DROP TABLE IF EXISTS buku;

-- ============================================
-- 1. TABEL BUKU
-- ============================================
CREATE TABLE buku (
    id_buku VARCHAR(5) PRIMARY KEY,
    judul VARCHAR(100) NOT NULL,
    pengarang VARCHAR(50) NOT NULL,
    tahun_terbit INT NOT NULL,
    stok INT NOT NULL
);

-- Insert data buku (sample data untuk tugas)
INSERT INTO buku (id_buku, judul, pengarang, tahun_terbit, stok) VALUES 
('B001', 'Database Systems', 'Ramakrishnan', 2019, 5),
('B002', 'Clean Code', 'Robert Martin', 2020, 3),
('B003', 'Algoritma Pemrograman', 'Sartaj Sahni', 2018, 4),
('B004', 'Laskar Pelangi', 'Andrea Hirata', 2021, 10),
('B005', 'Pemrograman Web', 'Budi Raharjo', 2019, 7),
('B006', 'Struktur Data', 'Rinaldi Munir', 2017, 6),
('B007', 'Kecerdasan Buatan', 'Stuart Russell', 2020, 2),
('B008', 'Jaringan Komputer', 'Andrew Tanenbaum', 2021, 8),
('B009', 'Matematika Diskrit', 'Kenneth Rosen', 2018, 5),
('B010', 'Sistem Operasi', 'Abraham Silberschatz', 2019, 4);

-- ============================================
-- 2. TABEL ANGGOTA
-- ============================================
CREATE TABLE anggota (
    id_anggota VARCHAR(5) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    alamat VARCHAR(100) NOT NULL,
    telepon VARCHAR(15) NOT NULL
);

-- Insert data anggota
INSERT INTO anggota (id_anggota, nama, alamat, telepon) VALUES 
('A001', 'Andi Wijaya', 'Jl. Sudirman No. 10', '081234567890'),
('A002', 'Budi Santoso', 'Jl. Gatot Subroto No. 5', '081234567891'),
('A003', 'Citra Dewi', 'Jl. Ahmad Yani No. 15', '081234567892'),
('A004', 'Dedi Prasetyo', 'Jl. Sudirman No. 20', '081234567893'),
('A005', 'Eka Putri', 'Jl. Diponegoro No. 8', '081234567894'),
('A006', 'Fajar Nugroho', 'Jl. Pahlawan No. 12', '081234567895');

-- ============================================
-- 3. TABEL PEMINJAMAN
-- ============================================
CREATE TABLE peminjaman (
    id_pinjam INT PRIMARY KEY,
    id_anggota VARCHAR(5) NOT NULL,
    id_buku VARCHAR(5) NOT NULL,
    tgl_pinjam DATE NOT NULL,
    tgl_kembali DATE,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_anggota) REFERENCES anggota(id_anggota),
    FOREIGN KEY (id_buku) REFERENCES buku(id_buku)
);

-- Insert data peminjaman
INSERT INTO peminjaman (id_pinjam, id_anggota, id_buku, tgl_pinjam, tgl_kembali, status) VALUES 
(1, 'A001', 'B001', '2024-01-10', '2024-01-17', 'Dikembalikan'),
(2, 'A001', 'B003', '2024-01-15', NULL, 'Dipinjam'),
(3, 'A002', 'B002', '2024-01-12', '2024-01-19', 'Dikembalikan'),
(4, 'A003', 'B001', '2024-01-20', NULL, 'Dipinjam'),
(5, 'A002', 'B005', '2024-01-18', NULL, 'Dipinjam'),
(6, 'A004', 'B007', '2024-01-14', '2024-01-21', 'Dikembalikan'),
(7, 'A005', 'B008', '2024-01-22', NULL, 'Dipinjam'),
(8, 'A003', 'B004', '2024-01-16', '2024-01-23', 'Dikembalikan'),
(9, 'A001', 'B009', '2024-01-25', NULL, 'Dipinjam'),
(10, 'A006', 'B003', '2024-01-19', '2024-01-26', 'Dikembalikan');

-- ============================================
-- QUERY VERIFIKASI (Untuk memastikan data sudah masuk)
-- ============================================

-- Cek total data per tabel
SELECT 'Total Buku' as Info, COUNT(*) as Jumlah FROM buku
UNION ALL
SELECT 'Total Anggota', COUNT(*) FROM anggota
UNION ALL
SELECT 'Total Peminjaman', COUNT(*) FROM peminjaman;

-- Tampilkan sample data
SELECT '=== SAMPLE DATA BUKU ===' as Info;
SELECT * FROM buku LIMIT 5;

SELECT '=== SAMPLE DATA ANGGOTA ===' as Info;
SELECT * FROM anggota LIMIT 5;

SELECT '=== SAMPLE DATA PEMINJAMAN ===' as Info;
SELECT * FROM peminjaman LIMIT 5;

-- ============================================
-- CONTOH QUERY UNTUK EKSPLORASI
-- ============================================

-- 1. Buku yang diterbitkan setelah 2018
SELECT * FROM buku WHERE tahun_terbit > 2018;

-- 2. Anggota yang namanya mengandung 'Budi'
SELECT nama, telepon FROM anggota WHERE nama LIKE '%Budi%';

-- 3. Buku diurutkan berdasarkan stok
SELECT judul, stok FROM buku ORDER BY stok DESC;

-- 4. buku yang tahun terbitnya antara 2018-2020 DAN stoknya lebih dari 3
SELECT * FROM buku WHERE tahun_terbit BETWEEN 2018 AND 2020 AND stok > 3;

--  5a .Join: Anggota dan buku yang sedang dipinjam
 SELECT a.nama, b.judul, p.tgl_pinjam
 FROM anggota a, peminjaman p, buku b
 WHERE a.id_anggota = p.id_anggota 
   AND b.id_buku = p.id_buku
   AND p.status = 'Dipinjam';

-- 5b. Join dengan JOIN keyword
SELECT a.nama, b.judul, p.tgl_pinjam, p.status
FROM anggota a
JOIN peminjaman p ON a.id_anggota = p.id_anggota
JOIN buku b ON p.id_buku = b.id_buku
WHERE p.status = 'Dipinjam';

-- 6. Buku yang tidak pernah dipinjam
-- SELECT * FROM buku 
-- WHERE id_buku NOT IN (SELECT DISTINCT id_buku FROM peminjaman);

-- 7. Jumlah peminjaman per anggota
-- SELECT a.nama, COUNT(*) as jumlah_pinjam
-- FROM anggota a
-- JOIN peminjaman p ON a.id_anggota = p.id_anggota
-- GROUP BY a.id_anggota, a.nama;

-- ============================================
-- DATABASE SIAP DIGUNAKAN!
-- ============================================
-- Silakan jalankan query Anda di bawah ini:

-- SOAL A
SELECT nama, alamat FROM anggota WHERE alamat LIKE '%Sudirman%';

-- SOAL B 
SELECT b.judul, a.nama 
FROM buku b, peminjaman p, anggota a
WHERE b.id_buku = p.id_buku AND p.id_anggota = a.id_anggota;

-- SOAL C 
-- -- Query 1: Tampilkan nama anggota dan judul buku yang sedang dipinjam (status = 'Dipinjam') menggunakan JOIN
SELECT a.nama, b.judul
FROM anggota a 
JOIN peminjaman p ON a.id_anggota = p.id_anggota
JOIN buku b on p.id_buku = b.id_buku
WHERE p.status = 'Dipinjam';

--  --Query 2: Query yang sama menggunakan WHERE dengan multiple tables
SELECT a.nama, b.judul
FROM anggota a, buku b, peminjaman p 
WHERE a.id_anggota = p.id_anggota
	AND p.id_buku = b.id_buku
    AND p.status = 'Dipinjam';


--  SOAL 2.2 : buat query untuk menampilkan "Daftar buku yang tidak pernah dipinjam".
-- -- cara biasa
SELECT * FROM anggota
WHERE id_buku NOT IN(
	SELECT DISTINCT id_buku
    FROM peminjaman);
    
-- -- cara pake LEFT JOIN
SELECT b.* FROM buku b
LEFT JOIN peminjaman p 
	ON b.id_buku = p.id_buku
WHERE p.id_buku IS NULL;




