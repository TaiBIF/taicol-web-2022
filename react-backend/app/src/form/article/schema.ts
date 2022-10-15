import * as yup from 'yup';
import errors from 'src/constants/errors';

const share = {
  CategoryId: yup.number().required(errors.NON_EMPTY).positive().integer(),
  author:yup.string().required(errors.NON_EMPTY),
  slug:yup.string().required(errors.NON_EMPTY),
  title:yup.string().required(errors.NON_EMPTY),
  description:yup.string().required(errors.NON_EMPTY),
  publish:yup.boolean().default(true),
};

export const createArticleFormSchema = yup.object().shape({
  ...share
})

export const updateArticleFormSchema = yup.object().shape({
	id: yup.number().required(errors.NON_EMPTY).positive().integer(),
	...share
});
