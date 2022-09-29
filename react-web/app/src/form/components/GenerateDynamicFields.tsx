// ** MUI Imports
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import SubmitPanel from 'src/form/components/SubmitPanel';
import type { InputTextFieldProps, InputSelectFieldProps,InputFileFieldProps } from 'src/types';
import { InputTextField, InputSelectField, InputHiddenField,InputSwitchField,InputFileField } from 'src/form/components/fields';
import dynamic from "next/dynamic";
import { useFieldArray, useFormContext  } from 'react-hook-form';


const Editor = dynamic(() => import("src/form/components/fields/InputCKEditorField"), {
  ssr: false,
  loading: () => <p>Loading CKEditor...</p>,
});

type Props = {
  dynamicFields: Array<InputTextFieldProps | InputSelectFieldProps>;
  name: string;
};



const GenerateDynamicFields: React.VFC<Props> = (props) => {
  const { dynamicFields, name } = props;
	const {
    control,
    setValue,
		formState: { errors },
	} = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const handleAddItem = (e: React.MouseEvent) => {
    let item = {}

    console.log('dynamicFields',dynamicFields)
    dynamicFields.forEach((field) => {
      item = {...item,[field.name]:""}
    });

    console.log('item',item)
    //append(item)
  }

	return (
    <>
      <Grid item>
       <IconButton
        onClick={handleAddItem}
        sx={{ minHeight: 0, minWidth: 0, padding: 2 }}>
        <AddIcon />
      </IconButton>
      </Grid>

      {fields.map((item, index) => {
        return (
          <Grid container spacing={5} key={item.id} marginBottom={4}>
            {
              dynamicFields.map((input: InputTextFieldProps | InputSelectFieldProps, index: number) => {


                input.name = `${name}.${index}.${input.name}`

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
              })
          }
          </Grid>
        )
      })}
    </>
	);
};

export default GenerateDynamicFields;
