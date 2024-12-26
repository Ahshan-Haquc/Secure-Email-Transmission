const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = require('./router');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CyberProject', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));



const app = express();

app.use(bodyParser.json());
app.use("/", router);
app.use(express.static('public'));


// Helper function: Calculate GCD
function gcd(a, b) {
    while (b !== 0n) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Helper function: Calculate modular inverse
function modInverse(e, phi) {
    let d = 1n;
    while ((e * d) % phi !== 1n) {
        d++;
    }
    return d;
}

// Generate RSA Keys
function generateKeys() {
    const p = 61n; // Small prime number
    const q = 53n; // Another small prime number
    const n = p * q; // Modulus
    const phi = (p - 1n) * (q - 1n); // Totient
    let e = 17n; // Public exponent
    while (gcd(e, phi) !== 1n) {
        e++;
    }
    const d = modInverse(e, phi); // Private key exponent

    console.log("p = ",p,"and q = ",q);
    console.log(`e = ${e} and n = ${n}`);
    console.log(`d = ${d} and n = ${n}\n`);

    return { publicKey: { e, n }, privateKey: { d, n } };
}

// Generate keys globally
const { publicKey, privateKey } = generateKeys();

console.log("RSA Keys Generated:");
console.log("Public Key:", publicKey);
console.log("Private Key:", privateKey);
console.log("\n \n----------Connection with Database---------");

// Route to handle message
app.post('/send-message', async (req, res) => {
    const { email, message } = req.body;
    console.log("\n \n");

    console.log("\n--- Step 1: Original Message ---");
    console.log("Message:", message);

    // Encrypt the message
    const { e, n } = publicKey;
    console.log("\n--- Step 2: Encryption Process ---");

    const encrypted = message.split('').map((char, index) => {
        const charCode = BigInt(char.charCodeAt(0));
        const encryptedChar = (charCode ** e) % n;
        console.log(`Character ${index + 1}: '${char}' (ASCII: ${charCode}) -> Encrypted: ${encryptedChar}`);
        return encryptedChar;
    });

    console.log("\nEncrypted Message:", encrypted);

    // Decrypt the message
    const { d } = privateKey;
    console.log("\n--- Step 3: Decryption Process ---");

    const decrypted = encrypted.map((num, index) => {
        const decryptedCharCode = (num ** d) % n;
        const decryptedChar = String.fromCharCode(Number(decryptedCharCode));
        console.log(`Encrypted Character ${index + 1}: ${num} -> Decrypted: '${decryptedChar}' (ASCII: ${decryptedCharCode})`);
        return decryptedChar;
    }).join('');

    console.log("\nDecrypted Message:", decrypted);

    
    
    
    // --------------------------------------------------//
    
    
    
    
    
    // Send decrypted message via email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ahshanulhaquc@gmail.com', // Replace with your Gmail
            pass: process.env.ACC_PASS, // Replace with your Gmail app password
        },
    });



    const mailOptions = {
        from: 'ahshanulhaquc@gmail.com', // Replace with your Gmail
        to: email,
        subject: 'Decrypted RSA Message',
        text: decrypted,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("\n--- Step 4: Email Sent Successfully ---");
        console.log(`Email sent to: ${email}`);
        res.json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error("\n--- Step 4: Email Sending Failed ---");
        console.error(error);
        res.status(500).json({ message: 'Failed to send email.' });
    }
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Registation.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
