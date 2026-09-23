import colors from "colors/safe";

type LogColor = "green" | "blue" | "yellow" | "red";

function format(level: string, color: LogColor, message: unknown): void {
    const time = colors.blue(new Date().toLocaleString("th-TH"));
    const tag = colors[color](level);
    console.log(colors.gray(`[${time}]`) + colors.gray(` [${tag}]`) + colors.white(` ${String(message)}`));
}

const logger = {
    debug(message: unknown): void {
        if (process.env.NODE_ENV === "development") format("DEBUG", "green", message);
    },
    info(message: unknown): void { format("INFO", "blue", message); },
    warning(message: unknown): void { format("WARN", "yellow", message); },
    danger(message: unknown): void { format("DANGER", "red", message); },
    error(message: unknown): void { format("ERROR", "red", message); },
    success(message: unknown): void { format("SUCCESS", "green", message); },
};

export = logger;
