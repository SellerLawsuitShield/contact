
<!DOCTYPE html>
<html lang="en">
<head>
<!-- Shared: Encoding, CSS, JS, etc. -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="../../styles.css">
<script src="../../script.js" defer></script>
<script src="../../visitor-tracker.js"></script>
<link rel="icon" href="../../favicon.ico" type="image/x-icon">

    <title>Send Your Feedback</title>
	<meta name="description" content="Send us your feedback" />
</head>
<body>
    <header>
     <div class="header-container">
        <img src="../../images/unbreakable-will.png" alt="unbreakable will Logo" class="logo">
    </div>
</header>

    <main>
        <h1 style="text-align: center;">Send Us Your Feedback</h1>
        <section id="contact-form-section">
            <form id="contactForm" method="POST" action="index-handler.php">
    <input type="hidden" name="form_token" value="secure-token-123"> 
    
    <div>
        <label for="firstName">Name <span>*</span></label>
        <input type="text" name="firstName" placeholder="First" required maxlength="35">
        <input type="text" name="lastName" placeholder="Last" required maxlength="35">
    </div>
    
    <div><br>
        <label for="email">Email <span>*</span></label>
        <input type="email" name="email" placeholder="Your Email" required maxlength="80">
    </div><br>
    
    <div>
        <label for="subject">Subject <span>*</span></label>
        <input type="text" name="subject" placeholder="Subject" required maxlength="50">
    </div><br>
    
    <div>
        <label for="message">Message <span>*</span></label>
        <textarea name="message" placeholder="Type your feedback here..." rows="6" required maxlength="2000"></textarea>
    </div><br>

    <!-- Honeypot Field (Hidden from Humans) -->
    <div style="display:none;">
        <label for="trap">Leave this field empty</label>
        <input type="text" name="trap" id="trap">
    </div>

    <!-- Math Question -->
    <div class="math-question">
        <label id="mathQuestionLabel" for="mathAnswer"></label>
        <input type="text" name="mathAnswer" id="mathAnswer" placeholder="Your Answer" required>
        <input type="hidden" name="correctAnswer" id="correctAnswer">
    </div>

    <button type="submit" class="submit-button">Submit</button>
</form>

            <div id="successMessage" style="display: none;" class="success-message">
                Thank you for contacting us! We will be in touch with you shortly.
            </div>
        </section>
    </main>
    <script>
    document.addEventListener("DOMContentLoaded", function() {
    const mathQuestionLabel = document.getElementById("mathQuestionLabel");
    const correctAnswerInput = document.getElementById("correctAnswer");

    // Generate a random math question
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 * num2;

    mathQuestionLabel.textContent = `What is ${num1} times ${num2}?`;
    correctAnswerInput.value = correctAnswer;

    document.getElementById('contactForm').onsubmit = function (e) {
        e.preventDefault();
        const form = e.target;

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
        })
        .then(response => response.text())
        .then(data => {
            if (data === 'success') {
                form.style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
            } else {
                alert(data);  // Show any error messages
            }
        })
        .catch(error => console.error('Error:', error));
    };

});  // This closes the entire DOMContentLoaded block

function logEntry($status, $reason, $ip, $ipType, $country, $firstName, $lastName, $email, $subject, $logFile, $date, $formSource) {
    $logEntry = "$date | Form: $formSource | Status: $status | Reason: $reason | IP: $ip | IP Type: $ipType | Country: $country | Name: $firstName $lastName | Email: $email | Subject: $subject\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}
</script>
<footer>
<p>&copy; 2025 Unbreakable Will</p>
</footer>
</body>
</html>
