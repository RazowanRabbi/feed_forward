const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const locationInput = document.getElementById("location");
const bioInput = document.getElementById("bio");
const profileImageInput = document.getElementById("profileImage");

const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");
const previewEmail = document.getElementById("previewEmail");
const previewRole = document.getElementById("previewRole");
const previewDonorStatus = document.getElementById("previewDonorStatus");

async function loadProfile() {
  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user._id}`);
    const freshUser = await res.json();

    localStorage.setItem("user", JSON.stringify(freshUser));

    nameInput.value = freshUser.name || "";
    emailInput.value = freshUser.email || "";
    phoneInput.value = freshUser.phone || "";
    locationInput.value = freshUser.location || "";
    bioInput.value = freshUser.bio || "";

    previewImage.src =
      freshUser.profileImage || "https://via.placeholder.com/160";
    previewName.textContent = freshUser.name || "Unknown User";
    previewEmail.textContent = freshUser.email || "";
    previewRole.textContent = freshUser.role || "receiver";
    previewDonorStatus.textContent = freshUser.donorStatus || "none";
  } catch (error) {
    console.error("Profile load error:", error);
    alert("Could not load profile.");
  }
}

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];

  if (file) {
    previewImage.src = URL.createObjectURL(file);
  }
});

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("name", nameInput.value.trim());
  formData.append("phone", phoneInput.value.trim());
  formData.append("location", locationInput.value.trim());
  formData.append("bio", bioInput.value.trim());

  const imageFile = profileImageInput.files[0];

  if (imageFile) {
    formData.append("profileImage", imageFile);
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/auth/update-profile/${user._id}`,
      {
        method: "PUT",
        body: formData,
      },
    );

    const updatedUser = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Profile updated successfully.");
      window.location.href = "feed.html";
    } else {
      alert(updatedUser.message || "Profile update failed.");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Error updating profile.");
  }
});

loadProfile();
