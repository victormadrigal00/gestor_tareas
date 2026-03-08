const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "tasks.html";
        } else {
            mensaje.textContent = data.error || "Error al iniciar sesión";
            mensaje.style.color = "red";
        }
    } catch (error) {
        mensaje.textContent = "No se puede conectar con el servidor";
        mensaje.style.color = "red";
    }
});
