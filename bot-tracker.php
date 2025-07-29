<?php
date_default_timezone_set('America/Edmonton'); // Adjust if needed

// Define known bots and friendly names
$knownBots = [
    'Googlebot' => ['name' => 'Googlebot', 'type' => 'Search Engine'],
    'Bingbot' => ['name' => 'Bingbot', 'type' => 'Search Engine'],
    'Slurp' => ['name' => 'Yahoo Slurp', 'type' => 'Search Engine'],
    'DuckDuckBot' => ['name' => 'DuckDuckBot', 'type' => 'Search Engine'],
    'Baiduspider' => ['name' => 'Baiduspider', 'type' => 'Search Engine'],
    'YandexBot' => ['name' => 'YandexBot', 'type' => 'Search Engine'],
    'Sogou' => ['name' => 'Sogou Spider', 'type' => 'Search Engine'],
    'Exabot' => ['name' => 'Exabot', 'type' => 'Search Engine'],
    'facebot' => ['name' => 'Facebook Bot', 'type' => 'Social Media'],
    'facebookexternalhit' => ['name' => 'Facebook Crawler', 'type' => 'Social Media'],
    'twitterbot' => ['name' => 'Twitterbot', 'type' => 'Social Media'],
    'Pinterest' => ['name' => 'Pinterest Bot', 'type' => 'Social Media']
];

// Retrieve User-Agent
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$botDetected = false;
$botName = 'Unknown Bot';
$botType = 'Unknown';

foreach ($knownBots as $keyword => $details) {
    if (stripos($userAgent, $keyword) !== false) {
        $botDetected = true;
        $botName = $details['name'];
        $botType = $details['type'];
        break;
    }
}

if ($botDetected) {
    $date      = date("F j, Y g:i A");
    $ip        = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $page      = basename($_SERVER['PHP_SELF']);
    $referrer  = $_SERVER['HTTP_REFERER'] ?? 'Direct';
    $status    = 'Detected';

    // Log format: Date | Bot Name | User Agent | IP Address | Web Page | Referrer | Bot Type | Status
    $logLine = "$date | $botName | $userAgent | $ip | $page | $referrer | $botType | $status\n";

    $logFile = __DIR__ . '/Logging-Dashboard/Bot-Logs/bot-visits.log';
    file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);
}
?>
