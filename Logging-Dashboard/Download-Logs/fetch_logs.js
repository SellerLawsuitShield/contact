<?php
function logDownloadIfNewIP() {
    session_start();

    $ip = $_SESSION['ip'] ?? $_SERVER['REMOTE_ADDR'];
    $city = $_SESSION['city'] ?? 'Unknown';
    $region = $_SESSION['region'] ?? 'Unknown';
    $country = $_SESSION['countryFullName'] ?? 'Unknown';
    $ipType = $_SESSION['proxy'] ?? 'Unknown';
    $hostingType = $_SESSION['hosting'] ?? 'Unknown';
    $date = date("Y-m-d H:i:s"); // current format
    $formattedDate = date("F j, Y g:i A", strtotime($date));


    $logFile = 'download-counter.txt';

    // Check if IP already logged
    if (file_exists($logFile)) {
        $entries = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($entries as $entry) {
            if (strpos($entry, $ip) !== false) {
                return; // IP already logged
            }
        }
    }

    // Log the new IP
    $logEntry = "$formattedDate | $ip | $ipType | $hostingType | $city | $region | $country" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// If called directly, return line count
if (basename($_SERVER['PHP_SELF']) === 'download-counter.php') {
    echo file_exists('download-counter.txt') ? count(file('download-counter.txt')) : 0;
    exit;
}
?>
