export const options = {
  fields: {
    email: {
      error: "Please insert a valid email", 
      autoCapitalize: "none",
      autoCorrect: false
    },
    password: {
      error: "Passwords should not be empty",
      autoCapitalize: "none",
      autoCorrect: false
    },
    repeatPassword: {
      error: "Passwords should match", 
      autoCapitalize: "none",
      autoCorrect: false
    },
    secretCode: {
      error: "Code should not be empty",
      autoCapitalize: "none",
      keyboardType: "numeric"
    }
  }
};

export const resetOptions = {
  fields: {
    email: {
      label: "Please enter your email to reset your password.",
      error: "Please insert a valid email",
      autoCapitalize: "none",
      autoCorrect: false
    }
  }
};
