const electron = require("electron");

const { ipcRenderer } = electron;



checkTodoCount();

ipcRenderer.on("initApp", (err, data) => {
    data.map(value => {
        drawRow(value);
    })
});

const todoValue = document.querySelector("#todoValue");
todoValue.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        ipcRenderer.send("newTodo:save", { ref: "main", todoValue: e.target.value });
        e.target.value = "";
    }
});

const addBtn = document.querySelector("#addBtn");
addBtn.addEventListener("click", () => {
    ipcRenderer.send("newTodo:save", { ref: "main", todoValue: todoValue.value });
    todoValue.value = "";
});

ipcRenderer.on("todo:addItem", (err, data) => {
    drawRow(data);
});

const closeBtn = document.querySelector("#closeBtn");

closeBtn.addEventListener("click", () => {
    if (confirm("Uygulamadan Çıkmak İstiyor musunuz?")) {
        ipcRenderer.send("key:close");
    }
});




function checkTodoCount() {
    const container = document.querySelector(".todo-container");
    const alertContainer = document.querySelector(".alert-container");
    document.querySelector(".count-todo").innerText = container.children.length;

    if (container.children.length !== 0) {
        alertContainer.style.display = "none";
    }
    else
        alertContainer.style.display = "block";
};

function drawRow(data) {
    const container = document.querySelector(".todo-container");

    const row = document.createElement("div");
    row.className = "row";

    const col = document.createElement("div");
    col.className = "todo-item p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center";

    const p = document.createElement("p");
    p.className = "m-0 w-100";
    p.innerText = data.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger flex-shrink-1";
    deleteBtn.innerText = "X";
    deleteBtn.setAttribute("data-id", data.id);
    deleteBtn.addEventListener("click", e => {
        if (confirm("Bu Kaydı Silmek İstedğinizden Emin misiniz?")) {
            ipcRenderer.send("remove:data", e.target.getAttribute("data-id"));
            e.target.parentNode.parentNode.remove();
            checkTodoCount();
        }
    });

    col.appendChild(p);
    col.appendChild(deleteBtn);
    row.appendChild(col);
    container.appendChild(row);

    checkTodoCount();

}