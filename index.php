<?php session_start();
$_SESSION['referrer'] = $_SESSION['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? 'Direct Visit');
?>
<?php include 'blocked-countries-ips.php'; ?>
<?php include 'bot-tracker.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GSWWRZP7ER"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-GSWWRZP7ER');
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W53YM53D7K"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-W53YM53D7K');
</script>
   <link rel="icon" href="favicon.ico" type="image/x-icon">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unbreakable Will – Download the Book</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: auto;
      padding: 30px;
      background: white;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      margin-top: 50px;
    }
    h1, h2 {
      color: #222;
      text-align: center;
    }
    .button {
      display: block;
      width: 100%;
      padding: 15px;
      background: #0077cc;
      color: white;
      text-align: center;
      text-decoration: none;
      font-size: 1.2em;
      border-radius: 8px;
      margin: 20px 0;
    }
    .note {
      font-style: italic;
      font-size: 0.95em;
      text-align: center;
    }
    .counter {
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
      font-size: 1.1em;
    }
    .footer {
      text-align: center;
      font-size: 0.85em;
      color: #666;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1><em>Invisible Bruises, Unbreakable Will</em></h1>
    <h2>By James Whitfield</h2>

    <p><strong>Truth. Trauma. Resilience. Justice.</strong></p>

    <p>This is not just a book. It's a story that was almost never told — and now it's being shared with the world. Inside these pages is a raw, personal journey through bullying, mental health, abuse, corruption, grief, and redemption.</p>

    <p>It’s a wake-up call for those who’ve been ignored. A warning for those who trust the system. And a message of hope for anyone who’s ever felt like giving up.</p>

    <a class="button" href="download.php">📖 Download the Book (Free PDF)</a>
    <h3>📥 Download the Book (Non-Political Version)</h3>
<p>This version of <strong>Unbreakable Will</strong> has the two pages near the end (which discuss Canadian politics and endorse a specific candidate) removed.</p>
<p>If you want to share the story without political content — for schools, colleagues, or personal reasons — this version is ideal.</p>
<a class="button" href="download1.php">Download Non-Political Version (Free PDF)</a>
<a class="button" href="Launch-Instructions.pdf" target="_blank">📄 Read the Launch Instructions (PDF)</a>

<div class="counter">
  📥 Total Downloads: <span id="counter">Loading...</span><br>
  🎯 Goal: Beat <em>The Art of the Deal</em> – 1,000,000+ copies sold<br>
     Released: November, 1987
</div>

    <p class="note">This book is 100% free. You may share it with others as long as the file remains unaltered.</p>

    <p style="text-align:center;">📢 Share the movement. Spread the message. Help us go viral.</p>

    <div class="footer">
      &copy; 2025 James Whitfield – All Rights Reserved<br>
      This website does not track personal data. Only anonymous download counts are recorded for transparency.
    </div>
  </div>

  <script>
  // Fetch and display unique download count
  document.addEventListener('DOMContentLoaded', () => {
    fetch('get-counter.php')
      .then(res => res.text())
      .then(data => {
        document.getElementById('counter').innerText = Number(data).toLocaleString();
      })
      .catch(() => {
        document.getElementById('counter').innerText = 'Unavailable';
      });
  });
</script>
  <h3 style="text-align:center; margin-top:40px;">📣 Share This Book</h3>
<p style="text-align:center;">Help spread the truth. Share <em>Unbreakable Will</em> with others.</p>

<div style="text-align:center; margin-bottom: 20px;">
  <a href="https://twitter.com/intent/tweet?text=Download%20%23UnbreakableWill%20by%20James%20Whitfield%20%E2%80%93%20a%20powerful%20true%20story%20about%20resilience%2C%20trauma%2C%20and%20justice.%20Get%20it%20free%20here%3A&url=https%3A%2F%2Funbreakable-will.com" target="_blank" style="margin: 0 10px;">🐦 Tweet</a>

  <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Funbreakable-will.com" target="_blank" style="margin: 0 10px;">📘 Facebook</a>

  <a href="https://www.reddit.com/submit?url=https%3A%2F%2Funbreakable-will.com&title=Unbreakable%20Will%20%E2%80%93%20A%20true%20story%20of%20resilience%20and%20redemption" target="_blank" style="margin: 0 10px;">👽 Reddit</a>

  <a href="https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Funbreakable-will.com&title=Unbreakable%20Will%20by%20James%20Whitfield&summary=A%20free%20book%20about%20resilience%2C%20corruption%2C%20and%20mental%20health.%20Read%20and%20share." target="_blank" style="margin: 0 10px;">💼 LinkedIn</a>
</div>

</body>
</html>
