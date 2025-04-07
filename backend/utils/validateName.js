module.exports = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/; // Solo letras y espacios
    if (!nameRegex.test(name)) {
        return "El nombre no puede contener caracteres especiales."
    }
    return null;
}