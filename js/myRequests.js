const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const container = document.getElementById("requestsContainer");

async function loadRequests() {
  try {
    const res = await fetch(
      `http://localhost:5000/api/request/my-requests/${user._id}`
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
          Status: ${req.status}
        </p>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "Error loading requests";
  }
}

loadRequests();