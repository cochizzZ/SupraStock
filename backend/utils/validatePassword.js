module.exports = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "La contraseña debe tener al menos 8 caracteres.";
    if (!hasUpperCase) return "La contraseña debe tener al menos una letra mayúscula.";
    if (!hasLowerCase) return "La contraseña debe tener al menos una letra minúscula.";
    if (!hasSpecialChar) return "La contraseña debe tener al menos un carácter especial.";
    return null;
};