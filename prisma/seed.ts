import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Menjalankan seeding data akademik Semester 3...");

  // 1. Bersihkan database lama (jika ada)
  await prisma.taskLink.deleteMany();
  await prisma.taskChecklist.deleteMany();
  await prisma.task.deleteMany();
  await prisma.courseMeeting.deleteMany();
  await prisma.course.deleteMany();
  await prisma.appConfig.deleteMany();

  // 2. Buat AppConfig awal (PIN default "1234" untuk pengujian Phase 2)
  const salt = await bcrypt.genSalt(10);
  const realPinHash = await bcrypt.hash("1234", salt);

  await prisma.appConfig.create({
    data: {
      id: "singleton",
      pinHash: realPinHash,
      themePreference: "dark",
    },
  });

  // 3. Matkul 1: Struktur Data & Algoritma
  const sda = await prisma.course.create({
    data: {
      name: "Struktur Data & Algoritma",
      code: "IF2110",
      credits: 3,
      color: "#7DA7D9", // Soft Cobalt
      lecturer: "Dr. Ir. Budi Santoso, M.T.",
      scheduleDay: "Senin",
      startTime: "08:00",
      endTime: "10:30",
      room: "Lab Komputer 2",
    },
  });

  const sdaTopics = [
    "Pengantar Analisis Kompleksitas & Asimptotik Big-O",
    "Array Dinamis & Singly Linked List",
    "Doubly Linked List & Circular Linked List",
    "Stack & Queue: Implementasi dan Aplikasi Parsing",
    "Binary Tree & Binary Search Tree (BST)",
    "Self-Balancing Trees: AVL Tree & Red-Black Tree",
    "Heap, Priority Queue, dan Huffman Coding",
    "Ujian Tengah Semester (UTS)",
    "Representasi Graph: Adjacency Matrix & Adjacency List",
    "Graph Traversal: Breadth-First Search (BFS) & DFS",
    "Shortest Path: Algoritma Dijkstra & Bellman-Ford",
    "Minimum Spanning Tree (MST): Prim & Kruskal",
    "Hash Table, Hash Functions, and Collision Resolution",
    "Sorting Lanjut: Quick Sort, Merge Sort, Radix Sort",
    "Pengantar Dynamic Programming & Memoization",
    "Ujian Akhir Semester (UAS)",
  ];

  const sdaMeetings = [];
  for (let i = 0; i < 16; i++) {
    const meeting = await prisma.courseMeeting.create({
      data: {
        courseId: sda.id,
        weekNumber: i + 1,
        title: sdaTopics[i],
        notes: i === 4 ? "Catatan Dosen: Fokus pada rotasi kiri dan kanan pada AVL Tree." : null,
      },
    });
    sdaMeetings.push(meeting);
  }

  // 4. Matkul 2: Sistem Basis Data
  const sbd = await prisma.course.create({
    data: {
      name: "Sistem Basis Data",
      code: "IF2120",
      credits: 3,
      color: "#2F4860", // Deep Navy
      lecturer: "Prof. Maya Indriani, Ph.D.",
      scheduleDay: "Rabu",
      startTime: "10:00",
      endTime: "12:30",
      room: "R.304",
    },
  });

  const sbdTopics = [
    "Pengenalan Basis Data & Arsitektur DBMS",
    "Entity-Relationship Diagram (ERD) Modeling",
    "Enhanced ERD (EERD) & Konversi Relasional",
    "Aljabar Relasional & Kalkulus Relasional",
    "SQL Dasar: DDL, DML, dan Constraint",
    "SQL Lanjut: Nested Queries, Joins, & Aggregation",
    "Normalisasi Basis Data (1NF, 2NF, 3NF, BCNF)",
    "Ujian Tengah Semester (UTS)",
    "Indexing & B-Tree / Hash Indexing",
    "Query Processing & Query Optimization",
    "Manajemen Transaksi & Karakteristik ACID",
    "Concurrency Control: Locking & Serializability",
    "Database Recovery Techniques & Logging",
    "Pengenalan NoSQL: Document & Key-Value Stores",
    "Keamanan Basis Data & Role-Based Access Control",
    "Ujian Akhir Semester (UAS)",
  ];

  for (let i = 0; i < 16; i++) {
    await prisma.courseMeeting.create({
      data: {
        courseId: sbd.id,
        weekNumber: i + 1,
        title: sbdTopics[i],
      },
    });
  }

  // 5. Matkul 3: Pemrograman Berorientasi Objek
  const pbo = await prisma.course.create({
    data: {
      name: "Pemrograman Berorientasi Objek",
      code: "IF2130",
      credits: 4,
      color: "#99BCE4", // Ice Soft Blue
      lecturer: "Hendra Wijaya, M.Kom.",
      scheduleDay: "Kamis",
      startTime: "13:00",
      endTime: "16:20",
      room: "Lab Rekayasa Perangkat Lunak",
    },
  });

  for (let i = 0; i < 16; i++) {
    await prisma.courseMeeting.create({
      data: {
        courseId: pbo.id,
        weekNumber: i + 1,
        title: `Pertemuan ${i + 1}: Materi & Praktikum OOP`,
      },
    });
  }

  // 6. Matkul 4: Matematika Diskrit
  const matdis = await prisma.course.create({
    data: {
      name: "Matematika Diskrit",
      code: "MA2101",
      credits: 3,
      color: "#FEF08A", // Butter Yellow
      lecturer: "Siti Rahmawati, M.Si.",
      scheduleDay: "Selasa",
      startTime: "08:00",
      endTime: "10:30",
      room: "R.201",
    },
  });

  for (let i = 0; i < 16; i++) {
    await prisma.courseMeeting.create({
      data: {
        courseId: matdis.id,
        weekNumber: i + 1,
        title: `Pertemuan ${i + 1}: Topik Matematika Diskrit`,
      },
    });
  }

  // 7. Buat Tugas Sampel Realistis
  const now = new Date();

  // Task 1: Due Besok (Urgensi Tinggi / Fokus Hari Ini)
  const deadlineTomorrow = new Date(now);
  deadlineTomorrow.setDate(now.getDate() + 1);
  deadlineTomorrow.setHours(23, 59, 0, 0);

  const task1 = await prisma.task.create({
    data: {
      title: "Implementasi Binary Search Tree & AVL Tree",
      description: "Buat program CLI di bahasa C++/Java untuk operasi insert, delete, dan search pada AVL Tree dengan visualisasi rotasi balance factor.",
      instructions: "1. Kode program harus modular.\n2. Sertakan screenshot hasil run pada terminal.\n3. Format file laporan: `NIM_Nama_Tugas5.pdf`.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      isImportant: true,
      deadline: deadlineTomorrow,
      courseId: sda.id,
      meetingId: sdaMeetings[4].id, // Week 5
    },
  });

  await prisma.taskChecklist.createMany({
    data: [
      { taskId: task1.id, title: "Baca modul pertemuan Week 5", isCompleted: true, order: 1 },
      { taskId: task1.id, title: "Implementasi fungsi rotasi kiri & kanan", isCompleted: true, order: 2 },
      { taskId: task1.id, title: "Testing test case input angka acak", isCompleted: false, order: 3 },
      { taskId: task1.id, title: "Susun laporan PDF dan upload ke Google Drive", isCompleted: false, order: 4 },
    ],
  });

  await prisma.taskLink.createMany({
    data: [
      { taskId: task1.id, title: "Materi Slide Pertemuan 5", url: "https://classroom.google.com" },
      { taskId: task1.id, title: "Template Laporan Praktikum", url: "https://docs.google.com" },
    ],
  });

  // Task 2: Due 3 Hari Lagi (Normal)
  const deadlineIn3Days = new Date(now);
  deadlineIn3Days.setDate(now.getDate() + 3);
  deadlineIn3Days.setHours(23, 59, 0, 0);

  const task2 = await prisma.task.create({
    data: {
      title: "Normalisasi Skema Database Toko Online ke 3NF",
      description: "Diberikan tabel unnormalized data transaksi e-commerce. Lakukan dekomposisi hingga mencapai Third Normal Form (3NF).",
      status: "TODO",
      priority: "MEDIUM",
      deadline: deadlineIn3Days,
      courseId: sbd.id,
    },
  });

  await prisma.taskChecklist.createMany({
    data: [
      { taskId: task2.id, title: "Identifikasi Functional Dependencies (FD)", isCompleted: false, order: 1 },
      { taskId: task2.id, title: "Dekomposisi ke 1NF dan 2NF", isCompleted: false, order: 2 },
      { taskId: task2.id, title: "Uji transitive dependency untuk 3NF", isCompleted: false, order: 3 },
    ],
  });

  // Task 3: Overdue (Kemarin) untuk menguji penanda visual Overdue
  const deadlineYesterday = new Date(now);
  deadlineYesterday.setDate(now.getDate() - 1);
  deadlineYesterday.setHours(23, 59, 0, 0);

  await prisma.task.create({
    data: {
      title: "Latihan Soal Logika Proposisi & Ekuivalensi",
      description: "Kerjakan 10 soal di buku referensi Rosen bab 1.3.",
      status: "TODO",
      priority: "MEDIUM",
      deadline: deadlineYesterday,
      courseId: matdis.id,
    },
  });

  // Task 4: Selesai (Done) untuk metrik
  const taskDone = await prisma.task.create({
    data: {
      title: "Review Silabus & Pembentukan Kelompok Proyek OOP",
      status: "DONE",
      priority: "LOW",
      deadline: deadlineYesterday,
      courseId: pbo.id,
    },
  });

  console.log("✅ Seeding selesai! Database kini memiliki 4 mata kuliah, 64 pertemuan mingguan, dan 4 sampel tugas.");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
