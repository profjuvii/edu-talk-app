// === Requests ===
export async function getRequest(url) {
    try {
        const response = await fetch(url);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json?.error || `Server status: ${response.status}`);
        }

        return json;
    } catch (error) {
        console.error("Failed to get data:", error.message);
        return null;
    }
}

export async function postRequest(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await response.json();

        if (!response.ok) {
            throw new Error(json?.error || `Server status: ${response.status}`);
        }

        console.log(json.message);

        return json;
    } catch (error) {
        console.error("Failed to post data:", error);
        return error;
    }
}

export async function deleteRequest(url) {
    try {
        const response = await fetch(url, { method: "DELETE" });
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json?.error || `Server status: ${response.status}`);
        }

        console.log(json.message);

        return json;
    } catch (error) {
        console.error("Failed to delete data:", error);
    }
}

export async function patchRequest(url, data) {
    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();

        if (!response.ok) {
            throw new Error(json?.error || `Server status: ${response.status}`);
        }

        console.log(json.message);

        return json;
    } catch (error) {
        console.error("Failed to patch data:", error);
        return error;
    }
}

// === Message ===
export function clearMessage() {
    document.getElementById("log-msg")?.remove()
};

export function addMessage(baseObj, where, message, color) {
    clearMessage();
    const msg = `<div id="log-msg" class="${color}">${message}</div>`;
    baseObj.insertAdjacentHTML(where, msg);
}

// === Mobile navbar ===
export function setupNavbar() {
    const button = document.querySelector('.btn-nav');
    const navbar = document.querySelector('nav');

    // Appear navbar menu after click button
    button.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Dynamic transition between sections
    window.addEventListener('click', (event) => {
        if (event.target.closest(".btn-nav")) return;
        if (event.target.closest("header") && !event.target.closest("a")) return;
        if (navbar.classList.contains('active')) navbar.classList.remove('active');
    });
}