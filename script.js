let login_btn = document.querySelector(".login-btn");
let register_btn = document.querySelector(".register-btn");
let deposite_btn = document.querySelector(".deposite-btn");
let withdraw_btn = document.querySelector(".withdraw-btn");
let checkbalance_btn = document.querySelector(".check-balance");
let ministatement_btn = document.querySelector(".ministatement-btn");
let currentUserAccountNumber = '';
let add_beneficiery = document.querySelector(".add-beneficiery");


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { getDatabase, set, ref, update } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, setDoc, doc, updateDoc, getDoc, addDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAi6i3T-p44vy_l9GZTjp1jafWHlEs-_7M",
    authDomain: "bank-management-8d226.firebaseapp.com",
    databaseURL: "https://bank-management-8d226-default-rtdb.firebaseio.com",
    projectId: "bank-management-8d226",
    storageBucket: "bank-management-8d226.appspot.com",
    messagingSenderId: "970442299995",
    appId: "1:970442299995:web:e8c03de9e822b8203c3d7e",
    measurementId: "G-N10V11VKZJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// const database = getDatabase(app);
const database = getFirestore(app);
const auth = getAuth();

if (register_btn) {
    register_btn.addEventListener("click", async () => {
        const name = document.getElementById('name').value;
        const f_name = document.getElementById('f-name').value;
        const dob = document.getElementById('dob').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const amount = document.getElementById('amount').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const pin = document.getElementById('pin').value;
        const rpassword = document.getElementById('rpassword').value;
        const rpin = document.getElementById('rpin').value;

        let inputs = document.querySelectorAll(".input");
        let isAllFill = true;
        inputs.forEach((input) => {
            if (input.value === '') {
                isAllFill = false;
            }
        });

        if (password !== rpassword || pin !== rpin) {
            isAllFill = false;
        }

        if (isAllFill) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const accountControlRef = doc(database, 'controls', 'accountControl');
                const accountControlDoc = await getDoc(accountControlRef);

                let newAccountNumber = 204060231041;
                if (accountControlDoc.exists()) {
                    const lastIssuedAccountNumber = accountControlDoc.data().lastIssuedAccountNumber;
                    newAccountNumber = lastIssuedAccountNumber + 1;
                }

                const userData = {
                    username: username,
                    email: email,
                    name: name,
                    f_name: f_name,
                    dob: dob,
                    phone: phone,
                    amount: amount,
                    password: password,
                    pin: pin,
                    accountNumber: newAccountNumber
                };

                const docRef = doc(database, 'users', user.uid);
                await setDoc(docRef, userData);

                await setDoc(accountControlRef, { lastIssuedAccountNumber: newAccountNumber });

                alert(`Registered successfully! Your account number is ${newAccountNumber}`);
                window.location.assign("index.html");

            } catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorCode, errorMessage);
            }
        } else {
            alert("Please fill all the details correctly.");
        }
    });
}

if (login_btn) {
    login_btn.addEventListener("click", async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email === '' || password === '') {
            alert('Please enter both email and password.');
        } else {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userDocRef = doc(database, 'users/', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const accountNumber = userData.accountNumber;
                    alert(`Login successful! Your account number is ${accountNumber}`);
                    window.location.assign("home.html");
                } else {
                    alert("User data not found.");
                }

            } catch (error) {
                alert(error.message);
            }
        }
    });
}

if (deposite_btn) {
    deposite_btn.addEventListener("click", async () => {
        const user = auth.currentUser;
        const amount = parseFloat(document.getElementById('amount').value);
        const pin = document.getElementById('pin').value;

        if (!amount || !pin) {
            alert('Please enter both amount and pin.');
            return;
        }

        try {
            const userDocRef = doc(database, 'users/', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().pin === pin) {
                const currentBalance = parseFloat(userDoc.data().amount);
                const newBalance = currentBalance + amount;

                const transactionData = {
                    type: 'Deposit',
                    amount: amount,
                    date: new Date().toISOString()
                };

                await updateDoc(userDocRef, { amount: newBalance });

                await addDoc(collection(database, 'users', user.uid, 'transactions'), transactionData);

                alert(`Deposit successful! New balance is ${newBalance}`);
                window.location.assign("home.html");
            } else {
                alert('Incorrect pin or user not found.');
            }
        } 
        catch (error) {
            console.error("Error during deposit:", error);
        }
    });
}

if (withdraw_btn) {
    withdraw_btn.addEventListener("click", async () => {
        const user = auth.currentUser;
        const amount = parseFloat(document.getElementById('amount').value);
        const pin = document.getElementById('pin').value;

        if (!amount || !pin) {
            alert('Please enter both amount and pin.');
            return;
        }

        try {
            const userDocRef = doc(database, 'users/', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().pin === pin) {
                const currentBalance = parseFloat(userDoc.data().amount);

                if (currentBalance >= amount) {
                    const newBalance = currentBalance - amount;
                    const transactionData = {
                        type: 'Withdrawal',
                        amount: amount,
                        date: new Date().toISOString()
                    };
                    
                    await updateDoc(userDocRef, { amount: newBalance });

                    await addDoc(collection(database, 'users', user.uid, 'transactions'), transactionData);

                    alert(`Withdrawal successful! New balance is ${newBalance}`);
                    window.location.assign("home.html");
                } else {
                    alert('Insufficient funds.');
                }
            } else {
                alert('Incorrect pin or user not found.');
            }
        } catch (error) {
            console.error("Error during withdrawal:", error);
        }
    });
}

if (checkbalance_btn) {
    checkbalance_btn.addEventListener("click", async () => {
        const user = auth.currentUser;

        try {
            const userDocRef = doc(database, 'users/', user.uid);
            const userDoc = await getDoc(userDocRef);

            if(userDoc.exists()){
                const currentBalance = parseFloat(userDoc.data().amount);
                alert(`Your balance is ${currentBalance}`);
            }
            else{
                alert('An error occurred while checking the balance.');
            }
        } catch (error) {
            console.error("An error occurred while checking the balance.", error);
        }
    })
}

if (ministatement_btn) {
    ministatement_btn.addEventListener("click", async () => {
        const user = auth.currentUser;

        try {
            const transactionsRef = collection(database, 'users', user.uid, 'transactions');
            const q = query(transactionsRef, orderBy('date', 'desc'), limit(5));
            const querySnapshot = await getDocs(q);

            let statement = "Mini-statement (Last 5 transactions):\n";

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                statement += `Type: ${data.type}, Amount: ${data.amount}, Date: ${new Date(data.date).toLocaleString()}\n`;
            });

            alert(statement);
        } catch (error) {
            console.error("Error retrieving mini-statement:", error);
        }
    });
}

if (add_beneficiery) {
    add_beneficiery.addEventListener("click", ()=>{
        beneficiery_name = document.getElementById('name').value;
        beneficiery_account = document.getElementById('account').value;
        if (!beneficiaryAccountNumber) {
            alert("Please enter a beneficiary account number.");
            return;
        }

        //Its not completed



    })
}