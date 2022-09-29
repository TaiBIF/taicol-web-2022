// ** MUI Imports
import Grid from '@mui/material/Grid';

import type { InputTextFieldProps, InputSelectFieldProps, InputFileFieldProps } from 'src/types';
import { InputTextField, InputSelectField, InputHiddenField,InputSwitchField,InputFileField } from 'src/form/components/fields';
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("src/form/components/fields/InputCKEditorField"), {
  ssr: false,
  loading: () => <p>Loading CKEditor...</p>,
});

type Props = {
	fields:Array<InputTextFieldProps | InputSelectFieldProps>
};



const GenerateField: React.VFC<Props> = (props) => {
  const { fields } = props;

	return (
      <Grid container spacing={5}>
      {fields.map((input: InputTextFieldProps | InputSelectFieldProps, index: number) => {

        switch (input.type) {
          case 'select':
            return (
                <InputSelectField {...(input as InputSelectFieldProps)}  key={`input_${index}_${input.name}`} />
            );
            break;
          case 'hidden':
            return <InputHiddenField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} />;
            break;
          case 'editor':
            return <Editor {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} />;
            break;
          case 'switch':
            return <InputSwitchField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} />;
            break;
          case 'file':
            return <InputFileField {...(input as InputFileFieldProps)} key={`input_${index}_${input.name}`} />;
            break;
          default:
              return (
                <InputTextField {...(input as InputTextFieldProps)} key={`input_${index}_${input.name}`} />
              );
            break;
        }
      })}

    </Grid>
	);
};

export default GenerateField;
