const tasksList = document.getElementById("tasksList");
const taskForm = document.getElementById("taskForm");
const mensaje = document.getElementById("mensaje");
const logoutBtn = document.getElementById("logoutBtn");

function setMensaje(texto, ok = true) {
    mensaje.textContent = texto;
    mensaje.style.color = ok ? "green" : "red";
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        credentials: "include",
        ...options
    });

    let data = null;
    try { data = await response.json(); } catch (_) {}

    return { response, data };
}

async function cargarTareas() {
    const { response, data } = await apiFetch("/tasks", { method: "GET" });

    if (response.ok) {
        renderTasks(data);
    } else if (response.status === 401) {
        window.location.href = "login.html";
    } else {
        setMensaje("Error al cargar tareas", false);
    }
}

function renderTasks(tareas) {
    tasksList.innerHTML = "";

    if (!tareas || tareas.length === 0) {
        tasksList.innerHTML = "<p>No hay tareas todavía.</p>";
        return;
    }

    tareas.forEach((t) => {
        const card = document.createElement("div");
        card.className = "task-card";

        const row = document.createElement("div");
        row.className = "task-row";

        const info = document.createElement("div");

        const titulo = document.createElement("div");
        titulo.className = "task-title";
        titulo.textContent = t.titulo;

        const desc = document.createElement("div");
        desc.className = "task-desc";
        desc.textContent = t.descripcion || "";

        const estado = document.createElement("div");
        estado.className = t.completada ? "completada" : "pendiente";
        estado.textContent = t.completada ? "Completada" : "Pendiente";

        info.appendChild(titulo);
        info.appendChild(desc);
        info.appendChild(estado);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Botón editar
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Editar";
        btnEdit.className = "btn-secondary";
        btnEdit.addEventListener("click", async () => {
            const nuevoTitulo = prompt("Nuevo título:", t.titulo);
            if (nuevoTitulo === null) return; // cancelar
            const tituloLimpio = nuevoTitulo.trim();
            if (!tituloLimpio) {
                setMensaje("El título no puede estar vacío", false);
                return;
            }

            const nuevaDesc = prompt("Nueva descripción:", t.descripcion || "");
            if (nuevaDesc === null) return; // cancelar

            const { response, data } = await apiFetch(`/tasks/${t.id_tarea}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titulo: tituloLimpio,
                    descripcion: (nuevaDesc || "").trim()
                })
            });

            if (response.ok) {
                setMensaje("Tarea actualizada", true);
                await cargarTareas();
            } else {
                setMensaje((data && data.error) ? data.error : "Error al editar", false);
            }
        });

        // Botón completar
        const btnComplete = document.createElement("button");
        btnComplete.textContent = "Completar";
        btnComplete.className = "btn-secondary";
        btnComplete.disabled = !!t.completada;
        btnComplete.addEventListener("click", async () => {
            const { response } = await apiFetch(`/tasks/${t.id_tarea}/complete`, {
                method: "PUT"
            });
            if (response.ok) {
                setMensaje("Tarea completada", true);
                await cargarTareas();
            } else {
                setMensaje("Error al completar", false);
            }
        });

        // Botón borrar
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Borrar";
        btnDelete.className = "btn-danger";
        btnDelete.addEventListener("click", async () => {
            const ok = confirm("¿Seguro que quieres borrar esta tarea?");
            if (!ok) return;

            const { response } = await apiFetch(`/tasks/${t.id_tarea}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setMensaje("Tarea eliminada", true);
                await cargarTareas();
            } else {
                setMensaje("Error al borrar", false);
            }
        });

        actions.appendChild(btnEdit);
        actions.appendChild(btnComplete);
        actions.appendChild(btnDelete);

        row.appendChild(info);
        row.appendChild(actions);

        card.appendChild(row);
        tasksList.appendChild(card);
    });
}

// Crear tarea
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    const { response, data } = await apiFetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion })
    });

    if (response.ok) {
        setMensaje("Tarea creada", true);
        taskForm.reset();
        await cargarTareas();
    } else if (response.status === 401) {
        window.location.href = "login.html";
    } else {
        setMensaje((data && data.error) ? data.error : "Error al crear tarea", false);
    }
});

// Logout
logoutBtn.addEventListener("click", async () => {
    await apiFetch("/logout", { method: "POST" });
    window.location.href = "login.html";
});

cargarTareas();
