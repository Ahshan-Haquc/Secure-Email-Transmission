async function sendMessage() {
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (!email || !message) {
        alert('Please fill in both fields.');
        return;
    }

    const response = await fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
    });

    const data = await response.json();
    alert(data.message);
}
