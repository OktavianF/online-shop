<?php
include 'config.php';

$conn = db_connect();
if ($conn) {
    echo "Koneksi berhasil ke PostgreSQL!";
} else {
    echo "Gagal koneksi.";
}
?>