document.addEventListener("DOMContentLoaded", () => {

    // ------------------- REGISTER FORM -------------------
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            const fullName = document.getElementById("full_name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirm = document.getElementById("confirm_password").value.trim();

            if (!fullName || !email || !password || !confirm) {
                alert("Please fill all fields.");
                e.preventDefault();
                return;
            }

            if (password !== confirm) {
                alert("Passwords do not match!");
                e.preventDefault();
                return;
            }

            try {
                const response = await fetch("/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: fullName,
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    status.innerHTML = "Registration successful! Redirecting to login...";
                    status.className = "success";

                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1500);

                } else {
                    status.innerHTML = data.message || "Registration failed!";
                    status.className = "error";
                }

            } catch (error) {
                console.error(error);
                status.innerHTML = "Server error. Try again later.";
                status.className = "error";
            }
        });
    }

      // ------------------- LOGIN FORM -------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please enter both email and password.");
                e.preventDefault();
                return;
            }

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    status.innerHTML = "Login successful! Redirecting...";
                    status.className = "success";

                    setTimeout(() => {
                        window.location.href = "/prediction";
                    }, 1200);

                } else {
                    status.innerHTML = data.message || "Invalid credentials.";
                    status.className = "error";
                }

            } catch (error) {
                console.error(error);
                status.innerHTML = "Server error. Try again later.";
                status.className = "error";
            }
        });
    }

});
