const { DateTime } = require("luxon");

/**
 * Devuelve la fecha y hora actual ajustada al timezone de Colombia (UTC-5).
 * @returns {Date} Fecha y hora ajustada al timezone de Colombia.
 */
function getColombiaTime() {
    const colombiaTime = DateTime.utc().setZone("America/Bogota"); // Usar UTC como base y ajustar al timezone
    console.log("Fecha de Colombia:", colombiaTime.toFormat("yyyy-MM-dd HH:mm:ss")); // Formato legible
    console.log("Fecha de Colombia:", colombiaTime);
    return colombiaTime.toJSDate();
}

module.exports = { getColombiaTime };