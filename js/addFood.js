const foodPostForm = document.getElementById("foodPostForm");

const user = JSON.parse(localStorage.getItem("user"));

function showToast(message, type = "success") {
  const existingToast = document.getElementById("customToast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "customToast";

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-slate-900";

  toast.className = `
    fixed right-5 top-24 z-[9999]
    rounded-2xl ${bgColor}
    px-5 py-3 text-sm font-bold text-white
    shadow-lg transition-all duration-300
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
  }, 2200);

  setTimeout(() => {
    toast.remove();
  }, 2600);
}

if (!user) {
  window.location.href = "login.html";
}

if (user.donorStatus !== "approved") {
  alert("You must be an approved donor to create food posts.");
  window.location.href = "apply_donor.html";
}

foodPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("donor", user._id);
  formData.append("foodName", document.getElementById("foodName").value.trim());
  formData.append("quantity", document.getElementById("quantity").value.trim());
  formData.append("category", document.getElementById("category").value);
  formData.append("description", document.getElementById("description").value.trim());
  formData.append("expiryDateTime", document.getElementById("expiryDateTime").value);
  formData.append("pickupAddress", document.getElementById("pickupAddress").value.trim());
  formData.append("area", document.getElementById("area").value.trim());
  formData.append("city", document.getElementById("city").value.trim());

  formData.append("latitude", "");
  formData.append("longitude", "");

  const imageFile = document.getElementById("foodImage").files[0];

  if (imageFile) {
    formData.append("foodImage", imageFile);
  }

  try {
    const res = await fetch("http://localhost:5000/api/food/create", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Food post submitted for admin approval.");
      foodPostForm.reset();
      window.location.href = "feed.html";
    } else {
      showToast(data.message);
    }
  } catch (error) {
    console.error("Food post error:", error);
    showToast("Error creating food post.");
  }
});