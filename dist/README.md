# EXTRAVALIDATION

### extravalidation is a validation library created using typescript and it's compatible with commonjs and ecmascript

## Installation

Installation via npm :

```typescript
npm i extravalidation
```

Installation via yarn :

```typescript
yarn add extravalidation
```

## Usage

```typescript
import { validate, Values, Rules } from "xtravalidation";

let rules: Rules = {
    firstname: ["required", "min:3", "max:50"],
    lastname: ["required", "min:3", "max:50"],
    email: ["required", "email"],
    password: ["required", "min:8", "confirmed"],
};

let values: Values = {
    firstname: "c", // less than 3
    lastname: "camado...", // greater than 50 characters
    email: "example@.com", // not a valid email
    password: "passwo", // less than 8
    password_confirmation: "password", // different than the actual password
};

let [satisfied, errors] = validate(rules, values);

/*
satisfied => false
errors => {
    firstname: [
      'The field with the key value of firstname should be greater than or equal 3.'
    ],
    email: [
      'The field with the key value of email should be a valid Email Address.'
    ],
    password: [
      'The field with the key value of password should be greater than or equal 8.'
    ]
}
*/
```

## Validation Rules

| Rule      | Description                                                                                                                                                                                   | Error message                                          |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| required  | This rule specifies that a field is required and must have a non-empty value                                                                                                                  | This field is required                                 |
| min       | This rule specifies a minimum length of characters for a field. For example, if the rule is min:5, then the field must have a length of at least 5 characters .                               | This field must be at least [min] characters long.     |
| max       | This rule specifies a maximum length of characters for a field. For example, if the rule is max:10, then the field must have a length of at most 10 characters .                              | This field must be no more than [max] characters long. |
| gt        | This rule specifies that a field must have a value greater than a certain number. For example, if the rule is gt:5, then the field must have a value greater than 5                           | This field must be greater than [gt].                  |
| lt        | This rule specifies that a field must have a value less than a certain number. For example, if the rule is lt:5, then the field must have a value less than 5.                                | This field must be less than [lt].                     |
| lte       | This rule specifies that a field must have a value less than or equal to a certain number. For example, if the rule is lte:5, then the field must have a value less than or equal to 5.       | This field must be less than or equal to [lte].        |
| gte       | This rule specifies that a field must have a value greater than or equal to a certain number. For example, if the rule is gte:5, then the field must have a value greater than or equal to 5. | This field must be greater than or equal to [gte].     |
| number    | This rule specifies that a field must contain a valid number.                                                                                                                                 | This field must be a number.                           |
| string    | This rule specifies that a field must contain a string.                                                                                                                                       | This field must be a string.                           |
| email     | his rule specifies that a field must contain a valid email address.                                                                                                                           | This field must be a valid email address.              |
| uppercase | This rule specifies that a field must contain only uppercase characters.                                                                                                                      | This field must contain only uppercase letters.        |
| lowercase | This rule specifies that a field must contain only lowercase characters.                                                                                                                      | This field must contain only lowercase letters.        |
| confirmed | This rule specifies that a field must contain the same value as "password_confirmation".                                                                                                      | password and password confirmation does not match      |
