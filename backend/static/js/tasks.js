const tasksList = document.getElementById("tasksList");
const taskForm = document.getElementById("taskForm");
const mensaje = document.getElementById("mensaje");
const logoutBtn = document.getElementById("logoutBtn");

// IDs de los nuevos modales
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');

function setMensaje(texto, ok = true) {
    mensaje.textContent = texto;
    mensaje.style.color = ok ? "green" : "red";
    // Limpiar mensaje tras 4 segundos
    setTimeout(() => mensaje.textContent = "Sesión activa", 4000);
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
    // Actualizar contadores
    const completadasCount = tareas.filter(t => t.completada).length;
    document.getElementById('total-count').textContent = tareas.length;
    document.getElementById('completed-count').textContent = completadasCount;

    tasksList.innerHTML = "";

    if (!tareas || tareas.length === 0) {
        tasksList.innerHTML = "<p style='color: #64748b;'>No hay tareas todavía. ¡Empieza añadiendo una!</p>";
        return;
    }

    tareas.forEach((t) => {
        const card = document.createElement("div");
        card.className = t.completada ? "task-card task-completed" : "task-card";

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
        estado.className = `estado-tag ${t.completada ? "completada" : "pendiente"}`;
        estado.textContent = t.completada ? "Completada" : "Pendiente";

        info.appendChild(titulo);
        info.appendChild(desc);
        info.appendChild(estado);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Botón editar (NUEVO: Ahora llama a abrirModalEditar)
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Editar";
        btnEdit.className = "btn-secondary";
        btnEdit.addEventListener("click", () => abrirModalEditar(t));

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

        // Botón borrar (NUEVO: Ahora llama a abrirModalBorrar)
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Borrar";
        btnDelete.className = "btn-danger";
        btnDelete.addEventListener("click", () => abrirModalBorrar(t));

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

// =========================================
// FUNCIONES PARA MODALES (NUEVO)
// =========================================

function cerrarModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
}

// --- EDICIÓN ---

function abrirModalEditar(tarea) {
    // Rellenar el modal con los datos actuales
    document.getElementById('editTaskId').value = tarea.id_tarea;
    document.getElementById('editTitulo').value = tarea.titulo;
    document.getElementById('editDescripcion').value = tarea.descripcion || "";
    
    // Abrir el modal
    editModal.classList.add('open');
}

async function guardarEdicion() {
    const id = document.getElementById('editTaskId').value;
    const nuevoTitulo = document.getElementById('editTitulo').value.trim();
    const nuevaDesc = document.getElementById('editDescripcion').value.trim();

    if (!nuevoTitulo) {
        setMensaje("El título no puede estar vacío", false);
        return;
    }

    const { response, data } = await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo: nuevoTitulo,
            descripcion: nuevaDesc
            
        })
    });

    if (response.ok) {
        cerrarModal('editModal');
        setMensaje("Tarea actualizada", true);
        await cargarTareas();
    } else {
        setMensaje((data && data.error) ? data.error : "Error al editar", false);
    }
}

// --- BORRADO ---

function abrirModalBorrar(tarea) {
    // Rellenar el modal con los datos
    document.getElementById('deleteTaskId').value = tarea.id_tarea;
    document.getElementById('deleteTaskTitle').textContent = tarea.titulo;
    
    // Abrir el modal
    deleteModal.classList.add('open');
}

async function confirmarBorrado() {
    const id = document.getElementById('deleteTaskId').value;

    const { response } = await apiFetch(`/tasks/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        cerrarModal('deleteModal');
        setMensaje("Tarea eliminada", true);
        await cargarTareas();
    } else {
        setMensaje("Error al borrar", false);
    }
}

// Iniciar
cargarTareas();