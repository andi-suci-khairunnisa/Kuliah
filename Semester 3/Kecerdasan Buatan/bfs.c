#include<stdio.h>
#include<stdlib.h>

#define MAX 50

// Struktur node untuk Queue
typedef struct Queue {
    int items[MAX];
    int front;
    int rear;
} Queue;

/*Inisialisasi queue kosong. front = -1 dan rear = -1 menandakan queue belum berisi elemen. Digunakan sebelum BFS dimulai*/
void initQueue(Queue* q) {
    q->front = -1;
    q->rear = -1;
}

//Cek apakah queue kosong. Jika kosong, return 1 (true), jika tidak return 0 (false).
int isEmpty(Queue* q) {
    return q->rear == - 1;
}

//Menambahkan elemen ke dalam queue. Jika queue penuh, cetak pesan error.
void enqueue(Queue *q, int value) {
    if (q->rear == MAX - 1) {
        printf("Queuenya penuh!\n");
        return;
    }
    if (q->front == -1) q->front = 0;
    q->rear++;
    q->items[q->rear]= value;
}

//Mengambil elemen dari depan queue. Jika queue kosong, cetak pesan error dan return -1.
int dequeue (Queue *q) {
    if (isEmpty(q)) {
        printf("Queuenya kosong!\n");
        return -1;
    }
    int item = q->items[q->front];
    q->front++;
    if (q->front > q->rear) {
        q->front = q->rear = -1;
    }
    return item;
}

// Graph menggunakan adjacency list
int adj[MAX][MAX];
int visited[MAX];
int n; // jumlah node

/*Fungsi BFS. Langkah kerja:
Inisialisasi queue kosong.
Tandai start sebagai visited lalu enqueue.
Selama queue belum kosong:
    dequeue node paling depan(current).
    Cetak node tersebut.
    Cek semua tetangga (adj[current][i]): jika belum dikunjungi-> masukkan ke queue + tandai visited.
Hasil traversal BFS dicetak ke layar.\*/
void bfs(int start) {
    Queue q;
    initQueue(&q);
    visited[start] = 1;
    enqueue(&q, start);

    while (!isEmpty(&q)) {
        int current = dequeue(&q);
        printf("Kunjungi node: %d\n", current);

        for (int i = 0; i < n; i++) {
            if (adj[current][i] == 1 && !visited[i]) {
                enqueue(&q, i);
                visited[i] = 1;
            }
        }
    }
}

int main(){
    n = 9; // jumlah node sesuai di modul

    // Inisialisasi adjacency matrix 
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            adj[i][j] = 0;
        }
        visited[i] = 0;
    }

    // Menambahkan edges sesuai di modul
    adj[1][2] = 1; adj[2][1] = 1;
    adj[2][3] = 1; adj[3][2] = 1;
    adj[3][4] = 1; adj[4][3] = 1;    
    adj[4][5] = 1; adj[5][4] = 1;
    adj[4][6] = 1; adj[6][4] = 1;
    adj[5][7] = 1; adj[7][5] = 1;
    adj[6][8] = 1; adj[8][6] = 1;

    // printf("Hasil BFS mulai dari node 3:\n");
    // bfs(3);

    printf("Hasil BFS mulai dari node 1:\n");
    bfs(1);

    return 0;
}