console.log("ADD FOOD JS LOADED - UPDATED VERSION");
const foodPostForm = document.getElementById("foodPostForm");

const user = JSON.parse(localStorage.getItem("user"));

const pickupLatitudeInput = document.getElementById("pickupLatitude");
const pickupLongitudeInput = document.getElementById("pickupLongitude");

const pickupMapElement = document.getElementById("pickupMap");
const pickupLocationStatus = document.getElementById("pickupLocationStatus");

let pickupMap = null;
let pickupMarker = null;

function showToast(message, type = "success") {
  const existingToast = document.getElementById("customToast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "customToast";

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-slate-900";

  toast.className = `
    fixed right-5 top-24 z-[9999]
    rounded-2xl ${bgColor}
    px-5 py-3 text-sm font-bold text-white
    shadow-lg transition-all duration-300
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
  }, 3300);

  setTimeout(() => {
    toast.remove();
  }, 3800);
}

function redirectAfterToast(page, delay = 2000) {
  setTimeout(() => {
    window.location.href = page;
  }, delay);
}

if (!user) {
  window.location.href = "login.html";
} else if (user.donorStatus !== "approved") {
  showToast("You must be an approved donor to create food posts.", "error");
  redirectAfterToast("apply_donor.html", 4000);
}

function setPickupLocation(lat, lng, zoom = 15) {
  if (!pickupLatitudeInput || !pickupLongitudeInput) return;

  pickupLatitudeInput.value = lat;
  pickupLongitudeInput.value = lng;

  if (!pickupMap) return;

  pickupMap.setView([lat, lng], zoom);

  if (pickupMarker) {
    pickupMarker.setLatLng([lat, lng]);
  } else {
    pickupMarker = L.marker([lat, lng], {
      draggable: true,
    }).addTo(pickupMap);

    pickupMarker.on("dragend", () => {
      const position = pickupMarker.getLatLng();

      pickupLatitudeInput.value = position.lat;
      pickupLongitudeInput.value = position.lng;

      pickupLocationStatus.textContent =
        "Pickup location updated by dragging pin.";
    });
  }

  pickupLocationStatus.textContent = "Pickup location selected successfully.";
}

function initPickupMap() {
  if (!pickupMapElement || typeof L === "undefined") return;

  pickupMap = L.map("pickupMap").setView([23.8103, 90.4125], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(pickupMap);

  pickupMap.on("click", (e) => {
    setPickupLocation(e.latlng.lat, e.latlng.lng);
  });

  setTimeout(() => {
    pickupMap.invalidateSize();
  }, 300);
}

initPickupMap();

const usePickupCurrentLocationBtn = document.getElementById(
  "usePickupCurrentLocationBtn",
);

if (usePickupCurrentLocationBtn) {
  usePickupCurrentLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("Your browser does not support location access.", "error");
      return;
    }

    pickupLocationStatus.textContent = "Getting your current location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setPickupLocation(lat, lng, 16);

        showToast("Pickup location selected.");
      },
      () => {
        showToast("Could not access current location.", "error");

        pickupLocationStatus.textContent =
          "Location access failed. You can still click on the map manually.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
}

foodPostForm.addEventListener("submit", async (e) => {
  console.log("FORM SUBMITTED");
  e.preventDefault();

  const formData = new FormData();

  formData.append("donor", user._id);
  formData.append("foodName", document.getElementById("foodName").value.trim());
  formData.append("quantity", document.getElementById("quantity").value.trim());
  formData.append("category", document.getElementById("category").value);
  formData.append(
    "description",
    document.getElementById("description").value.trim(),
  );
  formData.append(
    "expiryDateTime",
    document.getElementById("expiryDateTime").value,
  );
  formData.append(
    "pickupAddress",
    document.getElementById("pickupAddress").value.trim(),
  );
  formData.append("area", document.getElementById("area").value.trim());
  formData.append("city", document.getElementById("city").value.trim());

  if (!pickupLatitudeInput.value || !pickupLongitudeInput.value) {
    showToast("Please select pickup location on the map.", "error");
    return;
  }

  formData.append("latitude", pickupLatitudeInput.value);
  formData.append("longitude", pickupLongitudeInput.value);

  const imageFile = document.getElementById("foodImage").files[0];

  if (imageFile) {
    formData.append("foodImage", imageFile);
  }

  try {
    const res = await fetch("http://localhost:5000/api/food/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);
    console.log("Backend data:", data);

    if (res.ok) {
      showToast("Food post submitted for admin approval.");
      foodPostForm.reset();
      if (pickupMarker) {
        pickupMap.removeLayer(pickupMarker);
        pickupMarker = null;
      }

      pickupLatitudeInput.value = "";
      pickupLongitudeInput.value = "";

      pickupLocationStatus.textContent =
        "Click on the map or use your current location.";
      redirectAfterToast("feed.html", 3000);
    } else {
      showToast(data.message || "Food post creation failed.", "error");
    }
  } catch (error) {
    console.error("Food post error:", error);
    showToast("Error creating food post.", "error");
  }
});
