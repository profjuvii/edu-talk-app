import { deleteRequest, patchRequest } from "./utils.js";

function formatDate(date) {
    const month = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const d = new Date(date);
    return `${d.getDate()} ${month[d.getMonth()]} ${d.getFullYear()}`;
}

// Load profile page
export function loadProfilePage(user) {
    const joinedAt = formatDate(user.createdAt);

    return `
        <section class="main-box">
            <h2>Profile</h2>

            <div class="username">${user.firstName} ${user.lastName}</div>

            <div class="profile-info">
                <div><span class="profile-bold">Username:</span> ${user.username}</div>
                <div><span class="profile-bold">Role:</span> ${user.role}</div>
                <div><span class="profile-bold">Email:</span> ${user.email}</div>
                <div><span class="profile-bold">Phone:</span> ${user.phone ? user.phone : "None"}</div>
                <div><span class="profile-bold">Topic count:</span> ${user.topicCount}</div>
                <div><span class="profile-bold">Joined at:</span> ${joinedAt}</div>
            </div>

            <div class="btn-controls">
                <button id="delete-btn">Delete account</button>
                <button id="logout">Log out</button>
            </div>
        </section>
    `;
}

// Init profile page
export function initProfilePage(url, userId) {
    document.getElementById("delete-btn").addEventListener("click", async () => {
        await deleteRequest(`${url}/users/${userId}`);
        localStorage.clear();
        location.reload();
    });

    document.getElementById("logout").addEventListener("click", async () => {
        await patchRequest(`${url}/users/${userId}/logout`);
        localStorage.clear();
        location.reload();
    });
}