<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

$conn = db_connect();
if ($conn) {
    echo "Koneksi berhasil ke database PostgreSQL!";
}
?>