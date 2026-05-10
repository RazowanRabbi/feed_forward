const forgotForm = document.getElementById("forgotForm");
const resetBox = document.getElementById("resetBox");

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
    showToast("Something went wrong. Make sure backend is running.");
  }
});