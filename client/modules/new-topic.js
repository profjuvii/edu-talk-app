import { postRequest, clearMessage, addMessage } from "./utils.js";

// Init append photo to form
function initAppendPhotoToForm() {
    const uploadPhotoArea = document.getElementById("uploaded-photo");

    document.getElementById("uploaded-photo").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = function (e) {
            const photoBlock = `
                <div class="temp-photo">
                    <img src="${e.target.result}" alt="temp photo">
                </div>
            `;

            document.getElementById("upload-photo-area").style.display = "none";
            uploadPhotoArea.insertAdjacentHTML("afterend", photoBlock);
        }

        reader.readAsDataURL(file);
    });
}

function clearFields() {
    document.getElementById("upload-photo-area").style.display = "block";
    document.querySelector(".temp-photo")?.remove();
    document.getElementById("input-text").value = "";
    document.getElementById("uploaded-photo").value = "";
}

// Init new topic page
export function initNewTopicPage(url, user) {
    initAppendPhotoToForm();

    // Define base object and message position
    const inputField = document.getElementById("input-text").closest(".input-text");
    const msgPos = "afterbegin";

    document.getElementById("add-btn")?.addEventListener("click", async (event) => {
        event.preventDefault();
        
        const inputText = document.getElementById("input-text");
        const photo = document.getElementById("uploaded-photo");

        if (!inputText.value.trim()) {
            addMessage(inputField, msgPos, "Input field is empty", "red");
            clearFields();
            return;
        }

        const data = { text: inputText.value, encodedPhoto: null, userId: user.id };
        const photoFile = photo.files[0];

        // Read photo
        const reader = new FileReader();
        reader.onload = async function (e) {
            data.encodedPhoto = e.target.result;
            const json = await postRequest(`${url}/topics`, data);
            if (json.topic) {
                addMessage(inputField, msgPos, "New post successfully added!", "green");
                user.topicCount += 1;
            } else {
                addMessage(inputField, msgPos, "Failed to add post", "red");
            }
        }

        if (photoFile) {
            reader.readAsDataURL(photoFile);
        } else {
            const json = await postRequest(`${url}/topics`, data);
            if (json.topic) {
                addMessage(inputField, msgPos, "New post successfully added!", "green");
                user.topicCount += 1;
            } else {
                addMessage(inputField, msgPos, "Failed to add post", "red");
            }
        }

        clearFields();
    });

    document.getElementById("reset-btn").addEventListener("click", (event) => {
        event.preventDefault();
        clearFields();
        clearMessage();
    });
}