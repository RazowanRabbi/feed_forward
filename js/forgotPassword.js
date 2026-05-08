const forgotForm = document.getElementById("forgotForm");
const resetBox = document.getElementById("resetBox");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      resetBox.classList.remove("hidden");
      resetBox.innerHTML = `
        <p class="text-sm font-semibold text-brand-900">
          Reset link sent successfully.
        </p>
        <p class="mt-2 text-sm leading-6 text-brand-900">
          Please check your email inbox. If you do not see it, check spam or promotions.
        </p>
      `;
      forgotForm.reset();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Make sure backend is running.");
  }
});