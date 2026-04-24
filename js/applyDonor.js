const applyBtn = document.getElementById("applyBtn");
const statusText = document.getElementById("statusText");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

// 🔹 Load current status on page load
async function loadStatus() {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user._id}`);
    const user = await res.json();

    // 🔥 update localStorage with fresh DB data
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Updated user:", user);

    if (user.donorStatus === "none") {
      statusText.textContent = "Not applied yet";
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Now";
    }

    if (user.donorStatus === "pending") {
      statusText.textContent = "Pending approval ⏳";
      applyBtn.disabled = true;
      applyBtn.textContent = "Already Applied";
    }

    if (user.donorStatus === "approved") {
      statusText.textContent = "Approved 🎉";
      applyBtn.disabled = true;
      applyBtn.textContent = "You are a donor";
    }

    if (user.donorStatus === "rejected") {
      statusText.textContent = "Rejected ❌";
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Again";
    }
  } catch (error) {
    console.error(error);
  }
}

loadStatus();

// 🔹 Apply button logic
applyBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/apply-donor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user._id }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Application submitted!");
      loadStatus(); // refresh UI
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Error submitting application");
  }
});
