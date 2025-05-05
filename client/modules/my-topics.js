import { getRequest, deleteRequest, patchRequest, postRequest, addMessage } from "./utils.js";

// Load my topics page with loading effect
export async function loadMyTopicsPage() {
    return `
        <section id="my-topics" class="posts">
            <div id="log-msg">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </section>`;
}

// Load all posts on page
function loadAllPostsOnPage(topics) {
    if (!topics || topics.length === 0) {
        document.getElementById("my-topics").innerHTML = `<div id="log-msg">No posts yet</div>`;
        return;
    }

    document.getElementById("log-msg")?.remove();

    topics.forEach(topic => {
        const html = `
            <div class="post" id="${topic.id}">
                <h3>${topic.username}</h3>
                <p>${topic.text}</p>
                ${topic.encodedPhoto ? `<div class="post-content"><img src="${topic.encodedPhoto}" alt="photo"></div>` : ""}
                <div class="post-controls">
                    <button class="edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="del-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;

        document.getElementById("my-topics")?.insertAdjacentHTML("afterbegin", html);
    });
}

// Init delete button
async function initDeleteBtn(url, target, user) {
    if (!target.closest(".del-btn")) return;

    const post = target.closest(".post");

    post.remove();
    await deleteRequest(`${url}/topics/${post.id}`);
    user.topicCount -= 1;

    const remainingPosts = document.querySelectorAll(".post");
    if (remainingPosts.length === 0) {
        const noPostArea = `<div id="log-msg">No posts yet</div>`;
        document.getElementById("my-topics").innerHTML = noPostArea;
    }
}

// Init update form for editing topic text
function initUpdateForm(url, target) {
    if (!target.closest(".edit-btn")) return;

    const id = target.closest(".post").id;
    const textArea = document.getElementById(id).querySelector("p");

    if (document.getElementById("update-form-area")) return;

    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("update-modal-overlay");

    const formBlock = document.createElement("form");
    formBlock.id = "update-form-area";
    formBlock.classList = "mini-box";
    formBlock.innerHTML = `
        <h2>Update Post</h2>
        <div class="input-text">
            <textarea id="input-text" placeholder="Write new text..." maxlength="255">${textArea.innerHTML}</textarea>
        </div>
        <div class="btn-controls">
            <button type="submit" id="update-btn">Update</button>
            <button type="reset" id="close-btn">Cancel</button>
        </div>
    `;

    modalOverlay.appendChild(formBlock);
    document.body.appendChild(modalOverlay);

    document.body.classList.add("modal-open");

    function closeModal() {
        modalOverlay.remove();
        document.body.classList.remove("modal-open");
    }

    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    const inputField = document.getElementById("input-text").closest(".input-text");
    const msgPos = "afterbegin";

    // Update button
    document.getElementById("update-btn").addEventListener("click", async (event) => {
        event.preventDefault();
        
        const inputText = document.getElementById("input-text");
        if (!inputText.value.trim()) {
            addMessage(inputField, msgPos, "Input field is empty", "red");
            inputText.value = "";
            return;
        }

        if (textArea.innerHTML !== inputText.value) {
            textArea.innerHTML = inputText.value;
            await patchRequest(`${url}/topics/${id}/text`, { text: inputText.value });
        }

        closeModal();
    });

    document.getElementById("close-btn").addEventListener("click", closeModal);
}

// Init my topics page
export async function initMyTopicsPage(url, user) {
    const topics = await getRequest(`${url}/users/${user.id}/topics/my-topics`);
    await loadAllPostsOnPage(topics);

    document.getElementById("my-topics").addEventListener("click", (event) => {
        initDeleteBtn(url, event.target, user);
        initUpdateForm(url, event.target);
    });
}