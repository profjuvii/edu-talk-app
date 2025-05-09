import { postRequest, patchRequest, addMessage } from "./utils.js";

// Init role input field
function initRoleInputField() {
    const inputField = document.getElementById("role-input-field");
    const roleInput = document.getElementById("role");
    const dropdown = document.getElementById("dropdown");
    const options = document.querySelectorAll(".option");

    let first = true;
    roleInput.addEventListener("click", () => {
        inputField.classList.add("filled");
        dropdown.style.display = "block";
        if (first) {
            document.addEventListener("focus", onFocus, true);
            first = false;
        }
    });
    
    options.forEach(option => {
        option.addEventListener("click", () => {
            roleInput.value = option.textContent;
            dropdown.style.display = "none";
        });
    });

    const deactivateDropdown = (event) => {
        if (!roleInput.contains(event.target)) {
            dropdown.style.display = "none";
            if (!roleInput.value) {
                inputField.classList.remove("filled");
            }
        }
    }

    const onFocus = (event) => {
        deactivateDropdown(event);
        document.removeEventListener("focus", onFocus, true);
    };

    document.addEventListener("focus", onFocus, true);
    document.addEventListener("click", deactivateDropdown);
}

// Render register page
export async function renderRegisterPage(url) {
    location.hash = "register";

    // Fetch register page
    const html = await fetch("./components/register.html").then(res => res.text());
    document.getElementById("app").innerHTML = html;

    initRoleInputField();

    // Define base object and message position
    const authForm = document.querySelector("#register > .auth-form");
    const msgPos = "beforebegin";

    return new Promise((resolve) => {
        // Go to login page
        document.getElementById("logreg-link").addEventListener("click", async () => {
            const user = await renderLoginPage(url);
            resolve(user);
        });

        // Send form data
        document.getElementById("auth-btn").addEventListener("click", async (event) => {
            event.preventDefault();

            const firstName = document.getElementById("first-name").value.trim();
            const lastName = document.getElementById("last-name").value.trim();
            const username = document.getElementById("username").value.trim();
            const role = document.getElementById("role").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!firstName || !lastName || !username || !role || !email || !password) {
                addMessage(authForm, msgPos, "Please fill in all required fields", "red");
                return;
            }

            if (password.length < 8) {
                addMessage(authForm, msgPos, "The password is too short", "red");
                return;
            }

            const registerData = {
                firstName,
                lastName,
                username,
                role,
                email,
                phone: phone || null,
                password,
                topicCount: 0,
                online: true
            };

            const json = await postRequest(`${url}/users/register`, registerData);

            if (json.user) {
                localStorage.setItem("EduTalkUser", JSON.stringify(registerData));
                resolve(json.user);
            } else {
                addMessage(authForm, msgPos, json.message, "red");
            }
        });
    });
}

// Google Auth
function createGoogleCallback(url, authForm, msgPos, resolve) {
    return async function handleCredentialResponse(response) {
        const token = response.credential;
        const json = await postRequest(`${url}/verify-token`, { token });

        if (!json.user) {
            addMessage(authForm, msgPos, json.message, "red");
            return;
        }

        localStorage.setItem("EduTalkUserToken", JSON.stringify(token));
        resolve(json.user);
    };
}

function initGoogleAuth(callback) {
    if (window.google && window.google.accounts && window.google.accounts.id) {
        const signinDiv = document.getElementById("g_id_signin");

        if (signinDiv) {
            window.google.accounts.id.initialize({
                client_id: "561895289784-8me8nsuconmt21ehecsfob9qagu9nfbv.apps.googleusercontent.com",
                callback
            });

            window.google.accounts.id.renderButton(signinDiv, {
                theme: "outline",
                size: "large",
                text: "sign_in_with",
                shape: "rectangular"
            });
        } else {
            console.warn("Google Sign-In container not found in DOM");
        }
    }
}

function waitForElement(selector, maxTries = 10, interval = 100) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const check = () => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            if (++tries >= maxTries) return reject("Element not found: " + selector);
            setTimeout(check, interval);
        };
        check();
    });
}

function waitForGoogleAuth(maxTries = 10, interval = 100) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const check = () => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                return resolve();
            }
            if (++tries >= maxTries) return reject("Google API not available");
            setTimeout(check, interval);
        };
        check();
    });
}

// Render login page
export async function renderLoginPage(url) {
    location.hash = "login";

    const html = await fetch("./components/login.html").then(res => res.text());
    document.getElementById("app").innerHTML = html;

    const authForm = document.querySelector("#login > .auth-form");
    const msgPos = "beforebegin";

    return new Promise(async (resolve) => {
        // Google Sign-In callback
        await waitForElement("#g_id_signin");
        await waitForGoogleAuth();

        const googleCallback = createGoogleCallback(url, authForm, msgPos, resolve);
        initGoogleAuth(googleCallback);

        // Standard Log In
        document.getElementById("logreg-link").addEventListener("click", async () => {
            const user = await renderRegisterPage(url);
            resolve(user);
        });

        document.getElementById("auth-btn").addEventListener("click", async (event) => {
            event.preventDefault();

            const emailField = document.getElementById("email");
            const passwordField = document.getElementById("password");

            const clearFields = () => {
                emailField.value = "";
                passwordField.value = "";
            }

            if (!emailField.value.trim() || !passwordField.value.trim()) {
                addMessage(authForm, msgPos, "All fields are required", "red");
                clearFields();
                return;
            }

            const loginData = {
                email: emailField.value,
                password: passwordField.value
            };

            const json = await patchRequest(`${url}/users/login`, loginData);

            if (json.user) {
                localStorage.setItem("EduTalkUser", JSON.stringify(loginData));
                resolve(json.user);
            } else {
                addMessage(authForm, msgPos, json.message, "red");
                clearFields();
            }
        });
    });
}