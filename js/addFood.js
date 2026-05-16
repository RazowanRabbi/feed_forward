console.log("ADD FOOD JS LOADED - UPDATED VERSION");
const foodPostForm = document.getElementById("foodPostForm");

const user = JSON.parse(localStorage.getItem("user"));

const pickupLatitudeInput = document.getElementById("pickupLatitude");
const pickupLongitudeInput = document.getElementById("pickupLongitude");

const pickupMapElement = document.getElementById("pickupMap");
const pickupLocationStatus = document.getElementById("pickupLocationStatus");

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
  }, 4500);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function redirectAfterToast(page, delay = 2000) {
  setTimeout(() => {
    window.location.href = page;
  }, delay);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!user) {
  window.location.href = "login.html";
} else if (user.donorStatus !== "approved") {
  showToast("You must be an approved donor to create food posts.", "error");
  redirectAfterToast("apply_donor.html", 4000);
}

let pickupMap = null;
let pickupMarker = null;

function setPickupLocation(lat, lng, zoom = 15) {
  if (!pickupLatitudeInput || !pickupLongitudeInput) return;

  const cleanLat = Number(lat);
  const cleanLng = Number(lng);

  pickupLatitudeInput.value = cleanLat;
  pickupLongitudeInput.value = cleanLng;

  if (!pickupMap || typeof google === "undefined") return;

  const position = {
    lat: cleanLat,
    lng: cleanLng,
  };

  pickupMap.setCenter(position);
  pickupMap.setZoom(zoom);

  if (pickupMarker) {
    pickupMarker.setPosition(position);
  } else {
    pickupMarker = new google.maps.Marker({
      position,
      map: pickupMap,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    pickupMarker.addListener("dragend", () => {
      const markerPosition = pickupMarker.getPosition();

      pickupLatitudeInput.value = markerPosition.lat();
      pickupLongitudeInput.value = markerPosition.lng();

      pickupLocationStatus.textContent =
        "Pickup location updated by dragging pin.";
    });
  }

  pickupLocationStatus.textContent = "Pickup location selected successfully.";
}

function initPickupGoogleMap() {
  if (!pickupMapElement || typeof google === "undefined") return;

  pickupMap = new google.maps.Map(pickupMapElement, {
    center: {
      lat: 23.8103,
      lng: 90.4125,
    },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  });

  pickupMap.addListener("click", (event) => {
    setPickupLocation(event.latLng.lat(), event.latLng.lng(), 15);
  });
}

window.initPickupGoogleMap = initPickupGoogleMap;

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
      showToast("Food post submitted for admin approval.", "success");

      await wait(3500);

      foodPostForm.reset();

      if (pickupMarker) {
        pickupMarker.setMap(null);
        pickupMarker = null;
      }

      pickupLatitudeInput.value = "";
      pickupLongitudeInput.value = "";

      pickupLocationStatus.textContent =
        "Click on the map or use your current location.";

      window.location.href = "feed.html";
    } else {
      showToast(data.message || "Food post creation failed.", "error");
    }
  } catch (error) {
    console.error("Food post error:", error);
    showToast("Error creating food post.", "error");
  }
});
