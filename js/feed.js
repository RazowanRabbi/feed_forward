const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

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

if (!token || !user) {
  window.location.href = "login.html";
}

const userInfo = document.getElementById("userInfo");

if (userInfo && user) {
  userInfo.textContent = `${user.name} · ${user.role}`;
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

const reactionButtons = document.querySelectorAll(".reaction-btn");

reactionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const countSpan = button.querySelector("span");
    let count = Number(countSpan.textContent);
    count++;
    countSpan.textContent = count;
  });
});

const commentButtons = document.querySelectorAll(".comment-toggle");

commentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const post = button.closest("article");
    const commentBox = post.querySelector(".comment-box");
    commentBox.classList.toggle("hidden");
  });
});

const commentInputs = document.querySelectorAll(".comment-input");

commentInputs.forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      const post = input.closest("article");
      const commentsList = post.querySelector(".comments-list");

      const comment = document.createElement("div");
      comment.className = "rounded-2xl bg-slate-50 px-4 py-3";
      comment.textContent = `${user.name}: ${input.value.trim()}`;

      commentsList.appendChild(comment);
      input.value = "";
    }
  });
});

const shareButtons = document.querySelectorAll(".share-btn");

shareButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(link);
      showToast("Post link copied!");
    } catch (error) {
      showToast("Share link: " + link);
    }
  });
});

const donorOnlyLinks = document.querySelectorAll(".donor-only");

donorOnlyLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    if (user.role !== "donor") {
      e.preventDefault();
      showToast(
        "Only approved donors can create food posts. Please apply as a donor first.",
      );
      window.location.href = "apply_donor.html";
    }
  });
});

// ================= USER PANEL =================

const profileImage = document.getElementById("profileImage");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userLocation = document.getElementById("userLocation");
const userRole = document.getElementById("userRole");
const donorStatusText = document.getElementById("donorStatus");

async function loadUserPanel() {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      window.location.href = "login.html";
      return;
    }

    const res = await fetch(
      `http://localhost:5000/api/auth/user/${storedUser._id}`,
    );
    const user = await res.json();

    // update localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // update UI
    profileImage.src =
      user.profileImage && user.profileImage.trim() !== ""
        ? user.profileImage
        : "https://via.placeholder.com/100";

    userName.textContent = user.name;
    userEmail.textContent = user.email;
    userPhone.textContent = user.phone || "No phone added";
    userLocation.textContent = user.location || "No location added";
    userRole.textContent = user.role;

    if (user.donorStatus === "pending") {
      donorStatusText.textContent = "Pending approval ⏳";
      donorStatusText.className = "text-yellow-600 font-semibold";
    } else if (user.donorStatus === "approved") {
      donorStatusText.textContent = "Approved donor ✅";
      donorStatusText.className = "text-green-600 font-semibold";
    } else if (user.donorStatus === "rejected") {
      donorStatusText.textContent = "Rejected ❌";
      donorStatusText.className = "text-red-600 font-semibold";
    } else {
      donorStatusText.textContent = "Not applied";
      donorStatusText.className = "text-gray-500";
    }
  } catch (error) {
    console.error("User panel error:", error);
  }
}

// run it
loadUserPanel();

// ================= LOAD POSTS =================

const feedContainer = document.getElementById("postsContainer");

function renderPosts(posts) {
  feedContainer.innerHTML = "";

  if (posts.length === 0) {
    feedContainer.innerHTML = `
      <div class="rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-soft backdrop-blur">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-3xl">
          🍽️
        </div>
        <h3 class="mt-4 text-xl font-black text-slate-950">
          No food posts found
        </h3>
        <p class="mt-2 text-sm font-medium text-slate-500">
          Try searching another area, city, or category.
        </p>
      </div>
    `;
    return;
  }

  posts.forEach((post) => {
    if (user.role === "donor" && post.donor?._id === user._id) {
      return;
    }

    const expiryText = post.expiryDateTime
      ? new Date(post.expiryDateTime).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Not specified";

    const postHTML = `
      <article class="group overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-glow">
        ${
          post.foodImage
            ? `
              <div class="relative h-72 w-full overflow-hidden bg-slate-100">
                <img
                  src="${post.foodImage}"
                  alt="${post.foodName}"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent"></div>

                <div class="absolute left-5 top-5">
                  <span class="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-brand-700 shadow-soft backdrop-blur">
                    ${post.category}
                  </span>
                </div>

                <div class="absolute bottom-5 left-5 right-5">
                  <h2 class="text-3xl font-black tracking-tight text-white">
                    ${post.foodName}
                  </h2>
                  <p class="mt-1 text-sm font-medium text-white/85">
                    Shared by ${post.donor?.name || "Unknown donor"}
                  </p>
                </div>
              </div>
            `
            : `
              <div class="bg-gradient-to-br from-brand-600 to-brand-900 p-6 text-white">
                <span class="rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wide text-brand-50">
                  ${post.category}
                </span>
                <h2 class="mt-5 text-3xl font-black tracking-tight">
                  ${post.foodName}
                </h2>
                <p class="mt-1 text-sm font-medium text-brand-50/90">
                  Shared by ${post.donor?.name || "Unknown donor"}
                </p>
              </div>
            `
        }

        <div class="p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">
                  ${post.status}
                </span>

                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  ${post.quantity}
                </span>
              </div>

              <p class="mt-4 text-sm leading-7 text-slate-600">
                ${post.description || "No description added."}
              </p>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <div class="rounded-3xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">
                Quantity
              </p>
              <p class="mt-1 text-sm font-bold text-slate-800">
                ${post.quantity}
              </p>
            </div>

            <div class="rounded-3xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">
                Pickup
              </p>
              <p class="mt-1 line-clamp-2 text-sm font-bold text-slate-800">
                ${post.pickupAddress}
              </p>
            </div>

            <div class="rounded-3xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">
                Expiry
              </p>
              <p class="mt-1 text-sm font-bold text-slate-800">
                ${expiryText}
              </p>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs font-medium text-slate-500">
              Request only if you can pick it up on time.
            </p>

            ${
              user.role !== "admin"
                ? `
                  <button
                    class="request-food-btn rounded-2xl bg-brand-600 px-6 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-glow"
                    data-post-id="${post._id}"
                    data-donor-id="${post.donor?._id}"
                  >
                    Request Food
                  </button>
                `
                : `
                  <div class="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600">
                    Admin view only
                  </div>
                `
            }
          </div>
        </div>
      </article>
    `;

    feedContainer.innerHTML += postHTML;
  });

  attachRequestEvents();
}

async function loadPosts() {
  try {
    const res = await fetch("http://localhost:5000/api/food/all");
    const posts = await res.json();

    renderPosts(posts);
  } catch (error) {
    console.error("Feed loading error:", error);
  }
}

loadPosts();

function attachRequestEvents() {
  document.querySelectorAll(".request-food-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const postId = button.dataset.postId;
      window.location.href = `request_food.html?postId=${postId}`;
    });
  });
}

const searchBtn = document.getElementById("searchBtn");
const searchQuery = document.getElementById("searchQuery");
const searchCategory = document.getElementById("searchCategory");
const searchArea = document.getElementById("searchArea");
const searchCity = document.getElementById("searchCity");

async function searchPosts() {
  const query = searchQuery.value.trim();
  const category = searchCategory.value;
  const area = searchArea.value.trim();
  const city = searchCity.value.trim();

  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (category) params.append("category", category);
  if (area) params.append("area", area);
  if (city) params.append("city", city);

  try {
    const res = await fetch(
      `http://localhost:5000/api/food/search?${params.toString()}`,
    );
    const posts = await res.json();

    renderPosts(posts);
  } catch (error) {
    console.error("Search error:", error);
  }
}

if (searchBtn) {
  searchBtn.addEventListener("click", searchPosts);
}

const unreadBadge = document.getElementById("unreadBadge");

const incomingUnreadBadge = document.getElementById("incomingUnreadBadge");
const myRequestsUnreadBadge = document.getElementById("myRequestsUnreadBadge");

async function loadUnreadCount() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(
      `http://localhost:5000/api/messages/unread/${currentUser._id}`,
    );

    const data = await res.json();

    if (data.unread > 0) {
      // donor incoming requests badge
      if (currentUser.role === "donor" && incomingUnreadBadge) {
        incomingUnreadBadge.classList.remove("hidden");
        incomingUnreadBadge.textContent = data.unread;
      }

      // receiver + donor my requests badge
      if (myRequestsUnreadBadge) {
        myRequestsUnreadBadge.classList.remove("hidden");
        myRequestsUnreadBadge.textContent = data.unread;
      }
    } else {
      if (incomingUnreadBadge) {
        incomingUnreadBadge.classList.add("hidden");
      }

      if (myRequestsUnreadBadge) {
        myRequestsUnreadBadge.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("Unread count error:", error);
  }
}

loadUnreadCount();

const donorRequestLinks = document.querySelectorAll(".donor-request-only");

donorRequestLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser || currentUser.role !== "donor") {
      e.preventDefault();
      showToast("Only approved donors can view incoming food requests.");
      return;
    }
  });
});

const donorMenuItems = document.querySelectorAll(".donor-menu");

function updateRoleBasedSidebar() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (currentUser && currentUser.role === "donor") {
    donorMenuItems.forEach((item) => item.classList.remove("hidden"));
  } else {
    donorMenuItems.forEach((item) => item.classList.add("hidden"));
  }
}

updateRoleBasedSidebar();

const adminDashboardBtn = document.getElementById("adminDashboardBtn");

function updateAdminControls() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (currentUser && currentUser.role === "admin" && adminDashboardBtn) {
    adminDashboardBtn.classList.remove("hidden");
  }
}

updateAdminControls();
