const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const foodDetails = document.getElementById("foodDetails");
const form = document.getElementById("requestForm");

let donorId = null;

// Load food details
async function loadFood() {
  try {
    const res = await fetch(`http://localhost:5000/api/food/${postId}`);
    const post = await res.json();

    donorId = post.donor._id;

    foodDetails.innerHTML = `
      <h2 class="text-xl font-bold">${post.foodName}</h2>
      <p class="text-sm text-gray-500">Donor: ${post.donor.name}</p>
      <p class="mt-2">${post.description}</p>
      <p class="mt-2 text-sm"><b>Quantity:</b> ${post.quantity}</p>
      <p class="text-sm"><b>Location:</b> ${post.pickupAddress}</p>
    `;
  } catch (error) {
    console.error(error);
    foodDetails.textContent = "Failed to load food details";
  }
}

loadFood();

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const requestedQuantity = document.getElementById("requestedQuantity").value;
  const message = document.getElementById("message").value;
  const pickupPreference = document.getElementById("pickupPreference").value;

  try {
    const res = await fetch("http://localhost:5000/api/request/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        foodPost: postId,
        donor: donorId,
        requester: user._id,
        requestedQuantity,
        message,
        pickupPreference,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Request sent successfully!");
      window.location.href = "feed.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Error sending request");
  }
});