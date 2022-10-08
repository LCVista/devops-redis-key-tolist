import fs from "fs";

let eventContext = null;

function loadContextFromFile(): any {
  const eventPath = process.env["GITHUB_EVENT_PATH"];
  if (!eventPath) {
    return {};
  }

  if (!fs.existsSync(eventPath)) {
    return {};
  }
  const eventFileContents = fs.readFileSync(eventPath!!).toString();
  if (!eventFileContents || eventFileContents.length == 0) {
    return {};
  }

  return JSON.parse(eventFileContents) || {};
}

export function resetInput(): void {
  eventContext = null;
}

export function wasInvokedBySchedule(): boolean {
  if (!eventContext) {
    eventContext = loadContextFromFile();
  }

  return !!(eventContext && eventContext["schedule"]);
}

export function getInput(key: string, _default: string = ""): string {
  return String(_getInput(key, _default));
}

export function getInputBoolean(key: string): boolean {
  return _getInput(key).toString().toLowerCase() === "true";
}

export function getInputNumber(key: string): number | undefined {
  try {
    const value = Number(_getInput(key));
    if (isNaN(value)) {
      return undefined;
    } else {
      return value;
    }
  } catch (e) {
    return undefined;
  }
}

function _getInput(key: string, _default: string = ""): any {
  if (!eventContext) {
    eventContext = loadContextFromFile();
  }

  if (eventContext && eventContext["inputs"]) {
    if (eventContext["inputs"][key]) {
      return eventContext["inputs"][key];
    } else {
      return _default;
    }
  } else {
    return _default;
  }
}

loadContextFromFile();
