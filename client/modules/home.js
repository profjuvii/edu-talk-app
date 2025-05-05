import { getRequest, postRequest, patchRequest, addMessage } from "./utils.js";

// Global variables
let lastClickTime = 0;

// Load home page with loading effect
export async function loadHomePage() {
    return `
        <section id="home" class="posts">
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
        document.getElementById("home").innerHTML = `<div id="log-msg">No posts yet</div>`;
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
                    <button class="like-btn">
                        <i class="fa-solid fa-thumbs-up">
                            <span class="like ${topic.isLiked ? "active" : ""}">${topic.likes}</span>
                        </i>
                    </button>
                    <button class="comment-btn"><i class="fa-solid fa-comment"></i></button>
                </div>
            </div>
        `;

        document.getElementById("home")?.insertAdjacentHTML("beforeend", html);
    });
}

// Init like button
async function initLikeBtn(url, target, userId) {
    if (!target.closest(".like-btn")) return;

    const now = Date.now();
    if (now - lastClickTime < 1000) return;

    lastClickTime = now;

    const post = target.closest(".post");
    const likeLine = post.querySelector(".like");
    let like = 1;

    if (!likeLine.classList.contains("active")) {
        likeLine.innerHTML = Number(likeLine.innerHTML) + 1;
        likeLine.classList.add("active");
    } else {
        likeLine.innerHTML = Number(likeLine.innerHTML) - 1;
        likeLine.classList.remove("active");
        like = -1;
    }

    await patchRequest(`${url}/users/${userId}/topics/${post.id}/likes`, { like });
}

function commentToHTML(comment) {
    return `
        <div class="comment" id="${comment.id}">
            <h3>${comment.username}</h3>
            <p>${comment.text}</p>
        </div>
    `;
}

// Init comment button
async function initCommentBtn(url, target, user) {
    if (!target.closest(".comment-btn")) return;

    const id = target.closest(".post").id;

    if (document.getElementById("comment-form-area")) return;

    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("comment-modal-overlay");

    const commentColumn = document.createElement("div");
    commentColumn.classList.add("comments");

    const html = `
        <form class="mini-box" id="comment-form-area">
            <h2>Comments</h2>
            <div class="input-text">
                <textarea id="input-text" placeholder="Write new comment..." maxlength="255"></textarea>
            </div>
            <div class="btn-controls">
                <button type="submit" id="add-btn">Add</button>
                <button type="reset" id="close-btn">Cancel</button>
            </div>
        </form>
        <div id="log-msg">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    commentColumn.innerHTML = html;
    modalOverlay.appendChild(commentColumn);
    document.body.appendChild(modalOverlay);

    const formBlock = document.getElementById("comment-form-area");

    // Load all comments
    const comments = await getRequest(`${url}/topics/${id}/comments`);
    comments.forEach(comment => formBlock.insertAdjacentHTML("afterend", commentToHTML(comment)));
    document.getElementById("log-msg").remove();

    function closeModal() {
        modalOverlay.remove();
    }

    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay || event.target === commentColumn) closeModal();
    });

    const inputField = document.getElementById("input-text").closest(".input-text");
    const msgPos = "afterbegin";

    // Add button
    document.getElementById("add-btn").addEventListener("click", async (event) => {
        event.preventDefault();
        
        const inputText = document.getElementById("input-text");
        if (!inputText.value.trim()) {
            addMessage(inputField, msgPos, "Input field is empty", "red");
            inputText.value = "";
            return;
        }

        const json = await postRequest(`${url}/users/${user.id}/topics/${id}/comments`, { text: inputText.value });
        const comment = json.comment;
        comment.username = user.username;

        inputText.value = "";

        formBlock.insertAdjacentHTML("afterend", commentToHTML(comment));
    });

    document.getElementById("close-btn").addEventListener("click", closeModal);
}

// Init home page
export async function initHomePage(url, user) {
    const topics = await getRequest(`${url}/users/${user.id}/topics/home`);
    await loadAllPostsOnPage(topics);

    document.getElementById("home").addEventListener("click", (event) => {
        initLikeBtn(url, event.target, user.id);
        initCommentBtn(url, event.target, user);
    });
}