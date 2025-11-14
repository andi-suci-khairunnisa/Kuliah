-- Laporan Praktikum Basis Data - MySQL Dasar
-- Nama  : Andi Suci Khairunnisa
-- NIM   : D121241085
-- Kelas : TI A 2024

-- PRAKTIKUM 1 : Membuat Database & Tabel
CREATE DATABASE kampus;
USE kampus;

CREATE TABLE mahasiswa (
    nim CHAR(10) PRIMARY KEY,
    nama VARCHAR(50) NOT NULL,
    jurusan VARCHAR(30),
    angkatan YEAR
);

CREATE TABLE matakuliah (
    kode_mk CHAR(6) PRIMARY KEY,
    nama_mk VARCHAR(50) NOT NULL,
    sks INT
);

CREATE TABLE krs (
    id_krs INT AUTO_INCREMENT PRIMARY KEY,
    nim CHAR(10),
    kode_mk CHAR(6),
    semester INT,
    FOREIGN KEY (nim) REFERENCES mahasiswa(nim),
    FOREIGN KEY (kode_mk) REFERENCES matakuliah(kode_mk)
);

-- PRAKTIKUM 2 : Insert Data
INSERT INTO mahasiswa (nim, nama, jurusan, angkatan) VALUES
('20231001', 'Andi Saputra', 'Informatika', 2023),
('20231002', 'Budi Santoso', 'Sistem Informasi', 2023),
('20231003', 'Citra Dewi', 'Informatika', 2022);

INSERT INTO matakuliah (kode_mk, nama_mk, sks) VALUES
('IF1001', 'Basis Data 1', 3),
('IF1002', 'Algoritma', 3),
('IF1003', 'Struktur Data', 3);

INSERT INTO krs (nim, kode_mk, semester) VALUES
('20231001', 'IF1001', 1),
('20231001', 'IF1002', 1),
('20231002', 'IF1001', 1),
('20231003', 'IF1003', 3);

-- PRAKTIKUM 3 : Select Data
SELECT * FROM mahasiswa;
SELECT * FROM mahasiswa WHERE jurusan = 'Informatika';
SELECT * FROM matakuliah WHERE sks > 2;

SELECT m.nim, m.nama, mk.nama_mk, k.semester
FROM krs k
JOIN mahasiswa m ON k.nim = m.nim
JOIN matakuliah mk ON k.kode_mk = mk.kode_mk;

-- PRAKTIKUM 4 : Update & Delete
UPDATE mahasiswa
SET jurusan = 'Teknik Informatika'
WHERE nim = '20231001';

DELETE FROM matakuliah WHERE kode_mk = 'IF1003';

-- TUGAS AKHIR : Tambahan 2 Tabel
CREATE TABLE dosen (
    nidn CHAR(10) PRIMARY KEY,
    nama_dosen VARCHAR(50) NOT NULL,
    prodi VARCHAR(30)
);

CREATE TABLE nilai (
    id_nilai INT AUTO_INCREMENT PRIMARY KEY,
    id_krs INT,
    nilai CHAR(2),
    FOREIGN KEY (id_krs) REFERENCES krs(id_krs)
);

-- Insert data dosen
INSERT INTO dosen (nidn, nama_dosen, prodi) VALUES
('D001', 'Dr. Suryanto', 'Informatika'),
('D002', 'Dr. Ratna', 'Sistem Informasi'),
('D003', 'Dr. Joko', 'Informatika');

-- Insert data nilai
INSERT INTO nilai (id_krs, nilai) VALUES
(1, 'A'),
(2, 'B'),
(3, 'A');
