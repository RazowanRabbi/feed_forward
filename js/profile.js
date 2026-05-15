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

function redirectAfterToast(page, delay = 2000) {
  setTimeout(() => {
    window.location.href = page;
  }, delay);
}

if (!user) {
  redirectAfterToast("login.html");
}

const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const locationInput = document.getElementById("location");
const bioInput = document.getElementById("bio");
const profileImageInput = document.getElementById("profileImage");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const profileMapElement = document.getElementById("profileMap");
const useCurrentLocationBtn = document.getElementById("useCurrentLocationBtn");
const mapLocationStatus = document.getElementById("mapLocationStatus");

const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");
const previewEmail = document.getElementById("previewEmail");
const previewRole = document.getElementById("previewRole");
const previewDonorStatus = document.getElementById("previewDonorStatus");

let profileMap = null;
let profileMarker = null;

function setProfileMapLocation(lat, lng, zoom = 15) {
  if (!latitudeInput || !longitudeInput) return;

  latitudeInput.value = lat;
  longitudeInput.value = lng;

  if (!profileMap) return;

  profileMap.setView([lat, lng], zoom);

  if (profileMarker) {
    profileMarker.setLatLng([lat, lng]);
  } else {
    profileMarker = L.marker([lat, lng], {
      draggable: true,
    }).addTo(profileMap);

    profileMarker.on("dragend", () => {
      const position = profileMarker.getLatLng();
      latitudeInput.value = position.lat;
      longitudeInput.value = position.lng;

      if (mapLocationStatus) {
        mapLocationStatus.textContent = "Map location updated by dragging pin.";
      }
    });
  }

  if (mapLocationStatus) {
    mapLocationStatus.textContent = "Map location selected successfully.";
  }
}

function initProfileMap(savedLat = null, savedLng = null) {
  if (!profileMapElement || typeof L === "undefined") return;

  const defaultLat = savedLat || 23.8103;
  const defaultLng = savedLng || 90.4125;

  profileMap = L.map("profileMap").setView([defaultLat, defaultLng], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(profileMap);

  if (savedLat && savedLng) {
    setProfileMapLocation(savedLat, savedLng, 15);
  }

  profileMap.on("click", (e) => {
    setProfileMapLocation(e.latlng.lat, e.latlng.lng, 15);
  });

  setTimeout(() => {
    profileMap.invalidateSize();
  }, 300);
}

if (useCurrentLocationBtn) {
  useCurrentLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("Your browser does not support location access.", "error");
      return;
    }

    if (mapLocationStatus) {
      mapLocationStatus.textContent = "Getting your current location...";
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setProfileMapLocation(lat, lng, 16);
        showToast("Current location selected.");
      },
      () => {
        showToast("Could not access your current location.", "error");

        if (mapLocationStatus) {
          mapLocationStatus.textContent =
            "Location access failed. You can still click on the map manually.";
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
}

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

    if (latitudeInput) latitudeInput.value = freshUser.latitude || "";
    if (longitudeInput) longitudeInput.value = freshUser.longitude || "";

    previewImage.src =
      freshUser.profileImage || "https://via.placeholder.com/160";
    previewName.textContent = freshUser.name || "Unknown User";
    previewEmail.textContent = freshUser.email || "";
    previewRole.textContent = freshUser.role || "receiver";
    previewDonorStatus.textContent = freshUser.donorStatus || "none";

    if (!profileMap) {
      initProfileMap(freshUser.latitude, freshUser.longitude);
    }
  } catch (error) {
    console.error("Profile load error:", error);
    showToast("Could not load profile.", "error");
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

  if (latitudeInput && longitudeInput) {
    formData.append("latitude", latitudeInput.value);
    formData.append("longitude", longitudeInput.value);
  }

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
      redirectAfterToast("feed.html", 2200);
    } else {
      showToast(updatedUser.message || "Profile update failed.", "error");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    showToast("Error updating profile.", "error");
  }
});

loadProfile();