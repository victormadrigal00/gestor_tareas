const form = document.getElementById("registerForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            mensaje.textContent = "Usuario registrado. Ya puedes iniciar sesión.";
            mensaje.style.color = "green";
            form.reset();
        } else {
            mensaje.textContent = data.error || "Error en el registro";
            mensaje.style.color = "red";
        }
    } catch (err) {
        mensaje.textContent = "No se puede conectar con el servidor";
        mensaje.style.color = "red";
    }
});
