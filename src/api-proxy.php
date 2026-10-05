<?php
$file = isset($_GET['file']) ? basename($_GET['file']) : '';
if (!$file || !preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $file)) { http_response_code(404); exit; }
$path = $_SERVER['DOCUMENT_ROOT'] . '/../ecommerce_backend/uploads/' . $file;
if (!file_exists($path)) { http_response_code(404); exit; }
$mime = mime_content_type($path);
header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=31536000');
readfile($path);
