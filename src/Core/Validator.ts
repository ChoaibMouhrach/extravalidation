import { Rules, PredefinedRules, Values, Params } from "./types";

export class Validator {
    userRules: Rules;
    userValues: Values;
    preDefinedRules: PredefinedRules = {
        required: "required",
        "min:{value}": "min",
        "max:{value}": "max",
        "gt:{value}": "gt",
        "lt:{value}": "lt",
        "lte:{value}": "lte",
        "gte:{value}": "gte",
        number: "number",
        string: "string",
        email: "email",
        uppercase: "uppercase",
        lowercase: "lowercase",
        confirmed: "confirmed",
    };

    constructor(rules: Rules, values: Values) {
        this.userRules = rules;
        this.userValues = this.evalValues(values);
    }

    evalValues = (values: Values) => {
        Object.entries(values).forEach(([key, value]) => {
            try {
                values[key] = eval(value);
            } catch (err) {}
        });
        return values;
    };

    validate = (): [boolean, { [key: string]: string[] }] => {
        let resultSatisfied: boolean = true;
        let resultErrors: {
            [key: string]: string[];
        } = {};

        for (let [ruleOwner, subRules] of Object.entries(this.userRules)) {
            for (let subRule of subRules) {
                if (subRule === "nullable" && !this.userValues[ruleOwner]) break;

                if (subRule !== "nullable") {
                    let [predefinedRuleMethodName, predefinedRuleParams]: [string, Params] = this.getMethodAndParams(subRule);

                    let [satisfied, error] = this[predefinedRuleMethodName](ruleOwner, predefinedRuleParams);

                    if (!satisfied && error) {
                        resultSatisfied = satisfied;
                        if (resultErrors[ruleOwner]) {
                            resultErrors[ruleOwner].push(error);
                        } else {
                            resultErrors[ruleOwner] = [error];
                        }
                        break;
                    }
                }
            }
        }
        return [resultSatisfied, resultErrors];
    };

    getMethodAndParams = (rule: string): [string, Params] => {
        let method: null | string = null;
        let params: Params = {};

        for (let [predefinedRuleName, predefinedRuleMethod] of Object.entries(this.preDefinedRules)) {
            let pattern: RegExp = new RegExp(`^${predefinedRuleName.replace(/\{\w+\}/gi, "[a-zA-Z0-9]+")}$`, "ig");

            if (pattern.test(rule)) {
                method = predefinedRuleMethod;

                let splitedPreDefinedRule: string[] = predefinedRuleName.split(":");
                let splitedRule: string[] = rule.split(":");

                splitedPreDefinedRule.forEach((piece: string, index: number) => {
                    if (piece.includes("{")) {
                        piece = piece.replace("{", "").replace("}", "");

                        try {
                            params[piece] = eval(splitedRule[index]);
                        } catch (err) {
                            params[piece] = splitedRule[index];
                        }
                    }
                });

                break;
            }
        }

        if (!method) {
            throw Error(`Rule '${rule}' Not Found`);
        }

        return [method, params];
    };

    test = (condition: boolean, error_message: string): [boolean, null | string] => (condition ? [true, null] : [false, error_message]);

    required = (key: string): [boolean, string | null] => this.test(this.userValues[key], `This field is required.`);

    gt = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "number") {
            throw Error("The gt(greater than) rule does not apply to non-number data types.");
        }

        return this.test(value > params.value, `This field must be greater than ${value}.`);
    };

    gte = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "number") {
            throw Error("The gte(greater than or equal) rule does not apply to non-number data types.");
        }

        return this.test(value >= params.value, `This field must be greater than or equal to ${value}.`);
    };

    lt = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "number") {
            throw Error("The lt(less than) rule does not apply to non-number data types.");
        }

        return this.test(value < params.value, `	This field must be less than ${value}.`);
    };

    lte = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "number") {
            throw Error("The lte(less than or equal) rule does not apply to non-number data types.");
        }

        return this.test(value <= params.value, `	This field must be less than or equal to ${value}.`);
    };

    number = (key: string): [boolean, string | null] => this.test(!isNaN(this.userValues[key]), `This field must be a number.`);

    string = (key: string): [boolean, string | null] => this.test(typeof this.userValues[key] === "string", `This field must be a string.`);

    email = (key: string): [boolean, string | null] => {
        let pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;

        let value = this.userValues[key];

        if (typeof value !== "string") {
            throw Error("The Email rule does not apply to non-string data types.");
        }

        return this.test(pattern.test(value), `This field must be a valid email address.`);
    };

    min = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "string") {
            throw Error("The minimum value rule does not apply to non-string data types.");
        }

        return this.test(value.length >= params.value, `This field must be at least ${value} characters long.`);
    };

    max = (key: string, params: Params): [boolean, string | null] => {
        let value = this.userValues[key];

        if (typeof value !== "string") {
            throw Error("The maximum value rule does not apply to non-string data types.");
        }

        return this.test(value.length <= params.value, `This field must be no more than ${value} characters long.`);
    };

    uppercase = (key: string): [boolean, string | null] => {
        let value: string = this.userValues[key];

        if (typeof value !== "string") {
            throw Error("The rule for converting to uppercase does not apply to non-string values.");
        }

        return this.test(value.toUpperCase() === value, `This field must contain only uppercase letters.`);
    };

    lowercase = (key: string): [boolean, string | null] => {
        let value: string = this.userValues[key];

        if (typeof value !== "string") {
            throw Error("The rule for converting to uppercase does not apply to non-string values.");
        }

        return this.test(value.toLowerCase() === value, `This field must contain only lowercase letters.`);
    };

    confirmed = () => {
        let password = this.userValues.password;
        let password_confirmation = this.userValues.password_confirmation;

        return this.test(password === password_confirmation, "Password and Password Confirmation Does not match");
    };
}
