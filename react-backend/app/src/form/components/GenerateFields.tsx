// ** MUI Imports
import Grid from '@mui/material/Grid';

import type { InputTextFieldProps, InputSelectFieldProps, InputFileFieldProps, InputCkeditorFieldProps } from 'src/types';
import { InputTextField, InputSelectField, InputHiddenField,InputSwitchField,InputFileField,InputDatepickerField } from 'src/form/components/fields';
import dynamic from "next/dynamic";
import { useFormContext } from 'react-hook-form';
import Editor from 'src/form/components/fields/InputSunEditorField'

type Props = {
	fields:Array<InputTextFieldProps | InputSelectFieldProps>
};
const GenerateField: React.VFC<Props> = (props) => {
  const { fields } = props;
  const {
		formState: { errors },
	} = useFormContext();


	return (
      <Grid container spacing={5}>
      {fields.map((input: InputTextFieldProps | InputSelectFieldProps, index: number) => {
        const error = errors?.[input.name]  ? true : false;
        const errorMessage =  errors?.[input.name]?.message as string || '';

        switch (input.type) {
          case 'select':
            return (
              <InputSelectField {...(input as InputSelectFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage} />
            );
            break;
          case 'hidden':
            return <InputHiddenField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
            break;
          case 'editor':
            return <Editor {...(input as InputCkeditorFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
            break;
          case 'switch':
            return <InputSwitchField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
            break;
          case 'file':
            return <InputFileField {...(input as InputFileFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
            break;
          case 'datepicker':
            return <InputDatepickerField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />;
            break;
          default:
              return (
                <InputTextField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} error={error} errorMessage={errorMessage}  />
              );
            break;
        }
      })}

    </Grid>
	);
};

export default GenerateField;
