const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const container = document.getElementById("donorRequestsContainer");

async function loadDonorRequests() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/request/donor-requests/${user._id}`,
    );
    const requests = await res.json();

    container.innerHTML = "";

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow text-slate-500">
          No incoming requests yet.
        </div>
      `;
      return;
    }

    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "bg-white p-5 rounded-xl shadow";

      card.innerHTML = `
        <h2 class="text-xl font-bold">${req.foodPost.foodName}</h2>
        <p class="text-sm text-gray-500">Requested by: ${req.requester.name}</p>

        <div class="mt-3 text-sm text-slate-700">
          <p><b>Requested Quantity:</b> ${req.requestedQuantity}</p>
          <p><b>Message:</b> ${req.message || "No message"}</p>
          <p><b>Pickup Preference:</b> ${req.pickupPreference || "Not specified"}</p>
          <p><b>Status:</b> ${req.status}</p>
          ${
            req.status === "pending"
              ? `
      <div class="mt-4 flex gap-3">
        <button
          class="accept-request-btn rounded-xl bg-green-600 px-4 py-2 text-white font-semibold"
          data-id="${req._id}"
        >
          Accept
        </button>

        <button
          class="reject-request-btn rounded-xl bg-red-50 px-4 py-2 text-red-700 font-semibold"
          data-id="${req._id}"
        >
          Reject
        </button>
      </div>
    `
              : ""
          }
        </div>
      `;

      container.appendChild(card);
    });
    attachRequestActions();
  } catch (error) {
    console.error(error);
    container.innerHTML = "Error loading requests";
  }
}

loadDonorRequests();

function attachRequestActions() {
  document.querySelectorAll(".accept-request-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      const res = await fetch(`http://localhost:5000/api/request/accept/${id}`, {
        method: "PUT"
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request accepted.");
        loadDonorRequests();
      } else {
        alert(data.message);
      }
    });
  });

  document.querySelectorAll(".reject-request-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      const res = await fetch(`http://localhost:5000/api/request/reject/${id}`, {
        method: "PUT"
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request rejected.");
        loadDonorRequests();
      } else {
        alert(data.message);
      }
    });
  });
}
