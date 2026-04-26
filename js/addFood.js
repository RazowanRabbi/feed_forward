const foodPostForm = document.getElementById("foodPostForm");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

if (user.donorStatus !== "approved") {
  alert("You must be an approved donor to create food posts.");
  window.location.href = "apply_donor.html";
}

foodPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const foodName = document.getElementById("foodName").value.trim();
  const quantity = document.getElementById("quantity").value.trim();
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value.trim();
  const expiryDateTime = document.getElementById("expiryDateTime").value;
  const pickupAddress = document.getElementById("pickupAddress").value.trim();
  const area = document.getElementById("area").value.trim();
  const city = document.getElementById("city").value.trim();
  const foodImage = document.getElementById("foodImage").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/food/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        donor: user._id,
        foodName,
        quantity,
        category,
        description,
        expiryDateTime,
        pickupAddress,
        area,
        city,
        latitude: null,
        longitude: null,
        foodImage
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Food post submitted for admin approval.");
      foodPostForm.reset();
      window.location.href = "feed.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Food post error:", error);
    alert("Error creating food post.");
  }
});