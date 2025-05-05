import { patchRequest, setupNavbar } from "./modules/utils.js";
import { initNewTopicPage } from "./modules/new-topic.js";
import { loadProfilePage, initProfilePage } from "./modules/profile.js";
import { loadHomePage, initHomePage } from "./modules/home.js";
import { loadMyTopicsPage, initMyTopicsPage } from "./modules/my-topics.js";
import { renderLoginPage, renderRegisterPage } from "./modules/auth.js";

const URL = "http://localhost:3000";

async function main() {
    location.hash = "";
    let user = null;

    // Login from localStorage
    const savedLoginData = JSON.parse(localStorage.getItem("EduTalkUser"));

    if (savedLoginData) {
        const json = await patchRequest(`${URL}/users/login`, savedLoginData);

        if (json.user) {
            user = json.user;
        } else {
            // Login from page
            localStorage.clear();
            user = await renderLoginPage(URL);
        }
    } else {
        // Login from page
        user = await renderLoginPage(URL);
    }

    setupNavbar();

    const routes = {
        register: {
            render: () => renderRegisterPage(URL),
        },
        login: {
            render: () => renderLoginPage(URL),
        },
        home: {
            render: async () => {
                document.getElementById("app").innerHTML = await loadHomePage();
                initHomePage(URL, user);
            }
        },
        "my-topics": {
            render: async () => {
                document.getElementById("app").innerHTML = await loadMyTopicsPage();
                initMyTopicsPage(URL, user);
            }
        },
        "new-topic": {
            render: async () => {
                const html = await fetch("./components/new-topic.html").then(res => res.text());
                document.getElementById("app").innerHTML = html;
                initNewTopicPage(URL, user);
            }
        },
        profile: {
            render: async () => {
                document.getElementById("app").innerHTML = await loadProfilePage(user);
                initProfilePage(URL, user.id);
            }
        }
    };

    async function loadPage(page) {
        const route = routes[page] || routes["home"];
        await route.render();
    }

    function router() {
        const page = location.hash.slice(1) || "home";
        loadPage(page);
    }

    location.hash = "home";
    window.addEventListener("hashchange", router);
}

document.addEventListener("DOMContentLoaded", main);