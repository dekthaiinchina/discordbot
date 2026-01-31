require("colors");

function format(level, color, msg) {
    const time = createDateTime().blue;
    const tag = level[color];

    console.log(`[${time}]`.gray + ` [${tag}]`.gray + ` ${String(msg)}`.white);
}

module.exports = {
    debug(msg) {
        if (process.env.NODE_ENV !== "development") return;
        format("DEBUG", "green", msg);
    },

    info(msg) {
        format("INFO", "blue", msg);
    },

    warning(msg) {
        format("WARN", "yellow", msg);
    },

    danger(msg) {
        format("DANGER", "red", msg);
    },

    success(msg) {
        format("SUCCESS", "green", msg);
    },
};

function createDateTime(ts = Date.now()) {
    return new Date(ts).toLocaleString("th-TH");
}