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

const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const locationInput = document.getElementById("location");
const bioInput = document.getElementById("bio");
const profileImageInput = document.getElementById("profileImage");

const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");
const previewEmail = document.getElementById("previewEmail");
const previewRole = document.getElementById("previewRole");
const previewDonorStatus = document.getElementById("previewDonorStatus");

async function loadProfile() {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user._id}`);
    const freshUser = await res.json();

    localStorage.setItem("user", JSON.stringify(freshUser));

    nameInput.value = freshUser.name || "";
    emailInput.value = freshUser.email || "";
    phoneInput.value = freshUser.phone || "";
    locationInput.value = freshUser.location || "";
    bioInput.value = freshUser.bio || "";

    previewImage.src =
      freshUser.profileImage || "https://via.placeholder.com/160";
    previewName.textContent = freshUser.name || "Unknown User";
    previewEmail.textContent = freshUser.email || "";
    previewRole.textContent = freshUser.role || "receiver";
    previewDonorStatus.textContent = freshUser.donorStatus || "none";
  } catch (error) {
    console.error("Profile load error:", error);
    alert("Could not load profile.");
  }
}

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];

  if (file) {
    previewImage.src = URL.createObjectURL(file);
  }
});

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("name", nameInput.value.trim());
  formData.append("phone", phoneInput.value.trim());
  formData.append("location", locationInput.value.trim());
  formData.append("bio", bioInput.value.trim());

  const imageFile = profileImageInput.files[0];

  if (imageFile) {
    formData.append("profileImage", imageFile);
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/auth/update-profile/${user._id}`,
      {
        method: "PUT",
        body: formData,
      },
    );

    const updatedUser = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showToast("Profile updated successfully.");
      window.location.href = "feed.html";
    } else {
      alert(updatedUser.message || "Profile update failed.");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    showToast("Error updating profile.");
  }
});

loadProfile();
