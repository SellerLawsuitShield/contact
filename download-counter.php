<?php
function logDownloadIfNewIP() {
    session_start();

    $ip = $_SESSION['ip'] ?? $_SERVER['REMOTE_ADDR'];
    $city = $_SESSION['city'] ?? null;
    $region = $_SESSION['region'] ?? null;
    $country = $_SESSION['countryFullName'] ?? null;
    $ipType = $_SESSION['proxy'] ?? null;
    $hosting = $_SESSION['hosting'] ?? null;
    $download = $_SESSION['download'] ?? null;

    // Fallback lookup if session data missing
    if (!$city || !$region || !$country || !$ipType || $hosting === null) {
         // use https for consistency and check for presence of the hosting field
        $response = @file_get_contents("https://pro.ip-api.com/json/{$ip}?fields=city,regionName,country,proxy,hosting,status&key=RNraGZ4ub9516zy");
        $data = $response ? json_decode($response, true) : null;
        if ($data && ($data['status'] ?? null) === 'success') {
            $city = $city ?? ($data['city'] ?? 'Unknown');
            $region = $region ?? ($data['regionName'] ?? 'Unknown');
            $country = $country ?? ($data['country'] ?? 'Unknown');
            $ipType = $ipType ?? ($data['proxy'] ? 'Proxy/VPN' : 'Normal');
            $hosting = $hosting ?? (array_key_exists('hosting', $data) ? ($data['hosting'] ? 'true' : 'false') : 'Unknown');
        }
    }

    $city = $city ?? 'Unknown';
    $region = $region ?? 'Unknown';
    $country = $country ?? 'Unknown';
    $ipType = $ipType ?? 'Unknown';
    $hosting = $hosting ?? 'Unknown';
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
    $logEntry = "$formattedDate | $ip | $ipType | $download | $city | $region | $country | $referrer" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// If called directly, return line count
if (basename($_SERVER['PHP_SELF']) === 'download-counter.php') {
    echo file_exists('download-counter.txt') ? count(file('download-counter.txt')) : 0;
    exit;
}
?>