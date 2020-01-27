const electron = require("electron");
const url = require("url");
const path = require("path");
const db = require("./lib/connection").db;

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow, newWindow;

app.on("ready", () => {

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/mainWindow.html"),
            protocol: "file",
            slashes: true
        })
    );

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    ipcMain.on("newTodo:close", () => {
        newWindow.close();
        newWindow = null;
    });

    ipcMain.on("newTodo:save", (err, data) => {
        if (data) {
            db.query(`INSERT INTO todos (text) VALUES ('${data.todoValue}')`, (err, res, fields) => {
                if (err) throw err;
                mainWindow.webContents.send("todo:addItem", {
                    id: res.insertId,
                    text: data.todoValue
                });
            });

            //mainWindow.webContents.send("todo:addItem", todo);

            if (data.ref === "new") {
                newWindow.close();
                newWindow = null;
            }
        }
    });

    ipcMain.on("key:close", () => {
        app.quit();
    });

    mainWindow.on("close", () => {
        app.quit();
    });

    mainWindow.webContents.once("dom-ready", () => {
        db.query("SELECT * FROM todos", (err, res, fields) => {
            if (err) throw err;
            mainWindow.webContents.send("initApp", res);
        });
    });

    ipcMain.on("remove:data", (err, id) => {
        const removedID = id;
        db.query(`DELETE FROM todos WHERE id=${id}`, (err, res, fields) => {
            if (err) throw err;
            console.log(`ID:${id} olan kayit silindi.`);
        });
    });

});

const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni TODO Ekle",
                click() {
                    createWindow();
                }
            },
            { label: "Tümünü Sil" },
            {
                label: "Çıkış",
                accelerator: process.platform == "darwin" ? "Comman+Q" : "Ctrl+Q",
                role: "quit"
            }
        ]
    }
];

if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push(
        {
            label: "Geliştirici Ayarları",
            submenu: [
                {
                    label: "Geliştirici Penceresi Toggle",
                    click(item, focusedWindow) {
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    lavel: "Yenile",
                    role: "reload"
                }
            ]
        });
}

const createWindow = () => {
    newWindow = new BrowserWindow({
        width: 480,
        height: 183,
        title: "Yeni Pencere",
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    newWindow.setResizable(false);

    newWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/newTodo.html"),
            protocol: "file",
            slashes: true
        })
    );
}
