import { Validator } from "./Validator";
import { Rules, Values } from "./types";

export function validate(rules: Rules, values: Values): [boolean, { [key: string]: string[] }] {
    const validator = new Validator(rules, values);
    return validator.validate();
}
