const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

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

const foodDetails = document.getElementById("foodDetails");
const form = document.getElementById("requestForm");

let donorId = null;

// Load food details
async function loadFood() {
  try {
    const res = await fetch(`http://localhost:5000/api/food/${postId}`);
    const post = await res.json();

    donorId = post.donor._id;

    foodDetails.innerHTML = `
    ${
      post.foodImage
        ? `
      <img
        src="${post.foodImage}"
        alt="${post.foodName}"
        class="mb-4 h-64 w-full rounded-2xl object-cover"
      />
    `
        : ""
    }

      <h2 class="text-xl font-bold">${post.foodName}</h2>
      <p class="text-sm text-gray-500">Donor: ${post.donor.name}</p>
      <p class="mt-2">${post.description}</p>
      <p class="mt-2 text-sm"><b>Quantity:</b> ${post.quantity}</p>
      <p class="text-sm"><b>Location:</b> ${post.pickupAddress}</p>
    `;
  } catch (error) {
    console.error(error);
    foodDetails.textContent = "Failed to load food details";
  }
}

loadFood();

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const requestedQuantity = document.getElementById("requestedQuantity").value;
  const message = document.getElementById("message").value;
  const pickupPreference = document.getElementById("pickupPreference").value;

  try {
    const res = await fetch("http://localhost:5000/api/request/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        foodPost: postId,
        donor: donorId,
        requester: user._id,
        requestedQuantity,
        message,
        pickupPreference,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Request sent successfully!");
      window.location.href = "feed.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    showToast("Error sending request");
  }
});
