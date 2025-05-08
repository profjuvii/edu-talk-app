import { patchRequest, postRequest, setupNavbar } from "./modules/utils.js";
import { initNewTopicPage } from "./modules/new-topic.js";
import { loadProfilePage, initProfilePage } from "./modules/profile.js";
import { loadHomePage, initHomePage } from "./modules/home.js";
import { loadMyTopicsPage, initMyTopicsPage } from "./modules/my-topics.js";
import { renderLoginPage, renderRegisterPage } from "./modules/auth.js";

const URL = "http://localhost:3000";

async function authenticateUser() {
    navigateTo('');
    
    const savedLoginData = JSON.parse(localStorage.getItem("EduTalkUser"));

    if (savedLoginData) {
        const json = await patchRequest(`${URL}/users/login`, savedLoginData);

        if (json.user) {
            return json.user;
        }
    }
    
    const token = JSON.parse(localStorage.getItem("EduTalkUserToken"));

    if (token) {
        const json = await postRequest(`${URL}/verify-token`, { token });

        if (json.user) {
            return json.user;
        }
    }

    localStorage.clear();
    return await renderLoginPage(URL);
}

window.navigateTo = (page) => {
    location.hash = page;
};

function initRouter(user) {
    navigateTo('Home');
    setupNavbar();

    const app = document.getElementById("app");

    const routes = {
        register: {
            render: () => renderRegisterPage(URL),
        },
        login: {
            render: () => renderLoginPage(URL),
        },
        home: {
            render: async () => {
                app.innerHTML = await loadHomePage();
                initHomePage(URL, user);
            }
        },
        "my-topics": {
            render: async () => {
                app.innerHTML = await loadMyTopicsPage();
                initMyTopicsPage(URL, user);
            }
        },
        "new-topic": {
            render: async () => {
                const html = await fetch("./components/new-topic.html").then(res => res.text());
                app.innerHTML = html;
                initNewTopicPage(URL, user);
            }
        },
        profile: {
            render: async () => {
                app.innerHTML = await loadProfilePage(user);
                initProfilePage(URL, user.id);
            }
        },
        "not-found": {
            render: () => app.innerHTML = "<h2>404 Page Not Found</h2>"
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

    window.addEventListener("hashchange", router);
}

async function main() {
    let user = await authenticateUser();
    initRouter(user);
}

document.addEventListener("DOMContentLoaded", main);