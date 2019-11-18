export const options = {
  fields: {
    email: {
      error: "Please insert a valid email"
    },
    password: {
        error: "Passwords should not be empty"
    },
    repeatPassword: {
      error: "Passwords should match"
      }
  }
};

export const resetOptions = {
  fields: {
    email: {
      label: "Please enter your email to reset your password.",
      error: "Please insert a valid email"
    }
  }
}
