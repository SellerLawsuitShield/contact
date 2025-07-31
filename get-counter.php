<?php
$logFile = 'download-counter.txt';

// Get real number of logged downloads
$realCount = file_exists($logFile) ? count(file($logFile)) : 0;

// Manual adjustment: change this number to inflate or deflate total downloads
$manualOffset = 0;  // Set to 0 if you don't want any manual boost

// Final counter result
$totalCount = $realCount + $manualOffset;

// Output for JavaScript fetch
echo $totalCount;
?>