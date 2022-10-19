type Errors = {
  [key: string]:string
};

const errors: Errors = {
	NON_EMPTY: "field can't be null",
	EMAIL_INVALID: 'Invalid email',
	PASSWORD_LENGTH_MUST_MORE_THAN_6: 'Password length must be greater than 6!',
	CONFIRM_PASSWORD_LENGTH_MUST_MORE_THAN_6: 'Confirm password length must be greater than 6!',
  PASSWORD_NOT_MATCHED: 'Password and confirm password are not the same!',
  POST_UNEXPECT: 'Failed to submit form, please contact system administrator!',
  EMAIL_EXIST:'Email is already in use!',
  DELETE_FAIL:'Failed to delete data!'
};

export default errors;
