// helper functions
const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isEmail = (email) => {
    const emailRegEx =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
};

exports.validateSignUpData = (data) => {
    let errors = {};

    // Email Validation
    if (isEmpty(data.email)) {
        errors.email = "Must not be blank.";
    } else if (!isEmail(data.email)) {
        errors.email = "Invalid Email Address.";
    }

    // Password Validation
    if (isEmpty(data.password)) errors.password = "Must not be blank.";
    if (data.password !== data.confirmPassword)
        errors.password = "Passwords do not match.";

    // UserName Validation
    if (isEmpty(data.handle)) errors.handle = "Must not be blank.";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateLogInData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) errors.email = "Must not be empty.";
    if (isEmpty(data.password)) errors.password = "Must not be empty.";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};
