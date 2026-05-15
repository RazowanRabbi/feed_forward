const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

function showToast(message, type = "success") {
  const oldToast = document.getElementById("smartToast");

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "smartToast";

  const styles = {
    success: {
      bg: "from-green-500 to-emerald-600",
      icon: "✅",
    },
    error: {
      bg: "from-red-500 to-rose-600",
      icon: "❌",
    },
    info: {
      bg: "from-slate-700 to-slate-900",
      icon: "ℹ️",
    },
  };

  const current = styles[type] || styles.success;

  toast.className = `
    fixed left-1/2 top-6 z-[999999]
    w-[92%] max-w-md
    -translate-x-1/2
    rounded-[28px]
    bg-gradient-to-r ${current.bg}
    px-5 py-4
    text-white
    shadow-2xl
    backdrop-blur-xl
    transition-all duration-500
    animate-toastIn
  `;

  toast.innerHTML = `
    <div class="flex items-start gap-4">
      <div class="mt-1 text-2xl">
        ${current.icon}
      </div>

      <div class="flex-1">
        <h3 class="text-sm font-black uppercase tracking-wide opacity-80">
          FeedForward
        </h3>

        <p class="mt-1 text-sm font-medium leading-6">
          ${message}
        </p>
      </div>

      <button
        onclick="document.getElementById('smartToast').remove()"
        class="text-lg font-bold opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, -30px)";
  }, 2600);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function redirectAfterToast(page, delay = 2000) {
  setTimeout(() => {
    window.location.href = page;
  }, delay);
}

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}

const togglePasswordButtons = document.querySelectorAll(".toggle-password");

togglePasswordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "Hide";
    } else {
      input.type = "password";
      button.textContent = "Show";
    }
  });
});

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "location",
    "password",
    "confirmPassword",
  ];

  const showError = (fieldName, message) => {
    const input = document.getElementById(fieldName);
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (input) input.classList.add("input-error");
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  };

  const clearError = (fieldName) => {
    const input = document.getElementById(fieldName);
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (input) input.classList.remove("input-error");
    if (error) {
      error.textContent = "";
      error.classList.add("hidden");
    }
  };

  const showTermsError = (message) => {
    const error = document.querySelector(`[data-error-for="terms"]`);
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  };

  const clearTermsError = () => {
    const error = document.querySelector(`[data-error-for="terms"]`);
    if (error) {
      error.textContent = "";
      error.classList.add("hidden");
    }
  };

  fields.forEach((field) => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("input", () => clearError(field));
    }
  });

  const terms = document.getElementById("terms");
  if (terms) {
    terms.addEventListener("change", clearTermsError);
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    fields.forEach(clearError);
    clearTermsError();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsChecked = document.getElementById("terms").checked;

    let isValid = true;

    if (!firstName) {
      showError("firstName", "First name is required.");
      isValid = false;
    }

    if (!lastName) {
      showError("lastName", "Last name is required.");
      isValid = false;
    }

    if (!email) {
      showError("email", "Email is required.");
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      showError("email", "Enter a valid email address.");
      isValid = false;
    }

    if (!phone) {
      showError("phone", "Phone number is required.");
      isValid = false;
    }

    if (!location) {
      showError("location", "Location is required.");
      isValid = false;
    }

    if (!password) {
      showError("password", "Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      showError("password", "Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      showError("confirmPassword", "Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      showError("confirmPassword", "Passwords do not match.");
      isValid = false;
    }

    if (!termsChecked) {
      showTermsError("You must agree before creating an account.");
      isValid = false;
    }

    if (isValid) {
      const role = "receiver";
      const name = firstName + " " + lastName;

      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            phone,
            location,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          showToast("Registration successful! Please login.");
          registerForm.reset();
          redirectAfterToast("login.html");
        } else {
          showToast(data.message || "Registration failed.", "error");
        }
      } catch (error) {
        console.error(error);
        showToast(
          "Something went wrong. Make sure backend is running.",
          "error",
        );
      }
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const loginFields = ["loginEmail", "loginPassword"];

  const showLoginError = (fieldName, message) => {
    const input = document.getElementById(fieldName);
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (input) input.classList.add("input-error");
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  };

  const clearLoginError = (fieldName) => {
    const input = document.getElementById(fieldName);
    const error = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (input) input.classList.remove("input-error");
    if (error) {
      error.textContent = "";
      error.classList.add("hidden");
    }
  };

  loginFields.forEach((field) => {
    const input = document.getElementById(field);
    if (input) {
      input.addEventListener("input", () => clearLoginError(field));
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginFields.forEach(clearLoginError);

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    let isValid = true;

    if (!email) {
      showLoginError("loginEmail", "Email is required.");
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      showLoginError("loginEmail", "Enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      showLoginError("loginPassword", "Password is required.");
      isValid = false;
    }

    if (isValid) {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          showToast("Login successful!", "success");

          // Save token + user
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          loginForm.reset();

          // Smooth redirect
          if (data.user.role === "admin") {
            redirectAfterToast("admin_dashboard.html", 2000);
          } else {
            redirectAfterToast("feed.html", 2000);
          }
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        console.error(error);
        showToast(
          "Something went wrong. Make sure backend is running.",
          "error",
        );
      }
    }
  });
}
