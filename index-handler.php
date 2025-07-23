<?php include 'blocked-countries-ips.php'; ?>
<?php
// Start output buffering
ob_start();

// Proxy/VPN blocking toggle
$BlockProxy = 'Yes';  // Set to 'Yes' to block VPN/Proxy, 'No' to allow them

// Set default status and reason
$status = 'Success';
$reason = 'None';

// Get IP address and current time in MST
$ip = $_SERVER['REMOTE_ADDR'];
date_default_timezone_set('America/Denver');
$date = date("F j, Y g:i A");

// Get visitor country using ipinfo.io
$country = 'Unknown';
$countryNames = [
    "AF" => "Afghanistan", "AL" => "Albania", "DZ" => "Algeria", "AS" => "American Samoa", "AD" => "Andorra",
    "AO" => "Angola", "AI" => "Anguilla", "AQ" => "Antarctica", "AG" => "Antigua and Barbuda", "AR" => "Argentina",
    "AM" => "Armenia", "AW" => "Aruba", "AU" => "Australia", "AT" => "Austria", "AZ" => "Azerbaijan",
    "BS" => "Bahamas", "BH" => "Bahrain", "BD" => "Bangladesh", "BB" => "Barbados", "BY" => "Belarus",
    "BE" => "Belgium", "BZ" => "Belize", "BJ" => "Benin", "BM" => "Bermuda", "BT" => "Bhutan",
    "BO" => "Bolivia", "BA" => "Bosnia and Herzegovina", "BW" => "Botswana", "BR" => "Brazil", "BN" => "Brunei",
    "BG" => "Bulgaria", "BF" => "Burkina Faso", "BI" => "Burundi", "KH" => "Cambodia", "CM" => "Cameroon",
    "CA" => "Canada", "CV" => "Cape Verde", "KY" => "Cayman Islands", "CF" => "Central African Republic",
    "TD" => "Chad", "CL" => "Chile", "CN" => "China", "CO" => "Colombia", "KM" => "Comoros",
    "CG" => "Congo", "CR" => "Costa Rica", "HR" => "Croatia", "CU" => "Cuba", "CY" => "Cyprus",
    "CZ" => "Czechia", "DK" => "Denmark", "DJ" => "Djibouti", "DM" => "Dominica", "DO" => "Dominican Republic",
    "EC" => "Ecuador", "EG" => "Egypt", "SV" => "El Salvador", "GQ" => "Equatorial Guinea", "ER" => "Eritrea",
    "EE" => "Estonia", "ET" => "Ethiopia", "FJ" => "Fiji", "FI" => "Finland", "FR" => "France", "GA" => "Gabon",
    "GM" => "Gambia", "GE" => "Georgia", "DE" => "Germany", "GH" => "Ghana", "GR" => "Greece", "GD" => "Grenada",
    "GT" => "Guatemala", "GN" => "Guinea", "GW" => "Guinea-Bissau", "GY" => "Guyana", "HT" => "Haiti",
    "HN" => "Honduras", "HK" => "Hong Kong", "HU" => "Hungary", "IS" => "Iceland", "IN" => "India",
    "ID" => "Indonesia", "IR" => "Iran", "IQ" => "Iraq", "IE" => "Ireland", "IL" => "Israel", "IT" => "Italy",
    "JM" => "Jamaica", "JP" => "Japan", "JO" => "Jordan", "KZ" => "Kazakhstan", "KE" => "Kenya",
    "KI" => "Kiribati", "KW" => "Kuwait", "KG" => "Kyrgyzstan", "LA" => "Laos", "LV" => "Latvia",
    "LB" => "Lebanon", "LS" => "Lesotho", "LR" => "Liberia", "LY" => "Libya", "LI" => "Liechtenstein",
    "LT" => "Lithuania", "LU" => "Luxembourg", "MO" => "Macao", "MK" => "North Macedonia", "MG" => "Madagascar",
    "MW" => "Malawi", "MY" => "Malaysia", "MV" => "Maldives", "ML" => "Mali", "MT" => "Malta", "MH" => "Marshall Islands",
    "MR" => "Mauritania", "MU" => "Mauritius", "MX" => "Mexico", "FM" => "Micronesia", "MD" => "Moldova",
    "MC" => "Monaco", "MN" => "Mongolia", "ME" => "Montenegro", "MA" => "Morocco", "MZ" => "Mozambique",
    "MM" => "Myanmar", "NA" => "Namibia", "NR" => "Nauru", "NP" => "Nepal", "NL" => "Netherlands",
    "NZ" => "New Zealand", "NI" => "Nicaragua", "NE" => "Niger", "NG" => "Nigeria", "NO" => "Norway",
    "OM" => "Oman", "PK" => "Pakistan", "PW" => "Palau", "PA" => "Panama", "PG" => "Papua New Guinea",
    "PY" => "Paraguay", "PE" => "Peru", "PH" => "Philippines", "PL" => "Poland", "PT" => "Portugal",
    "QA" => "Qatar", "RO" => "Romania", "RU" => "Russia", "RW" => "Rwanda", "WS" => "Samoa",
    "SM" => "San Marino", "ST" => "Sao Tome and Principe", "SA" => "Saudi Arabia", "SN" => "Senegal",
    "RS" => "Serbia", "SC" => "Seychelles", "SL" => "Sierra Leone", "SG" => "Singapore", "SK" => "Slovakia",
    "SI" => "Slovenia", "SO" => "Somalia", "ZA" => "South Africa", "KR" => "South Korea", "SS" => "South Sudan",
    "ES" => "Spain", "LK" => "Sri Lanka", "SD" => "Sudan", "SR" => "Suriname", "SE" => "Sweden",
    "CH" => "Switzerland", "SY" => "Syria", "TW" => "Taiwan", "TJ" => "Tajikistan", "TZ" => "Tanzania",
    "TH" => "Thailand", "TL" => "Timor-Leste", "TG" => "Togo", "TO" => "Tonga", "TT" => "Trinidad and Tobago",
    "TN" => "Tunisia", "TR" => "Turkey", "TM" => "Turkmenistan", "TV" => "Tuvalu", "UG" => "Uganda",
    "UA" => "Ukraine", "AE" => "United Arab Emirates", "GB" => "United Kingdom", "US" => "United States",
    "UY" => "Uruguay", "UZ" => "Uzbekistan", "VU" => "Vanuatu", "VA" => "Vatican City", "VE" => "Venezuela",
    "VN" => "Vietnam", "YE" => "Yemen", "ZM" => "Zambia", "ZW" => "Zimbabwe"
];

function detectLanguage($text) {
    $apiKey = "44d0a72cd10f8efc27731d86cf931183"; // Your API Key
    $url = "https://ws.detectlanguage.com/0.2/detect";

    $data = http_build_query(['q' => $text]);
    $options = [
    "http" => [
        "header" => [
            "Authorization: Bearer $apiKey",
            "Content-Type: application/x-www-form-urlencoded"
        ],
        "method" => "POST",
        "content" => $data,
    ],
];

    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);

    if ($result === false) {
        return "Unknown"; // Return Unknown if API call fails
    }

    $response = json_decode($result, true);
    return $response['data']['detections'][0]['language'] ?? "Unknown";
}

// Get form data (sanitize it for safety)
$firstName = htmlspecialchars($_POST['firstName'] ?? 'Unknown', ENT_QUOTES, 'UTF-8');
$lastName = htmlspecialchars($_POST['lastName'] ?? 'Unknown', ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($_POST['email'] ?? 'Unknown', ENT_QUOTES, 'UTF-8');
$subject = htmlspecialchars($_POST['subject'] ?? 'No Subject', ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');

// Retrieve location & privacy details from ip-api.com (Pro plan)
$ip = $_SERVER['REMOTE_ADDR'];
$apiKey = 'RNraGZ4ub9516zy';  // Replace with your actual key
$ipApi = @json_decode(file_get_contents("https://pro.ip-api.com/json/{$ip}?key={$apiKey}&fields=status,message,countryCode,country,regionName,city,proxy"), true) ?: [];

$countryCode = $ipApi['countryCode'] ?? 'Unknown';
$country = $ipApi['country'] ?? $countryCode;
$region = $ipApi['regionName'] ?? 'NA';
$city = $ipApi['city'] ?? 'NA';

// Detect if the IP is a proxy/VPN
$ipType = 'Normal';
if ($BlockProxy === 'Yes' && !empty($ipApi['proxy'])) {
    $ipType = 'Proxy';
}

// Block submission if Proxy/VPN detected
if ($BlockProxy === 'Yes' && $ipType === 'Proxy') {
    logEntry('Blocked', 'VPN/Proxy detected', $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
    http_response_code(400);
    ob_end_clean();
    echo "Blocked: VPN or Proxy detected.";
    exit;
}


// Caching blocklist to avoid multiple file reads
function loadBlocklist($type) {
    static $blocklistCache = [];
    $blocklistFile = __DIR__ . "/Logging-Dashboard/Contact-Logs/blocklist.txt";

    if (!isset($blocklistCache['data']) || filemtime($blocklistFile) !== ($blocklistCache['lastModified'] ?? 0)) {
        // File changed or cache is empty—reload
        if (!file_exists($blocklistFile)) return [];  // If the file doesn't exist, return an empty array.

        $lines = file($blocklistFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $parsedBlocklist = [];

        foreach ($lines as $line) {
            [$key, $value] = explode(':', $line, 2);
            $parsedBlocklist[trim($key)][] = trim($value);
        }

        // Store in cache
        $blocklistCache['data'] = $parsedBlocklist;
        $blocklistCache['lastModified'] = filemtime($blocklistFile);
    }

    return $blocklistCache['data'][$type] ?? [];
}

// Check if a value matches the blocklist
function matchesBlocklist($value, $blocklist) {
    foreach ($blocklist as $blocked) {
        if (stripos($value, trim($blocked)) !== false) return true;
    }
    return false;
}


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Prepare log folder and file
$logFolder = __DIR__ . "/Logging-Dashboard/Contact-Logs";
$logFile = $logFolder . "/contact-forms.log";

// Ensure log folder exists
if (!is_dir($logFolder)) {
    mkdir($logFolder, 0755, true);
}

// Determine form source dynamically
$formSource = str_replace('-handler.php', '', basename(__FILE__));


// Function to log entries
function logEntry($status, $reason, $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource) {
    $date = str_replace('"', '', $date); // Remove quotes safely
    $logEntry = "$date | $formSource | $status | $reason | $ip | $ipType | $city | $region | $country\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// Unified "Form Bypassed" Check
if (
    !isset($_POST["correctAnswer"]) || !isset($_POST["mathAnswer"]) || 
    !isset($_POST['form_token']) || $_POST['form_token'] !== 'secure-token-123'
) {
    logEntry('Blocked', 'Form Bypassed', $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
	session_unset();
	$_SESSION['blocked_submission'] = true;
    session_destroy(); // ❌ End session immediately if blocked
    http_response_code(400);
    ob_end_clean();
    echo "Blocked: Form Bypassed.";
    exit;
}

// Check for honeypot trap
if (!empty($_POST["trap"])) {
    logEntry('Blocked', 'Bot Submission Detected', $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
	session_unset();
	$_SESSION['blocked_submission'] = true;
    session_destroy(); // ❌ End session immediately if blocked
    http_response_code(400);
    ob_end_clean();
    echo "Blocked: Bot Submission Detected.";
    exit;
}

// Single blocklist check (Name, Email, Subject, Message)
$blockedReasons = []; // Array to store multiple reasons if needed
$fieldsToCheck = [
    'Name' => "$firstName $lastName",
    'Email' => $email,
    'Subject' => $subject,
    'Message' => $message
];

// Check for blocklist matches (Name, Email, Subject, Message)
foreach ($fieldsToCheck as $type => $value) {
    if (matchesBlocklist($value, loadBlocklist($type))) {
        $blockedReasons[] = "$type contains restricted content";
    }
}

// If at least one match is found, log and block
if (!empty($blockedReasons)) {
    $blockedReason = implode(', ', $blockedReasons); // Combine multiple reasons if needed
    logEntry('Blocked', $blockedReason, $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
    session_unset();
	$_SESSION['blocked_submission'] = true;
    session_destroy(); // ❌ End session immediately if blocked
    ob_end_clean();
    echo "success";  // Disguised as a successful submission.
    exit;
}

function loadBlockedLanguages($filePath) {
    $blockedLanguages = [];

    if (file_exists($filePath)) {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, 'Blocked: ') === 0) {
                $blockedLanguages[] = trim(str_replace('Blocked: ', '', $line));
            }
        }
    }

    return $blockedLanguages;
}

 
$correctAnswer = $_POST["correctAnswer"] ?? '';
$userAnswer = $_POST["mathAnswer"] ?? '';

if ($userAnswer != $correctAnswer) {
    logEntry('Blocked', 'Math Question Incorrect', $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
    
    ob_end_clean();
    echo "Incorrect answer to the math question.";
    exit;
}

$blockedLanguages = loadBlockedLanguages(__DIR__ . "/Logging-Dashboard/Contact-Logs/languages_allowed_blocked.txt");

// Normalize both detected and blocked languages for accurate comparison
$normalizedBlockedLanguages = array_map('strtolower', array_map('trim', $blockedLanguages));

$detectedLanguageCode = detectLanguage($message);

$languageMap = [
    "am" => "Amharic", "ar" => "Arabic", "eu" => "Basque", "bn" => "Bengali", "en-GB" => "English (UK)",
    "pt-BR" => "Portuguese (Brazil)", "bg" => "Bulgarian", "ca" => "Catalan", "chr" => "Cherokee", "hr" => "Croatian",
    "cs" => "Czech", "da" => "Danish", "nl" => "Dutch", "en" => "English (US)", "et" => "Estonian", "fil" => "Filipino",
    "fi" => "Finnish", "fr" => "French", "de" => "German", "el" => "Greek", "gu" => "Gujarati", "iw" => "Hebrew",
    "hi" => "Hindi", "hu" => "Hungarian", "is" => "Icelandic", "id" => "Indonesian", "it" => "Italian",
    "ja" => "Japanese", "kn" => "Kannada", "ko" => "Korean", "lv" => "Latvian", "lt" => "Lithuanian", "ms" => "Malay",
    "ml" => "Malayalam", "mr" => "Marathi", "no" => "Norwegian", "pl" => "Polish", "pt-PT" => "Portuguese (Portugal)",
    "ro" => "Romanian", "ru" => "Russian", "sr" => "Serbian", "zh-CN" => "Chinese (PRC)", "sk" => "Slovak",
    "sl" => "Slovenian", "es" => "Spanish", "sw" => "Swahili", "sv" => "Swedish", "ta" => "Tamil", "te" => "Telugu",
    "th" => "Thai", "zh-TW" => "Chinese (Taiwan)", "tr" => "Turkish", "ur" => "Urdu", "uk" => "Ukrainian",
    "vi" => "Vietnamese", "cy" => "Welsh"
];

// Convert detected language code to full name
$detectedLanguageName = $languageMap[$detectedLanguageCode] ?? $detectedLanguageCode;
$normalizedDetectedLanguage = strtolower(trim($detectedLanguageName));

if (in_array($normalizedDetectedLanguage, $normalizedBlockedLanguages)) {
    logEntry('Blocked', "Message Written in $detectedLanguageName", $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
    session_unset();
	$_SESSION['blocked_submission'] = true;
    session_destroy(); // ❌ End session immediately if blocked
    ob_end_clean();
    echo "success"; // Pretend success to the user
    exit;
}

// Proceed to send the email..


// Convert URLs in the message to clickable links
function makeLinksClickable($text) {
    $pattern = '/(https?:\/\/[^\s]+)/i';
    return preg_replace_callback($pattern, function ($matches) {
        $url = htmlspecialchars($matches[1], ENT_QUOTES, 'UTF-8');
        return "<a href=\"$url\" target=\"_blank\" rel=\"noopener noreferrer\">$url</a>";
    }, nl2br($text));
}

$message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
$messageWithLinks = makeLinksClickable($message);  // Keep only this conversion once.

// SMTP credentials
$smtpHost = "mail.qualitycellularparts.com";
$smtpUser = "mikelac@qualitycellularparts.com";
$smtpPass = "C1rmZyp3IDV2HKNOjc0fs6sl8KP@P3tQ@qCfknBJJS^X8j";
$smtpPort = 465;
$smtpSecure = 'ssl';

// Email recipient
$toEmail = "feedback@unbreakable-will.com";

// Initialize PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->SMTPDebug = 0; // Debug mode (set to 0 to disable debugging)
    $mail->Debugoutput = 'error_log'; // Log errors to PHP error log
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = $smtpSecure;
    $mail->Port = $smtpPort;

    $mail->setFrom($smtpUser, "Contact Form Submission");
    $mail->addAddress($toEmail);
    $mail->addReplyTo($email, "$firstName $lastName");
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = "
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> $firstName $lastName</p>
    <p><strong>Email:</strong> <a href='mailto:$email'>$email</a></p>
    <p><strong>Subject:</strong> $subject</p>
    <p><strong>Message:</strong><br>$messageWithLinks</p>
    <hr>
    <p><strong>Time Sent:</strong> <span style='color: #ff5733;'>$date</span></p>
    <p><strong>Sent from (City, Region, Country):</strong> <span style='color: #007bff;'>$city, $region, $country</span></p>
    <p><em>Message was sent from Contact Form on Seller Lawsuit Shield</em></p>
";

 if ($mail->send()) {
    logEntry('Success', 'None', $ip, $ipType, $country, $city, $region, $logFile, $date, $formSource);
    ob_end_clean();
    echo "success";
} else {
    error_log("PHPMailer send() returned false: " . $mail->ErrorInfo); // Log details
    ob_end_clean();
    echo "Message could not be sent. Mailer error: " . $mail->ErrorInfo;
}

} catch (Exception $e) {
    error_log("PHPMailer Exception: " . $e->getMessage()); // Log catch errors
    ob_end_clean();
    echo "Message could not be sent. Error: " . $e->getMessage();
}

?>