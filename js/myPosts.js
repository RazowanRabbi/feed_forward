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

if (user.role !== "donor") {
  showToast("Only approved donors can view My Posts.");
  window.location.href = "feed.html";
}

const container = document.getElementById("myPostsContainer");
const totalPosts = document.getElementById("totalPosts");
const pendingPosts = document.getElementById("pendingPosts");
const approvedPosts = document.getElementById("approvedPosts");

function getApprovalBadge(status) {
  if (status === "approved") {
    return `<span class="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Approved</span>`;
  }

  if (status === "pending") {
    return `<span class="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">Pending Approval</span>`;
  }

  return `<span class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Rejected</span>`;
}

function getFoodStatusBadge(status) {
  if (status === "available") {
    return `<span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">Available</span>`;
  }

  if (status === "requested") {
    return `<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Requested</span>`;
  }

  if (status === "delivered") {
    return `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Delivered</span>`;
  }

  return `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">${status}</span>`;
}

async function loadMyPosts() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/food/my-posts/${user._id}`,
    );
    const posts = await res.json();

    totalPosts.textContent = posts.length;
    pendingPosts.textContent = posts.filter(
      (post) => post.approvalStatus === "pending",
    ).length;
    approvedPosts.textContent = posts.filter(
      (post) => post.approvalStatus === "approved",
    ).length;

    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h2 class="text-xl font-bold text-slate-900">No posts yet</h2>
          <p class="mt-2 text-sm text-slate-500">
            You have not created any food posts yet.
          </p>
          <a
            href="add_food.html"
            class="mt-5 inline-block rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Create Your First Post
          </a>
        </div>
      `;
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className =
        "overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft";

      card.innerHTML = `
        ${
          post.foodImage
            ? `
              <img
                src="${post.foodImage}"
                alt="${post.foodName}"
                class="h-64 w-full object-cover"
              />
            `
            : `
              <div class="flex h-40 w-full items-center justify-center bg-brand-50 text-sm font-semibold text-brand-700">
                No Image Uploaded
              </div>
            `
        }

        <div class="p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-2xl font-bold text-slate-900">${post.foodName}</h2>
              <p class="mt-1 text-sm text-slate-500">
                Posted on ${new Date(post.createdAt).toLocaleDateString()} at ${new Date(
                  post.createdAt,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              ${getApprovalBadge(post.approvalStatus)}
              ${getFoodStatusBadge(post.status)}
            </div>
          </div>

          <p class="mt-4 leading-7 text-slate-600">
            ${post.description}
          </p>

          <div class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-2xl bg-slate-50 p-4">
              <span class="font-semibold text-slate-800">Quantity:</span>
              ${post.quantity}
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <span class="font-semibold text-slate-800">Category:</span>
              ${post.category}
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <span class="font-semibold text-slate-800">Pickup:</span>
              ${post.pickupAddress}
            </div>

            <div class="rounded-2xl bg-red-50 p-4 text-red-700">
              <span class="font-semibold">Expires:</span>
              ${new Date(post.expiryDateTime).toLocaleString()}
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-900">Admin Review Status</p>
            <p class="mt-1 text-sm text-slate-600">
              ${
                post.approvalStatus === "pending"
                  ? "Your post is waiting for admin approval. It will appear in the public feed after approval."
                  : post.approvalStatus === "approved"
                    ? "Your post is approved and visible to receivers in the public feed."
                    : "Your post was rejected by admin and is not visible publicly."
              }
            </p>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("My posts error:", error);
    container.innerHTML = `
      <div class="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Failed to load your posts.
      </div>
    `;
  }
}

loadMyPosts();
