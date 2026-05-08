const resetForm = document.getElementById("resetForm");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  alert("Invalid reset link.");
  window.location.href = "forgot_password.html";
}

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        password
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password reset successful. Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Make sure backend is running.");
  }
});