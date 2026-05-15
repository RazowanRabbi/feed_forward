const adminUser = JSON.parse(localStorage.getItem("user"));
const donorApplications = document.getElementById("donorApplications");

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

if (!adminUser || adminUser.role !== "admin") {
  showToast("Only admins can access this page.");
  window.location.href = "feed.html";
}

async function loadPendingDonors() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/pending-donors");
    const users = await res.json();

    donorApplications.innerHTML = "";

    if (users.length === 0) {
      donorApplications.innerHTML = `
        <div class="rounded-[24px] border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-soft">
          No pending donor applications.
        </div>
      `;
      return;
    }

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className =
        "rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft";

      card.innerHTML = `
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">${user.name}</h2>
            <p class="mt-1 text-sm text-slate-500">${user.email}</p>
            <div class="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p><span class="font-semibold text-slate-800">Phone:</span> ${user.phone || "Not added"}</p>
              <p><span class="font-semibold text-slate-800">Location:</span> ${user.location || "Not added"}</p>
              <p><span class="font-semibold text-slate-800">Current Role:</span> ${user.role}</p>
              <p><span class="font-semibold text-slate-800">Status:</span> ${user.donorStatus}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="approve-btn rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              data-id="${user._id}"
            >
              Approve
            </button>

            <button
              class="reject-btn rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
              data-id="${user._id}"
            >
              Reject
            </button>
          </div>
        </div>
      `;

      donorApplications.appendChild(card);
    });

    attachApprovalEvents();
  } catch (error) {
    console.error(error);
    donorApplications.innerHTML = `
      <div class="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Failed to load donor applications.
      </div>
    `;
  }
}

function attachApprovalEvents() {
  document.querySelectorAll(".approve-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/approve-donor/${userId}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Donor approved successfully.");
        loadPendingDonors();
      } else {
        showToast(data.message);
      }
    });
  });

  document.querySelectorAll(".reject-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/reject-donor/${userId}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Donor rejected.");
        loadPendingDonors();
      } else {
        showToast(data.message);
      }
    });
  });
}

loadPendingDonors();

const donorTab = document.getElementById("donorTab");
const volunteerTab = document.getElementById("volunteerTab");
const postTab = document.getElementById("postTab");

function setActiveTab(active) {
  [donorTab, postTab].forEach((tab) => {
    tab.className =
      "w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100";
  });

  active.className =
    "w-full rounded-2xl bg-brand-50 px-4 py-3 text-left text-sm font-semibold text-brand-700";

  if (volunteerTab) {
    volunteerTab.className = "hidden";
  }
}

postTab.addEventListener("click", () => {
  console.log("Post approval clicked");
  setActiveTab(postTab);
  loadPendingPosts();
});

donorTab.addEventListener("click", () => {
  setActiveTab(donorTab);
  loadPendingDonors();
});

async function loadPendingVolunteers() {
  try {
    const res = await fetch(
      "http://localhost:5000/api/admin/pending-volunteers",
    );
    const users = await res.json();

    donorApplications.innerHTML = "";

    if (users.length === 0) {
      donorApplications.innerHTML = `
        <div class="rounded-[24px] border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-soft">
          No pending volunteer applications.
        </div>
      `;
      return;
    }

    users.forEach((user) => {
      const card = document.createElement("div");
      card.className =
        "rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft";

      card.innerHTML = `
        <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">${user.name}</h2>
            <p class="mt-1 text-sm text-slate-500">${user.email}</p>

            <div class="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p><span class="font-semibold text-slate-800">Phone:</span> ${user.phone || "Not added"}</p>
              <p><span class="font-semibold text-slate-800">Location:</span> ${user.location || "Not added"}</p>
              <p><span class="font-semibold text-slate-800">Current Role:</span> ${user.role}</p>
              <p><span class="font-semibold text-slate-800">Status:</span> ${user.volunteerStatus}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="approve-volunteer-btn rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              data-id="${user._id}"
            >
              Approve
            </button>

            <button
              class="reject-volunteer-btn rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
              data-id="${user._id}"
            >
              Reject
            </button>
          </div>
        </div>
      `;

      donorApplications.appendChild(card);
    });

    attachVolunteerEvents();
  } catch (error) {
    console.error(error);
  }
}

function attachVolunteerEvents() {
  document.querySelectorAll(".approve-volunteer-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/approve-volunteer/${userId}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Volunteer approved successfully.");
        loadPendingVolunteers();
      } else {
        alert(data.message);
      }
    });
  });

  document.querySelectorAll(".reject-volunteer-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/reject-volunteer/${userId}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert("Volunteer rejected.");
        loadPendingVolunteers();
      } else {
        alert(data.message);
      }
    });
  });
}

async function loadPendingPosts() {
  try {
    const res = await fetch("http://localhost:5000/api/admin/pending-posts");
    const posts = await res.json();

    donorApplications.innerHTML = "";

    if (posts.length === 0) {
      donorApplications.innerHTML = `
        <div class="rounded-[24px] border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-soft">
          No pending food posts.
        </div>
      `;
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className =
        "rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft";

      card.innerHTML = `
        <div class="flex flex-col gap-5">

          <div>
            <h2 class="text-xl font-bold text-slate-900">
              ${post.foodName}
            </h2>
            <p class="text-sm text-slate-500">
              Donor: ${post.donor?.name || "Unknown"}
            </p>
          </div>

          <div class="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p><b>Quantity:</b> ${post.quantity}</p>
            <p><b>Category:</b> ${post.category}</p>
            <p><b>Location:</b> ${post.pickupAddress}</p>
            <p><b>Expiry:</b> ${new Date(post.expiryDateTime).toLocaleString()}</p>
          </div>

          <p class="text-slate-700">${post.description}</p>

          ${
            post.foodImage
              ? `<img src="${post.foodImage}" class="mt-3 h-48 w-full object-cover rounded-xl" />`
              : ""
          }

          <div class="flex gap-3 mt-4">
            <button
              class="approve-post-btn rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              data-id="${post._id}"
            >
              Approve
            </button>

            <button
              class="reject-post-btn rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100"
              data-id="${post._id}"
            >
              Reject
            </button>
          </div>

        </div>
      `;

      donorApplications.appendChild(card);
    });

    attachPostEvents();
  } catch (error) {
    console.error(error);
  }
}

function attachPostEvents() {
  document.querySelectorAll(".approve-post-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/approve-post/${id}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Post approved");
        loadPendingPosts();
      } else {
        alert(data.message);
      }
    });
  });

  document.querySelectorAll(".reject-post-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      const res = await fetch(
        `http://localhost:5000/api/admin/reject-post/${id}`,
        {
          method: "PUT",
        },
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Post rejected");
        loadPendingPosts();
      } else {
        showToast(data.message);
      }
    });
  });
}
