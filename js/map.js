const currentUser = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!currentUser || !token) {
  window.location.href = "login.html";
}

let map;
let infoWindow;
let CustomMarker = null;
let activeMarkers = [];

const mapStatus = document.getElementById("mapStatus");
const mapSearch = document.getElementById("mapSearch");
const locateMeBtn = document.getElementById("locateMeBtn");

const showAllBtn = document.getElementById("showAllBtn");
const showDonorsBtn = document.getElementById("showDonorsBtn");
const showFoodBtn = document.getElementById("showFoodBtn");

let userLat = currentUser.latitude ? Number(currentUser.latitude) : null;
let userLng = currentUser.longitude ? Number(currentUser.longitude) : null;

let allDonors = [];
let allPosts = [];
let currentFilter = "all";

const defaultLat = userLat || 23.8103;
const defaultLng = userLng || 90.4125;

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distance) {
  if (distance === null) return "Distance unavailable";
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(2)} km away`;
}

function getSafeImage(image, fallback) {
  return image && image.trim() !== "" ? image : fallback;
}

function createDonorMarkerHTML(donor) {
  const isSelf = donor._id === currentUser._id;
  const image = getSafeImage(
    donor.profileImage,
    "https://via.placeholder.com/100",
  );

  return `
    <img
      src="${image}"
      class="donor-marker ${isSelf ? "self-marker" : ""}"
      alt="${donor.name}"
    />
  `;
}

function createFoodMarkerHTML(post) {
  if (post.foodImage && post.foodImage.trim() !== "") {
    return `
      <img
        src="${post.foodImage}"
        class="food-image-marker"
        alt="${post.foodName}"
      />
    `;
  }

  return `<div class="food-fallback-marker">🍱</div>`;
}

function createDonorPopup(donor) {
  const distance = calculateDistanceKm(
    userLat,
    userLng,
    Number(donor.latitude),
    Number(donor.longitude),
  );

  const image = getSafeImage(
    donor.profileImage,
    "https://via.placeholder.com/120",
  );
  const isSelf = donor._id === currentUser._id;

  return `
    <div style="width:270px;background:white;border-radius:22px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#16a34a,#14532d);padding:18px;text-align:center;color:white;">
        <img
          src="${image}"
          style="width:82px;height:82px;border-radius:999px;object-fit:cover;border:4px solid white;margin:auto;box-shadow:0 12px 30px rgba(0,0,0,.25);"
        />
        <h3 style="margin:10px 0 2px;font-size:19px;font-weight:900;">
          ${donor.name} ${isSelf ? "(You)" : ""}
        </h3>
        <p style="margin:0;font-size:12px;opacity:.9;">Approved Donor</p>
      </div>

      <div style="padding:16px;">
        <p style="margin:0 0 8px;font-size:13px;color:#475569;"><b>Email:</b> ${donor.email || "Not available"}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;"><b>Phone:</b> ${donor.phone || "Not added"}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;"><b>Location:</b> ${donor.location || "Not added"}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;"><b>Distance:</b> ${formatDistance(distance)}</p>
        ${
          donor.bio
            ? `<p style="margin:10px 0 0;font-size:13px;color:#64748b;line-height:1.5;">${donor.bio}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function createFoodPopup(post) {
  const distance = calculateDistanceKm(
    userLat,
    userLng,
    Number(post.latitude),
    Number(post.longitude),
  );

  const expiry = post.expiryDateTime
    ? new Date(post.expiryDateTime).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not specified";

  return `
    <div style="width:290px;background:white;border-radius:22px;overflow:hidden;">
      ${
        post.foodImage
          ? `<img src="${post.foodImage}" style="width:100%;height:145px;object-fit:cover;" />`
          : `<div style="height:120px;background:linear-gradient(135deg,#16a34a,#14532d);display:flex;align-items:center;justify-content:center;color:white;font-size:42px;">🍱</div>`
      }

      <div style="padding:16px;">
        <span style="display:inline-block;background:#dcfce7;color:#15803d;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:900;">
          ${post.category}
        </span>

        <h3 style="margin:10px 0 4px;font-size:19px;font-weight:900;color:#0f172a;">
          ${post.foodName}
        </h3>

        <p style="margin:0 0 10px;font-size:13px;color:#64748b;">
          Shared by ${post.donor?.name || "Unknown donor"}
        </p>

        <p style="margin:0 0 7px;font-size:13px;color:#475569;"><b>Quantity:</b> ${post.quantity}</p>
        <p style="margin:0 0 7px;font-size:13px;color:#475569;"><b>Pickup:</b> ${post.pickupAddress}</p>
        <p style="margin:0 0 7px;font-size:13px;color:#475569;"><b>Expiry:</b> ${expiry}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#475569;"><b>Distance:</b> ${formatDistance(distance)}</p>

        ${
          currentUser.role !== "admin"
            ? `
              <a
                href="request_food.html?postId=${post._id}"
                style="display:block;text-align:center;background:#16a34a;color:white;text-decoration:none;padding:11px;border-radius:16px;font-size:13px;font-weight:900;"
              >
                Request Food
              </a>
            `
            : `
              <div style="text-align:center;background:#f1f5f9;color:#475569;padding:11px;border-radius:16px;font-size:13px;font-weight:800;">
                Admin View Only
              </div>
            `
        }
      </div>
    </div>
  `;
}

function matchesSearch(item, query, type) {
  if (!query) return true;

  const q = query.toLowerCase();

  if (type === "donor") {
    return (
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.bio?.toLowerCase().includes(q)
    );
  }

  return (
    item.foodName?.toLowerCase().includes(q) ||
    item.category?.toLowerCase().includes(q) ||
    item.pickupAddress?.toLowerCase().includes(q) ||
    item.area?.toLowerCase().includes(q) ||
    item.city?.toLowerCase().includes(q) ||
    item.donor?.name?.toLowerCase().includes(q)
  );
}

function clearMarkers() {
  activeMarkers.forEach((marker) => marker.setMap(null));
  activeMarkers = [];
}

function addCustomMarker(position, html, popupHTML) {
  if (!CustomMarker) return;

  const googlePosition = new google.maps.LatLng(position.lat, position.lng);

  const marker = new CustomMarker(googlePosition, html, () => {
    infoWindow.setContent(popupHTML);
    infoWindow.setPosition(googlePosition);
    infoWindow.open(map);
  });

  marker.setMap(map);
  activeMarkers.push(marker);
}

function setActiveFilterButton(activeButton) {
  [showAllBtn, showDonorsBtn, showFoodBtn].forEach((btn) => {
    btn.className = "rounded-2xl bg-slate-100 px-3 py-2 text-slate-600";
  });

  activeButton.className = "rounded-2xl bg-brand-600 px-3 py-2 text-white";
}

function renderMap() {
  if (!map || !google) return;

  clearMarkers();

  const query = mapSearch.value.trim();
  const bounds = new google.maps.LatLngBounds();
  let visibleCount = 0;

  if (currentFilter === "all" || currentFilter === "donors") {
    allDonors
      .filter((donor) => matchesSearch(donor, query, "donor"))
      .forEach((donor) => {
        const lat = Number(donor.latitude);
        const lng = Number(donor.longitude);

        if (!lat || !lng) return;

        addCustomMarker(
          { lat, lng },
          createDonorMarkerHTML(donor),
          createDonorPopup(donor),
        );

        bounds.extend({ lat, lng });
        visibleCount++;
      });
  }

  if (currentFilter === "all" || currentFilter === "food") {
    allPosts
      .filter((post) => matchesSearch(post, query, "food"))
      .forEach((post) => {
        const lat = Number(post.latitude);
        const lng = Number(post.longitude);

        if (!lat || !lng) return;

        addCustomMarker(
          { lat, lng },
          createFoodMarkerHTML(post),
          createFoodPopup(post),
        );

        bounds.extend({ lat, lng });
        visibleCount++;
      });
  }

  if (visibleCount > 0) {
    map.fitBounds(bounds);
  }

  mapStatus.textContent = `${visibleCount} location(s) shown on map.`;
}

async function loadMapData() {
  try {
    const [donorRes, postRes] = await Promise.all([
      fetch("http://localhost:5000/api/auth/approved-donors"),
      fetch("http://localhost:5000/api/food/all"),
    ]);

    allDonors = await donorRes.json();
    allPosts = await postRes.json();

    allDonors = allDonors.filter((donor) => donor.latitude && donor.longitude);
    allPosts = allPosts.filter((post) => post.latitude && post.longitude);

    renderMap();
  } catch (error) {
    console.error("Map loading error:", error);
    mapStatus.textContent = "Failed to load map data.";
  }
}

function updateUserLocation(lat, lng) {
  userLat = lat;
  userLng = lng;

  map.setCenter({ lat, lng });
  map.setZoom(15);

  renderMap();
}

function initGoogleMap() {
  map = new google.maps.Map(document.getElementById("feedForwardMap"), {
    center: { lat: defaultLat, lng: defaultLng },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
  });

  infoWindow = new google.maps.InfoWindow();

  CustomMarker = class extends google.maps.OverlayView {
    constructor(position, html, onClick) {
      super();
      this.position = position;
      this.html = html;
      this.onClick = onClick;
      this.div = null;
    }

    onAdd() {
      this.div = document.createElement("div");
      this.div.className = "custom-map-marker";
      this.div.innerHTML = this.html;
      this.div.addEventListener("click", this.onClick);

      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(this.div);
    }

    draw() {
      const projection = this.getProjection();
      const point = projection.fromLatLngToDivPixel(this.position);

      if (point && this.div) {
        this.div.style.position = "absolute";
        this.div.style.left = `${point.x}px`;
        this.div.style.top = `${point.y}px`;
      }
    }

    onRemove() {
      if (this.div) {
        this.div.remove();
        this.div = null;
      }
    }
  };

  loadMapData();
}

window.initGoogleMap = initGoogleMap;

if (locateMeBtn) {
  locateMeBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      mapStatus.textContent = "Your browser does not support location access.";
      return;
    }

    mapStatus.textContent = "Getting your current location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateUserLocation(position.coords.latitude, position.coords.longitude);
        mapStatus.textContent = "Current location used for distance.";
      },
      () => {
        mapStatus.textContent =
          "Could not access location. Using saved profile location if available.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
}

if (mapSearch) {
  mapSearch.addEventListener("input", renderMap);
}

if (showAllBtn) {
  showAllBtn.addEventListener("click", () => {
    currentFilter = "all";
    setActiveFilterButton(showAllBtn);
    renderMap();
  });
}

if (showDonorsBtn) {
  showDonorsBtn.addEventListener("click", () => {
    currentFilter = "donors";
    setActiveFilterButton(showDonorsBtn);
    renderMap();
  });
}

if (showFoodBtn) {
  showFoodBtn.addEventListener("click", () => {
    currentFilter = "food";
    setActiveFilterButton(showFoodBtn);
    renderMap();
  });
}
