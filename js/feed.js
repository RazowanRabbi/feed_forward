const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

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
      alert("Post link copied!");
    } catch (error) {
      alert("Share link: " + link);
    }
  });
});

const donorOnlyLinks = document.querySelectorAll(".donor-only");

donorOnlyLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    if (user.role !== "donor") {
      e.preventDefault();
      alert(
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
