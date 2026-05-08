const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const requestId = params.get("requestId");
const receiverId = params.get("receiverId");

if (!requestId || !receiverId) {
  alert("Invalid chat link.");
  window.location.href = "feed.html";
}

const socket = io("http://localhost:5000");

const messagesBox = document.getElementById("messagesBox");
const chatSubtitle = document.getElementById("chatSubtitle");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

socket.emit("join_request_room", requestId);

function renderMessage(message) {
  const isMine = message.sender._id === user._id || message.sender === user._id;

  const wrapper = document.createElement("div");
  wrapper.className = isMine ? "flex justify-end" : "flex justify-start";

  wrapper.innerHTML = `
    <div class="max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
      isMine
        ? "bg-green-600 text-white rounded-br-sm"
        : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
    }">
      <p>${message.text}</p>
      <p class="mt-1 text-[10px] opacity-70">
        ${new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}
      </p>
    </div>
  `;

  messagesBox.appendChild(wrapper);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function loadMessages() {
  try {
    const res = await fetch(`http://localhost:5000/api/messages/${requestId}`);
    const messages = await res.json();
    await fetch(
  `http://localhost:5000/api/messages/read/${requestId}/${user._id}`,
  {
    method: "PUT"
  }
);

    messagesBox.innerHTML = "";

    if (messages.length === 0) {
      messagesBox.innerHTML = `
        <p class="text-center text-sm text-slate-400">
          No messages yet. Start the conversation.
        </p>
      `;
    } else {
      messages.forEach(renderMessage);
    }

    chatSubtitle.textContent = "Connected conversation";
  } catch (error) {
    console.error(error);
    messagesBox.innerHTML = `
      <p class="text-center text-sm text-red-500">
        Failed to load messages.
      </p>
    `;
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;

  socket.emit("send_message", {
    requestId,
    sender: user._id,
    receiver: receiverId,
    text
  });

  messageInput.value = "";
});

socket.on("receive_message", (message) => {
  const emptyText = messagesBox.querySelector("p.text-center");
  if (emptyText) messagesBox.innerHTML = "";

  renderMessage(message);
});

loadMessages();