const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const container = document.getElementById("requestsContainer");

async function loadRequests() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/request/my-requests/${user._id}`,
    );

    const requests = await res.json();

    container.innerHTML = "";

    if (requests.length === 0) {
      container.innerHTML = `<p>No requests yet.</p>`;
      return;
    }

    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-xl shadow";

      card.innerHTML = `
        <h2 class="text-xl font-bold">${req.foodPost.foodName}</h2>
        <p class="text-sm text-gray-500">Donor: ${req.donor.name}</p>

        <p class="mt-2"><b>Requested:</b> ${req.requestedQuantity}</p>
        <p><b>Message:</b> ${req.message || "None"}</p>

        <p class="mt-2 font-semibold">
  Status:
  ${
    req.status === "pending"
      ? `<span class="text-yellow-600">Pending ⏳</span>`
      : req.status === "accepted"
        ? `<span class="text-green-600">Accepted ✅</span>`
        : `<span class="text-red-600">Rejected ❌</span>`
  }
</p>

${
  req.status === "accepted"
    ? `
      <a
        href="chat.html?requestId=${req._id}&receiverId=${req.donor._id}"
        class="mt-4 inline-block rounded-xl bg-green-600 px-4 py-2 text-white font-semibold"
      >
        Contact Donor
      </a>
    `
    : ""
}
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "Error loading requests";
  }
}

loadRequests();
