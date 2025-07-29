<?php
include 'download-counter.php';
logDownloadIfNewIP();  // Log visitor safely

$file = 'Unbreakable-Will-Full.pdf'; // or Unbreakable-Will-1.pdf for download1.php

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
header('Content-Length: ' . filesize($file));
readfile($file);
exit;
