const applyBtn = document.getElementById("applyBtn");
const statusText = document.getElementById("statusText");

const user = JSON.parse(localStorage.getItem("user"));

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

if (!user) {
  window.location.href = "login.html";
}

// 🔹 Load current status on page load
async function loadStatus() {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user._id}`);
    const user = await res.json();

    // 🔥 update localStorage with fresh DB data
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Updated user:", user);

    if (user.donorStatus === "none") {
      statusText.textContent = "Not applied yet";
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Now";
    }

    if (user.donorStatus === "pending") {
      statusText.textContent = "Pending approval ⏳";
      applyBtn.disabled = true;
      applyBtn.textContent = "Already Applied";
    }

    if (user.donorStatus === "approved") {
      statusText.textContent = "Approved 🎉";
      applyBtn.disabled = true;
      applyBtn.textContent = "You are a donor";
    }

    if (user.donorStatus === "rejected") {
      statusText.textContent = "Rejected ❌";
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Again";
    }
  } catch (error) {
    console.error(error);
  }
}

loadStatus();

// 🔹 Apply button logic
applyBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/apply-donor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user._id }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Application submitted!");
      loadStatus(); // refresh UI
    } else {
      showToast(data.message);
    }
  } catch (error) {
    console.error(error);
    showToast("Error submitting application");
  }
});
